import datetime
import decimal
import json
import uuid
from typing import Any, List, Dict, cast

from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.db_constants import ProductType, PaymentType
from bespoke.db.models import session_scope
from bespoke.finance.reports import loan_balances

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

def _make_advance(session: Any, loan: models.Loan, amount: float, effective_date: str) -> None:
	# Advance is made
	payment = models.Payment(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id
	)
	session.add(payment)
	session.flush()
	session.add(models.Transaction(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(amount),
		to_interest=decimal.Decimal(0.0),
		to_fees=decimal.Decimal(0.0),
		effective_date=date_util.load_date_str(effective_date)
	))

def _make_repayment(
	session: Any, loan: models.Loan, 
	to_principal: float, to_interest: float, to_fees: float, 
	effective_date: str) -> None:
	# Advance is made
	amount = to_principal + to_interest + to_fees
	payment = models.Payment(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id
	)
	session.add(payment)
	session.flush()
	session.add(models.Transaction(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(to_principal),
		to_interest=decimal.Decimal(to_interest),
		to_fees=decimal.Decimal(to_fees),
		effective_date=date_util.load_date_str(effective_date)
	))

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
			
			keys_to_delete = ['loan_id']
			for key in keys_to_delete:
				del actual_update[key]
				if key in expected_update:
					del expected_update[key]

			test_helper.assertDeepAlmostEqual(self, expected_update, actual_update)

		if test.get('expected_summary_update'):
			test_helper.assertDeepAlmostEqual(self, test['expected_summary_update'], 
				cast(Dict, customer_update['summary_update']))

	def test_success_no_payments_no_loans(self) -> None:
		tests: List[Dict] = [
			{
				'today': '10/1/2020',
				'expected_loan_updates': []
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
						late_fee_structure=_get_late_fee_structure() # unused
					)
				)
			))
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			_make_advance(session, loan, amount=500.03, effective_date='10/01/2020')

			loan2 = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/02/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/06/2020'),
				amount=decimal.Decimal(100.03)
			)
			session.add(loan2)
			_make_advance(session, loan2, amount=100.03, effective_date='10/02/2020')

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
						late_fee_structure=_get_late_fee_structure()
					)
				)
			))
			loan = models.Loan(
				company_id=company_id,
				origination_date=date_util.load_date_str('10/01/2020'),
				adjusted_maturity_date=date_util.load_date_str('10/05/2020'),
				amount=decimal.Decimal(500.03)
			)
			session.add(loan)
			_make_advance(session, loan, amount=500.03, effective_date='10/01/2020')

			_make_repayment(
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
