import json
import unittest

from typing import List, Dict, cast

from bespoke.db.db_constants import ProductType
from bespoke.db import models
from bespoke.finance import contract_util

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict

def _get_default_contract_config(overrides: Dict) -> Dict:
	contract_dict = ContractInputDict(
					interest_rate=0.05,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=30,
					late_fee_structure='' # unused
	)

	d = cast(Dict, contract_dict)
	if overrides.get('late_fee_structure'):
		d['late_fee_structure'] = overrides['late_fee_structure']

	return contract_test_helper.create_contract_config(
				product_type=ProductType.INVENTORY_FINANCING,
				input_dict=cast(ContractInputDict, d)
		)

class TestLateFeeStructure(unittest.TestCase):

	def test_success_get_fee_multiplier(self) -> None:
		config = _get_default_contract_config({
			'late_fee_structure': json.dumps(
				{'1-3': 0.5, '4-9': 0.4, '10+': 0.3})
		})
		contract = contract_util.Contract(models.Contract(
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=config
		).as_dict())

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

	def test_failure_invalid_examples(self) -> None:
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
			}
		]

		for i in range(len(tests)):
			test = tests[i]
			config = _get_default_contract_config({
				'late_fee_structure': json.dumps(test['late_fee_structure'])
			})
			contract = contract_util.Contract(models.Contract(
						product_type=ProductType.INVENTORY_FINANCING,
						product_config=config
			).as_dict())
			got_exception = False
			try:
				contract.get_fee_multiplier(days_past_due=2)
			except Exception as e:
				got_exception = True
				self.assertIn(test['in_err_msg'], '{}'.format(e))

			self.assertTrue(got_exception, msg='We should receive exceptions in all of these tests. Test index: {}'.format(i))
