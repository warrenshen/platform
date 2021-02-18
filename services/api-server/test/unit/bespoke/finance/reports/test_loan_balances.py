import datetime
import decimal
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
			test_helper.assertDeepAlmostEqual(self, test['expected_summary_update'], customer_update['summary_update'])

	def test_success_no_payments_no_loans(self) -> None:
		tests: List[Dict] = [
			{
				'today': '10/1/2020',
				'expected_loan_updates': []
			}
		]
		for test in tests:
			self._run_test(test)

	def test_success_no_payments_one_loan_not_due_yet(self) -> None:

		def populate_fn(session: Any, company_id: str) -> None:
			session.add(models.Contract(
				company_id=company_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						interest_rate=0.05,
						maximum_principal_amount=120000.01
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
			# Advance is made
			payment = models.Payment(
				type=PaymentType.ADVANCE,
				amount=decimal.Decimal(500.03),
				company_id=company_id
			)
			session.add(payment)
			session.flush()
			session.add(models.Transaction(
				type=PaymentType.ADVANCE,
				amount=decimal.Decimal(500.03),
				loan_id=loan.id,
				payment_id=payment.id,
				to_principal=decimal.Decimal(500.03),
				to_interest=decimal.Decimal(0.0),
				to_fees=decimal.Decimal(0.0),
				effective_date=date_util.load_date_str('10/01/2020')
			))

		tests: List[Dict] = [
			{
				'today': '10/3/2020', # It's been 3 days since the loan was due, but no late fees have accrued.
				'populate_fn': populate_fn,
				'expected_loan_updates': [
					{
						'adjusted_maturity_date': date_util.load_date_str('10/05/2020'),
						'outstanding_principal': 500.03,
						'outstanding_interest': 3 * 0.05 * 500.03, # 10/03 - 10/01 is 2 days apart, +1 day, is 3 days of interest.
						'outstanding_fees': 0.0
					}
				],
				'expected_summary_update': {
					'product_type': 'inventory_financing',
					'total_limit': 120000.01,
					'total_outstanding_principal': 0.0,
					'total_outstanding_interest': 0.0,
					'total_principal_in_requested_state': 0.0,
					'available_limit': 0.0
				}
			}
		]
		for test in tests:
			self._run_test(test)
