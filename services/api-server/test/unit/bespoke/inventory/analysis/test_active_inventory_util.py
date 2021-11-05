import datetime
import unittest
import pandas as pd
from dateutil import parser
from typing import cast, List, Dict, Iterable

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis import active_inventory_util as util

TRANSFER_PACKAGE_COLS = [
	'package_id', 
	'license_number', 
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
	) -> Dict:
	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'product_category_name': f'categoryname-{id}',
		'product_name': f'productname-{id}',
		'received_unit_of_measure': 'grams',
		'shipped_quantity': 0,
		'shipper_wholesale_price': 0,
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

def _get_dataframe(input_dict_rows: List[Dict], columns: List[str]) -> pd.DataFrame:
	array_rows = []

	for input_dict_row in input_dict_rows:
		array_row = []
		for col in columns:
			array_row.append(input_dict_row[col])
		array_rows.append(array_row)

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

class TestInventoryCounts(unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		dl = util.Download()

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
		package_id_to_history = util.get_histories(dl)
		counts_dict = util.print_counts(package_id_to_history, should_print=False)
		self.assertDictEqual(cast(Dict, counts_dict), test['expected_counts_dict'])

	def test_print_counts(self) -> None:
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, delivery_type=DeliveryType.INCOMING_INTERNAL, 
					received_datetime=parser.parse('10/1/2020')
				)
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/2/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				}
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			],
			'sql_helper_packages_rows': [
			],
			'expected_counts_dict': {
				'only_outgoing': 0,
				'only_incoming': 1,
				'only_sold': 1,
				'outgoing_and_incoming': 0,
			  'in_and_sold_at_least_once': 0,
				'in_and_sold_many_times': 0,
				'num_parent_packages': 0,
				'num_child_packages': 0,
				'total_seen': 2
			}
		}
		self._run_test(test)

