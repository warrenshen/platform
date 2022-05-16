import json
from typing import Any, cast

from bespoke.companies import company_facilities_util
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('company_facilities', __name__)


class CreateUpdateCompanyFacilityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = cast(
			company_facilities_util.CompanyFacilityInputDict,
			form,
		).keys()

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			company_facility_id, err = company_facilities_util.create_update_company_facility(
				company_facility_input=cast(
					company_facilities_util.CompanyFacilityInputDict,
					form,
				),
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class DeleteCompanyFacilityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_facility_id',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			success, err = company_facilities_util.delete_company_facility(
				company_facility_id=form['company_facility_id'],
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


handler.add_url_rule(
	'/create_update_company_facility', view_func=CreateUpdateCompanyFacilityView.as_view(name='create_update_company_facility_view'))

handler.add_url_rule(
	'/delete_company_facility', view_func=DeleteCompanyFacilityView.as_view(name='delete_company_facility_view'))
