import json
import logging

from server.views.common import auth_util, handler_util
from bespoke.finance.invoices import invoices_util
from bespoke.db import models

from flask import Response, current_app, make_response, request
from flask.views import MethodView

class CreateInvoiceView(MethodView):

	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()

		if not user_session.is_company_admin():
			return handler_util.make_error_response("Access Denied", status_code=403)

		data = invoices_util.Request.from_dict(json.loads(request.data))
		if user_session.is_company_admin() and data.invoice.company_id != company_id:
			return handler_util.make_error_response("Mismatched company ids")

		invoice, files, err = invoices_util.create_invoice(current_app.session_maker, data)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'invoice': models.safe_serialize(invoice),
				'files': files,
			}
		}))

class UpdateInvoiceView(MethodView):

	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()

		if not user_session.is_company_admin():
			return handler_util.make_error_response("Access Denied", status_code=403)

		data = invoices_util.Request.from_dict(json.loads(request.data))
		if user_session.is_company_admin() and data.invoice.company_id != company_id:
			return handler_util.make_error_response("Mismatched company ids")

		# Assert that this invoice belongs to the company
		if user_session.is_company_admin():
			try:
				with models.session_scope(current_app.session_maker) as session:
					invoice = session.query(models.Invoice).get(data.invoice.id)
					assert str(invoice.company_id) == company_id
			except Exception as e:
				logging.exception("Failed checking that invoice belongs to company")
				return handler_util.make_error_response("Invoice does not belong to company admin")

		invoice_dict, files, err = invoices_util.update_invoice(current_app.session_maker, data)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'invoice': models.safe_serialize(invoice_dict),
				'files': files,
			}
		}))
