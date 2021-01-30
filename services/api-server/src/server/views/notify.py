import copy
import datetime
import json
import logging
from typing import Callable, Dict, List, Tuple, cast

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.email.sendgrid_util import TemplateNames
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity, jwt_required
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common.auth_util import UserSession

handler = Blueprint('email', __name__)


def make_error_response(msg: str) -> Response:
	return make_response(json.dumps({'status': 'ERROR', 'msg': msg}), 200)


RecipientDict = TypedDict('RecipientDict', {
	'email': str
})

TypeConfigDict = TypedDict('TypeConfigDict', {
	'namespace': str,
	'name': str
})

CompanySettingsDict = TypedDict('CompanySettingsDict', {
	'vendor_agreement_docusign_template': str
})

CompanyInfoDict = TypedDict('CompanyInfoDict', {
	'name': str,
	'settings': CompanySettingsDict,
	'recipients': List[RecipientDict]
})

VendorInfoDict = TypedDict('VendorInfoDict', {
	'name': str,
	'recipients': List[RecipientDict]
})


class SendPayload(object):

	def __init__(self, template_name: str, template_data: Dict, recipients: List[RecipientDict]) -> None:
		self.template_name = template_name
		self.template_data = template_data
		self.recipients = recipients


def _user_to_recipient(user: models.User) -> RecipientDict:
	return RecipientDict(
		email=user.email
	)


class NotifyHelper(object):
	"""
			A NotifyHelper will help you collect all the information needed to send out
			an email for a particular type.
	"""

	def __init__(self, session_maker: Callable, type_config: TypeConfigDict, input_data: Dict) -> None:
		self._session_maker = session_maker
		self._type_config = type_config
		self._input_data = input_data

	def _get_company_info(self, company_id: str) -> CompanyInfoDict:

		with session_scope(self._session_maker) as session:
			company = cast(
				models.Company,
				session.query(models.Company).filter_by(
					id=company_id).first()
			)
			company_settings = cast(
				models.CompanySettings,
				session.query(models.CompanySettings).filter_by(
					company_id=company_id).first()
			)
			settings = CompanySettingsDict(
				vendor_agreement_docusign_template='')
			if company_settings:
				actual_settings = CompanySettingsDict(
					vendor_agreement_docusign_template=company_settings.vendor_agreement_docusign_template
				)
				settings = actual_settings

			company_name = company.name
			company_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=company_id).all())
			if company_users:
				recipients = [_user_to_recipient(
					user) for user in company_users]

			return CompanyInfoDict(
				name=company_name,
				settings=settings,
				recipients=recipients
			)

	def _get_vendor_info(self, vendor_id: str) -> VendorInfoDict:

		with session_scope(self._session_maker) as session:
			company = cast(
				models.Company,
				session.query(models.Company).filter_by(
					id=vendor_id).first()
			)
			vendor_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=vendor_id).all())
			if vendor_users:
				recipients = [_user_to_recipient(
					user) for user in vendor_users]

			company_name = company.name
			return VendorInfoDict(
				name=company_name,
				recipients=recipients
			)

	def fetch(self) -> Tuple[List[SendPayload], str]:

		notification_name = self._type_config['name']

		vendor_info = None
		if 'vendor_id' in self._input_data:
			vendor_info = self._get_vendor_info(self._input_data['vendor_id'])

		if 'company_id' in self._input_data:
			company_info = self._get_company_info(
				self._input_data['company_id'])

		if company_info and len(company_info['recipients']) == 0:
			return None, 'No users are setup for the company receiving this message'

		if vendor_info and len(vendor_info['recipients']) == 0:
			return None, 'No users are setup for this vendor receiving the message'

		if notification_name == 'vendor_approved':
			template_data = {
				'customer_name': company_info['name'],
				'vendor_name': vendor_info['name']
			}

			to_customer_payload = SendPayload(
				template_name=TemplateNames.VENDOR_APPROVED_NOTIFY_CUSTOMER,
				template_data=template_data,
				recipients=company_info['recipients']
			)
			to_vendor_payload = SendPayload(
				template_name=TemplateNames.VENDOR_APPROVED_NOTIFY_VENDOR,
				template_data=template_data,
				recipients=vendor_info['recipients']
			)
			return [to_customer_payload, to_vendor_payload], None
		elif notification_name == 'vendor_agreement_with_customer':
			template_data = {
				'customer_name': company_info['name'],
				'docusign_link': company_info['settings']['vendor_agreement_docusign_template']
			}
			primary_vendor_recipient = vendor_info['recipients'][0]
			to_vendor_payload = SendPayload(
				template_name=TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER,
				template_data=template_data,
				recipients=[primary_vendor_recipient]
			)
			return [to_vendor_payload], None

		return None, 'Unrecognized notification name provided {}'.format(notification_name)


class SendNotificationView(MethodView):

	"""
			Send a notification (likely an email) that the user needs to perform an action.
	"""

	@jwt_required
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(
			sendgrid_util.Client,
			current_app.sendgrid_client
		)

		form = json.loads(request.data)
		if not form:
			return make_error_response('No data provided')

		required_keys = ['type_config', 'input_data']
		for key in required_keys:
			if key not in form:
				return make_error_response('Send email missing key {}'.format(key))

		user_session = UserSession(get_jwt_identity())

		# Company ID is whoever the the company this user belongs to.
		# However in the bank case, they can trigger an email notification on behalf
		# of a user.
		company_id = user_session.get_company_id()
		if user_session.is_bank_user():
			if 'company_id' not in form['input_data']:
				return make_error_response('"company_id" must be specified in the input_data if you are a bank user')
			company_id = form['input_data']['company_id']

		form['input_data']['company_id'] = company_id
		helper = NotifyHelper(
			current_app.session_maker,
			form['type_config'],
			form['input_data']
		)
		send_payloads, err = helper.fetch()
		if err:
			return make_error_response(err)

		for send_payload in send_payloads:

			template_name = send_payload.template_name
			template_data = send_payload.template_data
			recipients = send_payload.recipients

			recipient_emails = [recipient['email'] for recipient in recipients]

			_, err = sendgrid_client.send(
				template_name, template_data, recipient_emails)
			if err:
				return make_error_response(err)

		return make_response(json.dumps({'status': 'OK'}), 200)


handler.add_url_rule(
	'/send_notification', view_func=SendNotificationView.as_view(name='send_notification_view'))
