import json
from typing import Any, Callable, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke.security import security_util, two_factor_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('purchase_orders', __name__)

class PurchaseOrderFileTypeEnum():
	Cannabis = 'cannabis'
	PurchaseOrder = 'purchase_order'


class RespondToApprovalRequestView(MethodView):
	"""
	POST request that handles the following:
	1. Vendor user approves a purchase order.
	2. Vendor user rejects a purchase order - note is recorded in purchase_order.rejection_note.
	3. Bank user approves a purchase order on behalf of the vendor.
	4. Bank user rejects a purchase order - note is recorded in purchase_order.bank_rejection_note.
	"""
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_RESPOND_TO_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, event: events.Event, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'purchase_order_id',
			'new_request_status',
			'rejection_note',
			'link_val',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to approval request')

		purchase_order_id = data['purchase_order_id']
		new_request_status = data['new_request_status']
		rejection_note = data['rejection_note']
		link_val = data['link_val']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		if new_request_status not in [RequestStatusEnum.APPROVED, RequestStatusEnum.REJECTED]:
			raise errors.Error('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.REJECTED and not rejection_note:
			raise errors.Error('Rejection note is required if response is rejected')

		vendor_name = ''
		customer_name = ''
		purchase_order_number = ''
		purchase_order_amount = ''
		purchase_order_requested_date = ''
		action_type = ''

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			if user_session.is_bank_admin():
				user = session.query(models.User) \
					.filter(models.User.email == user_session.get_user_id()) \
					.first()
				if user:
					event.user_id(str(user.id))
			else:
				two_factor_info, bespoke_err = two_factor_util.get_two_factor_link(
					link_val, cfg.get_security_config(),
					max_age_in_seconds=security_util.SECONDS_IN_DAY * 7, session=session)
				if bespoke_err:
					return handler_util.make_error_response(bespoke_err)
				two_factor_link = two_factor_info['link']

				user = session.query(models.User) \
					.filter(models.User.email == two_factor_info['email']) \
					.first()
				if user:
					event.user_id(str(user.id))

			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id).first()
			)

			if new_request_status == RequestStatusEnum.APPROVED:
				purchase_order.status = RequestStatusEnum.APPROVED
				purchase_order.approved_at = date_util.now()
				action_type = 'Approved'
			else:
				purchase_order.status = RequestStatusEnum.REJECTED
				purchase_order.rejected_at = date_util.now()
				action_type = 'Rejected'

				if user_session.is_bank_admin():
					purchase_order.bank_rejection_note = rejection_note
				else:
					purchase_order.rejection_note = rejection_note

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			purchase_order_requested_date = date_util.human_readable_yearmonthday(purchase_order.requested_at)

			customer_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=purchase_order.company_id).all())

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			vendor_name = purchase_order.vendor.name
			customer_name = purchase_order.company.name
			customer_emails = [user.email for user in customer_users]

			if not user_session.is_bank_admin():
				cast(Callable, session.delete)(two_factor_link) # retire the link now that it has been used

		if action_type == 'Approved':
			template_name = sendgrid_util.TemplateNames.VENDOR_APPROVED_PURCHASE_ORDER
			template_data = {
				'vendor_name': vendor_name,
				'customer_name': customer_name,
				'purchase_order_number': purchase_order_number,
				'purchase_order_amount': purchase_order_amount,
				'purchase_order_requested_date': purchase_order_requested_date,
			}
			submit_resp, err = approval_util.submit_for_approval_if_has_autofinancing(
				company_id=str(purchase_order.company_id),
				amount=float(purchase_order.amount),
				artifact_id=str(purchase_order.id),
				session=session
			)
			if err:
				raise err

			if submit_resp:
				# Only trigger the email if indeed we performed autofinancing
				success, err = approval_util.send_loan_approval_requested_email(
					sendgrid_client, submit_resp)
				if err:
					raise err
		elif not user_session.is_bank_admin():
			template_name = sendgrid_util.TemplateNames.VENDOR_REJECTED_PURCHASE_ORDER
			template_data = {
				'vendor_name': vendor_name,
				'customer_name': customer_name,
				'purchase_order_number': purchase_order_number,
				'purchase_order_amount': purchase_order_amount,
				'purchase_order_requested_date': purchase_order_requested_date,
				'rejection_note': rejection_note,
			}
		else:
			template_name = sendgrid_util.TemplateNames.BANK_REJECTED_PURCHASE_ORDER
			template_data = {
				'customer_name': customer_name,
				'purchase_order_number': purchase_order_number,
				'purchase_order_amount': purchase_order_amount,
				'purchase_order_requested_date': purchase_order_requested_date,
				'rejection_note': rejection_note,
			}

		recipients = customer_emails
		_, err = sendgrid_client.send(
			template_name, template_data, recipients)
		if err:
			raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} approval request responded to'.format(purchase_order_id)
		}), 200)


class SubmitForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		purchase_order_id = data['purchase_order_id']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		vendor_emails = []
		vendor_name = None
		is_vendor_missing_bank_account = False
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
				raise errors.Error('Invalid order number')

			if not purchase_order.order_date:
				raise errors.Error('Invalid order date')

			if not purchase_order.delivery_date:
				raise errors.Error('Invalid delivery date')

			if purchase_order.amount is None or purchase_order.amount <= 0:
				raise errors.Error('Invalid amount')

			company_vendor_relationship = cast(
				models.CompanyVendorPartnership, session.query(
				models.CompanyVendorPartnership).filter_by(
					company_id=customer.id,
					vendor_id=vendor.id).first())

			if not company_vendor_relationship.vendor_bank_id:
				is_vendor_missing_bank_account = True

			if not company_vendor_relationship or company_vendor_relationship.approved_at is None:
				raise errors.Error('Vendor is not approved')

			purchase_order_file = cast(models.PurchaseOrderFile, session.query(
				models.PurchaseOrderFile
			).filter_by(purchase_order_id=purchase_order.id, file_type=PurchaseOrderFileTypeEnum.PurchaseOrder).first())
			if not purchase_order_file:
				raise errors.Error('File attachment is required')

			vendor_name = vendor.name
			customer_name = customer.name

			vendor_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=purchase_order.vendor_id).all())

			if not vendor_users:
				raise errors.Error('There are no users configured for this vendor')

			vendor_emails = [user.email for user in vendor_users]

			purchase_order.status = RequestStatusEnum.APPROVAL_REQUESTED
			purchase_order.requested_at = date_util.now()

		form_info = models.TwoFactorFormInfoDict(
			type=db_constants.TwoFactorLinkType.CONFIRM_PURCHASE_ORDER,
			payload={
				'purchase_order_id': purchase_order_id
			}
		)
		two_factor_payload = sendgrid_util.TwoFactorPayloadDict(
			form_info=form_info,
			expires_at=date_util.hours_from_today(24 * 7)
		)

		# Send the email to the vendor for them to approve or reject this purchase order
		# Get the vendor_id and find its users
		template_data = {
			'vendor_name': vendor_name,
			'customer_name': customer_name
		}
		_, err = sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER,
			template_data=template_data,
			recipients=vendor_emails,
			two_factor_payload=two_factor_payload,
		)
		if err:
			raise err

		# If vendor does NOT have a bank account set up yet,
		# send an email to the Bespoke team letting them know about this.
		if is_vendor_missing_bank_account:
			template_data = {
				'vendor_name': vendor_name,
				'customer_name': customer_name,
			}
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT,
				template_data=template_data,
				recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES + current_app.app_config.OPS_EMAIL_ADDRESSES,
			)
			if err:
				raise err

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
