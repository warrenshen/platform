import datetime
import decimal
import uuid
from typing import Dict, List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (LoanTypeEnum,
                                     PaymentMethodEnum, ProductType)
from bespoke.db.models import session_scope
from bespoke.finance.payments import advance_util
from bespoke.finance.types import payment_types
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper

TODAY = datetime.date.today()

def _get_default_contract(
	use_preceeding_business_day: bool,
	days_until_repayment: int,
	wire_fee: float = 0.0
) -> models.Contract:
	return models.Contract(
		product_type=ProductType.INVENTORY_FINANCING,
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.INVENTORY_FINANCING,
			input_dict=ContractInputDict(
				wire_fee=wire_fee,
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
				borrowing_base_cash_percentage=100.0,
				borrowing_base_cash_in_daca_percentage=0.0,
			)
		)
	)

def _get_dispensary_contract(
	use_preceeding_business_day: bool,
	days_until_repayment: int,
	wire_fee: float = 0.0
) -> models.Contract:
	return models.Contract(
		product_type=ProductType.DISPENSARY_FINANCING,
		start_date=date_util.load_date_str('10/01/2020'),
		end_date=date_util.load_date_str('12/31/2020'),
		adjusted_end_date=date_util.load_date_str('12/31/2020'),
		product_config=contract_test_helper.create_contract_config(
			product_type=ProductType.DISPENSARY_FINANCING,
			input_dict=ContractInputDict(
				wire_fee=wire_fee,
				interest_rate=0.05,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=days_until_repayment,
				late_fee_structure='', # unused
				preceeding_business_day=use_preceeding_business_day
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
		company_settings_by_company_index = test.get('company_settings_by_company_index', None)
		input_loans = test['loans']
		company_indices = test['company_indices']
		vendors = test.get("vendors", [])
		purchase_orders = test.get("purchase_orders", [])
		line_of_credits = test.get("line_of_credits", [])
		financial_summaries = test.get("financial_summaries", [])
		bank_admin_user_id = seed.get_user_id('bank_admin')

		company_ids = []
		loan_ids = []
		with session_scope(session_maker) as session:
			# NOTE: Assume the last contract is the most up-to-date contract
			for company_index, contracts in contracts_by_company_index.items():
				company_id = seed.get_company_id('company_admin', index=company_index)
				company_ids += [company_id]
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

			if company_settings_by_company_index:
				for company_index, company_settings in company_settings_by_company_index.items():
					company_id = seed.get_company_id('company_admin', index=company_index)
					cs = cast(
						models.CompanySettings,
						session.query(models.CompanySettings).filter_by(
							company_id=company_id
						).first())
					cs.advances_bespoke_bank_account_id = company_settings.get('advances_bespoke_bank_account_id')
					cs.advances_bank_account_id = company_settings.get('advances_bank_account_id')
					session.flush()

			for vendor in vendors:
				v = models.Company(
					id=vendor["id"],
					is_vendor=True,
				)
				session.add(v)
				session.flush()

				vendor_id = str(v.id)
				company_vendor_partnership = models.CompanyVendorPartnership(
					company_id=company_ids[vendor["company_index"]],
					vendor_id=vendor_id,
					vendor_bank_id=vendor["vendor_bank_id"],
				)
				session.add(company_vendor_partnership)
				session.flush()

			for purchase_order in purchase_orders:
				po = models.PurchaseOrder( # type: ignore
					id=purchase_order["id"],
					vendor_id=purchase_order["vendor_id"],
					amount=purchase_order["amount"],
					history=[],
				)
				session.add(po)
				session.flush()

			for line_of_credit in line_of_credits:
				loc = models.LineOfCredit(
					id=line_of_credit["id"],
				)
				session.add(loc)
				session.flush()

			for summary in financial_summaries:
				local_company_index = summary["company_index"] if "company_index" in summary else 0
				fs = models.FinancialSummary(
					date=summary["date"],
					company_id=seed.get_company_id('company_admin', index=local_company_index),
					total_limit=summary["total_limit"],
					adjusted_total_limit=summary["adjusted_total_limit"],
					total_outstanding_principal=summary["total_outstanding_principal"],
					total_outstanding_principal_for_interest=summary["total_outstanding_principal_for_interest"],
					total_outstanding_interest=summary["total_outstanding_interest"],
					total_outstanding_fees=summary["total_outstanding_fees"],
					total_principal_in_requested_state=summary["total_principal_in_requested_state"],
					available_limit=summary["available_limit"],
					interest_accrued_today=summary["interest_accrued_today"],
					late_fees_accrued_today=summary["late_fees_accrued_today"],
					minimum_monthly_payload=summary["minimum_monthly_payload"],
					account_level_balance_payload=summary["account_level_balance_payload"],
					product_type=summary["product_type"],
					loans_info={}
				)
				session.add(fs)
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

		for advance in test['advances']:
			payment_date = advance['payment_date']
			settlement_date = advance['settlement_date']
			loan_indices = advance['loan_indices']
			bank_note = advance.get('bank_note')
			advance_loan_ids = [loan_ids[loan_index] for loan_index in loan_indices]

			req = advance_util.FundLoansReqDict(
				loan_ids=advance_loan_ids,
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					requested_amount=None,
					amount=advance['payment_input_amount'],
					method=advance['payment_method'] if 'payment_method' in advance else PaymentMethodEnum.ACH,
					requested_payment_date=None,
					payment_date=payment_date,
					settlement_date=settlement_date,
					items_covered={'loan_ids': advance_loan_ids},
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=bank_note
				),
				should_charge_wire_fee=advance['should_charge_wire_fee']
			)

			resp, err = advance_util.fund_loans_with_advance(
				req=req,
				bank_admin_user_id=bank_admin_user_id,
				session_maker=session_maker
			)

		if test.get('in_err_msg'):
			self.assertIn(test['in_err_msg'], err.msg)
			return
		else:
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

				self.assertEqual(company_id, str(loan.company_id))
				self.assertEqual(expected_loan['disbursement_identifier'], loan.disbursement_identifier)
				self.assertAlmostEqual(expected_loan['amount'], float(loan.amount))
				self.assertAlmostEqual(expected_loan['amount'], float(loan.outstanding_principal_balance))
				self.assertEqual(
					expected_loan['maturity_date'],
					date_util.date_to_str(loan.maturity_date),
				)
				self.assertEqual(
					expected_loan['adjusted_maturity_date'],
					date_util.date_to_str(loan.adjusted_maturity_date),
				)
				self.assertAlmostEqual(0.0, float(loan.outstanding_interest))
				self.assertAlmostEqual(0.0, float(loan.outstanding_fees))

				self.assertIsNotNone(loan.funded_at)
				self.assertEqual(bank_admin_user_id, str(loan.funded_by_user_id))

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
				self.assertEqual(
					exp_payment['settlement_identifier'] if 'settlement_identifier' in exp_payment else None,
					payment.settlement_identifier,
				)
				self.assertAlmostEqual(exp_payment['amount'], float(payment.amount))
				self.assertEqual(exp_payment['type'], payment.type)
				self.assertEqual(exp_company_id, str(payment.company_id))

				if exp_payment['type'] == 'advance':
					self.assertEqual(exp_payment['method'] if 'method' in exp_payment else PaymentMethodEnum.ACH, payment.method)
					self.assertEqual(payment_date, date_util.date_to_str(payment.payment_date))
					self.assertEqual(settlement_date, date_util.date_to_str(payment.deposit_date))
					self.assertEqual(
						exp_payment.get('recipient_bank_account_id'),
						str(payment.recipient_bank_account_id) if payment.recipient_bank_account_id else None,
					)
					self.assertEqual(exp_payment.get('bank_note'), payment.bank_note)
				else:
					# No payment method associated with fees or credits
					self.assertEqual('', payment.method)
					# Fee does not have payment date.
					# Fee settlement date is the same as advance settlement date
					self.assertEqual(settlement_date, date_util.date_to_str(payment.deposit_date))

				self.assertIsNotNone(payment.settled_at)
				self.assertIsNotNone(payment.submitted_at)
				# For advances, deposit date is always equal to the settlement date.
				self.assertEqual(settlement_date, date_util.date_to_str(payment.settlement_date))
				self.assertEqual(bank_admin_user_id, str(payment.settled_by_user_id))
				self.assertEqual(bank_admin_user_id, str(payment.submitted_by_user_id))

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

				self.assertAlmostEqual(exp_transaction['amount'], float(transaction.amount))
				self.assertEqual(exp_transaction['type'], transaction.type)
				self.assertEqual(exp_transaction.get('subtype'), transaction.subtype)

				if transaction.type == 'fee':
					self.assertAlmostEqual(0.0, float(transaction.to_principal))
				else:
					self.assertAlmostEqual(exp_transaction['amount'], float(transaction.to_principal))

				self.assertAlmostEqual(0.0, float(transaction.to_interest))
				self.assertAlmostEqual(0.0, float(transaction.to_fees))

				loan_index = exp_transaction['loan_index']
				if loan_index is None:
					self.assertIsNone(transaction.loan_id)
				else:
					matching_loan = loans[loan_index]
					self.assertEqual(matching_loan.id, transaction.loan_id)

				matching_payment = payments[exp_transaction['payment_index']]
				self.assertEqual(matching_payment.settlement_date, transaction.effective_date)
				self.assertEqual(matching_payment.id, transaction.payment_id)

				self.assertEqual(bank_admin_user_id, str(transaction.created_by_user_id))

			for purchase_order_id in test.get('expected_funded_purchase_order_ids', []):
				po = session.query(models.PurchaseOrder).get(purchase_order_id)
				self.assertIsNotNone(po.funded_at)

			for purchase_order_id in test.get('expected_unfunded_purchase_order_ids', []):
				po = session.query(models.PurchaseOrder).get(purchase_order_id)
				self.assertIsNone(po.funded_at)

	def test_successful_advance_one_customer_with_wire_fee(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
						'advances_bank_account_id': 'cc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=50.0,
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=60.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 40.04,
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': True,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					},
					{
						'amount': 50.00,
						'company_index': 0,
						'type': 'fee'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 50.00,
						'loan_index': None,
						'payment_index': 1,
						'type': 'fee',
						'subtype': 'wire_fee'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)

	def test_successful_advance_with_custom_bank_note(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test an advance for multiple loans with a custom bank note',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
						'advances_bank_account_id': 'cc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=50.0,
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=60.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 40.04,
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': False,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'bank_note': 'Sample memo',
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'Sample memo'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
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
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
					1: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=4,
							wire_fee=50.0
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=11,
							wire_fee=60.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'id': 'd012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 1,
						'vendor_bank_id': 'ea12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 40.04,
					},
					{
						'id': 'b012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'd012e58e-6378-450c-a753-943533f7ae88',
						'amount': 60.06,
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'b012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 30.03,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 40.04,
						'artifact_id': 'b012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 1, 0, 1],
				'advances': [
					{
						'should_charge_wire_fee': True,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 10.01 + 20.02 + 30.03 + 40.04,
						'loan_indices': [0, 1, 2, 3]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/24/2020', # Saturday
						'adjusted_maturity_date': '10/26/2020' # skip from Saturday to Monday
					},
					{
						'disbursement_identifier': '1A',
						'amount': 20.02,
						'maturity_date': '10/31/2020', # Saturday
						'adjusted_maturity_date': '11/02/2020' # because use_preceeding_business_day=False
					},
					{
						'disbursement_identifier': '1B',
						'amount': 30.03,
						'maturity_date': '10/24/2020', # Saturday
						'adjusted_maturity_date': '10/26/2020' # skip from Saturday to Monday
					},
					{
						'disbursement_identifier': '1B',
						'amount': 40.04,
						'maturity_date': '10/31/2020', # Saturday
						'adjusted_maturity_date': '11/02/2020' # because use_preceeding_business_day=False
					}
				],
				'expected_payments': [
					# We create two payments, one for each customer, plus the payments for the wire fees
					{
						'settlement_identifier': '1',
						'amount': 10.01 + 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					},
					{
						'amount': 50.00,
						'company_index': 0,
						'type': 'fee'
					},
					{
						'amount': 60.00,
						'company_index': 1,
						'type': 'fee'
					},
					{
						'settlement_identifier': '1',
						'amount': 20.02 + 40.04,
						'company_index': 1,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ea12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					}
				],
				'expected_transactions': [
					# There is one transaction for each loan, but two transactions associated with each payment
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 3,
						'type': 'advance'
					},
					{
						'amount': 30.03,
						'loan_index': 2,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 40.04,
						'loan_index': 3,
						'payment_index': 3,
						'type': 'advance'
					},
					{
						'amount': 50.00,
						'loan_index': None,
						'payment_index': 1,
						'type': 'fee',
						'subtype': 'wire_fee'
					},
					{
						'amount': 60.00,
						'loan_index': None,
						'payment_index': 2,
						'type': 'fee',
						'subtype': 'wire_fee'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(10000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing',
						'company_index': 0,
					},
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(10000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing',
						'company_index': 1,
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)

	def test_successful_dispensary_financing_loan(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple dispensary loans approved from one customer',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
						'advances_bank_account_id': 'cc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_dispensary_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=50.0,
						)
					],
					1: [
						_get_dispensary_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=60.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 40.04,
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': True,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					},
					{
						'amount': 50.00,
						'company_index': 0,
						'type': 'fee'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 50.00,
						'loan_index': None,
						'payment_index': 1,
						'type': 'fee',
						'subtype': 'wire_fee'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
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
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
						'advances_bank_account_id': 'cc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_line_of_credit_contract()
					],
				},
				'line_of_credits': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'loan_type': LoanTypeEnum.LINE_OF_CREDIT,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'company_indices': [0],
				'advances': [
					{
						'should_charge_wire_fee': False,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 10.01,
						'loan_indices': [0]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1',
						'amount': 10.01,
						'maturity_date': '12/31/2020',
						'adjusted_maturity_date': '12/31/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 10.01,
						'company_index': 0,
						'type': 'advance',
						'recipient_bank_account_id': 'cc12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
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
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=0.2,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={ 'loan_ids': [] },
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				should_charge_wire_fee=False,
			),
			bank_admin_user_id='',
			session_maker=self.session_maker,
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
				loan_ids=loan_ids,
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=0.2,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={ 'loan_ids': loan_ids },
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				should_charge_wire_fee=False,
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

			financial_summary = models.FinancialSummary(
				date=TODAY,
				company_id=company_id,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(1000.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
				product_type="Inventory Financing",
				loans_info={}
			)
			session.add(financial_summary)
			session.flush()

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				loan_ids=loan_ids,
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=0.2,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={ 'loan_ids': loan_ids },
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				should_charge_wire_fee=False,
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

			financial_summary = models.FinancialSummary(
				date=TODAY,
				company_id=company_id,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(1000.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
				product_type="Inventory Financing",
				loans_info={}
			)
			session.add(financial_summary)
			session.flush()

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				loan_ids=loan_ids,
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=0.2,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={ 'loan_ids': loan_ids },
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				should_charge_wire_fee=False,
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

			financial_summary = models.FinancialSummary(
				date=TODAY,
				company_id=company_id,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(1000.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
				product_type="Inventory Financing",
				loans_info={}
			)
			session.add(financial_summary)
			session.flush()

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=0.2,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={'loan_ids': loan_ids},
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				loan_ids=loan_ids,
				should_charge_wire_fee=False,
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('Advance amount must be equal to', err.msg)

	def test_failure_advance_would_exceed_available_limit(self) -> None:
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
			
			contract_id = uuid.uuid4()
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())
			company.contract_id = contract_id

			session.add(models.Contract(
				id=contract_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						wire_fee=25.0,
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=100,
						late_fee_structure='', # unused
						preceeding_business_day=True
					)
				)
			))

			financial_summary = models.FinancialSummary(
				date=TODAY,
				company_id=company_id,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(25.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
				product_type="Inventory Financing",
				loans_info={}
			)
			session.add(financial_summary)
			session.flush()

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=50.05,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={'loan_ids': loan_ids},
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				loan_ids=loan_ids,
				should_charge_wire_fee=False,
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('Loan amount requested exceeds the maximum limit for company', err.msg)

	def test_failure_aggregate_advances_would_exceed_available_limit(self) -> None:
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		loan_ids = []
		amounts = [20.02, 7.03]
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

			contract_id = uuid.uuid4()
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())
			company.contract_id = contract_id

			session.add(models.Contract(
				id=contract_id,
				product_type=ProductType.INVENTORY_FINANCING,
				product_config=contract_test_helper.create_contract_config(
					product_type=ProductType.INVENTORY_FINANCING,
					input_dict=ContractInputDict(
						wire_fee=25.0,
						interest_rate=0.05,
						maximum_principal_amount=120000.01,
						max_days_until_repayment=100,
						late_fee_structure='', # unused
						preceeding_business_day=True
					)
				)
			))

			financial_summary = models.FinancialSummary(
				date=TODAY,
				company_id=company_id,
				total_limit=decimal.Decimal(100.0),
				adjusted_total_limit=decimal.Decimal(100.0),
				total_outstanding_principal=decimal.Decimal(50.0),
				total_outstanding_principal_for_interest=decimal.Decimal(60.0),
				total_outstanding_interest=decimal.Decimal(12.50),
				total_outstanding_fees=decimal.Decimal(5.25),
				total_principal_in_requested_state=decimal.Decimal(3.15),
				available_limit=decimal.Decimal(25.00),
				interest_accrued_today=decimal.Decimal(2.1),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
				product_type="Inventory Financing",
				loans_info={}
			)
			session.add(financial_summary)
			session.flush()

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=None,
					amount=27.05,
					requested_payment_date=None,
					payment_date='10/28/2020',
					settlement_date='10/30/2020',
					items_covered={'loan_ids': loan_ids},
					company_bank_account_id=None,
					recipient_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				loan_ids=loan_ids,
				should_charge_wire_fee=False,
			),
			bank_admin_user_id='',
			session_maker=self.session_maker
		)
		self.assertIn('Total amount across all loans in request exceeds the maximum limit for company', err.msg)

	def test_successful_purchase_order_fully_funded(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
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
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
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
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': False,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					}
				],
				'expected_funded_purchase_order_ids': [
					'a012e58e-6378-450c-a753-943533f7ae88',
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)


	def test_successful_purchase_order_one_funded_one_not(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
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
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 10.01,
					},
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae89',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
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
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': False,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
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

	def test_successful_advance_skip_zero_wire_fee(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Tests that a wire fee is not created if the wire fee value in contract is zero',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=0.0,
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=0.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 40.04,
					},
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': True,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1A,D0-1B'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)

	def test_failure_wire_fee_but_not_wire_method(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Tests that it is invalid to try to charge a wire fee if payment method is not Wire',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=50.0,
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=60.0
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
				'company_indices': [0, 0],
				'advances': [
					{
						'should_charge_wire_fee': True,
						'payment_method': PaymentMethodEnum.ACH, # This is wrong, it conflicts with should_charge_wire_fee.
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03,
						'loan_indices': [0, 1]
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1A',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '1B',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 30.03,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
					},
					{
						'amount': 50.00,
						'company_index': 0,
						'type': 'fee'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 50.00,
						'loan_index': None,
						'payment_index': 1,
						'type': 'fee',
						'subtype': 'wire_fee'
					}
				],
				'in_err_msg': 'Cannot charge wire fee if payment method is not Wire',
			}
		]

		for test in tests:
			self._run_test(test)

	def test_successful_multiple_advances_one_customer(self) -> None:
		tests: List[Dict] = [
			{
				'comment': 'Test multiple loans approved from one customer',
				'company_settings_by_company_index': {
					0: {
						'advances_bespoke_bank_account_id': 'dc12e58e-6378-450c-a753-943533f7ae88',
					},
				},
				'contracts_by_company_index': {
					0: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=10,
							wire_fee=50.0,
						)
					],
					1: [
						_get_default_contract(
							use_preceeding_business_day=False,
							days_until_repayment=20,
							wire_fee=60.0
						)
					]
				},
				'vendors': [
					{
						'id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'company_index': 0,
						'vendor_bank_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
					},
				],
				'purchase_orders': [
					{
						'id': 'a012e58e-6378-450c-a753-943533f7ae88',
						'vendor_id': 'c012e58e-6378-450c-a753-943533f7ae88',
						'amount': 100.10,
					}
				],
				'loans': [
					{
						'amount': 10.01,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 20.02,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 30.03,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					},
					{
						'amount': 40.04,
						'artifact_id': 'a012e58e-6378-450c-a753-943533f7ae88',
					}
				],
				'company_indices': [0, 0, 0, 0],
				'advances': [
					{
						'should_charge_wire_fee': False,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 10.01,
						'loan_indices': [0],
					},
					{
						'should_charge_wire_fee': False,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 20.02,
						'loan_indices': [1],
					},
					{
						'should_charge_wire_fee': False,
						'payment_method': PaymentMethodEnum.WIRE,
						'payment_date': '10/18/2020',
						'settlement_date': '10/20/2020',
						'payment_input_amount': 30.03 + 40.04,
						'loan_indices': [2, 3],
					}
				],
				'expected_loans': [
					{
						'disbursement_identifier': '1',
						'amount': 10.01,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '2',
						'amount': 20.02,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '3A',
						'amount': 30.03,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					},
					{
						'disbursement_identifier': '3B',
						'amount': 40.04,
						'maturity_date': '10/30/2020',
						'adjusted_maturity_date': '10/30/2020'
					}
				],
				'expected_payments': [
					{
						'settlement_identifier': '1',
						'amount': 10.01,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-1'
					},
					{
						'settlement_identifier': '2',
						'amount': 20.02,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-2'
					},
					{
						'settlement_identifier': '3',
						'amount': 30.03 + 40.04,
						'company_index': 0,
						'type': 'advance',
						'method': PaymentMethodEnum.WIRE,
						'recipient_bank_account_id': 'ba12e58e-6378-450c-a753-943533f7ae88',
						'bank_note': 'D0-3A,D0-3B'
					}
				],
				'expected_transactions': [
					{
						'amount': 10.01,
						'loan_index': 0,
						'payment_index': 0,
						'type': 'advance'
					},
					{
						'amount': 20.02,
						'loan_index': 1,
						'payment_index': 1,
						'type': 'advance'
					},
					{
						'amount': 30.03,
						'loan_index': 2,
						'payment_index': 2,
						'type': 'advance'
					},
					{
						'amount': 40.04,
						'loan_index': 3,
						'payment_index': 2,
						'type': 'advance'
					}
				],
				'financial_summaries': [
					{
						'date': TODAY,
						'company_id': 'placeholder', # later filled by seed function inside run_tests
						'total_limit': decimal.Decimal(100.0),
						'adjusted_total_limit': decimal.Decimal(100.0),
						'total_outstanding_principal': decimal.Decimal(50.0),
						'total_outstanding_principal_for_interest': decimal.Decimal(60.0),
						'total_outstanding_interest': decimal.Decimal(12.50),
						'total_outstanding_fees': decimal.Decimal(5.25),
						'total_principal_in_requested_state': decimal.Decimal(3.15),
						'available_limit': decimal.Decimal(1000.00),
						'interest_accrued_today': decimal.Decimal(2.1),
						'late_fees_accrued_today': decimal.Decimal(0.0),
						'minimum_monthly_payload': {},
						'account_level_balance_payload': {},
						'product_type': 'Inventory Financing'
					}
				]
			}
		]

		for test in tests:
			self._run_test(test)
