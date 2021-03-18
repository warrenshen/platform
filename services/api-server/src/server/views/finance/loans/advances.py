import datetime
import json
from typing import Any, cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import advance_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_advances', __name__)

class HandleAdvanceView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['payment', 'loan_ids', 'should_charge_wire_fee']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle advance request'.format(key))

		user_session = auth_util.UserSession.from_session()

		resp, err = advance_util.fund_loans_with_advance(
			req=form,
			bank_admin_user_id=user_session.get_user_id(),
			session_maker=current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/handle_advance', view_func=HandleAdvanceView.as_view(name='handle_advance_view'))
