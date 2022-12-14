import datetime
from decimal import Decimal
from typing import Dict, List, Tuple, cast
from sqlalchemy.orm.session import Session
import uuid

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (RequestStatusEnum, NewPurchaseOrderStatus, LoanTypeEnum, LoanStatusEnum)
from bespoke.db.models import session_scope
from bespoke.finance.purchase_orders import purchase_orders_util
from bespoke_test.db import db_unittest
from sqlalchemy.orm.session import Session


DEFAULT_ORDER_NUMBER = '88888888'
DEFAULT_AMOUNT = 888.0
DEFAULT_NET_TERMS = 0
TODAY_DB_STR = '2022-08-18'
LOAN_PAYMENT_DATE = '2022-09-08'

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

def setup_loan_for_purchase_order(
	session: Session,
	company_id: str,
	purchase_order_id: str,
	requested_by_user_id: str,
	amount: float,
	identifier: str,
	status: str,
	loan_type: str=LoanTypeEnum.INVENTORY,
	requested_payment_date: datetime.date=date_util.load_date_str(LOAN_PAYMENT_DATE),
) -> models.Loan:
	loan = models.Loan(# type: ignore
		company_id = company_id,
		loan_type = loan_type,
		status=status,
		artifact_id=purchase_order_id,
		origination_date=None,
		identifier = identifier,
		amount = amount,
		requested_payment_date=requested_payment_date,
		requested_by_user_id=requested_by_user_id,
		requested_at=date_util.now(),
	)
	session.add(loan)
	session.flush()
	return loan


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
		history = []
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


def setup_data_for_update_purchase_order_status_test(session: Session) -> Tuple[str, str, models.User, models.PurchaseOrder]:
	company_id = str(uuid.uuid4())
	vendor_company_id = str(uuid.uuid4())
	purchase_order_id = str(uuid.uuid4())
	purchase_order_files = generate_purchase_order_files(['purchase_order', 'cannabis'])
	
	user = setup_company_and_user_for_purchase_order_test(
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
	return company_id, vendor_company_id, user, purchase_order


class TestCreateUpdatePurchaseOrderNew(db_unittest.TestCase):
	def test_create_update_purhcase_order_new_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			vendor_company_id = str(uuid.uuid4())
			user = setup_company_and_user_for_purchase_order_test(session, company_id, vendor_company_id)

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
				str(user.id),
				user.full_name
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


class TestUpdatePurchaseOrderStatusAndHistory(db_unittest.TestCase):
	def test_approval_requested_loan_equals_financing_pending_approval(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# APPROVAL_REQUESTED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVAL_REQUESTED
			)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.first_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])
	
	def test_approval_requested_and_approved_loan_equals_financing_pending_approval(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 APPROVAL_REQUESTED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVAL_REQUESTED
			)

			# 1 APPROVED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=222.00,
				identifier="id2",
				status=LoanStatusEnum.APPROVED
			)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])

	def test_two_approved_loan_equals_financing_request_approved(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 APPROVAL_REQUESTED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVED
			)

			# 1 APPROVED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=222.00,
				identifier="id2",
				status=LoanStatusEnum.APPROVED
			)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])

	def test_partially_funded_with_aproval_requested_and_approved_loan_equals_financing_pending_approval(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 APPROVAL_REQUESTED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVAL_REQUESTED
			)

			# 1 APPROVED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=222.00,
				identifier="id2",
				status=LoanStatusEnum.APPROVED
			)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])

	def test_partially_funded_with_approved_loan_equals_financing_request_approved(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 APPROVED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVED
			)

			# 1 APPROVED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=222.00,
				identifier="id2",
				status=LoanStatusEnum.APPROVED
			)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])

	def test_partially_funded_with_no_outstanding_loans(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 PARTIALLY LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=111.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVED
			)
			purchase_order.amount_funded = Decimal(555)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])

	def test_fully_funded_equals_archived(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id, _, user, purchase_order = setup_data_for_update_purchase_order_status_test(session)

			# 1 FULLY FUNDED LOAN
			setup_loan_for_purchase_order(
				session=session,
				company_id=company_id,
				purchase_order_id=purchase_order.id,
				requested_by_user_id=user.id,
				amount=888.00,
				identifier="id1",
				status=LoanStatusEnum.APPROVED
			)
			purchase_order.amount_funded = Decimal(888)
			_, err = purchase_orders_util.update_purchase_order_status(
				session,
				purchase_order.id,
				str(user.id),
				user.full_name
			)
			self.assertEqual(err, None)
			self.assertEqual(NewPurchaseOrderStatus.ARCHIVED, purchase_order.new_purchase_order_status)

			latest_history_event = purchase_order.history[-1]
			self.assertEqual(NewPurchaseOrderStatus.ARCHIVED, latest_history_event['new_purchase_order_status'])
			self.assertEqual(str(user.id), latest_history_event['created_by_user_id'])
