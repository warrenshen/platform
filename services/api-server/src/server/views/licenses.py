import json
from datetime import timedelta
from dateutil import parser
from typing import cast, Any, List

from bespoke import errors
from bespoke.companies import licenses_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.audit import events
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('licenses', __name__)

class UpdateLicensesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id', 'file_ids'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			license_ids, err = licenses_util.update_licenses(
				company_id=form['company_id'],
				file_ids=form['file_ids'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'license_ids': license_ids
		}), 200)

handler.add_url_rule(
	'/update_licenses', view_func=UpdateLicensesView.as_view(name='update_licenses_view'))

