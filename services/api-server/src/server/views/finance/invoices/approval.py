import json
import logging
from typing import Any, Callable, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util, number_util
from bespoke.finance.invoices import invoices_util
from bespoke.finance.loans import approval_util
from bespoke.security import security_util, two_factor_util
from flask import Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util


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

		_, err = invoices_util.handle_invoice_approval_request(
			current_app.session_maker,
			current_app.sendgrid_client,
			invoice_id)
		if err:
			raise err

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
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			return handler_util.make_error_response("No data provided")

		user_session = auth_util.UserSession.from_session()

		for key in self.required_keys:
			if key not in data:
				raise errors.Error(f"Missing key: '{key}'")

		invoice_id = data['invoice_id']
		new_request_status = data['new_request_status']
		rejection_note = data['rejection_note']
		link_val = data['link_val']

		if not invoice_id:
			raise errors.Error('No Invoice ID provided')

		if new_request_status not in [RequestStatusEnum.APPROVED, RequestStatusEnum.REJECTED]:
			raise errors.Error('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.REJECTED and not rejection_note:
			raise errors.Error('Rejection note is required if response is rejected')

		with models.session_scope(current_app.session_maker) as session:
			info, err = two_factor_util.get_two_factor_link(
				link_val,
				current_app.app_config.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7,
				session=session
			)
			if err:
				raise err

			user = session.query(models.User).filter(
				models.User.email == info['email'].lower()
			).first()
			if user:
				event.user_id(str(user.id))

			invoice = session.query(models.Invoice).get(invoice_id)
			invoice.status = new_request_status

			action_type = 'Rejected'

			if new_request_status == RequestStatusEnum.APPROVED:
				invoice.approved_at = date_util.now()
				action_type = 'Approved'

				active_contract, err = contract_util.get_active_contract_by_company_id(
					company_id=str(invoice.company_id),
					session=session,
				)
				if err:
					raise err

				if not active_contract:
					raise errors.Error('No active contract in place for the companys invoice')

				advance_rate, err = active_contract.get_advance_rate()

				if err:
					raise err

				submit_resp, err = approval_util.submit_for_approval_if_has_autofinancing(
					company_id=str(invoice.company_id),
					amount=float(invoice.subtotal_amount) * advance_rate,
					artifact_id=str(invoice.id),
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
				raise errors.Error("No users configured for this customer")

			template_name = sendgrid_util.TemplateNames.PAYOR_APPROVES_OR_REJECTS_INVOICE
			template_data = {
				'payor_name': invoice.payor.name,
				'customer_name': invoice.company.name,
				'invoices': invoices,
				'action_type': action_type,
			}

			emails = [u.email for u in customer_users if u.email]
			if len(emails):
				_, err = sendgrid_client.send(
					template_name,
					template_data,
					emails
				)
				if err:
					raise err

			cast(Callable, session.delete)(info['link'])

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f'invoice {invoice_id} responded to'
		}))
