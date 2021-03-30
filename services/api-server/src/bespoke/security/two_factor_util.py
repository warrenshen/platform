"""
	A file to keep common logic on how to handle two-factor links
"""
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple, cast
from twilio.rest import Client

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
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

def get_two_factor_link(
	link_signed_val: str, security_config: security_util.ConfigDict,
	max_age_in_seconds: int, 
	session: Session) -> Tuple[TwoFactorInfoDict, errors.Error]:
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

		