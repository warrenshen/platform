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
from bespoke.finance.loans import fee_util
from bespoke.finance.loans.fee_util import ProratedFeeInfoDict
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

def _get_contract(
	minimum_monthly_amount: float = None,
	minimum_quarterly_amount: float = None,
	minimum_annual_amount: float = None
) -> models.Contract:
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
				minimum_monthly_amount=minimum_monthly_amount,
				minimum_quarterly_amount=minimum_quarterly_amount,
				minimum_annual_amount=minimum_annual_amount
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

		fee_accumulator = fee_util.FeeAccumulator()
		test['populate_fn'](fee_accumulator)
		contract_helper, err = contract_util.ContractHelper.build(
			company_id=company_id, contract_dicts=[c.as_dict() for c in contracts]
		)
		self.assertIsNone(err)
		fees_dict, err = fee_util.get_cur_minimum_fees(contract_helper, today, fee_accumulator)
		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg)
			return

		self.assertIsNone(err)
		# Dont need to test prorated_info here
		del cast(Any, fees_dict)['prorated_info']
		del test['expected_fee_dict']['prorated_info']
		test_helper.assertDeepAlmostEqual(self, test['expected_fee_dict'], cast(Dict, fees_dict))

	def test_monthly_fees_no_duration_set(self) -> None:
		
		def populate_fn(fee_accumulator: fee_util.FeeAccumulator) -> None:
			pass

		test: Dict = {
			'today': '10/01/2020',
			'contracts': [_get_contract()],
			'populate_fn': populate_fn,
			'expected_fee_dict': fee_util.FeeDict(
				minimum_amount=0.0,
				amount_accrued=0.0,
				amount_short=0.0,
				duration=None,
				prorated_info=None
			)
		}
		self._run_test(test)

	def test_accumulate_per_month(self) -> None:

		def populate_fn(fee_accumulator: fee_util.FeeAccumulator) -> None:
			contract_start_date = date_util.load_date_str('01/02/2020')
			contract_end_date = date_util.load_date_str('01/02/2021')

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('01/03/2020')
			)

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('02/03/2020') # gets ignored outside the month
			)

		test: Dict = {
			'today': '01/10/2020',
			'contracts': [_get_contract(minimum_monthly_amount=3.0)],
			'populate_fn': populate_fn,
			'expected_fee_dict': fee_util.FeeDict(
				minimum_amount=3.0,
				amount_accrued=2.1,
				amount_short=0.9,
				duration='monthly',
				prorated_info=None
			)
		}
		self._run_test(test)

	def test_accumulate_per_quarter(self) -> None:

		def populate_fn(fee_accumulator: fee_util.FeeAccumulator) -> None:
			contract_start_date = date_util.load_date_str('01/02/2020')
			contract_end_date = date_util.load_date_str('01/02/2021')

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('01/03/2020')
			)

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('06/03/2020') # gets ignored outside the quarter
			)

		test: Dict = {
			'today': '01/10/2020',
			'contracts': [_get_contract(minimum_quarterly_amount=3.0)],
			'populate_fn': populate_fn,
			'expected_fee_dict': fee_util.FeeDict(
				minimum_amount=3.0,
				amount_accrued=2.1,
				amount_short=0.9,
				duration='quarterly',
				prorated_info=None
			)
		}
		self._run_test(test)

	def test_accumulate_annually(self) -> None:

		def populate_fn(fee_accumulator: fee_util.FeeAccumulator) -> None:
			contract_start_date = date_util.load_date_str('01/02/2020')
			contract_end_date = date_util.load_date_str('01/02/2021')

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('01/03/2020')
			)

			fee_accumulator.accumulate(
				todays_contract_start_date=contract_start_date,
				todays_contract_end_date=contract_end_date,
				interest_for_day=2.0,
				fees_for_day=0.1,
				day=date_util.load_date_str('06/03/2021') # gets ignored outside the quarter
			)

		test: Dict = {
			'today': '01/10/2020',
			'contracts': [_get_contract(minimum_annual_amount=3.0)],
			'populate_fn': populate_fn,
			'expected_fee_dict': fee_util.FeeDict(
				minimum_amount=3.0,
				amount_accrued=2.1,
				amount_short=0.9,
				duration='annually',
				prorated_info=None
			)
		}
		self._run_test(test)

class TestGetProratedFeeInfo(unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		fee_info = fee_util.get_prorated_fee_info(
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
				day_to_pay='01/10/2021'
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
				day_to_pay='02/29/2020'
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
				day_to_pay='02/28/2021'
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
				day_to_pay='02/28/2021'
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
				day_to_pay='12/31/2020'
			)
		}
		self._run_test(test)

	def test_quarterly_prorated(self) -> None:
		numerator = 30 + 31 + 30 - (30 + 9)
		denom = 30 + 31 + 30
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.QUARTERLY,
			'contract_start_date': '05/10/2020',
			'today': '06/20/2020', # Overlapping quarter, so we must pro-rate
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=numerator, # sum of the number of days in the quarter
				denom=denom,
				fraction=numerator / denom,
				day_to_pay='06/30/2020'
			)
		}
		self._run_test(test)

	def test_quarterly_not_prorated_first_day_of_quarter(self) -> None:
		numerator = 30 + 31 + 30
		denom = 30 + 31 + 30
		test: Dict = {
			'duration': contract_util.MinimumAmountDuration.QUARTERLY,
			'contract_start_date': '04/01/2020',
			'today': '06/20/2020', # Overlapping quarter, so we must pro-rate
			'expected_fee_info': ProratedFeeInfoDict(
				numerator=numerator, # sum of the number of days in the quarter
				denom=denom,
				fraction=1,
				day_to_pay='06/30/2020'
			)
		}
		self._run_test(test)
