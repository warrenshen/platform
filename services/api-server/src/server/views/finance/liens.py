import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from typing import cast

from bespoke.external.fcs import fcs_util
from server.config import Config
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('liens', __name__)

class CheckDebtorsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)

		if not request.data:
			return handler_util.make_error_response('No data provided')

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		if 'company_name' not in form:
			return handler_util.make_error_response('No company_name provided')

		if 'state_code' not in form:
			return handler_util.make_error_response('No state code provided')

		fcs_config = cfg.get_fcs_config()
		access_token = fcs_util.get_access_token(fcs_config)
		debtors_resp, err = fcs_util.check_debtors(
			fcs_config, 
			access_token=access_token, 
			state_code=form['state_code'],
			company_name=form['company_name']
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'debtors_resp': debtors_resp
		}), 200)

handler.add_url_rule(
	'/check_debtors', view_func=CheckDebtorsView.as_view(name='check_debtors_view'))
