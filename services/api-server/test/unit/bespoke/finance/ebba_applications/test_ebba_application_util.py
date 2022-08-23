import datetime
from typing import Dict, List
from sqlalchemy.orm.session import Session
import uuid

from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.db_constants import (ClientSurveillanceCategoryEnum, RequestStatusEnum)
from bespoke.db.models import session_scope
from bespoke.finance.ebba_applications import ebba_application_util
from bespoke_test.db import db_unittest
from dateutil import parser
from sqlalchemy.orm.session import Session

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

def setup_for_ebba_application_test(
	session: Session,
	company_id: str
) -> models.User:
	parent_company_id = str(uuid.uuid4())
	session.add(models.Company(
		id = company_id,
		parent_company_id = parent_company_id,
		name = "AA Milne",
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

def generate_ebba_application_files(
	files_to_generate: int,
	ebba_application_id: str = ""
) -> List[Dict[str, str]]:
	ebba_application_files = []

	for i in range(0, files_to_generate):
		ebba_application_files.append({
			'ebba_application_id': ebba_application_id, 
			'file_id': str(uuid.uuid4())
		})

	return ebba_application_files

class TestAddFinancialReportView(db_unittest.TestCase):
	def test_add_financial_report_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)

			files_to_generate = 4
			ebba_application_files = generate_ebba_application_files(files_to_generate)

			application_date = date_util.date_to_db_str(TODAY_DATE)
			expires_date = date_util.date_to_db_str(TODAY_DATE)

			ebba_application, files_added_count, err = ebba_application_util.add_financial_report(
				session,
				company_id,
				application_date,
				expires_date,
				ebba_application_files
			)

			self.assertNotEqual(ebba_application, None)
			self.assertEqual(ebba_application.status, RequestStatusEnum.APPROVAL_REQUESTED)
			self.assertEqual(ebba_application.category, ClientSurveillanceCategoryEnum.FINANCIAL_REPORT)
			self.assertEqual(files_added_count, files_to_generate)
			self.assertEqual(err, None)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				ebba_application,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, True)
			self.assertEqual(err, None)

class TestUpdateFinancialReportView(db_unittest.TestCase):
	def test_update_financial_report_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)

			files_to_generate1 = 2
			ebba_application_files1 = generate_ebba_application_files(files_to_generate1)

			application_date1 = date_util.date_to_db_str(TODAY_DATE)
			expires_date1 = date_util.date_to_db_str(TODAY_DATE)

			# easier to just use the add function than create a new setup function for the update test
			ebba_application1, _, err = ebba_application_util.add_financial_report(
				session,
				company_id,
				application_date1,
				expires_date1,
				ebba_application_files1
			)

			files_to_generate2 = 2
			ebba_application_files_new = generate_ebba_application_files(files_to_generate2)
			ebba_application_files2 = ebba_application_files1 + ebba_application_files_new

			application_date2 = date_util.date_to_db_str(get_relative_date(TODAY, 10).date())
			expires_date2 = date_util.datetime_to_str(get_relative_date(TODAY, 10))

			ebba_application2, files_removed_count, files_added_count, err = ebba_application_util.update_financial_report(
				session,
				str(ebba_application1.id),
				application_date2,
				expires_date2,
				ebba_application_files2
			)

			self.assertNotEqual(ebba_application2, None)
			self.assertEqual(ebba_application2.status, RequestStatusEnum.APPROVAL_REQUESTED)
			self.assertEqual(ebba_application2.category, ClientSurveillanceCategoryEnum.FINANCIAL_REPORT)

			self.assertNotEqual(application_date1, ebba_application2.application_date)
			self.assertNotEqual(expires_date1, ebba_application2.expires_date)
			
			self.assertEqual(files_removed_count, files_to_generate1)
			self.assertEqual(files_added_count, files_to_generate1 + files_to_generate2)
			self.assertEqual(err, None)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				ebba_application2,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, True)
			self.assertEqual(err, None)

class TestAddBorrowingBaseView(db_unittest.TestCase):
	def test_add_borrowing_base_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)

			files_to_generate = 4
			ebba_application_files = generate_ebba_application_files(files_to_generate)

			application_date = date_util.date_to_db_str(TODAY_DATE)
			monthly_accounts_receivable = 10000
			monthly_inventory = 3000
			monthly_cash = 4000
			amount_cash_in_daca = 1000
			amount_custom = 14
			amount_custom_note = "Unit test note"
			bank_note = "Unit test bank note"
			calculated_borrowing_base = 4514
			expires_date = date_util.date_to_db_str(TODAY_DATE)

			ebba_application, files_added_count, err = ebba_application_util.add_borrowing_base(
				session,
				company_id,
				application_date,
				monthly_accounts_receivable,
				monthly_inventory,
				monthly_cash,
				amount_cash_in_daca,
				amount_custom,
				amount_custom_note,
				bank_note,
				calculated_borrowing_base,
				expires_date,
				ebba_application_files
			)

			self.assertNotEqual(ebba_application, None)
			self.assertEqual(ebba_application.status, RequestStatusEnum.APPROVAL_REQUESTED)
			self.assertEqual(ebba_application.category, ClientSurveillanceCategoryEnum.BORROWING_BASE)
			self.assertEqual(files_added_count, files_to_generate)
			self.assertEqual(err, None)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				ebba_application,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, True)
			self.assertEqual(err, None)

