import datetime
import pytz
import unittest
import pandas as pd
from dateutil import parser
from typing import cast, List, Any, Dict, Iterable

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis.shared import download_util 
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisParamsDict,
	MarginEstimateConfigDict
)

TRANSFER_PACKAGE_COLS = [
	'package_id', 
	'license_number', 
	'product_name',
	'product_category_name',
	'received_unit_of_measure',
	'receiver_wholesale_price',
	'received_quantity',
	'shipped_quantity', 
	'shipped_unit_of_measure',
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
	'license_number',
	'type',
	'quantity',
	'item_product_category_type',
	'item_id',
	'source_production_batch_numbers',
	'product_name',
	'product_category_name',
	'unit_of_measure',
	'production_batch_number',
	'source_harvest_names',
	'archived_date',
	'finished_date'
]

def _transfer_pkg(
		id: int,
		delivery_type: str,
		received_datetime: datetime.datetime,
		quantity: float = 0.0,
		wholesale_price: float = 0.0,
		product_category_name: str = '',
		received_unit_of_measure: str = 'grams',
		source_harvest_names: str = ''
	) -> Dict:

	if not product_category_name:
		product_category_name = f'categoryname-{id}'

	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'product_category_name': product_category_name,
		'product_name': f'productname-{id}',
		'received_unit_of_measure': received_unit_of_measure,
		'shipped_unit_of_measure': received_unit_of_measure,
		'received_quantity': quantity,
		'receiver_wholesale_price': wholesale_price,
		'shipped_quantity': 0.0,
		'shipper_wholesale_price': 0.0,
		'shipment_package_state': 'Accepted',
		'delivery_type': delivery_type,
		'created_date': received_datetime.date(),
		'received_datetime': received_datetime,
		'source_harvest_names': source_harvest_names
	}

def _inventory_pkg(
	id: int,
	package_type: str,
	quantity: float,
	product_name: str = '',
	product_category_name: str = '',
	unit_of_measure: str = '',
	finished_date: str = '',
	source_production_batch_numbers: str = '',
	production_batch_number: str = '',
	source_harvest_names: str = '',
	item_id: str = None,
	item_product_category_type: str = None
) -> Dict:

	if not item_id:
		item_id = f'item-{id}'

	if not item_product_category_type:
		item_product_category_type = f'item-product-category-{id}'

	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'type': package_type,
		'quantity': quantity,
		'item_product_category_type': item_product_category_type,
		'item_id': item_id,
		'product_name': product_name,
		'product_category_name': product_category_name,
		'unit_of_measure': unit_of_measure,
		'source_production_batch_numbers': source_production_batch_numbers,
		'production_batch_number': production_batch_number,
		'source_harvest_names': source_harvest_names,
		'archived_date': '',
		'finished_date': finished_date
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

class FakeSQLHelper(download_util.SQLHelper):

	def __init__(self, packages_df: pd.DataFrame) -> None:
		self._packages_df = packages_df

	def get_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		new_df_rows = []
		for index, row in self._packages_df.iterrows():
			if row['package_id'] in package_ids:
				new_df_rows.append(row)

		return pd.DataFrame(new_df_rows, columns=PACKAGE_COLS)

	def _get_active_packages(self) -> pd.DataFrame:
		return self._packages_df[self._packages_df['type'] != 'inactive']

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		all_matching_packages_df = self.get_packages(package_ids)
		return all_matching_packages_df[all_matching_packages_df['type'] == 'inactive']

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pd.DataFrame:
		new_df_rows = []
		for index, row in self._packages_df.iterrows():
			if row['production_batch_number'] in production_batch_numbers:
				new_df_rows.append(row)

		return pd.DataFrame(new_df_rows, columns=PACKAGE_COLS)

