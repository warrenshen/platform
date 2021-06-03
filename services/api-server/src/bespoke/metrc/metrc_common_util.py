from typing import Dict, List, Tuple, cast

import requests
from bespoke import errors
from dateutil import parser
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth

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

class CompanyInfo(object):

	def __init__(self, company_id: str, name: str, licenses: List[LicenseAuthDict],
										 metrc_api_key_id: str) -> None:
		self.company_id = company_id
		self.name = name
		self.licenses = licenses
		self.metrc_api_key_id = metrc_api_key_id

UNKNOWN_STATUS_CODE = -1
UNAUTHORIZED_ERROR_STATUSES = set([401, 403])

class REST(object):

	def __init__(self, auth_dict: AuthDict, license_number: str, us_state: str, debug: bool = False) -> None:
		self.auth = HTTPBasicAuth(auth_dict['vendor_key'], auth_dict['user_key'])
		self.license_number = license_number
		abbr = us_state.lower()
		self.base_url = f'https://api-{abbr}.metrc.com'
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
			raise errors.Error('Code: {}. Reason: {}. Response: {}'.format(
				resp.status_code, resp.reason, resp.content.decode('utf-8')),
				details={'status_code': resp.status_code})

		return resp

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
