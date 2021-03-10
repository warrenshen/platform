import json

from server.views.common import auth_util, handler_util
from bespoke.finance.invoices import invoices_util

from flask import Response, current_app, make_response, request
from flask.views import MethodView


class SubmitForApprovalView(MethodView):

	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		data = json.loads(request.data)
		invoice_id = data.get('id')

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

