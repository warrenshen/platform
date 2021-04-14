import datetime
import decimal
import json
import uuid
import unittest
from typing import Any, Callable, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util
from bespoke.finance.reports import loan_balances
from bespoke.finance.loans import loan_calculator
from bespoke.finance.loans.loan_calculator import ProratedFeeInfoDict
from bespoke.finance import contract_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.payments import payment_test_helper

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

def _get_contract() -> models.Contract:
	return models.Contract(
		company_id=None, # filled in later by test
		product_type=ProductType.INVENTORY_FINANCING,
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.INVENTORY_FINANCING,
			input_dict=ContractInputDict(
				interest_rate=0.02,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=0,
				late_fee_structure=_get_late_fee_structure(),
			)
		),
		start_date=date_util.load_date_str('1/1/2020'),
		adjusted_end_date=date_util.load_date_str('12/1/2020')
	)

class TestMinimumFees(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		contracts = cast(List[models.Contract], test['contracts'])
		today = date_util.load_date_str(test['today'])

		fee_accumulator = loan_calculator.FeeAccumulator()
		contract_helper, err = contract_util.ContractHelper.build(
			company_id=company_id, contract_dicts=[c.as_dict() for c in contracts]
		)
		self.assertIsNone(err)
		fees_dict, err = loan_balances._get_cur_minimum_fees(contract_helper, today, fee_accumulator)
		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg)
			return

		self.assertIsNone(err)
		test_helper.assertDeepAlmostEqual(self, test['expected_fee_dict'], cast(Dict, fees_dict))

	def test_monthly_fees_no_duration_set(self) -> None:
		test: Dict = {
			'today': '10/01/2020',
			'contracts': [_get_contract()],
			'expected_fee_dict': loan_balances.FeeDict(
				minimum_amount=0.0,
				amount_accrued=0.0,
				amount_short=0.0,
				duration=None
			)
		}
		self._run_test(test)

class TestGetProratedFeeInfo(unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		fee_info = loan_calculator.get_prorated_fee_info(
			duration=test['duration'],
			contract_start_date=date_util.load_date_str(test['contract_start_date']),
			today=date_util.load_date_str(test['today'])
		)
		test_helper.assertDeepAlmostEqual(self, test['expected_fee_info'], cast(Dict, fee_info))

	def test_yearly(self) -> None:
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.ANNUALLY,
			'contract_start_date': '01/10/2020',
			'today': '10/20/2020', # doesnt play a factor in the yearly calculation
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=365,
				denom=365,
				fraction=1,
				day_to_pay=date_util.load_date_str('01/10/2021')
			)
		}
		self._run_test(test)

	def test_monthly_not_prorated(self) -> None:
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.MONTHLY,
			'contract_start_date': '01/10/2020',
			'today': '2/20/2020', # doesnt play a factor in the yearly calculation
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=29,
				denom=29,
				fraction=1,
				day_to_pay=date_util.load_date_str('02/29/2020')
			)
		}
		self._run_test(test)

	def test_monthly_prorated(self) -> None:
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.MONTHLY,
			'contract_start_date': '02/10/2021',
			'today': '2/20/2021', # doesnt play a factor in the yearly calculation
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=19, # 28 days - 9 days before the contract took effect
				denom=28,
				fraction=19 / 28,
				day_to_pay=date_util.load_date_str('02/28/2021')
			)
		}
		self._run_test(test)

	def test_monthly_prorated_first_day_of_month(self) -> None:
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.MONTHLY,
			'contract_start_date': '02/01/2021',
			'today': '2/20/2021', # doesnt play a factor in the yearly calculation
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=28, # Still need to pay everything this month
				denom=28,
				fraction=1,
				day_to_pay=date_util.load_date_str('02/28/2021')
			)
		}
		self._run_test(test)

	def test_quarterly_not_prorated(self) -> None:
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.QUARTERLY,
			'contract_start_date': '05/10/2020',
			'today': '12/20/2020', # Use today's quarter when not pro-rating
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=31 + 30 + 31, # sum of the number of days in the quarter
				denom=31 + 30 + 31,
				fraction=1,
				day_to_pay=date_util.load_date_str('12/31/2020')
			)
		}
		self._run_test(test)
