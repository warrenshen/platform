import json
import logging

import json
import logging

from server.views.common import auth_util, handler_util
from bespoke.finance.invoices import invoices_util
from bespoke.date import date_util
from bespoke.finance import number_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.email import sendgrid_util
from bespoke.security import two_factor_util, security_util

from flask import Response, current_app, make_response, request
from flask.views import MethodView

class SubmitForPaymentView(MethodView):

	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()

		if not user_session.is_company_admin():
			return handler_util.make_error_response("Access Denied", status_code=403)

		data = invoices_util.SubmitForPaymentRequest.from_dict(json.loads(request.data))

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

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		data, err = invoices_util.InvoicePaymentRequestResponse.from_dict(json.loads(request.data))
		if err:
			return handler_util.make_error_response(err)

		with models.session_scope(current_app.session_maker) as session:
			info, err = two_factor_util.get_two_factor_link(
				data.link_val,
				current_app.app_config.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7,
				session=session)
			if err:
				return handler_util.make_error_response(err)

			err = invoices_util.respond_to_payment_request(
				session,
				current_app.sendgrid_client,
				info['email'],
				data)
			if err:
				return handler_util.make_error_response(err)

			session.delete(info['link']) # type: ignore

		return make_response(json.dumps({
			'status': 'OK',
			'msg': f"Invoice {data.invoice_id} payment status updated",
		}))
