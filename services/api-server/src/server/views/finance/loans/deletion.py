import json
from typing import Any, Dict, cast

from bespoke.audit import events
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.loans import delete_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_deletion', __name__)

class DeleteLoanView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_DELETE_LOAN)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'loan_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from delete loan request'.format(key))

		loan_id = form['loan_id']

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id
				).first())

			if not user_session.is_bank_or_this_company_admin(str(loan.company_id)):
				return handler_util.make_error_response('Access Denied')

		val, err = delete_util.delete_loan(
			cast(delete_util.DeleteLoanReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/delete_loan', view_func=DeleteLoanView.as_view(name='delete_loan_view'))
