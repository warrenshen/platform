import json
from typing import List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.enums.request_status_enum import RequestStatusEnum
from bespoke.finance import number_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('purchase_orders', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


class PurchaseOrderFileTypeEnum():
	Cannabis = 'cannabis'
	PurchaseOrder = 'purchase_order'


class RespondToApprovalRequestView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			return make_error_response('No data provided')

		required_keys = [
			'purchase_order_id',
			'new_request_status',
			'rejection_note',
		]
		for key in required_keys:
			if key not in data:
				return make_error_response(f'Missing {key} in respond to approval request')

		purchase_order_id = data['purchase_order_id']
		new_request_status = data['new_request_status']
		rejection_note = data['rejection_note']

		if not purchase_order_id:
			return make_error_response('No Purchase Order ID provided')

		if new_request_status not in [RequestStatusEnum.Approved, RequestStatusEnum.Rejected]:
			return make_error_response('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.Rejected and not rejection_note:
			return make_error_response('Rejection note is required if response is rejected')

		purchase_order_dicts = []
		vendor_name = ''
		customer_name = ''
		action_type = ''

		with session_scope(current_app.session_maker) as session:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id).first()
			)

			if new_request_status == RequestStatusEnum.Approved:
				purchase_order.status = RequestStatusEnum.Approved
				purchase_order.approved_at = date_util.now()
				action_type = 'Approved'
			else:
				purchase_order.status = RequestStatusEnum.Rejected
				purchase_order.rejected_at = date_util.now()
				purchase_order.rejection_note = rejection_note
				action_type = 'Rejected'

			purchase_order_dicts = [{
				'order_number': purchase_order.order_number,
				'amount': number_util.to_dollar_format(purchase_order.amount),
				'requested_at_date': date_util.human_readable_yearmonthday(purchase_order.requested_at)
			}]

			customer_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=purchase_order.company_id).all())

			if not customer_users:
				return make_error_response('There are no users configured for this customer')

			vendor_name = purchase_order.vendor.name
			customer_name = purchase_order.company.name
			customer_emails = [user.email for user in customer_users]

			session.commit()

		template_name = sendgrid_util.TemplateNames.VENDOR_APPROVES_OR_REJECTS_PURCHASE_ORDER
		template_data = {
			'vendor_name': vendor_name,
			'customer_name': customer_name,
			'purchase_orders': purchase_order_dicts,
			'action_type': action_type
		}
		recipients = customer_emails
		_, err = sendgrid_client.send(
			template_name, template_data, recipients)
		if err:
			return make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} approval request responded to'.format(purchase_order_id)
		}), 200)


class SubmitForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

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
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id).first()
			)

			vendor = purchase_order.vendor
			customer = purchase_order.company

			if not purchase_order.order_number:
				return make_error_response('Invalid order number')

			if not purchase_order.order_date:
				return make_error_response('Invalid order date')

			if not purchase_order.delivery_date:
				return make_error_response('Invalid delivery date')

			if purchase_order.amount is None or purchase_order.amount <= 0:
				return make_error_response('Invalid amount')

			company_vendor_relationship = cast(models.CompanyVendorPartnership, session.query(
				models.CompanyVendorPartnership
			).filter_by(company_id=customer.id, vendor_id=vendor.id).first())
			if not company_vendor_relationship or company_vendor_relationship.approved_at is None:
				return make_error_response('Vendor is not approved')

			purchase_order_file = cast(models.PurchaseOrderFile, session.query(
				models.PurchaseOrderFile
			).filter_by(purchase_order_id=purchase_order.id, file_type=PurchaseOrderFileTypeEnum.PurchaseOrder).first())
			if not purchase_order_file:
				return make_error_response('File attachment is required')

			vendor_name = vendor.name
			customer_name = customer.name

			vendor_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=purchase_order.vendor_id).all())

			if not vendor_users:
				return make_error_response('There are no users configured for this vendor')

			vendor_emails = [user.email for user in vendor_users]

			purchase_order.status = RequestStatusEnum.ApprovalRequested
			purchase_order.requested_at = date_util.now()

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
		_, err = sendgrid_client.send(
			template_name, template_data, recipients, form_info=form_info)
		if err:
			return make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} submitted for approval'.format(purchase_order_id)
		}), 200)


handler.add_url_rule(
	'/respond_to_approval_request',
	view_func=RespondToApprovalRequestView.as_view(
		name='respond_to_approval_request')
)

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitForApprovalView.as_view(
		name='submit_for_approval_view')
)
