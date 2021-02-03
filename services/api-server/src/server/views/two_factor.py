import datetime
import json

from bespoke.db import models
from bespoke.db.models import session_scope
from datetime import timezone
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.orm.attributes import flag_modified
from typing import cast

from bespoke.db import db_constants
from bespoke.date import date_util
from bespoke.security import security_util
from server.config import Config
from server.views.common import auth_util


handler = Blueprint('two_factor', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


class GenerateCodeView(MethodView):

	# NOTE: We aren't using this two-factor path yet
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['link_val']
		for key in required_keys:
			if key not in form:
				return make_error_response(f'Missing {key} generate code request')

		link_val = form['link_val']
		link_info = security_util.get_link_info_from_url(
			link_val, cfg.get_security_config(), max_age_in_seconds=security_util.SECONDS_IN_HOUR * 8)
		email = link_info['email']

		# NOTE: Check if link is expired

		with session_scope(current_app.session_maker) as session:
			two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

			if not two_factor_link:
				return make_error_response('Token id provided no longer exists')

			if email not in two_factor_link.token_states:
				return make_error_response('Invalid email for link provided')

			# NOTE: Handle expiration times for tokens
			two_factor_link.token_states[email] = {
				'token_val': security_util.mfa_code_generator(),
				'expires_in': ''
			}
			flag_modified(two_factor_link, 'token_states')

		# NOTE: Send two-factor code to email

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class ApproveCodeView(MethodView):

	# NOTE: We aren't using the two-factor path currently
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		link_val = form.get('link_val')
		if not link_val:
			return make_error_response('Link value not provided')

		provided_token_val = form.get('provided_token_val')
		if not provided_token_val:
			return make_error_response('No token value provided')

		link_info = security_util.get_link_info_from_url(link_val, cfg.get_security_config(),
														 max_age_in_seconds=security_util.SECONDS_IN_HOUR * 8)
		email = link_info['email']

		with session_scope(current_app.session_maker) as session:
			two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

			if not two_factor_link:
				return make_error_response('Link provided no longer exists')

			if email not in two_factor_link.token_states:
				return make_error_response('Not a valid email for this secure link')

			token_dict = two_factor_link.token_states[email]
			token_val = token_dict['token_val']
			form_info = two_factor_link.form_info

		if provided_token_val != token_val:
			return make_error_response('Provided token value is not correct')

		return make_response(json.dumps({
			'status': 'OK',
			'form_info': form_info
		}), 200)


class GetSecureLinkPayloadView(MethodView):

	# Decodes the secure link value and then returns the payload associated with it.
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		form = json.loads(request.data)
		link_signed_val = form.get('val')
		if not link_signed_val:
			return make_error_response('Link provided is empty')

		link_info = security_util.get_link_info_from_url(
			link_signed_val, cfg.get_security_config(), max_age_in_seconds=security_util.SECONDS_IN_DAY * 7)
		email = link_info['email']
		company_id = None
		form_info = None

		with session_scope(current_app.session_maker) as session:
			two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

			if not two_factor_link:
				return make_error_response('Link provided no longer exists')

			expires_at = two_factor_link.expires_at
			if date_util.has_expired(expires_at):
				return make_error_response('Link has expired')

			form_info = two_factor_link.form_info
			if not form_info:
				return make_error_response('No form information associated with this link')

			user = cast(models.User, session.query(models.User).filter(
				models.User.email == email).first())
			if not user:
				return make_error_response('User opening this link does not exist in the system at all')

			company_id = user.company_id

		if form_info.get('type') == db_constants.TwoFactorLinkType.CONFIRM_PURCHASE_ORDER:
			user = models.User(
				email=email,
				password='',
				id=None,
				role=db_constants.UserRoles.PURCHASE_ORDER_REVIEWER,
				company_id=company_id
			)
			claims_payload = auth_util.get_claims_payload(user)
			access_token = create_access_token(identity=claims_payload)
			refresh_expires_delta = datetime.timedelta(minutes=15)
			refresh_token = create_refresh_token(
				identity=claims_payload, expires_delta=refresh_expires_delta)
		else:
			return make_error_response('Could not handle unknown payload type {}'.format(form_info.get('type')))

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
	'/generate_code', view_func=GenerateCodeView.as_view(name='generate_code_view'))