def _create_download(test: Dict) -> util.Download:
	dl = util.Download()

	for tx in test['sales_transactions']:
		tx['sales_datetime'] = tx['sales_datetime'].replace(tzinfo=pytz.UTC)

	inventory_df = _get_dataframe(test['inventory_packages'], columns=PACKAGE_COLS)
	sql_helper = FakeSQLHelper(inventory_df)

	all_dataframes_dict = download_util.AllDataframesDict(
		incoming_transfer_packages_dataframe=_get_dataframe(
			test['incoming_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		outgoing_transfer_packages_dataframe=_get_dataframe(
			test['outgoing_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		sales_receipts_dataframe=_get_dataframe(
			test['sales_receipts'], columns=SALES_RECEIPTS_COLS),
		sales_transactions_dataframe=_get_dataframe(
			test['sales_transactions'], columns=SALES_TX_COLS),
		inventory_packages_dataframe=sql_helper._get_active_packages(),
	)

	dl.download_dataframes(
		all_dataframes_dict=all_dataframes_dict,
		sql_helper=sql_helper
	)
	return dl

class TestInventoryCounts(unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		dl = _create_download(test)
		package_id_to_history = util.get_histories(dl, params=AnalysisParamsDict(
			sold_threshold=1.0,
			find_parent_child_relationships=True,
			use_prices_to_fill_missing_incoming=False,
			external_pricing_data_config=None,
			use_margin_estimate_config=False,
			margin_estimate_config=None,
			cogs_analysis_params=None
		))
		counts_dict = util.print_counts(package_id_to_history, should_print=False)
		self.assertDictEqual(cast(Dict, counts_dict), test['expected_counts_dict'])

	def test_print_counts(self) -> None:
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, delivery_type=DeliveryType.INCOMING_INTERNAL, 
					received_datetime=parser.parse('10/1/2020'),
					quantity=1.0,
					wholesale_price=2.0,
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
				}, # duplicate
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			],
			'expected_counts_dict': {
				'only_outgoing': 2,
				'only_incoming': 2,
				'incoming_missing_prices': 3,
				'only_sold': 1,
				'outgoing_and_incoming': 1,
				'in_and_sold_at_least_once': 2,
				'in_and_sold_many_times': 0,
				'num_parent_packages': 0,
				'num_child_packages': 0,
				'total_seen': 7
			}
		}
		self._run_test(test)

def get_default_params() -> util.AnalysisParamsDict:
	return util.AnalysisParamsDict(
		sold_threshold=1.0,
		find_parent_child_relationships=True,
		use_prices_to_fill_missing_incoming=False,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None
	)

def _inventory_row(
	id: int,
	quantity: int,
	is_in_inventory: bool = True
) -> Dict:
	# Entries that have hardcoded values here means that its not
	# very interesting to test the delta between these values when
	# comparing inventory dataframes
	incoming_cost = 120.00
	incoming_quantity = 10.00
	per_unit_cost = incoming_cost / incoming_quantity

	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'arrived_date': '10/01/2020',
		'incoming_cost': incoming_cost,
		'incoming_quantity': incoming_quantity,
		'uses_parenting_logic': 'False',
		'are_prices_inferred': 'False',

		'product_category_name': f'categoryname-{id}',
		'product_name': f'productname-{id}',

		'quantity': quantity,
		'unit_of_measure': 'Each',
		'current_value': quantity * per_unit_cost,
		'sold_date': '10/05/2020',

		'is_in_inventory': is_in_inventory
	}