class TestUpdateBorrowingBaseView(db_unittest.TestCase):
	def test_update_borrowing_base_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)
			# only bank_admin users can update application date
			user.role = db_constants.UserRoles.BANK_ADMIN

			files_to_generate1 = 2
			ebba_application_files1 = generate_ebba_application_files(files_to_generate1)

			application_date1 = date_util.date_to_db_str(TODAY_DATE)
			monthly_accounts_receivable1 = 10000
			monthly_inventory1 = 3000
			monthly_cash1 = 4000
			amount_cash_in_daca1 = 1000
			amount_custom1 = 14
			amount_custom_note1 = "Unit test note"
			bank_note1 = "Unit test bank note"
			calculated_borrowing_base1 = 4514
			expires_date1 = date_util.date_to_db_str(TODAY)

			# easier to just use the add function than create a new setup function for the update test
			ebba_application1, _, err = ebba_application_util.add_borrowing_base(
				session,
				company_id,
				application_date1,
				monthly_accounts_receivable1,
				monthly_inventory1,
				monthly_cash1,
				amount_cash_in_daca1,
				amount_custom1,
				amount_custom_note1,
				bank_note1,
				calculated_borrowing_base1,
				expires_date1,
				ebba_application_files1
			)

			files_to_generate2 = 2
			ebba_application_files_new = generate_ebba_application_files(files_to_generate2)
			ebba_application_files2 = ebba_application_files1 + ebba_application_files_new

			application_date2 = date_util.date_to_db_str(get_relative_date(TODAY, 10).date())
			monthly_accounts_receivable2 = 20000
			monthly_inventory2 = 6000
			monthly_cash2 = 8000
			amount_cash_in_daca2 = 2000
			amount_custom2 = 28
			amount_custom_note2 = "Unit test note2"
			bank_note2 = "Unit test bank note2"
			calculated_borrowing_base2 = 9028
			expires_date2 = date_util.datetime_to_str(get_relative_date(TODAY, 10))

			ebba_application2, files_removed_count, files_added_count, err = ebba_application_util.update_borrowing_base(
				session,
				user,
				str(ebba_application1.id),
				application_date2,
				monthly_accounts_receivable2,
				monthly_inventory2,
				monthly_cash2,
				amount_cash_in_daca2,
				amount_custom2,
				amount_custom_note2,
				bank_note2,
				calculated_borrowing_base2,
				expires_date2,
				ebba_application_files2
			)

			self.assertNotEqual(ebba_application2, None)
			self.assertEqual(ebba_application2.status, RequestStatusEnum.APPROVAL_REQUESTED)
			self.assertEqual(ebba_application2.category, ClientSurveillanceCategoryEnum.BORROWING_BASE)
			self.assertNotEqual(datetime.datetime.strptime(application_date1, '%Y-%m-%d').date(), ebba_application2.application_date)
			self.assertNotEqual(monthly_accounts_receivable1, ebba_application2.monthly_accounts_receivable)
			self.assertNotEqual(monthly_inventory1, ebba_application2.monthly_inventory)
			self.assertNotEqual(monthly_cash1, ebba_application2.monthly_cash)
			self.assertNotEqual(amount_cash_in_daca1, ebba_application2.amount_cash_in_daca)
			self.assertNotEqual(amount_custom1, ebba_application2.amount_custom)
			self.assertNotEqual(amount_custom_note1, ebba_application2.amount_custom_note)
			self.assertNotEqual(bank_note1, ebba_application2.bank_note)
			self.assertNotEqual(calculated_borrowing_base1, ebba_application2.calculated_borrowing_base)
			self.assertNotEqual(expires_date1, ebba_application2.expires_date)
			
			self.assertEqual(files_removed_count, files_to_generate1)
			self.assertEqual(files_added_count, files_to_generate1 + files_to_generate2)
			self.assertEqual(err, None)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				ebba_application2,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, True)
			self.assertEqual(err, None)

	def test_update_borrowing_base_non_bank_admin_changes_application_date_errors(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)

			files_to_generate1 = 2
			ebba_application_files1 = generate_ebba_application_files(files_to_generate1)

			application_date1 = date_util.date_to_db_str(TODAY_DATE)
			monthly_accounts_receivable1 = 10000
			monthly_inventory1 = 3000
			monthly_cash1 = 4000
			amount_cash_in_daca1 = 1000
			amount_custom1 = 14
			amount_custom_note1 = "Unit test note"
			bank_note1 = "Unit test bank note"
			calculated_borrowing_base1 = 4514
			expires_date1 = date_util.date_to_db_str(TODAY)

			# easier to just use the add function than create a new setup function for the update test
			ebba_application1, _, err = ebba_application_util.add_borrowing_base(
				session,
				company_id,
				application_date1,
				monthly_accounts_receivable1,
				monthly_inventory1,
				monthly_cash1,
				amount_cash_in_daca1,
				amount_custom1,
				amount_custom_note1,
				bank_note1,
				calculated_borrowing_base1,
				expires_date1,
				ebba_application_files1
			)

			files_to_generate2 = 2
			ebba_application_files_new = generate_ebba_application_files(files_to_generate2)
			ebba_application_files2 = ebba_application_files1 + ebba_application_files_new

			application_date2 = date_util.date_to_db_str(get_relative_date(TODAY, 10).date())
			monthly_accounts_receivable2 = 20000
			monthly_inventory2 = 6000
			monthly_cash2 = 8000
			amount_cash_in_daca2 = 2000
			amount_custom2 = 28
			amount_custom_note2 = "Unit test note2"
			bank_note2 = "Unite test bank note2"
			calculated_borrowing_base2 = 9028
			expires_date2 = date_util.datetime_to_str(get_relative_date(TODAY, 10))

			ebba_application2, files_removed_count, files_added_count, err = ebba_application_util.update_borrowing_base(
				session,
				user,
				str(ebba_application1.id),
				application_date2,
				monthly_accounts_receivable2,
				monthly_inventory2,
				monthly_cash2,
				amount_cash_in_daca2,
				amount_custom2,
				amount_custom_note2,
				bank_note2,
				calculated_borrowing_base2,
				expires_date2,
				ebba_application_files2
			)

			self.assertEqual(ebba_application2, None)
			self.assertEqual(files_removed_count, None)
			self.assertEqual(files_added_count, None)
			self.assertEqual(err.msg, "User not authorized to change Borrowing Base Date")

