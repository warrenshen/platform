import json
import os
import datetime

import jwt

from flask import Response, Blueprint
from flask import current_app, request, make_response
from flask.views import MethodView
from flask_jwt_extended import (
	create_access_token, create_refresh_token, jwt_required, 
	jwt_refresh_token_required, get_jwt_identity, get_raw_jwt
)
from passlib.hash import pbkdf2_sha256 as sha256
from typing import cast

from bespoke.db import models
from bespoke.db.models import session_scope
from server.config import Config

handler = Blueprint('auth', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class RegistrationView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)
		# TODO: demand minimum requirements for password strength
		# and on email requirements
		email = data['email']
		password = data['password']

		if not email or not password:
			return make_error_response('No email or password provided')

		# TODO(dlluncor): Change company_id to something other than default
		user = models.User(
			email=email,
			password=sha256.hash(os.environ.get("PASSWORD_SALT") + password),
			company_id='default'
		)

		try:
			with session_scope(current_app.session_maker) as session:
				existing_user = session.query(models.User).filter(models.User.email == email).first()
				if existing_user:
					return make_error_response('User {} already exists. Please choose another'.format(email))
				session.add(user)

			cfg = cast(Config, current_app.app_config)
			access_token = create_access_token(
				identity=email,
				expires_delta=datetime.timedelta(minutes=cfg.ACCESS_TOKEN_DURATION_MINUTES)
			)
			refresh_token = create_refresh_token(
				identity=email,
				expires_delta=datetime.timedelta(minutes=cfg.REFRESH_TOKEN_DURATION_MINUTES)
			)
		except Exception as e:
			return make_error_response('{}'.format(e))

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'User {} created'.format(email),
			'access_token': access_token,
			'refresh_token': refresh_token
		}), 200)

class LoginView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)
		email = data["email"]
		password = data['password']
		if not email or not password:
			return make_error_response('No email or password provided')

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(models.User.email == email).first()
			if not user:
				return make_error_response('User {} does not exist'.format(email))

			if not sha256.verify(os.environ.get("PASSWORD_SALT") + password, user.password):
				return make_error_response(f'Invalid password provided')

			claims_payload = {
				'X-Hasura-User-Id': str(user.id),
				'X-Hasura-Default-Role': user.role,
				'X-Hasura-Allowed-Roles': [user.role],
				'X-Hasura-Company-Id': str(user.company_id)
			}
			cfg = cast(Config, current_app.app_config)
			access_token = create_access_token(
				identity=claims_payload,
				expires_delta=datetime.timedelta(minutes=cfg.ACCESS_TOKEN_DURATION_MINUTES)
			)
			refresh_token = create_refresh_token(
				identity=claims_payload,
				expires_delta=datetime.timedelta(minutes=cfg.REFRESH_TOKEN_DURATION_MINUTES)
			)

			return make_response(json.dumps({
				'status': 'OK',
				'msg': 'Logged in as {}'.format(email),
				'access_token': access_token,
				'refresh_token': refresh_token
			}), 200)

class LogoutAccessView(MethodView):

	def post(self) -> Response:
		return make_response(json.dumps({'hi': 'logout access'}), 200)

class LogoutRefreshView(MethodView):

	def post(self) -> Response:
		return make_response(json.dumps({'hi': 'logout refresh'}), 200)

class TokenRefreshView(MethodView):

	@jwt_refresh_token_required # type: ignore
	def post(self) -> Response:
		cur_user = get_jwt_identity()
		access_token = create_access_token(identity=cur_user)
		return make_response(json.dumps({
			'status': 'OK',
			'access_token': access_token
		}), 200)

class SecretView(MethodView):
	# To test that you can get access to this endpoint when you pass a JWT token

	@jwt_required # type: ignore
	def get(self) -> Response:
		return make_response(json.dumps({'hi': 'secret view', 'answer': 42}), 200)

handler.add_url_rule(
	'/registration', view_func=RegistrationView.as_view(name='registration_view'))

handler.add_url_rule(
	'/login', view_func=LoginView.as_view(name='login_view'))

handler.add_url_rule(
	'/logout/access', view_func=LogoutAccessView.as_view(name='logout_access_view'))

handler.add_url_rule(
	'/logout/refresh', view_func=LogoutRefreshView.as_view(name='logout_refresh_view'))

handler.add_url_rule(
	'/token/refresh', view_func=TokenRefreshView.as_view(name='token_refresh_view'))

handler.add_url_rule(
	'/secret', view_func=SecretView.as_view(name='secret_view'))
