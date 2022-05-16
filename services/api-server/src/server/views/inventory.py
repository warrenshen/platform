import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView

from bespoke.metrc.analysis import inventory_util
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('inventory', __name__)

class GetCurrentInventoryView(MethodView):
	decorators = [auth_util.bank_admin_required]

	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['company_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to get current inventory')

		resp, err = inventory_util.get_active_inventory(
			form['company_id'], current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/get_current_inventory', view_func=GetCurrentInventoryView.as_view(name='get_current_inventory_view'))
