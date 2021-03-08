import json

from bespoke import errors
from bespoke.db import models
from server.views.common import handler_util

from flask import Blueprint, Response, current_app, make_response
from flask.views import MethodView


handler = Blueprint('healthcheck', __name__)


class HealthcheckView(MethodView):

	def get(self) -> Response:
		server_type = current_app.app_config.SERVER_TYPE
		try:
			with models.session_scope(current_app.session_maker) as session:
				session.execute('select 1').first()
		except:
			return handler_util.make_error_response(
				errors.Error('db connection failure'),
				status_code=500)
		return make_response(json.dumps({
			'status': 'OK',
			'server_type': server_type,
		}))


handler.add_url_rule('/', view_func=HealthcheckView.as_view(name='get_health_check'))
