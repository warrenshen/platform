import datetime
import json

from bespoke.db import models
from bespoke.db.models import session_scope
from datetime import timezone, timedelta
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.orm.attributes import flag_modified
from typing import cast, Callable, Dict, Tuple

from bespoke.db import db_constants
from bespoke.date import date_util
from bespoke import errors
from bespoke.email import sendgrid_util
from bespoke.security import security_util, two_factor_util
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('two_factor', __name__)


class SendSMSCodeView(MethodView):

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sms_client = cast(two_factor_util.SMSClient, current_app.sms_client)
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['link_val']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} send code request')

		link_val = form['link_val']

		with session_scope(current_app.session_maker) as session:
			two_factor_info, err = two_factor_util.get_two_factor_link(
				link_val, cfg.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7, session=session)
			if err:
				return handler_util.make_error_response(err)

			two_factor_link = two_factor_info['link']
			email = two_factor_info['email']
			token_states_dict = cast(Dict, two_factor_link.token_states)
			if email not in token_states_dict:
				return handler_util.make_error_response('Invalid email for link provided')

			existing_user = session.query(models.User) \
				.filter(models.User.email == email) \
				.first()
			if not existing_user:
				return handler_util.make_error_response('No user found matching email "{}"'.format(email))
			
			link_type = cast(Dict, two_factor_link.form_info).get('type', '')
			if link_type == db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
				# Forgot your password links dont require 2FA
				return make_response(json.dumps({
					'status': 'OK',
					'phone_number': '',
					'link_type': link_type
				}))

			# Look up the phone number for this user
			to_phone_number = existing_user.phone_number
			if not to_phone_number:
				return handler_util.make_error_response('A phone number must first be specified for the user associated with email "{}"'.format(email))

			token_val = security_util.mfa_code_generator()

			token_states_dict[email] = {
				'token_val': token_val,
				'expires_in': date_util.datetime_to_str(date_util.now() + timedelta(minutes=5))
			}
			cast(Callable, flag_modified)(two_factor_link, 'token_states')

		# Send two-factor code via SMS for everyone
		_, err = sms_client.send_text_message(
			to_=to_phone_number,
			msg='Your Bespoke two-factor code is {}'.format(token_val)
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'phone_number': to_phone_number,
			'link_type': link_type
		}), 200)


def _approve_code(provided_token_val: str, two_factor_info: two_factor_util.TwoFactorInfoDict) -> Tuple[bool, errors.Error]:
		if not provided_token_val:
			return None, errors.Error('No token value provided from the SMS message')

		two_factor_link = two_factor_info['link']
		email = two_factor_info['email']
		token_states_dict = cast(Dict, two_factor_link.token_states)

		if email not in token_states_dict:
			return None, errors.Error('Not a valid email for this secure link')

		token_dict = token_states_dict[email]
		token_val = token_dict['token_val']

		# NOTE: Handle expiration times for tokens
		expires_datetime = date_util.load_datetime_str(token_dict['expires_in'])
		if date_util.now() > expires_datetime: 
			return None, errors.Error('Token has expired, please request a new one')

		if provided_token_val != token_val:
			return None, errors.Error('Provided token value is not correct')

		return True, None


class GetSecureLinkPayloadView(MethodView):
	# Decodes the secure link value and then returns the payload associated with it.

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		link_signed_val = form.get('val')
		if not link_signed_val:
			return handler_util.make_error_response('Link provided is empty')

		provided_token_val = form.get('provided_token_val')
		company_id = None
		form_info = None

		with session_scope(current_app.session_maker) as session:
			two_factor_info, err = two_factor_util.get_two_factor_link(
				link_signed_val, cfg.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7, session=session)
			if err:
				return handler_util.make_error_response(err)

			two_factor_link = two_factor_info['link']
			form_info = cast(Dict, two_factor_link.form_info)
			if not form_info:
				return handler_util.make_error_response('No form information associated with this link')

			email = two_factor_info['email']
			user = cast(models.User, session.query(models.User).filter(
				models.User.email == email).first())
			if not user:
				return handler_util.make_error_response('User opening this link does not exist in the system at all')

			link_type = form_info.get('type')

			if link_type != db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
				# Forgot password links dont need code approval
				success, err = _approve_code(provided_token_val, two_factor_info)
				if err:
					return handler_util.make_error_response(err)

			company_id = user.company_id

		access_token = None
		refresh_token = None

		if link_type in db_constants.REVIEWER_LINK_TYPE_TO_ROLE:
			user_role = db_constants.REVIEWER_LINK_TYPE_TO_ROLE[link_type]
			user = models.User(
				email=email,
				password='',
				id=None,
				role=user_role,
				company_id=company_id
			)
			claims_payload = auth_util.get_claims_payload(user)
			access_token = create_access_token(identity=claims_payload)
			refresh_expires_delta = datetime.timedelta(minutes=15)
			refresh_token = create_refresh_token(
				identity=claims_payload, expires_delta=refresh_expires_delta)
		elif link_type == db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
			pass
		else:
			return handler_util.make_error_response('Could not handle unknown payload type {}'.format(form_info.get('type')))

		return make_response(json.dumps({
			'status': 'OK',
			'form_info': form_info,
			'link_val': link_signed_val,
			'access_token': access_token,
			'refresh_token': refresh_token
		}), 200)


handler.add_url_rule(
	'/get_secure_link_payload', view_func=GetSecureLinkPayloadView.as_view(name='get_secure_link_payload_view'))

handler.add_url_rule(
	'/send_sms_code', view_func=SendSMSCodeView.as_view(name='send_sms_code_view'))
