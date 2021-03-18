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

INTEREST_RATE = 0.002 # 0.2%

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

def _get_contract(company_id: str, is_line_of_credit: bool) -> models.Contract:
	if is_line_of_credit:
		return models.Contract(
			company_id=company_id,
			product_type=ProductType.LINE_OF_CREDIT,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.LINE_OF_CREDIT,
				input_dict=ContractInputDict(
					interest_rate=INTEREST_RATE,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=0, # unused
					late_fee_structure=_get_late_fee_structure(),
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
	else:
		return models.Contract(
			company_id=company_id,
			product_type=ProductType.INVENTORY_FINANCING,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.INVENTORY_FINANCING,
				input_dict=ContractInputDict(
					interest_rate=INTEREST_RATE,
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
		payment_test_helper.make_advance(session, loan, tx['amount'], tx['payment_date'], tx['effective_date'])
	elif tx['type'] == 'repayment':
		payment_test_helper.make_repayment(
			session, loan,
			to_principal=tx['to_principal'],
			to_interest=tx['to_interest'],
			to_fees=tx['to_fees'],
			payment_date=tx['payment_date'],
			effective_date=tx['effective_date']
		)
	else:
		raise Exception('Unexpected transaction type {}'.format(tx['type']))

def _run_test(self: db_unittest.TestCase, test: Dict) -> None:
	self.reset()
	session_maker = self.session_maker
	seed = test_helper.BasicSeed.create(self.session_maker, self)
	seed.initialize()

	loan_ids = []
	loans = []
	company_id = seed.get_company_id('company_admin', index=0)
	is_line_of_credit = test['is_line_of_credit']

	with session_scope(session_maker) as session:
		contract = _get_contract(company_id, is_line_of_credit=is_line_of_credit)
		session.add(contract)

		for i in range(len(test['loans'])):
			l = test['loans'][i]
			loan = models.Loan(
				company_id=company_id,
				amount=decimal.Decimal(l['amount']),
				origination_date=date_util.load_date_str(l['origination_date']),
				maturity_date=date_util.load_date_str(l['maturity_date']),
				adjusted_maturity_date=date_util.load_date_str(l['maturity_date']),
				outstanding_principal_balance=decimal.Decimal(l['outstanding_principal_balance']),
				outstanding_interest=decimal.Decimal(l['outstanding_interest']),
				outstanding_fees=decimal.Decimal(l['outstanding_fees']),
				approved_at=date_util.now(),
				funded_at=date_util.now()
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
	payment_id, err = repayment_util.create_repayment(
		company_id=company_id,
		payment_insert_input=payment_util.PaymentInsertInputDict(
			company_id='unused',
			type='unused',
			method=test['payment']['payment_method'],
			requested_amount=test['payment']['amount'],
			amount=None,
			requested_payment_date='10/10/2020',
			payment_date=None,
			settlement_date='10/10/2020', # unused
			items_covered={ 'loan_ids': loan_ids },
		),
		user_id=user_id,
		session_maker=self.session_maker,
		is_line_of_credit=False)
	self.assertIsNone(err)

	# Say the payment has already been applied if the test has this value set.
	with session_scope(session_maker) as session:
		payment = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.id == payment_id
			).first())
		# TODO(warrenshen): actually do the "schedule payment" flow to set the payment date.
		payment.payment_date = date_util.load_date_str(test['payment']['payment_date'])
		if payment and test['payment'].get('settled_at'):
			payment.settled_at = test['payment']['settled_at']

		if payment and test['payment'].get('type'):
			payment.type = test['payment']['type']

	settlement_payment = test['settlement_payment'] if 'settlement_payment' in test else test['payment']

	if is_line_of_credit:
		items_covered = settlement_payment['items_covered'] if 'items_covered' in settlement_payment else {}
	else:
		items_covered = { 'loan_ids': loan_ids }

	req = repayment_util.SettleRepaymentReqDict(
		company_id=company_id,
		payment_id=payment_id,
		amount=settlement_payment['amount'],
		deposit_date=settlement_payment['payment_date'],
		settlement_date=settlement_payment['settlement_date'],
		items_covered=items_covered,
		transaction_inputs=test['transaction_inputs'],
		amount_as_credit_to_user=test['amount_as_credit_to_user']
	)

	bank_admin_user_id = seed.get_user_id('bank_admin', index=0)

	transaction_ids, err = repayment_util.settle_repayment(
		req=req,
		user_id=bank_admin_user_id,
		session_maker=self.session_maker,
		is_line_of_credit=is_line_of_credit,
	)
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
			tx_input = test['expected_transactions'][i]

			self.assertEqual(tx_input['type'], tx.type)
			self.assertAlmostEqual(tx_input['amount'], float(tx.amount))
			self.assertAlmostEqual(tx_input['to_principal'], float(tx.to_principal))
			self.assertAlmostEqual(tx_input['to_fees'], float(tx.to_fees))

			loan_id_index = tx_input['loan_id_index']
			if loan_id_index is None:
				self.assertIsNone(tx.loan_id)
			else:
				self.assertEqual(loan_ids[loan_id_index], str(tx.loan_id))

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

class TestSettlePayment(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		test['is_line_of_credit'] = False
		_run_test(self, test)

	def test_settle_payment_partially_paid(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'amount': 50.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.3,
						'outstanding_fees': 0.0,
					},
					{
						'amount': 40.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 40.0,
						'outstanding_interest': 0.24,
						'outstanding_fees': 0.0,
					}
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[
						{
							'type': 'advance',
							'amount': 50.0,
							'payment_date': '10/10/2020',
							'effective_date': '10/10/2020'
						}
					],
					[
						{
							'type': 'advance',
							'amount': 40.0,
							'payment_date': '10/10/2020',
							'effective_date': '10/10/2020'
						}
					]
				],
				'payment': {
					'amount': 40.0 + 0.3 + 20.0 + 0.24,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
				},
				'amount_as_credit_to_user': 0.0,
				'transaction_inputs': [
					{
						'amount': 40.0 + 0.3,
						'to_principal': 40.0,
						'to_interest': 0.3,
						'to_fees': 0.0,
					},
					{
						'amount': 20.0 + 0.24,
						'to_principal': 20.0,
						'to_interest': 0.24,
						'to_fees': 0.0,
					}
				],
				'expected_transactions': [
					{
						'type': db_constants.PaymentType.REPAYMENT,
						'amount': 40.0 + 0.3,
						'to_principal': 40.0,
						'to_interest': 0.3,
						'to_fees': 0.0,
						'loan_id_index': 0,
					},
					{
						'type': db_constants.PaymentType.REPAYMENT,
						'amount': 20.0 + 0.24,
						'to_principal': 20.0,
						'to_interest': 0.24,
						'to_fees': 0.0,
						'loan_id_index': 1
					}
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 40.0,
						'outstanding_interest': 0.3 - 0.3,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 40.0 - 20.0,
						'outstanding_interest': 0.24 - 0.24,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_settle_payment_fully_paid_and_closed_and_overpayment(self) -> None:
		"""
		Tests that an overpayment results in a credit (in the form of a transaction with nothing attached to it)
		"""
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.3,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					}
				]
			],
			'payment': {
				'amount': 55.0 + 0.3 + 0.0,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'transaction_inputs': [
				{
					'amount': 50.0 + 0.3 + 0.0,
					'to_principal': 50.0,
					'to_interest': 0.3,
					'to_fees': 0.0,
				}
			],
			'amount_as_credit_to_user': 5.0,
			'expected_transactions': [
				# Sort order is from largest to smallest
				{
					'amount': 50.0 + 0.3 + 0.0,
					'to_principal': 50.0, # $5 overpayment on principal
					'to_interest': 0.3,
					'to_fees': 0.0,
					'type': db_constants.PaymentType.REPAYMENT,
					'loan_id_index': 0
				},
				{
					'amount': 5.0,
					'to_principal': 0.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
					'type': db_constants.TransactionType.CREDIT_TO_USER,
					'loan_id_index': None
				},
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 0.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
					'payment_status': PaymentStatusEnum.CLOSED,
				}
			],
		}
		self._run_test(test)

	def test_settle_payment_partially_paid_and_closed_and_overpayment(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'amount': 50.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.3,
						'outstanding_fees': 0.0,
					}, # Partially paid
					{
						'amount': 40.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 40.0,
						'outstanding_interest': 0.24,
						'outstanding_fees': 0.0,
					}, # Paid and closed
					{
						'amount': 30.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 30.0,
						'outstanding_interest': 0.18,
						'outstanding_fees': 0.0,
					}, # Overpaid with negative balance
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[
						{
							'type': 'advance',
							'amount': 50.0,
							'payment_date': '10/10/2020',
							'effective_date': '10/10/2020'
						},
					],
					[
						{
							'type': 'advance',
							'amount': 40.0,
							'payment_date': '10/10/2020',
							'effective_date': '10/10/2020'
						},
					],
					[
						{
							'type': 'advance',
							'amount': 30.0,
							'payment_date': '10/10/2020',
							'effective_date': '10/10/2020'
						},
					],
				],
				'amount_as_credit_to_user': 5.0,
				'payment': {
					'amount': 45.0 + 40.0 + 0.24 + 30.0 + 0.18 + 5.0, # 5.0 is the overpayment
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020'
				},
				'transaction_inputs': [
					{
						'amount': 45.0,
						'to_principal': 45.0,
						'to_interest': 0.0,
						'to_fees': 0.0
					},
					{
						'amount': 40.0 + 0.24,
						'to_principal': 40.0,
						'to_interest': 0.24,
						'to_fees': 0.0
					},
					{
						'amount': 30.0 + 0.18,
						'to_principal': 30.0,
						'to_interest': 0.18,
						'to_fees': 0.0
					},
				],
				'expected_transactions': [
					{
						'amount': 45.0,
						'to_principal': 45.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					},
					{
						'amount': 40.0 + 0.24,
						'to_principal': 40.0,
						'to_interest': 0.24,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 1
					},
					{
						'amount': 30.0 + 0.18,
						'to_principal': 30.0,
						'to_interest': 0.18,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 2
					},
					{
						'amount': 5.0,
						'to_principal': 0.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.TransactionType.CREDIT_TO_USER,
						'loan_id_index': None
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 45.0,
						'outstanding_interest': 0.3 - 0.0,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 40.0 - 40.0,
						'outstanding_interest': 0.24 - 0.24,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
					{
						'amount': 30.0,
						'outstanding_principal_balance': 0.0,
						'outstanding_interest': 0.18 - 0.18,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_failure_overpayment_the_wrong_way_using_principal_overpayment(self) -> None:
		"""
		Tests that an overpayment on the principal gets rejected
		"""
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.3,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					}
				]
			],
			'payment': {
				'amount': 55.0 + 0.3 + 0.0,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'transaction_inputs': [
				{
					'amount': 55.0 + 0.3 + 0.0,
					'to_principal': 55.0,
					'to_interest': 0.3,
					'to_fees': 0.0,
				}
			],
			'amount_as_credit_to_user': 0.0,
			'expected_transactions': [
				# Sort order is from largest to smallest
				{
					'amount': 50.0 + 0.3 + 0.0,
					'to_principal': 50.0, # $5 overpayment on principal
					'to_interest': 0.3,
					'to_fees': 0.0,
					'type': db_constants.PaymentType.REPAYMENT,
					'loan_id_index': 0
				},
				{
					'amount': 5.0,
					'to_principal': 0.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
					'type': db_constants.TransactionType.CREDIT_TO_USER,
					'loan_id_index': None
				},
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 0.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
					'payment_status': PaymentStatusEnum.CLOSED,
				}
			],
			'in_err_msg': 'Principal on a loan may not be negative'
		}
		self._run_test(test)

	def test_failure_transactions_overpay_on_interest_and_fees_get_stored_on_principal(self) -> None:

		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
				},
				{
					'amount': 40.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
				[
					{
						'type': 'advance',
						'amount': 40.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'payment': {
				'amount': (50.0 + 0.3 + 10.0 + 5.0) + (40.0 + 0.0 + 5.0 + 1.0),
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'amount_as_credit_to_user': 0.0,
			'transaction_inputs': [
				{
					'amount': 50.0 + 0.3 + 10.0 + 5.0,
					'to_principal': 50.0,
					'to_interest': 0.3 + 10.0, # $10 overpayment on interest
					'to_fees': 5.0, # $5 overpayment on fees
				},
				{
					'amount': 40.0 + 0.0 + 5.0 + 1.0,
					'to_principal': 40.0, # $10 overpayment on principal
					'to_interest': 0.0 + 5.0, # $5 overpayment on interest
					'to_fees': 1.0, # $1 overpayment on fees
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 50.0 - 50.0, # from $15 overpayment
					'outstanding_interest': 0.3 - (0.3 + 10.0),
					'outstanding_fees': 0.0 - 5.0,
				},
				{
					'amount': 40.0,
					'outstanding_principal_balance': 40.0 - 40.0,
					'outstanding_interest': 0.0 - (0.0 + 5.0),
					'outstanding_fees': 0.0 - 1.0,
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
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.3,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'payment': {
				'amount': 50.0 + 0.0 + 0.0,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'amount_as_credit_to_user': 0.0,
			'transaction_inputs': [
				{
					'amount': 50.0 + 0.0 + 0.0,
					'to_principal': 50.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				}
			],
			'expected_transactions': [
				{
					'amount': 50.0 + 0.0 + 0.0,
					'to_principal': 50.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
					'type': db_constants.PaymentType.REPAYMENT,
					'loan_id_index': 0
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 0.0,
					'outstanding_interest': 0.3,
					'outstanding_fees': 0.0,
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
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.3,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 50.0 + 10.0 + 0.0 + 0.0,
				'payment_method': 'ach',
				'payment_date': '10/10/2020',
				'settlement_date': '10/12/2020'
			},
			'transaction_inputs': [
				{
					'amount': 50.0 + 10.0 + 0.0 + 0.0,
					'to_principal': 50.0 + 10.0, # $10 overpayment on principal
					'to_interest': 0.0, # underpayment on interest
					'to_fees': 0.0,
				}
			],
			'loans_after_payment': [
				{
					'amount': 50.0,
					'outstanding_principal_balance': 50.0 - (50.0 + 10.0), # from $10 overpayment
					'outstanding_interest': 0.3 - 0.0, # from $10 underpayment
					'outstanding_fees': 0.0 - 0.0,
				}
			],
			'in_err_msg': 'Principal on a loan may not be negative'
		}
		self._run_test(test)

	def test_failure_unequal_loans(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)
		user_id = seed.get_user_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			contract = _get_contract(company_id, is_line_of_credit=False)
			session.add(contract)

		req = repayment_util.SettleRepaymentReqDict(
			company_id=company_id,
			payment_id=None,
			amount=50.0 + 0.0 + 0.0,
			deposit_date='10/10/20',
			settlement_date='10/10/20',
			items_covered={ 'loan_ids': [str(uuid.uuid4())] },
			transaction_inputs=[
				{
					'amount': 50.0 + 0.0 + 0.0,
					'to_principal': 50.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				},
			],
			amount_as_credit_to_user=0.0
		)

		transaction_ids, err = repayment_util.settle_repayment(
			req=req,
			user_id=user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False,
		)
		self.assertIn('No loans', err.msg)

	def test_failure_unequal_transactions_and_loans(self) -> None:
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
				},
				{
					'amount': 40.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.0,
					'outstanding_interest': 0.0,
					'outstanding_fees': 0.0,
				}
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
				[
					{
						'type': 'advance',
						'amount': 40.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 30.0 + 0.0 + 0.0,
				'payment_method': 'unused',
				'payment_date': '10/10/20',
				'settlement_date': '10/10/20',
			},
			'transaction_inputs': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'to_principal': 30.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				}
			],
			'in_err_msg': 'Unequal amount of transaction'
		}
		self._run_test(test)

	def test_failure_already_applied_payment(self) -> None:
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 30.0 + 0.0 + 0.0,
				'payment_method': 'unused',
				'settled_at': date_util.today_as_date(),
				'payment_date': '10/10/20',
				'settlement_date': '10/10/20',
			},
			'transaction_inputs': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'to_principal': 30.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				}
			],
			'in_err_msg': 'already been settled'
		}
		self._run_test(test)

	def test_failure_non_repayment_payment_provided(self) -> None:
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 30.0 + 0.0 + 0.0,
				'payment_method': 'unused',
				'type': db_constants.PaymentType.ADVANCE,
				'payment_date': '10/10/20',
				'settlement_date': '10/10/20',
			},
			'transaction_inputs': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'to_principal': 30.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				}
			],
			'in_err_msg': 'only apply repayments'
		}
		self._run_test(test)

	def test_failure_transactions_dont_balance_with_payment(self) -> None:
		err_amount = 0.01
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 30.0 + 0.0 + 0.0,
				'payment_method': 'unused',
				'type': db_constants.PaymentType.ADVANCE,
				'payment_date': '10/10/20',
				'settlement_date': '10/10/20',
			},
			'transaction_inputs': [
				{
					'amount': 30.0 + 0.0 + 0.0 + err_amount,
					'to_principal': 30.0,
					'to_interest': 0.0,
					'to_fees': 0.0 + err_amount,
				}
			],
			'in_err_msg': 'does not balance with the payment amount'
		}
		self._run_test(test)

	def test_failure_transaction_does_not_balance_with_itself(self) -> None:
		err_amount = 0.01
		test: Dict = {
			'loans': [
				{
					'amount': 50.0,
					'origination_date': '10/10/2020',
					'maturity_date': '10/24/2020',
					'outstanding_principal_balance': 40.4,
					'outstanding_interest': 30.03,
					'outstanding_fees': 20.01
				},
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[
					{
						'type': 'advance',
						'amount': 50.0,
						'payment_date': '10/10/2020',
						'effective_date': '10/10/2020'
					},
				],
			],
			'amount_as_credit_to_user': 0.0,
			'payment': {
				'amount': 30.0 + 0.0 + 0.0 + err_amount,
				'payment_method': 'unused',
				'type': db_constants.PaymentType.ADVANCE,
				'payment_date': '10/10/20',
				'settlement_date': '10/10/20',
			},
			'transaction_inputs': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'to_principal': 30.0,
					'to_interest': 0.0,
					'to_fees': 0.0 + err_amount,
				}
			],
			'in_err_msg': 'Transaction at index 0 does not balance'
		}
		self._run_test(test)

