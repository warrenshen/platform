import json
import os
import requests
from dotenv import load_dotenv

def main() -> None:
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	partner_key = os.environ.get('BLAZE_PARTNER_KEY')
	customer_location_key = os.environ.get('BLAZE_CUSTOMER_LOCATION_KEY')

	if not partner_key or not customer_location_key:
		raise Exception('BLAZE_PARTNER_KEY or BLAZE_CUSTOMER_LOCATION_KEY not set')

	#url = 'https://sandbox-api-ca.metrc.com/facilities/v1'
	base_url = 'https://api.partners.blaze.me'
	#endpoint = 'api/v1/public/inventory/categories'
	endpoint = '/api/v1/partner/transactions/active'.lstrip('/')
	url = f'{base_url}/{endpoint}'
	filename = endpoint.replace('/', '_')

	headers = {
		'partner_key': partner_key,
		'Authorization': '{}'.format(customer_location_key)
	}

	# json = json_data
	r = requests.get(url, headers=headers)
	if r.status_code != 200:
		print('!ERROR')
		print(r.content)
	else:
		resp = r.json()
		with open('out/' + filename + '.txt', 'w') as f:
			f.write(json.dumps(resp, indent=4))

if __name__ == '__main__':
	main()