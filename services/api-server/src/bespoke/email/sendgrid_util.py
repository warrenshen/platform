import copy
import datetime
import logging
from datetime import timedelta, timezone
from typing import Callable, Dict, List, Text, Tuple, cast

from bespoke import errors
from bespoke.config.config_util import is_development_env, is_prod_env
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import email_manager
from bespoke.security import security_util
from mypy_extensions import TypedDict


class TemplateNames(object):
	# Email sent to vendor: onboarding link for Line of Credit customers.
	VENDOR_ONBOARDING_LINE_OF_CREDIT = 'vendor_onboarding_line_of_credit'

	# Email sent to vendor: Vendor Agreement for Inventory Financing & PMF customers.
	VENDOR_AGREEMENT_WITH_CUSTOMER = 'vendor_agreement_with_customer'
	VENDOR_APPROVED_NOTIFY_CUSTOMER = 'vendor_approved_notify_customer'
	VENDOR_APPROVED_NOTIFY_VENDOR = 'vendor_approved_notify_vendor' # to vendor
	VENDOR_TO_APPROVE_PURCHASE_ORDER = 'vendor_to_approve_purchase_order' # to vendor

	# Email sent to Bespoke when a customer requests approval from a vendor who does not have a bank account set up.
	CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT = 'customer_requested_approval_no_vendor_bank_account'

	CUSTOMER_CREATED_PURCHASE_ORDER = 'customer_created_purchase_order'
	VENDOR_APPROVED_PURCHASE_ORDER = 'vendor_approved_purchase_order'
	VENDOR_REJECTED_PURCHASE_ORDER = 'vendor_rejected_purchase_order'
	BANK_REJECTED_PURCHASE_ORDER = 'bank_rejected_purchase_order'

	# Email sent to payor: Payor Agreement (Notice of Assignment) for Invoice Financing customers.
	PAYOR_AGREEMENT_WITH_CUSTOMER = 'payor_agreement_with_customer' # to payor
	PAYOR_APPROVED_NOTIFY_CUSTOMER = 'payor_approved_notify_customer' 
	PAYOR_APPROVED_NOTIFY_PAYOR = 'payor_approved_notify_payor' # to payor

	PAYOR_TO_APPROVE_INVOICE = 'payor_to_approve_invoice' # to payor
	PAYOR_APPROVES_OR_REJECTS_INVOICE = 'payor_approves_or_rejects_invoice'
	PAYOR_TO_PAY_INVOICE = 'payor_to_pay_invoice' # to payor

	CUSTOMER_SUBMITTED_EBBA_APPLICATION = 'customer_submitted_ebba_application'
	# TODO(warrenshen): remove this template in the future.
	BANK_USER_APPROVES_OR_REJECTS_EBBA_APPLICATION = 'bank_user_approves_or_rejects_ebba_application'
	BANK_APPROVED_EBBA_APPLICATION = 'bank_approved_ebba_application'
	BANK_REJECTED_EBBA_APPLICATION = 'bank_rejected_ebba_application'

	CUSTOMER_REQUESTED_LOAN = 'customer_requests_loan'

	## LOAN REVIEWED
	BANK_APPROVED_LOANS = 'bank_approved_loans'
	BANK_REJECTED_LOAN = 'bank_rejected_loan'

	## ADVANCE SENT
	# Email sent to vendor when advance is sent to them.
	BANK_SENT_ADVANCE_TO_VENDOR = 'bank_sent_advance_to_vendor'
	# Email sent to customer when advance(s) are made on their loan(s).
	BANK_SENT_ADVANCES_FOR_LOANS = 'bank_sent_advances_for_loans'

	## REPAYMENT REQUESTED
	CUSTOMER_REQUESTED_REPAYMENT = 'customer_requested_repayment'

	## REPAYMENT SETTLED
	BANK_SETTLED_REPAYMENT = 'bank_settled_repayment'

	USER_VENDOR_INVITED_TO_PLATFORM = 'user_vendor_invited_to_platform'
	USER_PAYOR_INVITED_TO_PLATFORM = 'user_payor_invited_to_platform'
	USER_REQUESTS_PARTNER_ON_PLATFORM = 'user_requests_partner_on_platform'

	USER_INVITED_TO_PLATFORM = 'user_invited_to_platform'
	USER_FORGOT_PASSWORD = 'user_forgot_password'
	USER_TWO_FACTOR_CODE = 'user_two_factor_code'

	OPS_TRIGGER_NOTIFICATION = 'ops_trigger_notification'
	SYNC_METRC_DATA_ERROR_CREATED = 'sync_metrc_data_error_created'


