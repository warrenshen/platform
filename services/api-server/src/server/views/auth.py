import json
from typing import Callable, Dict, List, cast

from bespoke import errors
from bespoke.companies import create_user_util
from bespoke.date import date_util
from bespoke.db import db_constants, models, queries
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util, two_factor_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt_identity, get_raw_jwt, jwt_required,
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
		# TODO: If a joint Customer/Vendor user logs in from PO email, show Vendor Platform Mode
		# platform_mode = data.get('platform_mode', None)

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

			# Note: bank users never have a company and customer users always have a company.
			company_id = str(user.company_id) if user.company_id else None

			# Note: all users use simple login method in the test environment.
			is_test_env = cfg.IS_TEST_ENV
			login_method = user.login_method if not is_test_env else db_constants.LoginMethod.SIMPLE

			if login_method == db_constants.LoginMethod.SIMPLE:
				claims_payload = auth_util.get_claims_payload(
					user=user,
					role=user.role,
					company_id=company_id,
				)
				access_token = create_access_token(identity=claims_payload)
				refresh_token = create_refresh_token(identity=claims_payload)

				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Logged in as {}'.format(email),
					'login_method': login_method,
					'access_token': access_token,
					'refresh_token': refresh_token,
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

		if not password:
			return handler_util.make_error_response('No password provided', 401)

		if not link_val:
			return handler_util.make_error_response('No link_val provided', 401)

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
		current_user = get_jwt_identity()
		user_session = session_util.UserSession(current_user)
		
		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first()

			if not existing_user:
				return handler_util.make_error_response('No user found')

			if existing_user.is_deleted:
				return handler_util.make_error_response('Access Denied')

		access_token = create_access_token(identity=current_user)
		return make_response(json.dumps({
			'status': 'OK',
			'access_token': access_token
		}), 200)

class ImpersonateUserView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@jwt_required
	def post(self) -> Response:
		cur_user = get_jwt_identity()
		data = json.loads(request.data)
		impersonated_user_id = data['impersonated_user_id']
		user_session = session_util.UserSession(cur_user)

		with session_scope(current_app.session_maker) as session:
			impersonator_user = cast(models.User, session.query(models.User).filter(
				models.User.id == user_session.get_user_id()
			).first())
			impersonated_user =  cast(models.User, session.query(models.User).filter(
				models.User.id == impersonated_user_id
			).first())

			if not impersonator_user:
				return handler_util.make_error_response('Impersonator user not found')

			if not impersonated_user:
				return handler_util.make_error_response('Impersonated user not found')

			if impersonator_user.is_deleted:
				return handler_util.make_error_response('Access Denied to impersonator user')

			if impersonated_user.is_deleted:
				return handler_util.make_error_response('Access Denied to impersonated user')

			claims_payload = auth_util.get_impersonator_claims_payload(
				user=impersonated_user,
				role=impersonated_user.role,
				impersonator_user_id=impersonator_user.id,
				company_id=impersonated_user.company_id,
			)
			access_token = create_access_token(identity=claims_payload)
			refresh_token = create_refresh_token(identity=claims_payload)
			return make_response(json.dumps({
				'status': 'OK',
				'access_token': access_token,
				'refresh_token': refresh_token
			}), 200)

class UndoImpersonationView(MethodView):
	@jwt_required
	def post(self) -> Response:
		data = json.loads(request.data)
		impersonator_user_id = data['impersonator_user_id']

		with session_scope(current_app.session_maker) as session:
			impersonator_user = session.query(models.User).filter(
				models.User.id == impersonator_user_id
			).first()

			if not impersonator_user:
				return handler_util.make_error_response('Impersonator user not found')

			if impersonator_user.is_deleted:
				return handler_util.make_error_response('Access Denied to impersonator user')

			claims_payload = auth_util.get_claims_payload(
				user=impersonator_user,
				role=impersonator_user.role,
				company_id=impersonator_user.company_id,
			)
			access_token = create_access_token(identity=claims_payload)
			refresh_token = create_refresh_token(identity=claims_payload)
			return make_response(json.dumps({
				'status': 'OK',
				'access_token': access_token,
				'refresh_token': refresh_token
			}), 200)

class SwitchLocationView(MethodView):

	@jwt_refresh_token_required
	def post(self) -> Response:
		cur_user = get_jwt_identity()
		user_session = session_util.UserSession(cur_user)
		
		data = json.loads(request.data)
		company_id = data['company_id']
		impersonator_user_id = data['impersonator_user_id']

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
			claims_payload = auth_util.get_impersonator_claims_payload(
				user=user,
				role=user.role,
				impersonator_user_id=impersonator_user_id,
				company_id=company_id,
			)

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

