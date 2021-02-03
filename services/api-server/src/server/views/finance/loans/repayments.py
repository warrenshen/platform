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

		required_keys = ['payment']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from calculate effect of payment request'.format(key))

		tx = form['payment']
		if type(tx['amount']) != float and type(tx['amount']) != int:
			return handler_util.make_error_response('Amount must be a number')

		return handler_util.make_error_response('Not implemented')

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

		with session_scope(current_app.session_maker) as session:			
			payment_input = payment_util.PaymentInputDict(
				type=db_constants.PaymentType.REPAYMENT,
				amount=payment['amount'],
				payment_method=payment['method']
			)
			payment_util.add_payment(company_id, payment_input, session)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/handle_payment', view_func=HandlePaymentView.as_view(name='handle_repayment_view'))

handler.add_url_rule(
	'/calculate_effect_of_payment', view_func=CalculateEffectOfPaymentView.as_view(name='calculate_effect_of_repayment_view'))
