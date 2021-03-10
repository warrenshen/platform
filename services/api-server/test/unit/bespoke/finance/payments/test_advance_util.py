import datetime
import decimal
import uuid
from typing import Dict, List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import LoanStatusEnum, LoanTypeEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import advance_util, payment_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper


def _get_default_contract(
	use_preceeding_business_day: bool,
	days_until_repayment: int
) -> models.Contract:
	return models.Contract(
		product_type=ProductType.INVENTORY_FINANCING,
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.INVENTORY_FINANCING,
			input_dict=ContractInputDict(
				interest_rate=0.05,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=days_until_repayment,
				late_fee_structure='', # unused
				preceeding_business_day=use_preceeding_business_day
			)
		)
	)

def _get_line_of_credit_contract() -> models.Contract:
	return models.Contract(
		product_type=ProductType.LINE_OF_CREDIT,
		start_date=date_util.load_date_str('10/01/2020'),
		end_date=date_util.load_date_str('12/31/2020'),
		adjusted_end_date=date_util.load_date_str('12/31/2020'),
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.LINE_OF_CREDIT,
			input_dict=ContractInputDict(
				interest_rate=0.05,
				maximum_principal_amount=120000,
				borrowing_base_accounts_receivable_percentage=100.0,
				borrowing_base_inventory_percentage=100.0,
				borrowing_base_cash_percentage=100.0
			)
		)
	)