TemplateConfigDict = TypedDict('TemplateConfigDict', {
	'id': str,
	'requires_secure_link': bool
})

TEMPLATES_TO_EXCLUDE_FROM_BESPOKE_NOTIFICATIONS = set([
	TemplateNames.USER_FORGOT_PASSWORD
])

_TEMPLATE_NAME_TO_SENDGRID_CONFIG: Dict[str, TemplateConfigDict] = {
	TemplateNames.VENDOR_ONBOARDING_LINE_OF_CREDIT: {
		'id': 'd-8a4e70664462483d96c2faddcc031a0a',
		'requires_secure_link': False
	},
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

	TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT: {
		'id': 'd-9d47d43627704e85b422f351db2769bc',
		'requires_secure_link': False
	},

	TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER: {
		'id': 'd-508802292a1d4f42b01caa7afa0290be',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_APPROVED_PURCHASE_ORDER: {
		'id': 'd-e1a12a84c0db4014afd27c524ef01b1f',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_REJECTED_PURCHASE_ORDER: {
		'id': 'd-fd23a504eb8641139bd4a1efe0ae10fd',
		'requires_secure_link': False
	},
	TemplateNames.BANK_REJECTED_PURCHASE_ORDER: {
		'id': 'd-6da1a83e7e9648c5a7bff5005da76103',
		'requires_secure_link': False
	},

	TemplateNames.PAYOR_AGREEMENT_WITH_CUSTOMER: {
		'id': 'd-4f9366de99b4438ba04d65a23acd9c6a',
		'requires_secure_link': False,
	},
	TemplateNames.PAYOR_APPROVED_NOTIFY_CUSTOMER: {
		'id': 'd-9212ad638d2b4369bcf0e1e5fa00a80d',
		'requires_secure_link': False,
	},
	TemplateNames.PAYOR_APPROVED_NOTIFY_PAYOR: {
		'id': 'd-ad99c657383e4746b59c67111b11bc00',
		'requires_secure_link': False,
	},

	TemplateNames.PAYOR_TO_APPROVE_INVOICE: {
		'id': 'd-4b92d44db799452690dd4fa9153f6aea',
		'requires_secure_link': True,
	},
	TemplateNames.PAYOR_APPROVES_OR_REJECTS_INVOICE: {
		'id': 'd-c1b6738833d741588e7c77ae9afc8903',
		'requires_secure_link': False,
	},
	TemplateNames.PAYOR_TO_PAY_INVOICE: {
		'id': 'd-62fbb49f06254e11a2b04f3f0fee6bbd',
		'requires_secure_link': True,
	},

	TemplateNames.BANK_USER_APPROVES_OR_REJECTS_EBBA_APPLICATION: {
		'id': '',
		'requires_secure_link': False
	},

	TemplateNames.CUSTOMER_REQUESTED_LOAN: {
		'id': 'd-899b285fc6184e8c8da8b9d2f92aa505',
		'requires_secure_link': False
	},
	TemplateNames.CUSTOMER_SUBMITTED_EBBA_APPLICATION: {
		'id': 'd-2b91637879454c438de1b6fd42dd44e7',
		'requires_secure_link': False
	},

	TemplateNames.BANK_APPROVED_LOANS: {
		'id': 'd-8a58d7a072da43628edb77c68e93182d',
		'requires_secure_link': False
	},
	TemplateNames.BANK_REJECTED_LOAN: {
		'id': 'd-42032ae8ab88455cb4c890d2561f11c4',
		'requires_secure_link': False
	},

	TemplateNames.BANK_SENT_ADVANCE_TO_VENDOR: {
		'id': 'd-3c62f5c701e8427386b3441335071a59',
		'requires_secure_link': False
	},
	TemplateNames.BANK_SENT_ADVANCES_FOR_LOANS: {
		'id': 'd-115465177d7b48a6bce8f4b9d1082470',
		'requires_secure_link': False
	},

	TemplateNames.CUSTOMER_REQUESTED_REPAYMENT: {
		'id': 'd-8dd4b164703a4fdeb5cf2a4c0faa097a',
		'requires_secure_link': False
	},

	TemplateNames.USER_VENDOR_INVITED_TO_PLATFORM: {
		'id': 'd-381ba29d06d04336afa56bb16e626eb8',
		'requires_secure_link': False
	},
	TemplateNames.USER_PAYOR_INVITED_TO_PLATFORM: {
		'id': 'd-013f2164d131461193c928e928b5c86d',
		'requires_secure_link': False
	},
	TemplateNames.USER_REQUESTS_PARTNER_ON_PLATFORM: {
		'id': 'd-eeafbf79aaf343c28ede89745033966e',
		'requires_secure_link': False
	},
	TemplateNames.USER_INVITED_TO_PLATFORM: {
		'id': 'd-27a58f6f855b430085747a79d2f562cf',
		'requires_secure_link': False
	},
	TemplateNames.USER_FORGOT_PASSWORD: {
		'id': 'd-7a8a3b36662a45d5bdaa03441b6715b0',
		'requires_secure_link': True
	},
	TemplateNames.USER_TWO_FACTOR_CODE: {
		'id': 'd-7aacf432a38c4d35bedc736b3a6ac18d',
		'requires_secure_link': False
	},

	TemplateNames.OPS_TRIGGER_NOTIFICATION: {
		'id': 'd-6b7e9c5b88ef47a49c352b8a5596eb5f',
		'requires_secure_link': False,
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

def _maybe_add_or_remove_recipients(
	recipients: List[str],
	cfg: email_manager.EmailConfigDict,
	template_name: str,
) -> List[str]:
	if not is_prod_env(cfg['flask_env']):
		# In non-production environments, only send emails to people with @bespokefinancial.com
		# and @sweatequity.vc emails so we avoid sending emails to customers in those environments
		new_recipients = []
		for recipient in recipients:
			if recipient.endswith('@bespokefinancial.com') or recipient.endswith('@sweatequity.vc'):
				new_recipients.append(recipient)
			else:
				logging.info(f'Email "{template_name}" not sent to {recipient} due to non-prod environment')
		recipients = new_recipients

	# For staging and production environments, if email template is not
	# in blacklist then we send a copy of email to the no_reply_email_addr.
	if (
		not is_development_env(cfg['flask_env']) and
		template_name not in TEMPLATES_TO_EXCLUDE_FROM_BESPOKE_NOTIFICATIONS
	):
		no_reply_email_addr = cfg['no_reply_email_addr']
		if no_reply_email_addr not in recipients:
			# We use list concatenation and NOT .append() so
			# that we do not mutate the given recipients parameter.
			recipients = recipients + [no_reply_email_addr]

	# De-duplicate the list of emails as a safety measure to prevent duplicates.
	# This is because duplicate emails cause the request to SendGrid to fail.
	return sorted(list(set(recipients)))

class Client(object):

	def __init__(
		self,
		email_client: email_manager.EmailSender,
		session_maker: Callable,
		security_config: security_util.ConfigDict,
	) -> None:
		self._email_client = email_client
		self._cfg = email_client.config
		self._security_cfg = security_config
		self._session_maker = session_maker

	def get_bank_notify_email_addresses(self) -> List[str]:
		return self._cfg['bank_notify_email_addresses']

	def get_ops_email_addresses(self) -> List[str]:
		return self._cfg['ops_email_addresses']

	def send(
		self,
		template_name: str,
		template_data: Dict,
		recipients: List[str],
		two_factor_payload: TwoFactorPayloadDict = None,
	) -> Tuple[bool, errors.Error]:

		# Validate whether recipient emails are valid.
		for recipient_email in recipients:
			if not recipient_email or '@' not in recipient_email:
				return None, errors.Error(f'Invalid recipient email: "{recipient_email}"')

		template_id = _get_template_id(template_name)
		template_data['defaults'] = _get_template_defaults(
			template_name, self._cfg)

		recipients = _maybe_add_or_remove_recipients(
			recipients, self._cfg, template_name)

		if not recipients:
			return None, errors.Error('Cannot send an email when no recipients are specified')

		err_details = {
			'template_name': template_name,
			'template_id': template_id,
			'template_data': template_data,
		}

		is_prod = is_prod_env(self._cfg['flask_env'])

		if not _requires_secure_link(template_name):
			try:
				self._email_client.send_dynamic_email_template(
					to_=recipients,
					template_id=template_id,
					template_data=template_data,
				)
			except Exception as e:
				err_details['error'] = '{}'.format(e)
				if is_prod:
					logging.error('Could not send email: {}'.format(e))
					msg = 'Could not successfully send email'
				else:
					logging.error(f'Could not send email with template {template_name} to {recipients}: {e}')
					logging.error(f'Send email error details: {err_details}')
					msg = f'Could not send email with template {template_name} to {recipients}: {e}'
				return None, errors.Error(msg, details=err_details)

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
				err_details['error'] = '{}'.format(e)
				if is_prod:
					logging.error('Could not send email: {}'.format(e))
					msg = 'Could not successfully send email'
				else:
					logging.error(f'Could not send email with template {template_name} to {recipients}: {e}')
					logging.error(f'Send email error details: {err_details}')
					msg = f'Could not send email with template {template_name} to {recipients}: {e}'
				return None, errors.Error(msg, details=err_details)

		return True, None
