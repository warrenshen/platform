import datetime
import decimal
import json
import uuid
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import PaymentStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util, repayment_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.payments import payment_test_helper
from bespoke.finance.types import payment_types

DEFAULT_INTEREST_RATE = 0.002 # 0.2%

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

def _get_contract(
	company_id: str,
	product_type: str,
	interest_rate: float = DEFAULT_INTEREST_RATE,
) -> models.Contract:
	if product_type == ProductType.LINE_OF_CREDIT:
		return models.Contract(
			company_id=company_id,
			product_type=ProductType.LINE_OF_CREDIT,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.LINE_OF_CREDIT,
				input_dict=ContractInputDict(
					interest_rate=interest_rate,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=0, # unused
					late_fee_structure=_get_late_fee_structure(),
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2020')
		)
	elif product_type == ProductType.INVOICE_FINANCING:
		return models.Contract(
			company_id=company_id,
			product_type=ProductType.INVOICE_FINANCING,
			product_config=contract_test_helper.create_contract_config(
				product_type=ProductType.INVOICE_FINANCING,
				input_dict=ContractInputDict(
					contract_financing_terms=90,
					interest_rate=interest_rate,
					advance_rate=0.8,
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
					contract_financing_terms=90,
					interest_rate=interest_rate,
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

	invoice_ids = []
	invoices = []
	loan_ids = []
	loans = []

	company_id = seed.get_company_id('company_admin', index=0)
	product_type = test['product_type']
	is_invoice_financing = product_type == ProductType.INVOICE_FINANCING
	is_line_of_credit = product_type == ProductType.LINE_OF_CREDIT
	interest_rate = test['interest_rate'] if 'interest_rate' in test else DEFAULT_INTEREST_RATE

	with session_scope(session_maker) as session:
		contract = _get_contract(company_id, product_type=product_type, interest_rate=interest_rate)
		contract_test_helper.set_and_add_contract_for_company(contract, company_id, session)

		if product_type == ProductType.INVOICE_FINANCING:
			for i in range(len(test['invoices'])):
				l = test['invoices'][i]
				invoice = models.Invoice( # type: ignore
					company_id=company_id,
					subtotal_amount=decimal.Decimal(l['subtotal_amount']),
					taxes_amount=decimal.Decimal(l['taxes_amount']),
					total_amount=decimal.Decimal(l['total_amount']),
					invoice_date=date_util.load_date_str(l['invoice_date']),
					invoice_due_date=date_util.load_date_str(l['invoice_date']),
				)
				session.add(invoice)
				session.flush()
				invoice_ids.append(str(invoice.id))
				invoices.append(invoice)

		for i, l in enumerate(test['loans']):
			loan = models.Loan(
				company_id=company_id,
				artifact_id=invoice_ids[i] if is_invoice_financing else None,
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

			# Create transaction for advance on the loan.
			advance_transaction = {
				'type': db_constants.PaymentType.ADVANCE,
				'amount': l['amount'],
				'payment_date': l['origination_date'],
				'effective_date': l['origination_date']
			}
			_apply_transaction(advance_transaction, session, loan)

	user_id = seed.get_user_id('company_admin', index=0)

	payment_ids = []
	for payment_dict in test['payments']:
		loan_indices = payment_dict['loan_indices'] if 'loan_indices' in payment_dict else None
		if loan_indices:
			repayment_loan_ids = [loan_ids[loan_index] for loan_index in loan_indices]
		else:
			repayment_loan_ids = loan_ids

		# Make sure we have a payment already registered in the system that we are settling.
		payment_id, err = repayment_util.create_repayment(
			company_id=str(company_id),
			payment_insert_input=payment_types.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				method=payment_dict['payment_method'],
				requested_amount=number_util.round_currency(payment_dict['amount']),
				amount=None,
				requested_payment_date='10/10/2020',
				payment_date=None,
				settlement_date='10/10/2020', # unused
				items_covered={
					'loan_ids': repayment_loan_ids,
					'requested_to_account_fees': 0.0,
				},
				company_bank_account_id=payment_dict['company_bank_account_id'],
				customer_note=''
			),
			user_id=user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False)
		self.assertIsNone(err)
		payment_ids.append(payment_id)

		# Say the payment has already been applied if the test has this value set.
		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())
			# TODO(warrenshen): actually do the "schedule payment" flow to set the payment date.
			payment.payment_date = date_util.load_date_str(payment_dict['payment_date'])
			if payment and payment_dict.get('settled_at'):
				payment.settled_at = payment_dict['settled_at']

			if payment and payment_dict.get('type'):
				payment.type = payment_dict['type']

		if is_line_of_credit:
			items_covered = payment_dict['items_covered']
		else:
			items_covered = payment_dict['items_covered'] if 'items_covered' in payment_dict else {}
			if 'to_user_credit' not in items_covered:
				items_covered['to_user_credit'] = 0.0
			items_covered['loan_ids'] = repayment_loan_ids

		if 'to_account_fees' not in items_covered:
			items_covered['to_account_fees'] = 0.0

		req = repayment_util.SettleRepaymentReqDict(
			company_id=str(company_id),
			payment_id=payment_id,
			amount=number_util.round_currency(payment_dict['amount']),
			deposit_date=payment_dict['payment_date'],
			settlement_date=payment_dict['settlement_date'],
			items_covered=items_covered,
			transaction_inputs=payment_dict['transaction_inputs'] if 'transaction_inputs' in payment_dict else None,
		)

		bank_admin_user_id = seed.get_user_id('bank_admin', index=0)

		_, err = repayment_util.settle_repayment(
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
		for i in range(len(test['expected_payments'])):
			original_payment = test['payments'][i]
			expected_payment = test['expected_payments'][i]
			payment_id = payment_ids[i]
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())

			# Assertions on the payment
			self.assertAlmostEqual(expected_payment['amount'], float(payment.amount))
			self.assertEqual(db_constants.PaymentType.REPAYMENT, payment.type)
			self.assertEqual(company_id, str(payment.company_id))
			self.assertEqual(
				expected_payment['settlement_identifier'] if 'settlement_identifier' in expected_payment else None,
				payment.settlement_identifier,
			)
			self.assertEqual(original_payment['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(user_id, str(payment.submitted_by_user_id))
			self.assertEqual(original_payment['payment_date'], date_util.date_to_str(payment.payment_date))
			self.assertEqual(original_payment['settlement_date'], date_util.date_to_str(payment.settlement_date))
			self.assertIsNotNone(payment.settled_at)
			self.assertEqual(bank_admin_user_id, str(payment.settled_by_user_id))

			# Assertions on transactions
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).filter(
					models.Transaction.payment_id == payment_id
				).all())

			# self.assertEqual(len(transaction_ids), len(transactions))
			transactions = [t for t in transactions]
			transactions.sort(key=lambda t: t.amount, reverse=True) # Sort from largest to least

			# TODO(warrenshen): add this assert back in. This assert currently does not
			# work because `expected_transactions` includes credit_to_user transactions
			# but `transactions` does not.
			# self.assertEqual(len(test['expected_transactions']), len(transactions))
			for i in range(len(transactions)):
				tx = transactions[i]
				tx_input = expected_payment['expected_transactions'][i]

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
				self.assertEqual(bank_admin_user_id, str(tx.created_by_user_id))
				self.assertEqual(original_payment['settlement_date'], date_util.date_to_str(tx.effective_date))

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

class TestSettleRepayment(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		test['product_type'] = ProductType.INVENTORY_FINANCING
		_run_test(self, test)

	def test_partially_paid(self) -> None:
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
				'payments': [
					{
						'amount': 40.0 + 0.3 + 20.0 + 0.24,
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'to_user_credit': 0.0,
						},
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
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 40.0 + 0.3 + 20.0 + 0.24,
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
					},
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

	def test_close_loan_handle_rounding_issue(self) -> None:
		# Interest due: 0.002 * 51.02 * 3 => 0.30612
		# Fees due: 0.02551
		tests: List[Dict] = [
			{
				'loans': [
					{
						'amount': 51.02,
						'origination_date': '10/10/2020',
						'maturity_date': '10/11/2020',
						'outstanding_principal_balance': 51.02, # unused
						'outstanding_interest': 0.0, # unused
						'outstanding_fees': 0.0, # unused
					}
				],
				'payments': [
					{
						'amount': round(51.02 + 0.31, 2),
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'to_user_credit': 0.0,
						},
						'transaction_inputs': [
							{
								'amount': 51.02 + 0.31,
								'to_principal': 51.02,
								'to_interest': 0.31,
								'to_fees': 0.00,
							}
						],
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 51.02 + 0.31,
						'expected_transactions': [
							{
								'type': db_constants.PaymentType.REPAYMENT,
								'amount': 51.02 + 0.31,
								'to_principal': 51.02,
								'to_interest': 0.31,
								'to_fees': 0.00,
								'loan_id_index': 0,
							}
						],
					},
				],
				'loans_after_payment': [
					{
						'amount': 51.02,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.3 - 0.3,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					}
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_fully_paid_and_closed_and_overpayment(self) -> None:
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
			'payments':  [
				{
					'amount': 55.0 + 0.3 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'to_user_credit': 5.0,
					},
					'transaction_inputs': [
						{
							'amount': 50.0 + 0.3 + 0.0,
							'to_principal': 50.0,
							'to_interest': 0.3,
							'to_fees': 0.0,
						}
					],
				},
			],
			'expected_payments': [
				{
					'settlement_identifier': '1',
					'amount': 55.0 + 0.3 + 0.0,
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
							'type': db_constants.PaymentType.CREDIT_TO_USER,
							'loan_id_index': None
						},
					],
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

	def test_fully_paid_and_closed_skip_transactions_that_sum_to_zero(self) -> None:
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
					},
					{
						'amount': 30.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 30.0,
						'outstanding_interest': 0.18,
						'outstanding_fees': 0.0,
					}
				],
				'payments': [
					{
						'amount': 50.0 + 0.3 + 40.0 + 0.24 + 0.0 + 0.0,
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'to_user_credit': 0.0,
						},
						'transaction_inputs': [
							{
								'amount': 50.0 + 0.3,
								'to_principal': 50.0,
								'to_interest': 0.3,
								'to_fees': 0.0,
							},
							{
								'amount': 40.0 + 0.24,
								'to_principal': 40.0,
								'to_interest': 0.24,
								'to_fees': 0.0,
							},
							{
								'amount': 0.0,
								'to_principal': 0.0,
								'to_interest': 0.0,
								'to_fees': 0.0,
							},
						],
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.3 + 40.0 + 0.24 + 0.0 + 0.0,
						'expected_transactions': [
							{
								'type': db_constants.PaymentType.REPAYMENT,
								'amount': 50.0 + 0.3,
								'to_principal': 50.0,
								'to_interest': 0.3,
								'to_fees': 0.0,
								'loan_id_index': 0,
							},
							{
								'type': db_constants.PaymentType.REPAYMENT,
								'amount': 40.0 + 0.24,
								'to_principal': 40.0,
								'to_interest': 0.24,
								'to_fees': 0.0,
								'loan_id_index': 1
							},
						],
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.3 - 0.3,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED,
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 40.0 - 40.0,
						'outstanding_interest': 0.24 - 0.24,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': PaymentStatusEnum.CLOSED,
					},
					{
						'amount': 30.0,
						'outstanding_principal_balance': 30.0 - 0.0,
						'outstanding_interest': 0.18 - 0.0,
						'outstanding_fees': 0.0 - 0.0,
						'payment_status': None,
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_partially_paid_and_closed_and_overpayment(self) -> None:
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
				'payments': [
					{
						'amount': 45.0 + 40.0 + 0.24 + 30.0 + 0.18 + 5.0, # 5.0 is the overpayment
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'to_user_credit': 5.0,
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
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 45.0 + 40.0 + 0.24 + 30.0 + 0.18 + 5.0,
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
								'type': db_constants.PaymentType.CREDIT_TO_USER,
								'loan_id_index': None
							},
						],
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

	def test_fully_paid_over_two_payments(self) -> None:
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
					}, # Partially and closed
					{
						'amount': 40.0,
						'origination_date': '10/10/2020',
						'maturity_date': '10/24/2020',
						'outstanding_principal_balance': 40.0,
						'outstanding_interest': 0.24,
						'outstanding_fees': 0.0,
					}, # Paid and closed
				],
				'payments': [
					{
						'amount': 50.0 + 0.3,
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'transaction_inputs': [
							{
								'amount': 50.0 + 0.3,
								'to_principal': 50.0,
								'to_interest': 0.3,
								'to_fees': 0.0
							},
						],
						'loan_indices': [0],
					},
					{
						'amount': 40.0 + 0.24,
						'payment_method': 'ach',
						'payment_date': '10/10/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'transaction_inputs': [
							{
								'amount': 40.0 + 0.24,
								'to_principal': 40.0,
								'to_interest': 0.24,
								'to_fees': 0.0
							},
						],
						'loan_indices': [1],
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.3,
						'expected_transactions': [
							{
								'amount': 50.0 + 0.3,
								'to_principal': 50.0,
								'to_interest': 0.3,
								'to_fees': 0.0,
								'type': db_constants.PaymentType.REPAYMENT,
								'loan_id_index': 0
							},
						],
					},
					{
						'settlement_identifier': '2',
						'amount': 40.0 + 0.24,
						'expected_transactions': [
							{
								'amount': 40.0 + 0.24,
								'to_principal': 40.0,
								'to_interest': 0.24,
								'to_fees': 0.0,
								'type': db_constants.PaymentType.REPAYMENT,
								'loan_id_index': 1
							},
						],
					},
				],
				'loans_after_payment': [
					{
						'amount': 50.0,
						'outstanding_principal_balance': 50.0 - 50.0,
						'outstanding_interest': 0.3 - 0.3,
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.CLOSED
					},
					{
						'amount': 40.0,
						'outstanding_principal_balance': 40.0 - 40.0,
						'outstanding_interest': 0.24 - 0.24,
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
			'payments': [
				{
					'amount': 55.0 + 0.3 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 55.0 + 0.3 + 0.0,
							'to_principal': 55.0,
							'to_interest': 0.3,
							'to_fees': 0.0,
						}
					],
				},
			],
			'expected_payments': [
				{
					'settlement_identifier': '1',
					'amount': 55.0 + 0.3 + 0.0,
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
							'type': db_constants.PaymentType.CREDIT_TO_USER,
							'loan_id_index': None
						},
					],
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
			'payments': [
				{
					'amount': (50.0 + 0.3 + 10.0 + 5.0) + (40.0 + 0.0 + 5.0 + 1.0),
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
					'company_bank_account_id': None,
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
				},
			],
			'expected_payments': [
				{
					'settlement_identifier': '1',
					'amount': (50.0 + 0.3 + 10.0 + 5.0) + (40.0 + 0.0 + 5.0 + 1.0)
				},
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

	def test_zero_principal_with_interest_and_fees_not_zero(self) -> None:
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
			'payments': [
				{
					'amount': 50.0 + 0.0 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 50.0 + 0.0 + 0.0,
							'to_principal': 50.0,
							'to_interest': 0.0,
							'to_fees': 0.0,
						}
					],
				},
			],
			'expected_payments': [
				{
					'settlement_identifier': '1',
					'amount': 50.0 + 0.0 + 0.0,
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
				},
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
			'payments': [
				{
					'amount': 50.0 + 10.0 + 0.0 + 0.0,
					'payment_method': 'ach',
					'payment_date': '10/10/2020',
					'settlement_date': '10/12/2020',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 50.0 + 10.0 + 0.0 + 0.0,
							'to_principal': 50.0 + 10.0, # $10 overpayment on principal
							'to_interest': 0.0, # underpayment on interest
							'to_fees': 0.0,
						}
					],
				},
			],
			'expected_payments': [
				{
					'settlement_identifier': '1',
					'amount': 50.0 + 10.0 + 0.0 + 0.0,
				},
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
			contract = _get_contract(company_id, ProductType.INVENTORY_FINANCING)
			session.add(contract)

		req = repayment_util.SettleRepaymentReqDict(
			company_id=company_id,
			payment_id=None,
			amount=50.0 + 0.0 + 0.0,
			deposit_date='10/10/20',
			settlement_date='10/10/20',
			items_covered={
				'loan_ids': [str(uuid.uuid4())],
				'to_account_fees': 0.0,
				'to_user_credit': 0.0,
			},
			transaction_inputs=[
				{
					'amount': 50.0 + 0.0 + 0.0,
					'to_principal': 50.0,
					'to_interest': 0.0,
					'to_fees': 0.0,
				},
			],
		)

		payment_id, err = repayment_util.settle_repayment(
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
			'payments': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'payment_method': 'unused',
					'payment_date': '10/10/20',
					'settlement_date': '10/10/20',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 30.0 + 0.0 + 0.0,
							'to_principal': 30.0,
							'to_interest': 0.0,
							'to_fees': 0.0,
						}
					],
				},
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
			'payments': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'payment_method': 'unused',
					'settled_at': date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE),
					'payment_date': '10/10/20',
					'settlement_date': '10/10/20',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 30.0 + 0.0 + 0.0,
							'to_principal': 30.0,
							'to_interest': 0.0,
							'to_fees': 0.0,
						}
					],
				},
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
			'payments': [
				{
					'type': db_constants.PaymentType.ADVANCE,
					'amount': 30.0 + 0.0 + 0.0,
					'payment_method': 'unused',
					'payment_date': '10/10/20',
					'settlement_date': '10/10/20',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 30.0 + 0.0 + 0.0,
							'to_principal': 30.0,
							'to_interest': 0.0,
							'to_fees': 0.0,
						}
					],
				},
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
			'payments': [
				{
					'amount': 30.0 + 0.0 + 0.0,
					'payment_method': 'unused',
					'payment_date': '10/10/20',
					'settlement_date': '10/10/20',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 30.0 + 0.0 + 0.0 + err_amount,
							'to_principal': 30.0,
							'to_interest': 0.0,
							'to_fees': 0.0 + err_amount,
						}
					],
				},
			],
			'in_err_msg': 'Sum of transactions and credit to user'
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
			'payments': [
				{
					'amount': 30.0 + 0.0 + 0.0 + err_amount,
					'payment_method': 'unused',
					'payment_date': '10/10/20',
					'settlement_date': '10/10/20',
					'company_bank_account_id': None,
					'transaction_inputs': [
						{
							'amount': 30.0 + 0.0 + 0.0,
							'to_principal': 30.0,
							'to_interest': 0.0,
							'to_fees': 0.0 + err_amount,
							'to_user_credit': 0.0,
						}
					],
				},
			],
			'in_err_msg': 'Transaction at index 0 does not balance'
		}
		self._run_test(test)

