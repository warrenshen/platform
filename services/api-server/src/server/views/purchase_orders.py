import json
from typing import cast

from bespoke.db import models
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required

handler = Blueprint('purchase_orders', __name__)


class RequestStatusEnum():
    ApprovalRequested = 'approval_requested'
    Approved = 'approved'
    Drafted = 'drafted'
    Rejected = 'rejected'


class SubmitForApprovalView(MethodView):

    @jwt_required
    def post(self) -> Response:
        data = json.loads(request.data)
        if not data:
            return make_error_response('No data provided')

        purchase_order_id = data['purchase_order_id']

        if not purchase_order_id:
            return make_error_response('No Purchase Order ID provided')

        with session_scope(current_app.session_maker) as session:
            purchase_order = cast(models.PurchaseOrder, session.query(
                models.PurchaseOrder).filter_by(id=purchase_order_id).first())

            if purchase_order.amount <= 0:
                return make_error_response('Invalid Purchase Order amount')

            purchase_order.status = RequestStatusEnum.ApprovalRequested
            session.commit()

            return make_response(json.dumps({
                'status': 'OK',
                'msg': 'Purchase Order {} submitted for approval'.format(purchase_order_id)
            }), 200)


handler.add_url_rule(
    '/submit_for_approval',
    view_func=SubmitForApprovalView.as_view(name='submit_for_approval_view')
)
