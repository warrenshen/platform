import datetime
import decimal
from typing import Dict, List
from sqlalchemy.orm.session import Session
import uuid
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (RequestStatusEnum, ProductType, PRODUCT_TYPES)
from bespoke.db.models import session_scope
from bespoke.finance.ebba_applications import email_ebba_application_util
from bespoke_test.db import db_unittest
from dateutil import parser
from sqlalchemy.orm.session import Session

PAST = parser.parse('2020-10-01T16:33:27.69-08:00')
PAST_DATE = PAST.date()

TODAY = parser.parse('2020-10-05T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

FUTURE = parser.parse('2020-10-31T16:33:27.69-08:00')
FUTURE_DATE = FUTURE.date()

class TestAlertExpiringBorrowingBase(db_unittest.TestCase):
	def add_test_models(self,
		session: Session,
		company_name: str,
		ebba_application_expires_date: datetime.date,
		ebba_application_status: str,
		financial_summary_product_type: str,
		set_company_settings_borrowing_base_id: bool,
	) -> None:
		company_id = str(uuid.uuid4())
		session.add(models.Company(
			id = company_id,
			parent_company_id = str(uuid.uuid4()),
			name = company_name,
			is_customer = True,
		))
		ebba_application_id = str(uuid.uuid4())
		ebba_application = models.EbbaApplication( #type:ignore
			id = ebba_application_id,					
			company_id=company_id,
			application_date = PAST_DATE,
			monthly_accounts_receivable = 10000,
			monthly_inventory = 3000,
			monthly_cash = 4000,
			amount_cash_in_daca = 1000,
			amount_custom = 14,
			amount_custom_note = "Unit test note",
			calculated_borrowing_base = 4514,
			expires_date = ebba_application_expires_date,
			status = ebba_application_status
		)

		session.add(ebba_application)

		financial_summary = models.FinancialSummary(
			date=PAST_DATE,
			company_id=company_id,
			total_limit=decimal.Decimal(100.0),
			adjusted_total_limit=decimal.Decimal(100.0),
			total_outstanding_principal=decimal.Decimal(50.0),
			total_outstanding_principal_for_interest=decimal.Decimal(60.0),
			total_outstanding_principal_past_due=decimal.Decimal(0.0),
			total_outstanding_interest=decimal.Decimal(12.50),
			total_outstanding_fees=decimal.Decimal(5.25),
			total_principal_in_requested_state=decimal.Decimal(3.15),
			available_limit=decimal.Decimal(1000.00),
			interest_accrued_today=decimal.Decimal(2.1),
			late_fees_accrued_today=decimal.Decimal(0.0),
			minimum_monthly_payload={},
			account_level_balance_payload={},
			product_type=financial_summary_product_type,
			loans_info={}
		)
		session.add(financial_summary)

		companySettings = models.CompanySettings(
				company_id=company_id,
				# for testing
				is_dummy_account=True,
				# is_dummy_account=False,
			)
		session.add(companySettings)
		companySettings.active_borrowing_base_id = ebba_application.id if set_company_settings_borrowing_base_id else None

	def test_alert_expired_borrowing_base_by_product_type(self) -> None:
		with session_scope(self.session_maker) as session:
			for product_type in PRODUCT_TYPES:
				self.add_test_models(
					session=session,
					company_name=product_type,
					ebba_application_expires_date=PAST_DATE,
					ebba_application_status=RequestStatusEnum.REJECTED,
					financial_summary_product_type=product_type,
					set_company_settings_borrowing_base_id=True,
				)
			expired_borrowing_base_companies, err = email_ebba_application_util.alert_expired_borrowing_base(
				session,
				TODAY_DATE
			)

			expired_company_names = [str(x.name) for x in expired_borrowing_base_companies]
		
		self.assertEqual(len(expired_borrowing_base_companies), 4)
		self.assertIn('dispensary_financing', expired_company_names)
		self.assertIn('inventory_financing', expired_company_names)
		self.assertIn('invoice_financing', expired_company_names)
		self.assertIn('purchase_money_financing', expired_company_names)
		self.assertNotIn('line_of_credit', expired_company_names)

	def test_alert_expired_borrowing_base_by_active_borrowing_id(self) -> None:
		with session_scope(self.session_maker) as session:
			self.add_test_models(
				session=session,
				company_name=ProductType.INVENTORY_FINANCING,
				ebba_application_expires_date=FUTURE_DATE,
				ebba_application_status=RequestStatusEnum.REJECTED,
				financial_summary_product_type=ProductType.INVENTORY_FINANCING,
				set_company_settings_borrowing_base_id=True,
			)
			self.add_test_models(
				session=session,
				company_name="no_active_borrowing_base",
				ebba_application_expires_date=FUTURE_DATE,
				ebba_application_status=RequestStatusEnum.REJECTED,
				financial_summary_product_type=ProductType.INVENTORY_FINANCING,
				set_company_settings_borrowing_base_id=False,
			)

			expired_borrowing_base_companies, err = email_ebba_application_util.alert_expired_borrowing_base(
				session,
				TODAY_DATE
			)

			expired_company_names = [str(x.name) for x in expired_borrowing_base_companies]
		
		self.assertEqual(len(expired_borrowing_base_companies), 1)
		self.assertIn('no_active_borrowing_base', expired_company_names)
		self.assertNotIn('inventory_financing', expired_company_names)

	def test_alert_expired_borrowing_base_by_ebba_application_status(self) -> None:
		with session_scope(self.session_maker) as session:
			request_statuses = [
				RequestStatusEnum.APPROVAL_REQUESTED, 
				RequestStatusEnum.APPROVED,
				RequestStatusEnum.INCOMPLETE,
				RequestStatusEnum.DRAFTED,
				RequestStatusEnum.REJECTED,
			]

			for request_status in request_statuses:
				self.add_test_models(
					session=session,
					company_name=request_status,
					ebba_application_expires_date=PAST_DATE,
					ebba_application_status=request_status,
					financial_summary_product_type=ProductType.INVENTORY_FINANCING,
					set_company_settings_borrowing_base_id=True,
				)	

			expired_borrowing_base_companies, err = email_ebba_application_util.alert_expired_borrowing_base(
				session,
				TODAY_DATE,
			)

			expired_company_names = [str(x.name) for x in expired_borrowing_base_companies]
		
		self.assertEqual(len(expired_borrowing_base_companies), 4)
		self.assertIn('approved', expired_company_names)
		self.assertIn('incomplete', expired_company_names)
		self.assertIn('drafted', expired_company_names)
		self.assertIn('rejected', expired_company_names)
		self.assertNotIn('approval_requested', expired_company_names)

	def test_alert_expired_borrowing_base_by_ebba_application_expires_date(self) -> None:
		with session_scope(self.session_maker) as session:
			# self.add_company_by_date(session, "expired", PAST_DATE)
			# self.add_company_by_date(session, "not_expired", FUTURE_DATE)

			self.add_test_models(
				session=session,
				company_name="expired",
				ebba_application_expires_date=PAST_DATE,
				ebba_application_status=RequestStatusEnum.REJECTED,
				financial_summary_product_type=ProductType.INVENTORY_FINANCING,
				set_company_settings_borrowing_base_id=True,
			)
			self.add_test_models(
				session=session,
				company_name="not_expired",
				ebba_application_expires_date=FUTURE_DATE,
				ebba_application_status=RequestStatusEnum.REJECTED,
				financial_summary_product_type=ProductType.INVENTORY_FINANCING,
				set_company_settings_borrowing_base_id=True,
			)
			self.add_test_models(
				session=session,
				company_name="today",
				ebba_application_expires_date=TODAY_DATE,
				ebba_application_status=RequestStatusEnum.REJECTED,
				financial_summary_product_type=ProductType.INVENTORY_FINANCING,
				set_company_settings_borrowing_base_id=True,
			)

			expired_borrowing_base_companies, err = email_ebba_application_util.alert_expired_borrowing_base(
				session,
				TODAY_DATE,
			)

			expired_company_names = [str(x.name) for x in expired_borrowing_base_companies]
		
		self.assertEqual(len(expired_borrowing_base_companies), 1)
		self.assertIn('expired', expired_company_names)
		self.assertNotIn('not_expired', expired_company_names)
		self.assertNotIn('today', expired_company_names)


