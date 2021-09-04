import datetime
import decimal
import json
import uuid
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import repayment_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.payments import payment_test_helper
from bespoke.finance.types import payment_types

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

class TestUndoRepayment(db_unittest.TestCase):

	def test_undo_and_delete_loan_with_spawned_payments(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		l: Dict = {
			'amount': 100.0,
			'origination_date': '10/1/2020',
			'maturity_date': '10/30/2020',
			'outstanding_principal_balance': 20.0,
			'outstanding_interest': 0.0,
			'outstanding_fees': 0.0
		}

		with session_scope(session_maker) as session:
			contract = _get_contract(company_id, is_line_of_credit=False)
			contract_test_helper.set_and_add_contract_for_company(contract, company_id, session)

			loan = models.Loan(
				company_id=str(company_id),
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
			loan_ids = [str(loan.id)]

			payment_test_helper.make_advance(
				session, loan, 20.0, payment_date='10/1/2020', effective_date='10/1/2020')

		user_id = seed.get_user_id('company_admin', index=0)


		items_covered = payment_types.PaymentItemsCoveredDict(
			loan_ids=loan_ids,
			requested_to_account_fees=0.0,
			to_account_fees=0.0,
			to_user_credit=0.0,
		)
		# Make sure we have a payment already registered in the system that we are settling.
		with session_scope(self.session_maker) as session:
			payment_id, err = repayment_util.create_repayment(
				company_id=str(company_id),
				payment_insert_input=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=number_util.round_currency(0.5),
					amount=None,
					requested_payment_date='10/10/2020',
					payment_date=None,
					settlement_date='10/10/2020', # unused
					items_covered=items_covered,
					company_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				user_id=user_id,
				session=session,
				is_line_of_credit=False)

			self.assertIsNone(err)

		req = repayment_util.SettleRepaymentReqDict(
			company_id=company_id,
			payment_id=payment_id,
			amount=number_util.round_currency(0.5),
			deposit_date='10/10/2020',
			settlement_date='10/10/2020',
			items_covered=items_covered,
			transaction_inputs=[
				{
					'amount': 0.5,
					'to_principal': 0.5,
					'to_interest': 0.0,
					'to_fees': 0.0,
				},
			],
		)
		bank_admin_user_id = seed.get_user_id('company_admin', index=0)
		_, err = repayment_util.settle_repayment(
			req=req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False,
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			for loan in loans:
				self.assertEqual(PaymentStatusEnum.PARTIALLY_PAID, loan.payment_status)

		_, err = repayment_util.settle_repayment(
			req=req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False,
		)
		# You cant settle a repayment twice
		self.assertIsNotNone(err)

		undo_req = repayment_util.UndoRepaymentReqDict(
			company_id=company_id,
			payment_id=payment_id
		)
		success, err = repayment_util.undo_repayment(
			req=undo_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			for loan in loans:
				# Loans now have payment status pending because the payment unsettled
				# above is pending settlement (since it was just unsettled).
				self.assertEqual(PaymentStatusEnum.PENDING, loan.payment_status)

		_, err = repayment_util.settle_repayment(
			req=req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False,
		)
		# You can settle the repayment because it was unsettled right before
		self.assertIsNone(err)

		delete_req = repayment_util.DeleteRepaymentReqDict(
			payment_id=payment_id
		)
		success, err = repayment_util.delete_repayment(
			req=delete_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		# You cant delete a repayment until it is unsettled
		self.assertIsNotNone(err)

		success, err = repayment_util.undo_repayment(
			req=undo_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		success, err = repayment_util.delete_repayment(
			req=delete_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		# Now you can delete the repayment
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			for loan in loans:
				# Loans now have payment status None because there are no payments
				# intending to pay for them.
				self.assertEqual(None, loan.payment_status)

class TestReverseRepayment(db_unittest.TestCase):

	def test_reverse_repayment_on_closed_loan(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		l: Dict = {
			'amount': 100.0,
			'origination_date': '10/1/2020',
			'maturity_date': '10/30/2020',
			'outstanding_principal_balance': 100.0,
			'outstanding_interest': 0.0,
			'outstanding_fees': 0.0
		}

		with session_scope(session_maker) as session:
			contract = _get_contract(company_id, is_line_of_credit=False)
			contract_test_helper.set_and_add_contract_for_company(contract, company_id, session)

			loan = models.Loan(
				company_id=str(company_id),
				amount=decimal.Decimal(l['amount']),
				origination_date=date_util.load_date_str(l['origination_date']),
				maturity_date=date_util.load_date_str(l['maturity_date']),
				adjusted_maturity_date=date_util.load_date_str(l['maturity_date']),
				outstanding_principal_balance=decimal.Decimal(l['outstanding_principal_balance']),
				outstanding_interest=decimal.Decimal(l['outstanding_interest']),
				outstanding_fees=decimal.Decimal(l['outstanding_fees']),
				approved_at=date_util.now(),
				funded_at=date_util.now(),
			)
			session.add(loan)
			session.flush()
			loan_ids = [str(loan.id)]

			payment_test_helper.make_advance(
				session,
				loan,
				100.0,
				payment_date='10/1/2020',
				effective_date='10/1/2020',
			)

		user_id = seed.get_user_id('company_admin', index=0)

		items_covered = payment_types.PaymentItemsCoveredDict(
			loan_ids=loan_ids,
			requested_to_account_fees=0.0,
			to_account_fees=0.0,
			to_user_credit=0.0,
		)
		# Make sure we have a payment already registered in the system that we are settling.
		with session_scope(self.session_maker) as session:
			payment_id, err = repayment_util.create_repayment(
				company_id=str(company_id),
				payment_insert_input=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					method='ach',
					requested_amount=number_util.round_currency(0.5),
					amount=None,
					requested_payment_date='10/02/2020',
					payment_date=None,
					settlement_date='10/02/2020', # unused
					items_covered=items_covered,
					company_bank_account_id=None,
					customer_note='',
					bank_note=''
				),
				user_id=user_id,
				session=session,
				is_line_of_credit=False)
			self.assertIsNone(err)

		req = repayment_util.SettleRepaymentReqDict(
			company_id=company_id,
			payment_id=payment_id,
			amount=number_util.round_currency(100 + 0.4),
			deposit_date='10/02/2020',
			settlement_date='10/02/2020',
			items_covered=items_covered,
			transaction_inputs=[
				{
					'amount': 100.0 + 0.4,
					'to_principal': 100.0,
					'to_interest': 0.4,
					'to_fees': 0.0,
				},
			],
		)
		bank_admin_user_id = seed.get_user_id('company_admin', index=0)
		_, err = repayment_util.settle_repayment(
			req=req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker,
			is_line_of_credit=False,
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			for loan in loans:
				self.assertIsNone(loan.closed_at)
				self.assertEqual(PaymentStatusEnum.CLOSING, loan.payment_status)

		reverse_req = repayment_util.ReverseRepaymentReqDict(
			company_id=company_id,
			payment_id=payment_id
		)

		success, err = repayment_util.reverse_repayment(
			req=reverse_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			repayment = cast(
				models.Payment,
				session.query(models.Payment).get(payment_id))

			self.assertIsNone(repayment.settled_at)
			self.assertIsNotNone(repayment.reversed_at)

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			for loan in loans:
				self.assertIsNone(loan.closed_at)
				self.assertEqual(None, loan.payment_status)
