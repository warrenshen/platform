import json
from datetime import timedelta
from typing import Any, List, Iterable, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import licenses_util
from bespoke.companies.licenses_util import CompanyLicenseInsertInputDict
from bespoke.db import db_constants, models, models_util
from bespoke.db.models import session_scope
from dateutil import parser
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('licenses_api', __name__)

class BulkUpdateLicensesView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_licenses'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		company_license_inputs = form['company_licenses']
		input_chunks = cast(Iterable[List[CompanyLicenseInsertInputDict]], 
												models_util.chunker(company_license_inputs, size=20))

		for cur_license_inputs in input_chunks:
			with session_scope(current_app.session_maker) as session:
				company_license_ids, err = licenses_util.bulk_update_licenses(
					company_license_inputs=cur_license_inputs,
					session=session
				)
				if err:
					raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/bulk_update_licenses', view_func=BulkUpdateLicensesView.as_view(name='bulk_update_licenses_view'))