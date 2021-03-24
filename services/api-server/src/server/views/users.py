
import json
from typing import Any, Dict, cast

from bespoke.audit import events
from bespoke.companies import create_user_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('purchase_order', __name__)

class CreateLoginView(MethodView):
	"""
	Create login should be created once a bank-admin adds a user to the
	system or when a company admin adds their own users to the system
	"""
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOGIN_CREATE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)
		cfg = cast(Config, current_app.app_config)

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['company_id', 'user_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in respond to create login')

		user_session = UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		# TODO(dlluncor): Better create password mechanism
		code = security_util.mfa_code_generator()
		password = f'${code}!'
		password = password[0:3] + 'a' + password[3:5] + 'z'
		user_email = ''

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == form['user_id']).first()
			if not existing_user:
				return handler_util.make_error_response('No user id found')

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
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class CreateBankCustomerUserView(MethodView):
	"""
	Creates a user under a Bank or a Customer account.
	"""
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'user',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		user_id, err = create_user_util.create_bank_or_customer_user(
			cast(create_user_util.CreateBankCustomerInputDict, form),
			current_app.session_maker,
		)

		if err:
			return handler_util.make_error_response(err)

		# TODO(dlluncor): Better create password mechanism
		code = security_util.mfa_code_generator()
		password = f'${code}!'
		password = password[0:3] + 'a' + password[3:5] + 'z'
		user_email = ''

		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)
		cfg = cast(Config, current_app.app_config)

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == user_id).first()
			if not existing_user:
				return handler_util.make_error_response('No user id found')

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
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class CreatePayorVendorUserView(MethodView):
	"""
	Creates a user under a Payor or a Vendor account.
	"""
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'is_payor',
			'company_id',
			'user',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing key {key} in request')

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		is_payor = form['is_payor']

		create_user_resp, err = create_user_util.create_third_party_user(
			cast(create_user_util.CreateThirdPartyUserInputDict, form),
			current_app.session_maker,
			is_payor=is_payor,
		)

		if err:
			return handler_util.make_error_response(err)

		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

		company_id = form['company_id']
		first_name = form['user']['first_name']
		last_name = form['user']['last_name']
		email = form['user']['email']

		with session_scope(current_app.session_maker) as session:
			company = cast(
				models.Company,
				session.query(models.Company) \
					.filter(models.Company.id == company_id) \
					.first())

			if is_payor:
				template_name = sendgrid_util.TemplateNames.USER_PAYOR_INVITED_TO_PLATFORM
				template_data = {
					'user_full_name': f"{first_name} {last_name}",
					'payor_name': company.name,
				}
			else:
				template_name = sendgrid_util.TemplateNames.USER_VENDOR_INVITED_TO_PLATFORM
				template_data = {
					'user_full_name': f"{first_name} {last_name}",
					'vendor_name': company.name,
				}

			recipients = [email]
			_, err = sendgrid_client.send(
				template_name, template_data, recipients)
			if err:
				return handler_util.make_error_response(err)

		create_user_resp['status'] = 'OK'
		return make_response(json.dumps(create_user_resp))

handler.add_url_rule(
	'/create_login', view_func=CreateLoginView.as_view(name='create_login_view'))

handler.add_url_rule(
	'/create_bank_customer_user', view_func=CreateBankCustomerUserView.as_view(name='create_bank_customer_user_view'))

handler.add_url_rule(
	'/create_payor_vendor_user', view_func=CreatePayorVendorUserView.as_view(name='create_payor_vendor_user_view'))
