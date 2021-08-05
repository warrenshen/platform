import datetime
import json
import requests
from bespoke import errors
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
	'packages_wholesale_api': int,
	'lab_results_api': int
})

ApisToUseDict = TypedDict('ApisToUseDict', {
	'sales_receipts': bool,
	'incoming_transfers': bool,
	'outgoing_transfers': bool,
	'lab_tests': bool,
	'plants': bool
})

FacilityInfoDict = TypedDict('FacilityInfoDict', {
	'license_number': str
})

class CompanyInfo(object):

	def __init__(self, company_id: str, name: str, licenses: List[LicenseAuthDict],
										 metrc_api_key_id: str, apis_to_use: ApisToUseDict) -> None:
		self.company_id = company_id
		self.name = name
		self.licenses = licenses
		self.metrc_api_key_id = metrc_api_key_id
		self.apis_to_use = apis_to_use

class DownloadContext(object):
	"""
		Context object to contain information when we fetch from various parts of Metrc
	"""

	def __init__(self, cur_date: datetime.date, company_info: CompanyInfo, 
										 license_auth: LicenseAuthDict, debug: bool) -> None:
		self.cur_date = cur_date
		self.request_status = RequestStatusesDict(
			transfers_api=UNKNOWN_STATUS_CODE,
			packages_api=UNKNOWN_STATUS_CODE,
			packages_wholesale_api=UNKNOWN_STATUS_CODE,
			lab_results_api=UNKNOWN_STATUS_CODE,
			receipts_api=UNKNOWN_STATUS_CODE
		)
		self.company_info = company_info
		self.apis_to_use = company_info.apis_to_use
		self.rest = REST(
			AuthDict(
				vendor_key=license_auth['vendor_key'],
				user_key=license_auth['user_key']
			),
			license_number=license_auth['license_number'],
			us_state=license_auth['us_state']
		)
		self.license = license_auth
		self.debug = debug

	def get_cur_date_str(self) -> str:
		return self.cur_date.strftime('%m/%d/%Y')


def _get_base_url(us_state: str) -> str:
	abbr = us_state.lower()
	return f'https://api-{abbr}.metrc.com'

def get_facilities(auth_dict: AuthDict, us_state: str) -> List[FacilityInfoDict]:
	auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
	base_url = _get_base_url(us_state)
	url = base_url + '/facilities/v1/'
	resp = requests.get(url, auth=auth)

	if not resp.ok:
		raise errors.Error('Code: {}. Reason: {}. Response: {}'.format(
			resp.status_code, resp.reason, resp.content.decode('utf-8')),
			details={'status_code': resp.status_code})

	facilities_arr = json.loads(resp.content)

	facility_dicts = []
	for facility_json in facilities_arr:
		facility_dicts.append(FacilityInfoDict(
			license_number=facility_json['License']['Number']
		))

	return facility_dicts


class REST(object):

	def __init__(self, auth_dict: AuthDict, license_number: str, us_state: str, debug: bool = False) -> None:
		self.auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		self.license_number = license_number
		self.base_url = _get_base_url(us_state)
		self.debug = debug

	def get(self, path: str, time_range: List = None) -> requests.models.Response:
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

		resp = requests.get(url, auth=self.auth)

		if not resp.ok:
			raise errors.Error('URL: {}. Code: {}. Reason: {}. Response: {}'.format(
				path, resp.status_code, resp.reason, resp.content.decode('utf-8')),
				details={'status_code': resp.status_code})

		return resp

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def dicts_to_rows(
	dicts: List[Dict],
	col_specs: List[Tuple[str, str]],
	include_header: bool) -> List[List[str]]:
	title_row = []
	rows: List[List[str]] = []

	for t in dicts:
		row = []
		for i in range(len(col_specs)):
			col_spec = col_specs[i]
			if len(rows) == 0: # its the first row we are dealing with
				title_row.append(col_spec[0])

			key_name = col_spec[1]
			val = t[key_name]
			if val is None:
				val = ''
			row.append('{}'.format(val))

		rows.append(row)

	if include_header:
		return [title_row] + rows

	return rows
