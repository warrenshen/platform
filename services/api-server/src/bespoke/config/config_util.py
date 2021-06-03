from typing import Tuple, Dict

from bespoke import errors

def is_test_env(flask_env: str) -> bool:
	return flask_env == 'test'

def is_development_env(flask_env: str) -> bool:
	return flask_env == 'development'

def is_prod_env(flask_env: str) -> bool:
	return flask_env == 'production'

class MetrcAuthProvider(object):
	"""For providing the right API key given a state"""

	def __init__(self, user_key: str, state_to_vendor_key: Dict[str, str]) -> None:
		self._user_key = user_key
		self._state_to_vendor_key = state_to_vendor_key

	def get_default_user_key(self) -> str:
		return self._user_key

	def get_vendor_key_by_state(self, us_state: str) -> Tuple[str, errors.Error]:
		if us_state not in self._state_to_vendor_key:
			return None, errors.Error('No vendor key registered for state {}'.format(us_state))

		return self._state_to_vendor_key[us_state], None