class TestCompareInventoryDataframes(unittest.TestCase):

	maxDiff = None

	def _run_test(self, test: Dict) -> None:
		actual_res = util.compare_inventory_dataframes(
			computed=_get_dataframe(
			test['computed_rows'], columns=util.get_inventory_column_names()),
			actual=_get_dataframe(
				test['actual_rows'], util.get_inventory_column_names()),
			options=test['options']
		)
		expected = test['expected_res']
		actual_res['computed_extra_package_ids'].sort()
		actual_res['computed_missing_actual_package_ids'].sort()

		self.assertEqual(
			expected['computed_extra_package_ids'], actual_res['computed_extra_package_ids'])
		self.assertEqual(
			expected['computed_missing_actual_package_ids'], actual_res['computed_missing_actual_package_ids'])

		self.assertAlmostEqual(
			expected['pct_inventory_matching'], actual_res['pct_inventory_matching'])
		self.assertAlmostEqual(
			expected['pct_accuracy_of_quantity'], actual_res['pct_accuracy_of_quantity'])
		self.assertAlmostEqual(
			expected['pct_inventory_overestimate'], actual_res['pct_inventory_overestimate'])
		self.assertAlmostEqual(
			expected['pct_quantity_overestimated'], actual_res['pct_quantity_overestimated'])
		self.assertAlmostEqual(
			expected['current_inventory_value'], actual_res['current_inventory_value'])

	def test_perfect_match(self) -> None:
		test: Dict = {
			'computed_rows': [
				_inventory_row(
					id=1,
					quantity=1
				),
				_inventory_row(
					id=2,
					quantity=2
				),
			],
			'actual_rows': [
				_inventory_row(
					id=1,
					quantity=1
				),
				_inventory_row(
					id=2,
					quantity=2
				)
			],
			'options': {
				'num_errors_to_show': 10,
				'accept_computed_when_sold_out': False
			},
			'expected_res': {
				'computed_extra_package_ids': [],
				'computed_missing_actual_package_ids': [],
				'pct_inventory_matching': 100.0,
				'pct_accuracy_of_quantity': 100.0,
				'pct_inventory_overestimate': 0.0,
				'pct_quantity_overestimated': 0.0,
				'current_inventory_value': 3 * 12.0
			}
		}
		self._run_test(test)

	def test_inventory_and_quantity_mismatch(self) -> None:
		test: Dict = {
			'computed_rows': [
				_inventory_row(
					id=1,
					quantity=1
				),
				_inventory_row(
					id=2,
					quantity=4 # matching but quantity mismatch
				),
				_inventory_row(
					id=5,
					quantity=5 # overestimation, as there is no actual row here at all
				),
				_inventory_row(
					id=6,
					is_in_inventory=False,
					quantity=0 # computed is said to be sold out, so with the options
					           # trust it is sold out, even though the actual has some
					           # residual quantity
				),
				_inventory_row(
					id=7,
					quantity=5 # overestimation, as there is no actual row here at all
				),
			],
			'actual_rows': [
				_inventory_row(
					id=1,
					quantity=1
				),
				_inventory_row(
					id=2,
					quantity=2
				),
				_inventory_row(
					id=3,
					quantity=3 # never showed up in the computed
				),
				_inventory_row(
					id=6,
					quantity=3 # not a mismatch due to the accept_computed_when_sold_out=True flag
				),
			],
			'options': {
				'num_errors_to_show': 10,
				'accept_computed_when_sold_out': True
			},
			'expected_res': {
				'computed_extra_package_ids': ['p5', 'p7'],
				'computed_missing_actual_package_ids': ['p3'],
				'pct_inventory_matching': 75.0, # 3 / 4 matching
				# 2 is the average quantity is actual, 2 / 3 is average delta 
				'pct_accuracy_of_quantity': round(2 / 3 / 2 * 100.0, 2), 
				'pct_inventory_overestimate': round(2 / 4 * 100, 2),
				'pct_quantity_overestimated': round (10 / 9, 2),
				'current_inventory_value': 3 * 12.0 # Could only find quantity=3 matching with the computed
			}
		}
		self._run_test(test)

