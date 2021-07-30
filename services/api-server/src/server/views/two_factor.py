import datetime
import json
from dateutil import parser

from bespoke.db import models
from bespoke.db.models import session_scope
from datetime import timezone, timedelta
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.orm.session import Session
from typing import cast, Callable, Dict, Tuple

from bespoke.db import db_constants
from bespoke.date import date_util
from bespoke import errors
from bespoke.email import sendgrid_util
from bespoke.security import security_util, two_factor_util
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('two_factor', __name__)

def _get_artifact_name(form_info: Dict, session: Session) -> str:
	payload = form_info.get('payload')
	if not payload:
		return ''

	purchase_order_id = payload.get('purchase_order_id')
	if purchase_order_id:
		purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.id == purchase_order_id).first())
		if not purchase_order:
			return ''

		return f'PO {purchase_order.order_number}'

	invoice_id = payload.get('invoice_id')
	if invoice_id:
		invoice = cast(
			models.Invoice,
			session.query(models.Invoice).filter(
				models.Invoice.id == invoice_id).first())
		if not invoice:
			return ''

		return f'Invoice {invoice.invoice_number}'

	return ''

class SendCodeView(MethodView):
	"""
		Sends either an email or SMS to authenticate via two factor.
	"""

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sms_client = cast(two_factor_util.SMSClient, current_app.sms_client)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		form = json.loads(request.data)
		if not form:
			raise errors.Error('No data provided')

		required_keys = ['link_val']
		for key in required_keys:
			if key not in form:
				raise errors.Error(f'Missing {key} send code request')

		link_val = form['link_val']

		with session_scope(current_app.session_maker) as session:
			two_factor_info, err = two_factor_util.get_two_factor_link(
				link_val, cfg.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7, session=session)
			if err:
				raise err

			two_factor_link = two_factor_info['link']
			email = two_factor_info['email']
			token_states_dict = cast(Dict, two_factor_link.token_states)
			if email not in token_states_dict:
				raise errors.Error('Invalid email for link provided')

			existing_user = session.query(models.User) \
				.filter(models.User.email == email) \
				.first()
			if not existing_user:
				raise errors.Error('No user found matching email "{}"'.format(email))

			form_info = cast(Dict, two_factor_link.form_info)
			link_type = form_info.get('type', '')

			if link_type == db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
				# Forgot your password links don't require 2FA
				return make_response(json.dumps({
					'status': 'OK',
					'phone_number': '',
					'link_type': link_type
				}))

			company_settings = session.query(models.CompanySettings) \
				.filter(models.CompanySettings.company_id == existing_user.company_id) \
				.first()
			if not company_settings:
				raise errors.Error('No company settings associated with your user. Cannot proceed')

			token_val = security_util.mfa_code_generator()

			# Send two-factor code via SMS for everyone
			to_phone_number = ''
			message_method = 'phone'

			if company_settings.two_factor_message_method == 'email':
				artifact_name = _get_artifact_name(form_info, session)

				message_method = 'email'
				_, err = sendgrid_client.send(
					sendgrid_util.TemplateNames.USER_TWO_FACTOR_CODE,
					template_data={
						'artifact_name': artifact_name,
						'token_val': token_val,
					},
					recipients=[email],
				)
				if err:
					raise err
			else:
				# Look up the phone number for this user and send that message
				to_phone_number = existing_user.phone_number
				if not to_phone_number:
					raise errors.Error('A phone number must first be specified for the user associated with email "{}"'.format(email))

				_, err = sms_client.send_text_message(
					to_=to_phone_number,
					msg=f'Bespoke Financial authentication code: {token_val}'
				)
				if err:
					raise err

			# Save two-factor code secret in the DB
			token_states_dict[email] = {
				'token_val': token_val,
				'expires_in': date_util.datetime_to_str(date_util.now() + timedelta(minutes=5))
			}
			cast(Callable, flag_modified)(two_factor_link, 'token_states')

		return make_response(json.dumps({
			'status': 'OK',
			'phone_number': to_phone_number,
			'email': email,
			'message_method': message_method,
			'link_type': link_type
		}), 200)


def _approve_code(provided_token_val: str, two_factor_info: two_factor_util.TwoFactorInfoDict) -> Tuple[bool, errors.Error]:
		if not provided_token_val:
			return None, errors.Error('2FA code is missing: please submit code')

		two_factor_link = two_factor_info['link']
		email = two_factor_info['email']
		token_states_dict = cast(Dict, two_factor_link.token_states)

		if email not in token_states_dict:
			return None, errors.Error('Not a valid email for this secure link')

		token_dict = token_states_dict[email]
		token_val = token_dict['token_val']

		# NOTE: Handle expiration times for tokens
		# We want to give the expires_in a timezone, so we default it to UTC
		expires_datetime = parser.parse(token_dict['expires_in']).replace(tzinfo=datetime.timezone.utc)
		if date_util.now() > expires_datetime: 
			return None, errors.Error('2FA code is expired: please request a new one')

		if provided_token_val != token_val:
			return None, errors.Error('2FA code is incorrect: please try again or request a new one')

		return True, None


class GetSecureLinkPayloadView(MethodView):
	# Decodes the secure link value and then returns the payload associated with it.

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		link_signed_val = form.get('val')
		if not link_signed_val:
			raise errors.Error('Link provided is empty')

		provided_token_val = form.get('provided_token_val')
		company_id = None
		form_info = None

		with session_scope(current_app.session_maker) as session:
			two_factor_info, err = two_factor_util.get_two_factor_link(
				link_signed_val, cfg.get_security_config(),
				max_age_in_seconds=security_util.SECONDS_IN_DAY * 7, session=session)
			if err:
				raise err

			two_factor_link = two_factor_info['link']
			form_info = cast(Dict, two_factor_link.form_info)
			if not form_info:
				raise errors.Error('No form information associated with this link')

			email = two_factor_info['email']
			user = cast(models.User, session.query(models.User).filter(
				models.User.email == email).first())
			if not user:
				raise errors.Error('User opening this link does not exist in the system at all')

			link_type = form_info.get('type')

			if link_type != db_constants.TwoFactorLinkType.FORGOT_PASSWORD:
				# Forgot password links dont need code approval
				success, err = _approve_code(provided_token_val, two_factor_info)
				if err:
					raise err

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
			raise errors.Error('Could not handle unknown payload type {}'.format(form_info.get('type')))

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
	'/send_code', view_func=SendCodeView.as_view(name='send_code_view'))
