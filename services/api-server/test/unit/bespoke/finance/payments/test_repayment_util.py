import datetime
import decimal
from typing import List, Dict

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util
from bespoke.finance.payments import repayment_util

from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

class TestCalculateRepaymentEffect(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loans = test['loans']
		loan_ids = []
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:
			for i in range(len(loans)):
				loan = loans[i]
				loan.company_id = company_id
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		resp, err = repayment_util.calculate_repayment_effect(
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment_input_amount'],
				method='ach',
				deposit_date=test['deposit_date']
			), 
			payment_option=test['payment_option'], 
			company_id=company_id, 
			loan_ids=loan_ids, 
			session_maker=session_maker
		)
		self.assertIsNone(err)
		self.assertEqual('OK', resp.get('status'), msg=err)
		self.assertEqual(test['amount_to_pay'], resp['amount_to_pay'])

	def test_custom_amount(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'The user pays exactly what they specified',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('9/1/2020'),
						outstanding_principal_balance=decimal.Decimal(10.0)
					)
				],
				'deposit_date': '10/12/2020',
				'payment_option': 'custom_amount',
				'payment_input_amount': 10.01,
				'amount_to_pay': 10.01
			}
		]

		for test in tests:
			self._run_test(test)

	def test_pay_minimum_due(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'The user owes everything on the one loan that has matured',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('10/1/2020'),
						outstanding_principal_balance=decimal.Decimal(20.02),
						outstanding_interest=decimal.Decimal(10.0),
						outstanding_fees=decimal.Decimal(2.4),
					),
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
						outstanding_principal_balance=decimal.Decimal(10.0)
					) # this loan doesnt need to get paid yet
				],
				'deposit_date': '10/12/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,
				'amount_to_pay': 20.02 + 10.0 + 2.4
			},
			{
				'comment': 'The user owes everything on the several loans that have matured',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('10/1/2020'),
						outstanding_principal_balance=decimal.Decimal(20.02),
						outstanding_interest=decimal.Decimal(10.0),
						outstanding_fees=decimal.Decimal(2.4),
					),
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('10/2/2020'),
						outstanding_principal_balance=decimal.Decimal(8.0)
					) # this loan doesnt need to get paid yet
				],
				'deposit_date': '10/12/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,
				'amount_to_pay': 20.02 + 10.0 + 2.4 + 8.0
			}
		]

		for test in tests:
			self._run_test(test)

	def test_pay_in_full(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'The user owes everything regardless of maturity date',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('10/1/2020'),
						outstanding_principal_balance=decimal.Decimal(20.02),
						outstanding_interest=decimal.Decimal(10.0),
						outstanding_fees=decimal.Decimal(2.4),
					),
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
						outstanding_principal_balance=decimal.Decimal(8.0)
					) # this loan doesnt need to get paid yet
				],
				'deposit_date': '10/12/2020',
				'payment_option': 'pay_in_full',
				'payment_input_amount': None,
				'amount_to_pay': 20.02 + 10.0 + 2.4 + 8.0
			}
		]

		for test in tests:
			self._run_test(test)

