import datetime
import decimal
import json
import uuid
from dateutil import parser
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models, model_types
from bespoke.db.db_constants import (PaymentMethodEnum, PaymentStatusEnum,
                                     ProductType, MinimumAmountDuration)
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.payments import fees_due_util, payment_util

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.finance import finance_test_helper
from bespoke_test.payments import payment_test_helper

def _set_is_dummy_account(company_id: str, session: Session) -> None:
		company = session.query(models.Company).get(company_id)
		company_settings = session.query(models.CompanySettings).get(company.company_settings_id)
		company_settings.is_dummy_account = True
		session.commit()

class TestMinimumFeesDue(db_unittest.TestCase):
	maxDiff = None

	def test_get_all_minimum_interest_fees_due_no_fees_due_yet(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		
		with session_scope(session_maker) as session:
			summary1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/31/2020',
				company_id=seed.get_company_id('company_admin', index=0)
			)
			session.add(summary1)


		with session_scope(session_maker) as session:
			resp, err = fees_due_util.get_all_minimum_interest_fees_due(
				'1/30/2020',
				session
			)
			self.assertIsNone(err)
			self.assertDictEqual({
				'company_due_to_financial_info': {}
			}, cast(Dict, resp))

	def test_get_and_create_all_minimum_interest_fees_due(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		company_id3 = seed.get_company_id('company_admin', index=2)

		with session_scope(session_maker) as session:
			_set_is_dummy_account(company_id3, session)

			minimum_interest_info = models.MinimumInterestInfoDict(
				amount_accrued=6.0, # unused
				minimum_amount=10.0, # unused
				amount_short=4.0,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/31/2020',
				company_id=company_id,
				minimum_interest_info=minimum_interest_info
			)
			session.add(summary)

			minimum_interest_info2 = models.MinimumInterestInfoDict(
				amount_accrued=5.0, # unused
				minimum_amount=10.0, # unused
				amount_short=5.0,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary2 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='1/31/2020',
				company_id=company_id2,
				minimum_interest_info=minimum_interest_info2
			)
			session.add(summary2)

			# We should ignore this as a dummy account.
			summary3 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='1/31/2020',
				company_id=company_id3,
				minimum_interest_info=minimum_interest_info2
			)
			session.add(summary3)

		with session_scope(session_maker) as session:
			resp, err = fees_due_util.get_all_minimum_interest_fees_due(
				'1/30/2020',
				session
			)
			self.assertIsNone(err)
			self.assertDictEqual({
				'company_due_to_financial_info': {
					company_id: {
						'fee_info': minimum_interest_info,
						'company': {
							'identifier': 'D0',
							'name': 'Distributor_0',
							'id': company_id
						}
					},
					company_id2: {
						'fee_info': minimum_interest_info2,
						'company': {
							'identifier': 'D1',
							'name': 'Distributor_1',
							'id': company_id2
						}
					}
				}
			}, cast(Dict, resp))

			success, err = fees_due_util.create_minimum_due_fee_for_customers(
				date_str='1/30/2020',
				minimum_due_resp=resp,
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

		expected_payments: List[Dict] = [
			{
				'amount': 4.0,
				'company_id': company_id,
				'items_covered': {
					'effective_month': '01/2020'
				}
			},
			{
				'amount': 5.0,
				'company_id': company_id2,
				'items_covered': {
					'effective_month': '01/2020'
				}
			}
		]

		expected_txs: List[Dict] = [
			{
				'amount': 4.0,
				'company_id': company_id,
			},
			{
				'amount': 5.0,
				'company_id': company_id2,
			}
		]

		with session_scope(session_maker) as session:
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).order_by(models.Transaction.amount).all())
			self.assertEqual(len(expected_txs), len(transactions))
			for i in range(len(transactions)):
				tx = transactions[i]
				exp = expected_txs[i]
				self.assertAlmostEqual(exp['amount'], float(tx.amount))
				self.assertEqual(db_constants.PaymentType.FEE, tx.type)
				self.assertEqual(db_constants.TransactionSubType.MINIMUM_INTEREST_FEE, tx.subtype)

			payments = cast(
				List[models.Payment],
				session.query(models.Payment).order_by(models.Payment.amount).all())
			self.assertEqual(len(expected_payments), len(payments))
			for i in range(len(payments)):
				p = payments[i]
				exp = expected_payments[i]
				self.assertAlmostEqual(exp['amount'], float(p.amount))
				self.assertEqual(db_constants.PaymentType.FEE, p.type)
				self.assertDictEqual(exp['items_covered'], cast(Dict, p.items_covered))

