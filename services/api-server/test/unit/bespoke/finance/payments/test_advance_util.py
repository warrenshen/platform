import datetime
import decimal
import uuid
from typing import cast, List, Dict

from bespoke.enums.loan_status_enum import LoanStatusEnum
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.payments import advance_util
from bespoke.finance.payments import payment_util
from bespoke.finance import number_util
from bespoke.date import date_util

from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

class TestFundLoansWithAdvance(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		amounts = test['loan_amounts']
		company_indices = test['company_indices']
		payment_amount = test['payment_input_amount']
		bank_admin_user_id = seed.get_user_id('bank_admin')

		loan_ids = []
		with session_scope(session_maker) as session:
			for i in range(len(amounts)):
				amount = amounts[i]
				index = company_indices[i]
				company_id = seed.get_company_id('company_admin', index=index)
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(amount)
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id=bank_admin_user_id, 
			loan_ids=loan_ids, 
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=payment_amount,
				method='ach',
				deposit_date='unused'
			), 
			session_maker=session_maker
		)
		self.assertIsNone(err)
		self.assertEqual('OK', resp.get('status'), msg=err)

		# Run validations
		with session_scope(session_maker) as session:
			# Validate loans
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			loans = [loan for loan in loans]
			loans.sort(key=lambda l: l.amount) # sort in increasing amounts to match order of amounts array

			for i in range(len(amounts)):
				amount = amounts[i]
				loan = loans[i]
				company_id = seed.get_company_id('company_admin', index=company_indices[i])
				self.assertEqual(company_id, loan.company_id)
				self.assertAlmostEqual(amount, float(loan.amount))
				self.assertAlmostEqual(amount, float(loan.outstanding_principal_balance))
				self.assertAlmostEqual(0.0, float(loan.outstanding_interest))
				self.assertAlmostEqual(0.0, float(loan.outstanding_fees))
				self.assertEqual(LoanStatusEnum.Funded, loan.status)

				self.assertIsNotNone(loan.funded_at)
				self.assertEqual(bank_admin_user_id, loan.funded_by_user_id)

			# Validate payments
			payments = cast(
				List[models.Payment],
				session.query(models.Payment).all())
			payments = [payment for payment in payments]
			payments.sort(key=lambda p: p.amount)

			self.assertEqual(len(test['payments']), len(payments))
			for i in range(len(test['payments'])):
				payment = payments[i] 
				exp_payment = test['payments'][i]
				exp_company_id = seed.get_company_id('company_admin', index=exp_payment['company_index'])
				self.assertAlmostEqual(exp_payment['amount'], float(payment.amount))
				self.assertEqual('advance', payment.type)
				self.assertEqual(exp_company_id, payment.company_id)
				self.assertEqual('ach', payment.method)
				self.assertIsNotNone(payment.applied_at)
				self.assertIsNotNone(payment.submitted_at)

			# Validate transactions
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).all())
			transactions = [t for t in transactions]
			self.assertEqual(len(test['transactions']), len(transactions))

			transactions.sort(key=lambda t: t.amount) # sort in increasing amounts to match order of transactions array

			for i in range(len(test['transactions'])):
				transaction = transactions[i]
				exp_transaction = test['transactions'][i]
				exp_company_id = seed.get_company_id('company_admin', index=exp_payment['company_index'])
				matching_loan = loans[exp_transaction['loan_index']]
				matching_payment = payments[exp_transaction['payment_index']]

				self.assertAlmostEqual(exp_transaction['amount'], float(transaction.amount))
				self.assertEqual('advance', transaction.type)
				self.assertAlmostEqual(exp_transaction['amount'], float(transaction.to_principal))
				self.assertAlmostEqual(0.0, float(transaction.to_interest))
				self.assertAlmostEqual(0.0, float(transaction.to_fees))
				self.assertEqual(matching_loan.id, transaction.loan_id)
				self.assertEqual(matching_payment.id, transaction.payment_id)
				self.assertEqual(bank_admin_user_id, transaction.created_by_user_id)

	def test_successful_advance_one_customer(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'loan_amounts': [10.01, 20.02],
				'company_indices': [0, 0],
				'payment_input_amount': 30.03,
				'payments': [
					{
						'amount': 30.03,
						'company_index': 0
					}
				],
				'transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)

	def test_successful_advance_multiple_customers_at_one_time(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from many customers',
				'loan_amounts': [10.01, 20.02, 30.03, 40.04],
				'company_indices': [0, 1, 0, 1],
				'payment_input_amount': 10.01 + 20.02 + 30.03 + 40.04,
				'payments': [
				  # We create two payments, one for each customer
					{
						'amount': 10.01 + 30.03,
						'company_index': 0
					},
					{
						'amount': 20.02 + 40.04,
						'company_index': 1
					}
				],
				'transactions': [
				  # There is one transaction for each loan, but two transactions associated with each payment
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 1
					},
					{
						'amount': 30.03,
						'loan_index': 2,
						'payment_index': 0
					},
					{
						'amount': 40.04,
						'loan_index': 3,
						'payment_index': 1
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)

	def test_failure_advance_no_loans(self) -> None:
		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id='', 
			loan_ids=[], 
			payment_input=None, 
			session_maker=self.session_maker
		)
		self.assertIn('No loans', err.msg)

	def test_failure_advance_some_loans_not_found(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		random_uuid = str(uuid.uuid4())
		loan_ids = [random_uuid]
		with session_scope(self.session_maker) as session:
			company_id = seed.get_company_id('company_admin', index=0)
			loan = models.Loan(
				company_id=company_id,
				amount=decimal.Decimal(24.0)
			)
			session.add(loan)
			session.flush()
			loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id='', 
			loan_ids=loan_ids, 
			payment_input=None, 
			session_maker=self.session_maker
		)
		self.assertIn('Not all loans', err.msg)

	def test_failure_advance_some_already_funded(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loan_ids = []
		with session_scope(self.session_maker) as session:
			company_id = seed.get_company_id('company_admin', index=0)
			loan = models.Loan(
				company_id=company_id,
				amount=decimal.Decimal(24.0),
				funded_at=date_util.now()
			)
			session.add(loan)
			session.flush()
			loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id='', 
			loan_ids=loan_ids, 
			payment_input=None, 
			session_maker=self.session_maker
		)
		self.assertIn('already been funded', err.msg)

	def test_failure_advance_amount_not_equal(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loan_ids = []
		amounts = [20.02, 30.03]
		with session_scope(self.session_maker) as session:
			company_id = seed.get_company_id('company_admin', index=0)
			for amount in amounts:
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(amount)
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id='', 
			loan_ids=loan_ids,
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=0.2,
				method='ach',
				deposit_date='unused'
			), 
			session_maker=self.session_maker
		)
		self.assertIn('exactly', err.msg)
