import json
import logging
import os
from typing import Any

from bespoke.db.seed import setup_db_test
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import is_development_env, is_test_env

handler = Blueprint('cypress', __name__)

class ResetDatabaseView(MethodView):

	def post(self, **kwargs: Any) -> Response:
		if (
			not is_test_env(os.environ.get('FLASK_ENV')) and
			not is_development_env(os.environ.get('FLASK_ENV'))
		):
			logging.warning(f'Reset database not allowed in {os.environ.get("FLASK_ENV")} env...')
			return make_response(json.dumps({
				'status': 'ERROR',
				'msg': 'Failure: this action is only allowed in development and test environments',
			}))

		logging.info('Reset database in progress...')
		setup_db_test(current_app)
		logging.info('Reset database complete...')

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
		}))


handler.add_url_rule(
	'/reset_database',
	view_func=ResetDatabaseView.as_view(name='reset_database_view'),
)
