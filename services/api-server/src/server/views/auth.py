import json

from flask import Response, Blueprint
from flask import current_app, request, make_response
from flask.views import MethodView
from flask_jwt_extended import (
	create_access_token, create_refresh_token, jwt_required, 
	jwt_refresh_token_required, get_jwt_identity, get_raw_jwt
)

from bespoke.db import models
from bespoke.db.models import session_scope

handler = Blueprint('auth', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class RegistrationView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)
		# TODO: password should be hashed
		user = models.User(
			username=data['username'],
			password=data['password']
		)

		# TODO: check if user already exists

		try:
			with session_scope(current_app.session_maker) as session:
				session.add(user)

			access_token = create_access_token(identity=data['username'])
			refresh_token = create_refresh_token(identity=data['username'])
		except Exception as e:
			return make_error_response('{}'.format(e))

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'User {} created'.format(data['username']),
			'access_token': access_token,
			'refresh_token': refresh_token
		}), 200)

class LoginView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(models.User.username == data['username']).first()
			if not user:
				return make_error_response(f'User {data["username"]} does not exist')

			# TODO: check pw via hash
			if data['password'] != user.password:
				return make_error_response(f'Invalid password provided')

		access_token = create_access_token(identity=data['username'])
		refresh_token = create_refresh_token(identity=data['username'])

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Logged in as {}'.format(data['username']),
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
