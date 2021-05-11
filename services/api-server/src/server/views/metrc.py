import json
from datetime import timedelta
from typing import Any, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.db import db_constants, models, models_util
from bespoke.db.models import session_scope
from bespoke.metrc import metrc_util
from dateutil import parser
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('metrc', __name__)

class GetTransfersView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'license_id', 'start_date', 'end_date'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		us_state = form.get('us_state', 'CA')
		state_to_vendor_key = {
			'CA': cfg.METRC_VENDOR_KEY_CA
		}

		if us_state not in state_to_vendor_key:
			return handler_util.make_error_response('{} is not supported as a US state'.format(us_state))

		vendor_key = state_to_vendor_key[us_state]

		auth_dict = metrc_util.AuthDict(
			vendor_key=vendor_key,
			user_key=cfg.METRC_USER_KEY
		)
		rest = metrc_util.REST(
			auth_dict,
			license_id=form['license_id'],
			us_state=us_state
		)

		start_date_str = form.get('start_date')
		end_date_str = form.get('end_date')

		start_date = parser.parse(start_date_str)
		end_date = parser.parse(end_date_str)

		cur_date = start_date
		all_transfers_rows: List[List[str]] = []
		all_transfer_package_rows: List[List[str]] = []

		while cur_date <= end_date:
			cur_date_str = cur_date.strftime('%m/%d/%Y')
			resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
			transfers = json.loads(resp.content)
			cur_date = cur_date + timedelta(days=1)
			transfers_obj = metrc_util.Transfers.build(transfers)
			include_transfers_header = len(all_transfers_rows) == 0
			transfers_rows = transfers_obj.to_rows(include_header=include_transfers_header)
			all_transfers_rows.extend(transfers_rows)

			transfer_ids = transfers_obj.get_delivery_ids()
			for transfer_id in transfer_ids:
				resp = rest.get(f'/transfers/v1/delivery/{transfer_id}/packages')
				t_packages_json = json.loads(resp.content)

				transfer_packages = metrc_util.TransferPackages(transfer_id, t_packages_json)
				include_packages_header = len(all_transfer_package_rows) == 0
				all_transfer_package_rows.extend(transfer_packages.to_rows(
					include_header=include_packages_header))

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'transfer_rows': all_transfers_rows,
				'transfer_package_rows': all_transfer_package_rows
			},
		}), 200)

handler.add_url_rule(
	'/get_transfers', view_func=GetTransfersView.as_view(name='get_transfers_view'))

