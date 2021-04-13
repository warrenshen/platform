import datetime
import decimal
import json
import uuid
from typing import Any, Callable, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.reports import loan_balances
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

class TestCalculateLoanBalance(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			session.add(models.CompanySettings(
				company_id=company_id,
				vendor_agreement_docusign_template='unused'
			))

			if test.get('populate_fn'):
				test['populate_fn'](session, seed, company_id)

		customer_balance = loan_balances.CustomerBalance(
			company_dict=models.CompanyDict(
				name='Distributor 1',
				id=company_id
			),
			session_maker=self.session_maker
		)
		customer_update, err = customer_balance.update(
			today=date_util.load_date_str(test['today'])
		)
		self.assertIsNone(err)

		# Sort by increasing adjusted maturity date for consistency in tests
		loan_updates = customer_update['loan_updates']
		loan_updates.sort(key=lambda u: u['adjusted_maturity_date'])
		self.assertEqual(len(test['expected_loan_updates']), len(loan_updates))
		for i in range(len(loan_updates)):
			expected_update = test['expected_loan_updates'][i]
			actual_update = cast(Dict, loan_updates[i])

			copied_update = {**actual_update}

			keys_to_delete = ['loan_id']
			for key in keys_to_delete:
				del copied_update[key]
				if key in expected_update:
					del expected_update[key]

			test_helper.assertDeepAlmostEqual(self, expected_update, copied_update)

		if test.get('expected_summary_update') is not None:
			test_helper.assertDeepAlmostEqual(self, test['expected_summary_update'],
				cast(Dict, customer_update['summary_update']))

		success, err = customer_balance.write(customer_update)
		self.assertTrue(success)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			financial_summary = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == company_id).first())

			if test.get('expected_summary_update') is not None:
				self.assertIsNotNone(financial_summary)
				expected = test['expected_summary_update']
				actual = financial_summary

				self.assertAlmostEqual(expected['total_limit'], float(actual.total_limit))
				self.assertAlmostEqual(expected['total_outstanding_principal'], float(actual.total_outstanding_principal))
				self.assertAlmostEqual(expected['total_outstanding_principal_for_interest'], float(actual.total_outstanding_principal_for_interest))
				self.assertAlmostEqual(expected['total_outstanding_interest'], float(actual.total_outstanding_interest))
				self.assertAlmostEqual(expected['total_outstanding_fees'], float(actual.total_outstanding_fees))
				self.assertAlmostEqual(expected['total_principal_in_requested_state'], float(actual.total_principal_in_requested_state))
				self.assertAlmostEqual(expected['available_limit'], float(actual.available_limit))

				test_helper.assertDeepAlmostEqual(
					self, expected['account_level_balance_payload'], cast(Dict, actual.account_level_balance_payload))
				test_helper.assertDeepAlmostEqual(
					self, expected['minimum_monthly_payload'], cast(Dict, actual.minimum_monthly_payload))

			if 'expected_day_volume_threshold_met' in test:
				self.assertEqual(
					test['expected_day_volume_threshold_met'], financial_summary.day_volume_threshold_met)


	def test_success_no_payments_no_loans(self) -> None:

		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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

		tests: List[Dict] = [
			{
				'today': '10/1/2020',
				'expected_loan_updates': [],
				'populate_fn': populate_fn,
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_principal_for_interest': 0.0,
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_interest_accrued_today': 0.0,
					'available_limit': 120000.01,
					'minimum_monthly_payload': {
						'minimum_amount': 2001.03,
						'amount_accrued': 0.0,
						'amount_short': 2001.03,
						'duration': 'monthly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None
				}
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_no_payments_two_loans_not_due_yet(self) -> None:

		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='10/01/2020', effective_date='10/01/2020')

			loan2 = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/02/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/06/2020'),
				amount=decimal.Decimal(100.03)
			)
			session.add(loan2)
			payment_test_helper.make_advance(
				session, loan2, amount=100.03, payment_date='10/02/2020', effective_date='10/02/2020')

		tests: List[Dict] = [
			{
				'today': '10/3/2020', # It's been 3 days since the loan starte, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_interest': round(3 * 0.05 * 500.03, 2), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.05 * 500.03, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('10/06/2020'),
						'outstanding_principal': 100.03,
						'outstanding_principal_for_interest': 100.03,
						'outstanding_interest': round(2 * 0.05 * 100.03, 2), # 10/03 - 10/02 is 1 days apart, +1 day, is 2 days of interest.
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.05 * 100.03, 2),
						'should_close_loan': False
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03 + 100.03,
					'total_outstanding_principal_for_interest': 500.03 + 100.03,
					'total_outstanding_interest': round((3 * 0.05 * 500.03), 2) + round((2 * 0.05 * 100.03), 2),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_interest_accrued_today': round(0.05 * 500.03, 2) + round(0.05 * 100.03, 2),
					'available_limit': 120000.01 - (500.03 + 100.03),
					'minimum_monthly_payload': {
							'minimum_amount': 200.03,
							'amount_accrued': round((3 * 0.05 * 500.03) + (2 * 0.05 * 100.03), 2),
							'amount_short': round(200.03 - ((3 * 0.05 * 500.03) + (2 * 0.05 * 100.03)), 2),
							'duration': 'monthly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None
				}
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_repayment_quarterly_minimum_accrued_no_late_fee_once_loan_is_paid_off(self) -> None:

		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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
				start_date=date_util.load_date_str('1/1/2020'),
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('11/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='10/01/2020', effective_date='10/01/2020')

			# Pay off the loan on the 4th, and the 37 days of interest accrued.
			# No late fees accrue even though the payment settles after the loan reaches its maturity date
			payment_test_helper.make_repayment(
					session, loan,
					to_principal=500.03,
					to_interest=round(37 * 0.005 * 500.03, 2),
					to_fees=0.0,
					payment_date='11/04/2020',
					effective_date='11/06/2020'
			)

		tests: List[Dict] = [
			{
				'today': '11/3/2020', # It's been 34 days since the loan started, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_interest': round(34 * 0.005 * 500.03, 2), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.005 * 500.03, 2),
						'should_close_loan': False
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_interest': round((34 * 0.005 * 500.03), 2),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_interest_accrued_today': round(0.005 * 500.03, 2),
					'available_limit': 120000.01 - (500.03),
					'minimum_monthly_payload': {
							'minimum_amount': 20000.03,
							'amount_accrued': number_util.round_currency(34 * 0.005 * 500.03),
							'amount_short': number_util.round_currency(20000.03 - (34 * 0.005 * 500.03)),
							'duration': 'quarterly'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None
				}
			},
			{
				'today': '11/06/2020', # It's been 35 days since the loan started, and it gets fully paid off
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('11/05/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.005 * 500.03, 2),
						'should_close_loan': True
					},
				],
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_no_payments_two_loans_not_due_yet_yearly_minimum_accrued(self) -> None:

		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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
				adjusted_end_date=date_util.load_date_str('12/1/2020')
			))
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('09/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/10/2020'), # spans 2 quarters
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			payment_test_helper.make_advance(
				session, loan, amount=500.03, payment_date='09/01/2020', effective_date='09/01/2020')

		tests: List[Dict] = [
			{
				'today': '10/05/2020', # It's been 35 days since the loan started, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/10/2020'),
						'outstanding_principal': 500.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_interest': round(35 * 0.005 * 500.03, 2), # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.005 * 500.03, 2),
						'should_close_loan': False
					},
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_interest': round((35 * 0.005 * 500.03), 2),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_interest_accrued_today': round(0.005 * 500.03, 2),
					'available_limit': 120000.01 - (500.03),
					'minimum_monthly_payload': {
							'minimum_amount': 20000.03,
							'amount_accrued': round((35 * 0.005 * 500.03), 2),
							'amount_short': round(20000.03 - (35 * 0.005 * 500.03), 2),
							'duration': 'annually'
					},
					'account_level_balance_payload': {
							'fees_total': 0.0,
							'credits_total': 0.0
					},
					'day_volume_threshold_met': None
				}
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_no_payments_two_loans_reduced_interest_rate_due_to_threshold(self) -> None:

		def get_populate_fn(threshold_starting_value: float) -> Callable:

			def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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
					company_id=company_id,
					origination_date=date_util.load_date_str('10/01/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
					amount=decimal.Decimal(500.03)
				)
				session.add(loan)
				payment_test_helper.make_advance(
					session, loan, amount=500.03, payment_date='10/01/2020', effective_date='10/01/2020')

				loan2 = models.Loan(
					company_id=company_id,
					origination_date=date_util.load_date_str('10/05/2020'),
					adjusted_maturity_date=date_util.load_date_str('12/2/2020'),
					amount=decimal.Decimal(600.03)
				)
				session.add(loan2)
				payment_test_helper.make_advance(
					session, loan2, amount=600.03, payment_date='10/05/2020', effective_date='10/05/2020')

				loan3 = models.Loan(
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
					session, loan,
					to_principal=400.03,
					to_interest=0,
					to_fees=0.0,
					payment_date='10/03/2020',
					effective_date='10/03/2020'
				)

				# You cross the threshold on the 5th if you started with 0 dollars.
				payment_test_helper.make_repayment(
					session, loan,
					to_principal=100.00,
					to_interest=0,
					to_fees=0.0,
					payment_date='10/05/2020',
					effective_date='10/05/2020'
				)
				payment_test_helper.make_repayment(
					session, loan2,
					to_principal=500.03,
					to_interest=0.0,
					to_fees=0.0,
					payment_date='10/05/2020',
					effective_date='10/05/2020'
				)
			return populate_fn


		first_day = 1 * 0.05 * 499.97 + 1 * 0.01 * (600.03 - 499.97)

		tests: List[Dict] = [
			{
				'today': '10/03/2020', # Days before you cross the threshold
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 100.00,
						'outstanding_principal_for_interest': 100.00,
						'outstanding_interest': round(3 * 0.05 * 500.03, 2), # 3 days of interest
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.05 * 500.03, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False # hasnt been funded yet
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False # hasnt been funded yet
					}
				],
				'expected_day_volume_threshold_met': None
			},
			{
				'today': '10/05/2020', # The day you cross the threshold, but it doesnt take effect until the next day
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': round(3 * 0.05 * 500.03, 2) + round(2 * 0.05 * 100.00, 2), # 5 days of interest
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.05 * 100.00, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_interest': round(1 * 0.05 * 600.03, 2), # 1 day of interest
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.05 * 600.03, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/05/2020')
			},
			{
				'today': '10/09/2020', # You have 4 days after crossing the threshold, and should have the discounted rate
				'populate_fn': get_populate_fn(threshold_starting_value=0.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': round(3 * 0.05 * 500.03, 2) + round(2 * 0.05 * 100.00, 2), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_interest': round(1 * 0.05 * 600.03, 2) + round(4 * 0.01 * 100.0, 2), # 1 day of interest + 4 days at the lower rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 100.00, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_interest': round(3 * 0.01 * 700.03, 2), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 700.03, 2),
						'should_close_loan': False
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/05/2020')
			},
			{
				'today': '10/09/2020', # You crossed the threshold from the beginning
				'populate_fn': get_populate_fn(threshold_starting_value=2000.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': round(3 * 0.01 * 500.03, 2) + round(2 * 0.01 * 100.00, 2), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_interest': round(1 * 0.01 * 600.03, 2) + round(4 * 0.01 * 100.0, 2), # All days at lower rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 100.0, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_interest': round(3 * 0.01 * 700.03, 2), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 700.03, 2),
						'should_close_loan': False
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('01/01/2020')
			},
			{
				'today': '10/09/2020', # You crossed the threshold on the 3rd instead of the 5th because of the starting value
				'populate_fn': get_populate_fn(threshold_starting_value=800.0),
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('12/1/2020'),
						'outstanding_principal': 0.0,
						'outstanding_principal_for_interest': 0.0,
						'outstanding_interest': round(3 * 0.05 * 500.03, 2) + round(2 * 0.01 * 100.00, 2), # 5 days of interest, stopped accruing after repayment
						'outstanding_fees': 0.0,
						'interest_accrued_today': 0.0,
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/2/2020'),
						'outstanding_principal': 100.0,
						'outstanding_principal_for_interest': 100.0,
						'outstanding_interest': round(1 * 0.01 * 600.03, 2) + round(4 * 0.01 * 100.0, 2), # All days at lower rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 100.00, 2),
						'should_close_loan': False
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('12/3/2020'),
						'outstanding_principal': 700.03,
						'outstanding_principal_for_interest': 700.03,
						'outstanding_interest': round(3 * 0.01 * 700.03, 2), # You have 3 days, all at the discounted rate
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.01 * 700.03, 2),
						'should_close_loan': False
					}
				],
				'expected_day_volume_threshold_met': date_util.load_date_str('10/03/2020')
			},
		]
		i = 0
		for test in tests:
			#print('RUN A TEST {}'.format(i))
			self._run_test(test)
			i += 1

	def test_success_one_payment_one_loan_past_due_with_account_balances_and_adjustments(self) -> None:

		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			advance_tx = payment_test_helper.make_advance(
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
			advance_tx2 = payment_test_helper.make_advance(
				session, loan2, amount=500.03,  payment_date='09/30/2020', effective_date='10/01/2020'
			)
			loan2.is_deleted = True
			advance_tx2.is_deleted

			# Book an account-level fee and a credit, and make sure it doesnt influence
			# any of the loan updates
			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype='wire_fee', amount=1000.01, originating_payment_id=advance_tx.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				payment_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_util.create_and_add_account_level_fee(
				company_id=company_id,
				subtype='wire_fee', amount=2000.01, originating_payment_id=advance_tx.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				payment_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_util.create_and_add_credit_to_user(
				company_id=company_id,
				amount=3000.02, originating_payment_id=advance_tx.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				payment_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_util.create_and_add_credit_to_user(
				company_id=company_id,
				amount=4000.02, originating_payment_id=advance_tx.payment_id,
				created_by_user_id=seed.get_user_id('bank_admin'),
				payment_date=date_util.load_date_str('10/01/2020'),
				effective_date=date_util.load_date_str('10/01/2020'),
				session=session
			)

			payment_test_helper.make_repayment(
				session, loan,
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_fees=0.0,
				payment_date='10/02/2020',
				effective_date='10/03/2020'
			)

			# Because these transactions get deleted, these dont interrupt any of the financial
			# calculations
			cur_payment, cur_tx = payment_test_helper.make_repayment(
				session, loan,
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_fees=0.0,
				payment_date='10/02/2020',
				effective_date='10/03/2020'
			)
			cur_payment.is_deleted = True
			cur_tx.is_deleted = True

			payment_util.create_and_add_adjustment(
				company_id=company_id,
				loan_id=str(loan.id),
				tx_amount_dict=payment_util.TransactionAmountDict(
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

		tests: List[Dict] = [
			{
				'today': '10/02/2020', # On the repayment payment date, you only reduce the outstanding principal balance
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_principal_for_interest': 500.03,
						'outstanding_interest': round(-1 * 0.002 * 500.03, 2), # They owe 2 days of interest, but pay off 3, so its -1 day of interest
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.002 * 500.03),
						'should_close_loan': False
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 450.03,
					'total_outstanding_principal_for_interest': 500.03,
					'total_outstanding_interest': round(-1 * 0.002 * 500.03, 2),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'total_interest_accrued_today': round(0.002 * 500.03),
					'available_limit': 120000.01 - (450.03),
					'minimum_monthly_payload': {
							'minimum_amount': 1.03,
							'amount_accrued': round(2 * 0.002 * 500.03, 2),
							'amount_short': 0.0,
							'duration': 'monthly'
					},
					'account_level_balance_payload': {
							'fees_total': 3000.02,
							'credits_total': 7000.04
					},
					'day_volume_threshold_met': None
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
						'outstanding_interest': 0.0, # partial payment paid off interest
						'outstanding_fees': 0.0,
						'interest_accrued_today': round(0.002 * 500.03, 2), # The repayment takes effect after the 3rd
						'should_close_loan': False
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
						# 23 days of interest accrued on 450.03 after the first partial repayment
						# - 4.2 is for the adjustment
						# - 1.0 is adjustment from principal
						# + 2.0 is adjustment for interest
						'outstanding_interest': round(23 * daily_interest, 2) - 4.2,
						'outstanding_fees': round((14 * daily_interest * 0.25) + (7 * daily_interest * 0.5), 2) + 2.0,
						'interest_accrued_today': round(daily_interest, 2),
						'should_close_loan': False
					}
				]
			}
		]

		i = 0
		for test in tests:
			#print('TEST {}'.format(i))
			self._run_test(test)
			i += 1

	def test_success_compute_borrowing_base(self) -> None:
		def populate_fn(session: Any, seed: test_helper.BasicSeed, company_id: str) -> None:
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

			company_settings.active_ebba_application_id = ebba.id

		# Expected Value:
		#  ((100k * 0.5) / 100.0)
		#  + ((100k * 0.25) / 100.0)
		#  + ((1M * 0.75) / 100.0)
		# = $8,250
		self._run_test({
			'today': '10/1/2020',
			'expected_loan_updates': [],
			'populate_fn': populate_fn,
			'expected_summary_update': {
				'product_type': 'line_of_credit',
				'total_limit': 1200000,
				'adjusted_total_limit': 825000,
				'total_outstanding_principal': 0.0,
				'total_outstanding_principal_for_interest': 0.0,
				'total_outstanding_interest': 0.0,
				'total_outstanding_fees': 0.0,
				'total_principal_in_requested_state': 0.0,
				'total_interest_accrued_today': 0.0,
				'available_limit': 825000,
				'minimum_monthly_payload': {
						'minimum_amount': 1.03,
						'amount_accrued':0.0,
						'amount_short': 1.03,
						'duration': 'monthly'
				},
				'account_level_balance_payload': {
						'fees_total': 0.0,
						'credits_total': 0.0
				},
				'day_volume_threshold_met': None
			}
		})

		with session_scope(self.session_maker) as session:
			ebba = session.query(models.EbbaApplication).first()
			self.assertEqual(ebba.calculated_borrowing_base, 825000)

	def test_failure_line_of_credit_without_borrowing_base(self) -> None:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
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

		customer_balance = loan_balances.CustomerBalance(
			company_dict=models.CompanyDict(
				name='Distributor 1',
				id=company_id,
			),
			session_maker=self.session_maker
		)
		customer_update, err = customer_balance.update(
			today=date_util.load_date_str('10/01/2020')
		)
		self.assertIsNotNone(err)
		self.assertIn("Attempt to compute a new borrowing base for LINE_OF_CREDIT contract", str(err))
