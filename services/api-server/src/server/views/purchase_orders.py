import json
import os
from typing import Any, Callable, List, cast
import uuid

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models, models_util, queries
from bespoke.db.db_constants import RequestStatusEnum, NewPurchaseOrderStatus, LoanStatusEnum, UserRoles
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke.finance.purchase_orders import purchase_orders_util
from bespoke.finance.purchase_orders.purchase_orders_util import PurchaseOrderFileItem, PurchaseOrderMetrcTransferItem, \
	PurchaseOrderData
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
			user, err = queries.get_user_by_id(
				session,
				user_session.get_user_id(),
			)
			if err:
				raise err
			
			purchase_order_id, template_data, err = purchase_orders_util.create_update_purchase_order_new(
				session,
				data,
				str(user.id),
				user.full_name
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


class UpdateViewNew(MethodView):
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
			user, err = queries.get_user_by_id(
				session,
				user_session.get_user_id(),
			)
			if err:
				raise err
			purchase_order_id, _, err = purchase_orders_util.create_update_purchase_order_new(
				session,
				data,
				str(user.id),
				user.full_name
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

class SubmitNewView(MethodView):
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
			user, err = queries.get_user_by_id(
				session,
				user_session.get_user_id(),
			)
			if err:
				raise err

			purchase_order, _, _, err = purchase_orders_util.submit_purchase_order_for_approval_new(
				session,
				data.purchase_order.id,
				str(user.id),
				user.full_name
			)
			if err:
				raise err

			return make_response(json.dumps({
				'status': 'OK',
				'msg': 'Success',
				'data': {
					'purchase_order_id': str(purchase_order.id),
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

class SubmitPurchaseOrderUpdateView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.PURCHASE_ORDER_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data) 
		if not form:
			return handler_util.make_error_response('No data provided')

		config = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
		if sendgrid_client is None:
			return handler_util.make_error_response('Cannot find sendgrid client')

		required_keys = [
			'purchase_order',
		    'purchase_order_files',
		    'purchase_order_metrc_transfers',
		    'action',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to submitting a purchase order update')

		data, err = PurchaseOrderData.from_dict(form.get('purchase_order'))
		if err:
			return handler_util.make_error_response(err)

		purchase_order = data.to_model()
		purchase_order_files = [PurchaseOrderFileItem.from_dict(item) for item in form.get('purchase_order_files', [])]
		purchase_order_metrc_transfers = [PurchaseOrderMetrcTransferItem.from_dict(item) for item in form.get('purchase_order_metrc_transfers', [])]
		action = form['action']

		with session_scope(current_app.session_maker) as session:
			is_new_purchase_order = True if purchase_order.id is None else False
			
			user_session = auth_util.UserSession.from_session()
			template_data, err = purchase_orders_util.submit_purchase_order_update(
				session,
				purchase_order,
				purchase_order_files,
				purchase_order_metrc_transfers,
				is_new_purchase_order,
				action,
				user_session,
			)
			if err:
				return handler_util.make_error_response(err)

			_, err = purchase_orders_util.send_email_alert_for_purchase_order_update_submission(
				session,
				purchase_order,
				is_new_purchase_order,
				action,
				sendgrid_client,
				config,
				template_data,
			)
			if err:
				return handler_util.make_error_response(err)

			#return handler_util.make_error_response(f'forced error')

			return make_response(json.dumps({
				'status': 'OK',
				'msg': 'Success',
				'data': {
					'purchase_order_id': str(purchase_order.id),
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
					.filter(models.User.id == user_session.get_user_id()) \
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
				purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
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
				user, err = queries.get_user_by_id(
					session,
					user_session.get_user_id(),
				)
				if err:
					raise err

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
				purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
				purchase_order.status = RequestStatusEnum.APPROVED
				purchase_order.approved_at = date_util.now()
				purchase_order.approved_by_user_id = approved_by_user_id
				purchase_order.history.append(
					purchase_orders_util.get_purchase_order_history_event(
						action = "PO saved as draft",
						new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING,
						created_by_user_id = user.id,
						created_by_user_full_name = user.full_name,
					)
				)
				action_type = 'Approved'
			else:
				purchase_order.status = RequestStatusEnum.REJECTED
				purchase_order.rejected_at = date_util.now()
				purchase_order.rejected_by_user_id = rejected_by_user_id
				purchase_order.history.append(
					purchase_orders_util.get_purchase_order_history_event(
						action = "PO saved as draft",
						new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING,
						created_by_user_id = user.id,
						created_by_user_full_name = user.full_name,
					)
				)
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

class ApprovePurchaseOrderView(MethodView):
	"""
	POST request that handles the following:
	1. Vendor user approves a purchase order.
	2. Bank user approves a purchase order on behalf of the vendor.
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
			'rejection_note',
			'link_val',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to approval request')

		purchase_order_id = data['purchase_order_id']
		rejection_note = data['rejection_note']
		link_val = data['link_val']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		vendor_name = ''
		customer_name = ''
		purchase_order_number = ''
		purchase_order_amount = ''
		purchase_order_requested_date = ''
		action_type = ''
		approved_by_user_id = data['approved_by_user_id'] if 'approved_by_user_id' in data else None
		
		user_session = auth_util.UserSession.from_session()
		is_bank_admin = user_session.is_bank_admin()

		with session_scope(current_app.session_maker) as session:
			if is_bank_admin:
				user, err = queries.get_user_by_id(
					session,
					user_session.get_user_id(),
				)
				if err:
					raise err

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

			purchase_order, err = purchase_orders_util.approve_purchase_order(
				session,
				purchase_order_id,
				str(user.id),
				user.full_name,
				is_bank_admin,
			)
			if err:
				raise err

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			purchase_order_requested_date = date_util.human_readable_yearmonthday(
				purchase_order.requested_at,
			)

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			vendor_name = purchase_order.vendor.get_display_name()
			customer_name = purchase_order.company.get_display_name()
			#customer_emails = [user.email for user in customer_users]
			customer_emails = [cfg.NO_REPLY_EMAIL_ADDRESS]

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

			_, err = sendgrid_client.send(
				template_name = template_name,
				template_data = template_data,
				recipients = recipients,
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
					.filter(models.User.id == user_session.get_user_id()) \
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
			purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.ARCHIVED

			user = session.query(models.User) \
				.filter(models.User.id == user_session.get_user_id()) \
				.first()

			purchase_orders_util.update_purchase_order_history(
				purchase_order = purchase_order,
				user_id = user_session.get_user_id(),
				user_full_name = user.full_name,
				action = "PO archived",
				new_status = NewPurchaseOrderStatus.ARCHIVED
			)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} closed'.format(purchase_order_id)
		}), 200)


class ArchiveMultipleView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		purchase_order_ids = data['purchase_order_ids']

		if not purchase_order_ids:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()
		user_id = user_session.get_user_id()

		with session_scope(current_app.session_maker) as session:
			purchase_orders, err = queries.get_purchase_orders(
				session,
				purchase_order_ids,
			)
			if err:
				raise err

			for purchase_order in purchase_orders:
				if not user_session.is_bank_or_this_company_admin(str(purchase_order.company_id)):
					return handler_util.make_error_response('Access Denied')

				purchase_order.closed_at = date_util.now()
				purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.ARCHIVED

				user, err = queries.get_user_by_id(
					session,
					user_id,
				)
				if err:
					raise err

				purchase_orders_util.update_purchase_order_history(
					purchase_order = purchase_order,
					user_id = user_id,
					user_full_name = user.full_name,
					action = "PO archived",
					new_status = NewPurchaseOrderStatus.ARCHIVED
				)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase orders with ids {} closed'.format(purchase_order_ids)
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

			if purchase_order.funded_at is not None and number_util.float_eq(float(purchase_order.amount), float(purchase_order.amount_funded)):
				return handler_util.make_error_response('Cannot reopen a fully funded purchase order')

			purchase_order.closed_at = None
			user, err = queries.get_user_by_id(session, user_session.get_user_id())
			if err:
				raise err
			new_status = None

			# If the PO has a working history (Created after new PO flow has launched)
			# the most recent event (-1) will be ARCHIVE, hence we look at the previous event
			# which will hold the status prior to it becoming archived
			if purchase_order.history and len(purchase_order.history) >= 2:
				new_status = purchase_order.history[-2]['new_purchase_order_status']
			else:
				if purchase_order.approved_at:
					loans = cast(
						List[models.Loan],
						session.query(models.Loan).filter(
							models.Loan.artifact_id == str(purchase_order_id)
						).filter(
							cast(Callable, models.Loan.is_deleted.isnot)(True)
						).all()
					)
					amount_funded = float(purchase_order.amount_funded) if purchase_order.amount_funded else float(0)
					all_loan_statuses = set([loan.status for loan in loans if loan.funded_at is None])
					if number_util.float_eq(amount_funded, float(purchase_order.amount)):
						new_status = NewPurchaseOrderStatus.ARCHIVED
					elif LoanStatusEnum.APPROVED in all_loan_statuses and LoanStatusEnum.APPROVAL_REQUESTED not in all_loan_statuses:
						new_status = NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED
					elif LoanStatusEnum.APPROVAL_REQUESTED in all_loan_statuses:
						new_status = NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL
					elif len(all_loan_statuses) == 0 or purchase_order.amount_funded and purchase_order.amount_funded > 0:
						new_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING

				elif purchase_order.requested_at:
					new_status = NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR
				elif purchase_order.rejected_at and purchase_order.rejected_by_user_id:
					rejected_by_user = session.query(models.User) \
						.filter(models.User.id == user_session.get_user_id()) \
						.first()
					if rejected_by_user.role != UserRoles.BANK_ADMIN:
						new_status = NewPurchaseOrderStatus.REJECTED_BY_VENDOR
				elif purchase_order.rejected_at:
					new_status = NewPurchaseOrderStatus.REJECTED_BY_BESPOKE
				elif not purchase_order.requested_at:
					new_status = NewPurchaseOrderStatus.DRAFT

			purchase_order.new_purchase_order_status = new_status
			purchase_orders_util.update_purchase_order_history(
				purchase_order = purchase_order,
				user_id = str(user.id),
				user_full_name = user.full_name,
				action = "PO unarchived",
				new_status = new_status
			)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} reopened'.format(purchase_order_id)
		}), 200)

class RejectPurchaseOrderView(MethodView):
	decorators = [auth_util.login_required]
	"""
	POST request that handles the following:
	1. Vendor user rejects a purchase order - note is recorded in purchase_order.rejection_note.
	2. Bank user rejects a purchase order - note is recorded in purchase_order.bank_rejection_note.
	"""
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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
			'rejection_note',
			'rejected_by_user_id',
			'link_val',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to rejection request')

		purchase_order_id = data['purchase_order_id']
		rejection_note = data['rejection_note']
		rejected_by_user_id = data['rejected_by_user_id']
		link_val = data['link_val']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			is_bank_admin = user_session.is_bank_admin()
			user = None
			if is_bank_admin:
				user, err = queries.get_user_by_id(
					session,
					user_session.get_user_id(),
				)
				if err:
					raise err
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

			purchase_order, err = purchase_orders_util.reject_purchase_order(
				session,
				purchase_order_id,
				str(user.id),
				user.full_name,
				rejection_note,
				is_bank_admin,
			)
			if err:
				raise err

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			purchase_order_requested_date = date_util.human_readable_yearmonthday(
				purchase_order.requested_at if purchase_order.requested_at is not None else date_util.now()
			)
			vendor_name = purchase_order.vendor.get_display_name()

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			customer_name = purchase_order.company.get_display_name()
			#customer_emails = [user.email for user in customer_users]
			customer_emails = [cfg.NO_REPLY_EMAIL_ADDRESS]

			if is_bank_admin:
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
				template_name = template_name,
				template_data = template_data,
				recipients = recipients,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} has been successfully rejected'.format(purchase_order_id)
		}), 200)

class RequestPurchaseOrderChangesView(MethodView):
	decorators = [auth_util.login_required]
	"""
	POST request that handles the following:
	1. Vendor user requests changes to a purchase order - note is recorded in purchase_order.requested_changes_note.
	2. Bank user requests changes to a purchase order - note is recorded in purchase_order.all_bank_notes["requested_changes"].
	"""
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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
			'requested_changes_note',
			'requested_by_user_id',
			'link_val',
		]
		for key in required_keys:
			if key not in data:
				raise errors.Error(f'Missing {key} in respond to change request')

		purchase_order_id = data['purchase_order_id']
		requested_changes_note = data['requested_changes_note']
		requested_by_user_id = data['requested_by_user_id']
		link_val = data['link_val']

		if not purchase_order_id:
			raise errors.Error('No Purchase Order ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			is_bank_admin = user_session.is_bank_admin()
			user = None
			if is_bank_admin:
				user, err = queries.get_user_by_id(
					session,
					user_session.get_user_id(),
				)
				if err:
					raise err
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

			purchase_order, err = purchase_orders_util.request_purchase_order_changes(
				session,
				purchase_order_id,
				str(user.id),
				user.full_name,
				requested_changes_note,
				is_bank_admin,
			)
			if err:
				raise err

			purchase_order_number = purchase_order.order_number
			purchase_order_amount = number_util.to_dollar_format(float(purchase_order.amount))
			purchase_order_requested_date = date_util.human_readable_yearmonthday(
				purchase_order.requested_at if purchase_order.requested_at is not None else date_util.now()
			)
			vendor_name = purchase_order.vendor.get_display_name()

			customer_users = models_util.get_active_users(
				purchase_order.company_id, 
				session, 
				filter_contact_only=True
			)

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			customer_name = purchase_order.company.get_display_name()
			customer_emails = [user.email for user in customer_users]
			
			if is_bank_admin:
				template_name = sendgrid_util.TemplateNames.BANK_REQUESTS_CHANGES_TO_PURCHASE_ORDER
				template_data = {
					'customer_name': customer_name,
					'purchase_order_number': purchase_order_number,
					'purchase_order_amount': purchase_order_amount,
					'purchase_order_requested_date': purchase_order_requested_date,
					'requested_changes_note': requested_changes_note,
					'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
				}
				recipients = customer_emails
			else:
				template_name = sendgrid_util.TemplateNames.VENDOR_REQUESTS_CHANGES_TO_PURCHASE_ORDER
				template_data = {
					'vendor_name': vendor_name,
					'customer_name': customer_name,
					'purchase_order_number': purchase_order_number,
					'purchase_order_amount': purchase_order_amount,
					'purchase_order_requested_date': purchase_order_requested_date,
					'requested_changes_note': requested_changes_note,
					'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
				}
				recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()

			_, err = sendgrid_client.send(
				template_name = template_name,
				template_data = template_data,
				recipients = recipients,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order {} has been successfully rejected'.format(purchase_order_id)
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
	'/submit_purchase_order_update',
	view_func=SubmitPurchaseOrderUpdateView.as_view(
		name='submit_purchase_order_update_new',
	),
)

handler.add_url_rule(
	'/update',
	view_func=UpdateView.as_view(name='update'),
)

handler.add_url_rule(
	'/update_new',
	view_func=UpdateViewNew.as_view(name='update_new'),
)

handler.add_url_rule(
	'/submit',
	view_func=SubmitView.as_view(name='submit'),
)

handler.add_url_rule(
	'/submit_new',
	view_func=SubmitNewView.as_view(name='submit_new'),
)


handler.add_url_rule(
	'/respond_to_approval_request',
	view_func=RespondToApprovalRequestView.as_view(
		name='respond_to_approval_request')
)

handler.add_url_rule(
	'/approve_purchase_order',
	view_func=ApprovePurchaseOrderView.as_view(
		name='approve_purchase_order_view')
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
	'/archive_multiple',
	view_func=ArchiveMultipleView.as_view(name='archive_multiple')
)

handler.add_url_rule(
	'/reopen',
	view_func=ReopenView.as_view(name='reopen')
)

handler.add_url_rule(
	'/reject_purchase_order',
	view_func=RejectPurchaseOrderView.as_view(name='reject_purchase_order_view')
)

handler.add_url_rule(
	'/request_purchase_order_changes',
	view_func=RequestPurchaseOrderChangesView.as_view(name='request_purchase_order_changes_view')
)
