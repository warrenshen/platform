import json
from typing import cast

from bespoke.companies import create_company_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('companies', __name__)

class CreateCompanyView(MethodView):
	decorators = [auth_util.bank_admin_required]

	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['company', 'settings', 'contract']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to create company')

		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		resp, err = create_company_util.create_company(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/create_company', view_func=CreateCompanyView.as_view(name='create_company_view'))
