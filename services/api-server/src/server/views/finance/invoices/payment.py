import json
import logging
from typing import Any

from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.invoices import invoices_util
from bespoke.security import security_util, two_factor_util
from flask import Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util


# Submit new invoice for payment by Payor.
class SubmitNewInvoiceForPaymentView(MethodView):

	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.INVOICE_SUBMIT_FOR_PAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['invoice_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in respond to create login')

		if not user_session.is_company_admin():
			return handler_util.make_error_response("Access Denied", status_code=403)

		invoice_id = form['invoice_id']

		err = invoices_util.submit_new_invoice_for_payment(
			current_app.session_maker,
			current_app.sendgrid_client,
			company_id,
			invoice_id,
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f"Invoice sent to payor for payment",
		}))


# Submit existing invoice(s) for payment by Payor(s).
class SubmitForPaymentView(MethodView):

	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.INVOICE_SUBMIT_FOR_PAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()
		data = json.loads(request.data)

		if not user_session.is_company_admin():
			return handler_util.make_error_response("Access Denied", status_code=403)

		data = invoices_util.SubmitForPaymentRequest.from_dict(data)

		err = invoices_util.submit_invoices_for_payment(
			current_app.session_maker,
			current_app.sendgrid_client,
			company_id,
			data)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f"{len(data.invoice_ids)} invoice(s) sent to payor(s) for payment",
		}))


class RespondToPaymentRequestView(MethodView):

	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.INVOICE_RESPOND_TO_PAYMENT_REQUEST)
	@handler_util.catch_bad_json_request
	def post(self, event: events.Event, **kwargs: Any) -> Response:
		data = json.loads(request.data)

		data, err = invoices_util.InvoicePaymentRequestResponse.from_dict(data)
		if err:
			raise err

		with models.session_scope(current_app.session_maker) as session:
			info, err = two_factor_util.get_two_factor_link(
				data.link_val,
				current_app.app_config.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7,
				session=session)
			if err:
				raise err

			user = session.query(models.User) \
				.filter(models.User.email == info['email']) \
				.first()
			if user:
				event.user_id(user.id)

			err = invoices_util.respond_to_payment_request(
				session,
				current_app.sendgrid_client,
				info['email'],
				data)
			if err:
				raise err

			session.delete(info['link']) # type: ignore

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f"Invoice {data.invoice_id} payment status updated",
		}))
