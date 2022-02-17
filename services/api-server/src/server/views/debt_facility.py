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
from bespoke.db.db_constants import (DBOperation)
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

handler.add_url_rule(
	"/update_capacity",
	view_func=DebtFacilityUpdateCapacityView.as_view(name='update_capacity'))

handler.add_url_rule(
	"/create_update_facility",
	view_func=DebtFacilityCreateUpdateFacilityView.as_view(name='create_update_facility'))