class TestSettleRepaymentInvoiceFinancing(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		test['product_type'] = ProductType.INVOICE_FINANCING
		_run_test(self, test)

	def test_invoice_financing_single_loan_payment_one_fully_pays_subtotal(self) -> None:
		# Day 1: interest accrues.
		# Day 2: interest accrues, payments pays off some principal and interest.
		#   Payment amount equals invoice subtotal amount, so no further interest accrues.
		# Day 3: no interest accrues.
		interest_rate = 0.50 # 50%
		subtotal_amount = 100.0
		payment_one_amount = 50.0 + (subtotal_amount * interest_rate)
		payment_two_amount = 30.0 + ((subtotal_amount - payment_one_amount) * interest_rate)

		tests: List[Dict] = [
			{
				'interest_rate': interest_rate,
				'invoices': [
					{
						'subtotal_amount': subtotal_amount,
						'taxes_amount': 0.0,
						'total_amount': subtotal_amount,
						'invoice_date': '10/10/2020',
					},
				],
				'loans': [
					{
						'origination_date': '10/10/2020',
						'maturity_date': '10/21/2020',
						'adjusted_maturity_date': '10/21/2020',
						'amount': 80.0,
						'outstanding_principal_balance': 80.0,
						'outstanding_interest': 0.0,
						'outstanding_fees': 0.0,
					},
				],
				'payments': [
					{
						'amount': payment_one_amount,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/11/2020',
						'company_bank_account_id': None,
						'transaction_inputs': [
							{
								'amount': payment_one_amount,
								'to_principal': 50.0,
								'to_interest': subtotal_amount * interest_rate,
								'to_fees': 0.0,
							},
						],
					},
					{
						'amount': payment_two_amount,
						'payment_method': 'ach',
						'payment_date': '10/12/2020',
						'settlement_date': '10/12/2020',
						'company_bank_account_id': None,
						'transaction_inputs': [
							{
								'amount': payment_two_amount,
								'to_principal': 30.0,
								'to_interest': (subtotal_amount - payment_one_amount) * interest_rate,
								'to_fees': 0.0,
							},
						],
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': payment_one_amount,
						'expected_transactions': [
							{
								'amount': payment_one_amount,
								'to_principal': 50.0,
								'to_interest': subtotal_amount * interest_rate,
								'to_fees': 0.0,
								'type': db_constants.PaymentType.REPAYMENT,
								'loan_id_index': 0
							},
						],
					},
					{
						'settlement_identifier': '2',
						'amount': payment_two_amount,
						'expected_transactions': [
							{
								'amount': payment_two_amount,
								'to_principal': 30.0,
								'to_interest': (subtotal_amount - payment_one_amount) * interest_rate,
								'to_fees': 0.0,
								'type': db_constants.PaymentType.REPAYMENT,
								'loan_id_index': 0
							},
						],
					},
				],
				'loans_after_payment': [
					{
						'amount': 80.0,
						'outstanding_principal_balance': 80.0 - 50.0 - 30.0,
						'outstanding_interest': (50.0 + 50.0 + 0.0) - (50.0),
						'outstanding_fees': 0.0,
						'payment_status': PaymentStatusEnum.PARTIALLY_PAID
					},
				]
			}
		]
		for test in tests:
			self._run_test(test)

class TestSettleRepaymentLineOfCredit(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		test['product_type'] = ProductType.LINE_OF_CREDIT
		test['transaction_inputs'] = []
		_run_test(self, test)

	def test_line_of_credit_single_loan_fully_paid(self) -> None:
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
				'payments': [
					{
						'amount': 50.0 + 0.4,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'requested_to_principal': 50.0,
							'requested_to_interest': 0.4,
							'to_principal': 50.0,
							'to_interest': 0.4,
							'to_user_credit': 0.0,
						},
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.4,
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

	def test_line_of_credit_single_loan_overpayment(self) -> None:
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
				'payments': [
					{
						'amount': 50.0 + 0.4 + 10.0,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'to_principal': 50.0,
							'to_interest': 0.4,
							'to_user_credit': 10.0,
						},
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.4 + 10.0,
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
								'type': db_constants.PaymentType.CREDIT_TO_USER,
								'loan_id_index': None
							},
						],
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

	def test_line_of_credit_single_loan_partially_paid_only_principal(self) -> None:
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
				'payments': [
					{
						'amount': 50.0 + 0.0,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'items_covered': {
							'requested_to_principal': 50.0,
							'requested_to_interest': 0.0,
							'to_principal': 50.0,
							'to_interest': 0.0,
							'to_user_credit': 0.0,
						},
						'company_bank_account_id': None,
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.0,
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

	def test_line_of_credit_single_loan_partially_paid_only_interest(self) -> None:
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
				'payments': [
					{
						'amount': 0.0 + 0.4,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'requested_to_principal': 0.0,
							'requested_to_interest': 0.4,
							'to_principal': 0.0,
							'to_interest': 0.4,
							'to_user_credit': 0.0,
						},
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 0.0 + 0.4,
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

	def test_line_of_credit_multiple_loans_fully_paid(self) -> None:
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
				'payments': [
					{
						'amount': 50.0 + 0.4 + 100 + 0.6,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'requested_to_principal': 50.0 + 100.0,
							'requested_to_interest': 0.4 + 0.6,
							'to_principal': 50.0 + 100.0,
							'to_interest': 0.4 + 0.6,
							'to_user_credit': 0.0,
						},
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.4 + 100 + 0.6,
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

	def test_line_of_credit_multiple_loans_partially_paid_only_principal(self) -> None:
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
				'payments': [
					{
						'amount': 50.0 + 0.0 + 60.0 + 0.0,
						'payment_method': 'ach',
						'payment_date': '10/11/2020',
						'settlement_date': '10/13/2020',
						'company_bank_account_id': None,
						'items_covered': {
							'requested_to_principal': 50.0 + 60.0,
							'requested_to_interest': 0.0 + 0.0,
							'to_principal': 50.0 + 60.0,
							'to_interest': 0.0 + 0.0,
							'to_user_credit': 0.0,
						},
					},
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 50.0 + 0.0 + 60.0 + 0.0,
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

	def test_failure_line_of_credit_invalid_to_principal_to_interest(self) -> None:
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
			'payments': [
				{
					'amount': 50.0 + 0.4,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.4,
						'to_principal': 50.0,
						'to_interest': 0.0, # to_interest is wrong here.
						'to_user_credit': 0.0,
					},
				},
			],
			'in_err_msg': 'Sum of amount to principal',
		}
		self._run_test(test)

	def test_failure_line_of_credit_invalid_to_user_credit(self) -> None:
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
			'payments': [
				{
					'amount': 50.0 + 0.4,
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.4,
						'to_principal': 50.0,
						'to_interest': 0.0,
						'to_user_credit': 10.0, # to_user_credit is wrong here
					},
				},
			],
			'in_err_msg': 'Sum of amount to principal',
		}
		self._run_test(test)

	def test_failure_line_of_credit_principal_overpayment(self) -> None:
		"""
		Tests that an overpayment on the principal gets rejected
		"""
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
			'payments': [
				{
					'amount': 50.0 + 0.4 + 10.0, # 10.0 overpayment
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'requested_to_principal': 50.0 + 10.0, # 10.0 overpayment
						'requested_to_interest': 0.4,
						'to_principal': 50.0 + 10.0, # 10.0 overpayment
						'to_interest': 0.4,
						'to_user_credit': 0.0,
					},
				},
			],
			'in_err_msg': 'Amount of principal left',
		}
		self._run_test(test)

	def test_failure_line_of_credit_interest_overpayment(self) -> None:
		"""
		Tests that an overpayment on the interest gets rejected
		"""
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
			'payments': [
				{
					'amount': 50.0 + 0.4 + 10.0, # 10.0 overpayment
					'payment_method': 'ach',
					'payment_date': '10/11/2020',
					'settlement_date': '10/13/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.4 + 10.0, # 10.0 overpayment
						'to_principal': 50.0,
						'to_interest': 0.4 + 10.0, # 10.0 overpayment
						'to_user_credit': 0.0,
					},
				},
			],
			'in_err_msg': 'Amount of interest left',
		}
		self._run_test(test)

	def test_failure_line_of_credit_loan_originated_after_payment(self) -> None:
		"""
		Tests that a loan with an origination date in the future relative to
		deposit date of repayment is not included in list of loans repayment
		may pay off (as a result, repayment is an overpayment and fails)
		"""
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
			'payments': [
				{
					'amount': 50.0,
					'payment_method': 'ach',
					'payment_date': '10/09/2020',
					'settlement_date': '10/13/2020',
					'company_bank_account_id': None,
					'items_covered': {
						'requested_to_principal': 50.0,
						'requested_to_interest': 0.0,
						'to_principal': 50.0,
						'to_interest': 0.0,
						'to_user_credit': 0.0,
					},
				},
			],
			'in_err_msg': 'Amount of principal left',
		}
		self._run_test(test)
