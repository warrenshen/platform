import json
import unittest
from typing import Dict, List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.finance import contract_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict


def _get_default_contract_config(product_type: str, overrides: Dict) -> Dict:
	contract_dict = ContractInputDict(
		maximum_principal_amount=120000.01,
		max_days_until_repayment=30,
		late_fee_structure='', # unused
	)
	d = cast(Dict, contract_dict)
	d.update(overrides)
	return contract_test_helper.create_contract_config(
		product_type=product_type,
		input_dict=cast(ContractInputDict, d)
	)

def _get_line_of_credit_contract_config(overrides: Dict) -> Dict:
	contract_dict = ContractInputDict(
		interest_rate=0.05,
		maximum_principal_amount=120000,
		borrowing_base_accounts_receivable_percentage=None,
		borrowing_base_inventory_percentage=None,
		borrowing_base_cash_percentage=None,
		borrowing_base_cash_in_daca_percentage=None,
	)
	d = cast(Dict, contract_dict)
	d.update(overrides)
	return contract_test_helper.create_contract_config(
		product_type=ProductType.LINE_OF_CREDIT,
		input_dict=cast(ContractInputDict, d)
	)

class TestContractHelper(unittest.TestCase):

	def test_missing_start_date(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
			'interest_rate': 0.05,
		})
		company_id = 'unused_for_debug_msg'
		contract_dicts = [
			models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=None,
				end_date=None,
				adjusted_end_date=date_util.load_date_str('2/11/2020'),
				terminated_at=None
			)
		]

		contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
		self.assertIn('missing a start_date', err.msg)

	def test_missing_end_date(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
			'interest_rate': 0.05,
		})
		company_id = 'unused_for_debug_msg'
		contract_dicts = [
			models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/11/2020'),
				end_date=None,
				adjusted_end_date=None,
				terminated_at=None
			)
		]

		contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
		self.assertIn('missing an adjusted_end_date', err.msg)

	def test_overlapping_date_ranges(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
			'interest_rate': 0.05,
		})
		company_id = 'unused_for_debug_msg'
		contract_dicts = [
			models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/11/2020'),
				end_date=None,
				adjusted_end_date=date_util.load_date_str('2/20/2020'),
				terminated_at=None
			),
			models.ContractDict(
				id='unused2',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/12/2020'),
				end_date=None,
				adjusted_end_date=date_util.load_date_str('2/28/2020'),
				terminated_at=None
			)
		]

		contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
		self.assertIn('overlaps in time', err.msg)

	def test_single_contract(self) -> None:
		tests: List[Dict] = [
			{
				'cur_date': '1/1/2020',
				'expected_contract_index': 0
			},
			{
				'cur_date': '2/11/2020',
				'expected_contract_index': 0
			}
		]

		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
			'interest_rate': 0.05,
		})
		company_id = 'unused_for_debug_msg'
		contract_dicts = [
			models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('1/1/2020'),
				end_date=date_util.load_date_str('2/10/2020'),
				adjusted_end_date=date_util.load_date_str('2/11/2020'),
				terminated_at=None
			)
		]

		for test in tests:
			contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
			self.assertIsNone(err)
			contract, err = contract_helper.get_contract(date_util.load_date_str(test['cur_date']))
			self.assertIsNone(err)
			expected_contract_dict = contract_dicts[test['expected_contract_index']]
			self.assertIsNone(err)
			self.assertDictEqual(cast(Dict, contract._contract_dict), expected_contract_dict)

	def test_multiple_contracts_in_different_date_ranges(self) -> None:
		company_id = 'unused_for_debug_msg'

		contract_dicts = [
			models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
					'late_fee_structure': json.dumps({'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
					'interest_rate': 0.05,
				}),
				start_date=date_util.load_date_str('2/11/2020'),
				end_date=None,
				adjusted_end_date=date_util.load_date_str('2/15/2020'),
				terminated_at=None
			),
			models.ContractDict(
				id='unused2',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
					'late_fee_structure': json.dumps({'1-3': 0.1, '4-9': 0.2, '10+': 0.5}),
					'interest_rate': 0.05,
				}),
				start_date=date_util.load_date_str('2/16/2020'),
				end_date=None,
				adjusted_end_date=date_util.load_date_str('2/28/2020'),
				terminated_at=None
			)
		]

		contract_helper, err = contract_util.ContractHelper.build(company_id, contract_dicts)
		self.assertIsNone(err)

		contract, err = contract_helper.get_contract(date_util.load_date_str('2/11/2020'))
		self.assertIsNone(err)
		self.assertDictEqual(cast(Dict, contract_dicts[0]), cast(Dict, contract._contract_dict))

		contract, err = contract_helper.get_contract(date_util.load_date_str('2/25/2020'))
		self.assertIsNone(err)
		self.assertDictEqual(cast(Dict, contract_dicts[1]), cast(Dict, contract._contract_dict))

		# Not contract specified for this time range
		contract, err = contract_helper.get_contract(date_util.load_date_str('1/1/2020'))
		self.assertIsNotNone(err)