class TestSettleRepaymentLineOfCredit(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		test['is_line_of_credit'] = True
		test['transaction_inputs'] = []
		_run_test(self, test)

	def test_settle_payment_line_of_credit_single_loan_fully_paid(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0,
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
				],
				'amount_as_credit_to_user': 0,
				'payment': {
					'amount': 50.0 + 0.4,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
					 },
				},
				'expected_transactions': [
					{
						'amount': 50.0 + 0.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
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

	def test_settle_payment_line_of_credit_single_loan_overpayment(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0,
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
				],
				'amount_as_credit_to_user': 10.0,
				'payment': {
					'amount': 50.0 + 0.4 + 10.0,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': { 'to_principal': 50.0, 'to_interest': 0.4 },
				},
				'expected_transactions': [
					{
						'amount': 50.0 + 0.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					},
					{
						'amount': 10.0,
						'to_principal': 0.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.TransactionType.CREDIT_TO_USER,
						'loan_id_index': None
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

	def test_settle_payment_line_of_credit_single_loan_partially_paid_only_principal(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
				],
				'payment': {
					'amount': 50.0 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.0,
						'to_principal': 50.0,
						'to_interest': 0.0,
					},
				},
				'amount_as_credit_to_user': 0.0,
				'expected_transactions': [
					{
						'amount': 50.0 + 0.0,
						'to_principal': 50.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.4 - 0.0,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_settle_payment_line_of_credit_single_loan_partially_paid_only_interest(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
				],
				'payment': {
					'amount': 0.0 + 0.4,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': {
						'requested_to_principal': 0.0,
						'requested_to_interest': 0.4,
						'to_principal': 0.0,
						'to_interest': 0.4,
					},
				},
				'amount_as_credit_to_user': 0.0,
				'expected_transactions': [
					{
						'amount': 0.0 + 0.4,
						'to_principal': 0.0,
						'to_interest': 0.4,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 0.0,
						'outstanding_interest': 0.4 - 0.4,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_settle_payment_line_of_credit_multiple_loans_fully_paid(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0
					},
					{
						'origination_date': '10/11/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 100.0,
						'outstanding_principal_balance': 100.0,
						'outstanding_interest': 0.6,
						'outstanding_fees': 0.0
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
					[{'type': 'advance', 'amount': 100.0, 'payment_date': '10/11/2020', 'effective_date': '10/11/2020'}],
				],
				'payment': {
					'amount': 50.0 + 0.4 + 100 + 0.6,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': {
						'requested_to_principal': 50.0 + 100.0,
						'requested_to_interest': 0.4 + 0.6,
						'to_principal': 50.0 + 100.0,
						'to_interest': 0.4 + 0.6,
					},
				},
				'amount_as_credit_to_user': 0.0,
				'expected_transactions': [
					{
						'amount': 100.0 + 0.6,
						'to_principal': 100.0,
						'to_interest': 0.6,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 1
					},
					{
						'amount': 50.0 + 0.4,
						'to_principal': 50.0,
						'to_interest': 0.4,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					}
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

	def test_settle_payment_line_of_credit_multiple_loans_partially_paid_only_principal(self) -> None:
		tests: List[Dict] = [
			{
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 50.0,
						'outstanding_principal_balance': 50.0,
						'outstanding_interest': 0.4,
						'outstanding_fees': 0.0
					},
					{
						'origination_date': '10/11/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 100.0,
						'outstanding_principal_balance': 100.0,
						'outstanding_interest': 0.6,
						'outstanding_fees': 0.0
					},
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
					[{'type': 'advance', 'amount': 100.0, 'payment_date': '10/11/2020', 'effective_date': '10/11/2020'}],
				],
				'payment': {
					'amount': 50.0 + 0.0 + 60.0 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'items_covered': {
						'requested_to_principal': 50.0 + 60.0,
						'requested_to_interest': 0.0 + 0.0,
						'to_principal': 50.0 + 60.0,
						'to_interest': 0.0 + 0.0,
					},
				},
				'amount_as_credit_to_user': 0.0,
				'expected_transactions': [
					{
						'amount': 60.0 + 0.0,
						'to_principal': 60.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 1
					},
					{
						'amount': 50.0 + 0.0,
						'to_principal': 50.0,
						'to_interest': 0.0,
						'to_fees': 0.0,
						'type': db_constants.PaymentType.REPAYMENT,
						'loan_id_index': 0
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.4 - 0.0,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
					{
						'amount': 100.0,
						'outstanding_principal_balance': 100.0 - 60.0,
						'outstanding_interest': 0.6 - 0.0,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_failure_settle_payment_line_of_credit_invalid_to_principal_to_interest(self) -> None:
		test: Dict = {
			'loans': [
				{
					'origination_date': '10/10/2020',
					'maturity_date': '10/21/2020',
					'adjusted_maturity_date': '10/21/2020',
					'amount': 50.0,
					'outstanding_principal_balance': 50.0,
					'outstanding_interest': 0.4,
					'outstanding_fees': 0.0
				},
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[{'type': 'advance', 'amount': 50.0, 'payment_date': '10/10/2020', 'effective_date': '10/10/2020'}],
			],
			'payment': {
				'amount': 50.0 + 0.4,
				'payment_method': 'ach',
				'payment_date': '10/11/2020',
				'settlement_date': '10/13/2020',
				'items_covered': {
					'requested_to_principal': 50.0,
					'requested_to_interest': 0.4,
				},
			},
			'amount_as_credit_to_user': 0.0,
			'settlement_payment': {
				'amount': 50.0 + 0.4,
				'payment_method': 'ach',
				'payment_date': '10/11/2020',
				'settlement_date': '10/13/2020',
				'items_covered': {
					'requested_to_principal': 50.0,
					'requested_to_interest': 0.4,
					'to_principal': 50.0,
					'to_interest': 0.0,
				}, # to_interest is wrong here.
			},
			'in_err_msg': 'Requested breakdown of to_principal vs to_interest',
		}
		self._run_test(test)
