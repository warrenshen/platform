import json
import os
from typing import Any, Callable, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import RequestStatusEnum, TwoFactorLinkType
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke.finance.purchase_orders import purchase_orders_util
from bespoke.security import security_util, two_factor_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config, is_test_env
from server.views.common import auth_util, handler_util

handler = Blueprint('purchase_orders', __name__)

class CreateUpdateAsDraftView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_CREATE_UPDATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, err = purchase_orders_util.create_update_purchase_order(
				data, session)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

class CreateUpdateAsDraftNewView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_CREATE_UPDATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequestNew.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, template_data, err = purchase_orders_util.create_update_purchase_order_new(
				session,
				data,
			)
			if err:
				raise err
			
			_, err = current_app.sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER,
				template_data=template_data,
				recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

class UpdateView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_CREATE_UPDATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		if not data.purchase_order.id:
			return handler_util.make_error_response("Purchase Order ID is required", status_code=400)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, err = purchase_orders_util.create_update_purchase_order(
				data, session)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

class SubmitView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		if not data.purchase_order.id:
			return handler_util.make_error_response("Purchase Order ID is required", status_code=400)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, err = purchase_orders_util.submit_purchase_order_for_approval(
				data.purchase_order.id, session)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

class CreateUpdateAndSubmitView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, err = purchase_orders_util.create_update_purchase_order(
				data,
				session
			)
			if err:
				raise err

			purchase_order_id, err = purchase_orders_util.submit_purchase_order_for_approval(
				purchase_order_id,
				session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

class CreateUpdateAndSubmitNewView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = purchase_orders_util.PurchaseOrderUpsertRequestNew.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.purchase_order.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

		with session_scope(current_app.session_maker) as session:
			purchase_order_id, template_data, err = purchase_orders_util.create_update_purchase_order_new(
				session,
				data,
			)
			if err:
				raise err

			_, err = current_app.sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER_NEW,
				template_data=template_data,
				recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES,
			)
			if err:
				raise err

			purchase_order, vendor_users, is_vendor_missing_bank_account, err = purchase_orders_util.submit_purchase_order_for_approval_new(
				session,
				purchase_order_id,
			)
			if err:
				raise err
			
			form_info = cast(Callable, models.TwoFactorFormInfoDict)(
				type=TwoFactorLinkType.CONFIRM_PURCHASE_ORDER,
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
			_, err = current_app.sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER_NEW,
				template_data=template_data,
				# Todo : Update this before rolling out to customers
				recipients=[user['email'] for user in vendor_users]
						if not (is_test_env(os.environ.get("FLASK_ENV")))
						else current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES,
				two_factor_payload=two_factor_payload,
				is_new_secure_link=True,
			)
			if err:
				raise err

			# If vendor does NOT have a bank account set up yet,
			# send an email to the Bespoke team letting them know about this.
			if is_vendor_missing_bank_account:
				template_data = {
					'vendor_name': purchase_order.vendor.get_display_name(),
					'customer_name': purchase_order.company.get_display_name(),
				}
				_, err = current_app.sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT_NEW,
					template_data=template_data,
					recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES + current_app.app_config.OPS_EMAIL_ADDRESSES,
				)
				if err:
					raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'purchase_order_id': purchase_order_id,
			}
		}))

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
		sendgrid_client = cast(
			sendgrid_util.Client,
			current_app.sendgrid_client,
		)

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
		approved_by_user_id = data['approved_by_user_id'] if 'approved_by_user_id' in data else None
		rejected_by_user_id = data['rejected_by_user_id'] if 'rejected_by_user_id' in data else None

		user_session = auth_util.UserSession.from_session()
		requested_by_user_id = user_session.get_user_id()
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
					id=purchase_order_id
				).first())

			if new_request_status == RequestStatusEnum.APPROVED:
				purchase_order.status = RequestStatusEnum.APPROVED
				purchase_order.approved_at = date_util.now()
				purchase_order.approved_by_user_id = approved_by_user_id
				action_type = 'Approved'
			else:
				purchase_order.status = RequestStatusEnum.REJECTED
				purchase_order.rejected_at = date_util.now()
				purchase_order.rejected_by_user_id = rejected_by_user_id
				action_type = 'Rejected'

				if user_session.is_bank_admin():
					purchase_order.bank_rejection_note = rejection_note
				else:
					purchase_order.rejection_note = rejection_note

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			if purchase_order.requested_at is not None:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(purchase_order.requested_at)
			else:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(date_util.now())

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			vendor_name = purchase_order.vendor.get_display_name()
			customer_name = purchase_order.company.get_display_name()
			customer_emails = [user.email for user in customer_users]

			if not user_session.is_bank_admin():
				cast(Callable, session.delete)(two_factor_link) # retire the link now that it has been used

			if action_type == 'Approved':
				submit_resp, err = approval_util.submit_for_approval_if_has_autofinancing(
					session=session,
					company_id=str(purchase_order.company_id),
					amount=float(purchase_order.amount),
					artifact_id=str(purchase_order.id),
					requested_by_user_id=requested_by_user_id,
				)
				if err:
					if err.msg.find("psycopg2.errors.ForeignKeyViolation"):
						raise errors.Error('Unable to submit autofinanced loan.')
					else:
						raise err

				if submit_resp:
					# Only trigger the email if indeed we performed autofinancing
					success, err = approval_util.send_loan_approval_requested_email(
						sendgrid_client, submit_resp)
					if err:
						raise err

				template_name = sendgrid_util.TemplateNames.VENDOR_APPROVED_PURCHASE_ORDER
				template_data = {
					'vendor_name': vendor_name,
					'customer_name': customer_name,
					'purchase_order_number': purchase_order_number,
					'purchase_order_amount': purchase_order_amount,
					'purchase_order_requested_date': purchase_order_requested_date,
					'is_autofinancing_enabled': submit_resp['triggered_by_autofinancing'] if submit_resp else False,
				}
				recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()
			else:
				if user_session.is_bank_admin():
					template_name = sendgrid_util.TemplateNames.BANK_REJECTED_PURCHASE_ORDER
					template_data = {
						'customer_name': customer_name,
						'purchase_order_number': purchase_order_number,
						'purchase_order_amount': purchase_order_amount,
						'purchase_order_requested_date': purchase_order_requested_date,
						'rejection_note': rejection_note,
					}
					recipients = customer_emails
				else:
					template_name = sendgrid_util.TemplateNames.VENDOR_REJECTED_PURCHASE_ORDER
					template_data = {
						'vendor_name': vendor_name,
						'customer_name': customer_name,
						'purchase_order_number': purchase_order_number,
						'purchase_order_amount': purchase_order_amount,
						'purchase_order_requested_date': purchase_order_requested_date,
						'rejection_note': rejection_note,
					}
					recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()

			_, err = sendgrid_client.send(
				template_name=template_name,
				template_data=template_data,
				recipients=recipients,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} approval request responded to'.format(purchase_order_id)
		}), 200)