class TestInventoryPackages(unittest.TestCase):

	maxDiff = None

	def _run_test(self, test: Dict) -> None:
		dl = _create_download(test)

		package_id_to_history = util.get_histories(dl, test['analysis_params'])
		computed_inventory_package_records = util.create_inventory_dataframe_by_date(
				package_id_to_history, test['inventory_date'], params=test['analysis_params'])

		computed_inventory_packages_dataframe = pd.DataFrame(
				computed_inventory_package_records,
				columns=util.get_inventory_column_names()
		)
		inventory_records = computed_inventory_packages_dataframe.to_dict('records')
		inventory_records.sort(key=lambda x: parser.parse(x['arrived_date']) if x['arrived_date'] else None)

		self.assertEqual(len(inventory_records), len(test['expected_inventory_records']))
		inventory_records.sort(key=lambda x: x['package_id'])

		for i in range(len(inventory_records)):
			if test.get('simplified_check'):
				del inventory_records[i]['license_number']
				del inventory_records[i]['arrived_date']
				del inventory_records[i]['incoming_quantity']
				del inventory_records[i]['uses_parenting_logic']
				del inventory_records[i]['are_prices_inferred']
				del inventory_records[i]['current_value']
				del inventory_records[i]['product_category_name']
				del inventory_records[i]['product_name']

			self.assertDictEqual(test['expected_inventory_records'][i], inventory_records[i])

	def test_simple_package_being_sold(self) -> None:
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
			'inventory_date': '10/1/2020',
			'analysis_params': get_default_params(),
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'license_number': 'abcd',
					'arrived_date': '10/01/2020',
					'incoming_cost': 120.00,
					'incoming_quantity': 10.00,
					'uses_parenting_logic': 'False',
					'are_prices_inferred': 'False',

					'product_category_name': 'categoryname-1',
					'product_name': 'productname-1',

					'quantity': 9.0,
					'unit_of_measure': 'Each',
					'current_value': 108.00,
					'sold_date': '10/05/2020',

					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)

	def test_outgoing_no_longer_in_posession(self) -> None:
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
			],
			'outgoing_transfer_packages': [
				_transfer_pkg(
					id=1, 
					quantity=3.0,
					delivery_type=DeliveryType.OUTGOING_UNKNOWN, 
					received_datetime=parser.parse('10/3/2020')
				)
			],
			'sales_transactions': [
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			],
			'inventory_date': '10/3/2020',
			'analysis_params': get_default_params(),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'quantity': 0.0,
					'incoming_cost': 120.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				}
			]
		}
		self._run_test(test)

	def test_is_inactive(self) -> None:
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
			],
			'outgoing_transfer_packages': [],
			'sales_transactions': [
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=1,
					package_type='inactive',
					quantity=2.0,
					finished_date='10/3/2020'
				)
			],
			'inventory_date': '10/4/2020',
			'analysis_params': get_default_params(),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'quantity': 0.0,
					'incoming_cost': 120.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				}
			]
		}
		self._run_test(test)

	def test_parent_child_by_production_numbers(self) -> None:
		# Package 1 is the parent of Package 2
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
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/6/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=1,
					package_type='inactive',
					quantity=2.0,
					finished_date='10/3/2020',
					production_batch_number='source1'
				),
				_inventory_pkg(
					id=2,
					package_type='active',
					quantity=4.0,
					source_production_batch_numbers='source1'
				)
			],
			'inventory_date': '10/5/2020',
			'analysis_params': get_default_params(),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'quantity': 0.0,
					'incoming_cost': 120.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				},
				{
					'package_id': 'p2',
					'quantity': 6.0, # Start from the original quantity and backtrack based on sales
					'incoming_cost': 84.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)

	def test_parent_child_by_harvest_numbers(self) -> None:
		# Package 1 is the parent of Package 2
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=120.0, 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020'),
					source_harvest_names='source1-harvest-num'
				),
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/6/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=1,
					package_type='inactive',
					quantity=2.0,
					finished_date='10/3/2020',
					source_harvest_names='source1-harvest-num'
				),
				_inventory_pkg(
					id=2,
					package_type='active',
					quantity=4.0,
					source_harvest_names='source1-harvest-num'
				)
			],
			'inventory_date': '10/5/2020',
			'analysis_params': get_default_params(),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'quantity': 0.0,
					'incoming_cost': 120.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				},
				{
					'package_id': 'p2',
					'quantity': 6.0, # Start from the original quantity and backtrack based on sales
					'incoming_cost': 84.00, # 7 * 12
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)

	def test_parent_child_no_match_due_to_ambigious_parents(self) -> None:
		# Package 1 and Package 3 are the parents of Package 2, because they are
		# the same product category type.
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=1, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=120.0, 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020'),
					source_harvest_names='source1-harvest-num'
				),
				_transfer_pkg(
					id=3, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=20.0,
					wholesale_price=240.0, 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020'),
					source_harvest_names='source1-harvest-num'
				),
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/6/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=1,
					package_type='inactive',
					quantity=2.0,
					finished_date='10/3/2020',
					source_harvest_names='source1-harvest-num',
				),
				_inventory_pkg(
					id=2,
					package_type='active',
					quantity=4.0,
					source_harvest_names='source1-harvest-num',
				),
				_inventory_pkg(
					id=3,
					package_type='inactive',
					quantity=5.0,
					finished_date='10/3/2020',
					source_harvest_names='source1-harvest-num',
				)
			],
			'inventory_date': '10/5/2020',
			'analysis_params': get_default_params(),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p1',
					'quantity': 0.0,
					'incoming_cost': 120.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				},
				# p2 is missing because it has ambigious parents.
				{
					'package_id': 'p3',
					'quantity': 0.0,
					'incoming_cost': 240.00,
					'unit_of_measure': 'Each',
					'sold_date': '',
					'is_in_inventory': ''
				}
			]
		}
		self._run_test(test)

	def test_child_with_missing_incoming_filled_in_with_pricing_table(self) -> None:
		# This package has no incoming, but based on the pricing table,
		# we create a synthetic incoming package to estimate what details
		# there were.
		test: Dict = {
			'incoming_transfer_packages': [
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/6/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=2,
					package_type='inactive',
					quantity=2.0,
					product_name='Cookies Buds',
					product_category_name='Buds',
					unit_of_measure='pounds',
					finished_date='10/3/2020',
					source_harvest_names='source1-harvest-num',
				)
			],
			'inventory_date': '9/30/2020',
			'analysis_params': util.AnalysisParamsDict(
				sold_threshold=1.0,
				find_parent_child_relationships=False,
				use_prices_to_fill_missing_incoming=True,
				external_pricing_data_config=util.PricingDataConfigDict(
					category_to_fixed_prices={
						'Buds': {
							'Pounds': 4.0
						}
					}
				),
				use_margin_estimate_config=False,
				margin_estimate_config=None,
				cogs_analysis_params=None
			),
			'expected_inventory_records': [
				{
					'package_id': 'p2',
					'quantity': 5.0,
					'current_value': 20.00,
					'license_number': 'abcd',
					'product_category_name': 'Buds',
					'product_name': 'Cookies Buds',
					'unit_of_measure': 'pounds',
					'sold_date': '',
					'are_prices_inferred': 'True',
  				'arrived_date': '09/30/2020',
  				'incoming_cost': 20.00, # 5 pounds came in (inferred) * $4 per pound (pricing table)
  				'incoming_quantity': 5.00,
					'uses_parenting_logic': 'False',
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)

	def test_package_with_missing_price_filled_in_with_margin_estimation(self) -> None:
		# The package has a parent, but that parent has missing price information
		# so we use the pricing table to fill in that detail.
		test: Dict = {
			'incoming_transfer_packages': [
				_transfer_pkg(
					id=2, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=2.0,
					wholesale_price=0.0,
					product_category_name='Buds',
					received_unit_of_measure='Pounds',
					received_datetime=parser.parse('9/30/2020'),
					source_harvest_names='source1-harvest-num'
				),
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				}
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=2,
					package_type='inactive',
					quantity=2.0,
					product_name='Cookie Buds',
					product_category_name='Buds',
					unit_of_measure='pounds',
					finished_date='10/3/2020'
				)
			],
			'inventory_date': '9/30/2020',
			'analysis_params': AnalysisParamsDict(
				sold_threshold=1.0,
				find_parent_child_relationships=False,
				use_prices_to_fill_missing_incoming=False,
				external_pricing_data_config=None,
				use_margin_estimate_config=True,
				margin_estimate_config=MarginEstimateConfigDict(
					category_to_margin_estimate={
						'Buds': 0.4
					}
				),
				cogs_analysis_params=None
			),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p2',
					'quantity': 2.0,
					# See margin estimate
					'incoming_cost': round(1.5 / 1.0 * (1 - 0.4) * 3, 2), # 1.8
					'unit_of_measure': 'Pounds',
					'sold_date': '',
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)

	def test_package_with_missing_incoming_filled_in_with_margin_estimation(self) -> None:
		test: Dict = {
			'incoming_transfer_packages': [
			],
			'outgoing_transfer_packages': [
			],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 1.50,
					'tx_unit_of_measure': 'Each'
				}
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				_inventory_pkg(
					id=2,
					package_type='inactive',
					quantity=2.0,
					product_name='Cookie Buds',
					product_category_name='Buds',
					unit_of_measure='pounds',
					finished_date='10/3/2020'
				)
			],
			'inventory_date': '10/01/2020',
			'analysis_params': AnalysisParamsDict(
				sold_threshold=1.0,
				find_parent_child_relationships=False,
				use_prices_to_fill_missing_incoming=False,
				external_pricing_data_config=None,
				use_margin_estimate_config=True,
				margin_estimate_config=MarginEstimateConfigDict(
					category_to_margin_estimate={
						'Buds': 0.4
					}
				),
				cogs_analysis_params=None
			),
			'simplified_check': True,
			'expected_inventory_records': [
				{
					'package_id': 'p2',
					'quantity': 2.0,
					# See margin estimate
					'incoming_cost': round(1.5 / 1.0 * (1 - 0.4) * 3, 2), # 1.8
					'unit_of_measure': 'pounds',
					'sold_date': '',
					'is_in_inventory': 'true'
				}
			]
		}
		self._run_test(test)


