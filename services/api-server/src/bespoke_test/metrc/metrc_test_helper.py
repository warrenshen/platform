import json
import requests
from typing import Any, Dict, List, Tuple, NamedTuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.metrc.common import metrc_common_util

RequestKey = NamedTuple('RequestKey', (
	('url', str),
	('time_range', Tuple)
))

class FakeREST(object):

	def __init__(self, req_to_resp: Dict[RequestKey, Dict]) -> None:
		self.req_to_resp = req_to_resp
		keys = list(req_to_resp.keys())
		for key in keys:
			self.req_to_resp[key]['__index'] = 0

	def get(self, path: str, time_range: List = None) -> requests.models.Response:
		key = RequestKey(
			url=path,
			time_range=tuple(time_range) if time_range else None
		)
		if key not in self.req_to_resp:
			raise errors.Error(
				'Unexpected request provided {}'.format(key), details={'status_code': 400})

		index = self.req_to_resp[key]['__index']
		resps = self.req_to_resp[key]['resps']
		if index >= len(resps):
			raise errors.Error(
				'Too many unregistered requests made to {}'.format(key), details={'status_code': 400})

		resp = resps[index]
		is_ok = resp.get('status', '') == 'OK'
		content = None
		if 'json' in resp:
			content = json.dumps(resp['json']).encode('utf-8')

		r = requests.models.Response()
		r.status_code = 200 if is_ok else 400
		r._content = content
		self.req_to_resp[key]['__index'] += 1
		return r

def create_download_context(
	cur_date: str,
	company_id: str,
	name: str,
	license_auth: metrc_common_util.LicenseAuthDict,
	) -> metrc_common_util.DownloadContext:
	return metrc_common_util.DownloadContext(
		sendgrid_client=None,
		cur_date=date_util.load_date_str(cur_date),
		company_details=metrc_common_util.CompanyDetailsDict(
			company_id=company_id,
			name=name,
		),
		apis_to_use=metrc_common_util.get_default_apis_to_use(),
		license_auth=license_auth,
		debug=True
	)