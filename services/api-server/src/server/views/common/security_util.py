import hashlib
import random
import string

from mypy_extensions import TypedDict
from itsdangerous import URLSafeTimedSerializer
from typing import cast

from server.config import Config


LinkInfoDict = TypedDict('LinkInfoDict', {
	'link_id': str,
	'email': str
})

def get_url_serializer(cfg: Config) -> URLSafeTimedSerializer:
	secret_key = cfg.URL_SECRET_KEY
	signer_kwargs = dict(key_derivation='hmac', digest_method=hashlib.sha256)
	return URLSafeTimedSerializer(
		secret_key, salt=cfg.URL_SALT, signer_kwargs=signer_kwargs
	)

def get_link_info_from_url(val: str, cfg: Config) -> LinkInfoDict:
	url_serializer = get_url_serializer(cfg)
	return cast(LinkInfoDict, url_serializer.loads(val))

def mfa_code_generator() -> str:
  size = 6
  chars = string.digits
  return ''.join(random.choice(chars) for _ in range(size))


