import datetime
import pytz
import unittest
import pandas as pd
from dateutil import parser
from typing import cast, List, Any, Dict, Iterable

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis import active_inventory_util as util

TRANSFER_PACKAGE_COLS = [
	'package_id', 
	'license_number', 
	'product_name',
	'product_category_name',
	'received_unit_of_measure', 
	'shipped_quantity', 
	'shipper_wholesale_price',
	'shipment_package_state', 
	'delivery_type', 
	'created_date',
	'received_datetime', 
	'source_harvest_names'
]

SALES_TX_COLS = [
	'sales_datetime',
	'tx_package_id',
	'receipt_number',
	'tx_quantity_sold',
	'tx_total_price',
	'tx_unit_of_measure'
]

SALES_RECEIPTS_COLS = [
	'package_id'
]

PACKAGE_COLS = [
	'package_id',
	'type',
	'quantity',
	'item_product_category_type',
	'item_id',
	'source_production_batch_numbers',
	'production_batch_number',
	'source_harvest_names'
]

def _transfer_pkg(
		id: int,
		delivery_type: str,
		received_datetime: datetime.datetime,
		quantity: float = 0.0,
		wholesale_price: float = 0.0,
		received_unit_of_measure: str = 'grams'
	) -> Dict:
	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'product_category_name': f'categoryname-{id}',
		'product_name': f'productname-{id}',
		'received_unit_of_measure': received_unit_of_measure,
		'shipped_quantity': quantity,
		'shipper_wholesale_price': wholesale_price,
		'shipment_package_state': 'Accepted',
		'delivery_type': delivery_type,
		'created_date': received_datetime.date(),
		'received_datetime': received_datetime,
		'source_harvest_names': ''
	}

def _pkg(
	quantity: float,
) -> Dict:
	return {
		'package_id': f'p{id}',
		'type': 'active',
		'quantity': quantity,
		'item_product_category_type': f'item-product-category-{id}',
		'item_id': f'item-{id}',
		'source_production_batch_numbers': '',
		'production_batch_number': '',
		'source_harvest_names': ''
	}

def _dict_to_array(input_dict: Dict[str, Any], columns: List[str]) -> List:
	array_row = []
	for col in columns:
		array_row.append(input_dict[col])
	return array_row

def _get_dataframe(input_dict_rows: List[Dict], columns: List[str]) -> pd.DataFrame:
	array_rows = []

	for input_dict_row in input_dict_rows:
		array_rows.append(_dict_to_array(input_dict_row, columns))

	return pd.DataFrame(array_rows, columns=columns)

class FakeSQLHelper(util.SQLHelper):

	def __init__(self, packages_df: pd.DataFrame) -> None:
		self._packages_df = packages_df

	def get_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		return self._packages_df[self._packages_df.isin({'package_id': package_ids})]

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		all_matching_packages_df = self.get_packages(package_ids)
		return all_matching_packages_df[all_matching_packages_df['type'] == 'inactive']

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pd.DataFrame:
		return self._packages_df[self._packages_df.isin({'production_batch_number': production_batch_numbers})]

