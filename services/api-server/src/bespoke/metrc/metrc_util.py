import base64
import requests
import os
from dotenv import load_dotenv
from mypy_extensions import TypedDict
from typing import Dict
from requests.auth import HTTPBasicAuth

AuthDict = TypedDict('AuthDict', {
	'vendor_key': str,
	'user_key': str
})

def get_metrc_encoding(auth_dict: AuthDict) -> str:
		vendor_key = auth_dict['vendor_key']
		user_key = auth_dict['user_key']
		encoding_str = f"{vendor_key}:{user_key}"
		encoding = base64.b64encode(encoding_str.encode())
		encoding = encoding.decode('ascii')
		return encoding

def get_metrc_header(auth_dict: AuthDict) -> Dict:
		return {
				'Authorization': f"Basic {get_metrc_encoding(auth_dict)}"
		}

def main():
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	user_key = os.environ.get('METRC_USER_KEY')
	vendor_key_CA = os.environ.get('METRC_VENDOR_KEY_CA')

	if not user_key or not vendor_key_CA:
		raise Exception('METRC_USER_KEY or METRC_VENDOR_KEY_CA not set')

	auth_dict = {'vendor_key': vendor_key_CA, 'user_key': user_key}

	#url = 'https://sandbox-api-ca.metrc.com/facilities/v1'
	base_url = 'https://api-ca.metrc.com'
	#url = f'{base_url}/facilities/v1'
	url = f'{base_url}/harvests/v1/waste/types'

	# json = json_data
	#resp = requests.get(url, auth=HTTPBasicAuth(vendor_key_CA, user_key)) 
	resp = requests.get(url, headers=get_metrc_header(auth_dict))
	if resp.status_code != 200:
		print('!ERROR')
		print(resp.content)
	else:
		print(resp.content)

if __name__ == '__main__':
	main()