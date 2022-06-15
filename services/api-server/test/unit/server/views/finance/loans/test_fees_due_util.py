import decimal
import json
import uuid
from typing import Dict, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import (LoanStatusEnum, 
	LoanTypeEnum, ProductType, PaymentType, PaymentMethodEnum)
from bespoke.db.models import session_scope
from bespoke.db.model_types import PaymentItemsCoveredDict
from bespoke.finance.loans import approval_util
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.finance import finance_test_helper
from dateutil import parser
from bespoke.finance.payments import payment_util, fees_due_util	
from bespoke.finance import number_util
from bespoke.date import date_util

from datetime import timedelta, timezone	

class TestEditAccountFeeLevelDate(db_unittest.TestCase):

	def test_valid_payment_and_transaction(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		with session_scope(session_maker) as session:
			company_id = str(uuid.uuid4())

			payment_id = payment_util.create_and_add_account_level_fee(
				company_id = company_id,
				subtype = PaymentType.FEE,
				amount = 123.00,
				originating_payment_id = str(uuid.uuid4()),
				created_by_user_id = str(uuid.uuid4()),
				effective_date = date_util.now(),
				session = session,
			) 
			session.flush()

			edit_result, err = fees_due_util.edit_account_level_fee(
				session,
				payment_id, 
				date_util.date_to_str(date_util.now())
			)

		self.assertIs(edit_result, True)
		self.assertIsNone(err)

	def test_invalid_transaction(self) -> None:
			self.reset()
			session_maker = self.session_maker
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			payment_id1 = str(uuid.uuid4())

			with session_scope(session_maker) as session:
				session.add(models.Payment(	
					id = payment_id1,
					company_id = uuid.uuid4(),
					created_at = date_util.now(),
					updated_at = date_util.now(),
					settlement_identifier = "1",
					type = PaymentType.REPAYMENT,
					method = PaymentMethodEnum.ACH,
					requested_amount = decimal.Decimal(5600.0),
					amount = None,
					requested_payment_date = date_util.now(),
					payment_date = date_util.now(),
					deposit_date = date_util.now(),
					settlement_date = date_util.now(),
					company_bank_account_id = str(uuid.uuid4()),
					recipient_bank_account_id = str(uuid.uuid4()),
					customer_note = "",
					bank_note = "",
					requested_by_user_id = str(uuid.uuid4()),
					submitted_at = date_util.now(),
					submitted_by_user_id = str(uuid.uuid4()),
					settled_at = date_util.now(),
					settled_by_user_id = str(uuid.uuid4()),
					originating_payment_id = str(uuid.uuid4()),
					is_deleted = False,
					reversed_at = None
				))
				edit_result, err = fees_due_util.edit_account_level_fee(
					session,
					payment_id1, 
					date_util.date_to_str(date_util.now())
				)

			self.assertIsNone(edit_result)
			self.assertIn('No transaction with the specified payment id', err.msg)

	def test_invalid_payment(self) -> None:
			self.reset()
			session_maker = self.session_maker
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			payment_id = str(uuid.uuid4())

			with session_scope(session_maker) as session:
				session.add(models.Transaction(
					type = PaymentType.REPAYMENT,
					subtype = None, 
					amount = decimal.Decimal(5600.0),
					loan_id = None,
					payment_id = payment_id,
					to_principal = decimal.Decimal(5000.0),
					to_interest = decimal.Decimal(500.0),
					to_fees = decimal.Decimal(100.0),
					effective_date = date_util.now(),
					created_by_user_id = str(uuid.uuid4()),
					is_deleted = False
				))

				edit_result, err = fees_due_util.edit_account_level_fee(
					session,
					payment_id, 
					date_util.date_to_str(date_util.now())
				)

			self.assertIsNone(edit_result)
			self.assertIn('No payment with the specified payment id', err.msg)

	def test_invalid_payment_and_transaction(self) -> None:
			self.reset()
			session_maker = self.session_maker
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			payment_id = str(uuid.uuid4())
			with session_scope(session_maker) as session:
				edit_result, err = fees_due_util.edit_account_level_fee(
					session,
					payment_id, 
					date_util.date_to_str(date_util.now())
				)

			self.assertIsNone(edit_result)
			self.assertIn('No payment with the specified payment id', err.msg)

