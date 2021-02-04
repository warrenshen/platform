import datetime
import json

from mypy_extensions import TypedDict
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from typing import cast, Any

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import repayment_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from bespoke.finance.fetchers import per_customer_fetcher
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('finance_loans_repayments', __name__)

class CalculateEffectOfPaymentView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['payment', 'company_id', 'loan_ids']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from calculate effect of payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		payment = form['payment']
		if payment.get('amount') and type(payment['amount']) != float and type(payment['amount']) != int:
			return handler_util.make_error_response('Amount must be a number')

		if not payment.get('deposit_date'):
			return handler_util.make_error_response('Deposit date must be specified')

		loan_ids = form['loan_ids']

		# NOTE: Fetching information is likely a slow task, so we probably want to
		# turn this into an async operation.
		effect_resp, err = repayment_util.calculate_repayment_effect(
			payment, form['company_id'], loan_ids, current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		effect_resp['status'] = 'OK'
		return make_response(json.dumps(effect_resp))

class HandlePaymentView(MethodView):
	decorators = [auth_util.login_required]

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

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		payment = form['payment']
		company_id = form['company_id']
		payment_id = None

		with session_scope(current_app.session_maker) as session:			
			payment_input = payment_util.PaymentInputDict(
				type=db_constants.PaymentType.REPAYMENT,
				amount=payment['amount'],
				payment_method=payment['method']
			)
			payment = payment_util.create_payment(company_id, payment_input)
			session.add(payment)
			session.flush()
			payment_id = payment.id

		return make_response(json.dumps({
			'status': 'OK',
			'payment_id': payment_id
		}), 200)

handler.add_url_rule(
	'/handle_payment', view_func=HandlePaymentView.as_view(name='handle_repayment_view'))

handler.add_url_rule(
	'/calculate_effect_of_payment', view_func=CalculateEffectOfPaymentView.as_view(name='calculate_effect_of_repayment_view'))
