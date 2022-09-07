import datetime
from typing import Dict, List, cast
from sqlalchemy.orm.session import Session
import uuid

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (LoanTypeEnum, NewPurchaseOrderStatus)
from bespoke.db.models import session_scope
from bespoke.finance.loans import approval_util
from bespoke_test.db import db_unittest
from sqlalchemy.orm.session import Session


DEFAULT_ORDER_NUMBER = '88888888'
DEFAULT_AMOUNT = 888.88
DEFAULT_NET_TERMS = 0
TODAY_DB_STR = '2022-08-18'

def setup_company_and_user(
	session: Session,
	company_id: str,
	vendor_company_id: str,
) -> models.User:
	parent_company_id = str(uuid.uuid4())
	session.add(models.Company(
		id = company_id,
		parent_company_id = parent_company_id,
		name = "Test Company to submit PO",
	))

	session.add(models.Company(
		id = vendor_company_id,
		name = "Test Vendor",
	))

	session.add(models.CompanyVendorPartnership(
		company_id = company_id,
		vendor_id = vendor_company_id,
		approved_at = date_util.load_datetime_str(TODAY_DB_STR)
	))

	user = models.User(
		company_id = company_id,
		email = 'test@user.com',
		password = 'xxxxx',
		role = 'company_admin',
		first_name = 'Test',
		last_name = 'User',
		login_method = 'simple',
		is_deleted = None
	)

	session.add(user)
	session.flush()

	return user

def setup_existing_purchase_order(
	session: Session,
	purchase_order_id: str,
	company_id: str,
	vendor_company_id: str,
	purchase_order_file_attachments: List[Dict[str, str]],
	order_number: str=DEFAULT_ORDER_NUMBER,
	order_date: datetime.date=date_util.load_date_str(TODAY_DB_STR),
	amount: float=DEFAULT_AMOUNT,
	net_terms: int=DEFAULT_NET_TERMS,
) -> models.PurchaseOrder:
	session.add(models.PurchaseOrder(# type: ignore
		id = purchase_order_id,
		company_id = company_id,
		vendor_id = vendor_company_id,
		order_number = order_number,
		order_date = order_date,
		amount = amount,
		net_terms = net_terms,
		new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
	))

	for file in purchase_order_file_attachments:
		session.add(models.PurchaseOrderFile(# type: ignore
			purchase_order_id = purchase_order_id,
			file_id = file["file_id"],
			file_type = file["file_type"]
		))

	return cast(models.PurchaseOrder, session.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == purchase_order_id).first())

def generate_purchase_order_files(file_types: List[str]) -> List[Dict[str, str]]:
	return [{ 'file_type': file_type, 'file_id': str(uuid.uuid4()) } for file_type in file_types]


class TestSubmitPurchaseOrderForApprovalNew(db_unittest.TestCase):
	def test_save_loan_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			vendor_company_id = str(uuid.uuid4())
			purchase_order_id = str(uuid.uuid4())
			purchase_order_files = generate_purchase_order_files(['purchase_order', 'cannabis'])
			
			user = setup_company_and_user(
				session,
				company_id,
				vendor_company_id,
			)

			purchase_order = setup_existing_purchase_order(
				session,
				purchase_order_id,
				company_id,
				vendor_company_id,
				purchase_order_files,
			)

			amount = 88888
			loan_id = None
			loan_type = LoanTypeEnum.INVENTORY
			requested_payment_date = date_util.load_date_str(TODAY_DB_STR)
			requested_by_user_id = user.id
			customer_notes = "hello world"

			loan_id, err = approval_util.create_or_update_loan(
				session,
				amount,
				purchase_order_id,
				company_id,
				loan_id,
				loan_type,
				requested_payment_date,
				requested_by_user_id,
				customer_notes
			)

			saved_loan = cast(models.Loan, session.query(models.Loan).filter(models.Loan.id == loan_id).first())
			self.assertIsNone(err)
			self.assertEquals(amount, saved_loan.amount)
			self.assertEquals(purchase_order_id, str(saved_loan.artifact_id))
			self.assertEquals(company_id, str(saved_loan.company_id))
			self.assertEquals(loan_type, saved_loan.loan_type)
			self.assertEquals(requested_payment_date, saved_loan.requested_payment_date)
			self.assertEquals(requested_by_user_id, saved_loan.requested_by_user_id)
			self.assertEquals(customer_notes, saved_loan.customer_notes)