class RespondToApprovalRequestNewView(MethodView):
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
		sendgrid_client = cast(
			sendgrid_util.Client,
			current_app.sendgrid_client,
		)

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
		approved_by_user_id = data['approved_by_user_id'] if 'approved_by_user_id' in data else None
		rejected_by_user_id = data['rejected_by_user_id'] if 'rejected_by_user_id' in data else None

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
					id=purchase_order_id
				).first())

			if new_request_status == RequestStatusEnum.APPROVED:
				purchase_order.status = RequestStatusEnum.APPROVED
				purchase_order.approved_at = date_util.now()
				purchase_order.approved_by_user_id = approved_by_user_id
				action_type = 'Approved'
			else:
				purchase_order.status = RequestStatusEnum.REJECTED
				purchase_order.rejected_at = date_util.now()
				purchase_order.rejected_by_user_id = rejected_by_user_id
				action_type = 'Rejected'

				if user_session.is_bank_admin():
					purchase_order.bank_rejection_note = rejection_note
				else:
					purchase_order.rejection_note = rejection_note

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			if purchase_order.requested_at is not None:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(purchase_order.requested_at)
			else:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(date_util.now())

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			vendor_name = purchase_order.vendor.get_display_name()
			customer_name = purchase_order.company.get_display_name()
			customer_emails = [user.email for user in customer_users]

			if not user_session.is_bank_admin():
				cast(Callable, session.delete)(two_factor_link) # retire the link now that it has been used

			if action_type == 'Approved':
				submit_resp, err = approval_util.submit_for_approval_if_has_autofinancing(
					session=session,
					company_id=str(purchase_order.company_id),
					amount=float(purchase_order.amount),
					artifact_id=str(purchase_order.id),
					requested_by_user_id=user_session.get_user_id(),

				)
				if err:
					if err.msg.find("psycopg2.errors.ForeignKeyViolation"):
						raise errors.Error('Unable to submit autofinanced loan.')
					else:
						raise err

				if submit_resp:
					# Only trigger the email if indeed we performed autofinancing
					success, err = approval_util.send_loan_approval_requested_email(
						sendgrid_client, submit_resp)
					if err:
						raise err

				template_name = sendgrid_util.TemplateNames.VENDOR_APPROVED_PURCHASE_ORDER
				template_data = {
					'vendor_name': vendor_name,
					'customer_name': customer_name,
					'purchase_order_number': purchase_order_number,
					'purchase_order_amount': purchase_order_amount,
					'purchase_order_requested_date': purchase_order_requested_date,
					'is_autofinancing_enabled': submit_resp['triggered_by_autofinancing'] if submit_resp else False,
				}
				recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()
			else:
				if user_session.is_bank_admin():
					template_name = sendgrid_util.TemplateNames.BANK_REJECTED_PURCHASE_ORDER
					template_data = {
						'customer_name': customer_name,
						'purchase_order_number': purchase_order_number,
						'purchase_order_amount': purchase_order_amount,
						'purchase_order_requested_date': purchase_order_requested_date,
						'rejection_note': rejection_note,
					}
					recipients = customer_emails
				else:
					template_name = sendgrid_util.TemplateNames.VENDOR_REJECTED_PURCHASE_ORDER
					template_data = {
						'vendor_name': vendor_name,
						'customer_name': customer_name,
						'purchase_order_number': purchase_order_number,
						'purchase_order_amount': purchase_order_amount,
						'purchase_order_requested_date': purchase_order_requested_date,
						'rejection_note': rejection_note,
					}
					recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()

			_, err = sendgrid_client.send(
				template_name=template_name,
				template_data=template_data,
				recipients=recipients,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} approval request responded to'.format(purchase_order_id)
		}), 200)

