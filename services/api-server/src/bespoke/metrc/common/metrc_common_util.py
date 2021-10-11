import datetime
import json
import logging
import requests
import time
from bespoke import errors
from bespoke.db import models
from bespoke.email import sendgrid_util
from dateutil import parser
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth
from typing import Dict, Iterable, List, Tuple, cast

UNKNOWN_STATUS_CODE = -1
UNAUTHORIZED_ERROR_STATUSES = set([401, 403])

AuthDict = TypedDict('AuthDict', {
	'vendor_key': str,
	'user_key': str
})

LicenseAuthDict = TypedDict('LicenseAuthDict', {
	'license_id': str,
	'license_number': str,
	'us_state': str,
	'vendor_key': str,
	'user_key': str
})

RequestStatusesDict = TypedDict('RequestStatusesDict', {
	'receipts_api': int,
	'transfers_api': int,
	'packages_api': int,
	'transfer_packages_api': int,
	'transfer_packages_wholesale_api': int,
	'lab_results_api': int,
	'plants_api': int,
	'plant_batches_api': int,
	'harvests_api': int,
	'sales_transactions_api': int
})

"""
# NOTE: supported once we have mypy 0.910 ready
RequestStatusKeys = Literal[
  'receipts_api', 'transfers_api', 'packages_api', 
  'transfer_packages_api', 'transfer_packages_wholesale_api',
  'lab_results_api'
]
"""

ApisToUseDict = TypedDict('ApisToUseDict', {
	'sales_receipts': bool,
	'sales_transactions': bool,
	'incoming_transfers': bool,
	'outgoing_transfers': bool,
	'lab_tests': bool,
	'packages': bool,
	'harvests': bool,
	'plants': bool,
	'plant_batches': bool
})

FacilityLicenseDict = TypedDict('FacilityLicenseDict', {
	'Number': str
})

FacilityInfoDict = TypedDict('FacilityInfoDict', {
	'License': FacilityLicenseDict
})

FacilitiesPayloadDict = TypedDict('FacilitiesPayloadDict', {
	'facilities': List[FacilityInfoDict]
})

CompanyDetailsDict = TypedDict('CompanyDetailsDict', {
	'company_id': str,
	'name': str
})

CompanyStateInfoDict = TypedDict('CompanyStateInfoDict', {
	'metrc_api_key_id': str,
	'apis_to_use': ApisToUseDict,
	'licenses': List[LicenseAuthDict],
	'facilities_payload': FacilitiesPayloadDict
})

## Retry logic

MetrcRetryItemInfoDict = TypedDict('MetrcRetryItemInfoDict', {
	'receipt_id': str
}, total=False)

MetrcRetryParamsDict = TypedDict('MetrcRetryParamsDict', {
	'license_number': str,
	'us_state': str,
	'path': str,
	'time_range': List[str],
	'item_info': MetrcRetryItemInfoDict
})

class HTTPResponse(object):

	def __init__(self, response: requests.models.Response) -> None:
		self._resp = response

	@property
	def content(self) -> bytes:
		return self._resp.content

class MetrcRetryError(object):

	def __init__(self, retry_params: MetrcRetryParamsDict, err_details: Dict) -> None:
		self.retry_params = retry_params
		self.err_details = err_details

class ErrorCatcher(object):

	def __init__(self, license_number: str, us_state: str) -> None:
		self._license_number = license_number
		self._us_state = us_state
		self._retry_errors: List[MetrcRetryError] = []
		# Errors per endpoint group, e.g.,
		# transfers, sales, plants, packages
		#
		# date
		# transfers_status
		# sales_status
		# plants_status
		# packages_status

		# 
		# errors_payload:
		# 'transfers': {
		#   'paths': [],
		#   'num_failed_endpoints': 2,
		#   'bespoke_logic_error': False / True 
		# }

	def add_retry_error(self, path: str, time_range: List[str], err_details: Dict) -> None:
		
		item_info = MetrcRetryItemInfoDict()

		if path.startswith('/sales/v1/receipts/'):
			parts = path.split('/sales/v1/receipts/')
			if parts[1] not in set(['inactive', 'active']):
				item_info['receipt_id'] = parts[1]

		self._retry_errors.append(MetrcRetryError(
			MetrcRetryParamsDict(
				license_number=self._license_number,
				us_state=self._us_state,
				path=path,
				time_range=time_range,
				item_info=item_info
			),
			err_details=err_details,
		))

	def get_retry_errors(self) -> List[MetrcRetryError]:
		return self._retry_errors

