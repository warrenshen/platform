import json
import requests
from mypy_extensions import TypedDict
from typing import Tuple, List, Dict

from bespoke import errors
from bespoke.config.config_util import FCSConfigDict

CheckDebtorsResp = TypedDict('CheckDebtorsResp', {
	'filing_results': List[Dict]
})

def _get_base_url(cfg: FCSConfigDict) -> str:
	if cfg['use_prod']:
		raise errors.Error('Prod FCS not supported yet')

	return 'https://apisandbox.ficoso.com'

def get_access_token(cfg: FCSConfigDict) -> str:
	base_url = _get_base_url(cfg)
	url = base_url + '/FCSAuthentication/core/connect/token'

	headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	}

	body = {
		'client_id': cfg['client_id'],
		'client_secret': cfg['client_secret'], 
		'grant_type': 'password',
		'username': cfg['username'],
		'password': cfg['password'],
		'scope': 'openid profile roles FCSAuthentication.WebAPI'
	}

	r = requests.post(url, headers=headers, data=body)
	resp = json.loads(r.content)
	access_token = resp['access_token']
	# TODO(dlluncor): Cache this to prevent continuously authenticating
	# since the token should last an hour
	# resp['expires_in']

	return access_token

def _get_filing_details(
	cfg: FCSConfigDict, access_token: str, state_code: str, 
	filing_number: str, transaction_id: str) -> Dict:
	base_url = _get_base_url(cfg)
	url = base_url + '/OnlineServices/api/Search/V2/UCCSearch/GetFilingDetails'

	headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer {}'.format(access_token)
	}

	body = {
		'StateCode': state_code,
		'TransactionID': transaction_id,
		'FilingNumbers': [filing_number]
	}

	r = requests.post(url, headers=headers, data=json.dumps(body))
	resp = json.loads(r.content)
	return resp

def check_debtors(cfg: FCSConfigDict, access_token: str, state_code: str, company_name: str) -> Tuple[CheckDebtorsResp, errors.Error]:
	base_url = _get_base_url(cfg)
	url = base_url + '/OnlineServices/api/Search/V2/UCCSearch/SearchDebtorName'

	headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer {}'.format(access_token)
	}
	
	body = {
	  "StateCode": state_code,
	  "SearchOrganizationName": company_name,
	  "SearchFirstName": "",
	  "SearchLastName": "",
	  "References": [
	        {"Name": "Client Reference", "Value": "your value"}       
	    ],
	    "PassThrough": "sample string 4",
	    "IncludeInactiveFilings": True
	}

	r = requests.post(url, headers=headers, data=json.dumps(body))
	resp = json.loads(r.content)
	if resp.get('Message'):
		return None, errors.Error(resp['Message'])
	
	transaction_id = resp['Header']['TransactionID']
	debtor_results = resp['Results']

	for debtor_result in debtor_results:
		details_resp = _get_filing_details(
			cfg, 
			access_token=access_token, 
			state_code=state_code,
			filing_number=debtor_result['FilingNumber'],
			transaction_id=transaction_id
		)
		debtor_result['DetailsResp'] = details_resp

	return CheckDebtorsResp(
			filing_results=debtor_results
	), None