class AuthenticateBlazeUserView(MethodView):

	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'auth_key',
			'external_blaze_company_id',
			'external_blaze_shop_id',
			'external_blaze_user_id',
			'external_blaze_user_role',
			'external_blaze_user_email',
			'external_blaze_user_first_name',
			'external_blaze_user_last_name',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request data')

		auth_key = form['auth_key']
		external_blaze_company_id = form['external_blaze_company_id']
		external_blaze_shop_id = form['external_blaze_shop_id']
		external_blaze_user_id = form['external_blaze_user_id']
		external_blaze_user_role = form['external_blaze_user_role']
		external_blaze_user_email = form['external_blaze_user_email']
		external_blaze_user_first_name = form['external_blaze_user_first_name']
		external_blaze_user_last_name = form['external_blaze_user_last_name']

		if not security_util.verify_blaze_auth_payload(
			secret_key=cfg.BLAZE_SHARED_SECRET_KEY,
			auth_key=auth_key,
			external_blaze_company_id=external_blaze_company_id,
			external_blaze_shop_id=external_blaze_shop_id,
			external_blaze_user_id=external_blaze_user_id,
			external_blaze_user_role=external_blaze_user_role,
		):
			return handler_util.make_error_response(f'Invalid auth key provided', 401)

		with session_scope(current_app.session_maker) as session:
			existing_blaze_shop_entry = cast(
				models.BlazeShopEntry,
				session.query(models.BlazeShopEntry).filter(
					models.BlazeShopEntry.external_blaze_shop_id == external_blaze_shop_id
				).first())

			if existing_blaze_shop_entry:
				existing_blaze_user = cast(
					models.BlazeUser,
					session.query(models.BlazeUser).filter(
						models.BlazeUser.external_blaze_user_id == external_blaze_user_id
					).first())

				if existing_blaze_user:
					user = cast(
						models.User,
						session.query(models.User).filter(
							models.User.id == existing_blaze_user.user_id
					).first())
				else:
					# TODO(warrenshen): Use external_blaze_user_role to determine role of new user.
					user_id, err = create_user_util.create_user_with_session(
						session,
						create_user_util.CreateBankOrCustomerUserInputDict(
							company_id=str(existing_blaze_shop_entry.company_id),
							user=create_user_util.UserInsertInputDict(
								role=db_constants.UserRoles.COMPANY_ADMIN,
								first_name=external_blaze_user_first_name,
								last_name=external_blaze_user_last_name,
								email=external_blaze_user_email,
								phone_number=None,
							),
						),
						created_by_user_id=None
					)

					if err:
						return handler_util.make_error_response(err)

					user = cast(
						models.User,
						session.query(models.User).filter(
							models.User.id == user_id
						).first())

					blaze_user = models.BlazeUser()
					blaze_user.external_blaze_user_id = external_blaze_user_id
					blaze_user.user_id = user.id

					session.add(blaze_user)
					session.flush()

				claims_payload = auth_util.get_claims_payload(
					user=user,
					role=user.role,
					company_id=user.company_id,
				)
				access_token = create_access_token(identity=claims_payload)
				refresh_token = create_refresh_token(identity=claims_payload)

				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Success',
					'data': {
						'auth_status': 'borrower_active',
						'access_token': access_token,
						'refresh_token': refresh_token,
					},
				}), 200)

			existing_blaze_preapproval = cast(
				models.BlazePreapproval,
				session.query(models.BlazePreapproval).filter(
					models.BlazePreapproval.external_blaze_company_id == external_blaze_company_id
				).filter(
					models.BlazePreapproval.external_blaze_shop_id == external_blaze_shop_id
				).filter(
					models.BlazePreapproval.expiration_date >= date_util.now_as_date()
				).first())

			if not existing_blaze_preapproval:
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Success',
					'data': {
						'auth_status': 'applicant_denied',
					},
				}), 200)
			else:
				return make_response(json.dumps({
					'status': 'OK',
					'msg': 'Success',
					'data': {
						'auth_status': 'applicant_preapproved',
						'blaze_preapproval': existing_blaze_preapproval.as_json_dict(),
					},
				}), 200)


handler.add_url_rule(
	'/authenticate-blaze-user', view_func=AuthenticateBlazeUserView.as_view(name='authenticate_blaze_user_view'))

handler.add_url_rule(
	'/sign-in', view_func=SignInView.as_view(name='sign_in_view'))

handler.add_url_rule(
	'/impersonate_user', view_func=ImpersonateUserView.as_view(name='impersonate_user_view'))

handler.add_url_rule(
	'/undo_impersonation', view_func=UndoImpersonationView.as_view(name='undo_impersonation_view'))

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
