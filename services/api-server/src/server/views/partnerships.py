import json
from typing import Any

from bespoke.companies import partnership_util
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('partnerships', __name__)

class UpdatePartnershipContactsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
            'is_payor',
			'partnership_id',
            'user_ids',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		is_payor = form['is_payor']
		partnership_id = form['partnership_id']
		user_ids = form['user_ids']

		with session_scope(current_app.session_maker) as session:
			success, err = partnership_util.update_partnership_contacts(
				is_payor=is_payor,
				partnership_id=partnership_id,
                user_ids=user_ids,
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
		}))


handler.add_url_rule(
	'/update_partnership_contacts', view_func=UpdatePartnershipContactsView.as_view(name='update_partnership_contacts_view'))