class TestMonthEndRepayments(db_unittest.TestCase):
	maxDiff = None

	def _get_contract(self, company_id: str, product_type: str) -> models.Contract:
		return models.Contract(
			company_id=company_id,
			product_type=product_type,
			product_config=contract_test_helper.create_contract_config(
				product_type=product_type,
				input_dict=ContractInputDict(
					interest_rate=0.03,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=0, # unused
					late_fee_structure=json.dumps({
						'1-14': 0.25,
						'15-29': 0.50,
						'30+': 1.0
					},
				))
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2020')
		)

	def test_get_month_end_repayments_none_due_yet(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		
		with session_scope(session_maker) as session:
			summary1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/01/2020',
				company_id=seed.get_company_id('company_admin', index=0)
			)
			session.add(summary1)
			summary1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/31/2020',
				company_id=seed.get_company_id('company_admin', index=0)
			)
			session.add(summary1)

		with session_scope(session_maker) as session:
			resp, err = fees_due_util.get_all_month_end_payments(
				'1/30/2020',
				session
			)
			self.assertIsNone(err)
			self.assertDictEqual({
				'company_due_to_financial_info': {}
			}, cast(Dict, resp))

	def test_get_and_create_month_end_repayments_due(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		company_id3 = seed.get_company_id('company_admin', index=2)
		company_id4 = seed.get_company_id('company_admin', index=3)

		with session_scope(session_maker) as session:
			# Customer 1
			minimum_interest_info = models.MinimumInterestInfoDict(
				amount_accrued=6.0, # unused
				minimum_amount=10.0, # unused
				amount_short=4.0,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary_day1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/01/2020',
				company_id=company_id,
				minimum_interest_info=minimum_interest_info
			)
			session.add(summary_day1)

			summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/31/2020',
				company_id=company_id,
				minimum_interest_info=minimum_interest_info
			)
			session.add(summary)

			contract = self._get_contract(company_id, product_type=ProductType.INVENTORY_FINANCING)
			contract_test_helper.set_and_add_contract_for_company(contract, company_id, session)

			# Customer 2
			minimum_interest_info2 = models.MinimumInterestInfoDict(
				amount_accrued=5.0, # unused
				minimum_amount=10.0, # unused
				amount_short=5.0,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary2_day1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='01/01/2020',
				company_id=company_id2,
				minimum_interest_info=minimum_interest_info2,
				total_outstanding_interest=2.0,
			)
			session.add(summary2_day1)

			summary2 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='1/31/2020',
				company_id=company_id2,
				minimum_interest_info=minimum_interest_info2,
				total_outstanding_interest=15.0,
			)
			session.add(summary2)

			contract2 = self._get_contract(company_id2, product_type=ProductType.LINE_OF_CREDIT)
			contract_test_helper.set_and_add_contract_for_company(contract2, company_id2, session)

			# Customer 3 - transitioned during the month, so they get ignored
			minimum_interest_info3 = models.MinimumInterestInfoDict(
				amount_accrued=3.0, # unused
				minimum_amount=10.0, # unused
				amount_short=7.0,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary3_day1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='01/01/2020',
				company_id=company_id3,
				minimum_interest_info=minimum_interest_info3
			)
			session.add(summary3_day1)

			summary3 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='1/31/2020',
				company_id=company_id3,
				minimum_interest_info=minimum_interest_info3
			)
			session.add(summary3)

			contract3 = self._get_contract(company_id3, product_type=ProductType.LINE_OF_CREDIT)
			contract_test_helper.set_and_add_contract_for_company(contract3, company_id3, session)

			# Customer 4 who is a dummy account, ignore
			summary4 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.LINE_OF_CREDIT,
				date_str='1/31/2020',
				company_id=company_id4,
				minimum_interest_info=minimum_interest_info3,
				total_outstanding_interest=5.0
			)
			session.add(summary4)
			_set_is_dummy_account(company_id4, session)

			contract4 = self._get_contract(company_id4, product_type=ProductType.LINE_OF_CREDIT)
			contract_test_helper.set_and_add_contract_for_company(contract4, company_id4, session)

		with session_scope(session_maker) as session:

			# You create minimum interest fees before determining their month end payment
			minimum_due_resp, err = fees_due_util.get_all_minimum_interest_fees_due(
				'1/31/2020',
				session
			) 
			success, err = fees_due_util.create_minimum_due_fee_for_customers(
				date_str='1/31/2020',
				minimum_due_resp=minimum_due_resp,
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

			resp, err = fees_due_util.get_all_month_end_payments(
				'1/31/2020',
				session
			)
			self.assertIsNone(err)
			self.assertDictEqual({
				'company_due_to_financial_info': {
					company_id: {
						'fee_info': minimum_interest_info,
						'company': {
							'identifier': 'D0',
							'name': 'Distributor_0',
							'id': company_id
						},
						'fee_amount': 4.0,
						'total_outstanding_interest': 0.0,
					},
					company_id2: {
						'fee_info': minimum_interest_info2,
						'company': {
							'identifier': 'D1',
							'name': 'Distributor_1',
							'id': company_id2
						},
						'fee_amount': 20.0, # 15.0 (total_outstanding_interest) + 5.0 (minimum_monthly)
						'total_outstanding_interest': 15.0,
					}
				}
			}, cast(Dict, resp))

			success, err = fees_due_util.create_month_end_payments_for_customers(
				date_str='1/31/2020',
				minimum_due_resp=resp,
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

		expected_payments: List[Dict] = [
			{
				'requested_amount': 4.0,
				'company_id': company_id,
				'items_covered': {
					'requested_to_principal': 0.0,
					'requested_to_interest': 0.0,
					'requested_to_account_fees': 4.0,
				}
			},
			{
				'requested_amount': 20.0,
				'company_id': company_id2,
				'items_covered': {
					'requested_to_principal': 0.0,
					'requested_to_interest': 15.0,
					'requested_to_account_fees': 5.0,
				}
			}
		]

		with session_scope(session_maker) as session:
			# There are 3 transactions from the 3 companies where minimum fees were booked
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).order_by(models.Transaction.amount).all())
			self.assertEqual(3, len(transactions))

			payments = cast(
				List[models.Payment],
				session.query(models.Payment).filter(
					models.Payment.amount == None
				).order_by(models.Payment.requested_amount).all())
			self.assertEqual(len(expected_payments), len(payments))
			for i in range(len(payments)):
				p = payments[i]
				exp = expected_payments[i]
				self.assertIsNone(p.amount)
				self.assertAlmostEqual(exp['requested_amount'], float(p.requested_amount))
				self.assertIsNotNone(p.requested_payment_date)
				self.assertEqual(db_constants.PaymentType.REPAYMENT, p.type)
				self.assertEqual(db_constants.PaymentMethodEnum.REVERSE_DRAFT_ACH, p.method)
				self.assertDictEqual(exp['items_covered'], cast(Dict, p.items_covered))

	def test_get_and_create_month_end_repayments_with_minimum_interest_fee_waiver(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		company_id = seed.get_company_id('company_admin', index=0)

		amount_short = 4.0

		with session_scope(session_maker) as session:
			# Customer 1
			minimum_interest_info = models.MinimumInterestInfoDict(
				amount_accrued=6.0, # unused
				minimum_amount=10.0, # unused
				amount_short=amount_short,
				duration=MinimumAmountDuration.MONTHLY,
				prorated_info=models.ProratedFeeInfoDict(
					numerator=0,
					denom=0,
					fraction=0.0,
					day_to_pay='1/31/2020'
				)
			)

			summary_day1 = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/01/2020',
				company_id=company_id,
				minimum_interest_info=minimum_interest_info
			)
			session.add(summary_day1)

			summary = finance_test_helper.get_default_financial_summary(
				total_limit=100.0,
				available_limit=80.0,
				product_type=ProductType.INVENTORY_FINANCING,
				date_str='1/31/2020',
				company_id=company_id,
				minimum_interest_info=minimum_interest_info
			)
			session.add(summary)

			contract = self._get_contract(company_id, product_type=ProductType.INVENTORY_FINANCING)
			contract_test_helper.set_and_add_contract_for_company(contract, company_id, session)

		with session_scope(session_maker) as session:
			# You create minimum interest fees before determining their month end payment
			minimum_due_resp, err = fees_due_util.get_all_minimum_interest_fees_due(
				'1/30/2020',
				session
			)
			success, err = fees_due_util.create_minimum_due_fee_for_customers(
				date_str='1/30/2020',
				minimum_due_resp=minimum_due_resp,
				user_id=seed.get_user_id('bank_admin'),
				session=session
			)
			self.assertIsNone(err)

			# Create fee waiver which cancels out minimum interest fee
			payment_id = payment_util.create_and_add_account_level_fee_waiver(
				company_id=company_id,
				subtype=db_constants.TransactionSubType.MINIMUM_INTEREST_FEE,
				amount=amount_short,
				originating_payment_id=None,
				created_by_user_id=seed.get_user_id('bank_admin'),
				effective_date=date_util.load_date_str('1/30/2020'),
				session=session
			)
			self.assertIsNotNone(payment_id)

			resp, err = fees_due_util.get_all_month_end_payments(
				'1/30/2020',
				session
			)
			self.assertIsNone(err)
			self.assertDictEqual({
				'company_due_to_financial_info': {}
			}, cast(Dict, resp))

		expected_payments: List[Dict] = []

		with session_scope(session_maker) as session:
			# There are 2 transactions from the 1 companies where minimum fees were booked
			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).order_by(models.Transaction.amount).all())
			self.assertEqual(2, len(transactions))

			# There are no payments created
			payments = cast(
				List[models.Payment],
				session.query(models.Payment).filter(
					models.Payment.amount == None
				).order_by(models.Payment.requested_amount).all())
			self.assertEqual(len(expected_payments), len(payments))
