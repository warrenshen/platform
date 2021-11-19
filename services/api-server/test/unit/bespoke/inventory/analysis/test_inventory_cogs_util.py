import unittest
import pandas as pd
from dateutil import parser
from typing import Any, Dict, List, Tuple, Iterable, Set, cast

from bespoke_test.inventory.analysis import inventory_test_helper
from bespoke_test.inventory.analysis.inventory_test_helper import (
	transfer_pkg, inventory_pkg, get_default_params, dict_to_array
)
from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis import inventory_cogs_util as cogs_util
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisContext,
	ReadParams,
	WriteOutputParams,
)

class TestCreateCogsSummary(unittest.TestCase):

	maxDiff = None

	def _run_test(self, test: Dict) -> None:
		dl = inventory_test_helper.create_download(test)

		package_id_to_history = util.get_histories(dl, test['analysis_params'])
		cogs_summary = cogs_util.create_cogs_summary(
			d=dl,
			ctx=AnalysisContext(
				output_root_dir='tmp',
				read_params=ReadParams(
					use_cached_dataframes=False
				),
				write_params=WriteOutputParams(
					save_download_dataframes=False
				)
			),
			id_to_history=package_id_to_history,
			params=test['analysis_params']
		)

		rows = cogs_summary['bottomsup_cogs_rows']
		rows = rows[1:] # cut off the header row, we dont need to test that
		self.assertEqual(len(test['expected_cogs_rows']), len(rows))

		for i in range(len(rows)):

			expected_row_dict = test['expected_cogs_rows'][i]
			summary_cols = cogs_util.get_cogs_summary_columns()

			if test.get('simplified_check'):
				actual_row = rows[i][0:3]
				expected_row = dict_to_array(expected_row_dict, summary_cols[0:3])
			else:
				actual_row = rows[i]
				expected_row = dict_to_array(expected_row_dict, summary_cols)

			self.assertEqual(expected_row, actual_row)

	def _get_test_input(self) -> Dict:
		test: Dict = {
			'incoming_transfer_packages': [
				transfer_pkg(
					id=1, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=5.0,
					# Cost is 50 cents per item 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020')
				)
			],
			'outgoing_transfer_packages': [],
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
					'receipt_number': 'r2',
					'tx_quantity_sold': 1,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/4/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r3',
					'tx_quantity_sold': 2,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r4',
					'tx_quantity_sold': 1,
					'tx_total_price': 2.50,
					'tx_unit_of_measure': 'Each'
				}, # Missing incoming pricing information, so it has 100% profit margin
				{
					'sales_datetime': parser.parse('11/5/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r5',
					'tx_quantity_sold': 3,
					'tx_total_price': 3.50,
					'tx_unit_of_measure': 'Each'
				}, 
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			]
		}
		return test

	def test_default_params(self) -> None:
		test = self._get_test_input()
		test['analysis_params'] = get_default_params()
		test['expected_cogs_rows'] = [
			{
				'year_month': '2020-10',
				'revenue': 10.0,
				'cogs': 2.0,
				'margin_$': 8.0, 
				'margin_%': 0.8,
				'txs_with_incoming': 3, 
				'num_txs': 4, 
				'coverage': 0.75
			},
			{
				'year_month': '2020-11',
				'revenue': 3.5,
				'cogs': 1.5,
				'margin_$': 2.0, 
				'margin_%': 0.57,
				'txs_with_incoming': 1, 
				'num_txs': 1, 
				'coverage': 1.0
			}
		]
		self._run_test(test)

	def test_remove_profit_margin_above(self) -> None:
		test = self._get_test_input()
		params = get_default_params()
		params['cogs_analysis_params'] = {
			'readjust_profit_threshold': 0.8,
			'readjust_type': 'remove'
		}

		test['analysis_params'] = params
		test['simplified_check'] = True
		test['expected_cogs_rows'] = [
			{
				'year_month': '2020-10',
				'revenue': 7.5, # instead of 10 because it gets filtered out
				'cogs': 2.0
			},
			{
				'year_month': '2020-11',
				'revenue': 3.5,
				'cogs': 1.5
			}
		]
		self._run_test(test)

	def test_readjust_profit_margin_above(self) -> None:
		test: Dict = {
			'incoming_transfer_packages': [
				transfer_pkg(
					id=1, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=5.0,
					# Cost is 50 cents per item 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020')
				),
				transfer_pkg(
					id=2, 
					delivery_type=DeliveryType.INCOMING_INTERNAL,
					quantity=10.0,
					wholesale_price=5.0,
					# Cost is 50 cents per item 
					received_unit_of_measure='Each',
					received_datetime=parser.parse('10/1/2020')
				)
			],
			'outgoing_transfer_packages': [],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 10,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p2',
					'receipt_number': 'r2',
					'tx_quantity_sold': 10,
					'tx_total_price': 10,
					'tx_unit_of_measure': 'Each'
				}
			],
			'sales_receipts': [
			],
			'inventory_packages': [
			]
		}
		params = get_default_params()
		params['cogs_analysis_params'] = {
			'readjust_profit_threshold': 0.8,
			'readjust_type': 'adjust'
		}

		test['analysis_params'] = params
		test['simplified_check'] = True
		test['expected_cogs_rows'] = [
			{
				'year_month': '2020-10',
				'revenue': 20.0,
				# 5.0 because the p1 would have a profit margin of 0.95, but
				# then gets adjusted down by looking at the unit size, so
				# we end up saying it had a $5 per unit cost
				'cogs': 5.0 + 10 * 0.5
			}
		]
		self._run_test(test)

	def test_fill_missing_incoming_with_margin_estimate(self) -> None:
		# This tests that when we fill in a package's input cost data,
		# it comes out to be the same number, e.g.,
		# product_category_type: Buds -> 0.4 margin
		# then the cogs should come out as that as well

		test: Dict = {
			'incoming_transfer_packages': [],
			'outgoing_transfer_packages': [],
			'sales_transactions': [
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r1',
					'tx_quantity_sold': 1,
					'tx_total_price': 10,
					'tx_unit_of_measure': 'Each'
				},
				{
					'sales_datetime': parser.parse('10/1/2020'),
					'tx_package_id': 'p1',
					'receipt_number': 'r2',
					'tx_quantity_sold': 2,
					'tx_total_price': 10,
					'tx_unit_of_measure': 'Each'
				}
			],
			'sales_receipts': [
			],
			'inventory_packages': [
				inventory_pkg(
					id=1,
					package_type='active',
					quantity=2.0,
					product_category_name='Buds'
				)
			]
		}
		params = get_default_params()
		params['use_margin_estimate_config'] = True
		params['margin_estimate_config'] = {
			'category_to_margin_estimate': {
				'Buds': 0.4
			}
		}
		test['analysis_params'] = params
		test['simplified_check'] = True
		test['expected_cogs_rows'] = [
			{
				'year_month': '2020-10',
				'revenue': 20.0,
				'cogs': 12.0 # with 0.4 profit margin, the cost must be 12, so 12 / 20 == 0.4 profit margin
			}
		]
		self._run_test(test)
