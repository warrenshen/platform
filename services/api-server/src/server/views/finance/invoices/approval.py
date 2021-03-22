import json
import logging
from typing import Any

from server.views.common import auth_util, handler_util
from bespoke.finance.invoices import invoices_util
from bespoke.date import date_util
from bespoke.finance import number_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.audit import events
from bespoke.email import sendgrid_util
from bespoke.security import two_factor_util, security_util

from flask import Response, current_app, make_response, request
from flask.views import MethodView


class SubmitForApprovalView(MethodView):

	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.INVOICE_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		invoice_id = data.get('id')

		user_session = auth_util.UserSession.from_session()

		if not invoice_id:
			return handler_util.make_error_response('no id in request')

		err = invoices_util.handle_invoice_approval_request(
			current_app.session_maker,
			current_app.sendgrid_client,
			invoice_id)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Invoice submitted to payor for approval'
		}))


class RespondToApprovalRequestView(MethodView):

	decorators = [auth_util.login_required]

	required_keys = (
		'invoice_id',
		'new_request_status',
		'rejection_note',
		'link_val'
	)

	@events.wrap(events.Actions.INVOICE_RESPOND_TO_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, event: events.Event, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			return handler_util.make_error_response("No data provided")

		user_session = auth_util.UserSession.from_session()

		for key in self.required_keys:
			if key not in data:
				return handler_util.make_error_response(f"Missing key: '{key}'")

		invoice_id = data['invoice_id']
		new_request_status = data['new_request_status']
		rejection_note = data['rejection_note']
		link_val = data['link_val']

		if not invoice_id:
			return handler_util.make_error_response('No Invoice ID provided')

		if new_request_status not in [RequestStatusEnum.APPROVED, RequestStatusEnum.REJECTED]:
			return handler_util.make_error_response('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.REJECTED and not rejection_note:
			return handler_util.make_error_response('Rejection note is required if response is rejected')

		with models.session_scope(current_app.session_maker) as session:
			info, err = two_factor_util.get_two_factor_link(
				link_val,
				current_app.app_config.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7,
				session=session
			)
			if err:
				return handler_util.make_error_response(err)

			user = session.query(models.User) \
				.filter(models.User.email == info['email']) \
				.first()
			if user:
				event.user_id(str(user.id))

			invoice = session.query(models.Invoice).get(invoice_id)
			invoice.status = new_request_status

			action_type = 'Rejected'

			if new_request_status == RequestStatusEnum.APPROVED:
				invoice.approved_at = date_util.now()
				action_type = 'Approved'
			else:
				invoice.rejected_at = date_util.now()
				invoice.rejection_note = rejection_note

			invoices = [{
				'invoice_number': invoice.invoice_number,
				'subtotal_amount': number_util.to_dollar_format(float(invoice.subtotal_amount)),
				'requested_at_date': date_util.human_readable_yearmonthday(invoice.requested_at),
			}]

			customer_users = session.query(models.User) \
				.filter(models.User.company_id == invoice.company_id) \
				.all()

			if not customer_users:
				return handler_util.make_error_response("No users configured for this customer")

			template_name = sendgrid_util.TemplateNames.PAYOR_APPROVES_OR_REJECTS_INVOICE
			template_data = {
				'payor_name': invoice.payor.name,
				'customer_name': invoice.company.name,
				'invoices': invoices,
				'action_type': action_type,
			}

			emails = [u.email for u in customer_users if u.email]
			if len(emails):
				_, err = current_app.sendgrid_client.send(
					template_name,
					template_data,
					emails
				)
				if err:
					return handler_util.make_error_response(err)

			session.delete(info['link']) # type: ignore

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'invoice {invoice_id} responded to'
		}))
