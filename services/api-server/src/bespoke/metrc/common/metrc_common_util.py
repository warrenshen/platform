import datetime
import json
import logging
import os
import requests
import time
from datetime import timedelta
from dateutil import parser
from itertools import islice
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth
from typing import Dict, Iterable, List, Tuple, cast

from bespoke.config import config_util
from bespoke.config.config_util import MetrcWorkerConfig
from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.metrc.common.metrc_error_util import (
	AUTHORIZATION_ERROR_CODES, ErrorCatcher, MetrcRetryError, MetrcErrorDetailsDict
)
from bespoke.email import sendgrid_util

UNKNOWN_STATUS_CODE = -1

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
	'rejected_transfers': bool,
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

class SplitTimeBy(object):
	HOUR = 'hour'

def _get_date_str(cur_date: datetime.date) -> str:
	return cur_date.strftime('%m/%d/%Y')

def _get_time_ranges(orig_time_str: str, split_time_by: str) -> List[List[str]]:
	orig_date = date_util.load_date_str(orig_time_str)
	if split_time_by == SplitTimeBy.HOUR:
		# Start from midnight to night (cover the full day)
		cur_hour = 0
		time_ranges = []
		while cur_hour < 24:
			cur_start_time = datetime.datetime(
				orig_date.year, orig_date.month, orig_date.day, hour=cur_hour)
			if cur_hour == 23:
				cur_end_time = datetime.datetime(orig_date.year, orig_date.month, orig_date.day) + timedelta(days=1)
			else:
				cur_end_time = datetime.datetime(
					orig_date.year, orig_date.month, orig_date.day, hour=cur_hour + 1)
			
			time_ranges.append([
				date_util.datetime_to_str(cur_start_time), 
				date_util.datetime_to_str(cur_end_time)
			])
			cur_hour += 1

		return time_ranges

	raise errors.Error('Unhandled option to get_time_ranges, split_time_by={}'.format(split_time_by))

class HTTPResponse(object):

	def __init__(self, response: requests.models.Response, results: List[Dict] = None) -> None:
		self._resp = response
		# An alternative if you already know its an array of results. 
		# Specifically used for SplitTimeBy
		self.results = results

	@property
	def content(self) -> bytes:
		return self._resp.content

## End of error retry logic

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
		worker_cfg: MetrcWorkerConfig, 
		cur_date: datetime.date, 
		company_details: CompanyDetailsDict, 
		apis_to_use: ApisToUseDict,
		license_auth: LicenseAuthDict,
		debug: bool
	) -> None:
		self.cur_date = cur_date
		self.worker_cfg = worker_cfg
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
		self.error_catcher = ErrorCatcher()
		self.rest = REST(
			sendgrid_client,
			AuthDict(
				vendor_key=license_auth['vendor_key'],
				user_key=license_auth['user_key']
			),
			company_details=company_details,
			license_number=license_auth['license_number'],
			us_state=license_auth['us_state'],
			error_catcher=self.error_catcher,
		)
		self.license = license_auth
		self.debug = debug

	def get_cur_date_str(self) -> str:
		return _get_date_str(self.cur_date)

	def get_retry_errors(self) -> List[MetrcRetryError]:
		return self.error_catcher.get_retry_errors()

def _get_base_url(us_state: str) -> str:
	abbr = us_state.lower()
	return f'https://api-{abbr}.metrc.com'

