import json
import os
import requests
import xlwt
from datetime import timedelta
from dateutil import parser
from dotenv import load_dotenv
from pathlib import Path
from typing import Tuple, Dict, List, BinaryIO

## Lib code

class Worksheet(object):
	"""A single sheet inside a spreadsheet."""

	MAX_ALLOWED_XL_CELL_CHARS = 32767
	TRUNCATION_MSG = '[truncated]'
	TRUNCATION_MSG_LEN = len(TRUNCATION_MSG)
	ALLOWED_VALUE_LEN = MAX_ALLOWED_XL_CELL_CHARS - TRUNCATION_MSG_LEN

	def __init__(self, ws: xlwt.Worksheet) -> None:
		self._ws = ws
		self._rowx = 0

	def add_row(self, values: List[str]) -> None:
		for colx, value in enumerate(values):
			# Excel cell doesn't support more than 32767 characters.
			if len(value) > self.MAX_ALLOWED_XL_CELL_CHARS:
				value = value[:self.ALLOWED_VALUE_LEN] + self.TRUNCATION_MSG

			self._ws.write(self._rowx, colx, value[:self.MAX_ALLOWED_XL_CELL_CHARS])
		self._rowx += 1

class WorkbookWriter(object):
	"""A wrapper around a xlwt Workbook"""

	def __init__(self, wb: xlwt.Workbook) -> None:
		self._wb = wb
		self._sheet_map: Dict[str, Worksheet] = {}

	def add_sheet(self, sheet_name: str) -> Worksheet:
		orig_ws = self._wb.add_sheet(sheet_name)
		ws = Worksheet(orig_ws)
		self._sheet_map[sheet_name] = ws
		return ws

	def write_records(self, sheet_name: str, records: List[str]) -> None:
		ws = self._sheet_map[sheet_name]
		ws.add_row(records)

	def save(self, f: BinaryIO) -> None:
		self._wb.save(f)

####

class REST(object):

	def __init__(self, cfg: Dict):
		customer_prefix = cfg['customer_prefix']
		partner_key = os.environ.get('BLAZE_PARTNER_KEY')
		customer_key_name = f'BLAZE_{customer_prefix}_KEY'
		customer_location_key = os.environ.get(customer_key_name)

		if not partner_key or not customer_location_key:
			raise Exception(f'BLAZE_PARTNER_KEY or {customer_key_name} not set')

		self._headers = {
			'partner_key': partner_key,
			'Authorization': '{}'.format(customer_location_key)
		}
		self._base_url = 'https://api.partners.blaze.me'

	def get(self, path: str) -> Tuple[Dict, str]:
		url = self._base_url + path
		r = requests.get(url, headers=self._headers)
		if r.status_code != 200:
			return None, '!ERROR\n{}'.format(r.content)
		else:
			resp = r.json()
			return resp, None

def _download(cfg: Dict) -> None:
	customer_prefix = cfg['customer_prefix']

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
		'/api/v1/public/inventory/products',
		'/api/v1/public/inventory/categories',
	]
	print('Customer {}'.format(customer_prefix))
	rest = REST(cfg)

	for endpoint in endpoints:
		endpoint = endpoint.lstrip('/')
		filename = endpoint.replace('/', '_')

		Path(f'out/{customer_prefix}/general').mkdir(parents=True, exist_ok=True)

		# json = json_data
		print('Fetching {}'.format(endpoint))
		resp, err = rest.get(endpoint)
		if err:
			print(err)
		else:
			with open(f'out/{customer_prefix}/general' + filename + '.txt', 'w') as f:
				f.write(json.dumps(resp, indent=4))

# TODO(dlluncor): Cant figure out how to fetch members or transactions

def _download_members(cfg: Dict) -> None:
	customer_prefix = cfg['customer_prefix']
	rest = REST(cfg)
	root_dir = f'out/{customer_prefix}/members'
	Path(root_dir).mkdir(parents=True, exist_ok=True)

	max_iterations = 1
	print('Customer {}'.format(customer_prefix))

	date_range = ('10/01/2021', '10/20/2021')
	start_date = parser.parse(date_range[0]).date()
	end_date = parser.parse(date_range[1]).date()
	cur_date = start_date

	while cur_date <= end_date:
		print('Fetching members for {}'.format(cur_date))
		pos = 0
		fmt = '%m/%d/%Y'
		#fmt = '%Y-%m-%d'
		cur_date_str = cur_date.toordinal() #.strftime(fmt)
		next_cur_date_str = (cur_date + timedelta(days=1)).toordinal() #strftime(fmt)	

		for i in range(max_iterations):
			url = f'/api/v1/partner/members?startDate={cur_date_str}&endDate={next_cur_date_str}&skip={pos}'
			resp, err = rest.get(url)
			if err:
				raise Exception(err)

			num_retrieved = len(resp['values'])
			filename = 'members{}-{}'.format(pos, pos + num_retrieved)
			print('Fetched {}'.format(filename))
			with open(root_dir + '/' + filename + '.txt', 'w') as f:
				f.write(json.dumps(resp, indent=4))

			if num_retrieved == 0:
				print('Reached the end of fetching members for {}'.format(cur_date))
				break

			pos += num_retrieved

		cur_date = cur_date + timedelta(days=1)

