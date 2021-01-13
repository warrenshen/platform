import json

from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
import logging

from typing import cast

from bespoke.email import email_manager

handler = Blueprint('email', __name__)

def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)	

class SendView(MethodView):

	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['to', 'subject', 'content']
		for key in required_keys:
			if key not in form:
				return make_error_response('Send email missing key {}'.format(key))

		email_client = cast(email_manager.EmailClient, current_app.email_client)

		try:
			email_client.send(
			    to_=form['to'],
			    subject=form['subject'],
			    content=form['content']
			)
		except Exception as e:
			logging.error('Could not send email: {}'.format(e))
			return make_error_response('Could not successfully send email')

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/send', view_func=SendView.as_view(name='send_view'))
