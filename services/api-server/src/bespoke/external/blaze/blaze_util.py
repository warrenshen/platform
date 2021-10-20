import json
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

def main() -> None:
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	partner_key = os.environ.get('BLAZE_PARTNER_KEY')
	customer_location_key = os.environ.get('BLAZE_CUSTOMER_LOCATION_KEY')

	if not partner_key or not customer_location_key:
		raise Exception('BLAZE_PARTNER_KEY or BLAZE_CUSTOMER_LOCATION_KEY not set')

	customer_prefix = 'MEDLEAF'

	base_url = 'https://api.partners.blaze.me'
	endpoints = [
		'/api/v1/partner/companycontacts',
		'/api/v1/partner/loyalty/rewards',
		'/api/v1/partner/members',
		'/api/v1/partner/products',
		'/api/v1/partner/purchaseorders/list',
		'/api/v1/partner/regions',
		'/api/v1/partner/store/batches/dates',
		'/api/v1/partner/store/batches',
		'/api/v1/partner/store/doctors',
		'/api/v1/partner/store/inventories',
		'/api/v1/partner/store/inventory/brands',
		'/api/v1/partner/store/inventory/categories',
		'/api/v1/partner/store/inventory/inventories',
		'/api/v1/partner/store/inventory/products/dates',
		'/api/v1/partner/store/inventory/products',
		'/api/v1/partner/store/inventory/terminals',
		'/api/v1/partner/store/taxes',
		'/api/v1/partner/store/terminals',
		'/api/v1/partner/store',
		'/api/v1/partner/transactions/active',
		'/api/v1/partner/transactions',
		'/api/v1/partner/vendors',
		'/api/v1/public/inventory/categories',
	]

	print('Customer {}'.format(customer_prefix))

	for endpoint in endpoints:
		endpoint = endpoint.lstrip('/')
		url = f'{base_url}/{endpoint}'
		filename = endpoint.replace('/', '_')

		headers = {
			'partner_key': partner_key,
			'Authorization': '{}'.format(customer_location_key)
		}

		Path(f'out/{customer_prefix}').mkdir(parents=True, exist_ok=True)

		# json = json_data
		print('Fetching {}'.format(endpoint))
		r = requests.get(url, headers=headers)
		if r.status_code != 200:
			print('!ERROR')
			print(r.content)
		else:
			resp = r.json()
			with open(f'out/{customer_prefix}/' + filename + '.txt', 'w') as f:
				f.write(json.dumps(resp, indent=4))

if __name__ == '__main__':
	main()