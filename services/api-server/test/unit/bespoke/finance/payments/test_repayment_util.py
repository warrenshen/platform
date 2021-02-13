import datetime
import decimal
import uuid
from typing import List, Dict, cast

from bespoke.date import date_util
from bespoke.db import models, db_constants
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

class TestCreatePayment(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		loan_ids = []
		amounts = test['loan_amounts']
		with session_scope(session_maker) as session:
			for i in range(len(amounts)):
				amount = amounts[i]
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(amount),
					approved_at=date_util.now(),
					funded_at=date_util.now()
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		user_id = seed.get_user_id('company_admin', index=0)
		payment_input_amount = test['payment_amount']
		payment_id, err = repayment_util.create_payment(
			company_id=company_id, 
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=payment_input_amount,
				method=test['payment_method'],
				deposit_date='unused'
		),
			loan_ids=loan_ids,
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIsNone(err)

		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())

			# Assertions on the payment
			self.assertEqual(payment_input_amount, payment.amount)
			self.assertEqual(db_constants.PaymentType.REPAYMENT, payment.type)
			self.assertEqual(company_id, payment.company_id)
			self.assertEqual(test['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(user_id, payment.submitted_by_user_id)
			self.assertEqual(loan_ids, cast(Dict, payment.items_covered)['loan_ids'])

	def test_schedule_payment_reverse_draft_ach(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 30.0,
				'payment_method': 'reverse_draft_ach',
				'loan_amounts': [20.0, 30.0]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_notify_payment(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 40.0,
				'payment_method': 'ach',
				'loan_amounts': [30.0, 40.0]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_missing_loans(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		user_id = seed.get_user_id('company_admin', index=0)
		payment_id, err = repayment_util.create_payment(
			company_id=None, 
			payment_insert_input=None,
			loan_ids=[str(uuid.uuid4())],
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIn('No loans', err.msg)

	def test_not_funded_loan(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		user_id = seed.get_user_id('company_admin', index=0)
		company_id = seed.get_company_id('company_admin', index=0)
		loan_id = None

		with session_scope(self.session_maker) as session:
			loan = models.Loan(
				company_id=company_id,
				amount=decimal.Decimal(2.0),
				approved_at=date_util.now()
			)
			session.add(loan)
			session.flush()
			loan_id = str(loan.id)

		payment_id, err = repayment_util.create_payment(
			company_id=company_id, 
			payment_insert_input=None,
			loan_ids=[loan_id],
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIn('are funded', err.msg)
