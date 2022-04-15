import base64
import datetime
import json
import logging
import math
import os
import time
import typing
from decimal import *
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import (CompanyDebtFacilityStatus, DebtFacilityEventCategory, 
	DBOperation, LoanDebtFacilityStatus, ProductType, DebtFacilityCapacityTypeEnum)
from bespoke.db.models import session_scope
from bespoke.debt_facility import debt_facility_util
from bespoke.email import sendgrid_util
from bespoke.metrc.common.metrc_common_util import chunker, chunker_dict
from bespoke.reports.report_generation_util import *
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sendgrid.helpers.mail import (Attachment, Disposition, FileContent,
                                   FileName, FileType)
from server.config import Config, get_config
from server.views.common import auth_util, handler_util
from sqlalchemy import func, or_
from sqlalchemy.orm.session import Session

handler = Blueprint('debt_facility', __name__)
config = get_config()

class DebtFacilityCreateUpdateFacilityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Updating debt facility")
		form = json.loads(request.data) 
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['isUpdate', 'name', 'id', "supported", "newMaximumCapacity", "newDrawnCapacity"]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to creating/updating debt facility')

		is_update = form["isUpdate"]
		facility_name = form["name"]
		facility_id = form["id"]
		supported = form["supported"]
		new_maximum_capacity = form["newMaximumCapacity"]
		new_drawn_capacity = form["newDrawnCapacity"]

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			if is_update:
				facility = cast(
					models.DebtFacility,
					session.query(models.DebtFacility).filter(
						models.DebtFacility.id == facility_id
					).first())

				if facility is None:
					return handler_util.make_error_response('Cannot find debt facility with requested id to update')

				facility.name = facility_name if facility_name != "" else facility.name
				facility.product_types = {
					"supported": supported
				}
			else:
				facility = models.DebtFacility(
					name = facility_name,
					product_types = {
						"supported": supported
					},
				)

				session.add(facility)
				session.flush()

			# Adjust maximum capacity, if set in form and different from current capacity
			current_maximum_capacity = cast(
				models.DebtFacilityCapacity,
				session.query(models.DebtFacilityCapacity).filter(
					models.DebtFacilityCapacity.debt_facility_id == facility.id
				).filter(
					models.DebtFacilityCapacity.capacity_type == DebtFacilityCapacityTypeEnum.MAXIMUM
				).order_by(
					models.DebtFacilityCapacity.changed_at.desc()
				).first())

			if new_maximum_capacity != current_maximum_capacity and new_maximum_capacity != 0:
				max_capacity = models.DebtFacilityCapacity( # type:ignore
					amount = new_maximum_capacity,
					capacity_type = DebtFacilityCapacityTypeEnum.MAXIMUM,
					changed_at = date_util.now(),
					changed_by = user.id,
					debt_facility_id = facility.id
				)

				session.add(max_capacity)

			# Adjust drawn capacity, if set in form and different from current capacity
			current_drawn_capacity = cast(
				models.DebtFacilityCapacity,
				session.query(models.DebtFacilityCapacity).filter(
					models.DebtFacilityCapacity.debt_facility_id == facility.id
				).filter(
					models.DebtFacilityCapacity.capacity_type == DebtFacilityCapacityTypeEnum.DRAWN
				).order_by(
					models.DebtFacilityCapacity.changed_at.desc()
				).first())

			if new_drawn_capacity != current_drawn_capacity and new_drawn_capacity != 0:
				drawn_capacity = models.DebtFacilityCapacity( # type:ignore
					amount = new_drawn_capacity,
					capacity_type = DebtFacilityCapacityTypeEnum.DRAWN,
					changed_at = date_util.now(),
					changed_by = user.id,
					debt_facility_id = facility.id
				)

				session.add(drawn_capacity)

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated debt facility capacity."}))

