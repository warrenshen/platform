import datetime
import json

from mypy_extensions import TypedDict
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from typing import cast, Any

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import payment_util
from sqlalchemy.orm.session import Session
from server.views.common import handler_util
from server.views.common import auth_util


handler = Blueprint('finance_loans_advances', __name__)

class HandleAdvanceView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['payment', 'company_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle payment request'.format(key))

		payment = form['payment']
		company_id = form['company_id']

		payment_dict: models.PaymentDict = None

		with session_scope(current_app.session_maker) as session:
			payment_input = payment_util.PaymentInputDict(
				type=db_constants.PaymentType.ADVANCE,
				amount=payment['amount'],
				payment_method=payment['method']
			)
			payment_dict = payment_util.add_payment(company_id, payment_input, session)

		return make_response(json.dumps({
			'payment_id': payment_dict['id'],
			'status': 'OK'
		}), 200)

class CreateTransactionsFromAdvanceView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loan_ids', 'payment_id', 'company_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from create transactions from advance request'.format(key))

		user_session = auth_util.UserSession.from_session()
		loan_ids = form['loan_ids']
		payment_id = form['payment_id']
		company_id = form['company_id']

		resp, err = payment_util.fund_loans_with_advance(
			bank_admin_user_id=user_session.get_user_id(),
			company_id=company_id, loan_ids=loan_ids, payment_id=payment_id,
			session_maker=current_app.session_maker)
		
		if err:
			return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)


handler.add_url_rule(
	'/handle_advance', view_func=HandleAdvanceView.as_view(name='handle_advance_view'))

handler.add_url_rule(
	'/create_transactions_from_advance', view_func=CreateTransactionsFromAdvanceView.as_view(name='create_transactions_from_advance_view'))
