import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
import logging

from mypy_extensions import TypedDict
from typing import cast

from bespoke.email import email_manager

handler = Blueprint('email', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

RecipientDict = TypedDict('RecipientDict', {
	'email': str
})

class SendView(MethodView):

	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['type', 'template_id', 'recipients']
		for key in required_keys:
			if key not in form:
				return make_error_response('Send email missing key {}'.format(key))

		if form['type'] != 'email':
			return make_error_response('Currently only email is a supported notification type')

		if len(form['recipients']) == 0:
			return make_error_response('No recipients specified')

		email_client = cast(email_manager.EmailClient, current_app.email_client)

		template_id = form['template_id']
		subject = 'Subject for {}'.format(template_id)
		content = 'Content for {}'.format(template_id)

		recipients = [recipient['email'] for recipient in form['recipients']]

		try:
			email_client.send(
			    to_=recipients,
			    subject=subject,
			    content=content
			)
		except Exception as e:
			logging.error('Could not send email: {}'.format(e))
			return make_error_response('Could not successfully send email')

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/send', view_func=SendView.as_view(name='send_view'))