class DebtFacilityUpdateCompanyStatusView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Updating debt facility capacity")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['companyId', 'debtFacilityStatus', 'statusChangeComment', 'waiverDate', 'waiverExpirationDate']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to updating company debt facility status')

		company_id = form["companyId"]
		new_debt_facility_status = form["debtFacilityStatus"]
		status_change_comment = form["statusChangeComment"]
		waiver_date = form["waiverDate"]
		waiver_expiration_date = form["waiverExpirationDate"]

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			_, err = debt_facility_util.update_company_debt_facility_status(
				session,
				user,
				company_id,
				new_debt_facility_status,
				status_change_comment,
				waiver_date,
				waiver_expiration_date
			)

			if err:
				raise err


		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated company's debt facility status."}))

class DebtFacilityMoveLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Moving loans between bespoke's books and a debt facility")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loanIds', 'facilityId', 'isMovingToFacility', 'moveComments', 'moveDate']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to debt facility loan move')

		loan_ids = form["loanIds"]
		facility_id = form["facilityId"]
		is_moving_to_facility = form["isMovingToFacility"]
		move_comments = form["moveComments"]
		move_date = form["moveDate"]
		move_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE) if move_date == "" else move_date

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			# Regardless of the to and from, we will need to gather the 
			# relevant loans and loan reports
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
			).all())

			loan_report_ids = []
			for loan in loans:
				loan_report_ids.append(loan.loan_report_id)

			loan_reports = cast(
				List[models.LoanReport],
				session.query(models.LoanReport).filter(
					models.LoanReport.id.in_(loan_report_ids)
			).all())

			report_to_loan_lookup : Dict[str, models.Loan] = {}
			for loan_report in loan_reports:
				for loan in loans:
					if loan.loan_report_id == loan_report.id:
						report_to_loan_lookup[loan_report.id] = loan

			if is_moving_to_facility:
				debt_facility = cast(
					models.DebtFacility,
					session.query(models.DebtFacility).filter(
						models.DebtFacility.id == facility_id
				).first())

				for loan_report in loan_reports:
					loan_report.debt_facility_id = facility_id
					old_debt_facility_status = loan_report.debt_facility_status
					loan_report.debt_facility_status = LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY
					loan_report.debt_facility_added_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
					loan_report.debt_facility_added_date = move_date

					to_facility_payload : Dict[str, object] = {
						"user_name": user.first_name + " " + user.last_name,
						"user_id": str(user.id),
						"old_status": old_debt_facility_status,
						"new_status": LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
						"debt_facility": debt_facility.name
					}
					session.add(models.DebtFacilityEvent( # type: ignore
						loan_report_id = loan_report.id,
						event_category = DebtFacilityEventCategory.MOVE_TO_DEBT_FACILITY,
						event_date = date_util.now(),
						event_comments = move_comments,
						event_amount = report_to_loan_lookup[loan_report.id].outstanding_principal_balance,
						event_payload = to_facility_payload
					))
			else:
				for loan_report in loan_reports:
					loan_report.debt_facility_id = None
					old_debt_facility_status = loan_report.debt_facility_status
					loan_report.debt_facility_status = LoanDebtFacilityStatus.REPURCHASED

					from_facility_payload : Dict[str, object] = {
						"user_name": user.first_name + " " + user.last_name,
						"user_id": str(user.id),
						"old_status": old_debt_facility_status,
						"new_status": LoanDebtFacilityStatus.REPURCHASED
					}
					session.add(models.DebtFacilityEvent( # type: ignore
						loan_report_id = loan_report.id,
						event_category = DebtFacilityEventCategory.REPURCHASE,
						event_date = date_util.now(),
						event_comments = move_comments,
						event_amount = report_to_loan_lookup[loan_report.id].outstanding_principal_balance,
						event_payload = from_facility_payload 
					))

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully moved loan."}))