def _create_download(test: Dict) -> util.Download:
	dl = util.Download()

	for tx in test['sales_transactions']:
		tx['sales_datetime'] = tx['sales_datetime'].replace(tzinfo=pytz.UTC)

	sql_helper = FakeSQLHelper(_get_dataframe(
		test['sql_helper_packages_rows'], columns=PACKAGE_COLS))
	dl.download_dataframes(
		incoming_transfer_packages_dataframe=_get_dataframe(
			test['incoming_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		outgoing_transfer_packages_dataframe=_get_dataframe(
			test['outgoing_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		sales_transactions_dataframe=_get_dataframe(
			test['sales_transactions'], columns=SALES_TX_COLS),
		sales_receipts_dataframe=_get_dataframe(
			test['sales_receipts'], columns=SALES_RECEIPTS_COLS),
		inventory_packages_dataframe=_get_dataframe(
			test['inventory_packages'], columns=PACKAGE_COLS),
		sql_helper=sql_helper
	)
	return dl

class TestInventoryCounts(unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		dl = _create_download(test)
		package_id_to_history = util.get_histories(dl)
		counts_dict = util.print_counts(package_id_to_history, should_print=False)
		self.assertDictEqual(cast(Dict, counts_dict), test['expected_counts_dict'])

	def test_print_counts(self) -> None:
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, delivery_type=DeliveryType.INCOMING_INTERNAL, 
					received_datetime=parser.parse('10/1/2020')
				),
				_transfer_pkg(
					id=2, delivery_type=DeliveryType.INCOMING_INTERNAL, # sold
					received_datetime=parser.parse('10/1/2020')
				),
				_transfer_pkg(
					id=3, delivery_type=DeliveryType.INCOMING_INTERNAL, 
					received_datetime=parser.parse('10/1/2020') # incoming and outgoing
				),
				_transfer_pkg(
					id=10, delivery_type=DeliveryType.INCOMING_INTERNAL, 
					received_datetime=parser.parse('10/1/2020') # incoming and outgoing
				)
			],
			'outgoing_transfer_packages': [
				_transfer_pkg(
					id=3, delivery_type=DeliveryType.OUTGOING_INTERNAL, 
					received_datetime=parser.parse('10/2/2020')
				),
				_transfer_pkg(
					id=4, delivery_type=DeliveryType.OUTGOING_INTERNAL, 
					received_datetime=parser.parse('10/2/2020')
				),
				_transfer_pkg(
					id=5, delivery_type=DeliveryType.OUTGOING_INTERNAL, 
					received_datetime=parser.parse('10/2/2020')
				)
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/2/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/2/2020'),
					'tx_package_id': 'p100', # only_sold
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/2/2020'),
					'tx_package_id': 'p3',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/2/2020'),
					'tx_package_id': 'p3',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			],
			'sql_helper_packages_rows': [
			],
			'expected_counts_dict': {
				'only_outgoing': 2,
				'only_incoming': 2,
				'only_sold': 1,
				'outgoing_and_incoming': 1,
				'in_and_sold_at_least_once': 2,
				'in_and_sold_many_times': 1,
				'num_parent_packages': 0,
				'num_child_packages': 0,
				'total_seen': 7
			}
		}
		self._run_test(test)

class TestInventoryPackages(unittest.TestCase):

	maxDiff = None

	def _run_test(self, test: Dict) -> None:
		dl = _create_download(test)

		ANALYSIS_PARAMS = util.AnalysisParamsDict(
			sold_threshold=1.0
		)
		package_id_to_history = util.get_histories(dl)
		computed_inventory_package_records = util.create_inventory_dataframe_by_date(
				package_id_to_history, test['inventory_date'], params=ANALYSIS_PARAMS)    
		computed_inventory_packages_dataframe = pd.DataFrame(
				computed_inventory_package_records,
				columns=util.get_inventory_column_names()
		)
		inventory_records = computed_inventory_packages_dataframe.to_dict('records')
		inventory_records.sort(key=lambda x: parser.parse(x['arrived_date']))

		self.assertEqual(len(inventory_records), len(test['expected_inventory_records']))

		for i in range(len(inventory_records)):
			self.assertDictEqual(test['expected_inventory_records'][i], inventory_records[i])

	def test_inventory_packages_simple_package_being_sold(self) -> None:
		# Package 1
		# incoming, outgoing, then incoming again.
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=120.0, 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020')
				),
				_transfer_pkg(
					id=1, 
					# still considered internal because the company is keeping possession
					delivery_type=DeliveryType.OUTGOING_INTERNAL,
					quantity=6.0,
					wholesale_price=111.0,
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/3/2020')
				),
			],
			'outgoing_transfer_packages': [
				_transfer_pkg(
					id=1, 
					quantity=3.0,
					delivery_type=DeliveryType.OUTGOING_UNKNOWN, 
					received_datetime=parser.parse('10/2/2020')
				)
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				}, # Filter out duplicate
				{
					'sales_datetime': parser.parse('10/4/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/5/2020'),
					'tx_package_id': 'p1', # only_sold
					'receipt_number': 'r3',
					'tx_quantity_sold': 3,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			],
			'sql_helper_packages_rows': [
			],
			'inventory_date': '10/1/2020',
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'license_number': 'abcd',
					'arrived_date': '10/01/2020',
					'incoming_cost': '120.00',
					'incoming_quantity': '10.00',
					'is_child_package': 'False',
					'are_prices_inferred': 'False',

					'product_category_name': 'categoryname-1',
					'product_name': 'productname-1',

					'quantity': '9.0',
					'unit_of_measure': 'Each',
					'sold_date': '10/05/2020',
	
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)




