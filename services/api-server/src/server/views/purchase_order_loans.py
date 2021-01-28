import json
from typing import List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.enums.request_status_enum import RequestStatusEnum
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required

handler = Blueprint('purchase_order_loans', __name__)


def make_error_response(msg: str) -> Response:
    return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


class SubmitForApprovalView(MethodView):

    @jwt_required
    def post(self) -> Response:

        data = json.loads(request.data)
        if not data:
            return make_error_response('No data provided')

        purchase_order_loan_id = data['purchase_order_loan_id']

        if not purchase_order_loan_id:
            return make_error_response('No Purchase Order Loan ID provided')

        with session_scope(current_app.session_maker) as session:
            purchase_order_loan = cast(
                models.PurchaseOrderLoan,
                session.query(models.PurchaseOrderLoan).filter_by(
                    id=purchase_order_loan_id
                ).first()
            )

            if not purchase_order_loan.purchase_order_id:
                return make_error_response('Purchase Order is required')

            loan = purchase_order_loan.loan
            if not loan.origination_date:
                return make_error_response('Invalid origination date')

            if loan.amount is None or loan.amount <= 0:
                return make_error_response('Invalid amount')

            # List of other Purchase Order Loans related to same Purchase Order.
            sibling_purchase_order_loans = cast(
                List[models.PurchaseOrderLoan],
                session.query(models.PurchaseOrderLoan)
                .filter(models.PurchaseOrderLoan.id != purchase_order_loan.id)
                .filter_by(purchase_order_id=purchase_order_loan.purchase_order_id)
            )

            proposed_loans_total_amount = 0.0
            for sibling_purchase_order_loan in sibling_purchase_order_loans:
                sibling_loan = sibling_purchase_order_loan.loan
                if sibling_loan.status in [RequestStatusEnum.ApprovalRequested, RequestStatusEnum.Approved]:
                    proposed_loans_total_amount += float(
                        sibling_loan.amount) if sibling_loan.amount else 0

            proposed_loans_total_amount += float(loan.amount)

            if proposed_loans_total_amount > float(purchase_order_loan.purchase_order.amount):
                return make_error_response('Too many loans for same Purchase Order')

            loan.status = RequestStatusEnum.ApprovalRequested
            loan.requested_at = date_util.now()

            session.commit()

        return make_response(json.dumps({
            'status': 'OK',
            'msg': 'Purchase Order Loan {} approval request responded to'.format(purchase_order_loan_id)
        }), 200)


handler.add_url_rule(
    '/submit_for_approval',
    view_func=SubmitForApprovalView.as_view(
        name='submit_for_approval_view')
)
