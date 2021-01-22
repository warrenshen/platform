import datetime
import json

from bespoke.db import models
from bespoke.db.models import session_scope
from datetime import timezone
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from sqlalchemy.orm.attributes import flag_modified
from typing import cast

from bespoke.date import date_util
from bespoke.security import security_util
from server.config import Config


handler = Blueprint('two_factor', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class GenerateCodeView(MethodView):

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
		link_info = security_util.get_link_info_from_url(link_val, cfg.get_security_config())
		email = link_info['email']

		# TODO(dlluncor): Check if link is expired

		with session_scope(current_app.session_maker) as session:
			two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

			if not two_factor_link:
				return make_error_response('Token id provided no longer exists')

			if email not in two_factor_link.token_states:
				return make_error_response('Invalid email for link provided')

			# TODO(dlluncor): Handle expiration times for tokens
			two_factor_link.token_states[email] = {
				'token_val': security_util.mfa_code_generator(),
				'expires_in': ''
			}
			flag_modified(two_factor_link, 'token_states')

		# TODO: Send two-factor code to email

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class GetSecureLinkView(MethodView):

	def get(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		link_signed_val = request.args.get('val')
		if not link_signed_val:
			return make_error_response('Link provided does not exist')

		link_info = security_util.get_link_info_from_url(link_signed_val, cfg.get_security_config())

		with session_scope(current_app.session_maker) as session:
			two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

			if not two_factor_link:
				return make_error_response('Link provided no longer exists')

			expires_at = two_factor_link.expires_at
			if date_util.has_expired(expires_at):
				return make_error_response('Link has expired')

			form_info = two_factor_link.form_info

		# Generate two-factor code upon someone visiting this link

		return make_response(json.dumps({
			'status': 'OK',
			'form_info': form_info,
			'link_val': link_signed_val
		}), 200)

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

		link_info = security_util.get_link_info_from_url(link_val, cfg.get_security_config())
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

		# Here's where you fetch the form information upon successful response.
		# TODO(dlluncor): Grant access token to a token here, give it a limited
		# sign in role.
		# 'X-Hasura-User-Id': str,
		# 'X-Hasura-Default-Role': str,
		# 'X-Hasura-Allowed-Roles': List[str],
		# 'X-Hasura-Company-Id': str # vendor_id

		return make_response(json.dumps({
			'status': 'OK',
			'form_info': form_info
		}), 200)

handler.add_url_rule(
	'/get_secure_link', view_func=GetSecureLinkView.as_view(name='get_secure_link_view'))

handler.add_url_rule(
	'/generate_code', view_func=GenerateCodeView.as_view(name='generate_code_view'))
