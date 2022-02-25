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
from bespoke.db.db_constants import (CompanyDebtFacilityStatus, DBOperation, ProductType, DebtFacilityEventCategory)
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

class DebtFacilityUpdateCapacityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Updating debt facility capacity")
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		variables = form.get("variables", None)

		new_capacity = variables.get("newCapacity", None) if variables else None
		if new_capacity is None:
			return handler_util.make_error_response('Invalid capacity provided')
		facility_id = variables.get("debtFacilityId", None) if variables else None
		if facility_id is None or facility_id == "":
			return handler_util.make_error_response('Invalid debt facility id provided')

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			capacity = models.DebtFacilityCapacity( # type:ignore
				amount = new_capacity,
				changed_at = date_util.now(),
				changed_by = user.first_name + " " + user.last_name,
				debt_facility_id = facility_id
			)

			session.add(capacity)

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully updated debt facility capacity."}))

class DebtFacilityCreateUpdateFacilityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Updating debt facility capacity")
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

		with models.session_scope(current_app.session_maker) as session:
			if is_update:
				existing_facility = cast(
					models.DebtFacility,
					session.query(models.DebtFacility).filter(
						models.DebtFacility.id == facility_id
					).first())

				if existing_facility is None:
					return handler_util.make_error_response('Cannot find debt facility with requested id to update')

				existing_facility.name = facility_name
			else:
				facility = models.DebtFacility(
					name = facility_name
				)

				session.add(facility)

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

handler.add_url_rule(
	"/update_capacity",
	view_func=DebtFacilityUpdateCapacityView.as_view(name='update_capacity'))

handler.add_url_rule(
	"/create_update_facility",
	view_func=DebtFacilityCreateUpdateFacilityView.as_view(name='create_update_facility'))

handler.add_url_rule(
	"/update_company_status",
	view_func=DebtFacilityUpdateCompanyStatusView.as_view(name='update_company_status'))
