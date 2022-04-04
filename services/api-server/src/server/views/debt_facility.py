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
		variables = form.get("variables", None)

		is_update = variables.get("isUpdate", None) if variables else None
		if is_update is None:
			return handler_util.make_error_response('isUpdate is required to be set for this request')

		facility_name = variables.get("name", None) if variables else None
		if facility_name is None:
			return handler_util.make_error_response('name is required to be set for this request')

		facility_id = variables.get("id", None) if variables else None
		if facility_id is None:
			return handler_util.make_error_response('id is required to be set for this request')

		supported = variables.get("supported", None) if variables else None
		if supported is None:
			return handler_util.make_error_response('supported product types are required to be set for this request')

		new_maximum_capacity = variables.get("newMaximumCapacity", None) if variables else None
		if new_maximum_capacity is None:
			return handler_util.make_error_response('maximum capacity is required to be set for this request')

		new_drawn_capacity = variables.get("newDrawnCapacity", None) if variables else None
		if new_drawn_capacity is None:
			return handler_util.make_error_response('drawn capacity required to be set for this request')

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
		variables = form.get("variables", None)

		company_id = variables.get("companyId", None) if variables else None
		if company_id is None:
			return handler_util.make_error_response('companyId is required to be set for this request')

		new_debt_facility_status = variables.get("debtFacilityStatus", None) if variables else None
		if new_debt_facility_status is None:
			return handler_util.make_error_response('debtFacilityStatus is required to be set for this request')

		status_change_comment = variables.get("statusChangeComment", None) if variables else None
		if status_change_comment is None:
			return handler_util.make_error_response('statusChangeComment is required to be set for this request')

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())

			contract = cast(
				models.Contract,
				session.query(models.Contract).filter(
					models.Contract.company_id == company_id
				).order_by(
					models.Contract.start_date.desc()
				).first())

			if contract.product_type == ProductType.DISPENSARY_FINANCING and \
				new_debt_facility_status == CompanyDebtFacilityStatus.GOOD_STANDING:
				return handler_util.make_error_response('Cannot set dispensary finacing clients to good standing as \
					they are ineligible for debt facility financing')

			# Grab old debt facility status to record in debt facility event before setting new status
			old_debt_facility_status = company.debt_facility_status
			company.debt_facility_status = new_debt_facility_status

			payload : Dict[str, object] = {
				"user_name": user.first_name + " " + user.last_name,
				"user_id": str(user.id),
				"old_status": old_debt_facility_status,
				"new_status": new_debt_facility_status 
			}
			session.add(models.DebtFacilityEvent( # type: ignore
				company_id = str(company.id), 
				event_category = DebtFacilityEventCategory.COMPANY_STATUS_CHANGE,
				event_date = date_util.now(),
				event_comments = status_change_comment,
				event_payload = payload
			))

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated company's debt facility status."}))

class DebtFacilityMoveLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Moving loans between bespoke's books and a debt facility")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		variables = form.get("variables", None)

		loan_ids = variables.get("loanIds", None) if variables else None
		if loan_ids is None:
			return handler_util.make_error_response('loanIds is required to be set for this request')

		facility_id = variables.get("facilityId", None) if variables else None
		if facility_id is None:
			return handler_util.make_error_response('facilityId is required to be set for this request')

		is_moving_to_facility = variables.get("isMovingToFacility", None) if variables else None
		if is_moving_to_facility is None:
			return handler_util.make_error_response('isMovingToFacility is required to be set for this request')

		move_comments = variables.get("moveComments", None) if variables else None
		if move_comments is None:
			return handler_util.make_error_response('moveComments is required to be set for this request')

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
		variables = form.get("variables", None)

		loan_id = variables.get("loanId", None) if variables else None
		if loan_id is None:
			return handler_util.make_error_response('loanId is required to be set for this request')

		facility_id = variables.get("facilityId", None) if variables else None
		if facility_id is None:
			return handler_util.make_error_response('facilityId is required to be set for this request')

		resolve_note = variables.get("resolveNote", None) if variables else None
		if resolve_note is None:
			return handler_util.make_error_response('resolveNote is required to be set for this request')

		resolve_status = variables.get("resolveStatus", None) if variables else None
		if resolve_status is None:
			return handler_util.make_error_response('resolveStatus is required to be set for this request')

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
			if resolve_status == resolve_status == LoanDebtFacilityStatus.REPURCHASED:
				loan_report.debt_facility_id = None

			resolve_update_payload : Dict[str, object] = {
				"user_name": user.first_name + " " + user.last_name,
				"user_id": str(user.id),
				"old_status": LoanDebtFacilityStatus.UPDATE_REQUIRED,
				"new_status": cast(LoanDebtFacilityStatus, resolve_status)
			}
			session.add(models.DebtFacilityEvent( # type: ignore
				loan_report_id = loan_report.id,
				event_category = DebtFacilityEventCategory.REPURCHASE if resolve_status == LoanDebtFacilityStatus.REPURCHASED \
					else DebtFacilityEventCategory.WAIVER,
				event_date = date_util.now(),
				event_comments = resolve_note,
				event_amount = loan.outstanding_principal_balance,
				event_payload = resolve_update_payload
			))

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully moved loan."}))

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
