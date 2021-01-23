import json
from typing import cast, List

from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required

from bespoke.date import date_util
from bespoke.db import db_constants
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util

handler = Blueprint('purchase_orders', __name__)

def make_error_response(msg: str) -> Response:
    return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)

class RequestStatusEnum():
    ApprovalRequested = 'approval_requested'
    Approved = 'approved'
    Drafted = 'drafted'
    Rejected = 'rejected'


class SubmitForApprovalView(MethodView):

    @jwt_required
    def post(self) -> Response:
        sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

        data = json.loads(request.data)
        if not data:
            return make_error_response('No data provided')

        purchase_order_id = data['purchase_order_id']

        if not purchase_order_id:
            return make_error_response('No Purchase Order ID provided')

        vendor_emails = []
        vendor_name = None
        customer_name = None

        with session_scope(current_app.session_maker) as session:
            purchase_order = cast(models.PurchaseOrder, session.query(
                models.PurchaseOrder).filter_by(id=purchase_order_id).first())

            if purchase_order.amount <= 0:
                return make_error_response('Invalid Purchase Order amount')

            vendor_users = cast(List[models.User], session.query(
                models.User).filter_by(company_id=purchase_order.vendor_id).all())

            if not vendor_users:
                return make_error_response('There are no users configured for this vendor')

            purchase_order.status = RequestStatusEnum.ApprovalRequested
            purchase_order.requested_at = date_util.now()

            vendor_name = purchase_order.vendor.name
            customer_name = purchase_order.company.name
            vendor_emails = [user.email for user in vendor_users]

            session.commit()


        # Send the email to the vendor for them to approve or reject this purchase order

        # Get the vendor_id and find its users
        # 
        form_info = models.TwoFactorFormInfoDict(
                type=db_constants.TwoFactorLinkType.CONFIRM_PURCHASE_ORDER,
                payload={
                    'purchase_order_id': purchase_order_id
                }
        )
        template_name = sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER
        template_data = {
            'vendor_name': vendor_name,
            'customer_name': customer_name
        }
        recipients = vendor_emails
        _, err = sendgrid_client.send(template_name, template_data, recipients, form_info=form_info)
        if err:
            return make_error_response(err)

        return make_response(json.dumps({
            'status': 'OK',
            'msg': 'Purchase Order {} submitted for approval'.format(purchase_order_id)
        }), 200)


handler.add_url_rule(
    '/submit_for_approval',
    view_func=SubmitForApprovalView.as_view(name='submit_for_approval_view')
)