class TestSubmitEbbaApplicationView(db_unittest.TestCase):
	def test_submit_ebba_application_errors(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				None,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, False)
			self.assertIn("Could not find EBBA application with given ID", err.msg)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				models.EbbaApplication( # type:ignore
					company_id = company_id,
					status = RequestStatusEnum.APPROVAL_REQUESTED,
					category = ClientSurveillanceCategoryEnum.FINANCIAL_REPORT,
					application_date = None,
					expires_date = None
				),
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, False)
			self.assertIn("Application month is required", err.msg)

class TestUpdateBorrowingBaseBankNote(db_unittest.TestCase):
	def test_update_borrowing_base_bank_note_happy_path(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			user = setup_for_ebba_application_test(session, company_id)
			# only bank_admin users can update bank note
			user.role = db_constants.UserRoles.BANK_ADMIN

			application_date1 = date_util.date_to_db_str(TODAY_DATE)
			monthly_accounts_receivable1 = 10000
			monthly_inventory1 = 3000
			monthly_cash1 = 4000
			amount_cash_in_daca1 = 1000
			amount_custom1 = 14
			amount_custom_note1 = "Unit test note"
			bank_note1 = "Unit test bank note"
			calculated_borrowing_base1 = 4514
			expires_date1 = date_util.date_to_db_str(TODAY)

			# easier to just use the add function than create a new setup function for the update test
			ebba_application1, _, err = ebba_application_util.add_borrowing_base(
				session,
				company_id,
				application_date1,
				monthly_accounts_receivable1,
				monthly_inventory1,
				monthly_cash1,
				amount_cash_in_daca1,
				amount_custom1,
				amount_custom_note1,
				bank_note1,
				calculated_borrowing_base1,
				expires_date1,
				[]
			)

			bank_note2 = "Unit test bank note2"

			ebba_application2, err = ebba_application_util.update_borrowing_base_bank_note(
				session,
				user,
				str(ebba_application1.id),
				bank_note2,
			)

			self.assertNotEqual(ebba_application2, None)
			self.assertEqual(ebba_application2.status, RequestStatusEnum.APPROVAL_REQUESTED)
			self.assertEqual(ebba_application2.category, ClientSurveillanceCategoryEnum.BORROWING_BASE)
			self.assertEqual(date_util.load_date_str(application_date1), ebba_application2.application_date)
			self.assertEqual(monthly_accounts_receivable1, ebba_application2.monthly_accounts_receivable)
			self.assertEqual(monthly_inventory1, ebba_application2.monthly_inventory)
			self.assertEqual(monthly_cash1, ebba_application2.monthly_cash)
			self.assertEqual(amount_cash_in_daca1, ebba_application2.amount_cash_in_daca)
			self.assertEqual(amount_custom1, ebba_application2.amount_custom)
			self.assertEqual(amount_custom_note1, ebba_application2.amount_custom_note)
			self.assertNotEqual(bank_note1, ebba_application2.bank_note)
			self.assertEqual(calculated_borrowing_base1, ebba_application2.calculated_borrowing_base)
			self.assertEqual(date_util.load_datetime_str(expires_date1), ebba_application2.expires_date)
			
			self.assertEqual(err, None)

			is_success, err = ebba_application_util.submit_ebba_application_for_approval(
				session,
				ebba_application2,
				company_id,
				str(user.id)
			)

			self.assertEqual(is_success, True)
			self.assertEqual(err, None)	
