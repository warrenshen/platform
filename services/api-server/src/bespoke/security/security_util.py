import hashlib
import random
import re
import string
from typing import cast, Tuple, List

from itsdangerous import URLSafeTimedSerializer
from itsdangerous.serializer import Serializer
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

class SerializerType(object):
	URL_SAFE_TIMED_SERIALIZER = 'timed_serializer'
	SERIALIZER = 'serializer'

def get_secure_link(cfg: ConfigDict, two_factor_row_id: str, is_url_relative: bool) -> str:
	relative_url = '/get-secure-link?val=' + two_factor_row_id
	if is_url_relative:
		return relative_url
	else:
		return cfg['BESPOKE_DOMAIN'] + relative_url

def _get_serializer(cfg: ConfigDict) -> Serializer:
	return Serializer(cfg['URL_SECRET_KEY'])

def get_url_serializer(cfg: ConfigDict) -> URLSafeTimedSerializer:
	secret_key = cfg['URL_SECRET_KEY']
	signer_kwargs = dict(key_derivation='hmac', digest_method=hashlib.sha256)
	return URLSafeTimedSerializer(
		secret_key, salt=cfg['URL_SALT'], signer_kwargs=signer_kwargs
	)

def encode_secret_string(cfg: ConfigDict, original_string: str, serializer_type: str = None) -> str:
	if not serializer_type:
		serializer_type = SerializerType.URL_SAFE_TIMED_SERIALIZER

	if serializer_type == SerializerType.URL_SAFE_TIMED_SERIALIZER:
		return get_url_serializer(cfg).dumps(original_string)
	elif serializer_type == SerializerType.SERIALIZER:
		return _get_serializer(cfg).dumps(original_string)
	else:
		raise errors.Error(f'Unexpected serializer type {serializer_type}')

def decode_secret_string(cfg: ConfigDict, encoded_string: str, serializer_type: str = None) -> str:
	if not serializer_type:
		serializer_type = SerializerType.URL_SAFE_TIMED_SERIALIZER

	if serializer_type == SerializerType.URL_SAFE_TIMED_SERIALIZER:
		return get_url_serializer(cfg).loads(encoded_string)
	elif serializer_type == SerializerType.SERIALIZER:
		return _get_serializer(cfg).loads(encoded_string)
	else:
		raise errors.Error(f'Unexpected serializer type {serializer_type}')

def get_link_info_from_url(val: str, cfg: ConfigDict, max_age_in_seconds: int) -> Tuple[LinkInfoDict, errors.Error]:
	url_serializer = get_url_serializer(cfg)
	try:
		return cast(LinkInfoDict, url_serializer.loads(val, max_age=max_age_in_seconds)), None
	except Exception as e:
		return None, errors.Error('Link has expired', details={'e': str(e)})

_SPECIAL_CHARS = '!#$%*+,-;<=>?@[]^_'

def generate_temp_password() -> str:
	lower_char = random.choice(string.ascii_lowercase)
	upper_char = random.choice(string.ascii_uppercase)
	digit_char = random.choice(string.digits)
	special_char = random.choice(_SPECIAL_CHARS)

	lower_char2 = random.choice(string.ascii_lowercase)
	upper_char2 = random.choice(string.ascii_uppercase)
	digit_char2 = random.choice(string.digits)
	special_char2 = random.choice(_SPECIAL_CHARS)

	letters = [
		lower_char, upper_char, digit_char, special_char,
		lower_char2, upper_char2, digit_char2, special_char2
	]
	password = ''.join(letters)
	
	success, errors_list = meets_password_complexity_requirements(password)
	if errors_list:
		raise errors.Error(', '.join(['{}'.format(err) for err in errors_list]))
		
	return password

has_specialchar_regexp = re.compile('[^0-9a-zA-Z]+')

def meets_password_complexity_requirements(password: str) -> Tuple[bool, List[errors.Error]]:
	errors_list: List[errors.Error] = []
	if not password:
		password = ''

	def _add_error(msg: str) -> None:
		errors_list.append(errors.Error(msg))

	if len(password) < 8:
		_add_error('must be at least 8 characters long')

	if not re.search("[a-z]", password):
		_add_error('must contain at least one lowercase letter')

	if not re.search("[A-Z]", password):
		_add_error('must contain at least one uppercase letter')

	if not re.search("[0-9]", password):
		_add_error('must contain at least one number')

	if not has_specialchar_regexp.search(password):
		_add_error('must contain at least one allowed special character')

	if re.search("\s", password):
		_add_error('no spaces allowed in the password')

	if errors_list:
		return False, errors_list

	return True, None

def hash_password(password_salt: str, password: str) -> str:
	return sha256.hash(password_salt + password)


def verify_password(password_salt: str, password_guess: str, hashed_password: str) -> bool:
	return sha256.verify(password_salt + password_guess, hashed_password)


def verify_blaze_auth_payload(
	secret_key: str,
	auth_key: str,
	external_blaze_company_id: str,
	external_blaze_shop_id: str,
	external_blaze_user_id: str,
	external_blaze_user_role: int,
) -> bool:
	"""
	Security logic:
	- Secret key is shared between Bespoke and Blaze via a safe channel.
	- Given how hash algorithms work, an actor can generate an auth_key
	  that matches hash_output if and only if actor knows the secret key.
	"""
	hash_input = external_blaze_company_id + external_blaze_shop_id + external_blaze_user_id + str(external_blaze_user_role)
	return sha256.using(salt=str.encode(secret_key)).verify(hash_input, auth_key) # type: ignore


def mfa_code_generator() -> str:
	size = 6
	chars = string.digits
	return ''.join(random.choice(chars) for _ in range(size))


SECONDS_IN_HOUR = 3600
SECONDS_IN_DAY = SECONDS_IN_HOUR * 24
