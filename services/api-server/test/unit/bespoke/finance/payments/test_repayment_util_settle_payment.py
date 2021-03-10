import datetime
import decimal
import json
import uuid
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import PaymentStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util, repayment_util
from bespoke.finance.payments.repayment_util import (LoanBalanceDict,
                                                     LoanToShowDict,
                                                     TransactionInputDict)
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

def _get_contract(company_id: str) -> models.Contract:
	return models.Contract(
		company_id=company_id,
		product_type=ProductType.LINE_OF_CREDIT,
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.LINE_OF_CREDIT,
			input_dict=ContractInputDict(
				interest_rate=0.2,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=0, # unused
				late_fee_structure=_get_late_fee_structure(),
			)
		),
		start_date=date_util.load_date_str('1/1/2020'),
		adjusted_end_date=date_util.load_date_str('12/1/2020')
	)

def _apply_transaction(tx: Dict, session: Any, loan: models.Loan) -> None:
	if tx['type'] == 'advance':
		payment_test_helper.make_advance(session, loan, tx['amount'], tx['effective_date'])
	elif tx['type'] == 'repayment':
		payment_test_helper.make_repayment(
			session, loan,
			to_principal=tx['to_principal'],
			to_interest=tx['to_interest'],
			to_fees=tx['to_fees'],
			effective_date=tx['effective_date']
		)
	else:
		raise Exception('Unexpected transaction type {}'.format(tx['type']))

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
		payment_id, err = repayment_util.create_repayment(
			company_id=company_id,
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment']['amount'],
				method=test['payment']['payment_method'],
				payment_date='10/19/2020',
				settlement_date='unused',
				items_covered=test['payment']['items_covered'] if 'items_covered' in test['payment'] else {},
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
			amount=test['payment']['amount'],
			payment_date=test['payment']['payment_date'],
			settlement_date=test['payment']['settlement_date'],
			loan_ids=loan_ids,
			transaction_inputs=test['transaction_inputs'],
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
				self.assertEqual(loan_after['payment_status'], cur_loan.payment_status)
				if cur_loan.payment_status == PaymentStatusEnum.CLOSED:
					self.assertIsNotNone(cur_loan.closed_at) # flag indicating we are closed
				else:
					self.assertIsNone(cur_loan.closed_at) # we are not closed yet

	def test_settle_payment_partially_paid(self) -> None:
		tests: List[Dict] = [
			{
				'payment': {
					'amount': 60.06,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
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
						'outstanding_fees': 20.01 - 5.00,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 30.01 - 18.02,
						'outstanding_interest': 20.02 - 1.65,
						'outstanding_fees': 10.03 - 0.35,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_settle_payment_partially_paid_and_closed_and_negative_balance(self) -> None:
		tests: List[Dict] = [
			{
				'payment': {
					'amount': (80.0 + 60.0 + 30.0) + 10.0, # 10.0 is the overpayment
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020'
				},
				'loans': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 40.0,
						'outstanding_interest': 30.0,
						'outstanding_fees': 20.0
					}, # Partially paid
					{
						'amount': 40.0,
						'outstanding_principal_balance': 30.0,
						'outstanding_interest': 20.0,
						'outstanding_fees': 10.0
					}, # Paid and closed
					{
						'amount': 30.0,
						'outstanding_principal_balance': 20.0,
						'outstanding_interest': 10.0,
						'outstanding_fees': 0.0
					} # Overpaid with negative balance
				],
				'transaction_inputs': [
					{
						'amount': 80.0,
						'to_principal': 30.0,
						'to_interest': 30.0,
						'to_fees': 20.0
					},
					{
						'amount': 60.0,
						'to_principal': 30.0,
						'to_interest': 20.0,
						'to_fees': 10.0
					},
					{
						'amount': 40.0,
						'to_principal': 30.0,
						'to_interest': 10.0,
						'to_fees': 0.0
					}
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 10.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 0.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
					{
						'amount': 30.0,
						'outstanding_principal_balance': -10.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_failure_transactions_overpay_on_interest_and_fees_get_stored_on_principal(self) -> None:

		test: Dict = {
			'payment': {
				'amount': (40.4 + 40.03 + 25.01) + (50.00 + 25.02 + 11.03),
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
					'amount': 40.4 + 40.03 + 25.01,
					'to_principal': 40.4,
					'to_interest': 40.03, # $10 overpayment on interest
					'to_fees': 25.01 # $5 overpayment on fees
				},
				{
					'amount': 50.00 + 25.02 + 11.03,
					'to_principal': 50.0, # $10 overpayment on principal
					'to_interest': 25.02, # $5 overpayment on interest
					'to_fees': 11.03 # $1 overpayment on fees
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': -15, # from $15 overpayment
					'outstanding_interest': 0,
					'outstanding_fees': 0
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': -16,
					'outstanding_interest': 0,
					'outstanding_fees': 0
				}
			],
			'in_err_msg': 'Interest on a loan may not be negative'
		}
		self._run_test(test)

	def test_settle_payment_zero_principal_with_interest_and_fees_not_zero(self) -> None:
		"""
		Tests that it is valid to apply a transaction on a loan that
		results in a principal of zero and non-zero interest and fees.
		"""
		test: Dict = {
			'payment': {
				'amount': 40.4 + 20.03 + 10,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20
				}
			],
			'transaction_inputs': [
				{
					'amount': 40.4 + 20.03 + 10,
					'to_principal': 40.4,
					'to_interest': 20.03, # $10 underpayment on interest
					'to_fees': 10 # $10 underpayment on fees
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 0,
					'outstanding_interest': 10, # from $10 underpayment
					'outstanding_fees': 10, # from $10 underpayment
					'payment_status': PaymentStatusEnum.PARTIALLY_PAID
				}
			],
		}
		self._run_test(test)

	def test_failure_transactions_overpay_on_principal_when_interest_not_zero(self) -> None:
		"""
		Tests that it is invalid to apply a transaction on a loan
		that results in a negative principal and non-zero interest.
		"""
		test: Dict = {
			'payment': {
				'amount': 50.4 + 20.03 + 20,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20
				}
			],
			'transaction_inputs': [
				{
					'amount': 50.4 + 20.03 + 20,
					'to_principal': 50.4, # $10 overpayment on principal
					'to_interest': 20.03, # $10 underpayment on interest
					'to_fees': 20
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': -10, # from $10 overpayment
					'outstanding_interest': 10, # from $10 underpayment
					'outstanding_fees': 0
				}
			],
			'in_err_msg': 'Principal on a loan may not be negative if interest or fees are not zero'
		}
		self._run_test(test)

	def test_failure_transactions_overpay_on_principal_when_fees_not_zero(self) -> None:
		"""
		Tests that it is invalid to apply a transaction on a loan
		that results in a negative principal and non-zero fees.
		"""
		test: Dict = {
			'payment': {
				'amount': 50.4 + 30 + 10,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'loans': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30,
					'outstanding_fees': 20
				}
			],
			'transaction_inputs': [
				{
					'amount': 50.4 + 30 + 10,
					'to_principal': 50.4, # $10 overpayment on principal
					'to_interest': 30,
					'to_fees': 10 # $10 underpayment on fees
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': -10, # from $10 overpayment
					'outstanding_interest': 0,
					'outstanding_fees': 10 # from $10 underpayment
				}
			],
			'in_err_msg': 'Principal on a loan may not be negative if interest or fees are not zero'
		}
		self._run_test(test)

	def test_failure_unequal_loans(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)
		user_id = seed.get_user_id('company_admin', index=0)

		req = repayment_util.SettlePaymentReqDict(
			company_id=company_id,
			payment_id=None,
			amount=0.0,
			payment_date=None,
			settlement_date=None,
			loan_ids=[str(uuid.uuid4())],
			transaction_inputs=None,
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

class TestSettleRepaymentLineOfCredit(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		loan_ids = []

		bank_admin_user_id = seed.get_user_id('bank_admin', index=0)

		loans = []

		with session_scope(session_maker) as session:
			contract = _get_contract(company_id)
			session.add(contract)

			for i in range(len(test['loans'])):
				l = test['loans'][i]
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(l['amount']),
					origination_date=date_util.load_date_str(l['origination_date']),
					maturity_date=date_util.load_date_str('10/21/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/21/2020'),
					outstanding_principal_balance=decimal.Decimal(l['outstanding_principal_balance']),
					outstanding_interest=decimal.Decimal(l['outstanding_interest']),
					outstanding_fees=decimal.Decimal(l['outstanding_fees']),
					approved_at=date_util.now(),
					funded_at=date_util.now(),
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))
				loans.append(loan)

			for i in range(len(test['transaction_lists'])):
				transaction_list = test['transaction_lists'][i]
				loan = loans[i]
				for tx in transaction_list:
					_apply_transaction(tx, session, loan)

		user_id = seed.get_user_id('company_admin', index=0)

		# Make sure we have a payment already registered in the system that we are settling.
		payment_id, err = repayment_util.create_repayment_line_of_credit(
			company_id=company_id,
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment']['amount'],
				method=test['payment']['payment_method'],
				payment_date='10/19/2020',
				settlement_date='unused',
				items_covered=test['payment']['items_covered'] if 'items_covered' in test['payment'] else {},
			),
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

		req = repayment_util.SettlePaymentLineOfCreditReqDict(
			company_id=company_id,
			payment_id=payment_id,
			amount=test['payment']['amount'],
			payment_date=test['payment']['payment_date'],
			settlement_date=test['payment']['settlement_date'],
			items_covered=test['payment']['items_covered'],
		)

		transaction_ids, err = repayment_util.settle_payment_line_of_credit(
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
			self.assertEqual(len(test['expected_transactions']), len(transactions))

			transactions.sort(key=lambda t: t.amount) # sort in increasing amounts to match order of transactions array

			for i in range(len(transactions)):
				tx = transactions[i]
				tx_input = test['expected_transactions'][i]
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
				self.assertEqual(loan_after['payment_status'], cur_loan.payment_status)
				if cur_loan.payment_status == PaymentStatusEnum.CLOSED:
					self.assertIsNotNone(cur_loan.closed_at) # flag indicating we are closed
				else:
					self.assertIsNone(cur_loan.closed_at) # we are not closed yet

	def test_settle_payment_line_of_credit_single_loan(self) -> None:
		tests: List[Dict] = [
			{
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'effective_date': '10/10/2020'}],
				],
				'payment': {
					'amount': 50.0 + 0.4,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': { 'to_principal': 50.0, 'to_interest': 0.4 },
				},
				'loans': [
					{
						'origination_date': '10/10/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0,
					},
				],
				'expected_transactions': [
					{
						'amount': 50.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
						'to_fees': 0.0
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.4 - 0.4,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_settle_payment_line_of_credit_multiple_loans(self) -> None:
		tests: List[Dict] = [
			{
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'effective_date': '10/10/2020'}],
					[{'type': 'advance', 'amount': 100.0, 'effective_date': '10/11/2020'}],
				],
				'payment': {
					'amount': 50.0 + 0.4 + 100 + 0.8,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': { 'to_principal': 50.0 + 100.0, 'to_interest': 0.4 + 0.8 },
				},
				'loans': [
					{
						'origination_date': '10/10/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0
					},
					{
						'origination_date': '10/11/2020',
						'amount': 100.0,
						'outstanding_principal_balance': 100.0,
						'outstanding_interest': 0.6,
						'outstanding_fees': 0.0
					},
				],
				'expected_transactions': [
					{
						'amount': 50.0 + 0.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
						'to_fees': 0.0
					},
					{
						'amount': 100.0 + 0.6,
						'to_principal': 100.0,
						'to_interest': 0.6,
						'to_fees': 0.0
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.4 - 0.4,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
					{
						'amount': 100.0,
						'outstanding_principal_balance': 100.0 - 100.0,
						'outstanding_interest': 0.6 - 0.6,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)