class CompanyInfo(object):

	def __init__(self, company_id: str, name: str, state_to_company_infos: Dict[str, List[CompanyStateInfoDict]]) -> None:
		self.company_id = company_id
		self.name = name
		self._us_states = list(state_to_company_infos.keys())
		self._state_to_company_infos = state_to_company_infos

	def get_us_states(self) -> List[str]:
		return self._us_states

	def get_company_state_infos(self, us_state: str) -> List[CompanyStateInfoDict]:
		if us_state not in self._state_to_company_infos:
			raise errors.Error('Requested us_state {} for company {} but we dont have any information for that state'.format(
				us_state, self.name))
		return self._state_to_company_infos[us_state]

class DownloadContext(object):
	"""
		Context object to contain information when we fetch from various parts of Metrc
	"""

	def __init__(self, 
		sendgrid_client: sendgrid_util.Client, 
		cur_date: datetime.date, 
		company_details: CompanyDetailsDict, 
		apis_to_use: ApisToUseDict,
		license_auth: LicenseAuthDict,
		debug: bool
	) -> None:
		self.cur_date = cur_date
		self.request_status = RequestStatusesDict(
			transfers_api=UNKNOWN_STATUS_CODE,
			packages_api=UNKNOWN_STATUS_CODE,
			transfer_packages_api=UNKNOWN_STATUS_CODE,
			transfer_packages_wholesale_api=UNKNOWN_STATUS_CODE,
			harvests_api=UNKNOWN_STATUS_CODE,
			plant_batches_api=UNKNOWN_STATUS_CODE,
			plants_api=UNKNOWN_STATUS_CODE,
			lab_results_api=UNKNOWN_STATUS_CODE,
			receipts_api=UNKNOWN_STATUS_CODE,
			sales_transactions_api=UNKNOWN_STATUS_CODE,
		)
		self.company_details = company_details
		self.apis_to_use = apis_to_use
		self.error_catcher = ErrorCatcher(
			license_number=license_auth['license_number'],
			us_state=license_auth['us_state']
		)
		self.rest = REST(
			sendgrid_client,
			AuthDict(
				vendor_key=license_auth['vendor_key'],
				user_key=license_auth['user_key']
			),
			license_number=license_auth['license_number'],
			us_state=license_auth['us_state'],
			error_catcher=self.error_catcher,
		)
		self.license = license_auth
		self.debug = debug

	def get_cur_date_str(self) -> str:
		return self.cur_date.strftime('%m/%d/%Y')

	def get_retry_errors(self) -> List[MetrcRetryError]:
		return self.error_catcher.get_retry_errors()

def _get_base_url(us_state: str) -> str:
	abbr = us_state.lower()
	return f'https://api-{abbr}.metrc.com'

def get_default_apis_to_use() -> ApisToUseDict:
	"""
	# For copy-paste help when you are debugging with one API at a time
	return ApisToUseDict(
			sales_receipts=True,
			sales_transactions=False,
			incoming_transfers=False,
			outgoing_transfers=False,
			packages=False,
			lab_tests=False,
			harvests=False,
			plants=False,
			plant_batches=False,
		)
	"""

	return ApisToUseDict(
		sales_receipts=True,
		sales_transactions=True,
		incoming_transfers=True,
		outgoing_transfers=True,
		packages=True,
		lab_tests=True,
		harvests=True,
		plants=True,
		plant_batches=True,
	)

