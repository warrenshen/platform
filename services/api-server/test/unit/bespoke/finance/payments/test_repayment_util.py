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

def _get_contract(company_id: str) -> models.Contract:
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
			contract = _get_contract(company_id)
			session.add(contract)

			for i in range(len(loans)):
				loan = loans[i]
				loan.company_id = company_id
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

			for i in range(len(test['transaction_lists'])):
				transaction_list = test['transaction_lists'][i]
				loan = loans[i]
				for tx in transaction_list:
					_apply_transaction(tx, session, loan)

			if test.get('loans_not_selected'):
				loans_not_selected_list = []
				for j in range(len(test['loans_not_selected'])):
					loan_not_selected = test['loans_not_selected'][j]
					loan_not_selected.company_id = company_id
					session.add(loan_not_selected)
					session.flush()
					loan_ids_not_selected.append(str(loan_not_selected.id))
					loans_not_selected_list.append(loan_not_selected)

				for j in range(len(test['transaction_lists_for_not_selected'])):
					transaction_list = test['transaction_lists_for_not_selected'][j]
					loan_not_selected = loans_not_selected_list[j]
					for tx in transaction_list:
						_apply_transaction(tx, session, loan_not_selected)

		resp, err = repayment_util.calculate_repayment_effect(
			company_id=company_id,
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=test['payment_input_amount'],
				method='ach',
				payment_date=test['payment_date'],
				settlement_date=test['settlement_date'],
				items_covered={},
			),
			payment_option=test['payment_option'],
			loan_ids=loan_ids,
			session_maker=session_maker,
			test_only_skip_interest_and_fees_calculation=test.get('test_only_skip_interest_and_fees_calculation')
		)
		self.assertIsNone(err)
		self.assertEqual('OK', resp.get('status'), msg=err)
		self.assertEqual(test['expected_amount_to_pay'], resp['amount_to_pay'])
		self.assertAlmostEqual(test['expected_amount_as_credit_to_user'], resp['amount_as_credit_to_user'])

		# Assert on the expected loans afterwards
		self.assertEqual(len(test['expected_loans_to_show']), len(resp['loans_to_show']))

		# Sort by increasing amount of loan balance owed to keep things in
		# order with the test.
		resp['loans_to_show'].sort(key=lambda l: l['before_loan_balance']['amount'])

		for i in range(len(resp['loans_to_show'])):
			loan_to_show = resp['loans_to_show'][i]
			expected_loan_to_show = test['expected_loans_to_show'][i]
			expected = expected_loan_to_show
			actual = cast(Dict, loan_to_show)
			self.assertEqual(loan_ids[i], actual['loan_id']) # assert same loan order, but use loan_ids because the loans get created in the test
			test_helper.assertDeepAlmostEqual(self, expected['transaction'], actual['transaction'])
			test_helper.assertDeepAlmostEqual(self, expected['before_loan_balance'], actual['before_loan_balance'])
			test_helper.assertDeepAlmostEqual(self, expected['after_loan_balance'], actual['after_loan_balance'])

		# Assert on which loans ended up in the past due but not selected
		# category
		self.assertEqual(len(test['expected_past_due_but_not_selected_indices']), len(resp['loans_past_due_but_not_selected']))
		resp['loans_past_due_but_not_selected'].sort(key = lambda l: l['before_loan_balance']['amount'])

		for i in range(len(resp['loans_past_due_but_not_selected'])):
			actual = cast(Dict, resp['loans_past_due_but_not_selected'][i])
			cur_loan_id_past_due = resp['loans_past_due_but_not_selected'][i]['loan_id']
			expected_loan_id_past_due = loan_ids_not_selected[test['expected_past_due_but_not_selected_indices'][i]]
			self.assertEqual(expected_loan_id_past_due, cur_loan_id_past_due)

			# NOTE: getting lazy, but assuming that we are testing with no interest and fees
			# calculations, and are only asserting on the amounts, e.g., the principal
			amount = test['expected_past_due_but_not_selected_amounts'][i]
			outstanding_principal = test['expected_past_due_but_not_selected_principal'][i]
			self.assertAlmostEqual(amount, actual['before_loan_balance']['amount'])
			self.assertAlmostEqual(outstanding_principal, actual['before_loan_balance']['outstanding_principal_balance'])
			self.assertAlmostEqual(amount, actual['after_loan_balance']['amount'])
			self.assertAlmostEqual(outstanding_principal, actual['after_loan_balance']['outstanding_principal_balance'])


	def test_custom_amount_single_loan_before_maturity_no_transactions(self) -> None:
		daily_interest = INTEREST_RATE * 20.02 # ~0.04 = daily_interest_rate_pct * principal_owed
		# Amount as credit is equal to the outstanding principal balance since
		# they overpaid on this one.

		test: Dict = {
			'comment': 'The user pays a single loan for a custom amount, and there is credit remaining on their balance',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(20.02),
					origination_date=date_util.load_date_str('9/1/2020'),
					adjusted_maturity_date=date_util.load_date_str('9/20/2020')
				)
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[{'type': 'advance', 'amount': 20.02, 'effective_date': '9/1/2020'}]
			],
			'payment_date': '9/12/2020',
			'settlement_date': '9/14/2020',
			'payment_option': 'custom_amount',
			'payment_input_amount': 30.01,
			'expected_amount_to_pay': 30.01,
			'expected_amount_as_credit_to_user': -1 * (20.02 + (14 * daily_interest) - 30.01),
			'expected_loans_to_show': [
				LoanToShowDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=30.01,
						to_principal=30.01 - (14 * daily_interest),
						to_interest=14 * daily_interest,
						to_fees=0.0
					),
					before_loan_balance=LoanBalanceDict(
						amount=20.02,
						outstanding_principal_balance=20.02,
						outstanding_interest=14 * daily_interest,
						outstanding_fees=0.0
					),
					after_loan_balance=LoanBalanceDict(
						amount=20.02,
						outstanding_principal_balance=20.02 + (14 * daily_interest) - 30.01,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				)
			],
			'expected_past_due_but_not_selected_indices': []
		}

		self._run_test(test)

	def test_custom_amount_multiple_loans_credit_remaining(self) -> None:
		#credit_amount = 15.01 - 9.99 - 1.03 - 1.88 - 0.73
		daily_interest1 = 0.04 # INTEREST_RATE * 20.00 == daily_interest_rate_pct * principal_owed
		daily_interest2 = 0.06 # INTEREST_RATE * 30.00 == daily_interest_rate_pct * principal_owed

		test: Dict = {
			'comment': 'The user pays off multiple loans and have a credit remaining on their principal',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(20.00),
					origination_date=date_util.load_date_str('8/20/2020'),
					adjusted_maturity_date=date_util.load_date_str('8/27/2020')
				),
				models.Loan(
					amount=decimal.Decimal(30.00),
					origination_date=date_util.load_date_str('8/22/2020'),
					adjusted_maturity_date=date_util.load_date_str('8/29/2020')
				)
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[{'type': 'advance', 'amount': 20.00, 'effective_date': '8/20/2020'}],
				[{'type': 'advance', 'amount': 30.00, 'effective_date': '8/22/2020'}]
			],
			'payment_date': '8/24/2020',
			'settlement_date': '8/28/2020', # late fees accrued on the 1st loan
			'payment_option': 'custom_amount',
			'payment_input_amount': 105.00,
			'expected_amount_to_pay': 105.00,
			'expected_amount_as_credit_to_user': -1 * (30.0-84.21),
			'expected_loans_to_show': [
				LoanToShowDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=20.37,
						to_principal=20.00,
						to_interest=9 * daily_interest1,
						to_fees=1 * daily_interest1 * 0.25
					),
					before_loan_balance=LoanBalanceDict(
						amount=20.00,
						outstanding_principal_balance=20.00,
						outstanding_interest=9 * daily_interest1, # 9 days of interest accrued
						outstanding_fees=1 * daily_interest1 * 0.25 # 1 day of late fees
					),
					after_loan_balance=LoanBalanceDict(
						amount=20.00,
						outstanding_principal_balance=0.0,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
				LoanToShowDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=105.00 - 20.37, # remainder after the first transaction
						to_principal=105.00 - 20.37 - (7 * daily_interest2), # 84.21
						to_interest=7 * daily_interest2,
						to_fees=0.0
					),
					before_loan_balance=LoanBalanceDict(
						amount=30.00,
						outstanding_principal_balance=30.00,
						outstanding_interest=7 * daily_interest2, # 0.42
						outstanding_fees=0.0
					),
					after_loan_balance=LoanBalanceDict(
						amount=30.00,
						outstanding_principal_balance=30.0-84.21,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				)
			],
			'expected_past_due_but_not_selected_indices': []
		}

		self._run_test(test)

	def test_custom_amount_multiple_loans_cant_pay_off_everything(self) -> None:
		daily_interest1 = INTEREST_RATE * 10.00 # == 0.02
		daily_interest2 = INTEREST_RATE * 30.00
		daily_interest3 = INTEREST_RATE * 50.00
		test: Dict = {
			'comment': 'The user pays exactly what they specified',
			'loans': [
				models.Loan(
					amount=decimal.Decimal(10.00),
					origination_date=date_util.load_date_str('2/01/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/10/2020')
				),
				models.Loan(
					amount=decimal.Decimal(30.00),
					origination_date=date_util.load_date_str('02/05/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/12/2020')
				),
				models.Loan(
					amount=decimal.Decimal(50.00),
					origination_date=date_util.load_date_str('02/10/2020'),
					adjusted_maturity_date=date_util.load_date_str('10/14/2020')
				)
			],
			'transaction_lists': [
				# Transactions are parallel to the loans defined in the test.
				# These will be advances or repayments made against their respective loans.
				[{'type': 'advance', 'amount': 10.00, 'effective_date': '02/01/2020'}],
				[{'type': 'advance', 'amount': 30.00, 'effective_date': '02/05/2020'}],
				[{'type': 'advance', 'amount': 50.00, 'effective_date': '02/10/2020'}]
			],
			'payment_date': '02/15/2020',
			'settlement_date': '02/20/2020',
			'payment_option': 'custom_amount',
			'payment_input_amount': 15.05,
			'expected_amount_to_pay': 15.05,
			'expected_amount_as_credit_to_user': 0.0,
			'expected_loans_to_show': [
				# We don't have enough money to pay off the second two loans,
				# and we have a partial repayment to the 2nd loan.
				#
				# The payment looks like:
				#   0.51 + 1.03 + 7.99 = 9.53 to the loan maturing 1/1/2020
				#   0.55 + 1.01 + (rem) = to the loan maturing 2/1/2020
				#    where "rem" is the remaining amount of the 15.05 we can pay
				#    so 3.96 gets paid to principal on the 2/1/2020 loan
				#
				LoanToShowDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=10.4,
						to_principal=10.0,
						to_interest=0.4,
						to_fees=0.0
					),
					before_loan_balance=LoanBalanceDict(
						amount=10.00,
						outstanding_principal_balance=10.0,
						outstanding_interest=0.4,
						outstanding_fees=0.0
					),
					after_loan_balance=LoanBalanceDict(
						amount=10.00,
						outstanding_principal_balance=0.0,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
				LoanToShowDict(
					loan_id='filled in by test',
					transaction=TransactionInputDict(
						amount=4.65, # 15.05 - 10.4
						to_principal=3.69,
						to_interest=daily_interest2 * 16, # 0.96
						to_fees=0.0
					),
					before_loan_balance=LoanBalanceDict(
						amount=30.00,
						outstanding_principal_balance=30.0,
						outstanding_interest=daily_interest2 * 16,
						outstanding_fees=0.0
					),
					after_loan_balance=LoanBalanceDict(
						amount=30.00,
						outstanding_principal_balance=30.0 - 3.69,
						outstanding_interest=0.0,
						outstanding_fees=0.0
					)
				),
				LoanToShowDict(
					loan_id='filled in by test',
					# You didnt have money to pay off any of this loan.
					transaction=TransactionInputDict(
						amount=0.0,
						to_principal=0.0,
						to_interest=0.0,
						to_fees=0.0
					),
					before_loan_balance=LoanBalanceDict(
						amount=50.00,
						outstanding_principal_balance=50.0,
						outstanding_interest=daily_interest3 * 11,
						outstanding_fees=0.0
					),
					after_loan_balance=LoanBalanceDict(
						amount=50.00,
						outstanding_principal_balance=50.0,
						outstanding_interest=daily_interest3 * 11,
						outstanding_fees=0.0
					)
				)
			],
			'expected_past_due_but_not_selected_indices': []
		}

		self._run_test(test)

	def test_pay_minimum_due(self) -> None:
		daily_interest1 = INTEREST_RATE * 20.00
		daily_interest2 = INTEREST_RATE * 30.00

		first_loan_payment_amount = 20.00 + (daily_interest1 * 9) + (daily_interest1 * 3 * 0.25)
		second_loan_payment_amount = 30.00 + (daily_interest2 * 4) + (daily_interest2 * 1 * 0.25)

		tests: List[Dict] = [
			{
				'comment': 'The user owes everything on the one loan that has matured',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.00),
						origination_date=date_util.load_date_str('9/20/2020'),
						adjusted_maturity_date=date_util.load_date_str('09/25/2020')
					),
					models.Loan(
						amount=decimal.Decimal(30.00),
						origination_date=date_util.load_date_str('09/25/2020'),
						adjusted_maturity_date=date_util.load_date_str('12/1/2020')
					) # this loan doesnt need to get paid yet
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 20.00, 'effective_date': '09/20/2020'}],
					[{'type': 'advance', 'amount': 30.00, 'effective_date': '09/25/2020'}],
				],
				'payment_date': '09/25/2020',
				'settlement_date': '09/28/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,
				# principal + interest + fees on the first loan
				'expected_amount_to_pay': 20.00 + (daily_interest1 * 9) + (daily_interest1 * 3 * 0.25),
				'expected_amount_as_credit_to_user': 0.0,
				'expected_loans_to_show': [
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.00 + (daily_interest1 * 9) + (daily_interest1 * 3 * 0.25),
							to_principal=20.00,
							to_interest=(daily_interest1 * 9),
							to_fees=(daily_interest1 * 3 * 0.25)
						),
						before_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=20.00,
							outstanding_interest=(daily_interest1 * 9),
							outstanding_fees=(daily_interest1 * 3 * 0.25)
						),
						after_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=0.0,
							to_principal=0.0,
							to_interest=0.0,
							to_fees=0.0
						),
						before_loan_balance=LoanBalanceDict(
							amount=30.00,
							outstanding_principal_balance=30.0,
							outstanding_interest=4 * daily_interest2,
							outstanding_fees=0.0
						),
						after_loan_balance=LoanBalanceDict(
							amount=30.00,
							outstanding_principal_balance=30.0,
							outstanding_interest=4 * daily_interest2,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': []
			},
			{
				'comment': 'The user owes everything on all the loans that have matured',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.00),
						origination_date=date_util.load_date_str('9/20/2020'),
						adjusted_maturity_date=date_util.load_date_str('09/25/2020')
					),
					models.Loan(
						amount=decimal.Decimal(30.00),
						origination_date=date_util.load_date_str('09/25/2020'),
						adjusted_maturity_date=date_util.load_date_str('09/27/2020')
					) # this loan doesnt need to get paid yet
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 20.00, 'effective_date': '09/20/2020'}],
					[{'type': 'advance', 'amount': 30.00, 'effective_date': '09/25/2020'}],
				],
				'payment_date': '09/25/2020',
				'settlement_date': '09/28/2020',
				'payment_option': 'pay_minimum_due',
				'payment_input_amount': None,
				# principal + interest + fees on the first loan
				'expected_amount_to_pay': first_loan_payment_amount + second_loan_payment_amount,
				'expected_amount_as_credit_to_user': 0.0,
				'expected_loans_to_show': [
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.00 + (daily_interest1 * 9) + (daily_interest1 * 3 * 0.25),
							to_principal=20.00,
							to_interest=(daily_interest1 * 9),
							to_fees=(daily_interest1 * 3 * 0.25)
						),
						before_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=20.00,
							outstanding_interest=(daily_interest1 * 9),
							outstanding_fees=(daily_interest1 * 3 * 0.25)
						),
						after_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=30.00 + (daily_interest2 * 4) + (daily_interest2 * 1 * 0.25),
							to_principal=30.0,
							to_interest=(daily_interest2 * 4),
							to_fees=(daily_interest2 * 1 * 0.25)
						),
						before_loan_balance=LoanBalanceDict(
							amount=30.00,
							outstanding_principal_balance=30.0,
							outstanding_interest=4 * daily_interest2,
							outstanding_fees=(daily_interest2 * 1 * 0.25)
						),
						after_loan_balance=LoanBalanceDict(
							amount=30.00,
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
				'comment': 'The user owes everything on all the loans',
				'loans': [
					models.Loan(
						amount=decimal.Decimal(20.00),
						origination_date=date_util.load_date_str('9/20/2020'),
						adjusted_maturity_date=date_util.load_date_str('09/25/2020')
					), # this loan didnt mature yet
					models.Loan(
						amount=decimal.Decimal(30.00),
						origination_date=date_util.load_date_str('09/25/2020'),
						adjusted_maturity_date=date_util.load_date_str('09/26/2020')
					) # this loan didnt mature yet
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 20.00, 'effective_date': '09/20/2020'}],
					[{'type': 'advance', 'amount': 30.00, 'effective_date': '09/25/2020'}],
				],
				'payment_date': '09/25/2020',
				'settlement_date': '09/30/2020',
				'payment_option': 'pay_in_full',
				'payment_input_amount': None,
				# principal + interest + fees on the first loan
				'expected_amount_to_pay': 20.0 + 30.0,
				'expected_amount_as_credit_to_user': 0.0,
				# this makes it easier to test the functionality without re-testing the
				# interest and fees calculations constantly.
				'test_only_skip_interest_and_fees_calculation': True,
				'expected_loans_to_show': [
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.00,
							to_principal=20.00,
							to_interest=0.0,
							to_fees=0.0
						),
						before_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=20.00,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						),
						after_loan_balance=LoanBalanceDict(
							amount=20.00,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					),
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=30.00,
							to_principal=30.0,
							to_interest=0.0,
							to_fees=0.0
						),
						before_loan_balance=LoanBalanceDict(
							amount=30.00,
							outstanding_principal_balance=30.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						),
						after_loan_balance=LoanBalanceDict(
							amount=30.00,
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
						origination_date=date_util.load_date_str('11/05/2020'),
						adjusted_maturity_date=date_util.load_date_str('11/09/2020')
					)
				],
				'transaction_lists': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[{'type': 'advance', 'amount': 20.02, 'effective_date': '11/05/2020'}]
				],
				'transaction_lists_for_not_selected': [
					# Transactions are parallel to the loans defined in the test.
					# These will be advances or repayments made against their respective loans.
					[
						{'type': 'advance', 'amount': 30.02, 'effective_date': '11/10/2020'},
						{'type': 'repayment', 'to_principal': 10.02, 'to_interest': 0.0, 'to_fees': 0.0, 'effective_date': '11/12/2020'}
					],
					[{'type': 'advance', 'amount': 50.02, 'effective_date': '11/22/2020'}]
				],
				'loans_not_selected': [
					models.Loan(
						amount=decimal.Decimal(30.02),
						origination_date=date_util.load_date_str('11/10/2020'),
						adjusted_maturity_date=date_util.load_date_str('11/12/2020'),
						outstanding_principal_balance=decimal.Decimal(8.1)
					),
					models.Loan(
						amount=decimal.Decimal(50.02),
						origination_date=date_util.load_date_str('11/22/2020'),
						adjusted_maturity_date=date_util.load_date_str('11/30/2020'),
						outstanding_principal_balance=decimal.Decimal(9.1)
					)
				],
				'payment_date': '11/12/2020',
				'settlement_date': '11/14/2020',
				'payment_option': 'pay_in_full',
				'payment_input_amount': None,
				# this makes it easier to test the functionality without re-testing the
				# interest and fees calculations constantly.
				'test_only_skip_interest_and_fees_calculation': True,
				'expected_amount_to_pay': 20.02,
				'expected_amount_as_credit_to_user': 0.0,
				'expected_loans_to_show': [
					LoanToShowDict(
						loan_id='filled in by test',
						transaction=TransactionInputDict(
							amount=20.02,
							to_principal=20.02,
							to_interest=0.0,
							to_fees=0.0
						),
						before_loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=20.02,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						),
						after_loan_balance=LoanBalanceDict(
							amount=20.02,
							outstanding_principal_balance=0.0,
							outstanding_interest=0.0,
							outstanding_fees=0.0
						)
					)
				],
				'expected_past_due_but_not_selected_indices': [0],
				'expected_past_due_but_not_selected_amounts': [30.02],
				'expected_past_due_but_not_selected_principal': [20.00] # shows we handle repayment that happened on that overdue loan
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
		payment_id, err = repayment_util.create_repayment(
			company_id=company_id,
			payment_insert_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=payment_input_amount,
				method=test['payment_method'],
				payment_date=payment_date,
				settlement_date='unused',
				items_covered={},
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
			self.assertIsNone(payment.settlement_date)
			self.assertEqual(loan_ids, cast(Dict, payment.items_covered)['loan_ids'])

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			loans = [loan for loan in loans]
			loans.sort(key=lambda l: l.amount)
			self.assertEqual(len(test['expected_loans']), len(loans))
			for i in range(len(loans)):
				actual = loans[i]
				expected = test['expected_loans'][i]
				self.assertAlmostEqual(float(expected.amount), float(actual.amount))
				self.assertEqual(expected.payment_status, actual.payment_status)

	def test_schedule_payment_reverse_draft_ach(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 30.1,
				'payment_method': 'reverse_draft_ach',
				'loan_amounts': [20.1, 30.1],
				'expected_loans': [
					models.Loan(
						amount=decimal.Decimal(20.1),
						payment_status=PaymentStatusEnum.SCHEDULED
					),
					models.Loan(
						amount=decimal.Decimal(30.1),
						payment_status=PaymentStatusEnum.SCHEDULED
					)
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_notify_payment(self) -> None:
		tests: List[Dict] = [
			{
				'payment_amount': 40.1,
				'payment_method': 'ach',
				'loan_amounts': [30.1, 40.1],
				'expected_loans': [
					models.Loan(
						amount=decimal.Decimal(30.1),
						payment_status=PaymentStatusEnum.PENDING
					),
					models.Loan(
						amount=decimal.Decimal(40.1),
						payment_status=PaymentStatusEnum.PENDING
					)
				]
			}
		]
		for test in tests:
			self._run_test(test)

	def test_missing_loans(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		user_id = seed.get_user_id('company_admin', index=0)
		payment_id, err = repayment_util.create_repayment(
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

		payment_id, err = repayment_util.create_repayment(
			company_id=company_id,
			payment_insert_input=None,
			loan_ids=[loan_id],
			user_id=user_id,
			session_maker=self.session_maker)
		self.assertIn('are funded', err.msg)