class TestFundLoansWithAdvance(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		contracts_by_company_index = test['contracts_by_company_index']
		input_loans = test['loans']
		company_indices = test['company_indices']
		payment_amount = test['payment_input_amount']
		purchase_orders = test.get("purchase_orders", [])
		bank_admin_user_id = seed.get_user_id('bank_admin')

		loan_ids = []
		with session_scope(session_maker) as session:
			# NOTE: Assume the last contract is the most up-to-date contract
			for company_index, contracts in contracts_by_company_index.items():
				company_id = seed.get_company_id('company_admin', index=company_index)
				cur_contract_ids = []
				for contract in contracts:
					contract.company_id = company_id
					session.add(contract)
					session.flush()
					cur_contract_ids.append(str(contract.id))

				# Assign this company their contract
				cur_company = cast(
					models.Company,
					session.query(models.Company).filter(models.Company.id==company_id).first())
				cur_company.contract_id = cur_contract_ids[-1]
				session.flush()

			for purchase_order in purchase_orders:
				po = models.PurchaseOrder(
					id=purchase_order["id"],
					amount=purchase_order["amount"],
				)
				session.add(po)
				session.flush()

			for i in range(len(input_loans)):
				amount = input_loans[i]['amount']
				loan_type = input_loans[i].get("loan_type", LoanTypeEnum.INVENTORY)
				artifact_id = input_loans[i].get("artifact_id", None)
				index = company_indices[i]
				company_id = seed.get_company_id('company_admin', index=index)
				loan = models.Loan(
					company_id=company_id,
					amount=decimal.Decimal(amount),
					loan_type=loan_type,
					artifact_id=artifact_id,
					approved_at=date_util.now()
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		payment_date = test['payment_date']
		settlement_date = test['settlement_date']

		req = advance_util.FundLoansReqDict(
			loan_ids=loan_ids,
			payment=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=payment_amount,
				method='ach',
				payment_date=payment_date,
				settlement_date=settlement_date,
				items_covered={'loan_ids': loan_ids},
			)
		)

		resp, err = advance_util.fund_loans_with_advance(
			req=req,
			bank_admin_user_id=bank_admin_user_id,
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

			for i in range(len(test['expected_loans'])):
				expected_loan = test['expected_loans'][i]
				loan = loans[i]
				company_id = seed.get_company_id('company_admin', index=company_indices[i])
				self.assertEqual(company_id, loan.company_id)
				self.assertAlmostEqual(expected_loan['amount'], float(loan.amount))
				self.assertAlmostEqual(expected_loan['amount'], float(loan.outstanding_principal_balance))
				self.assertEqual(expected_loan['maturity_date'],
												 date_util.date_to_str(loan.maturity_date))
				self.assertEqual(expected_loan['adjusted_maturity_date'],
												 date_util.date_to_str(loan.adjusted_maturity_date))
				self.assertAlmostEqual(0.0, float(loan.outstanding_interest))
				self.assertAlmostEqual(0.0, float(loan.outstanding_fees))

				self.assertIsNotNone(loan.funded_at)
				self.assertEqual(bank_admin_user_id, loan.funded_by_user_id)

			# Validate payments
			payments = cast(
				List[models.Payment],
				session.query(models.Payment).all())
			payments = [payment for payment in payments]
			payments.sort(key=lambda p: p.amount)

			self.assertEqual(len(test['expected_payments']), len(payments))
			for i in range(len(test['expected_payments'])):
				payment = payments[i]
				exp_payment = test['expected_payments'][i]
				exp_company_id = seed.get_company_id('company_admin', index=exp_payment['company_index'])
				self.assertAlmostEqual(exp_payment['amount'], float(payment.amount))
				self.assertEqual('advance', payment.type)
				self.assertEqual(exp_company_id, payment.company_id)
				self.assertEqual('ach', payment.method)
				self.assertIsNotNone(payment.settled_at)
				self.assertIsNotNone(payment.submitted_at)
				self.assertEqual(payment_date, date_util.date_to_str(payment.payment_date))
				self.assertEqual(settlement_date, date_util.date_to_str(payment.settlement_date))
				self.assertEqual(bank_admin_user_id, payment.settled_by_user_id)
				self.assertEqual(bank_admin_user_id, payment.submitted_by_user_id)

			# Validate transactions
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).all())
			transactions = [t for t in transactions]
			self.assertEqual(len(test['expected_transactions']), len(transactions))

			transactions.sort(key=lambda t: t.amount) # sort in increasing amounts to match order of transactions array

			for i in range(len(test['expected_transactions'])):
				transaction = transactions[i]
				exp_transaction = test['expected_transactions'][i]
				exp_company_id = seed.get_company_id('company_admin', index=exp_payment['company_index'])
				matching_loan = loans[exp_transaction['loan_index']]
				matching_payment = payments[exp_transaction['payment_index']]

				self.assertAlmostEqual(exp_transaction['amount'], float(transaction.amount))
				self.assertEqual('advance', transaction.type)
				self.assertAlmostEqual(exp_transaction['amount'], float(transaction.to_principal))
				self.assertAlmostEqual(0.0, float(transaction.to_interest))
				self.assertAlmostEqual(0.0, float(transaction.to_fees))
				self.assertEqual(matching_payment.settlement_date, transaction.effective_date)
				self.assertEqual(matching_loan.id, transaction.loan_id)
				self.assertEqual(matching_payment.id, transaction.payment_id)
				self.assertEqual(bank_admin_user_id, transaction.created_by_user_id)

			for purchase_order_id in test.get('expected_funded_purchase_order_ids', []):
				po = session.query(models.PurchaseOrder).get(purchase_order_id)
				self.assertIsNotNone(po.funded_at)

			for purchase_order_id in test.get('expected_unfunded_purchase_order_ids', []):
				po = session.query(models.PurchaseOrder).get(purchase_order_id)
				self.assertIsNone(po.funded_at)

	def test_successful_advance_one_customer(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20
						)
					]
				},
				'loans': [
					{
						'amount': 10.01,
					},
					{
						'amount': 20.02,
					}
				],
				'payment_date': '10/18/2020',
				'settlement_date':  '10/20/2020',
				'company_indices': [0, 0],
				'payment_input_amount': 30.03,
				'expected_loans': [
					{
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'amount': 30.03,
						'company_index': 0
					}
				],
				'expected_transactions': [
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
				],
			}
		]

		for test in tests:
			self._run_test(test)

	def test_successful_advance_multiple_customers_at_one_time(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from many customers',
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=4
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=True,
							days_until_repayment=11
						)
					]
				},
				'loans': [
					{
						'amount': 10.01,
					},
					{
						'amount': 20.02,
					},
					{
						'amount': 30.03,
					},
					{
						'amount': 40.04,
					}
				],
				'payment_date': '10/18/2020',
				'settlement_date':  '10/20/2020',
				'company_indices': [0, 1, 0, 1],
				'payment_input_amount': 10.01 + 20.02 + 30.03 + 40.04,
				'expected_loans': [
					{
						'amount': 10.01,
						'maturity_date': '10/24/2020', # Saturday
						'adjusted_maturity_date': '10/26/2020' # skip from Saturday to Monday
					},
					{
						'amount': 20.02,
						'maturity_date': '10/31/2020', # Saturday
						'adjusted_maturity_date': '10/30/2020' # because use_preceeding_business_day=True
					},
					{
						'amount': 30.03,
						'maturity_date': '10/24/2020', # Saturday
						'adjusted_maturity_date': '10/26/2020' # skip from Saturday to Monday
					},
					{
						'amount': 40.04,
						'maturity_date': '10/31/2020', # Saturday
						'adjusted_maturity_date': '10/30/2020' # because use_preceeding_business_day=True
					}
				],
				'expected_payments': [
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
				'expected_transactions': [
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

	def test_successful_advance_line_of_credit_loan(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Tests that an advance on a line of credit loan results in a maturity date based on adjusted end date of active contract of customer',
				'contracts_by_company_index': {
					0: [
						_get_line_of_credit_contract()
					],
				},
				'loans': [
					{
						'amount': 10.01,
					},
				],
				'payment_date': '10/18/2020',
				'settlement_date':  '10/20/2020',
				'company_indices': [0],
				'payment_input_amount': 10.01,
				'expected_loans': [
					{
						'amount': 10.01,
						'maturity_date': '12/31/2020',
						'adjusted_maturity_date': '12/31/2020'
					}
				],
				'expected_payments': [
					{
						'amount': 10.01,
						'company_index': 0
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0
					}
				],
			}
		]

		for test in tests:
			self._run_test(test)

	def test_failure_advance_no_loans(self) -> None:
		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				loan_ids=[],
				payment=None
			),
			bank_admin_user_id='',
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
				amount=decimal.Decimal(24.0),
				approved_at=date_util.now()
			)
			session.add(loan)
			session.flush()
			loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=None,
				loan_ids=loan_ids
			),
			bank_admin_user_id='',
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
				funded_at=date_util.now(),
				approved_at=date_util.now()
			)
			session.add(loan)
			session.flush()
			loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=None,
				loan_ids=loan_ids
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('already been funded', err.msg)

	def test_failure_advance_some_not_approved(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loan_ids = []
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
			req=advance_util.FundLoansReqDict(
				payment=None,
				loan_ids=loan_ids
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('not approved', err.msg)

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
					amount=decimal.Decimal(amount),
					approved_at=date_util.now()
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=payment_util.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					amount=0.2,
					method='ach',
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={'loan_ids': loan_ids},
			  	),
				loan_ids=loan_ids
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('exactly', err.msg)

	def test_successful_purchase_order_fully_funded(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20
						)
					]
				},
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'amount': 30.03,
					}
				],
				'loans': [
					{
						'amount': 10.01,
						'loan_type': LoanTypeEnum.INVENTORY,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'loan_type': LoanTypeEnum.INVENTORY,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'payment_date': '10/18/2020',
				'settlement_date':  '10/20/2020',
				'company_indices': [0, 0],
				'payment_input_amount': 30.03,
				'expected_loans': [
					{
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'amount': 30.03,
						'company_index': 0
					}
				],
				'expected_transactions': [
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
				],
				'expected_funded_purchase_order_ids': [
					'a012e58e-6378-450c-a753-943533f7ae88',
				]
			}
		]

		for test in tests:
			self._run_test(test)


	def test_successful_purchase_order_one_funded_one_not(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20
						)
					]
				},
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'amount': 10.01,
					},
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae89',
						'amount': 30.03,
					}
				],
				'loans': [
					{
						'amount': 10.01,
						'loan_type': LoanTypeEnum.INVENTORY,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'loan_type': LoanTypeEnum.INVENTORY,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae89',
					}
				],
				'payment_date': '10/18/2020',
				'settlement_date':  '10/20/2020',
				'company_indices': [0, 0],
				'payment_input_amount': 30.03,
				'expected_loans': [
					{
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'amount': 30.03,
						'company_index': 0
					}
				],
				'expected_transactions': [
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
				],
				'expected_funded_purchase_order_ids': [
					'a012e58e-6378-450c-a753-943533f7ae88',
				],
				'expected_unfunded_purchase_order_ids': [
					'a012e58e-6378-450c-a753-943533f7ae89',
				]
			}
		]

		for test in tests:
			self._run_test(test)
