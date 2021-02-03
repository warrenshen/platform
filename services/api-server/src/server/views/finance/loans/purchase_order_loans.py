import datetime
import json

from mypy_extensions import TypedDict
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from typing import cast, Any

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from sqlalchemy.orm.session import Session
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('finance_loans_purchase_order_loans', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


PaymentInputDict = TypedDict('PaymentInputDict', {
	'type': str,
	'amount': float,
	'payment_method': str
})

def _add_payment(
	company_id: str,
	payment_input: PaymentInputDict,
	session: Session) -> None:

	# TODO(dlluncor): Lots of validations needed before being able to submit a payment

	payment = models.Payment()
	payment.amount = payment_input['amount']
	payment.type = payment_input['type']
	payment.company_id = company_id
	payment.method = payment_input['payment_method']
	payment.submitted_at = datetime.datetime.now()

	session.add(payment)

PaymentInsertInputDict = TypedDict('PaymentInsertInputDict', {
	'company_id': str,
	'type': str,
	'amount': float,
	'method': str,
	'deposit_date': str
})

class CalculateEffectOfPaymentView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['payment']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from calculate effect of payment request'.format(key))

		tx = form['payment']
		if type(tx['amount']) != float and type(tx['amount']) != int:
			return make_error_response('Amount must be a number')

		return make_error_response('Not implemented')

class HandlePaymentView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['payment', 'company_id']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return make_error_response('Access Denied')

		payment = form['payment']
		company_id = form['company_id']

		with session_scope(current_app.session_maker) as session:			
			payment_input = PaymentInputDict(
				type=db_constants.PaymentType.REPAYMENT,
				amount=payment['amount'],
				payment_method=payment['method']
			)
			_add_payment(company_id, payment_input, session)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class HandleDisbursementView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['payment', 'company_id']

		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return make_error_response('Access Denied')

		payment = form['payment']
		company_id = form['company_id']

		with session_scope(current_app.session_maker) as session:
			payment_input = PaymentInputDict(
				type=db_constants.PaymentType.ADVANCE,
				amount=payment['amount'],
				payment_method=payment['method']
			)
			_add_payment(company_id, payment_input, session)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class ApproveLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['loan_id']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		purchase_order_loan_id = form['loan_id']

		with session_scope(current_app.session_maker) as session:
			purchase_order_loan = cast(
				models.PurchaseOrderLoan,
				session.query(models.PurchaseOrderLoan).filter_by(
					id=purchase_order_loan_id).first()
			)
			loan = purchase_order_loan.loan
			company_id = loan.company_id
			# TODO(dlluncor):
			# purchase_order_loan.loan.approved_at = datetime.datetime.now()

		return make_error_response('Not implemented')


handler.add_url_rule(
	'/handle_payment', view_func=HandlePaymentView.as_view(name='handle_payment_view'))

handler.add_url_rule(
	'/calculate_effect_of_payment', view_func=CalculateEffectOfPaymentView.as_view(name='calculate_effect_of_payment_view'))

handler.add_url_rule(
	'/handle_disbursement', view_func=HandleDisbursementView.as_view(name='handle_disbursement_view'))

handler.add_url_rule(
	'/approve_loan', view_func=ApproveLoanView.as_view(name='approve_loan_view'))
