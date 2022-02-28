import datetime
import json
from typing import Callable, Dict, List, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util, two_factor_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt_identity, get_raw_jwt,
                                jwt_refresh_token_required)
from server.config import Config
from server.views.common import auth_util, handler_util, session_util

handler = Blueprint('auth', __name__)

# NOTE: There is no SignUpView because users will always respond to an invite
# request to join the platform.
#
# Currently, the user has to use the temporary password, and then manually
# change it themselves using ResetPassword.

class SignInView(MethodView):

	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		security_cfg = cfg.get_security_config()
		data = json.loads(request.data)
		email = data["email"]
		password_guess = data['password']

		if not email or not password_guess:
			return handler_util.make_error_response('No email or password provided', 401)

		with session_scope(current_app.session_maker) as session:
			user = cast(models.User, session.query(models.User).filter(
				models.User.email == email.lower()).first())
			if not user:
				return handler_util.make_error_response('User {} does not exist'.format(email), 401)

			if user.is_deleted:
				return handler_util.make_error_response('User {} does not exist'.format(email), 401)

			if not security_util.verify_password(cfg.PASSWORD_SALT, password_guess, user.password):
				return handler_util.make_error_response(f'Invalid password provided', 401)

			parent_company_id = str(user.parent_company_id) if user.parent_company_id else None # Note: bank users do not have a parent company.
			company_id = None # Note: bank users do not have a company.

			if parent_company_id:
				parent_company = cast(
					models.ParentCompany,
					session.query(models.ParentCompany).filter(
						models.ParentCompany.id == parent_company_id
					).first())

				if not parent_company:
					return handler_util.make_error_response('No parent company found')

				companies = cast(
					List[models.Company],
					session.query(models.Company).filter(
						models.Company.parent_company_id == parent_company.id
					).all())

				if not companies:
					return handler_util.make_error_response('No companies found')

				company_id = str(companies[0].id)

			# Note: all users use simple login method in the test environment.
			is_test_env = cfg.IS_TEST_ENV
			login_method = user.login_method if not is_test_env else db_constants.LoginMethod.SIMPLE

			if login_method == db_constants.LoginMethod.SIMPLE:
				claims_payload = auth_util.get_claims_payload(user, company_id)
				access_token = create_access_token(identity=claims_payload)
				refresh_token = create_refresh_token(identity=claims_payload)

				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Logged in as {}'.format(email),
					'login_method': login_method,
					'access_token': access_token,
					'refresh_token': refresh_token
				}), 200)
			elif login_method == db_constants.LoginMethod.TWO_FA:
				link_id = two_factor_util.add_two_factor_link_to_db(
					user_emails=[email],
					form_info=models.TwoFactorFormInfoDict(
						type=db_constants.TwoFactorLinkType.LOGIN,
						payload={}
					),
					expires_at=date_util.hours_from_today(1),
					session_maker=current_app.session_maker
				)

				secure_link = two_factor_util.get_url_to_prompt_user(
					security_cfg=security_cfg,
					link_id=link_id,
					user_email=email,
					is_url_relative=True,
				)
				return make_response(json.dumps({
					'status': 'OK',
					'login_method': login_method,
					'two_factor_link': secure_link
				}), 200)
			else:
				return handler_util.make_error_response('Invalid login method associated with user "{}"'.format(user.login_method))


