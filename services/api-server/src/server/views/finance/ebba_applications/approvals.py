import json
from typing import Any, List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.enums.request_status_enum import RequestStatusEnum
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_ebba_applications_approvals', __name__)

class SubmitEbbaApplicationForApproval(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['ebba_application_id']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		ebba_application_id = form['ebba_application_id']

		customer_name = ''

		with session_scope(current_app.session_maker) as session:
			ebba_application = cast(
				models.EbbaApplication,
				session.query(models.EbbaApplication).filter_by(
					id=ebba_application_id
				).first()
			)

			if not ebba_application:
				return handler_util.make_error_response('Could not find EBBA application with given ID')

			if not ebba_application.application_month:
				return handler_util.make_error_response('Application month is required')

			if not ebba_application.monthly_accounts_receivable:
				return handler_util.make_error_response('Monthly accounts receivable is required')

			if not ebba_application.monthly_inventory:
				return handler_util.make_error_response('Monthly inventory is required')

			if not ebba_application.monthly_cash:
				return handler_util.make_error_response('Monthly cash is required')

			customer_name = ebba_application.company.name

			ebba_application.status = RequestStatusEnum.ApprovalRequested
			ebba_application.requested_at = date_util.now()

			session.commit()

		# TODO (warrenshen): actually set up link to EBBA application here.
		ebba_application_html = '<span>LINK HERE</span>'
		template_name = sendgrid_util.TemplateNames.CUSTOMER_SUBMITTED_EBBA_APPLICATION
		template_data = {
			'customer_name': customer_name,
			'ebba_application_html': ebba_application_html
		}
		recipients = cfg.BANK_NOTIFY_EMAIL_ADDRESSES
		_, err = sendgrid_client.send(
			template_name, template_data, recipients
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': ''
		}), 200)

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitEbbaApplicationForApproval.as_view(name='submit_ebba_application_for_approval')
)
