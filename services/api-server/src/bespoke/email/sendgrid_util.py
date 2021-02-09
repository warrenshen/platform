import copy
import datetime
import logging
from datetime import timedelta, timezone
from typing import Callable, Dict, List, Text, Tuple, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import email_manager
from bespoke.security import security_util
from mypy_extensions import TypedDict


class TemplateNames(object):
	VENDOR_AGREEMENT_WITH_CUSTOMER = 'vendor_agreement_with_customer'
	VENDOR_APPROVED_NOTIFY_CUSTOMER = 'vendor_approved_notify_customer'
	VENDOR_APPROVED_NOTIFY_VENDOR = 'vendor_approved_notify_vendor'
	VENDOR_TO_APPROVE_PURCHASE_ORDER = 'vendor_to_approve_purchase_order'
	VENDOR_APPROVES_OR_REJECTS_PURCHASE_ORDER = 'vendor_approves_or_rejects_purchase_order'

	CUSTOMER_REQUESTS_LOAN = 'customer_requests_loan'
	CUSTOMER_SUBMITTED_EBBA_APPLICATION = 'customer_submitted_ebba_application'

	USER_INVITED_TO_PLATFORM = 'user_invited_to_platform'
	USER_FORGOT_PASSWORD = 'user_forgot_password'


TemplateConfigDict = TypedDict('TemplateConfigDict', {
	'id': str,
	'requires_secure_link': bool
})

_TEMPLATE_NAME_TO_SENDGRID_CONFIG: Dict[str, TemplateConfigDict] = {
	TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER: {
		'id': 'd-58c45054a5254f64a81bd6695709aed0',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_APPROVED_NOTIFY_CUSTOMER: {
		'id': 'd-43f5183c08cc4248bda2d5ed5133a493',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_APPROVED_NOTIFY_VENDOR: {
		'id': 'd-53270032807346188f50bf0dca763bd0',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER: {
		'id': 'd-17349ff8699a44f18da7144452d3731a',
		'requires_secure_link': True
	},
	TemplateNames.VENDOR_APPROVES_OR_REJECTS_PURCHASE_ORDER: {
		'id': 'd-0cdbf4e6769640a7aa44a0dd9dbc92ce',
		'requires_secure_link': False
	},

	TemplateNames.CUSTOMER_REQUESTS_LOAN: {
		'id': 'd-899b285fc6184e8c8da8b9d2f92aa505',
		'requires_secure_link': False
	},
	TemplateNames.CUSTOMER_SUBMITTED_EBBA_APPLICATION: {
		'id': 'd-',
		'requires_secure_link': False
	},

	TemplateNames.USER_INVITED_TO_PLATFORM: {
		'id': 'd-27a58f6f855b430085747a79d2f562cf',
		'requires_secure_link': False
	},
	TemplateNames.USER_FORGOT_PASSWORD: {
		'id': 'd-7a8a3b36662a45d5bdaa03441b6715b0',
		'requires_secure_link': True
	}
}

def _get_template_id(template_name: str) -> str:
	if template_name not in _TEMPLATE_NAME_TO_SENDGRID_CONFIG:
		raise Exception(
			'Template name "{}" requested is not configured'.format(template_name))

	return _TEMPLATE_NAME_TO_SENDGRID_CONFIG[template_name]['id']


def _requires_secure_link(template_name: str) -> bool:
	if template_name not in _TEMPLATE_NAME_TO_SENDGRID_CONFIG:
		raise Exception(
			'Template name "{}" requested is not configured'.format(template_name))

	return _TEMPLATE_NAME_TO_SENDGRID_CONFIG[template_name]['requires_secure_link']


def _get_template_defaults(template_name: str, config: email_manager.EmailConfigDict) -> Dict:
	return {
		'bespoke_contact_email': config['support_email_addr']
	}

TwoFactorPayloadDict = TypedDict('TwoFactorPayloadDict', {
	'form_info': models.TwoFactorFormInfoDict,
	'expires_at': datetime.datetime
})

class Client(object):

	def __init__(self, email_client: email_manager.EmailSender, session_maker: Callable,
				 security_config: security_util.ConfigDict) -> None:
		self._email_client = email_client
		self._cfg = email_client.config
		self._security_cfg = security_config
		self._session_maker = session_maker

	def send(self, 
			 template_name: str, template_data: Dict, recipients: List[str],
			 two_factor_payload: TwoFactorPayloadDict = None) -> Tuple[bool, Text]:

		template_id = _get_template_id(template_name)
		template_data['defaults'] = _get_template_defaults(
			template_name, self._cfg)

		if not _requires_secure_link(template_name):
			try:
				self._email_client.send_dynamic_email_template(
					to_=recipients,
					template_id=template_id,
					template_data=template_data
				)
			except Exception as e:
				logging.error('Could not send email: {}'.format(e))
				return None, 'Could not successfully send email'

			return True, None

		# This path does require two factor authentication

		# Keep track of the two-factor code entered per email.
		token_states: Dict[str, Dict] = {}
		for email in recipients:
			token_states[email] = {}

		with session_scope(self._session_maker) as session:
			# A two-factor link sends an email with encoded information in the URL
			# The link has an expiration.
			two_factor_link = models.TwoFactorLink(
				token_states=token_states, 
				form_info=cast(Dict, two_factor_payload['form_info']),
				expires_at=two_factor_payload['expires_at']
			)
			session.add(two_factor_link)
			session.flush()
			link_id = str(two_factor_link.id)

		for email in recipients:
			cur_recipient = email
			cur_template_data = copy.deepcopy(template_data)

			serializer = security_util.get_url_serializer(self._security_cfg)
			signed_val = serializer.dumps(security_util.LinkInfoDict(
				link_id=link_id,
				email=cur_recipient
			))

			cur_template_data['_2fa'] = {
				'secure_link': security_util.get_secure_link(self._security_cfg, signed_val)
			}
			try:
				self._email_client.send_dynamic_email_template(
					to_=cur_recipient,
					template_id=template_id,
					template_data=cur_template_data
				)
			except Exception as e:
				logging.error('Could not send email: {}'.format(e))
				return None, 'Could not successfully send email'

		return True, None