class ForgotPasswordView(MethodView):
	"""
		POST request that handles sending a link to the user's email to reset
		their password.
	"""

	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		security_cfg = cfg.get_security_config()
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)
		email = data.get('email')

		if not email:
			return handler_util.make_error_response('No email provided', 401)

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(
				models.User.email == email.lower()).first()
			if not user or not user.role:
				raise errors.Error(f'An account with email "{email}" does not exist', http_code=401)

			if user.is_deleted:
				raise errors.Error(f'An account with email "{email}" does not exist', http_code=401)

		sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.USER_FORGOT_PASSWORD,
			template_data={},
			recipients=[email],
			two_factor_payload=sendgrid_util.TwoFactorPayloadDict(
				form_info=models.TwoFactorFormInfoDict(
					type=db_constants.TwoFactorLinkType.FORGOT_PASSWORD,
					payload={}
				),
				expires_at=date_util.hours_from_today(24 * 3) # 3 days
			)
		)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ResetPasswordView(MethodView):
	"""
		POST request that handles when a user has clicked on the "Forgot Password"
		link and enters the new password they want to use.
	"""

	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		password = form.get('password')
		link_val = form.get('link_val')

		if not password or not link_val:
			return handler_util.make_error_response('No link value or password provided', 401)

		with session_scope(current_app.session_maker) as session:
			two_factor_info, err = two_factor_util.get_two_factor_link(
				link_val, cfg.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 3, session=session)
			if err:
				raise err

			two_factor_link = two_factor_info['link']
			form_info = cast(Dict, two_factor_link.form_info)
			if not form_info:
				raise errors.Error('No information associated with this form info to reset the password')

			if form_info['type'] != db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
				raise errors.Error('Invalid link type provided to reset the password')

			email = two_factor_info['email']

			user = session.query(models.User).filter(
				models.User.email == email.lower()).first()
			if not user:
				raise errors.Error('User {} does not exist'.format(email), http_code=401)

			if user.is_deleted:
				raise errors.Error('User {} does not exist'.format(email), http_code=401)

			# The user has sent back their password and a valid signed link value associated
			# with this reset password sign-in request, so now we can reset their password.

			success, errors_list = security_util.meets_password_complexity_requirements(password)
			if errors_list:
				return handler_util.make_error_response('Password does not meet complexity requirements: {}'.format(
					', '.join(['{}'.format(err) for err in errors_list])))

			user.password = security_util.hash_password(
				cfg.PASSWORD_SALT, password)
			session.commit()

			# Retire the two-factor link now it's been used.
			cast(Callable, session.delete)(two_factor_link)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class SignOutAccessView(MethodView):
	decorators = [auth_util.login_required]

	def post(self) -> Response:
		jti = get_raw_jwt()['jti']
		userId = get_raw_jwt()[
			'https://hasura.io/jwt/claims']['X-Hasura-User-Id']
		revoked_token = models.RevokedTokenModel(jti=jti, user_id=userId) # type: ignore
		try:
			with session_scope(current_app.session_maker) as session:
				if not userId:
					raise errors.Error('Token without userId.', http_code=500)
				session.add(revoked_token)
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Access token revoked',
				}), 200)
		except Exception as e:
			return handler_util.make_error_response('{}'.format(e), 500)


class SignOutRefreshView(MethodView):

	@jwt_refresh_token_required
	def post(self) -> Response:
		jti = get_raw_jwt()['jti']
		userId = get_raw_jwt()[
			'https://hasura.io/jwt/claims']['X-Hasura-User-Id']
		revoked_token = models.RevokedTokenModel(jti=jti, user_id=userId) # type: ignore
		try:
			with session_scope(current_app.session_maker) as session:
				if not userId:
					raise errors.Error('Token without userId.', http_code=500)
				session.add(revoked_token)
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Refresh token revoked',
				}), 200)
		except Exception as e:
			return handler_util.make_error_response('{}'.format(e), 500)


class TokenRefreshView(MethodView):

	@jwt_refresh_token_required
	def post(self) -> Response:
		cur_user = get_jwt_identity()
		user_session = session_util.UserSession(cur_user)
		
		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			if not existing_user:
				return handler_util.make_error_response('No user found')

			if existing_user.is_deleted:
				return handler_util.make_error_response('Access Denied')

		access_token = create_access_token(identity=cur_user)
		return make_response(json.dumps({
			'status': 'OK',
			'access_token': access_token
		}), 200)

class SwitchLocationView(MethodView):

	@jwt_refresh_token_required
	def post(self) -> Response:
		cur_user = get_jwt_identity()
		user_session = session_util.UserSession(cur_user)
		
		data = json.loads(request.data)
		company_id = data['company_id']

		user = None
		claims_payload = None

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			if not existing_user:
				return handler_util.make_error_response('No user found')

			if existing_user.is_deleted:
				return handler_util.make_error_response('Access Denied')

			existing_company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())

			if not existing_company:
				return handler_util.make_error_response('No company found')

			existing_parent_company = cast(
				models.ParentCompany,
				session.query(models.ParentCompany).filter(
					models.ParentCompany.id == existing_company.parent_company_id
				).first())

			if not existing_parent_company:
				return handler_util.make_error_response('No parent company found')

			if existing_user.parent_company_id != existing_parent_company.id:
				return handler_util.make_error_response('Access Denied')

			user = existing_user
			claims_payload = auth_util.get_claims_payload(existing_user, company_id)

		access_token = create_access_token(identity=claims_payload)
		refresh_token = create_refresh_token(identity=claims_payload)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Switched location successfully',
			'data': {
				'access_token': access_token,
				'refresh_token': refresh_token,
			},
		}), 200)

handler.add_url_rule(
	'/sign-in', view_func=SignInView.as_view(name='sign_in_view'))

handler.add_url_rule(
	'/forgot-password', view_func=ForgotPasswordView.as_view(name='forgot_password_view'))

handler.add_url_rule(
	'/reset-password', view_func=ResetPasswordView.as_view(name='reset_password_view'))

handler.add_url_rule(
	'/sign-out/access', view_func=SignOutAccessView.as_view(name='sign_out_access_view'))

handler.add_url_rule(
	'/sign-out/refresh', view_func=SignOutRefreshView.as_view(name='sign_out_refresh_view'))

handler.add_url_rule(
	'/token/refresh', view_func=TokenRefreshView.as_view(name='token_refresh_view'))

handler.add_url_rule(
	'/switch-location', view_func=SwitchLocationView.as_view(name='switch_location_view'))
