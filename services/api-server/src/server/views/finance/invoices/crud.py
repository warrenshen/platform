import json
import logging
from typing import Any, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.db import models
from bespoke.finance.invoices import invoices_util
from flask import Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util


class CreateInvoiceView(MethodView):

	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.INVOICE_CREATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		request_data = json.loads(request.data)
		data, err = invoices_util.UpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.invoice.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

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

	@events.wrap(events.Actions.INVOICE_UPDATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		company_id = user_session.get_company_id()

		request_data = json.loads(request.data)
		data, err = invoices_util.UpsertRequest.from_dict(request_data)
		if err:
			return handler_util.make_error_response(err)

		if not user_session.is_bank_or_this_company_admin(data.invoice.company_id):
			return handler_util.make_error_response("Access Denied", status_code=403)

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

class DeleteInvoiceView(MethodView):
	decorators = [auth_util.login_required]

	# @events.wrap(events.Actions.PURCHASE_ORDER_DELETE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		invoice_id = data['invoice_id']

		if not invoice_id:
			raise errors.Error('No Invoice ID provided')

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			invoice = cast(
				models.Invoice,
				session.query(models.Invoice).filter_by(
					id=invoice_id
				).first())

			if not user_session.is_bank_or_this_company_admin(str(invoice.company_id)):
				return handler_util.make_error_response('Access Denied')

			if (
				invoice.requested_at or
				invoice.approved_at or
				invoice.rejected_at
			):
				raise errors.Error('Invoice is not a draft')

			if invoice.is_deleted:
				raise errors.Error('Invoice is already deleted')

			invoice.is_deleted = True

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Invoice {} deleted'.format(invoice_id)
		}), 200)