class TestDynamicInterestRate(unittest.TestCase):

	def test_missing_start_date(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'dynamic_interest_rate': json.dumps(
				{'-3': 0.01})
		})
		company_id = 'unused_for_debug_msg'
		contract_dict = models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/10/2020'),
				end_date=date_util.load_date_str('2/11/2020'),
				adjusted_end_date=date_util.load_date_str('2/11/2020'),
				terminated_at=None
		)

		contract, _ = contract_util.Contract.build(contract_dict, validate=False)
		success, err = contract._validate_dynamic_interest_rate()
		self.assertIn('missing a start', err.msg)

	def test_missing_end_date(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'dynamic_interest_rate': json.dumps(
				{'1-': 0.5})
		})
		company_id = 'unused_for_debug_msg'
		contract_dict = models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/10/2020'),
				end_date=date_util.load_date_str('2/11/2020'),
				adjusted_end_date=date_util.load_date_str('2/11/2020'),
				terminated_at=None
		)

		contract, _ = contract_util.Contract.build(contract_dict, validate=False)
		success, err = contract._validate_dynamic_interest_rate()
		self.assertIn('end date', err.msg)

	def test_overlapping_date_ranges(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'dynamic_interest_rate': json.dumps(
				{'10/01/2020-10/30/2020': 0.5, '10/29/2020-11/05/2020': 0.2})
		})
		company_id = 'unused_for_debug_msg'
		contract_dict = models.ContractDict(
				id='unused',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=config,
				start_date=date_util.load_date_str('2/10/2020'),
				end_date=date_util.load_date_str('11/05/2020'),
				adjusted_end_date=date_util.load_date_str('11/05/2020'),
				terminated_at=None
		)

		contract, _ = contract_util.Contract.build(contract_dict, validate=False)
		success, err = contract._validate_dynamic_interest_rate()
		self.assertIn('which overlaps', err.msg)

	def test_multiple_contracts_with_invalid_date_ranges(self) -> None:
		company_id = 'unused_for_debug_msg'

		tests: List[Dict] = [
			{
				'contract': models.ContractDict(
					id='unused',
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
						'dynamic_interest_rate': json.dumps(
							{'2/12/2020-10/30/2020': 0.5}
						)
					}),
					start_date=date_util.load_date_str('2/11/2020'),
					end_date=None,
					adjusted_end_date=date_util.load_date_str('2/15/2020'),
					terminated_at=None
				),
				'in_err_msg': 'first dynamic interest rate'
			},
			{
				'contract': models.ContractDict(
					id='unused2',
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
						'dynamic_interest_rate': json.dumps(
							{'2/16/2020-10/30/2020': 0.5, '11/01/2020-11/05/2020': 0.2}
						)
					}),
					start_date=date_util.load_date_str('2/16/2020'),
					end_date=None,
					adjusted_end_date=date_util.load_date_str('11/05/2020'),
					terminated_at=None
				),
				'in_err_msg': 'one day after the previous'
			},
			{
				'contract': models.ContractDict(
					id='unused2',
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
						'dynamic_interest_rate': json.dumps(
							{'2/16/2020-10/30/2020': 0.5, '10/31/2020-12/26/2020': 0.2}
						)
					}),
					start_date=date_util.load_date_str('2/16/2020'),
					end_date=None,
					adjusted_end_date=date_util.load_date_str('12/28/2020'),
					terminated_at=None
				),
				'in_err_msg': 'last dynamic interest rate'
			}
		]

		for test in tests:
			contract, _ = contract_util.Contract.build(test['contract'], validate=False)
			success, err = contract._validate_dynamic_interest_rate()
			self.assertIn(test['in_err_msg'], err.msg)

	def test_multiple_valid_interest_rates_on_different_days(self) -> None:
		company_id = 'unused_for_debug_msg'

		contract_dict = models.ContractDict(
					id='unused',
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
						'dynamic_interest_rate': json.dumps(
							{'2/16/2020-10/30/2020': 0.5, '10/31/2020-12/26/2020': 0.2}
						)
					}),
					start_date=date_util.load_date_str('2/16/2020'),
					end_date=None,
					adjusted_end_date=date_util.load_date_str('12/26/2020'),
					terminated_at=None
		)
		
		contract, _ = contract_util.Contract.build(contract_dict, validate=False)
		success, err = contract._validate_dynamic_interest_rate()
		self.assertIsNone(err)

		self.assertEqual((0.5, None), contract.get_interest_rate(
			date_util.load_date_str('2/16/2020')))
		self.assertEqual((0.5, None), contract.get_interest_rate(
			date_util.load_date_str('2/20/2020')))
		self.assertEqual((0.2, None), contract.get_interest_rate(
			date_util.load_date_str('10/31/2020')))
		self.assertEqual((0.2, None), contract.get_interest_rate(
			date_util.load_date_str('12/26/2020')))

		interest_rate, err = contract.get_interest_rate(
			date_util.load_date_str('12/26/2021'))
		self.assertIn('no interest rate configured', err.msg)

	def test_update_fields_on_contract_dates(self) -> None:
		company_id = 'unused_for_debug_msg'
		tests: List[Dict] = [
			{
				# multiple dates
				'dynamic_interest_rate_dict': {
					'02/16/2020-08/28/2020': 0.5, 
					'08/29/2020-10/30/2020': 0.2,
					'10/31/2020-12/26/2020': 0.1
				},
				'expected_interest_rate_dict': {
					'01/02/2020-08/28/2020': 0.5, 
					'08/29/2020-10/30/2020': 0.2,
					'10/31/2020-12/02/2020': 0.1
				}
			},
			{
				# 2 dates
				'dynamic_interest_rate_dict': {'2/16/2020-10/30/2020': 0.5, '10/31/2020-12/26/2020': 0.2},
				'expected_interest_rate_dict': {'01/02/2020-10/30/2020': 0.5, '10/31/2020-12/02/2020': 0.2}
			},
			{
				# 1 date
				'dynamic_interest_rate_dict': {'2/16/2020-10/30/2020': 0.5},
				'expected_interest_rate_dict': {'01/02/2020-12/02/2020': 0.5}
			},
		]

		for test in tests:
			contract_dict = models.ContractDict(
						id='unused',
						product_type=ProductType.INVENTORY_FINANCING,
						product_config=_get_default_contract_config(ProductType.INVENTORY_FINANCING, {
							'dynamic_interest_rate': json.dumps(test['dynamic_interest_rate_dict']),
							'late_fee_structure': json.dumps({'1-3': 0.1, '4-9': 0.2, '10+': 0.5})
						}),
						start_date=date_util.load_date_str('2/16/2020'),
						end_date=None,
						adjusted_end_date=date_util.load_date_str('12/26/2020'),
						terminated_at=None
			)
			
			new_start_date = date_util.load_date_str('01/02/2020')
			new_end_date = date_util.load_date_str('12/02/2020')
			contract, _ = contract_util.Contract.build(contract_dict, validate=False)
			success, err = contract.update_fields_dependent_on_contract_dates(
				new_contract_start_date=new_start_date,
				new_contract_end_date=new_end_date
			)
			self.assertIsNone(err)

			interest_rate_dict = contract._get_dynamic_interest_rate_dict()
			self.assertDictEqual(test['expected_interest_rate_dict'], interest_rate_dict)

			contract_dict['product_config'] = contract.get_product_config()
			contract_dict['start_date'] = new_start_date
			contract_dict['end_date'] = new_end_date
			contract_dict['adjusted_end_date'] = new_end_date
			contract2, err = contract_util.Contract.build(contract_dict, validate=True)
			self.assertIsNone(err)

