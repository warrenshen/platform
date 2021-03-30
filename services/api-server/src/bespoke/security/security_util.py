import hashlib
import random
import string
from typing import cast, Tuple

from itsdangerous import URLSafeTimedSerializer
from mypy_extensions import TypedDict
from passlib.hash import pbkdf2_sha256 as sha256

from bespoke import errors

LinkInfoDict = TypedDict('LinkInfoDict', {
	'link_id': str,
	'email': str
})

ConfigDict = TypedDict('ConfigDict', {
	'URL_SECRET_KEY': str,
	'URL_SALT': str,
	'BESPOKE_DOMAIN': str
})


def get_secure_link(cfg: ConfigDict, two_factor_row_id: str) -> str:
	return cfg['BESPOKE_DOMAIN'] + '/get-secure-link?val=' + two_factor_row_id


def get_url_serializer(cfg: ConfigDict) -> URLSafeTimedSerializer:
	secret_key = cfg['URL_SECRET_KEY']
	signer_kwargs = dict(key_derivation='hmac', digest_method=hashlib.sha256)
	return URLSafeTimedSerializer(
		secret_key, salt=cfg['URL_SALT'], signer_kwargs=signer_kwargs
	)


def get_link_info_from_url(val: str, cfg: ConfigDict, max_age_in_seconds: int) -> Tuple[LinkInfoDict, errors.Error]:
	url_serializer = get_url_serializer(cfg)
	try:
		return cast(LinkInfoDict, url_serializer.loads(val, max_age=max_age_in_seconds)), None
	except Exception as e:
		return None, errors.Error('Link has expired', details={'e': str(e)})


def hash_password(password_salt: str, password: str) -> str:
	return sha256.hash(password_salt + password)


def verify_password(password_salt: str, password_guess: str, hashed_password: str) -> bool:
	return sha256.verify(password_salt + password_guess, hashed_password)


def mfa_code_generator() -> str:
	size = 6
	chars = string.digits
	return ''.join(random.choice(chars) for _ in range(size))


SECONDS_IN_HOUR = 3600
SECONDS_IN_DAY = SECONDS_IN_HOUR * 24
