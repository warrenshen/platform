import json
from typing import Any, cast

from bespoke.companies import licenses_util
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('licenses', __name__)

class AddLicensesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:

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
			'us_state',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = licenses_util.create_update_license(
				session=session,
				company_license_input=cast(
					licenses_util.CompanyLicenseInputDict,
					form,
				),
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
			company_license_ids, existing_license_numbers, err = licenses_util.create_update_licenses(
				company_id=form['company_id'],
				company_license_inputs=form['company_licenses'],
				session=session
			)
			if err:
				raise err
			if len(existing_license_numbers) > 0:
				session.rollback()
				return make_response(json.dumps({
					'status': 409,
					'data': existing_license_numbers,
					'msg': 'license(s) already exist'
				}))

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DeleteLicenseView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'license_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = licenses_util.delete_license(
				license_id=form['license_id'],
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
