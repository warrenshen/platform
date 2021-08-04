import json
from typing import Any, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_ebba_applications_approvals', __name__)

class RespondToEbbaApplicationApprovalRequest(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.EBBA_APPLICATION_RESPOND_TO_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		form = json.loads(request.data)
		if not form:
			raise errors.Error('No data provided')

		required_keys = [
			'ebba_application_id',
			'new_request_status',
			'rejection_note'
		]
		for key in required_keys:
			if key not in form:
				raise errors.Error(f'Missing {key} in request')

		ebba_application_id = form['ebba_application_id']
		new_request_status = form['new_request_status']
		rejection_note = form['rejection_note']

		if not ebba_application_id:
			raise errors.Error('No EBBA Application ID provided')

		if new_request_status not in [RequestStatusEnum.APPROVED, RequestStatusEnum.REJECTED]:
			raise errors.Error('Invalid new request status provided')

		if new_request_status == RequestStatusEnum.REJECTED and not rejection_note:
			raise errors.Error('Rejection note is required if response is rejected')

		with session_scope(current_app.session_maker) as session:
			ebba_application = cast(
				models.EbbaApplication,
				session.query(models.EbbaApplication).filter_by(
					id=ebba_application_id
				).first()
			)

			company_settings = cast(
				models.CompanySettings,
				session.query(models.CompanySettings).filter_by(
					company_id=ebba_application.company_id
				).first()
			)

			if new_request_status == RequestStatusEnum.APPROVED:
				ebba_application.status = RequestStatusEnum.APPROVED
				ebba_application.approved_at = date_util.now()
				action_type = 'Approved'

				# Set company's active ebba_application to this one,
				# since it was just approved.
				company_settings.active_ebba_application_id = ebba_application.id
			else:
				if company_settings.active_ebba_application_id == ebba_application.id:
					# Reset company's active ebba_application to None,
					# since this one was formerly approved but now is rejected.
					company_settings.active_ebba_application_id = None

				ebba_application.status = RequestStatusEnum.REJECTED
				ebba_application.rejected_at = date_util.now()
				ebba_application.rejection_note = rejection_note
				action_type = 'Rejected'

			ebba_application_dicts = [{
				'application_date': ebba_application.application_date,
				'requested_at_date': date_util.human_readable_yearmonthday(ebba_application.requested_at)
			}]

			customer_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=ebba_application.company_id).all())

			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			customer_name = ebba_application.company.name
			customer_emails = [user.email for user in customer_users]

		template_name = sendgrid_util.TemplateNames.BANK_USER_APPROVES_OR_REJECTS_EBBA_APPLICATION
		template_data = {
			'customer_name': customer_name,
			'ebba_applications': ebba_application_dicts,
			'action_type': action_type
		}
		# recipients = customer_emails
		# _, err = sendgrid_client.send(
		# 	template_name, template_data, recipients)
		# if err:
		# 	return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Borrowing Base {} approval request responded to'.format(ebba_application_id)
		}), 200)


class SubmitEbbaApplicationForApproval(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.EBBA_APPLICATION_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			raise errors.Error('No data provided')

		required_keys = ['ebba_application_id']

		for key in required_keys:
			if key not in form:
				raise errors.Error(
					'Missing key {} in request'.format(key))

		ebba_application_id = form['ebba_application_id']

		with session_scope(current_app.session_maker) as session:
			ebba_application = cast(
				models.EbbaApplication,
				session.query(models.EbbaApplication).filter_by(
					id=ebba_application_id
				).first()
			)

			if not ebba_application:
				raise errors.Error('Could not find EBBA application with given ID')

			if not ebba_application.application_date:
				raise errors.Error('Application month is required')

			ebba_application.status = RequestStatusEnum.APPROVAL_REQUESTED
			ebba_application.requested_at = date_util.now()
			ebba_application.submitted_by_user_id = user_session.get_user_id()

			# TODO (warrenshen): actually set up link to EBBA application here.
			ebba_application_html = '<span>LINK HERE</span>'
			template_name = sendgrid_util.TemplateNames.CUSTOMER_SUBMITTED_EBBA_APPLICATION
			template_data = {
				'customer_name': ebba_application.company.get_display_name(),
				'ebba_application_html': ebba_application_html
			}
			recipients = cfg.BANK_NOTIFY_EMAIL_ADDRESSES
			_, err = sendgrid_client.send(
				template_name, template_data, recipients
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': ''
		}), 200)

class DeleteEbbaApplicationView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.EBBA_APPLICATION_DELETE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		data = json.loads(request.data)
		if not data:
			raise errors.Error('No data provided')

		ebba_application_id = data['ebba_application_id']

		if not ebba_application_id:
			raise errors.Error('No EBBA Application ID provided')

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			ebba_application = cast(
				models.EbbaApplication,
				session.query(models.EbbaApplication).filter_by(
					id=ebba_application_id).first())

			if not user_session.is_bank_or_this_company_admin(str(ebba_application.company_id)):
				return handler_util.make_error_response('Access Denied')

			if ebba_application.approved_at:
				raise errors.Error('Borrowing base is already approved')

			if ebba_application.is_deleted:
				raise errors.Error('Borrowing base is already deleted')

			ebba_application.is_deleted = True

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Borrowing base {} deleted'.format(ebba_application_id)
		}), 200)

handler.add_url_rule(
	'/respond_to_approval_request',
	view_func=RespondToEbbaApplicationApprovalRequest.as_view(name='respond_to_ebba_application_approval_request')
)

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitEbbaApplicationForApproval.as_view(name='submit_ebba_application_for_approval')
)

handler.add_url_rule(
	'/delete',
	view_func=DeleteEbbaApplicationView.as_view(name='delete_ebba_application')
)