def get_default_apis_to_use() -> ApisToUseDict:
	# For copy-paste help when you are debugging with one API at a time
	"""
	return ApisToUseDict(
			sales_receipts=True,
			sales_transactions=True,
			incoming_transfers=False,
			outgoing_transfers=False,
			rejected_transfers=False,
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
		rejected_transfers=False,
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
			sendgrid_client: sendgrid_util.Client, 
			auth_dict: AuthDict, 
			company_details: CompanyDetailsDict,
			license_number: str, 
			us_state: str, 
			error_catcher: ErrorCatcher,
			debug: bool = False
	) -> None:
		self.auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		self.license_number = license_number
		self._company_details = company_details
		self.base_url = _get_base_url(us_state)
		self.debug = debug
		self._error_catcher = error_catcher
		self.sendgrid_client = sendgrid_client

	def _query_url(self, path: str, time_range: List[str]) -> HTTPResponse:
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
		NON_RETRY_STATUSES = AUTHORIZATION_ERROR_CODES

		for i in range(NUM_RETRIES):
			resp = requests.get(url, auth=self.auth)

			# Return successful response.
			if resp.ok:
				return HTTPResponse(resp)

			e = errors.Error('Metrc error: URL: {}. Code: {}. Reason: {}. Response: {}. License num: {}. Company: {}. Time range: {}'.format(
					url, resp.status_code, resp.reason, resp.content.decode('utf-8'),
					self.license_number, self._company_details['name'], time_range),
					details={'status_code': resp.status_code})

			if resp.status_code in NON_RETRY_STATUSES:
				self._error_catcher.add_retry_error(
					path=path,
					time_range=time_range,
					err_details=MetrcErrorDetailsDict(
						reason=resp.reason[0:100], # Keep it short since its in the DB
						status_code=resp.status_code,
						traceback=None
					),
				)
				raise e
			else:
				logging.error(e)

			time.sleep(1 + (i * 3))

		self._error_catcher.add_retry_error(
			path=path,
			time_range=time_range,
			err_details=MetrcErrorDetailsDict(
				reason=resp.reason[0:100], # Keep it short since its in the DB
				status_code=resp.status_code,
				traceback=None
			),
		)

		# After retries, we are unsuccessful: raise the last error we saw
		if self.sendgrid_client:
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

	def get(self, path: str, time_range: List[str] = None, split_time_by: str = None) -> HTTPResponse:
		"""
			split_time_by can only be used when the resultant resp.content is an array
			that can be joined to one another through list.extend()
			AND when len(time_range) == 1, which means we are querying for a day
		"""
		if split_time_by and len(time_range) != 1:
			raise errors.Error('Cannot split time when time_range is already a range, not a single day')

		if not split_time_by:
			# Run the query as normal
			return self._query_url(path, time_range)

		time_range_tuples = _get_time_ranges(time_range[0], split_time_by)
		
		all_results = []
		i = 0
		for time_range_tuple in time_range_tuples:
			cur_resp = self._query_url(path, time_range_tuple)
			cur_results = json.loads(cur_resp.content)
			if type(cur_results) != list:
				raise errors.Error('When splitting the results using time range, each result must be a list that can be joined together')
			all_results.extend(cur_results)
			if i % 4 == 0:
				logging.info('Completed {} for sub time_range: {}'.format(path, time_range_tuple))

			i += 1

		return HTTPResponse(response=None, results=all_results)

def get_rest_helper_for_debug(
	us_state: str, 
	license_number: str,
	company_name: str = '<fill in company name>'
) -> REST:
	error_catcher = ErrorCatcher()
	auth_provider = config_util.get_metrc_auth_provider()
	vendor_key, err = auth_provider.get_vendor_key_by_state(us_state.upper())
	if err:
		raise err
	user_key = os.environ.get('JUPYTER_NOTEBOOK_METRC_API_KEY')
	if not user_key:
		raise Exception('Set JUPYTER_NOTEBOOK_METRC_API_KEY for the customer you are debugging in your .env file')

	auth_dict = AuthDict(
		vendor_key=vendor_key,
		user_key=user_key
	)
	return REST(
			sendgrid_client=None, 
			auth_dict=auth_dict, 
			company_details=CompanyDetailsDict(
				name=company_name,
				company_id=''
			),
			license_number=license_number,
			us_state=us_state, 
			error_catcher=error_catcher,
			debug=True
	)

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def chunker_dict(data: Dict, size: int) -> Iterable[Dict]:
	data_itr = iter(data)
	for i in range(0, len(data), size):
		yield {k:data[k] for k in islice(data_itr, size)}

def update_if_all_are_unsuccessful(request_status: RequestStatusesDict, key: str, e: errors.Error) -> None:
	d = cast(Dict, request_status)
	if d[key] != 200:
		# Only update the request status if we haven't seen a 200 yet
		d[key] = e.details.get('status_code')
				
