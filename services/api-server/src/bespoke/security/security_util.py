import hashlib
import random
import re
import string
from typing import cast, Tuple, List

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


def get_secure_link(cfg: ConfigDict, two_factor_row_id: str, is_url_relative: bool) -> str:
	relative_url = '/get-secure-link?val=' + two_factor_row_id
	if is_url_relative:
		return relative_url
	else:
		return cfg['BESPOKE_DOMAIN'] + relative_url

def get_url_serializer(cfg: ConfigDict) -> URLSafeTimedSerializer:
	secret_key = cfg['URL_SECRET_KEY']
	signer_kwargs = dict(key_derivation='hmac', digest_method=hashlib.sha256)
	return URLSafeTimedSerializer(
		secret_key, salt=cfg['URL_SALT'], signer_kwargs=signer_kwargs
	)

def encode_secret_string(cfg: ConfigDict, original_string: str) -> str:
	return get_url_serializer(cfg).dumps(original_string)

def decode_secret_string(cfg: ConfigDict, encoded_string: str) -> str:
	return get_url_serializer(cfg).loads(encoded_string)

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


def mfa_code_generator() -> str:
	size = 6
	chars = string.digits
	return ''.join(random.choice(chars) for _ in range(size))


SECONDS_IN_HOUR = 3600
SECONDS_IN_DAY = SECONDS_IN_HOUR * 24