class RespondToIncompleteRequestView(MethodView):
	"""
	POST request that handles the following:
	1. Bank user marks a purchase order as incomplete - note is recorded in purchase_order.bank_incomplete_note.
	"""
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_RESPOND_TO_INCOMPLETE)
	@handler_util.catch_bad_json_request
	def post(self, event: events.Event, **kwargs: Any) -> Response:
		sendgrid_client = cast(
			sendgrid_util.Client,
			current_app.sendgrid_client,
		)

		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		required_keys = [
			'purchase_order_id',
			'new_request_status',
			'incomplete_note',
			'link_val',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to mark incomplete request')

		purchase_order_id = data['purchase_order_id']
		new_request_status = data['new_request_status']
		incomplete_note = data['incomplete_note']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		if new_request_status != RequestStatusEnum.INCOMPLETE:
			raise errors.Error('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.INCOMPLETE and not incomplete_note:
			raise errors.Error('Incomplete note is required if response is incomplete')

		customer_name = ''
		purchase_order_number = ''
		purchase_order_amount = ''
		purchase_order_requested_date = ''

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			if user_session.is_bank_admin():
				user = session.query(models.User) \
					.filter(models.User.email == user_session.get_user_id()) \
					.first()
				if user:
					event.user_id(str(user.id))

			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id).first()
			)

			purchase_order.status = RequestStatusEnum.INCOMPLETE
			purchase_order.incompleted_at = date_util.now()
			purchase_order.bank_incomplete_note = incomplete_note

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			if purchase_order.requested_at is not None:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(purchase_order.requested_at)
			else:
				purchase_order_requested_date = date_util.human_readable_yearmonthday(date_util.now())

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			customer_name = purchase_order.company.get_display_name()
			customer_emails = [user.email for user in customer_users]

			baseUrl = Config().get_env_base_url()
			template_name = sendgrid_util.TemplateNames.PURCHASE_ORDER_INCOMPLETE_NOTIFICATION
			template_data = {
				"company_name": purchase_order.company.get_display_name(),
				"company_user": customer_name,
				"vendor_name":  purchase_order.vendor.get_display_name(),
				"support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
				"purchase_order_number": purchase_order_number,
				"purchase_order_amount": purchase_order_amount,
				"purchase_order_requested_date": purchase_order_requested_date,
    			"purchase_order_title": purchase_order.order_number,
   				"purchase_order_link": f"{baseUrl}/companies/{purchase_order.company.id}/purchase-orders/",
				"incomplete_note": incomplete_note,
			}

		recipients = customer_emails
		_, err = sendgrid_client.send(
			template_name=template_name,
			template_data=template_data,
			recipients=recipients,
		)
		if err:
			raise err
		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} incompletion request responded to'.format(purchase_order_id)
	}), 200)

class UpdateBankFieldsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'purchase_order_id',
			'bank_note',
			'bank_rejection_note',
			'bank_incomplete_note',
			'rejection_note',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		purchase_order_id = form['purchase_order_id']
		bank_note = form['bank_note']
		bank_rejection_note = form['bank_rejection_note']
		bank_incomplete_note = form['bank_incomplete_note']
		rejection_note = form['rejection_note']


		with session_scope(current_app.session_maker) as session:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id
				).first())

			if purchase_order.is_deleted:
				raise errors.Error('Purchase order is deleted')

			purchase_order.bank_note = bank_note
			purchase_order.bank_rejection_note = bank_rejection_note
			purchase_order.bank_incomplete_note = bank_incomplete_note
			purchase_order.rejection_note = rejection_note

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} updated'.format(purchase_order_id)
		}), 200)

class DeleteView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_DELETE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		purchase_order_id = data['purchase_order_id']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id
				).first())

			if not user_session.is_bank_or_this_company_admin(str(purchase_order.company_id)):
				return handler_util.make_error_response('Access Denied')

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					cast(Callable, models.Loan.is_deleted.isnot)(True)
				).filter(
					models.Loan.artifact_id == purchase_order_id
				).all())

			if len(loans) > 0:
				raise errors.Error('Purchase order is associated with loan(s) and cannot be deleted')

			if purchase_order.is_deleted:
				raise errors.Error('Purchase order is already deleted')

			purchase_order.is_deleted = True

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} deleted'.format(purchase_order_id)
		}), 200)

class CloseView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		purchase_order_id = data['purchase_order_id']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id
				).first())

			if not user_session.is_bank_or_this_company_admin(str(purchase_order.company_id)):
				return handler_util.make_error_response('Access Denied')

			purchase_order.closed_at = date_util.now()

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} closed'.format(purchase_order_id)
		}), 200)

class ReopenView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		purchase_order_id = data['purchase_order_id']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=purchase_order_id
				).first())

			if not user_session.is_bank_or_this_company_admin(str(purchase_order.company_id)):
				return handler_util.make_error_response('Access Denied')

			if purchase_order.funded_at is not None:
				return handler_util.make_error_response('Cannot reopen a fully funded purchase order')

			purchase_order.closed_at = None

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} reopened'.format(purchase_order_id)
		}), 200)

handler.add_url_rule(
	'/create_update_as_draft',
	view_func=CreateUpdateAsDraftView.as_view(
		name='create_update_as_draft',
	),
)

handler.add_url_rule(
	'/create_update_as_draft_new',
	view_func=CreateUpdateAsDraftNewView.as_view(
		name='create_update_as_draft_new',
	),
)

handler.add_url_rule(
	'/create_update_and_submit',
	view_func=CreateUpdateAndSubmitView.as_view(
		name='create_update_and_submit',
	),
)

handler.add_url_rule(
	'/create_update_and_submit_new',
	view_func=CreateUpdateAndSubmitNewView.as_view(
		name='create_update_and_submit_new',
	),
)

handler.add_url_rule(
	'/update',
	view_func=UpdateView.as_view(name='update'),
)

handler.add_url_rule(
	'/submit',
	view_func=SubmitView.as_view(name='submit'),
)

handler.add_url_rule(
	'/respond_to_approval_request',
	view_func=RespondToApprovalRequestView.as_view(
		name='respond_to_approval_request')
)

handler.add_url_rule(
	'/respond_to_approval_request_new',
	view_func=RespondToApprovalRequestNewView.as_view(
		name='respond_to_approval_request_new')
)

handler.add_url_rule(
	'/respond_to_incomplete_request',
	view_func=RespondToIncompleteRequestView.as_view('respond_to_incomplete_request'))


handler.add_url_rule(
	'/update_bank_fields',
	view_func=UpdateBankFieldsView.as_view(name='update_bank_fields')
)

handler.add_url_rule(
	'/delete',
	view_func=DeleteView.as_view(name='delete')
)

handler.add_url_rule(
	'/close',
	view_func=CloseView.as_view(name='close')
)

handler.add_url_rule(
	'/reopen',
	view_func=ReopenView.as_view(name='reopen')
)
