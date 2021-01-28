import copy
import datetime
import json
import logging

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask.views import MethodView
from mypy_extensions import TypedDict
from typing import cast, Dict

from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from server.config import Config
from server.views.common.auth_util import UserSession

handler = Blueprint('email', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

RecipientDict = TypedDict('RecipientDict', {
	'email': str
})

class SendView(MethodView):
	"""
		Send an email, and possibly secure links if the user needs to perform
		an action based on the email
	"""

	@jwt_required
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

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

		template_name = form['template_config']['name']
		template_data = form['template_data']
		recipients = [recipient['email'] for recipient in form['recipients']]

		_, err = sendgrid_client.send(template_name, template_data, recipients)
		if err:
			return make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class SendNotificationView(MethodView):

	"""
		Send a notification (likely an email) that the user needs to perform an action.
	"""

	@jwt_required
	def post(self) -> Response:

		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['template_config']
		for key in required_keys:
			if key not in form:
				return make_error_response('Send email missing key {}'.format(key))

		user_session = UserSession(get_jwt_identity())

		# Company ID is whoever the the company this user belongs to.
		# However in the bank case, they can trigger an email notification on behalf
		# of a user.
		company_id = user_session.get_company_id()
		if user_session.is_bank_user():
			if 'company_id' not in form:
				return make_error_response('"company_id" must be specified you are a bank user')
			company_id = form['company_id']

		with session_scope(current_app.session_maker) as session:
			pass

		# send_vendor_agreement_with_customer
		return make_error_response('Not implemented')


handler.add_url_rule(
	'/send', view_func=SendView.as_view(name='send_view'))

handler.add_url_rule(
	'/send_notification', view_func=SendNotificationView.as_view(name='send_view'))
