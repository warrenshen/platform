import hashlib
import random
import string

from mypy_extensions import TypedDict
from itsdangerous import URLSafeTimedSerializer
from typing import cast

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
	return cfg['BESPOKE_DOMAIN'] + '/get_secure_link?val=' + two_factor_row_id 

def get_url_serializer(cfg: ConfigDict) -> URLSafeTimedSerializer:
	secret_key = cfg['URL_SECRET_KEY']
	signer_kwargs = dict(key_derivation='hmac', digest_method=hashlib.sha256)
	return URLSafeTimedSerializer(
		secret_key, salt=cfg['URL_SALT'], signer_kwargs=signer_kwargs
	)

def get_link_info_from_url(val: str, cfg: ConfigDict, max_age_in_seconds: int) -> LinkInfoDict:
	url_serializer = get_url_serializer(cfg)
	return cast(LinkInfoDict, url_serializer.loads(val, max_age=max_age_in_seconds))

def mfa_code_generator() -> str:
  size = 6
  chars = string.digits
  return ''.join(random.choice(chars) for _ in range(size))

SECONDS_IN_HOUR = 3600
SECONDS_IN_DAY = SECONDS_IN_HOUR * 24


