import datetime
from typing import Dict, List, cast
from sqlalchemy.orm.session import Session
import uuid

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (RequestStatusEnum, NewPurchaseOrderStatus)
from bespoke.db.models import session_scope
from bespoke.finance.purchase_orders import purchase_orders_util
from bespoke_test.db import db_unittest
from sqlalchemy.orm.session import Session


DEFAULT_ORDER_NUMBER = '88888888'
DEFAULT_AMOUNT = 888.88
DEFAULT_NET_TERMS = 0
TODAY_DB_STR = '2022-08-18'

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

def setup_company_and_user_for_purchase_order_test(
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
		email = 'winnie@100acrewood.com',
		password = 'xxxx',
		role = 'company_admin',
		first_name = 'Winnie',
		last_name = 'The Pooh',
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


class TestCreateUpdatePurchaseOrderNew(db_unittest.TestCase):
	def test_create_update_purhcase_order_new_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			vendor_company_id = str(uuid.uuid4())
			setup_company_and_user_for_purchase_order_test(session, company_id, vendor_company_id)

			order_number =  '88888888'
			order_date = TODAY_DB_STR
			net_terms = 0
			amount = 1234
			is_cannabis = True
			is_metrc_based = None
			customer_note = 'new purchase order'
			po_dict = {
				'purchase_order': {
					'id': None,
					'company_id': company_id,
					'vendor_id': vendor_company_id,
					'order_number': order_number,
					'order_date': order_date,
					'net_terms': net_terms,
					'amount': amount,
					'is_cannabis': is_cannabis,
					'is_metrc_based': is_metrc_based,
					'customer_note': customer_note,
				},
				'purchase_order_files': generate_purchase_order_files(['purchase_order', 'cannabis']),
				'purchase_order_metrc_transfers': []
			}

			purchase_order_create_request, err = purchase_orders_util.PurchaseOrderUpsertRequestNew.from_dict(
				po_dict
			)
			self.assertIsNone(err)
			
			purchase_order_id, _, err = purchase_orders_util.create_update_purchase_order_new(
				session,
				purchase_order_create_request,
			)
			self.assertIsNone(err)
		
			created_purchase_order = session.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == purchase_order_id).first()
			self.assertEqual(str(created_purchase_order.vendor_id), vendor_company_id)
			self.assertEqual(str(created_purchase_order.company_id), company_id)
			self.assertEqual(created_purchase_order.order_number, order_number)
			self.assertEqual(created_purchase_order.order_date, datetime.datetime.strptime(order_date, '%Y-%m-%d').date())
			self.assertEqual(created_purchase_order.net_terms, net_terms)
			self.assertEqual(created_purchase_order.amount, amount)
			self.assertEqual(created_purchase_order.is_cannabis, is_cannabis)
			self.assertEqual(created_purchase_order.is_metrc_based, is_metrc_based)
			self.assertEqual(created_purchase_order.customer_note, customer_note)
			self.assertEqual(created_purchase_order.status, RequestStatusEnum.DRAFTED)
			self.assertEqual(created_purchase_order.new_purchase_order_status, NewPurchaseOrderStatus.DRAFT)


class TestSubmitPurchaseOrderForApprovalNew(db_unittest.TestCase):
	def test_submit_purchase_order_for_approval_new_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			vendor_company_id = str(uuid.uuid4())
			purchase_order_id = str(uuid.uuid4())
			purchase_order_files = generate_purchase_order_files(['purchase_order', 'cannabis'])
			
			setup_company_and_user_for_purchase_order_test(
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

			updated_purchase_order, _, _, err = purchase_orders_util.submit_purchase_order_for_approval_new(
				session,
				purchase_order.id,
			)

			self.assertEqual(err, None)
			self.assertEqual(updated_purchase_order.new_purchase_order_status, NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR)
			self.assertEqual(updated_purchase_order.status, RequestStatusEnum.APPROVAL_REQUESTED)



			