import copy
import datetime
import json
import logging

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask_jwt_extended import jwt_required
from flask.views import MethodView
from mypy_extensions import TypedDict
from typing import cast, Dict

from bespoke.email import sendgrid_util
from server.config import Config

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

handler.add_url_rule(
	'/send', view_func=SendView.as_view(name='send_view'))
