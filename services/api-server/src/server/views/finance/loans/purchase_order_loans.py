import datetime
import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from typing import cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('finance_loans_purchase_order_loans', __name__)


def make_error_response(msg: str) -> Response:
    return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


class HandlePaymentView(MethodView):
    decorators = [jwt_required]

    @handler_util.catch_bad_json_request
    def post(self) -> Response:
        form = json.loads(request.data)
        if not form:
            return make_error_response('No data provided')

        required_keys = ['loan_id', 'amount', 'payment_method']
        for key in required_keys:
            if key not in form:
                return make_error_response(
                    'Missing key {} from handle payment request'.format(key))

        purchase_order_loan_id = form['loan_id']
        amount = form['amount']
        payment_method = form['payment_method']

        with session_scope(current_app.session_maker) as session:
            purchase_order_loan = cast(
                models.PurchaseOrderLoan,
                session.query(models.PurchaseOrderLoan).filter_by(
                    id=purchase_order_loan_id).first()
            )
            print(purchase_order_loan.purchase_order_id)
            loan = purchase_order_loan.loan
            company_id = loan.company_id

            # TODO(dlluncor): Lots of validations needed before being able to submit a payment

            transaction = models.Transaction()
            transaction.amount = amount
            transaction.type = db_constants.TransactionType.REPAYMENT
            transaction.company_id = company_id
            transaction.method = payment_method
            transaction.submitted_at = datetime.datetime.now()

            session.add(transaction)

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

        required_keys = ['loan_id', 'amount', 'payment_method']
        for key in required_keys:
            if key not in form:
                return make_error_response(
                    'Missing key {} from handle payment request'.format(key))

        return make_error_response('Not implemented')


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
