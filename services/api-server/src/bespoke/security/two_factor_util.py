"""
	A file to keep common logic on how to handle two-factor links
"""
import datetime
import os
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Callable, List, Dict, Tuple, cast
from twilio.rest import Client

from server.config import is_test_env

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.security import security_util


TwoFactorInfoDict = TypedDict('TwoFactorInfoDict', {
	'email': str,
	'link': models.TwoFactorLink
})

class SMSClient(object):

	def __init__(self, account_sid: str, auth_token: str, from_: str):
		self._client = Client(account_sid, auth_token)
		self._from = from_

	def send_text_message(self, to_: str, msg: str) -> Tuple[bool, errors.Error]:
		# This is to prevent sending messages in the test environment
		if is_test_env(os.environ.get('FLASK_ENV')):
			return True, None

		if not to_:
			return None, errors.Error('No "to" phone number provided')

		if not to_.startswith('+'):
			# Assume an American country code if its not currently specified.
			to_ = '+1' + to_

		self._client.api.account.messages.create(
		    to=to_,
		    from_=self._from,
		    body=msg)
		return True, None

def add_two_factor_link_to_db(
	user_emails: List[str],
	form_info: models.TwoFactorFormInfoDict,
	expires_at: datetime.datetime,
	session_maker: Callable
	) -> str:

	token_states: Dict[str, Dict] = {}
	for email in user_emails:
		token_states[email] = {}

	with session_scope(session_maker) as session:
		# A two-factor link sends an email with encoded information in the URL
		# The link has an expiration.
		two_factor_link = models.TwoFactorLink(
			token_states=token_states,
			form_info=cast(Dict, form_info),
			expires_at=expires_at
		)
		session.add(two_factor_link)
		session.flush()
		link_id = str(two_factor_link.id)

	return link_id

def get_url_to_prompt_user(
	security_cfg: security_util.ConfigDict,
	link_id: str,
	user_email: str,
	is_url_relative: bool = False,
) -> str:
	serializer = security_util.get_url_serializer(security_cfg)
	signed_val = serializer.dumps(cast(Dict, security_util.LinkInfoDict(
		link_id=link_id,
		email=user_email
	)))
	return security_util.get_secure_link(security_cfg, signed_val, is_url_relative)


def get_url_to_prompt_user_new(
	security_cfg: security_util.ConfigDict,
	link_id: str,
	user_email: str,
	is_url_relative: bool = False,
) -> str:
	serializer = security_util.get_url_serializer(security_cfg)
	signed_val = serializer.dumps(cast(Dict, security_util.LinkInfoDict(
		link_id=link_id,
		email=user_email
	)))
	return security_util.get_secure_link_new(security_cfg, signed_val, is_url_relative)

def get_two_factor_link(
	link_signed_val: str, 
	security_config: security_util.ConfigDict,
	max_age_in_seconds: int, 
	session: Session) -> Tuple[TwoFactorInfoDict, errors.Error]:

	# This is to retrieve the latest two-factor link using a static URL in the test environment
	if is_test_env(os.environ.get('FLASK_ENV')):
		two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).order_by(
			models.TwoFactorLink.expires_at.desc()).first())

		# We are passing the email in the link_signed_val for the test environment
		email = link_signed_val
	else:
		link_info, err = security_util.get_link_info_from_url(
			link_signed_val, security_config, max_age_in_seconds=max_age_in_seconds)
		if err:
			return None, err

		email = link_info['email']

		two_factor_link = cast(models.TwoFactorLink, session.query(models.TwoFactorLink).filter(
				models.TwoFactorLink.id == link_info['link_id']).first())

	if not two_factor_link:
		return None, errors.Error('Link provided no longer exists')

	expires_at = two_factor_link.expires_at
	if date_util.has_expired(expires_at):
		return None, errors.Error('Link has expired')

	return TwoFactorInfoDict(
		email=email,
		link=two_factor_link
	), None

		