import copy
import datetime
import json
import logging

from datetime import timezone, timedelta
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask_jwt_extended import jwt_required
from flask.views import MethodView
from mypy_extensions import TypedDict
from typing import cast, Dict

from bespoke.email import email_manager
from bespoke.db import models
from bespoke.db.models import session_scope
from server.config import Config
from server.views.common import security_util

handler = Blueprint('email', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

RecipientDict = TypedDict('RecipientDict', {
	'email': str
})

def _hours_from_today(hours: int) -> datetime.datetime:
	return datetime.datetime.now(timezone.utc) + timedelta(hours=hours)

templates_that_require_two_factor = set([
	'vendor_agreement_signup'
])

class SendView(MethodView):
	"""
		Send an email, and possibly secure links if the user needs to perform
		an action based on the email
	"""

	@jwt_required
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		email_client = cast(email_manager.EmailClient, current_app.email_client)

		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['type', 'template_config', 'recipients', 'template_data']
		for key in required_keys:
			if key not in form:
				return make_error_response('Send email missing key {}'.format(key))

		if form['type'] != 'email':
			return make_error_response('Currently only email is a supported notification type')

		if len(form['recipients']) == 0:
			return make_error_response('No recipients specified')

		template_id = form['template_config']['id']
		template_name = form['template_config']['name']
		template_data = form['template_data']
		recipients = [recipient['email'] for recipient in form['recipients']]
		requires_secure_link = template_name in templates_that_require_two_factor

		if not requires_secure_link:
			try:
				email_client.send_dynamic_email_template(
				    to_=recipients,
				    template_id=template_id,
				    template_data=template_data
				)
			except Exception as e:
				logging.error('Could not send email: {}'.format(e))
				return make_error_response('Could not successfully send email')

			return make_response(json.dumps({
				'status': 'OK'
			}), 200)			

		# This path does require two factor authentication
		token_states: Dict[str, Dict] = {}
		for email in recipients:
			token_states[email] = {}

		with session_scope(current_app.session_maker) as session:
			two_factor_link = models.TwoFactorLink(token_states=token_states, form_info={
				'type': 'confirm_purchase_order',
				'payload': {
					'purchase_order_id': '12345'
				}
			}, expires_at=_hours_from_today(24 * 7))
			session.add(two_factor_link)
			session.flush()
			link_id = str(two_factor_link.id)

		for email in recipients:
			cur_recipient = email
			cur_template_data = copy.deepcopy(template_data)

			serializer = security_util.get_url_serializer(cfg)
			signed_val = serializer.dumps(security_util.LinkInfoDict(
				link_id=link_id,
				email=cur_recipient
			))

			cur_template_data['_2fa'] = {
				'secure_link': cfg.get_secure_link(signed_val)
			}
			try:
				email_client.send_dynamic_email_template(
				    to_=cur_recipient,
				    template_id=template_id,
				    template_data=cur_template_data
				)
			except Exception as e:
				logging.error('Could not send email: {}'.format(e))
				return make_error_response('Could not successfully send email')

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/send', view_func=SendView.as_view(name='send_view'))
