import os
from mypy_extensions import TypedDict
from typing import Tuple, Dict

from bespoke import errors

BESPOKE_NO_REPLY_EMAIL_ADDRESS = 'do-not-reply@bespokefinancial.com'
BESPOKE_OPS_EMAIL_ADDRESS = 'do-not-reply-development@bespokefinancial.com' 

def is_test_env(flask_env: str) -> bool:
	return flask_env == 'test'

def is_development_env(flask_env: str) -> bool:
	return flask_env == 'development'

def is_prod_env(flask_env: str) -> bool:
	return flask_env == 'production'

class MetrcWorkerConfig(object):
	"""
		For providing configuration on how to execute and parallelize
		Metrc downloads
	"""
	def __init__(
		self, 
		num_parallel_licenses: int,
		num_parallel_sales_transactions: int,
		force_fetch_missing_sales_transactions: bool,
	) -> None:
		self.num_parallel_licenses = num_parallel_licenses
		self.num_parallel_sales_transactions = num_parallel_sales_transactions
		self.force_fetch_missing_sales_transactions = force_fetch_missing_sales_transactions


class MetrcAuthProvider(object):
	"""For providing the right API key given a state"""

	def __init__(self, state_to_vendor_key: Dict[str, str]) -> None:
		self._state_to_vendor_key = state_to_vendor_key

	def get_vendor_key_by_state(self, us_state: str) -> Tuple[str, errors.Error]:
		if us_state not in self._state_to_vendor_key or not self._state_to_vendor_key[us_state]:
			return None, errors.Error(f'No vendor key registered for state {us_state}')
		else:
			return self._state_to_vendor_key[us_state], None

def get_metrc_auth_provider() -> MetrcAuthProvider:
	return MetrcAuthProvider(
		state_to_vendor_key={
			'AK': os.environ.get('METRC_VENDOR_KEY_AK'),
			'CA': os.environ.get('METRC_VENDOR_KEY_CA'),
			'CO': os.environ.get('METRC_VENDOR_KEY_CO'),
			'MA': os.environ.get('METRC_VENDOR_KEY_MA'),
			'MD': os.environ.get('METRC_VENDOR_KEY_MD'),
			'ME': os.environ.get('METRC_VENDOR_KEY_ME'),
			'MI': os.environ.get('METRC_VENDOR_KEY_MI'),
			'MT': os.environ.get('METRC_VENDOR_KEY_MT'),
			'OH': os.environ.get('METRC_VENDOR_KEY_OH'),
			'OK': os.environ.get('METRC_VENDOR_KEY_OK'),
			'OR': os.environ.get('METRC_VENDOR_KEY_OR'),
			'WV': os.environ.get('METRC_VENDOR_KEY_WV'),
		}
	)

FCSConfigDict = TypedDict('FCSConfigDict', {
	'use_prod': bool,
	'client_id': str,
	'client_secret': str,
	'username': str,
	'password': str
})
