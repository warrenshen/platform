"""
	A file to keep common logic on how to handle two-factor links
"""
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.security import security_util


TwoFactorInfoDict = TypedDict('TwoFactorInfoDict', {
	'email': str,
	'link': models.TwoFactorLink
})

def get_two_factor_link(
	link_signed_val: str, security_config: security_util.ConfigDict, 
	session: Session) -> Tuple[TwoFactorInfoDict, errors.Error]:
	link_info = security_util.get_link_info_from_url(
		link_signed_val, security_config, max_age_in_seconds=security_util.SECONDS_IN_DAY * 7)
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

		