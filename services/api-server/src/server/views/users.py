import json
from typing import Any, Dict, cast
import logging

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import create_user_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
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

		password = security_util.generate_temp_password()
		user_email = ''

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == form['user_id']).first()
			if not existing_user:
				return handler_util.make_error_response('No user id found')

			auth_util.create_login_for_user(existing_user, password)
			user_email = existing_user.email.strip()

			template_data = {
				'email': user_email,
				'password': password,
				'app_link': cfg.BESPOKE_DOMAIN,
			}
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.USER_INVITED_TO_PLATFORM,
				template_data=template_data,
				recipients=[user_email],
			)
			if err:
				raise err

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
			cast(create_user_util.CreateBankOrCustomerUserInputDict, form),
			current_app.session_maker,
			user_session.get_user_id()
		)

		if err:
			return handler_util.make_error_response(err)

		with session_scope(current_app.session_maker) as session:
			existing_user = session.query(models.User).filter(
				models.User.id == user_id).first()
			if not existing_user:
				return handler_util.make_error_response('No user id found')

			if not existing_user.role == db_constants.UserRoles.COMPANY_CONTACT_ONLY:
				password = security_util.generate_temp_password()
				user_email = ''

				sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
				cfg = cast(Config, current_app.app_config)

				existing_user.password = security_util.hash_password(
					cfg.PASSWORD_SALT, password)
				user_email = existing_user.email.strip()

				template_data = {
					'email': user_email,
					'password': password,
					'app_link': cfg.BESPOKE_DOMAIN,
				}
				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.USER_INVITED_TO_PLATFORM,
					template_data=template_data,
					recipients=[user_email],
				)
				if err:
					raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

# This view is deprecated and is no longer used.
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
		email = form['user']['email'].strip()

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
				raise err

		create_user_resp['status'] = 'OK'
		return make_response(json.dumps(create_user_resp))

# This view is deprecated and is no longer used.
class UpdatePayorVendorUserView(MethodView):
	"""
	Updates a user under a Payor or a Vendor account.
	"""
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'user_id',
			'user',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing key {key} in request')

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		create_user_resp, err = create_user_util.update_third_party_user(
			cast(create_user_util.UpdateThirdPartyUserInputDict, form),
			current_app.session_maker,
		)

		if err:
			return handler_util.make_error_response(err)

		create_user_resp['status'] = 'OK'
		return make_response(json.dumps(create_user_resp))


class DeactivateCustomerUserView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'user_id',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		if form['user_id'] == user_session.get_user_id():
			raise errors.Error('Cannot deactivate one\'s own account')

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(
				models.User.id == form['user_id']).first()
			if not user:
				return handler_util.make_error_response('No user found associated with this user_id')

			if not user_session.is_bank_or_this_company_admin(str(user.company_id)):
				raise errors.Error('Access Denied')

			user.is_deleted = True

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ReactivateCustomerUserView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'user_id',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			user = session.query(models.User).filter(
				models.User.id == form['user_id']).first()
			if not user:
				return handler_util.make_error_response('No user found associated with this user_id')

			if not user_session.is_bank_or_this_company_admin(str(user.company_id)):
				raise errors.Error('Access Denied')

			user.is_deleted = False

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class UpdateUserView(MethodView):
    decorators = [auth_util.login_required]

    @handler_util.catch_bad_json_request
    def post(self, **kwargs: Any) -> Response:
        logging.info("Updating user")
        form = json.loads(request.data)
        if not form:
            return handler_util.make_error_response("No data provided")
        variables = form.get("variables", None)

        user_id = variables.get("id", None) if variables else None
        if not user_id:
            return handler_util.make_error_response("userId is required to be set for this request")

        email = variables.get("email", None)
        if not email:
            return handler_util.make_error_response("email is required to be set for this request")
        else:
        	email = email.strip()

        first_name = variables.get("first_name", None)
        if not first_name:
            return handler_util.make_error_response("firstName is required to be set for this request")

        last_name = variables.get("last_name", None)
        if not last_name:
            return handler_util.make_error_response("lastName is required to be set for this request")

        role = variables.get("role", None)
        if not role:
            return handler_util.make_error_response("role is required to be set for this request")

        edited_company_roles = variables.get("company_role_new", None)

        other_role = variables.get("other_role", None)

        with models.session_scope(current_app.session_maker) as session:
            user = cast(
                models.User,
                session.query(models.User).filter(
                	models.User.id==user_id
                ).first(),
            )

            if not user:
                return handler_util.make_error_response("Invalid user id provided")

            if email and email != user.email:
				# Check if there is already a user with this email
                if cast(
					models.User,
					session.query(models.User).filter_by(email=email).first(),
				):
                    return handler_util.make_error_response("User with email already exists")
                user.email = email
            if user.company_role_new == None:
	            user.company_role_new = {
	    			"other_role": [],
	    			"customer_roles": [],
	    			"bespoke_roles": []
	    			}
	    			
            new_company_roles = json.loads(json.dumps(user.company_role_new))
            new_company_roles["customer_roles"] = edited_company_roles
            new_company_roles["other_role"] = other_role

            user.first_name = first_name
            user.last_name = last_name
            user.role = role
            user.company_role = variables.get("company_role", None)
            user.company_role_new = new_company_roles
            phone_number = variables.get("phone_number", None)
            if phone_number:
                user.phone_number = phone_number

        return make_response(
            json.dumps(
                {"status": "OK", "resp": "Successfully updated the user."}
            )
        )

handler.add_url_rule(
	'/create_login', view_func=CreateLoginView.as_view(name='create_login_view'))

handler.add_url_rule(
	'/create_bank_customer_user', view_func=CreateBankCustomerUserView.as_view(name='create_bank_customer_user_view'))

handler.add_url_rule(
	'/create_payor_vendor_user', view_func=CreatePayorVendorUserView.as_view(name='create_payor_vendor_user_view'))

handler.add_url_rule(
	'/update_payor_vendor_user', view_func=UpdatePayorVendorUserView.as_view(name='update_payor_vendor_user_view'))

handler.add_url_rule(
	'/deactivate_customer_user', view_func=DeactivateCustomerUserView.as_view(name='deactivate_customer_user_view'))

handler.add_url_rule(
	'/reactivate_customer_user', view_func=ReactivateCustomerUserView.as_view(name='reactivate_customer_user_view'))

handler.add_url_rule(
    '/update_user', view_func=UpdateUserView.as_view(name='update_user_view'))
