import datetime
import json
import os

from bespoke.db import models
from bespoke.db.models import session_scope
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt_identity, get_raw_jwt,
                                jwt_refresh_token_required, jwt_required)
from passlib.hash import pbkdf2_sha256 as sha256

handler = Blueprint('auth', __name__)

def make_error_response(msg: str, statusCode: int) -> Response:
    return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), statusCode)

class SignUpView(MethodView):

    def post(self) -> Response:
        data = json.loads(request.data)
        # TODO: demand minimum requirements for password strength
        # and on email requirements
        email = data['email']
        password = data['password']

        if not email or not password:
            return make_error_response('No email or password provided', 200)

        user = models.User(
            email=email,
            password=sha256.hash(os.environ.get("PASSWORD_SALT") + password)
        )

        try:
            with session_scope(current_app.session_maker) as session:
                existing_user = session.query(models.User).filter(
                    models.User.email == email).first()
                if existing_user:
                    return make_error_response('User {} already exists. Please choose another'.format(email), 200)
                session.add(user)

            access_token = create_access_token(identity=email)
            refresh_token = create_refresh_token(identity=email)
        except Exception as e:
            return make_error_response('{}'.format(e), 200)

        return make_response(json.dumps({
            'status': 'OK',
            'msg': 'User {} created'.format(email),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200)


class SignInView(MethodView):

    def post(self) -> Response:
        data = json.loads(request.data)
        email = data["email"]
        password = data['password']

        if not email or not password:
            return make_error_response('No email or password provided', 401)

        with session_scope(current_app.session_maker) as session:
            user = session.query(models.User).filter(
                models.User.email == email).first()
            if not user:
                return make_error_response('User {} does not exist'.format(email), 401)

            if not sha256.verify(os.environ.get("PASSWORD_SALT") + password, user.password):
                return make_error_response(f'Invalid password provided', 401)

            claims_payload = {
                'X-Hasura-User-Id': str(user.id),
                'X-Hasura-Default-Role': user.role,
                'X-Hasura-Allowed-Roles': [user.role],
                'X-Hasura-Company-Id': str(user.company_id),
            }
            access_token = create_access_token(identity=claims_payload)
            refresh_token = create_refresh_token(identity=claims_payload)

            return make_response(json.dumps({
                'status': 'OK',
                'msg': 'Logged in as {}'.format(email),
                'access_token': access_token,
                'refresh_token': refresh_token
            }), 200)

class ResetPasswordView(MethodView):

	def post(self) -> Response:
		data = json.loads(request.data)
		email = "admin@bespoke.com" # TODO(dlluncor) get it from HMAC token
		password = data['password']

		if not email or not password:
			return make_error_response('No email or password provided', 401)

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(
				models.User.email == email).first()
			if not user:
				return make_error_response('User {} does not exist'.format(email), 401)

			user.password = sha256.hash(os.environ.get("PASSWORD_SALT") + password)
			session.commit()

			claims_payload = {
				'X-Hasura-User-Id': str(user.id),
				'X-Hasura-Default-Role': user.role,
				'X-Hasura-Allowed-Roles': [user.role],
				'X-Hasura-Company-Id': str(user.company_id),
			}
			access_token = create_access_token(identity=claims_payload)
			refresh_token = create_refresh_token(identity=claims_payload)

			return make_response(json.dumps({
				'status': 'OK',
				'msg': 'Logged in as {}'.format(email),
				'access_token': access_token,
				'refresh_token': refresh_token
			}), 200)

class SignOutAccessView(MethodView):

	@jwt_required # type: ignore
	def post(self) -> Response:
		jti = get_raw_jwt()['jti']
		userId = get_raw_jwt()['https://hasura.io/jwt/claims']['X-Hasura-User-Id']		
		revoked_token = models.RevokedTokenModel(jti=jti, user_id=userId)		
		try:
			with session_scope(current_app.session_maker) as session:
				if not userId:
					return make_error_response('Token without userId.', 500)
				session.add(revoked_token)
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Access token revoked',
        		}), 200)
		except Exception as e:
			return make_error_response('{}'.format(e), 500)


class SignOutRefreshView(MethodView):

	@jwt_refresh_token_required # type: ignore
	def post(self) -> Response:
		jti = get_raw_jwt()['jti']
		userId = get_raw_jwt()['https://hasura.io/jwt/claims']['X-Hasura-User-Id']
		revoked_token = models.RevokedTokenModel(jti=jti, user_id=userId)
		try:
			with session_scope(current_app.session_maker) as session:
				if not userId:
					return make_error_response('Token without userId.', 500)
				session.add(revoked_token)
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Refresh token revoked',
				}), 200)
		except Exception as e:
			return make_error_response('{}'.format(e), 500)


class TokenRefreshView(MethodView):

    @jwt_refresh_token_required  # type: ignore
    def post(self) -> Response:
        cur_user = get_jwt_identity()
        access_token = create_access_token(identity=cur_user)
        return make_response(json.dumps({
            'status': 'OK',
            'access_token': access_token
        }), 200)


class SecretView(MethodView):
    # To test that you can get access to this endpoint when you pass a JWT token

    @jwt_required  # type: ignore
    def get(self) -> Response:
        return make_response(json.dumps({'hi': 'secret view', 'answer': 42}), 200)


handler.add_url_rule(
    '/sign-up', view_func=SignUpView.as_view(name='sign_up_view'))

handler.add_url_rule(
    '/sign-in', view_func=SignInView.as_view(name='sign_in_view'))

handler.add_url_rule(
    '/reset-password', view_func=ResetPasswordView.as_view(name='reset_password_view'))

handler.add_url_rule(
    '/sign-out/access', view_func=SignOutAccessView.as_view(name='sign_out_access_view'))

handler.add_url_rule(
    '/sign-out/refresh', view_func=SignOutRefreshView.as_view(name='sign_out_refresh_view'))

handler.add_url_rule(
    '/token/refresh', view_func=TokenRefreshView.as_view(name='token_refresh_view'))

handler.add_url_rule(
    '/secret', view_func=SecretView.as_view(name='secret_view'))