class TestContractMethods(unittest.TestCase):

	def test_getters(self) -> None:
		late_fee_structure = json.dumps({
			'1-14': 0.25,
			'15-29': 0.50,
			'30+': 1.0
		})

		contract = models.Contract(
				company_id='some-uuid',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=None,
						max_days_until_repayment=0,
						late_fee_structure=late_fee_structure,
						us_state='OR',
						timezone='America/New York'
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
		# Technically we allow the minimum amounts to all be null, since some customers
		# dont have any minimums.
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		self.assertIsNone(err)
		self.assertEqual(('OR', None), contract_obj.get_us_state())
		#self.assertEqual(('America/New York', None), contract_obj.get_timezone_str())

	def test_getters_unset_values(self) -> None:
		late_fee_structure = json.dumps({
			'1-14': 0.25,
			'15-29': 0.50,
			'30+': 1.0
		})

		contract = models.Contract(
				company_id='some-uuid',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=None,
						max_days_until_repayment=0,
						late_fee_structure=late_fee_structure,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
		# Technically we allow the minimum amounts to all be null, since some customers
		# dont have any minimums.
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		self.assertIsNone(err)
		# Defaults to CA
		self.assertEqual(('CA', None), contract_obj.get_us_state())
		self.assertEqual(('US/Pacific', None), contract_obj.get_timezone_str())

	def test_validate_no_errors(self) -> None:
		late_fee_structure = json.dumps({
			'1-14': 0.25,
			'15-29': 0.50,
			'30+': 1.0
		})

		contract = models.Contract(
				company_id='some-uuid',
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=None,
						max_days_until_repayment=0,
						late_fee_structure=late_fee_structure,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
		# Technically we allow the minimum amounts to all be null, since some customers
		# dont have any minimums.
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		self.assertIsNone(err)

	def test_validate_error_due_to_factoring_fee_threshold_but_no_starting_value(self) -> None:
		late_fee_structure = json.dumps({
			'1-14': 0.25,
			'15-29': 0.50,
			'30+': 1.0
		})

		contract = models.Contract(
			company_id='some-uuid',
			product_type=ProductType.INVENTORY_FINANCING,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.INVENTORY_FINANCING,
				input_dict=ContractInputDict(
					interest_rate=0.05,
					maximum_principal_amount=120000.01,
					minimum_monthly_amount=None,
					max_days_until_repayment=0,
					factoring_fee_threshold=20.0,
					late_fee_structure=late_fee_structure,
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
		# Technically we allow the minimum amounts to all be null,
		# since some customers don't have any minimums.
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		self.assertIn('Starting Value', err.msg)

class TestLateFeeStructure(unittest.TestCase):

	def test_success_get_fee_multiplier(self) -> None:
		config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3}),
			'interest_rate': 0.05,
		})
		contract, err = contract_util.Contract.build(models.Contract(
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=config
		).as_dict(), validate=True)
		self.assertIsNone(err)

		tests: List[Dict] = [
			{
				'days_past_due_list': [1, 2, 3],
				'expected_val': 0.5
			},
			{
				'days_past_due_list': [4, 5, 6, 7, 8, 9],
				'expected_val': 0.4
			},
			{
				'days_past_due_list': [10, 100, 100000],
				'expected_val': 0.3
			}
		]
		for test in tests:
			for days_past_due in test['days_past_due_list']:
				multiplier, err = contract.get_fee_multiplier(days_past_due=days_past_due)
				self.assertIsNone(err)
				self.assertAlmostEqual(test['expected_val'], multiplier)

	def test_failure_invalid_inventory_financing(self) -> None:
		tests: List[Dict] = [
			{
				'late_fee_structure': {},
				'in_err_msg': 'no ranges provided'
			},
			{
				'late_fee_structure': 'invalid json',
				'in_err_msg': 'is not a dict'
			},
			{
				'late_fee_structure': {'1-7': 'hello'},
				'in_err_msg': 'key must be a string'
			},
			{
				'late_fee_structure': {'hello+': 0.5},
				'in_err_msg': 'that ends with a "+"'
			},
			{
				'late_fee_structure': {'7-10a': 0.5},
				'in_err_msg': 'number-number'
			},
			{
				'late_fee_structure': {'1-10': 0.5, '2-11': 0.4, '12+': 0.5},
				'in_err_msg': 'overlaps'
			},
			{
				'late_fee_structure': {'1-12': 0.5, '9-11': 0.4, '12+': 0.5},
				'in_err_msg': 'overlaps'
			},
			{
				'late_fee_structure': {'1-10': 0.5, '11-29': 0.4, '40+': 0.6},
				'in_err_msg': 'not consecutive'
			},
			{
				'late_fee_structure': {'1-10': 0.5, '11-40': 0.4},
				'in_err_msg': 'No infinity'
			},
			{
				'late_fee_structure': {'2-10': 0.5, '11-40': 0.4, '41+': 0.5},
				'in_err_msg': 'must start with day 1'
			},
			{
				'late_fee_structure': {'1-10': 1.5, '11+': 0.1},
				'in_err_msg': 'between 0 and 1',
			},
			{
				'late_fee_structure': {'1-10': -0.1, '11+': 0.1},
				'in_err_msg': 'between 0 and 1',
			}
		]

		# Test it fails because of validate=True
		for i in range(len(tests)):
			test = tests[i]
			config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
				'late_fee_structure': json.dumps(test['late_fee_structure']),
				'interest_rate': 0.05,
			})
			contract, err = contract_util.Contract.build(models.Contract(
						product_type=ProductType.INVENTORY_FINANCING,
						product_config=config
			).as_dict(), validate=True)
			self.assertIn(test['in_err_msg'], err.msg)

		for i in range(len(tests)):
			test = tests[i]
			config = _get_default_contract_config(ProductType.INVENTORY_FINANCING, {
				'late_fee_structure': json.dumps(test['late_fee_structure']),
				'interest_rate': 0.05,
			})
			contract, err = contract_util.Contract.build(models.Contract(
						product_type=ProductType.INVENTORY_FINANCING,
						product_config=config
			).as_dict(), validate=False)
			self.assertIsNone(err)

				# Test it fails because you didnt validate in the build, but your try to grab it here.
			_, err = contract.get_fee_multiplier(days_past_due=2)
			self.assertIn(test['in_err_msg'], err.msg)

	def test_failure_invalid_line_of_credit(self) -> None:
		tests: List[Dict] = [
			{
				'update': {
					'borrowing_base_accounts_receivable_percentage': 100.0,
					'borrowing_base_inventory_percentage': 1.0,
					'borrowing_base_cash_percentage': 0.0,
					'borrowing_base_cash_in_daca_percentage': 0.5,
				},
				'in_err_msg': 'between 0 and 1'
			},
			{
				'update': {
					'borrowing_base_accounts_receivable_percentage': 0.5,
					'borrowing_base_inventory_percentage': 100.0,
					'borrowing_base_cash_percentage': 1.0,
					'borrowing_base_cash_in_daca_percentage': 0.5,
				},
				'in_err_msg': 'between 0 and 1'
			},
			{
				'update': {
					'borrowing_base_accounts_receivable_percentage': 0.5,
					'borrowing_base_inventory_percentage': 1.0,
					'borrowing_base_cash_percentage': 100.0,
					'borrowing_base_cash_in_daca_percentage': 0.5,
				},
				'in_err_msg': 'between 0 and 1'
			},
			{
				'update': {
					'borrowing_base_accounts_receivable_percentage': 1.0,
					'borrowing_base_inventory_percentage': 0.5,
					'borrowing_base_cash_percentage': 0.0,
					'borrowing_base_cash_in_daca_percentage': 100.0,
				},
				'in_err_msg': 'between 0 and 1'
			},
			{
				'update': {
					'borrowing_base_accounts_receivable_percentage': 0.5,
					'borrowing_base_inventory_percentage': 0.5,
					'borrowing_base_cash_percentage': -0.1,
					'borrowing_base_cash_in_daca_percentage': 0.5,
				},
				'in_err_msg': 'between 0 and 1'
			}
		]

		# Test it fails because of validate=True
		for i in range(len(tests)):
			test = tests[i]
			config = _get_line_of_credit_contract_config(test['update'])
			contract, err = contract_util.Contract.build(models.Contract(
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=config,
			).as_dict(), validate=True)
			self.assertIn(test['in_err_msg'], err.msg)
