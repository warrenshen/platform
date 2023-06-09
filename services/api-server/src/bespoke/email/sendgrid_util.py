import copy
import os
import datetime
import logging
from sqlalchemy.orm.session import Session
from typing import Callable, Dict, List, Tuple, cast
from sendgrid.helpers.mail import Attachment
from server.config import is_test_env

from bespoke import errors
from bespoke.config.config_util import is_prod_env
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.db_constants import UserRoles
from bespoke.email import email_manager
from bespoke.security import security_util, two_factor_util
from mypy_extensions import TypedDict

class TemplateNames(object):
	# Email sent to vendor: onboarding link for Line of Credit customers.
	VENDOR_ONBOARDING_LINE_OF_CREDIT = 'vendor_onboarding_line_of_credit'

	# Email sent to vendor: Vendor Agreement for Inventory Financing & PMF customers.
	VENDOR_AGREEMENT_WITH_CUSTOMER = 'vendor_agreement_with_customer'
	VENDOR_APPROVED_NOTIFY_CUSTOMER = 'vendor_approved_notify_customer'
	VENDOR_APPROVED_NOTIFY_VENDOR = 'vendor_approved_notify_vendor' # to vendor
	VENDOR_TO_APPROVE_PURCHASE_ORDER = 'vendor_to_approve_purchase_order' # to vendor
	VENDOR_TO_APPROVE_PURCHASE_ORDER_NEW = 'vendor_to_approve_purchase_order_new' # to vendor

	# Email sent to the client which is used to onboard the vendor.
	CLIENT_SENT_VENDOR_ONBOARDING_FORM = 'client_sent_vendor_onboarding_form'

	DISPENSARY_VENDOR_AGREEMENT = 'dispensary_vendor_agreement'

	# Email sent to Bespoke when a customer requests approval from a vendor who does not have a bank account set up.
	CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT = 'customer_requested_approval_no_vendor_bank_account'
	CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT_NEW = 'customer_requested_approval_no_vendor_bank_account_new'

	CUSTOMER_CREATED_PURCHASE_ORDER = 'customer_created_purchase_order'
	CUSTOMER_CREATED_PURCHASE_ORDER_NEW = 'customer_created_purchase_order_new'
	VENDOR_APPROVED_PURCHASE_ORDER = 'vendor_approved_purchase_order'
	VENDOR_REJECTED_PURCHASE_ORDER = 'vendor_rejected_purchase_order'
	BANK_REJECTED_PURCHASE_ORDER = 'bank_rejected_purchase_order'
	BANK_REJECTED_PURCHASE_ORDER_MULTIPLE = 'bank_rejected_purchase_order_multiple'
	PURCHASE_ORDER_INCOMPLETE_NOTIFICATION = 'purchase_order_incomplete_notification'
	BANK_REQUESTS_CHANGES_TO_PURCHASE_ORDER = 'bank_requests_changes_to_purchase_order'
	VENDOR_REQUESTS_CHANGES_TO_PURCHASE_ORDER = 'vendor_requests_changes_to_purchase_order'

	# Email sent to payor: Payor Agreement (Notice of Assignment) for Invoice Financing customers.
	PAYOR_AGREEMENT_WITH_CUSTOMER = 'payor_agreement_with_customer' # to payor
	PAYOR_APPROVED_NOTIFY_CUSTOMER = 'payor_approved_notify_customer' 
	PAYOR_APPROVED_NOTIFY_PAYOR = 'payor_approved_notify_payor' # to payor

	PAYOR_TO_APPROVE_INVOICE = 'payor_to_approve_invoice' # to payor
	PAYOR_APPROVES_OR_REJECTS_INVOICE = 'payor_approves_or_rejects_invoice'
	PAYOR_TO_PAY_INVOICE = 'payor_to_pay_invoice' # to payor

	CUSTOMER_SUBMITTED_EBBA_APPLICATION = 'customer_submitted_ebba_application'

	CUSTOMER_REQUESTED_LOAN = 'customer_requests_loan'

	## LOAN REVIEWED
	BANK_APPROVED_LOANS = 'bank_approved_loans'
	BANK_REJECTED_LOAN = 'bank_rejected_loan'
	BANK_REJECTED_LOAN_AND_PURCHASE_ORDER = 'bank_rejected_loan_and_purchase_order'

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
	BANK_ACCOUNT_ALERT_CHANGE = 'bank_account_alert_change'

	## REPORTS
	REPORT_LOANS_COMING_DUE = "report_loans_coming_due"
	REPORT_LOANS_PAST_DUE = "report_loans_past_due"
	REPORT_MONTHLY_SUMMARY_LOC = "report_monthly_summary_loc"
	REPORT_MONTHLY_SUMMARY_NON_LOC = "report_monthly_summary_non_loc"
	AUTOMATIC_DEBIT_COURTESY_ALERT = "automatic_debit_courtesy_alert"

	ALERT_FOR_AUTO_GENERATED_REPAYMENTS = "alert_for_auto_generated_repayments"
	ALERT_FOR_WEEKLY_SCHEDULED_AUTO_GENERATED_REPAYMENTS = "alert_for_weekly_scheduled_auto_generated_repayments"
	ALERT_FOR_EXPIRED_BORROWING_BASE_CERTIFICATION = "alert_for_expired_borrowing_base_certification"

	ALERT_VENDOR_CHANGE_REQUEST_APPROVED = "alert_vendor_change_request_approved"
	ALERT_VENDOR_CHANGE_REQUEST = "alert_vendor_change_request"
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
	TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER_NEW: {
		'id': 'd-ffeb4e6b09164685923f9caabc6ad57f',
		'requires_secure_link': True
	},
	TemplateNames.CLIENT_SENT_VENDOR_ONBOARDING_FORM: {
		'id': 'd-aeba307f19ee4562902baf3557f3cebe',
		'requires_secure_link': False
	},
	TemplateNames.DISPENSARY_VENDOR_AGREEMENT: {
		'id': 'd-5777d853722d49dabb1f4461895f0742',
		'requires_secure_link': False
	},
	TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT: {
		'id': 'd-9d47d43627704e85b422f351db2769bc',
		'requires_secure_link': False
	},
	TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT_NEW: {
		'id': 'd-8e487c63da9349f4901cc5207e460bfa',
		'requires_secure_link': False
	},

	TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER: {
		'id': 'd-508802292a1d4f42b01caa7afa0290be',
		'requires_secure_link': False
	},
	TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER_NEW: {
		'id': 'd-c46eb652fc064728b90546fbacd80334',
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
	TemplateNames.BANK_REJECTED_PURCHASE_ORDER_MULTIPLE: {
		'id': 'd-498ef811b819498f8fc8d1ec02d90a73',
		'requires_secure_link': False
	},
	TemplateNames.BANK_REQUESTS_CHANGES_TO_PURCHASE_ORDER: {
		'id': 'd-25a06c0c72004f79b5cbfd8f6da037c5',
		'requires_secure_link': False
	},
	TemplateNames.VENDOR_REQUESTS_CHANGES_TO_PURCHASE_ORDER: {
		'id': 'd-ea39a713b0c24dcd918bb1fc45d3225d',
		'requires_secure_link': False
	},

	TemplateNames.PURCHASE_ORDER_INCOMPLETE_NOTIFICATION: {
		'id': 'd-bed5946b594644b2a9bd537e2f30d25f',
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
	TemplateNames.BANK_REJECTED_LOAN_AND_PURCHASE_ORDER: {
		'id': 'd-3f00024138304b698c767d3849d41077',
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
	},
	TemplateNames.SYNC_METRC_DATA_ERROR_CREATED: {
		'id': 'd-8bceeac2b1e440b2808ed6a6e8884c15',
		'requires_secure_link': False,
	},
	TemplateNames.BANK_ACCOUNT_ALERT_CHANGE: {
		'id': 'd-068f91015eec4bdfab5b4e98b8b92c7f',
		'requires_secure_link': False,
	},
	TemplateNames.REPORT_LOANS_COMING_DUE: {
		'id': 'd-f7daf0ed53184346a160ea9850791275',
		'requires_secure_link': False,
	},
	TemplateNames.REPORT_LOANS_PAST_DUE: {
		'id': 'd-ed08344d414c48f58a98e517023491fa',
		'requires_secure_link': False,
	},
	TemplateNames.REPORT_MONTHLY_SUMMARY_LOC: {
		'id': 'd-836f93ffe3e64e398bde9be76d5d4e33',
		'requires_secure_link': False,
	},
	TemplateNames.REPORT_MONTHLY_SUMMARY_NON_LOC: {
		'id': 'd-1d808af559ac4303a2d55fe042b647b9',
		'requires_secure_link': False,
	},
	TemplateNames.AUTOMATIC_DEBIT_COURTESY_ALERT: {
		'id': 'd-be192545412a4717b521219641ad563c',
		'requires_secure_link': False,
	},
	TemplateNames.ALERT_FOR_AUTO_GENERATED_REPAYMENTS: {
		'id': 'd-e1b75f55e88d47f3b32a9057971ac1df',
		'requires_secure_link': False,
	},
	TemplateNames.ALERT_FOR_WEEKLY_SCHEDULED_AUTO_GENERATED_REPAYMENTS: {
		'id': 'd-50b9644165c04b91acd0738835e959a1',
		'requires_secure_link': False,
	},
	TemplateNames.ALERT_FOR_EXPIRED_BORROWING_BASE_CERTIFICATION: {
		'id': 'd-e961f0fe064344c484e5d1cc346816a7',
		'requires_secure_link': False,
	},
	TemplateNames.ALERT_VENDOR_CHANGE_REQUEST: {
		'id': 'd-ec64173c81c1402cb2704a086d4906a8',
		'requires_secure_link': False,
	},
	TemplateNames.ALERT_VENDOR_CHANGE_REQUEST_APPROVED: {
		'id': 'd-b7176e8321654799b8d4b96af4cba24f',
		'requires_secure_link': False,
	},
}

def get_template_id(template_name: str) -> str:
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

NotificationTemplateData = TypedDict('NotificationTemplateData', {
	'trigger_name': str,
	'domain': str,
	'outcome': str,
	'fatal_error': str,
	'descriptive_errors': List[str],
	'additional_info': str
}, total=False)


TwoFactorPayloadDict = TypedDict('TwoFactorPayloadDict', {
	'form_info': models.TwoFactorFormInfoDict,
	'expires_at': datetime.datetime
})

def _remove_deactived_emails(recipients : List[str], session: Session) -> List[str]:
	deactived_users = cast(
		List[models.User],
		session.query(models.User).filter(
			cast(Callable, models.User.is_deleted.is_)(True)
		).filter(
			models.User.email.in_(recipients)
		).all())

	for u in deactived_users:
		if u.email in recipients:
			recipients.remove(u.email)

	return recipients

def _filter_out_contact_only_emails(recipients : List[str], session: Session) -> List[str]:
	contact_only_users = cast(
		List[models.User],
		session.query(models.User).filter(
			models.User.email.in_(recipients)
		).filter(
			models.User.role == UserRoles.COMPANY_CONTACT_ONLY
		).all())

	for u in contact_only_users:
		if u.email in recipients:
			recipients.remove(u.email)

	return recipients

def _maybe_add_or_remove_recipients(
	recipients: List[str],
	cfg: email_manager.EmailConfigDict,
	template_name: str,
	session_maker: Callable,
	filter_out_contact_only: bool
) -> List[str]:
	if not is_prod_env(cfg['flask_env']):
		# In non-production environments, only send emails to people with @bespokefinancial.com
		# and @sweatequity.vc emails so we avoid sending emails to customers in those environments
		new_recipients = []
		for recipient in recipients:
			if recipient.endswith('@bespokefinancial.com') or recipient.endswith('@customer.com'):
				new_recipients.append(recipient)
			else:
				logging.info(f'Email "{template_name}" not sent to {recipient} due to non-prod environment')
		recipients = new_recipients

	# Remove deactivated users
	# We are using get_active_users, but a bug appeared where we weren't in one or more places
	# This check is put in place as a defensive measure of last resort
	with session_scope(session_maker) as session:
		recipients = _remove_deactived_emails(recipients, session)
		if filter_out_contact_only is True:
			recipients = _filter_out_contact_only_emails(recipients, session)

	# For the production environment only, if email template is not
	# in blacklist then we send a copy of email to the no_reply_email_addr.
	if (
		is_prod_env(cfg['flask_env']) and
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
		email_config: email_manager.EmailConfigDict,
		session_maker: Callable,
		security_config: security_util.ConfigDict,
	) -> None:
		self._email_cfg = email_config
		self._email_client = email_manager.new_client(email_config)
		self._security_cfg = security_config
		self._session_maker = session_maker

	def get_bank_notify_email_addresses(self) -> List[str]:
		return self._email_cfg['bank_notify_email_addresses']

	def get_ops_email_addresses(self) -> List[str]:
		return self._email_cfg['ops_email_addresses']

	def get_support_email_addresses(self) -> List[str]:
		return [self._email_cfg['support_email_addr']]

	def _remove_to_recipients_if_also_cc_recipients(self, to_recipients: List[str], cc_recipients: List[str]) -> List[str]:
		new_recipients = []
		for recipient in to_recipients:
			if recipient not in cc_recipients:
				new_recipients.append(recipient)
		recipients = new_recipients

		return recipients

	def send(
		self,
		template_name: str,
		template_data: Dict,
		recipients: List[str],
		cc_recipients: List[str] = [],
		filter_out_contact_only: bool = False,
		two_factor_payload: TwoFactorPayloadDict = None,
		attachment: Attachment = None,
		is_new_secure_link: bool = False,
	) -> Tuple[bool, errors.Error]:
		if is_test_env(os.environ.get("FLASK_ENV")):
			recipients.append("do-not-reply-development@bespokefinancial.com")

		# Validate whether recipient emails are valid.
		for recipient_email in recipients:
			if not recipient_email or '@' not in recipient_email:
				return None, errors.Error(f'Invalid recipient email: "{recipient_email}"')

		template_id = get_template_id(template_name)
		template_data['defaults'] = _get_template_defaults(
			template_name, self._email_cfg)

		recipients = _maybe_add_or_remove_recipients(
			recipients, self._email_cfg, template_name, self._session_maker, filter_out_contact_only)

		if not recipients:
			return None, errors.Error('Cannot send an email when no recipients are specified')

		if len(cc_recipients) > 0:
			cc_recipients = _maybe_add_or_remove_recipients(
				cc_recipients, self._email_cfg, template_name, self._session_maker, filter_out_contact_only)

			recipients = self._remove_to_recipients_if_also_cc_recipients(recipients, cc_recipients)

		err_details = {
			'template_name': template_name,
			'template_id': template_id,
			'template_data': template_data,
		}

		is_prod = is_prod_env(self._email_cfg['flask_env'])

		if not _requires_secure_link(template_name):
			try:
				self._email_client.send_dynamic_email_template(
					to_=recipients,
					template_id=template_id,
					template_data=template_data,
					attachment=attachment,
					cc_recipients=cc_recipients
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

		link_id = two_factor_util.add_two_factor_link_to_db(
			user_emails=recipients,
			form_info=two_factor_payload['form_info'],
			expires_at=two_factor_payload['expires_at'],
			session_maker=self._session_maker
		)

		for email in recipients:
			cur_recipient = email
			cur_template_data = copy.deepcopy(template_data)

			if is_new_secure_link:
				secure_link = two_factor_util.get_url_to_prompt_user_new(
					security_cfg=self._security_cfg,
					link_id=link_id,
					user_email=cur_recipient
				)
			else:
				secure_link = two_factor_util.get_url_to_prompt_user(
					security_cfg=self._security_cfg,
					link_id=link_id,
					user_email=cur_recipient
				)

			cur_template_data['_2fa'] = {
				'secure_link': secure_link
			}
			try:
				self._email_client.send_dynamic_email_template(
					to_=cur_recipient,
					template_id=template_id,
					template_data=cur_template_data,
					attachment=attachment,
					cc_recipients=cc_recipients
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
