import json
from datetime import timedelta
from typing import Any, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import licenses_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from dateutil import parser
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('licenses', __name__)

class AddLicensesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id', 'file_ids'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			license_ids, err = licenses_util.add_licenses(
				company_id=form['company_id'],
				file_ids=form['file_ids'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'license_ids': license_ids
		}), 200)

class CreateUpdateLicenseView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'id',
			'company_id',
			'license_number',
			'facility_row_id',
			'is_underwriting_enabled',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			company_license_id, err = licenses_util.create_update_license(
				company_license_input=cast(
					licenses_util.CompanyLicenseInputDict,
					form,
				),
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class CreateUpdateLicensesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'company_licenses'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			company_license_ids, err = licenses_util.create_update_licenses(
				company_id=form['company_id'],
				company_license_inputs=form['company_licenses'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DeleteLicenseView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id', 'file_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			success, err = licenses_util.delete_license(
				company_id=form['company_id'],
				file_id=form['file_id'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/create_update_license', view_func=CreateUpdateLicenseView.as_view(name='create_update_license_view'))

handler.add_url_rule(
	'/create_update_licenses', view_func=CreateUpdateLicensesView.as_view(name='create_update_licenses_view'))

handler.add_url_rule(
	'/delete_license', view_func=DeleteLicenseView.as_view(name='delete_license_view'))