class FacilitiesFetcherInterface(object):
	"""Interface, to make it easier for the test to fake out this function"""

	def get_facilities(self, auth_dict: AuthDict, us_state: str) -> Tuple[List[FacilityInfoDict], errors.Error]:
		return [], None

class FacilitiesFetcher(FacilitiesFetcherInterface):

	def get_facilities(self, auth_dict: AuthDict, us_state: str) -> Tuple[List[FacilityInfoDict], errors.Error]:
		auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		base_url = _get_base_url(us_state)
		url = base_url + '/facilities/v1/'
		resp = requests.get(url, auth=auth)

		if not resp.ok:
			return None, errors.Error('URL: {}. Code: {}. Reason: {}. Response: {}'.format(
				url, resp.status_code, resp.reason, resp.content.decode('utf-8')),
				details={'status_code': resp.status_code})

		facilities_arr = json.loads(resp.content)
		return facilities_arr, None


class REST(object):

	def __init__(self, 
			sendgrid_client: sendgrid_util.Client, auth_dict: AuthDict, 
			license_number: str, us_state: str, 
			error_catcher: ErrorCatcher,
			debug: bool = False
	) -> None:
		self.auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		self.license_number = license_number
		self.base_url = _get_base_url(us_state)
		self.debug = debug
		self._error_catcher = error_catcher
		self.sendgrid_client = sendgrid_client

	def get(self, path: str, time_range: List[str] = None) -> HTTPResponse:
		url = self.base_url + path

		needs_q_mark = '?' not in path
		if needs_q_mark:
			url += '?licenseNumber=' + self.license_number
		else:
			url += '&licenseNumber=' + self.license_number

		if time_range:
			if len(time_range) == 1:
				lastModifiedStart = parser.parse(time_range[0]).isoformat()
				url += '&lastModifiedStart=' + lastModifiedStart
			else:
				lastModifiedStart = parser.parse(time_range[0]).isoformat()
				lastModifiedEnd = parser.parse(time_range[1]).isoformat()
				url += '&lastModifiedStart=' + lastModifiedStart + '&lastModifiedEnd=' + lastModifiedEnd

		if self.debug:
			print(url)

		NUM_RETRIES = 5
		NON_RETRY_STATUSES = set([401, 403])

		for i in range(NUM_RETRIES):
			resp = requests.get(url, auth=self.auth)

			# Return successful response.
			if resp.ok:
				return HTTPResponse(resp)

			e = errors.Error('Metrc error: URL: {}. Code: {}. Reason: {}. Response: {}. License num: {}. Time range: {}'.format(
					path, resp.status_code, resp.reason, resp.content.decode('utf-8'),
					self.license_number, time_range),
					details={'status_code': resp.status_code})

			if resp.status_code in NON_RETRY_STATUSES:
				# TODO(dlluncor): Capture retry errors here.
				raise e
			else:
				logging.error(e)

			time.sleep(1 + (i * 3))

		self._error_catcher.add_retry_error(
			path=path,
			time_range=time_range,
			err_details={
				'reason': resp.reason[0:100], # Keep it short since its in a DB
				'status_code': resp.status_code
			},
		)

		# After retries, we are unsuccessful: raise the last error we saw
		self.sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.SYNC_METRC_DATA_ERROR_CREATED,
			template_data={
				'msg': str(e),
				'traceback': e.traceback,
				'details': '{}'.format(e.details)
			},
			recipients=self.sendgrid_client.get_ops_email_addresses()
		)
		raise e

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def update_if_all_are_unsuccessful(request_status: RequestStatusesDict, key: str, e: errors.Error) -> None:
	d = cast(Dict, request_status)
	if d[key] != 200:
		# Only update the request status if we haven't seen a 200 yet
		d[key] = e.details.get('status_code')
				
