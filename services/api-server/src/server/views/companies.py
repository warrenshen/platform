import json
from typing import cast, Any

from bespoke.companies import create_customer_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.audit import events
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('companies', __name__)

class CreateCustomerView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CUSTOMER_CREATE)
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		required_keys = ['company', 'settings', 'contract']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to create company')

		resp, err = create_customer_util.create_customer(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/create_customer', view_func=CreateCustomerView.as_view(name='create_customer_views'))
