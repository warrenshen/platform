import decimal
import json
import uuid
from datetime import timedelta
from sqlalchemy.orm.session import Session
from typing import Any, Callable, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance import financial_summary_util, number_util
from bespoke.finance.loans import reports_util
from bespoke.finance.payments import payment_util, repayment_util_fees
from bespoke.finance.reports.loan_balances import LoansInfoEntryDict
from bespoke.finance.types import payment_types
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.finance import finance_test_helper
from bespoke_test.payments import payment_test_helper


def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

class TestCalculateLoanBalance(db_unittest.TestCase):

	def _run_test(
		self, 
		test: Dict,
		loan_ids: List[str],
	) -> None:
		today = date_util.load_date_str(test['today'])
		today_date_dicts: List[Dict] = [
			{
				'report_date': today,
				'days_back': 0,
				'today': today
			},
			{
				'report_date': today + timedelta(days=2),
				'days_back': 10,
				'today': today
			}
		]

		for today_date_dict in today_date_dicts:
			self.reset()
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)

			with session_scope(self.session_maker) as session:
				session.add(models.CompanySettings(
					company_id=company_id,
					vendor_agreement_docusign_template='unused'
				))

				if test.get('populate_fn'):
					test['populate_fn'](session, seed, company_id, loan_ids)

			company_dict = models.CompanyDict(
					id=company_id,
					identifier='D1',
					name='Distributor 1'
			)

			today = today_date_dict['today']

			day_to_customer_update, err = reports_util.update_company_balance(
				session_maker=self.session_maker,
				company=company_dict,
				report_date=today_date_dict['report_date'],
				update_days_back=today_date_dict['days_back'],
				is_past_date_default_val=False,
				include_debug_info=False,
				today_for_test=today
			)
			self.assertIsNone(err)

			customer_update = day_to_customer_update[today]
			# Sort by increasing adjusted maturity date for consistency in tests
			loan_updates = customer_update['loan_updates']
			loan_updates.sort(key=lambda u: u['adjusted_maturity_date'])

			self.assertEqual(len(test['expected_loan_updates']), len(loan_updates))

			for i in range(len(loan_updates)):
				expected = test['expected_loan_updates'][i]
				actual = cast(Dict, loan_updates[i])

				self.assertEqual(expected['adjusted_maturity_date'], actual['adjusted_maturity_date'])
				self.assertAlmostEqual(expected['outstanding_principal'], number_util.round_currency(actual['outstanding_principal']))
				self.assertAlmostEqual(expected['outstanding_principal_for_interest'], number_util.round_currency(actual['outstanding_principal_for_interest']))
				self.assertAlmostEqual(expected['outstanding_principal_past_due'], number_util.round_currency(actual['outstanding_principal_past_due']))
				self.assertAlmostEqual(expected['outstanding_interest'], number_util.round_currency(actual['outstanding_interest']))
				self.assertAlmostEqual(expected['outstanding_fees'], number_util.round_currency(actual['outstanding_fees']))
				self.assertAlmostEqual(expected['amount_to_pay_interest_on'], number_util.round_currency(actual['amount_to_pay_interest_on']))
				self.assertAlmostEqual(expected.get('interest_paid_daily_adjustment', 0.0), number_util.round_currency(actual['interest_paid_daily_adjustment']))
				self.assertAlmostEqual(expected.get('fees_paid_daily_adjustment', 0.0), number_util.round_currency(actual['fees_paid_daily_adjustment']))
				self.assertEqual(expected['day_last_repayment_settles'], actual['day_last_repayment_settles'])
				self.assertAlmostEqual(expected['interest_accrued_today'], number_util.round_currency(actual['interest_accrued_today']))
				self.assertAlmostEqual(expected['fees_accrued_today'], number_util.round_currency(actual['fees_accrued_today']))
				self.assertEqual(expected['financing_period'] if expected['financing_period'] else None, actual['financing_period'])
				self.assertEqual(expected['should_close_loan'], actual['should_close_loan'])
				self.assertEqual(expected['days_overdue'], actual['days_overdue'])

			if test.get('expected_summary_update') is not None:
				expected = test['expected_summary_update']
				actual = cast(Dict, customer_update['summary_update'])

				self.assertEqual(expected['product_type'], actual['product_type'])
				self.assertEqual(expected['daily_interest_rate'], actual['daily_interest_rate'])

				self.assertAlmostEqual(expected['total_limit'], number_util.round_currency(actual['total_limit']))
				self.assertAlmostEqual(expected['adjusted_total_limit'], number_util.round_currency(actual['adjusted_total_limit']))
				self.assertAlmostEqual(expected['available_limit'], number_util.round_currency(actual['available_limit']))
				self.assertAlmostEqual(expected['total_outstanding_principal'], number_util.round_currency(actual['total_outstanding_principal']))
				self.assertAlmostEqual(expected['total_outstanding_principal_for_interest'], number_util.round_currency(actual['total_outstanding_principal_for_interest']))
				self.assertAlmostEqual(expected['total_outstanding_interest'], number_util.round_currency(actual['total_outstanding_interest']))
				self.assertAlmostEqual(expected['total_outstanding_fees'], number_util.round_currency(actual['total_outstanding_fees']))
				self.assertAlmostEqual(expected['total_principal_in_requested_state'], number_util.round_currency(actual['total_principal_in_requested_state']))
				self.assertAlmostEqual(expected['total_amount_to_pay_interest_on'], number_util.round_currency(actual['total_amount_to_pay_interest_on']))
				self.assertAlmostEqual(expected['total_interest_accrued_today'], number_util.round_currency(actual['total_interest_accrued_today']))
				self.assertAlmostEqual(expected.get('total_interest_paid_adjustment_today', 0.0), number_util.round_currency(actual['total_interest_paid_adjustment_today']))
				self.assertAlmostEqual(expected['total_late_fees_accrued_today'], number_util.round_currency(actual['total_late_fees_accrued_today']))
				self.assertAlmostEqual(expected.get('total_fees_paid_adjustment_today', 0.0), number_util.round_currency(actual['total_fees_paid_adjustment_today']))

				if expected['minimum_interest_info']['duration']:
					self.assertEqual(expected['minimum_interest_info']['duration'], actual['minimum_interest_info']['duration'])
					self.assertAlmostEqual(expected['minimum_interest_info']['minimum_amount'], actual['minimum_interest_info']['minimum_amount'])
				else:
					self.assertEqual(None, actual['minimum_interest_info']['duration'])
					self.assertEqual(None, actual['minimum_interest_info']['minimum_amount'])
				#self.assertAlmostEqual(expected['minimum_interest_info']['amount_accrued'], number_util.round_currency((actual['minimum_interest_info']['amount_accrued'])))
				#self.assertAlmostEqual(expected['minimum_interest_info']['amount_short'], number_util.round_currency((actual['minimum_interest_info']['amount_short'])))

				test_helper.assertDeepAlmostEqual(
					self,
					expected['account_level_balance_payload'],
					cast(Dict, actual['account_level_balance_payload']),
				)
				self.assertEqual(expected['day_volume_threshold_met'], actual['day_volume_threshold_met'])

				self.assertEqual(expected['most_overdue_loan_days'], actual['most_overdue_loan_days'])

			if today_date_dict['report_date'] != today_date_dict['today']:
				continue

			# The loan fields will be equal when the report_date equals the last date we calculated
			# customer balances until.
			#
			# So all the tests below should only be executed when report_date == today
			"""
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			loans = [loan for loan in loans]
			"""
			loan_ids = [loan_update['loan_id'] for loan_update in loan_updates]
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			loans.sort(key=lambda u: u.adjusted_maturity_date)

			for i in range(len(loans)):
				loan = loans[i]
				expected_loan = test['expected_loan_updates'][i]
				self.assertAlmostEqual(expected_loan['outstanding_principal'], float(loan.outstanding_principal_balance))

			with session_scope(self.session_maker) as session:
				financial_summary = financial_summary_util.get_latest_financial_summary(session, company_id)

				if test.get('expected_summary_update') is not None:
					self.assertIsNotNone(financial_summary)
					expected = test['expected_summary_update']

					self.assertEqual(expected['product_type'], actual['product_type'])
					self.assertEqual(expected['daily_interest_rate'], actual['daily_interest_rate'])

					self.assertAlmostEqual(expected['total_limit'], float(financial_summary.total_limit))
					self.assertAlmostEqual(expected['total_outstanding_principal'], float(financial_summary.total_outstanding_principal))
					self.assertAlmostEqual(expected['total_outstanding_principal_for_interest'], float(financial_summary.total_outstanding_principal_for_interest))
					self.assertAlmostEqual(expected['total_outstanding_principal_past_due'], float(financial_summary.total_outstanding_principal_past_due))
					self.assertAlmostEqual(expected['total_outstanding_interest'], float(financial_summary.total_outstanding_interest))
					self.assertAlmostEqual(expected['total_outstanding_fees'], float(financial_summary.total_outstanding_fees))
					self.assertAlmostEqual(expected['total_principal_in_requested_state'], float(financial_summary.total_principal_in_requested_state))
					self.assertAlmostEqual(expected.get('total_interest_paid_adjustment_today', 0.0), float(financial_summary.total_interest_paid_adjustment_today))
					self.assertAlmostEqual(expected.get('total_fees_paid_adjustment_today', 0.0), float(financial_summary.total_fees_paid_adjustment_today))
					self.assertAlmostEqual(expected['available_limit'], float(financial_summary.available_limit))

					# Skip testing the prorated_info in the loan_balances and defer to the
					# fee_util tests
					min_monthly_payload = cast(Dict, financial_summary.minimum_monthly_payload)
					del min_monthly_payload['prorated_info']

					test_helper.assertDeepAlmostEqual(
						self,
						expected['account_level_balance_payload'],
						cast(Dict, financial_summary.account_level_balance_payload),
					)
					#test_helper.assertDeepAlmostEqual(
					#	self, expected['minimum_monthly_payload'], min_monthly_payload)

				if 'expected_day_volume_threshold_met' in test:
					self.assertEqual(
						test['expected_day_volume_threshold_met'], financial_summary.day_volume_threshold_met)

				# Testing the loans_info column update
				loans_info: Dict[str, LoansInfoEntryDict] = cast(Dict[str, LoansInfoEntryDict], financial_summary.loans_info)
				for loan_id_index, loan_id in enumerate(loan_ids):
					if loan_id in loans_info:
						actual_loan_update: LoansInfoEntryDict = loans_info[loan_id]
						expected_loan_update = test['expected_loan_updates'][loan_id_index]
						for key in expected_loan_update.keys():
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['outstanding_principal']), 
								number_util.round_currency(actual_loan_update['outstanding_principal'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['outstanding_principal_for_interest']), 
								number_util.round_currency(actual_loan_update['outstanding_principal_for_interest'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['outstanding_principal_past_due']), 
								number_util.round_currency(actual_loan_update['outstanding_principal_past_due'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['outstanding_interest']), 
								number_util.round_currency(actual_loan_update['outstanding_interest'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['outstanding_fees']), 
								number_util.round_currency(actual_loan_update['outstanding_late_fees'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['amount_to_pay_interest_on']), 
								number_util.round_currency(actual_loan_update['amount_to_pay_interest_on'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['interest_accrued_today']), 
								number_util.round_currency(actual_loan_update['interest_accrued_today'])
							)
							self.assertAlmostEqual(
								number_util.round_currency(expected_loan_update['fees_accrued_today']), 
								number_util.round_currency(actual_loan_update['fees_accrued_today'])
							)
							# self.assertAlmostEqual(
							# 	number_util.round_currency(expected_loan_update['total_principal_paid']), 
							# 	number_util.round_currency(actual_loan_update['total_principal_paid'])
							# )
							# self.assertAlmostEqual(
							# 	number_util.round_currency(expected_loan_update['total_interest_paid']), 
							# 	number_util.round_currency(actual_loan_update['total_interest_paid'])
							# )
							# self.assertAlmostEqual(
							# 	number_util.round_currency(expected_loan_update['total_fees_paid']), 
							# 	number_util.round_currency(actual_loan_update['total_fees_paid'])
							# )
							self.assertEqual(
								expected_loan_update['days_overdue'], 
								actual_loan_update['days_overdue']
							)

	def test_no_payments_no_loans(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=2001.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))

		loan_ids: List[str] = []
		tests: List[Dict] = [
			{
				'today': '10/1/2020',
				'expected_loan_updates': [],
				'populate_fn': populate_fn,
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01,
					'minimum_interest_info': {
						'minimum_amount': 2001.03,
						'amount_accrued': 0.0,
						'amount_short': 2001.03,
						'duration': 'monthly'
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			}
		]
		for test in tests:
			self._run_test(test, loan_ids)

	def test_no_payments_two_loans_not_due_yet(self) -> None:
		
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=200.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				),
				# contract starts only a few days before the report date,
				# tests that -14 days back doesnt cause a bug
				start_date=date_util.load_date_str('09/28/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='10/01/2020', effective_date='10/01/2020')

			loan2 = models.Loan(
				id=loan_ids[1],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/02/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/06/2020'),
				amount=decimal.Decimal(100.03)
			)
			session.add(loan2)
			payment_test_helper.make_advance(
				session, loan2, amount=100.03, payment_date='10/02/2020', effective_date='10/02/2020')

		loan_ids: List[str] = [
			str(uuid.uuid4()),
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/3/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(3 * 0.05 * 500.03), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.05 * 500.03),
						'fees_accrued_today': 0.0,
						'financing_period': 3, # It's been 3 days since this loan was originated.
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('10/06/2020'),
						'outstanding_principal': 100.03,
						'outstanding_principal_for_interest': 100.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(2 * 0.05 * 100.03), # 10/03 - 10/02 is 1 days apart, +1 day, is 2 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.03,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.03),
						'fees_accrued_today': 0.0,
						'financing_period': 2, # It's been 2 days since this loan was originated.
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03 + 100.03,
					'total_outstanding_principal_for_interest': 500.03 + 100.03,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': number_util.round_currency((3 * 0.05 * 500.03) + (2 * 0.05 * 100.03)),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.03 + 100.03,
					'total_interest_accrued_today': number_util.round_currency((0.05 * 500.03) + (0.05 * 100.03)),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01 - (500.03 + 100.03),
					'minimum_interest_info': {
							'minimum_amount': 200.03,
							'amount_accrued': number_util.round_currency((3 * 0.05 * 500.03) + (2 * 0.05 * 100.03)),
							'amount_short': number_util.round_currency(200.03 - ((3 * 0.05 * 500.03) + (2 * 0.05 * 100.03))),
							'duration': 'monthly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			}
		]
		
		for test in tests:
			self._run_test(test, loan_ids)

	def test_two_loans_past_due_no_repayments(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.0,
						minimum_monthly_amount=None,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				# contract starts only a few days before the report date,
				# tests that -14 days back doesnt cause a bug
				start_date=date_util.load_date_str('09/01/2020'),
				adjusted_end_date=date_util.load_date_str('12/31/2020')
			))
			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('09/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/30/2020'),
				amount=decimal.Decimal(1000.0),
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session,
				loan,
				amount=1000.0,
				payment_date='09/01/2020',
				effective_date='09/01/2020',
			)

			loan2 = models.Loan(
				id=loan_ids[1],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('11/29/2020'),
				amount=decimal.Decimal(1000.0),
			)
			session.add(loan2)
			payment_test_helper.make_advance(
				session,
				loan2,
				amount=1000.0,
				payment_date='10/01/2020',
				effective_date='10/01/2020',
			)

		loan_ids: List[str] = [
			str(uuid.uuid4()),
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '09/05/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 1000.0,
						'outstanding_principal_for_interest': 1000.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(5 * 0.05 * 1000.0), # 5 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 1000.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 1000.0),
						'fees_accrued_today': 0.0,
						'financing_period': 5,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'financing_period': 0,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 1000.0 + 0.0,
					'total_outstanding_principal_for_interest': 1000.0 + 0.0,
					'total_outstanding_principal_past_due': 0.0 + 0.0,
					'total_outstanding_interest': number_util.round_currency((5 * 0.05 * 1000.0) + 0.0),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 1000.0 + 0.0,
					'total_interest_accrued_today': number_util.round_currency((0.05 * 1000.0) + 0.0),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.0 - (1000.0 + 0.0),
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
			{
				'today': '11/05/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 1000.0,
						'outstanding_principal_for_interest': 1000.0,
						'outstanding_principal_past_due': 1000.0,
						'outstanding_interest': number_util.round_currency(66 * 0.05 * 1000.0), # 66 days of interest.
						'outstanding_fees': 6 * 0.05 * 1000.0 * 0.25,
						'amount_to_pay_interest_on': 1000.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 1000.0),
						'fees_accrued_today': 0.05 * 1000.0 * 0.25,
						'financing_period': 66,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 6
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 1000.0,
						'outstanding_principal_for_interest': 1000.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(36 * 0.05 * 1000.0), # 36 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 1000.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 1000.0),
						'fees_accrued_today': 0.0,
						'financing_period': 36,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 1000.0 + 1000.0,
					'total_outstanding_principal_for_interest': 1000.0 + 1000.0,
					'total_outstanding_principal_past_due': 1000.0 + 0.0,
					'total_outstanding_interest': number_util.round_currency((66 * 0.05 * 1000.0) + (36 * 0.05 * 1000.0)),
					'total_outstanding_fees': (6 * 0.05 * 1000.0 * 0.25) + 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 1000.0 + 1000.0,
					'total_interest_accrued_today': number_util.round_currency((0.05 * 1000.0) + (0.05 * 1000.0)),
					'total_late_fees_accrued_today': 0.05 * 1000.0 * 0.25,
					'available_limit': 120000.0 - (1000.0 + 1000.0),
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 6
				},
			},
			{
				'today': '12/05/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 1000.0,
						'outstanding_principal_for_interest': 1000.0,
						'outstanding_principal_past_due': 1000.0,
						'outstanding_interest': number_util.round_currency(96 * 0.05 * 1000.0), # 96 days of interest.
						'outstanding_fees': (14 * 0.05 * 1000.0 * 0.25) + (15 * 0.05 * 1000.0 * 0.5) + (7 * 0.05 * 1000.0 * 1.0),
						'amount_to_pay_interest_on': 1000.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 1000.0),
						'fees_accrued_today': 0.05 * 1000.0 * 1.0,
						'financing_period': 96,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 36
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 1000.0,
						'outstanding_principal_for_interest': 1000.0,
						'outstanding_principal_past_due': 1000.0,
						'outstanding_interest': number_util.round_currency(66 * 0.05 * 1000.0), # 66 days of interest.
						'outstanding_fees': 6 * 0.05 * 1000.0 * 0.25,
						'amount_to_pay_interest_on': 1000.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 1000.0),
						'fees_accrued_today': 0.05 * 1000.0 * 0.25,
						'financing_period': 66,
						'day_last_repayment_settles': None, # no repayments yet
						'should_close_loan': False,
						'days_overdue': 6
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 1000.0 + 1000.0,
					'total_outstanding_principal_for_interest': 1000.0 + 1000.0,
					'total_outstanding_principal_past_due': 1000.0 + 1000.0,
					'total_outstanding_interest': number_util.round_currency((96 * 0.05 * 1000.0) + (66 * 0.05 * 1000.0)),
					'total_outstanding_fees': ((14 * 0.05 * 1000.0 * 0.25) + (15 * 0.05 * 1000.0 * 0.5) + (7 * 0.05 * 1000.0 * 1.0)) + (6 * 0.05 * 1000.0 * 0.25),
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 1000.0 + 1000.0,
					'total_interest_accrued_today': number_util.round_currency((0.05 * 1000.0) + (0.05 * 1000.0)),
					'total_late_fees_accrued_today': (0.05 * 1000.0 * 1.0) + (0.05 * 1000.0 * 0.25),
					'available_limit': 120000.0 - (1000.0 + 1000.0),
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 36
				},
			},
		]
		for test in tests:
			self._run_test(test, loan_ids)

	def test_repayment_quarterly_minimum_accrued_no_late_fee_once_loan_is_paid_off(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str]
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.005,
						maximum_principal_amount=120000.01,
						minimum_quarterly_amount=20000.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				),
				start_date=date_util.load_date_str('10/03/2020'), # Contract starts mid-quarter so we need to pro-rate
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))

			# Add a contract which "is_deleted" so it shouldn't influence any loan balances calculations
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.001,
						maximum_principal_amount=12000.01,
						minimum_quarterly_amount=2000.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				),
				start_date=date_util.load_date_str('10/03/2020'), # Contract starts mid-quarter so we need to pro-rate
				adjusted_end_date=date_util.load_date_str('12/1/2020'),
				is_deleted=True
			))

			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/5/2020'),
				adjusted_maturity_date=date_util.load_date_str('11/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='10/05/2020', effective_date='10/05/2020')

			# Pay off the loan on the 4th, and the 33 days of interest accrued.
			# No late fees accrue even though the payment settles after the loan reaches its maturity date
			payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='11/04/2020',
				effective_date='11/06/2020',
				to_principal=500.03,
				to_interest=number_util.round_currency(33 * 0.005 * 500.03),
				to_late_fees=0.0,
				to_account_balance=0.0,
			)

		numerator = 31 + 30 + 31 - 2 # Contract wasn't in effect for 2 days
		denominator = 31 + 30 + 31 # October, November, December days
		prorated_fraction = numerator / denominator

		loan_ids = [
			str(uuid.uuid4())
		]
		tests: List[Dict] = [
			{
				'today': '11/3/2020', # It's been 30 days since the loan started, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(30 * 0.005 * 500.03), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.005 * 500.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None, # no repayment has been deposited until this point
						'financing_period': 30,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.005,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': number_util.round_currency(30 * 0.005 * 500.03),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.03,
					'total_interest_accrued_today': number_util.round_currency(0.005 * 500.03),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01 - 500.03,
					'minimum_interest_info': {
							'minimum_amount': 20000.03 * prorated_fraction,
							'amount_accrued': number_util.round_currency(30 * 0.005 * 500.03),
							'amount_short': number_util.round_currency(20000.03 * prorated_fraction - (30 * 0.005 * 500.03)),
							'duration': 'quarterly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
			{
				'today': '11/05/2020', # It's been 32 days since the loan started, and it gets fully paid off
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/05/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -2.51, # Because it's "overpaid" during the time period before the settlement days kick in
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.005 * 500.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/06/2020'),
						'financing_period': 33,
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
			},
			{
				'today': '11/06/2020', # It's been 33 days since the loan started, and it gets fully paid off
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/05/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.005 * 500.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/06/2020'),
						'financing_period': 33,
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
			}
		]
		for test in tests:
			self._run_test(test, loan_ids)

	def test_no_payments_two_loans_not_due_yet_yearly_minimum_accrued(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str]
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.005,
						maximum_principal_amount=120000.01,
						minimum_annual_amount=20000.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('01/01/2021')
			))
			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('09/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/10/2020'), # spans 2 quarters
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='09/01/2020', effective_date='09/01/2020')

		loan_ids = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/05/2020', # It's been 35 days since the loan started, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/10/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(35 * 0.005 * 500.03), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.005 * 500.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None,
						'financing_period': 35,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.005,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': number_util.round_currency(35 * 0.005 * 500.03),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.03,
					'total_interest_accrued_today': number_util.round_currency(0.005 * 500.03),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01 - (500.03),
					'minimum_interest_info': {
							'minimum_amount': 20000.03,
							'amount_accrued': number_util.round_currency(35 * 0.005 * 500.03),
							'amount_short': number_util.round_currency(20000.03 - (35 * 0.005 * 500.03)),
							'duration': 'annually'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			}
		]
		for test in tests:
			self._run_test(test, loan_ids)

	def test_two_loans_reduced_interest_rate_due_to_threshold(self) -> None:

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str],
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=120000.01,
							minimum_monthly_amount=200.03,
							factoring_fee_threshold=1000.0,
							factoring_fee_threshold_starting_value=threshold_starting_value,
							adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2020')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/01/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03, payment_date='10/01/2020', effective_date='10/01/2020')

				loan2 = models.Loan(
					id=loan_ids[1],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/05/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/2/2020'),
					amount=decimal.Decimal(600.03)
				)
				session.add(loan2)
				payment_test_helper.make_advance(
					session, loan2, amount=600.03, payment_date='10/05/2020', effective_date='10/05/2020')

				loan3 = models.Loan(
					id=loan_ids[2],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/07/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/3/2020'),
					amount=decimal.Decimal(700.03)
				)
				session.add(loan3)
				payment_test_helper.make_advance(
					session, loan3, amount=700.03, payment_date='10/07/2020', effective_date='10/07/2020')

				# Only 100 remaining after the 3rd.
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/03/2020',
					effective_date='10/03/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# You cross the threshold on the 5th if you started with 0 dollars.
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/05/2020',
					effective_date='10/05/2020',
					to_principal=100.00,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan2,
					payment_date='10/05/2020',
					effective_date='10/05/2020',
					to_principal=500.03,
					to_interest=0.0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
			return populate_fn


		first_day = 1 * 0.05 * 499.97 + 1 * 0.01 * (600.03 - 499.97)

		loan_ids: List[str] = [
			str(uuid.uuid4()),
			str(uuid.uuid4()),
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/03/2020', # Days before you cross the threshold
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 100.00,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(3 * 0.05 * 500.03), # 3 days of interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.05 * 500.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'financing_period': None,
						'day_last_repayment_settles': None,
						'should_close_loan': False, # hasnt been funded yet
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'financing_period': None,
						'day_last_repayment_settles': None,
						'should_close_loan': False, # hasnt been funded yet
						'days_overdue': 0
					}
				],
				'expected_day_volume_threshold_met': None,
			},
			{
				'today': '10/05/2020', # The day you cross the threshold, but it doesnt take effect until the next day
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((3 * 0.05 * 500.03) + (2 * 0.05 * 100.00)), # 5 days of interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 5,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(1 * 0.05 * 600.03), # 1 day of interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 600.03,
						'interest_accrued_today': number_util.round_currency(0.05 * 600.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 1,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None,
						'financing_period': None,
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/05/2020'),
			},
			{
				'today': '10/09/2020', # You have 4 days after crossing the threshold, and should have the discounted rate
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((3 * 0.05 * 500.03) + (2 * 0.05 * 100.00)), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((1 * 0.05 * 600.03) + (4 * 0.01 * 100.0)), # 1 day of interest + 4 days at the lower rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.01 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 5,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(3 * 0.01 * 700.03), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 700.03,
						'interest_accrued_today': number_util.round_currency(0.01 * 700.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None,
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/05/2020'),
			},
			{
				'today': '10/09/2020', # You crossed the threshold from the beginning
				'populate_fn': get_populate_fn(threshold_starting_value=2000.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((3 * 0.01 * 500.03) + (2 * 0.01 * 100.00)), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((1 * 0.01 * 600.03) + (4 * 0.01 * 100.0)), # All days at lower rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.01 * 100.0),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 5,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(3 * 0.01 * 700.03), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 700.03,
						'interest_accrued_today': number_util.round_currency(0.01 * 700.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None,
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('01/01/2020'),
			},
			{
				'today': '10/09/2020', # You crossed the threshold on the 3rd instead of the 5th because of the starting value
				'populate_fn': get_populate_fn(threshold_starting_value=800.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((3 * 0.05 * 500.03) + (2 * 0.01 * 100.00)), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((1 * 0.01 * 600.03) + (4 * 0.01 * 100.0)), # All days at lower rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.01 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/05/2020'),
						'financing_period': 5,
						'should_close_loan': False,
						'days_overdue': 0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(3 * 0.01 * 700.03), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 700.03,
						'interest_accrued_today': number_util.round_currency(0.01 * 700.03),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': None,
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/03/2020')
			},
		]
		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_after_report_date(self) -> None:
		# Shows that the repayment that crosses over the month boundary works
		# when we've paid off the entire loan

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str]
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=100000,
							minimum_monthly_amount=200,
							# factoring_fee_threshold=1000.0,
							# factoring_fee_threshold_starting_value=threshold_starting_value,
							# adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2020')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/30/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03,
					payment_date='10/21/2020',
					effective_date='10/21/2020')

				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/25/2020',
					effective_date='10/25/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# The repayment crosses the October to November month, but we want
				# to book all the fees and interest in the month of October
				#
				# The user also safely pays off all the principal, interest and fees
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/30/2020',
					effective_date='11/04/2020',
					to_principal=100.00,
					to_interest=number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00)),
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
			return populate_fn

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/29/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (4 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/25/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By end of the month, you owe all the interest that's collecting during
				# the settlement period
				'today': '10/31/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -20.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(0.05 * 100.00 * 4), # You paid an extra 4 days of interest that we report for this month
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 1
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '11/01/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -15.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': 5.0,
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(-0.05 * 100.00 * 4), # THe extra 4 days of interest paid off is subtracted on the first of the month
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 2
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '11/04/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': 5.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			}
		]
		i = 0
		for test in tests:
			print('I={}'.format(i))
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_cross_month_boundary_full_loan_repayment(self) -> None:
		# Shows that the repayment that crosses over the month boundary works
		# when we've paid off the entire loan

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str],
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=120000.01,
							minimum_monthly_amount=200.03,
							factoring_fee_threshold=1000.0,
							factoring_fee_threshold_starting_value=threshold_starting_value,
							adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2020')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/30/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03,
					payment_date='10/21/2020',
					effective_date='10/21/2020')

				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/25/2020',
					effective_date='10/25/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# The repayment crosses the October to November month, but we want
				# to book all the fees and interest in the month of October
				#
				# The user also safely pays off all the principal, interest and fees
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/30/2020',
					effective_date='11/04/2020',
					to_principal=100.00,
					to_interest=number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00)),
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
			return populate_fn

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/29/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (4 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/25/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By end of the month, you owe all the interest that's collecting during
				# the settlement period
				'today': '10/31/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -20.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(0.05 * 100.00 * 4), # You paid an extra 4 days of interest that we report for this month
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 1
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '11/01/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -15.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': 5.0,
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(-0.05 * 100.00 * 4), # THe extra 4 days of interest paid off is subtracted on the first of the month
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 2
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '11/04/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': 5.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			}
		]
		i = 0
		for test in tests:
			print('I={}'.format(i))
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_that_cross_month_boundary_across_year_full_loan_repayment(self) -> None:
		# Shows that the repayment that crosses over the month boundary works
		# when we've paid off the entire loan

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str],
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=120000.01,
							minimum_monthly_amount=200.03,
							factoring_fee_threshold=1000.0,
							factoring_fee_threshold_starting_value=threshold_starting_value,
							adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2021')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('12/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/30/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03,
					payment_date='12/21/2020',
					effective_date='12/21/2020')

				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='12/25/2020',
					effective_date='12/25/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# The repayment crosses the October to November month, but we want
				# to book all the fees and interest in the month of October
				#
				# The user also safely pays off all the principal, interest and fees
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='12/30/2020',
					effective_date='01/03/2021',
					to_principal=100.00,
					to_interest=number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00)),
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
			return populate_fn

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '12/29/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/30/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (4 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('12/25/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By end of the month, you owe all the interest that's collecting during
				# the settlement period
				'today': '12/31/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -20.0, # Everything gets paid off by 10/31 because
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(0.05 * 100.00 * 3), # You paid an extra 4 days of interest that we report for this month
						'day_last_repayment_settles': date_util.load_date_str('01/03/2021'),
						'financing_period': 14,
						'should_close_loan': True,
						'days_overdue': 1
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 100.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': -20.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 100.0,
					'total_interest_accrued_today': 5.0,
					'total_interest_paid_adjustment_today': number_util.round_currency(0.05 * 100.00 * 3),
					'total_late_fees_accrued_today': 0.0,
					'total_fees_paid_adjustment_today': 0.0,
					'available_limit': 120000.01,
					'minimum_interest_info': {'minimum_amount': 200.03, 'amount_accrued': 155.01, 'amount_short': 45.02, 'duration': 'monthly', 'prorated_info': {'numerator': 31, 'denom': 31, 'fraction': 1.0, 'day_to_pay': '12/31/2020'}},
					'account_level_balance_payload': {'fees_total': 0.0, 'credits_total': 0.0},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 1
				},
				'expected_day_volume_threshold_met': None
			},
			{
				# By the day the repayment settles you owe everything
				'today': '01/01/2021', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -15.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': 5.0,
						'fees_accrued_today': 0.0,
						'interest_paid_daily_adjustment': number_util.round_currency(-0.05 * 100.00 * 3), # THe extra 3 days of interest paid off is subtracted on the first of the month
						'day_last_repayment_settles': date_util.load_date_str('01/03/2021'),
						'financing_period': 14,
						'should_close_loan': True,
						'days_overdue': 2
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By the day the repayment settles you owe everything
				'today': '01/04/2021', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -5.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('01/03/2021'),
						'financing_period': 14,
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			}
		]
		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_that_cross_month_boundary_full_principal_repayment(self) -> None:
		# Shows that the repayment that crosses over the month boundary works
		# when we've paid off the principal, but interest and fees are remaining

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str],
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=120000.01,
							minimum_monthly_amount=200.03,
							factoring_fee_threshold=1000.0,
							factoring_fee_threshold_starting_value=threshold_starting_value,
							adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2020')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/30/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03,
					payment_date='10/21/2020',
					effective_date='10/21/2020')

				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/25/2020',
					effective_date='10/25/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# The repayment crosses the October to November month, but we want
				# to book all the fees and interest in the month of October
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/30/2020',
					effective_date='11/04/2020',
					to_principal=100.00,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)
			return populate_fn

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/29/2020', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (4 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/25/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '10/31/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (6 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 11,
						'should_close_loan': False,
						'days_overdue': 1
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By the day the repayment settles you owe everything
				'today': '11/04/2020', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': False,
						'days_overdue': 5
					},
				],
				'expected_day_volume_threshold_met': None
			}
		]
		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_that_cross_month_boundary_partial_repayment(self) -> None:
		# Shows that the repayment that crosses over the month boundary works
		# when we've partially paid off the principal and interest, and principal, interest and fees are remaining

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(
				session: Session, 
				seed: test_helper.BasicSeed, 
				company_id: str,
				loan_ids: List[str],
			) -> None:
				session.add(models.Contract(
					company_id=company_id,
					product_type=ProductType.INVENTORY_FINANCING,
					product_config=contract_test_helper.create_contract_config(
						product_type=ProductType.INVENTORY_FINANCING,
						input_dict=ContractInputDict(
							interest_rate=0.05,
							maximum_principal_amount=120000.01,
							minimum_monthly_amount=200.03,
							factoring_fee_threshold=1000.0,
							factoring_fee_threshold_starting_value=threshold_starting_value,
							adjusted_factoring_fee_percentage=0.01, # reduced rate once you hit 1000 in principal owed
							max_days_until_repayment=0, # unused
							late_fee_structure=_get_late_fee_structure(), # unused
						)
					),
					start_date=date_util.load_date_str('1/1/2020'),
					adjusted_end_date=date_util.load_date_str('12/30/2020')
				))
				loan = models.Loan(
					id=loan_ids[0],
					company_id=company_id,
					origination_date=date_util.load_date_str('10/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/30/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03,
					payment_date='10/21/2020',
					effective_date='10/21/2020')

				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/25/2020',
					effective_date='10/25/2020',
					to_principal=400.03,
					to_interest=0,
					to_late_fees=0.0,
					to_account_balance=0.0,
				)

				# The repayment crosses the October to November month, but we want
				# to book all the fees and interest in the month of October
				payment_test_helper.make_repayment(
					session=session,
					company_id=company_id,
					loan=loan,
					payment_date='10/30/2020',
					effective_date='11/04/2020',
					to_principal=80.00,
					to_interest=30.0,
					to_late_fees=3.0, # You pay off some of the fees this month and for next montht to create a fee adjustment
					to_account_balance=0.0,
				)
			return populate_fn

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/29/2020', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (4 * 0.05 * 100.00)),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/25/2020'),
						'financing_period': 9,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By end of the month, you owe all the interest that's collecting during
				# the settlement period
				'today': '10/31/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 20.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 20.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (6 * 0.05 * 100.00) - (30.0)), # -30.0 because of some outstanding_interest paid off
						'outstanding_fees': number_util.round_currency(1 * 0.05 * 100.00 * 0.25 - 3.0), # 0.25 fee_multiplier, late fee on 10/31
						'fees_paid_daily_adjustment': abs(number_util.round_currency(1 * 0.05 * 100.00 * 0.25 - 3.0)), # What you overpaid for next month gets booked here in the fee adjustment
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00), # today
						'fees_accrued_today': 0.05 * 100.00 * 0.25,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 11,
						'should_close_loan': False,
						'days_overdue': 1
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.05,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 20.0,
					'total_outstanding_principal_for_interest': 100.0,
					'total_outstanding_principal_past_due': 20.0,
					'total_outstanding_interest': 125.01,
					'total_outstanding_fees': -1.75,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 100.0,
					'total_interest_accrued_today': 5.0,
					'total_interest_paid_adjustment_today': 0.0,
					'total_late_fees_accrued_today': 0.05 * 100.00 * 0.25,
					'total_fees_paid_adjustment_today': abs(number_util.round_currency(1 * 0.05 * 100.00 * 0.25 - 3.0)),
					'available_limit': 119980.01,
					'minimum_interest_info': {'minimum_amount': 200.03, 'amount_accrued': 155.01, 'amount_short': 45.02, 'duration': 'monthly', 'prorated_info': {'numerator': 31, 'denom': 31, 'fraction': 1.0, 'day_to_pay': '10/31/2020'}},
					'account_level_balance_payload': {'fees_total': 0.0, 'credits_total': 0.0},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 1
				},
				'expected_day_volume_threshold_met': None
			},
			{
				# By end of the month, you owe all the interest that's collecting during
				# the settlement period
				'today': '11/01/2020',
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 20.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_principal_past_due': 20.0,
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + (7 * 0.05 * 100.00) - (30.0)), # -30.0 because of some outstanding_interest paid off
						'outstanding_fees': number_util.round_currency(2 * 0.05 * 100.00 * 0.25 - 3.0), # 0.25 fee_multiplier, late fee on 10/31
						'fees_paid_daily_adjustment': number_util.round_currency(1 * 0.05 * 100.00 * 0.25 - 3.0), # What you overpaid for last month gets booked here in the fee adjustment
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00), # today
						'fees_accrued_today': 0.05 * 100.00 * 0.25,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 12,
						'should_close_loan': False,
						'days_overdue': 2
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By the day the repayment settles you owe everything
				'today': '11/04/2020', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 20.0,
						'outstanding_principal_for_interest': 20.0,
						'outstanding_principal_past_due': 20.0,
						# Same amount due as on 10/31 because of cross-month repayment
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00) - 30.0),
						# 0.25 fee_multiplier, late fee on 10/31, 11/1, 11/2, 11/3, 11/4
						'outstanding_fees': number_util.round_currency(5 * 0.05 * 100.00 * 0.25 - 3.0),
						'amount_to_pay_interest_on': 100.0,
						'interest_accrued_today': number_util.round_currency(0.05 * 100.00), # No interest accrued today because of overlap with settling repayment
						'fees_accrued_today': 0.05 * 100.00 * 0.25,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 15,
						'should_close_loan': False,
						'days_overdue': 5
					},
				],
				'expected_day_volume_threshold_met': None
			},
			{
				# By the day the repayment settles you owe everything
				'today': '11/07/2020', # The day before the end of the month
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/30/2020'),
						'outstanding_principal': 20.0,
						'outstanding_principal_for_interest': 20.0,
						'outstanding_principal_past_due': 20.0,
						# 3 additional days of interest that resumed on 11/5, 11/6, 11/7 on the 20.0 outstanding_principal_for_interest
						'outstanding_interest': number_util.round_currency((5 * 0.05 * 500.03) + ((4 + 6) * 0.05 * 100.00) + (3 * 0.05 * 20.00) - 30.0),
						# 0.25 fee_multiplier, late fee on 10/31, 11/1, 11/2, 11/3, 11/4 on 100.0 outstanding_principal_for_interest
						# 0.25 fee_multiplier, late fee on 11/5, 11/6, 11/7 on 20.0 outstanding principal
						'outstanding_fees': number_util.round_currency((5 * 0.05 * 100.00 * 0.25) + (3 * 0.05 * 20.00 * 0.25) - 3.0),
						'amount_to_pay_interest_on': 20.0,
						# Interest begins to accrue again since we are outside the settlement window
						'interest_accrued_today': number_util.round_currency(0.05 * 20.00),
						'fees_accrued_today': 0.05 * 20.00 * 0.25,
						'day_last_repayment_settles': date_util.load_date_str('11/04/2020'),
						'financing_period': 18,
						'should_close_loan': False,
						'days_overdue': 8
					},
				],
				'expected_day_volume_threshold_met': None
			}
		]
		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_account_fees_and_waivers(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.002,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			financial_summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=100.0,
				product_type=ProductType.INVENTORY_FINANCING
			)
			financial_summary.date = date_util.load_date_str('01/01/1960')
			financial_summary.account_level_balance_payload = {
				'fees_total': 200.0, # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
				'credits_total': 200.0 # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
			}
			financial_summary.company_id = company_id
			session.add(financial_summary)

			# Book an account-level fee and a credit, and make sure it doesnt influence
			# any of the loan updates
			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype=db_constants.TransactionSubType.MINIMUM_INTEREST_FEE,
				amount=1000.01,
				originating_payment_id=None,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/01/2020'), # This will create a fee effective on 10/31/2020
				session=session
			)

			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype=db_constants.TransactionSubType.MINIMUM_INTEREST_FEE,
				amount=2000.01,
				originating_payment_id=None,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('11/01/2020'), # This will create a fee effective on 11/30/2020
				session=session
			)

			payment_util.create_and_add_account_level_fee_waiver(
				company_id=company_id,
				subtype=db_constants.TransactionSubType.MINIMUM_INTEREST_FEE,
				amount=3000.02,
				originating_payment_id=None,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('11/30/2020'),
				session=session
			)

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/31/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01,
					'minimum_interest_info': {
						'minimum_amount': 1.03,
						'amount_accrued': number_util.round_currency(2 * 0.002 * 500.03),
						'amount_short': 0.0,
						'duration': 'monthly'
					},
					'account_level_balance_payload': {
						'fees_total': 1000.01,
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				}
			},
			{
				'today': '11/30/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01,
					'minimum_interest_info': {
						'minimum_amount': 1.03,
						'amount_accrued': number_util.round_currency(2 * 0.002 * 500.03),
						'amount_short': 0.0,
						'duration': 'monthly'
					},
					'account_level_balance_payload': {
						'fees_total': 0.0, # Fees and fee waivers tie out
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				}
			},
		]

		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_repayment_loan_and_account_balance(self) -> None:
		"""
		Verifies the single repayment on both loan and account balance use case.
		1. Portion of repayment applies to loan.
		2. Portion of repayment applies to account balance.
		3. Portion of repayment that applies to account balance is effective as of deposit date.
		"""
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.002,
						maximum_principal_amount=120000.0,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				start_date=date_util.load_date_str('01/01/2020'),
				adjusted_end_date=date_util.load_date_str('12/31/2020')
			))
			financial_summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=100.0,
				product_type=ProductType.INVENTORY_FINANCING
			)
			financial_summary.date = date_util.load_date_str('01/01/1960')
			financial_summary.account_level_balance_payload = {
				'fees_total': 200.0, # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
				'credits_total': 200.0 # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
			}
			financial_summary.company_id = company_id
			session.add(financial_summary)

			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('11/29/2020'),
				amount=decimal.Decimal(500.0)
			)
			session.add(loan)

			advance_transaction = payment_test_helper.make_advance(
				session,
				loan,
				amount=500.0,
				payment_date='10/01/2020',
				effective_date='10/01/2020',
			)
			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype=db_constants.TransactionSubType.WIRE_FEE,
				amount=25.0,
				originating_payment_id=advance_transaction.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/02/2020'),
				session=session,
			)

			payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/03/2020',
				effective_date='10/04/2020',
				to_principal=500.0,
				to_interest=4 * (500.0 * 0.002), # 4 days of interest.
				to_late_fees=0.0,
				to_account_balance=15.0, # $15 of $25 wire fee.
			)

			payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=None,
				payment_date='10/05/2020',
				effective_date='10/06/2020',
				to_principal=0.0,
				to_interest=0.0,
				to_late_fees=0.0,
				to_account_balance=10.0, # $05 of $25 wire fee.
			)

		loan_ids: List[str] = [
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/02/2020', # Before both repayments.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 500.0,
						'outstanding_principal_for_interest': 500.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 2 * (500.0 * 0.002),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.0,
						'interest_accrued_today': 500.0 * 0.002,
						'fees_accrued_today': 0.0,
						'financing_period': 2,
						'day_last_repayment_settles': None,
						'should_close_loan': False,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 500.0,
					'total_outstanding_principal_for_interest': 500.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 2 * (500.0 * 0.002),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.0,
					'total_interest_accrued_today': 500.0 * 0.002,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.0 - 500.0,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 25.0,
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
			{
				'today': '10/03/2020', # Deposit date of 1st repayment.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 500.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': -1 * (500.0 * 0.002),
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.0,
						'interest_accrued_today': 500.0 * 0.002,
						'fees_accrued_today': 0.0,
						'financing_period': 4,
						'day_last_repayment_settles': date_util.load_date_str('10/04/2020'),
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 500.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': -1 * (500.0 * 0.002),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.0,
					'total_interest_accrued_today': 500.0 * 0.002,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.0,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 10.0, # Portion of repayment that applies to account balance is effective as of deposit date.
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
			{
				'today': '10/04/2020', # Settlement date of 1st repayment.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.0,
						'interest_accrued_today': 500.0 * 0.002,
						'fees_accrued_today': 0.0,
						'financing_period': 4,
						'day_last_repayment_settles': date_util.load_date_str('10/04/2020'),
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.0,
					'total_interest_accrued_today': 500.0 * 0.002,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.0,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 10.0,
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
			{
				'today': '10/05/2020', # Deposit date of 2nd repayment.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/29/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 0.0,
						'interest_accrued_today': 0.0,
						'fees_accrued_today': 0.0,
						'financing_period': 4,
						'day_last_repayment_settles': date_util.load_date_str('10/04/2020'),
						'should_close_loan': True,
						'days_overdue': 0
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.0,
					'adjusted_total_limit': 120000.0,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.0,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0, # Portion of repayment that applies to account balance is effective as of deposit date.
						'credits_total': 0.0,
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
			},
		]

		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_one_payment_one_loan_past_due_with_account_balances_and_adjustments(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.002,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			financial_summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=100.0,
				product_type=ProductType.INVENTORY_FINANCING
			)
			financial_summary.date = date_util.load_date_str('01/01/1960')
			financial_summary.account_level_balance_payload = {
				'fees_total': 200.0, # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
				'credits_total': 200.0 # This will get overwritten by the test, but is needed for some of the settle fee functions to pass validation
			}
			financial_summary.company_id = company_id
			session.add(financial_summary)
			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			advance_transaction = payment_test_helper.make_advance(
				session, loan, amount=500.03,  payment_date='09/30/2020', effective_date='10/01/2020'
			)

			# A deleted loan and advance shouldnt affect the test either
			loan2 = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan2)
			advance_transaction2 = payment_test_helper.make_advance(
				session, loan2, amount=500.03,  payment_date='09/30/2020', effective_date='10/01/2020'
			)
			loan2.is_deleted = True
			advance_transaction2.is_deleted

			# Book an account-level fee and a credit, and make sure it doesnt influence
			# any of the loan updates
			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype='wire_fee',
				amount=1000.01,
				originating_payment_id=advance_transaction.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype='wire_fee',
				amount=2000.01,
				originating_payment_id=advance_transaction.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			# Repay part of the fee
			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment(
				company_id=company_id,
				payment_input=cast(payment_types.RepaymentPaymentInputDict, {
					'payment_method': 'ach',
					'requested_amount': 12.03,
					'requested_payment_date': date_util.load_date_str('10/01/2020'),
					'payment_date': date_util.load_date_str('10/01/2020'),
					'items_covered': {
						'requested_to_account_fees': 12.03
					},
					'company_bank_account_id': str(uuid.uuid4())
				}),
				created_by_user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)
			tx_ids, err = repayment_util_fees.settle_repayment_of_fee(
				req={
					'company_id': company_id,
					'payment_id': payment_id,
					'amount': 12.03,
					'deposit_date': '10/01/2020',
					'settlement_date': '10/01/2020',
					'items_covered': {'to_user_credit': 0.0, 'to_account_fees': 12.03}
				},
				should_settle_payment=True,
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

			payment_util.create_and_add_credit_to_user_transaction(
				amount=3000.02,
				payment_id=advance_transaction.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_util.create_and_add_credit_to_user_transaction(
				amount=4000.02,
				payment_id=advance_transaction.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			# Repay a fee with a user credit
			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment_with_account_credit(
				company_id=company_id,
				payment_input=cast(payment_types.RepaymentPaymentInputDict, {
					'payment_method': 'none',
					'requested_amount': 2.01,
					'requested_payment_date': date_util.load_date_str('10/01/2020'),
					'payment_date': date_util.load_date_str('10/01/2020'),
					'items_covered': {
						'requested_to_account_fees': 2.01
					},
					'company_bank_account_id': str(uuid.uuid4())
				}),
				created_by_user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

			tx_ids, err = repayment_util_fees.settle_repayment_of_fee_with_account_credit(
				req={
					'company_id': company_id,
					'payment_id': payment_id,
					'amount': 2.01,
					'effective_date': '10/01/2020'
				},
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

			tx_id, err = payment_util.create_and_add_credit_payout_to_customer(
				company_id=company_id,
				payment_method='ach',
				amount=850.06,
				created_by_user_id=seed.get_user_id('bank_admin'),
				deposit_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)
			self.assertIn('Cannot disburse', err.msg) # not enough credits stored in the financial summary

			financial_summary.account_level_balance_payload = {
				'fees_total': 200.0,
				'credits_total': 8000.0
			}

			tx_id, err = payment_util.create_and_add_credit_payout_to_customer(
				company_id=company_id,
				payment_method='ach',
				amount=850.06,
				created_by_user_id=seed.get_user_id('bank_admin'),
				deposit_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)
			self.assertIsNone(err) # now we have enough redits stored in the financial summary


			payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/02/2020',
				effective_date='10/03/2020',
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_late_fees=0.0,
				to_account_balance=0.0,
			)

			# Because these transactions get deleted, these dont interrupt any of the financial
			# calculations
			cur_payment, cur_tx = payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/02/2020',
				effective_date='10/03/2020',
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_late_fees=0.0,
				to_account_balance=0.0,
			)
			success, err = payment_util.unsettle_payment(
				payment_type=cur_payment.type,
				payment_id=str(cur_payment.id),
				is_undo=True,
				session=session
			)
			self.assertIsNone(err)

			# Because these transactions get reversed, these dont interrupt any of the financial
			# calculations
			cur_payment2, cur_tx2 = payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/02/2020',
				effective_date='10/03/2020',
				to_principal=52.0,
				to_interest=34 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_late_fees=0.0,
				to_account_balance=0.0,
			)
			success, err = payment_util.reverse_payment(
				payment_type=cur_payment2.type,
				payment_id=str(cur_payment2.id),
				session=session
			)
			self.assertIsNone(err)

			payment_util.create_and_add_adjustment(
				company_id=company_id,
				loan_id=str(loan.id),
				tx_amount_dict=payment_util.payment_types.TransactionAmountDict(
					to_principal=-1.0,
					to_interest=-4.2,
					to_fees=2.0
				),
				created_by_user_id=seed.get_user_id('bank_admin'),
				deposit_date=date_util.load_date_str('10/26/2020'),
				effective_date=date_util.load_date_str('10/26/2020'),
				session=session
			)

		daily_interest = 0.002 * 450.03

		loan_ids: List[str] = [
			str(uuid.uuid4()),
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			{
				'today': '10/02/2020', # On the repayment payment date, you only reduce the outstanding principal balance
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(-1 * 0.002 * 500.03), # They owe 2 days of interest, but pay off 3, so its -1 day of interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'interest_accrued_today': number_util.round_currency(0.002 * 500.03),
						'fees_accrued_today': 0.0,
						'financing_period': 2,
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 450.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': number_util.round_currency(-1 * 0.002 * 500.03),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 500.03,
					'total_interest_accrued_today': number_util.round_currency(0.002 * 500.03),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01 - (450.03),
					'minimum_interest_info': {
							'minimum_amount': 1.03,
							'amount_accrued': number_util.round_currency(2 * 0.002 * 500.03),
							'amount_short': 0.0,
							'duration': 'monthly'
					},
					'account_level_balance_payload': {
							# wire_fee_1 + wire_fee_2 - repayment_of_fee - repayment_of_fee_with_credit
							'fees_total': 1000.01 + 2000.01 - 12.03 - 2.01,
							# credit_1 + credit_2 - repayment_of_fee_with_credit - payout_to_customer
							'credits_total': 3000.02 + 4000.02 +  - 2.01 - 850.06
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				}
			},
			{
				'today': '10/03/2020', # On the repayment date, you paid off interest and some principal that still accrued due to principal_for_interest
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 450.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': 0.0, # partial payment paid off interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 500.03,
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'interest_accrued_today': number_util.round_currency(0.002 * 500.03), # The repayment takes effect after the 3rd
						'fees_accrued_today': 0.0,
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					}
				]
			},
			{
				'today': '10/26/2020', # It's been 21 days that the loan is late.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03 - 1.0,
						'outstanding_principal_for_interest': 450.03 - 1.0,
						'outstanding_principal_past_due': 450.03 - 1.0,
						# 23 days of interest accrued on 450.03 after the first partial repayment
						# - 4.2 is for the adjustment
						# - 1.0 is adjustment from principal
						# + 2.0 is adjustment for interest
						'outstanding_interest': number_util.round_currency((23 * daily_interest) - 4.2),
						'outstanding_fees': number_util.round_currency(((14 * daily_interest * 0.25) + (7 * daily_interest * 0.5)) + 2.0),
						'amount_to_pay_interest_on': 450.03 - 1.0,
						'interest_accrued_today': number_util.round_currency(daily_interest),
						'fees_accrued_today': number_util.round_currency(daily_interest * 0.5),
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'financing_period': 26,
						'should_close_loan': False,
						'days_overdue': 21
					}
				]
			}
		]

		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_one_payment_one_loan_invoice_financing_past_due_with_account_balances(self) -> None:

		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVOICE_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVOICE_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.002,
						maximum_principal_amount=120000.01,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			financial_summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=100.0,
				product_type=ProductType.INVOICE_FINANCING
			)
			financial_summary.date = date_util.load_date_str('01/01/1960')
			financial_summary.company_id = company_id
			session.add(financial_summary)

			invoice = models.Invoice()
			invoice.company_id = cast(Any, company_id)
			invoice.subtotal_amount = decimal.Decimal(430.02)
			session.add(invoice)
			session.flush()
			artifact_id = str(invoice.id)

			loan = models.Loan(
				id=loan_ids[0],
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03),
				artifact_id=artifact_id
			)
			session.add(loan)
			advance_transaction = payment_test_helper.make_advance(
				session, loan, amount=500.03,  payment_date='09/30/2020', effective_date='10/01/2020'
			)

			# A deleted loan and advance shouldnt affect the test either
			loan2 = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan2)
			advance_transaction2 = payment_test_helper.make_advance(
				session, loan2, amount=500.03,  payment_date='09/30/2020', effective_date='10/01/2020'
			)
			loan2.is_deleted = True
			advance_transaction2.is_deleted

			payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/02/2020',
				effective_date='10/03/2020',
				to_principal=50.0,
				to_interest=1.1, # they pay off some portion of the interest
				to_late_fees=0.0,
				to_account_balance=0.0,
			)

			# Because these transactions get deleted, these dont interrupt any of the financial
			# calculations
			cur_payment, cur_tx = payment_test_helper.make_repayment(
				session=session,
				company_id=company_id,
				loan=loan,
				payment_date='10/02/2020',
				effective_date='10/03/2020',
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_late_fees=0.0,
				to_account_balance=0.0,
			)
			cur_payment.is_deleted = True
			cur_tx.is_deleted = True

		daily_interest_after_repayment = (430.02  - 51.1) * 0.002

		loan_ids: List[str] = [
			str(uuid.uuid4()),
			str(uuid.uuid4()),
		]
		tests: List[Dict] = [
			# Due to invoice financing, the interest accrued is based on the difference
			# between the subtotal on the invoice and the amount they have repaid on the loan
			{
				'today': '10/02/2020', # On the repayment payment date, you only reduce the outstanding principal balance
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency(430.02 * 0.002 * 2 - 1.1), # They owe 2 days of interest, but pay off 3, so its -1 day of interest
						'outstanding_fees': 0.0,
						'amount_to_pay_interest_on': 430.02,
						'interest_accrued_today': number_util.round_currency(430.02 * 0.002),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'financing_period': 2,
						'should_close_loan': False,
						'days_overdue': 0
					}
				],
				'expected_summary_update': {
					'product_type': 'invoice_financing',
					'daily_interest_rate': 0.002,
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 450.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': number_util.round_currency(430.02 * 0.002 * 2 - 1.1),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 430.02,
					'total_interest_accrued_today': number_util.round_currency(430.02 * 0.002),
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 120000.01 - (450.03),
					'minimum_interest_info': {
							'minimum_amount': 1.03,
							'amount_accrued': number_util.round_currency(2 * 0.002 * 430.02),
							'amount_short': 0.0,
							'duration': 'monthly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				}
			},
			{
				'today': '10/03/2020',
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 450.03,
						'outstanding_principal_past_due': 0.0,
						'outstanding_interest': number_util.round_currency((430.02 * 0.002 * 3 - 1.1)),
						'outstanding_fees': 0.0,
						# first_two_days_carryover + settlement day, which doesnt include repayment (because repayment influence happens at the end of the settlement day)
						'amount_to_pay_interest_on': 430.02,
						'interest_accrued_today': number_util.round_currency(430.02 * 0.002 * 1),
						'fees_accrued_today': 0.0,
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'financing_period': 3,
						'should_close_loan': False,
						'days_overdue': 0
					}
				]
			},
			{
				'today': '10/26/2020', # It's been 21 days that the loan is late.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 450.03,
						'outstanding_principal_past_due': 450.03,
						'outstanding_interest': number_util.round_currency((430.02 * 0.002 * 3 - 1.1) + ((430.02  - 51.1) * 0.002 * 23)),
						'outstanding_fees': number_util.round_currency(((14 * daily_interest_after_repayment * 0.25) + (7 * daily_interest_after_repayment * 0.5))),
						'amount_to_pay_interest_on': 430.02 - 51.1,
						# 23 days of interest accrued on 450.03 after the first partial repayment
						# - 4.2 is for the adjustment
						# - 1.0 is adjustment from principal
						# + 2.0 is adjustment for interest
						'interest_accrued_today': number_util.round_currency((430.02  - 51.1) * 0.002),
						'fees_accrued_today': number_util.round_currency(daily_interest_after_repayment * 0.5),
						'day_last_repayment_settles': date_util.load_date_str('10/03/2020'),
						'financing_period': 26,
						'should_close_loan': False,
						'days_overdue': 21
					}
				]
			}
		]

		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_adjusted_total_limit_contract_limit_greater_than_computed_borrowing_base(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=1200000,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
						borrowing_base_cash_in_daca_percentage=0.25,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))

			# Due to an open issue with sqlalchemy-stubs written by Dropbox
			# https://github.com/dropbox/sqlalchemy-stubs/issues/97
			ebba = models.EbbaApplication( # type: ignore
				company_id=company_id,
				monthly_accounts_receivable=decimal.Decimal(100000.0), # 100k
				monthly_inventory=decimal.Decimal(100000.0), #100k
				monthly_cash=decimal.Decimal(1000000.0), # 1M
				amount_cash_in_daca=decimal.Decimal(0.0),
				status="approved",
			)
			session.add(ebba)
			session.commit()
			session.refresh(ebba)

			company_settings = session \
				.query(models.CompanySettings) \
				.filter(models.CompanySettings.company_id == company_id) \
				.first()

			company_settings.active_borrowing_base_id = ebba.id

		loan_ids: List[str] = []
		# Expected Value:
		#  ((100k * 0.5) / 100.0)
		#  + ((100k * 0.25) / 100.0)
		#  + ((1M * 0.75) / 100.0)
		# Computed borrowing base: $825,000
		# Contract max limit: $1,200,000
		self._run_test({
			'today': '10/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'expected_summary_update': {
				'product_type': 'line_of_credit',
				'daily_interest_rate': 0.05,
				'total_limit': 1200000,
				'adjusted_total_limit': 825000,
				'total_outstanding_principal': 0.0,
				'total_outstanding_principal_for_interest': 0.0,
				'total_outstanding_principal_past_due': 0.0,
				'total_outstanding_interest': 0.0,
				'total_outstanding_fees': 0.0,
				'total_principal_in_requested_state': 0.0,
				'total_amount_to_pay_interest_on': 0.0,
				'total_interest_accrued_today': 0.0,
				'total_late_fees_accrued_today': 0.0,
				'available_limit': 825000,
				'minimum_interest_info': {
					'minimum_amount': 1.03,
					'amount_accrued': 0.0,
					'amount_short': 1.03,
					'duration': 'monthly'
				},
				'account_level_balance_payload': {
					'fees_total': 0.0,
					'credits_total': 0.0
				},
				'day_volume_threshold_met': None,
				'most_overdue_loan_days': 0
			}
		}, loan_ids)

		with session_scope(self.session_maker) as session:
			ebba = session.query(models.EbbaApplication).first()
			self.assertEqual(ebba.calculated_borrowing_base, 825000)

	def test_extend_ending_contract(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=1200000,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
						borrowing_base_cash_in_daca_percentage=0.25,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('10/1/2020')
			))

		loan_ids: List[str] = []
		# Expected Value:
		#  ((100k * 0.5) / 100.0)
		#  + ((100k * 0.25) / 100.0)
		#  + ((1M * 0.75) / 100.0)
		# Computed borrowing base: $825,000
		# Contract max limit: $1,200,000
		self._run_test({
			'today': '12/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'account_level_balance_payload': {
					'fees_total': 0.0,
					'credits_total': 0.0
			},
			'day_volume_threshold_met': None
		}, loan_ids)

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).first()
			self.assertEqual('10/01/2021', date_util.date_to_str(contract.adjusted_end_date))

	def test_extend_ending_contract_dynamic_interest_rate(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						dynamic_interest_rate=json.dumps({
							'1/1/2020-10/1/2020': 0.01,
						}),
						maximum_principal_amount=1200000,
						minimum_monthly_amount=1.03,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
						borrowing_base_cash_in_daca_percentage=0.25,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('10/1/2020')
			))

		loan_ids: List[str] = []
		# Expected Value:
		#  ((100k * 0.5) / 100.0)
		#  + ((100k * 0.25) / 100.0)
		#  + ((1M * 0.75) / 100.0)
		# Computed borrowing base: $825,000
		# Contract max limit: $1,200,000
		self._run_test({
			'today': '12/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'account_level_balance_payload': {
					'fees_total': 0.0,
					'credits_total': 0.0
			},
			'day_volume_threshold_met': None
		}, loan_ids)

		with session_scope(self.session_maker) as session:
			contract = session.query(models.Contract).first()
			self.assertEqual('10/01/2021', date_util.date_to_str(contract.adjusted_end_date))

	def test_dynamic_interest_rate_correct_financial_summaries(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						dynamic_interest_rate=json.dumps({
							'01/01/2020-06/30/2020': 0.01,
							'07/01/2020-09/15/2020': 0.0075,
							'09/16/2020-12/31/2020': 0.005,
						}),
						maximum_principal_amount=450000,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(),
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/31/2020')
			))

		loan_ids: List[str] = []
		tests: List[Dict] = [
			{
				'today': '03/1/2020',
				'expected_loan_updates': [],
				'populate_fn': populate_fn,
				'expected_summary_update': {
					'product_type': ProductType.INVENTORY_FINANCING,
					'daily_interest_rate': 0.01, # This matches the 1st portion of the dynamic interest rate.
					'total_limit': 450000,
					'adjusted_total_limit': 450000,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 450000,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
				'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
				},
				'day_volume_threshold_met': None
			},
			{
				'today': '09/1/2020',
				'expected_loan_updates': [],
				'populate_fn': populate_fn,
				'expected_summary_update': {
					'product_type': ProductType.INVENTORY_FINANCING,
					'daily_interest_rate': 0.0075, # This matches the 2nd portion of the dynamic interest rate.
					'total_limit': 450000,
					'adjusted_total_limit': 450000,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 450000,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
				'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
				},
				'day_volume_threshold_met': None
			},
			{
				'today': '09/25/2020',
				'expected_loan_updates': [],
				'populate_fn': populate_fn,
				'expected_summary_update': {
					'product_type': ProductType.INVENTORY_FINANCING,
					'daily_interest_rate': 0.005, # This matches the 3rd portion of the dynamic interest rate.
					'total_limit': 450000,
					'adjusted_total_limit': 450000,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_principal_past_due': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_amount_to_pay_interest_on': 0.0,
					'total_interest_accrued_today': 0.0,
					'total_late_fees_accrued_today': 0.0,
					'available_limit': 450000,
					'minimum_interest_info': {
						'duration': None,
						'minimum_amount': None,
						'amount_accrued': None,
						'amount_short': None,
					},
					'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
					},
					'day_volume_threshold_met': None,
					'most_overdue_loan_days': 0
				},
				'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
				},
				'day_volume_threshold_met': None
			},
		]

		i = 0
		for test in tests:
			self._run_test(test, loan_ids)
			i += 1

	def test_adjusted_total_limit_contract_limit_less_than_computed_borrowing_base(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=450000,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
						borrowing_base_cash_in_daca_percentage=0.25,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))

			# Due to an open issue with sqlalchemy-stubs written by Dropbox
			# https://github.com/dropbox/sqlalchemy-stubs/issues/97
			ebba = models.EbbaApplication( # type: ignore
				company_id=company_id,
				monthly_accounts_receivable=decimal.Decimal(100000.0), # 100k
				monthly_inventory=decimal.Decimal(100000.0), #100k
				monthly_cash=decimal.Decimal(1000000.0), # 1M
				amount_cash_in_daca=decimal.Decimal(0.0),
				status="approved",
			)
			session.add(ebba)
			session.commit()
			session.refresh(ebba)

			company_settings = session \
				.query(models.CompanySettings) \
				.filter(models.CompanySettings.company_id == company_id) \
				.first()

			company_settings.active_borrowing_base_id = ebba.id

		loan_ids: List[str] = []
		# Computed borrowing base: $825,000
		# Contract max limit: $450,000
		self._run_test({
			'today': '10/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'expected_summary_update': {
				'product_type': 'line_of_credit',
				'daily_interest_rate': 0.05,
				'total_limit': 450000,
				'adjusted_total_limit': 450000,
				'total_outstanding_principal': 0.0,
				'total_outstanding_principal_for_interest': 0.0,
				'total_outstanding_principal_past_due': 0.0,
				'total_outstanding_interest': 0.0,
				'total_outstanding_fees': 0.0,
				'total_principal_in_requested_state': 0.0,
				'total_amount_to_pay_interest_on': 0.0,
				'total_interest_accrued_today': 0.0,
				'total_late_fees_accrued_today': 0.0,
				'available_limit': 450000,
				'minimum_interest_info': {
					'duration': None,
					'minimum_amount': None,
					'amount_accrued': None,
					'amount_short': None,
				},
				'account_level_balance_payload': {
					'fees_total': 0.0,
					'credits_total': 0.0
				},
				'day_volume_threshold_met': None,
				'most_overdue_loan_days': 0
			}
		}, loan_ids)

		with session_scope(self.session_maker) as session:
			ebba = session.query(models.EbbaApplication).first()
			self.assertEqual(ebba.calculated_borrowing_base, 825000)

	def test_adjusted_total_limit_without_borrowing_base(self) -> None:
		def populate_fn(
			session: Session, 
			seed: test_helper.BasicSeed, 
			company_id: str,
			loan_ids: List[str],
		) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=1200000,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
						borrowing_base_cash_in_daca_percentage=0.0,
					)
				),
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))

		loan_ids: List[str] = []
		# Expected available limit: $0.
		# Without an active borrowing base certification (ebba_application),
		# calculated borrowing base - and as a result, available limit - both equal $0.
		self._run_test({
			'today': '10/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'expected_summary_update': {
				'product_type': 'line_of_credit',
				'daily_interest_rate': 0.05,
				'total_limit': 1200000,
				'adjusted_total_limit': 0.0,
				'total_outstanding_principal': 0.0,
				'total_outstanding_principal_for_interest': 0.0,
				'total_outstanding_principal_past_due': 0.0,
				'total_outstanding_interest': 0.0,
				'total_outstanding_fees': 0.0,
				'total_principal_in_requested_state': 0.0,
				'total_amount_to_pay_interest_on': 0.0,
				'total_interest_accrued_today': 0.0,
				'total_late_fees_accrued_today': 0.0,
				'available_limit': 0.0,
				'minimum_interest_info': {
					'duration': None,
					'minimum_amount': None,
					'amount_accrued': None,
					'amount_short': None,
				},
				'account_level_balance_payload': {
					'fees_total': 0.0,
					'credits_total': 0.0
				},
				'day_volume_threshold_met': None,
				'most_overdue_loan_days': 0
			}
		}, loan_ids)
