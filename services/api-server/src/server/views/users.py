
import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from mypy_extensions import TypedDict
from typing import cast

from server.config import Config
from bespoke.db import models
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util
from server.config import Config
from server.views.common.auth_util import UserSession
from server.views.common import auth_util, handler_util

handler = Blueprint('purchase_order', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


class CreateLoginView(MethodView):
	"""
			Create login should be created once a bank-admin adds a user to the system
			or when a company admin adds their own users to the system
	"""
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['company_id', 'user_id']

		for key in required_keys:
			if key not in form:
				return make_error_response(f'Missing {key} in respond to create login')

		user_session = UserSession.from_session()
		
		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return make_error_response('Access Denied')

		# TODO(dlluncor): Better create password mechanism
		code = security_util.mfa_code_generator()
		password = f'${code}!'
		password = password[0:3] + 'a' + password[3:5] + 'z'
		user_email = ''

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == form['user_id']).first()
			if not existing_user:
				return make_error_response('No user id found')

			existing_user.password = security_util.hash_password(
				cfg.PASSWORD_SALT, password)
			user_email = existing_user.email

		template_name = sendgrid_util.TemplateNames.USER_INVITED_TO_PLATFORM
		template_data = {
			'email': user_email,
			'password': password,
		}
		recipients = [user_email]
		_, err = sendgrid_client.send(
			template_name, template_data, recipients)
		if err:
			return make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


handler.add_url_rule(
	'/create_login', view_func=CreateLoginView.as_view(name='create_login_view'))
