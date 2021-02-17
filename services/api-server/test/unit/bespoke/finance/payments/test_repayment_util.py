import datetime
import decimal
import uuid
from typing import List, Dict, cast

from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util
from bespoke.finance.payments import repayment_util
from bespoke.finance.payments.repayment_util import (
	TransactionInputDict, LoanAfterwardsDict, LoanBalanceDict)

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
		loan_ids_not_selected = []
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:
			for i in range(len(loans)):
				loan = loans[i]
				loan.company_id = company_id
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

			if test.get('loans_not_selected'):
				for j in range(len(test['loans_not_selected'])):
					loan_not_selected = test['loans_not_selected'][j]
					loan_not_selected.company_id = company_id
					session.add(loan_not_selected)
					session.flush()
					loan_ids_not_selected.append(str(loan_not_selected.id))

		resp, err = repayment_util.calculate_repayment_effect(
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment_input_amount'],
				method='ach',
				payment_date=test['payment_date'],
				settlement_date=test['settlement_date']
			), 
			payment_option=test['payment_option'], 
			company_id=company_id, 
			loan_ids=loan_ids, 
			session_maker=session_maker
		)
		self.assertIsNone(err)
		self.assertEqual('OK', resp.get('status'), msg=err)
		self.assertEqual(test['expected_amount_to_pay'], resp['amount_to_pay'])
		if test.get('expected_amount_as_credit_to_user'):
			self.assertAlmostEqual(test['expected_amount_as_credit_to_user'], resp['amount_as_credit_to_user'])
		else:
			self.assertAlmostEqual(0.0, resp['amount_as_credit_to_user'])

		# Assert on the expected loans afterwards
		self.assertEqual(len(test['expected_loans_afterwards']), len(resp['loans_afterwards']))

		# Sort by increasing amount of loan balance owed to keep things in
		# order with the test.
		resp['loans_afterwards'].sort(key=lambda l: l['loan_balance']['amount'])

		for i in range(len(resp['loans_afterwards'])):
			loan_after = resp['loans_afterwards'][i]
			expected_loan_after = test['expected_loans_afterwards'][i]
			expected = expected_loan_after
			actual = cast(Dict, loan_after)
			self.assertEqual(loan_ids[i], actual['loan_id']) # assert same loan order, but use loan_ids because the loans get created in the test
			test_helper.assertDeepAlmostEqual(self, expected['transaction'], actual['transaction'])
			test_helper.assertDeepAlmostEqual(self, expected['loan_balance'], actual['loan_balance'])

		# Assert on which loans ended up in the past due but not selected
		# category
		self.assertEqual(len(test['expected_past_due_but_not_selected_indices']), len(resp['loans_past_due_but_not_selected']))
		resp['loans_past_due_but_not_selected'].sort(key = lambda l: l['loan_balance']['amount'])

		for i in range(len(resp['loans_past_due_but_not_selected'])):
			cur_loan_id_past_due = resp['loans_past_due_but_not_selected'][i]['loan_id']
			expected_loan_id_past_due = loan_ids_not_selected[test['expected_past_due_but_not_selected_indices'][i]]
			self.assertEqual(expected_loan_id_past_due, cur_loan_id_past_due)


	def test_custom_amount_single_loan_only_principal_credit_remaining(self) -> None:
		test: Dict = {
			'comment': 'The user pays a single loan for a custom amount, and there is credit remaining on their balance',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(20.02),
					adjusted_maturity_date=date_util.load_date_str('9/1/2020'),
					outstanding_principal_balance=decimal.Decimal(9.99)
				)
			],
			'payment_date': '10/12/2020',
			'settlement_date': '10/14/2020',
			'payment_option': 'custom_amount',
			'payment_input_amount': 10.01,
			'expected_amount_to_pay': 10.01,
			'expected_amount_as_credit_to_user': 0.02,
			'expected_loans_afterwards': [
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=10.01,
						to_principal=10.01,
						to_interest=0.0,
						to_fees=0.0
					),
					loan_balance=LoanBalanceDict(
						amount=20.02,
						outstanding_principal_balance=-0.02,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
			],
			'expected_past_due_but_not_selected_indices': []
		}

		self._run_test(test)

	def test_custom_amount_multiple_loans_credit_remaining(self) -> None:
		credit_amount = 15.01 - 9.99 - 1.03 - 1.88 - 0.73
		test: Dict = {
			'comment': 'The user pays off multiple loans and have a credit remaining on their principal',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(20.02),
					adjusted_maturity_date=date_util.load_date_str('9/1/2020'),
					outstanding_principal_balance=decimal.Decimal(9.99),
					outstanding_fees=decimal.Decimal(1.03)
				),
				models.Loan(
					amount=decimal.Decimal(30.02),
					adjusted_maturity_date=date_util.load_date_str('9/3/2020'),
					outstanding_principal_balance=decimal.Decimal(1.88),
					outstanding_interest=decimal.Decimal(0.73)
				)
			],
			'payment_date': '10/12/2020',
			'settlement_date': '10/14/2020',
			'payment_option': 'custom_amount',
			'payment_input_amount': 15.01,
			'expected_amount_to_pay': 15.01,
			'expected_amount_as_credit_to_user': credit_amount,
			'expected_loans_afterwards': [
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=9.99 + 1.03,
						to_principal=9.99,
						to_interest=0.0,
						to_fees=1.03
					),
					loan_balance=LoanBalanceDict(
						amount=20.02,
						outstanding_principal_balance=0.0,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=1.88 + 0.73 + credit_amount,
						to_principal=1.88 + credit_amount,
						to_interest=0.73,
						to_fees=0.0
					),
					loan_balance=LoanBalanceDict(
						amount=30.02,
						outstanding_principal_balance=-1 * credit_amount,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				)
			],
			'expected_past_due_but_not_selected_indices': []
		}

		self._run_test(test)

	def test_custom_amount_multiple_loans_cant_pay_off_everything(self) -> None:
		test: Dict = {
			'comment': 'The user pays exactly what they specified',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(10.01),
					adjusted_maturity_date=date_util.load_date_str('3/1/2020'),
					outstanding_principal_balance=decimal.Decimal(9.99),
					outstanding_interest=decimal.Decimal(1.02),
					outstanding_fees=decimal.Decimal(0.56)
				),
				models.Loan(
					amount=decimal.Decimal(30.03),
					adjusted_maturity_date=date_util.load_date_str('2/1/2020'),
					outstanding_principal_balance=decimal.Decimal(8.99),
					outstanding_interest=decimal.Decimal(1.01),
					outstanding_fees=decimal.Decimal(0.55)
				),
				models.Loan(
					amount=decimal.Decimal(50.05),
					adjusted_maturity_date=date_util.load_date_str('1/1/2020'),
					outstanding_principal_balance=decimal.Decimal(7.99),
					outstanding_interest=decimal.Decimal(1.03),
					outstanding_fees=decimal.Decimal(0.51)
				)
			],
			'payment_date': '10/12/2020',
			'settlement_date': '10/14/2020',
			'payment_option': 'custom_amount',
			'payment_input_amount': 15.05,
			'expected_amount_to_pay': 15.05,
			'expected_amount_reduced': 0.0,
			'expected_loans_afterwards': [
				# We don't have enough money to pay off the newest maturing loan
				#
				# The payment looks like:
				#   0.51 + 1.03 + 7.99 = 9.53 to the loan maturing 1/1/2020
				#   0.55 + 1.01 + (rem) = to the loan maturing 2/1/2020
				#    where "rem" is the remaining amount of the 15.05 we can pay
				#    so 3.96 gets paid to principal on the 2/1/2020 loan
				#
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=0.0,
						to_principal=0.0,
						to_interest=0.0,
						to_fees=0.0
					),
					loan_balance=LoanBalanceDict(
						amount=10.01,
						outstanding_principal_balance=9.99,
						outstanding_interest=1.02,
						outstanding_fees=0.56
					)
				),
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=3.96 + 1.01 + 0.55,
						to_principal=3.96,
						to_interest=1.01,
						to_fees=0.55
					),
					loan_balance=LoanBalanceDict(
						amount=30.03,
						outstanding_principal_balance=8.99 - 3.96,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
				LoanAfterwardsDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=9.53,
						to_principal=7.99,
						to_interest=1.03,
						to_fees=0.51
					),
					loan_balance=LoanBalanceDict(
						amount=50.05,
						outstanding_principal_balance=0.0,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				)
			],
			'expected_past_due_but_not_selected_indices': []
		}

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
						amount=decimal.Decimal(30.02),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
						outstanding_principal_balance=decimal.Decimal(10.1)
					) # this loan doesnt need to get paid yet
				],
				'payment_date': '10/12/2020',
				'settlement_date': '10/20/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,

				'expected_amount_to_pay': 20.02 + 10.0 + 2.4,
				'expected_loans_afterwards': [
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.02 + 10.0 + 2.4,
							to_principal=20.02,
							to_interest=10.0,
							to_fees=2.4
						),
						loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=0.0,
							to_principal=0.0,
							to_interest=0.0,
							to_fees=0.0
						),
						loan_balance=LoanBalanceDict(
							amount=30.02,
							outstanding_principal_balance=10.1,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': []
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
						amount=decimal.Decimal(30.02),
						adjusted_maturity_date=date_util.load_date_str('10/2/2020'),
						outstanding_principal_balance=decimal.Decimal(8.0)
					)
				],
				'payment_date': '10/12/2020',
				'settlement_date': '10/14/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,

				'expected_amount_to_pay': 20.02 + 10.0 + 2.4 + 8.0,
				'expected_loans_afterwards': [
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.02 + 10.0 + 2.4,
							to_principal=20.02,
							to_interest=10.0,
							to_fees=2.4
						),
						loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=8.0,
							to_principal=8.0,
							to_interest=0.0,
							to_fees=0.0
						),
						loan_balance=LoanBalanceDict(
							amount=30.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': []
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
						outstanding_interest=decimal.Decimal(10.1),
						outstanding_fees=decimal.Decimal(2.4),
					),
					models.Loan(
						amount=decimal.Decimal(30.02),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
						outstanding_principal_balance=decimal.Decimal(8.1)
					)
				],
				'payment_date': '10/12/2020',
				'settlement_date': '10/14/2020',
				'payment_option': 'pay_in_full',
				'payment_input_amount': None,

				'expected_amount_to_pay': 20.02 + 10.1 + 2.4 + 8.1,
				'expected_loans_afterwards': [
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.02 + 10.1 + 2.4,
							to_principal=20.02,
							to_interest=10.1,
							to_fees=2.4
						),
						loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=8.1,
							to_principal=8.1,
							to_interest=0.0,
							to_fees=0.0
						),
						loan_balance=LoanBalanceDict(
							amount=30.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': []
			}
		]

		for test in tests:
			self._run_test(test)

	def test_pay_in_full_but_has_loans_past_due_not_selected(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'The user owes everything regardless but did not include already maturing loans',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.02),
						adjusted_maturity_date=date_util.load_date_str('10/1/2020'),
						outstanding_principal_balance=decimal.Decimal(20.02),
						outstanding_interest=decimal.Decimal(10.1),
						outstanding_fees=decimal.Decimal(2.4),
					)
				],
				'loans_not_selected': [
					models.Loan(
						amount=decimal.Decimal(30.02),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020'),
						outstanding_principal_balance=decimal.Decimal(8.1)
					),
					models.Loan(
						amount=decimal.Decimal(50.02),
						adjusted_maturity_date=date_util.load_date_str('1/1/2020'),
						outstanding_principal_balance=decimal.Decimal(9.1)
					)
				],
				'payment_date': '10/12/2020',
				'settlement_date': '10/14/2020',
				'payment_option': 'pay_in_full',
				'payment_input_amount': None,

				'expected_amount_to_pay': 20.02 + 10.1 + 2.4,
				'expected_loans_afterwards': [
					LoanAfterwardsDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.02 + 10.1 + 2.4,
							to_principal=20.02,
							to_interest=10.1,
							to_fees=2.4
						),
						loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': [1]
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

		payment_date = '10/05/2019'
		user_id = seed.get_user_id('company_admin', index=0)
		payment_input_amount = test['payment_amount']
		payment_id, err = repayment_util.create_payment(
			company_id=company_id, 
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=payment_input_amount,
				method=test['payment_method'],
				payment_date=payment_date,
				settlement_date='unused'
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
			self.assertAlmostEqual(payment_input_amount, float(payment.amount))
			self.assertEqual(db_constants.PaymentType.REPAYMENT, payment.type)
			self.assertEqual(company_id, payment.company_id)
			self.assertEqual(test['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(user_id, payment.submitted_by_user_id)
			self.assertEqual(user_id, payment.requested_by_user_id)
			self.assertEqual(payment_date, date_util.date_to_str(payment.requested_payment_date))
			self.assertEqual(loan_ids, cast(Dict, payment.items_covered)['loan_ids'])

	def test_schedule_payment_reverse_draft_ach(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 30.1,
				'payment_method': 'reverse_draft_ach',
				'loan_amounts': [20.1, 30.1]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_notify_payment(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 40.1,
				'payment_method': 'ach',
				'loan_amounts': [30.1, 40.1]
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


class TestSettlePayment(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		loan_ids = []
		with session_scope(session_maker) as session:
			for i in range(len(test['loans'])):
				l = test['loans'][i]
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(l['amount']),
					outstanding_principal_balance=decimal.Decimal(l['outstanding_principal_balance']),
					outstanding_interest=decimal.Decimal(l['outstanding_interest']),
					outstanding_fees=decimal.Decimal(l['outstanding_fees']),
					approved_at=date_util.now(),
					funded_at=date_util.now()
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		user_id = seed.get_user_id('company_admin', index=0)

		# Make sure we have a payment already registered in the system that we are settling.
		payment_id, err = repayment_util.create_payment(
			company_id=company_id, 
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment']['amount'],
				method=test['payment']['payment_method'],
				payment_date='10/19/2020',
				settlement_date='unused'
		),
			loan_ids=loan_ids,
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIsNone(err)

		# Say the payment has already been applied if the test has this value set.
		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())
			if payment and test['payment'].get('settled_at'):
				payment.settled_at = test['payment']['settled_at']

			if payment and test['payment'].get('type'):
				payment.type = test['payment']['type']
		
		req = repayment_util.SettlePaymentReqDict(
			company_id=company_id,
			payment_id=payment_id,
			loan_ids=loan_ids,
			transaction_inputs=test['transaction_inputs'],
			payment_date=test['payment']['payment_date'],
			settlement_date=test['payment']['settlement_date']
		)

		bank_admin_user_id = seed.get_user_id('bank_admin', index=0)

		transaction_ids, err = repayment_util.settle_payment(
			req=req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker)
		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg)
			return
		else:
			self.assertIsNone(err)

		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())

			# Assertions on the payment
			self.assertAlmostEqual(test['payment']['amount'], float(payment.amount))
			self.assertEqual(db_constants.PaymentType.REPAYMENT, payment.type)
			self.assertEqual(company_id, payment.company_id)
			self.assertEqual(test['payment']['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(user_id, payment.submitted_by_user_id)
			self.assertEqual(test['payment']['payment_date'], date_util.date_to_str(payment.payment_date))
			self.assertEqual(test['payment']['settlement_date'], date_util.date_to_str(payment.settlement_date))
			self.assertIsNotNone(payment.settled_at)
			self.assertEqual(bank_admin_user_id, payment.settled_by_user_id)

			# Assertions on transactions
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).filter(
					models.Transaction.id.in_(transaction_ids)
				).all())

			self.assertEqual(len(transaction_ids), len(transactions))
			transactions = [t for t in transactions]
			transactions.sort(key=lambda t: t.amount, reverse=True) # Sort from largest to least

			for i in range(len(transactions)):
				tx = transactions[i]
				tx_input = test['transaction_inputs'][i]
				self.assertEqual(db_constants.PaymentType.REPAYMENT, tx.type)
				self.assertAlmostEqual(tx_input['amount'], float(tx.amount))
				self.assertAlmostEqual(tx_input['to_principal'], float(tx.to_principal))
				self.assertAlmostEqual(tx_input['to_fees'], float(tx.to_fees))
				self.assertEqual(loan_ids[i], str(tx.loan_id))
				self.assertEqual(payment_id, str(tx.payment_id))
				self.assertEqual(bank_admin_user_id, tx.created_by_user_id)
				self.assertEqual(test['payment']['settlement_date'], date_util.date_to_str(tx.effective_date))

			# Assert on loans
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			loan_id_to_loan = dict([(str(loan.id), loan) for loan in loans])
			for i in range(len(loan_ids)):
				cur_loan = loan_id_to_loan[loan_ids[i]]
				loan_after = test['loans_after_payment'][i]
				self.assertAlmostEqual(loan_after['amount'], float(cur_loan.amount))
				self.assertAlmostEqual(
					loan_after['outstanding_principal_balance'], float(cur_loan.outstanding_principal_balance))
				self.assertAlmostEqual(
					loan_after['outstanding_interest'], float(cur_loan.outstanding_interest))
				self.assertAlmostEqual(
					loan_after['outstanding_fees'], float(cur_loan.outstanding_fees))

	def test_settle_payment_success(self) -> None:
		tests: List[Dict] = [
			{
				'payment': {
					'amount': 60.06,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020'
				},
				'loans': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 40.4,
						'outstanding_interest': 30.03,
						'outstanding_fees': 20.01
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 30.01,
						'outstanding_interest': 20.02,
						'outstanding_fees': 10.03
					}
				],
				'transaction_inputs': [
					{
						'amount': 40.04,
						'to_principal': 30.02,
						'to_interest': 5.02,
						'to_fees': 5.00
					},
					{
						'amount': 20.02,
						'to_principal': 18.02,
						'to_interest': 1.65,
						'to_fees': 0.35
					}
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 40.4 - 30.02,
						'outstanding_interest': 30.03 - 5.02,
						'outstanding_fees': 20.01 - 5.00
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 30.01 - 18.02,
						'outstanding_interest': 20.02 - 1.65,
						'outstanding_fees': 10.03 - 0.35
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_failure_unequal_loans(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)
		user_id = seed.get_user_id('company_admin', index=0)

		req = repayment_util.SettlePaymentReqDict(
			company_id=company_id,
			payment_id=None,
			loan_ids=[str(uuid.uuid4())],
			transaction_inputs=None,
			payment_date=None,
			settlement_date=None
		)

		transaction_ids, err = repayment_util.settle_payment(
			req=req,
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIn('No loans', err.msg)

	def test_failure_unequal_transactions_and_loans(self) -> None:
		test: Dict = {
			'payment': {
				'amount': 60.06,
				'payment_method': 'unused',
				'payment_date': 'unused',
				'settlement_date': 'unused'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01,
					'outstanding_interest': 20.02,
					'outstanding_fees': 10.03
				}
			],
			'transaction_inputs': [
				{
					'amount': 40.04,
					'to_principal': 30.02,
					'to_interest': 5.02,
					'to_fees': 5.00
				}
			],
			'in_err_msg': 'Unequal amount of transaction'
		}
		self._run_test(test)

	def test_failure_already_applied_payment(self) -> None:
		test: Dict = {
			'payment': {
				'amount': 60.06,
				'payment_method': 'unused',
				'settled_at': date_util.today_as_date(),
				'payment_date': 'unused',
				'settlement_date': 'unused'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01,
					'outstanding_interest': 20.02,
					'outstanding_fees': 10.03
				}
			],
			'transaction_inputs': [{}, {}],
			'in_err_msg': 'already been settled'
		}
		self._run_test(test)

	def test_failure_non_repayment_payment_provided(self) -> None:
		test: Dict = {
			'payment': {
				'amount': 60.06,
				'payment_method': 'unused',
				'type': db_constants.PaymentType.ADVANCE,
				'payment_date': 'unused',
				'settlement_date': 'unused'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01,
					'outstanding_interest': 20.02,
					'outstanding_fees': 10.03
				}
			],
			'transaction_inputs': [{}, {}],
			'in_err_msg': 'only apply repayments'
		}
		self._run_test(test)

	def test_failure_transactions_dont_balance_with_payment(self) -> None:
		err_amount = 0.01
		test: Dict = {
			'payment': {
				'amount': 60.06,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01,
					'outstanding_interest': 20.02,
					'outstanding_fees': 10.03
				}
			],
			'transaction_inputs': [
				{
					'amount': 40.04,
					'to_principal': 30.02,
					'to_interest': 5.02,
					'to_fees': 5.00
				},
				{
					'amount': 20.02,
					'to_principal': 18.02,
					'to_interest': 1.65,
					'to_fees': 0.35  + err_amount
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4 - 30.02,
					'outstanding_interest': 30.03 - 5.02,
					'outstanding_fees': 20.01 - 5.00
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01 - 18.02,
					'outstanding_interest': 20.02 - 1.65,
					'outstanding_fees': 10.03 - 0.35
				}
			],
			'in_err_msg': 'does not balance'
		}
		self._run_test(test)

	def test_failure_transaction_does_not_balance_with_itself(self) -> None:
		err_amount = 0.01
		test: Dict = {
			'payment': {
				'amount': 60.06,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01,
					'outstanding_interest': 20.02,
					'outstanding_fees': 10.03
				}
			],
			'transaction_inputs': [
				{
					'amount': 40.04,
					'to_principal': 30.02,
					'to_interest': 5.02,
					'to_fees': 5.00 - err_amount
				},
				{
					'amount': 20.02,
					'to_principal': 18.02,
					'to_interest': 1.65,
					'to_fees': 0.35 + err_amount
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4 - 30.02,
					'outstanding_interest': 30.03 - 5.02,
					'outstanding_fees': 20.01 - 5.00
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 30.01 - 18.02,
					'outstanding_interest': 20.02 - 1.65,
					'outstanding_fees': 10.03 - 0.35
				}
			],
			'in_err_msg': 'Transaction at index 0 does not balance'
		}
		self._run_test(test)
