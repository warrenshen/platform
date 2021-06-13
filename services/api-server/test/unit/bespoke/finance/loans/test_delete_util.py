import datetime
import decimal
import json
import uuid
from typing import Any, Dict, List, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import PaymentStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.loans import delete_util
from bespoke.finance.payments import payment_util, advance_util
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
					wire_fee=25.00
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
					wire_fee=25.00
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2020')
		)

class TestDeleteLoan(db_unittest.TestCase):

	def test_delete_loan(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:
			contract = _get_contract(company_id, is_line_of_credit=False)
			session.add(contract)
			session.flush()

			company = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == company_id
				).first() )
			if not company:
				raise Exception('No company in DB')

			company.contract_id = contract.id	

			loan = models.Loan(
				company_id=company_id,
				amount=decimal.Decimal(100.0),
				approved_at=date_util.now()
			)
			session.add(loan)
			session.flush()
			loan_id = str(loan.id)
			loan_ids = [loan_id]

		bank_admin_user_id = seed.get_user_id('bank_admin', index=0)

		resp, err = advance_util.fund_loans_with_advance(
			req=advance_util.FundLoansReqDict(
				loan_ids=loan_ids,
				payment=payment_types.PaymentInsertInputDict(
					company_id='unused',
					type='unused',
					requested_amount=None,
					amount=100.0,
					method=db_constants.PaymentMethodEnum.WIRE,
					requested_payment_date=None,
					payment_date='10/10/2020',
					settlement_date='10/12/2020',
					items_covered={'loan_ids': loan_ids},
					company_bank_account_id=None,
					customer_note=''
				),
				should_charge_wire_fee=True
			),
			bank_admin_user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		success, err = delete_util.delete_loan(
			req={'loan_id': loan_id},
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIn('Cannot delete loan', err.msg)

		# Delete the advance so you can delete the loan
		undo_req = advance_util.DeleteAdvanceReqDict(
			payment_id=resp['payment_id']
		)
		success, err = advance_util.delete_advance(
			req=undo_req,
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		success, err = delete_util.delete_loan(
			req={'loan_id': loan_id},
			user_id=bank_admin_user_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)

		with session_scope(session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter(
					models.Loan.id == loan_id
				).first())
			if not loan:
				raise errors.Error('Cannot find loan')

			self.assertTrue(loan.is_deleted)


