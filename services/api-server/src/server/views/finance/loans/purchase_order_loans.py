import datetime
import json

from mypy_extensions import TypedDict
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from typing import cast, Any

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from sqlalchemy.orm.session import Session
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('finance_loans_purchase_order_loans', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


TransactionInputDict = TypedDict('TransactionInputDict', {
	'type': str,
	'amount': float,
	'payment_method': str
})

def _add_transaction(
	tx_input: TransactionInputDict, 
	purchase_order_loan: models.PurchaseOrderLoan,
	session: Session) -> None:

	loan = purchase_order_loan.loan
	company_id = loan.company_id

	# TODO(dlluncor): Lots of validations needed before being able to submit a payment

	transaction = models.Transaction()
	transaction.amount = tx_input['amount']
	transaction.type = tx_input['type']
	transaction.company_id = company_id
	transaction.method = tx_input['payment_method']
	transaction.submitted_at = datetime.datetime.now()

	session.add(transaction)
	session.flush()

	po_tx = models.PurchaseOrderLoanTransaction()
	po_tx.purchase_order_loan_id = purchase_order_loan.id
	po_tx.transaction_id = transaction.id

	session.add(po_tx)

class HandlePaymentView(MethodView):
	decorators = [jwt_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['purchase_order_loan_id', 'amount', 'payment_method']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		purchase_order_loan_id = form['purchase_order_loan_id']
		amount = form['amount']
		payment_method = form['payment_method']

		with session_scope(current_app.session_maker) as session:
			purchase_order_loan = cast(
				models.PurchaseOrderLoan,
				session.query(models.PurchaseOrderLoan).filter_by(
					id=purchase_order_loan_id).first()
			)
			if not purchase_order_loan:
				return make_error_response('Purchase order loan no longer exists')
			
			tx_input = TransactionInputDict(
				type=db_constants.TransactionType.REPAYMENT,
				amount=amount,
				payment_method=payment_method
			)
			_add_transaction(tx_input, purchase_order_loan, session)

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

		required_keys = ['purchase_order_loan_id', 'amount', 'payment_method']
		for key in required_keys:
			if key not in form:
				return make_error_response(
					'Missing key {} from handle payment request'.format(key))

		purchase_order_loan_id = form['purchase_order_loan_id']
		amount = form['amount']
		payment_method = form['payment_method']

		with session_scope(current_app.session_maker) as session:
			purchase_order_loan = cast(
				models.PurchaseOrderLoan,
				session.query(models.PurchaseOrderLoan).filter_by(
					id=purchase_order_loan_id).first()
			)
			if not purchase_order_loan:
				return make_error_response('Purchase order loan no longer exists')
			
			tx_input = TransactionInputDict(
				type=db_constants.TransactionType.ADVANCE,
				amount=amount,
				payment_method=payment_method
			)
			_add_transaction(tx_input, purchase_order_loan, session)

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
	'/handle_disbursement', view_func=HandleDisbursementView.as_view(name='handle_disbursement_view'))

handler.add_url_rule(
	'/approve_loan', view_func=ApproveLoanView.as_view(name='approve_loan_view'))
