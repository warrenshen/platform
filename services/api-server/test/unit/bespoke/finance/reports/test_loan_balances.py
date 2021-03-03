import datetime
import decimal
import json
import uuid
from typing import Any, List, Dict, cast

from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance.reports import loan_balances

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.payments import payment_test_helper
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

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
				test['populate_fn'](session, company_id)

		customer_balance = loan_balances.CustomerBalance(
			company_dict=models.CompanyDict(
				name='Distributor 1',
				id=company_id
			),
			session_maker=self.session_maker
		)
		customer_update, err = customer_balance.update(today=date_util.load_date_str(test['today']))
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

		if test.get('expected_summary_update'):
			test_helper.assertDeepAlmostEqual(self, test['expected_summary_update'],
				cast(Dict, customer_update['summary_update']))

		success, err = customer_balance.write(customer_update)
		self.assertTrue(success)
		self.assertIsNone(err)

	def test_success_no_payments_no_loans(self) -> None:

		def populate_fn(session: Any, company_id: str) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
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
					'total_outstanding_interest': 0.0,
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'available_limit': 120000.01,
				}
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_no_payments_two_loans_not_due_yet(self) -> None:

		def populate_fn(session: Any, company_id: str) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
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
			payment_test_helper.make_advance(session, loan, amount=500.03, effective_date='10/01/2020')

			loan2 = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/02/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/06/2020'),
				amount=decimal.Decimal(100.03)
			)
			session.add(loan2)
			payment_test_helper.make_advance(session, loan2, amount=100.03, effective_date='10/02/2020')

		tests: List[Dict] = [
			{
				'today': '10/3/2020', # It's been 3 days since the loan starte, and no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_interest': 3 * 0.05 * 500.03, # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0
					},
					{
						'adjusted_maturity_date': date_util.load_date_str('10/06/2020'),
						'outstanding_principal': 100.03,
						'outstanding_interest': 2 * 0.05 * 100.03, # 10/03 - 10/02 is 1 days apart, +1 day, is 2 days of interest.
						'outstanding_fees': 0.0
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'adjusted_total_limit': 120000.01,
					'total_outstanding_principal': 500.03 + 100.03,
					'total_outstanding_interest': (3 * 0.05 * 500.03) + (2 * 0.05 * 100.03),
					'total_outstanding_fees': 0.0,
					'total_principal_in_requested_state': 0.0,
					'available_limit': 120000.01 - (500.03 + 100.03)
				}
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_one_payment_one_loan_past_due(self) -> None:

		def populate_fn(session: Any, company_id: str) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.2,
						maximum_principal_amount=120000.01,
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
			payment_test_helper.make_advance(session, loan, amount=500.03, effective_date='10/01/2020')

			payment_test_helper.make_repayment(
				session, loan,
				to_principal=50.0,
				to_interest=3 * 0.002 * 500.03, # they are paying off 3 days worth of interest accrued here.
				to_fees=0.0,
				effective_date='10/03/2020')

		daily_interest = 0.002 * 450.03

		tests: List[Dict] = [
			{
				'today': '10/03/2020', # On the repayment date, you paid off interest and some principal
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 450.03,
						'outstanding_interest': 0.0, # partial payment paid off interest
						'outstanding_fees': 0.0
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
						'outstanding_interest': 23 * daily_interest, # 23 days of interest accrued on 450.03 after the first partial repayment
						'outstanding_fees': (14 * daily_interest * 0.25) + (7 * daily_interest * 0.5)
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_compute_borrowing_base(self) -> None:
		def populate_fn(session: Any, company_id: str) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.LINE_OF_CREDIT,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.LINE_OF_CREDIT,
					input_dict=ContractInputDict(
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
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
				'total_limit': 120000.01,
				'adjusted_total_limit': 8250,
				'total_outstanding_principal': 0.0,
				'total_outstanding_interest': 0.0,
				'total_outstanding_fees': 0.0,
				'total_principal_in_requested_state': 0.0,
				'available_limit': 120000.01
			}
		})

		with session_scope(self.session_maker) as session:
			ebba = session.query(models.EbbaApplication).first()
			self.assertEqual(ebba.calculated_borrowing_base, 8250)

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
						interest_rate=5.00,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=0, # unused
						late_fee_structure=_get_late_fee_structure(), # unused
						borrowing_base_accounts_receivable_percentage=0.5,
						borrowing_base_inventory_percentage=0.25,
						borrowing_base_cash_percentage=0.75,
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
		customer_update, err = customer_balance.update(today=date_util.load_date_str('10/01/2020'))
		self.assertIsNotNone(err)
		self.assertIn("Attempt to compute a new borrowing base for LINE_OF_CREDIT contract", str(err))