def _download_transactions(cfg: Dict) -> None:
	customer_prefix = cfg['customer_prefix']
	rest = REST(cfg)
	root_dir = f'out/{customer_prefix}/transactions'
	Path(root_dir).mkdir(parents=True, exist_ok=True)

	max_iterations = 1
	print('Customer {}'.format(customer_prefix))

	date_range = ('10/01/2021', '10/20/2021')
	start_date = parser.parse(date_range[0]).date()
	end_date = parser.parse(date_range[1]).date()
	cur_date = start_date

	while cur_date <= end_date:
		print('Fetching transactions for {}'.format(cur_date))
		pos = 0
		#fmt = '%m/%d/%Y'
		fmt = '%Y-%m-%d'
		cur_date_str = cur_date.strftime(fmt)
		next_cur_date_str = (cur_date + timedelta(days=1)).strftime(fmt)	

		for i in range(max_iterations):
			url = f'/api/v1/partner/transactions?startDate={cur_date_str}&endDate={next_cur_date_str}&skip={pos}'
			resp, err = rest.get(url)
			if err:
				raise Exception(err)

			num_retrieved = len(resp['values'])
			filename = 'transactions_{}-{}'.format(pos, pos + num_retrieved)
			print('Fetched {}'.format(filename))
			with open(root_dir + '/' + filename + '.txt', 'w') as f:
				f.write(json.dumps(resp, indent=4))

			if num_retrieved == 0:
				print('Reached the end of fetching transactions for {}'.format(cur_date))
				break

			pos += num_retrieved

		cur_date = cur_date + timedelta(days=1)

def _download_inventory(cfg: Dict) -> None:
	customer_prefix = cfg['customer_prefix']
	rest = REST(cfg)
	root_dir = f'out/{customer_prefix}/inventory'
	Path(root_dir).mkdir(parents=True, exist_ok=True)

	pos = 0
	max_iterations = 30
	print('Customer {}'.format(customer_prefix))

	for i in range(max_iterations):
		url = f'/api/v1/public/inventory/products?start={pos}'
		resp, err = rest.get(url)
		if err:
			raise Exception(err)

		num_retrieved = len(resp['values'])
		filename = 'inventory_{}-{}'.format(pos, pos + num_retrieved)
		print('Fetched {}'.format(filename))
		with open(root_dir + '/' + filename + '.txt', 'w') as f:
			f.write(json.dumps(resp, indent=4))

		if num_retrieved == 0:
			print('Reached the end of fetching inventory')
			break

		pos += num_retrieved

def _process_inventory(cfg: Dict) -> None:
	prefix = cfg['customer_prefix']
	out_dir = f'out/{prefix}/inventory'

	wb = WorkbookWriter(xlwt.Workbook())
	sheet = wb.add_sheet('Inventory')
	header = [
		'Name', 'Category', 'Is cannabis',
		'Unit Price', 'Unit value', 'In stock', 'Total Quantity'
	]
	sheet.add_row(header)

	filenames = os.listdir(out_dir)
	for filename in filenames:
		with open(out_dir + '/' + filename) as f:
			inventory_json = json.loads(f.read())

		for item in inventory_json['values']:
			total_quantity = sum([q['quantity'] for q in item['quantities']])
			el_list = [
				item['name'],
				'{}'.format(item['category']['name']),
				'{}'.format(item['category']['cannabis']),
				'{}'.format(item['unitPrice']),
				'{}'.format(item['unitValue']),
				'{}'.format(item['instock']),
				'{}'.format(total_quantity)
			]
			sheet.add_row(el_list)

	Path(f'out/{prefix}/excels').mkdir(parents=True, exist_ok=True)

	filepath = f'out/{prefix}/excels/inventory.xls'
	with open(filepath, 'wb') as f:
		wb.save(f)
		print('Wrote result to {}'.format(filepath))

	#with open(out_dir + '/api_v1_public_inventory_products.txt') as f:
	#	txs_json = json.loads(f.read())

	#rint('Have {} in total values'.format(len(txs_json['values'])))
	#for tx in txs_json['values']:
	#		print(tx['name'])

def _process(cfg: Dict) -> None:
	prefix = cfg['customer_prefix']
	out_dir = f'out/{prefix}'

	with open(out_dir + '/api_v1_partner_transactions_active.txt') as f:
		txs_json = json.loads(f.read())

	for tx in txs_json['values']:
		print(tx['metrcSaleTime'])

	# Transactions

def main() -> None:
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	cfg = {
		'customer_prefix': 'RA'
	}
	#_download(cfg)
	#_process(cfg)
	#_download_inventory(cfg)
	_process_inventory(cfg)
	#_download_transactions(cfg)
	#_download_members(cfg)

if __name__ == '__main__':
	main()