class DebtFacilityResolveUpdateRequiredView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Resolve loan with a debt facility status of update required")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loanId', 'resolveNote', 'resolveStatus', 'waiverDate', 'waiverExpirationDate']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to debt facility resolution')

		loan_id = form["loanId"]
		resolve_note = form["resolveNote"]
		resolve_status = form["resolveStatus"]
		waiver_date = form["waiverDate"]
		waiver_expiration_date = form["waiverExpirationDate"]

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			loan = cast(
				models.Loan,
				session.query(models.Loan).filter(
					models.Loan.id == loan_id
			).first())

			loan_report = cast(
				models.LoanReport,
				session.query(models.LoanReport).filter(
					models.LoanReport.id == loan.loan_report_id
			).first())

			loan_report.debt_facility_status = resolve_status
			if resolve_status == LoanDebtFacilityStatus.REPURCHASED:
				loan_report.debt_facility_id = None

			if resolve_status == LoanDebtFacilityStatus.WAIVER:
				if waiver_date is not None and waiver_date != "":
					loan_report.debt_facility_waiver_date = waiver_date
				if waiver_expiration_date is not None and waiver_expiration_date != "":
					loan_report.debt_facility_waiver_expiration_date = waiver_expiration_date

			resolve_update_payload : Dict[str, object] = {
				"user_name": user.first_name + " " + user.last_name,
				"user_id": str(user.id),
				"old_status": LoanDebtFacilityStatus.UPDATE_REQUIRED,
				"new_status": cast(LoanDebtFacilityStatus, resolve_status)
			}
			if resolve_status == LoanDebtFacilityStatus.WAIVER:
				resolve_update_payload["waiver_date"] = waiver_date
				resolve_update_payload["waiver_expiration_date"] = waiver_expiration_date

			session.add(models.DebtFacilityEvent( # type: ignore
				loan_report_id = loan_report.id,
				event_category = DebtFacilityEventCategory.REPURCHASE if resolve_status == LoanDebtFacilityStatus.REPURCHASED \
					else DebtFacilityEventCategory.WAIVER,
				event_date = date_util.now(),
				event_comments = resolve_note,
				event_amount = loan.outstanding_principal_balance,
				event_payload = resolve_update_payload
			))

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated loan debt facility status."}))

class DebtFacilityUpdateAssignedDateView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Updating the date a loan was assigned into a debt facility")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loanIds', 'newAssignedDate']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to update debt facility assigned date')

		loan_ids = form["loanIds"]
		new_assigned_date = form["newAssignedDate"]

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
			).all())

			loan_report_ids = [loan.loan_report_id for loan in loans]

			loan_reports = cast(
				List[models.LoanReport],
				session.query(models.LoanReport).filter(
					models.LoanReport.id.in_(loan_report_ids)
			).all())

			for loan_report in loan_reports:
				loan_report.debt_facility_added_date = new_assigned_date

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated loan(s) assigned date."}))

class CheckForPastDueLoansInDebtFacilityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Checking for loans 30+ days past due in debt facility")

		with models.session_scope(current_app.session_maker) as session:
			today_date: datetime.date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
			debt_facility_util.check_past_due_loans(session, today_date)

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully checked for loans 30+ days past due in debt facility"}))

handler.add_url_rule(
	"/create_update_facility",
	view_func=DebtFacilityCreateUpdateFacilityView.as_view(name='create_update_facility'))

handler.add_url_rule(
	"/update_company_status",
	view_func=DebtFacilityUpdateCompanyStatusView.as_view(name='update_company_status'))

handler.add_url_rule(
	"/move_loans",
	view_func=DebtFacilityMoveLoanView.as_view(name='move_loans'))

handler.add_url_rule(
	"/resolve_update_required",
	view_func=DebtFacilityResolveUpdateRequiredView.as_view(name='resolve_update_required'))

handler.add_url_rule(
	"/check_for_past_due_loans_in_debt_facility",
	view_func=CheckForPastDueLoansInDebtFacilityView.as_view(name='check_for_past_due_loans_in_debt_facility'))

handler.add_url_rule(
	"/update_assigned_date",
	view_func=DebtFacilityUpdateAssignedDateView.as_view(name='update_assigned_date'))
