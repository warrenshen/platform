import datetime
import uuid
from typing import Dict, cast
from sqlalchemy.orm.session import Session
from decimal import *

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.bank_accounts import bank_account_util
from bespoke.finance.bank_accounts.bank_account_util import BankAccountInputDict
from bespoke_test.db import db_unittest
from dateutil import parser

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

def setup_for_bank_account_test(
	session: Session,
	bank_account_id: str,
	company_id: str,
	setup_company: bool = True,
	is_customer_user: bool = False,
	is_verified: bool = True
) -> models.User:
	if setup_company:
		parent_company_id = str(uuid.uuid4())
		session.add(models.Company(
			id = company_id,
			parent_company_id = parent_company_id,
			name = "AA Milne",
		))

	session.add(models.BankAccount( #type:ignore
		id = bank_account_id,
		company_id = company_id,
		bank_name = 'Testing Bank',
		account_title = 'Test Checking',
		account_type = 'Checking',
		account_number = '123456789',
		can_ach = True,
		routing_number = '001234',
		ach_default_memo = 'Test ACH Default Memo',
		torrey_pines_template_name = 'Test Torrey Pines Memo',
		can_wire = True,
		is_wire_intermediary = True,
		intermediary_bank_name = 'Test Intermediary Bank',
		intermediary_bank_address = '123 Main Street, Annapolis, MD 21401', 
		intermediary_account_name = 'Test Intermediary Checking', 
		intermediary_account_number = '987654321',
		wire_routing_number = '0056789',
		recipient_address = '456 Main Street',
		recipient_address_2 = 'Annapolis, MD 21401',
		wire_default_memo = 'Test Wire Default Memo',
		wire_template_name = 'Test Wire Template Name',
		bank_address = '456 Main Street, Annapolis, MD 21401',
		is_cannabis_compliant = True,
		verified_date = date_util.load_date_str('01/06/2020') if is_verified else None,
		verified_at = get_relative_date(TODAY, -92) if is_verified else None
	))

	user = models.User(
		company_id = company_id,
		email = 'winnie@100acrewood.com',
		password = 'xxxx',
		role = 'company_admin' if is_customer_user else 'Smackerel Sampler',
		first_name = 'Winnie',
		last_name = 'The Pooh',
		login_method = 'simple',
		is_deleted = True
	)

	session.add(user)
	session.flush()

	return user

def prepare_bank_account_info_dict(
	company_id: str = str(uuid.uuid4()),
	is_verified: bool = True
) -> BankAccountInputDict:
	return BankAccountInputDict(
		company_id = company_id,
		bank_name = 'Testing Bank',
		account_title = 'Test Checking',
		account_type = 'Checking',
		account_number = '123456789',
		can_ach = True,
		routing_number = '001234',
		ach_default_memo = 'Test ACH Default Memo',
		torrey_pines_template_name = 'Test Torrey Pines Memo',
		can_wire = True,
		is_wire_intermediary = True,
		intermediary_bank_name = 'Test Intermediary Bank',
		intermediary_bank_address = '123 Main Street, Annapolis, MD 21401', 
		intermediary_account_name = 'Test Intermediary Checking', 
		intermediary_account_number = '987654321',
		wire_routing_number = '0056789',
		recipient_address = '456 Main Street',
		recipient_address_2 = 'Annapolis, MD 21401',
		wire_default_memo = 'Test Wire Default Memo',
		wire_template_name = 'Test Wire Template Name',
		bank_address = '456 Main Street, Annapolis, MD 21401',
		is_cannabis_compliant = True,
		verified_date = '01/06/2020' if is_verified else None,
		verified_at = date_util.datetime_to_str(get_relative_date(TODAY, -92))
	)


class TestIsBankAccountInfoValid(db_unittest.TestCase):
	def test_company_basic_bank_info_fields_missing_errors(self) -> None:
		fields_to_nullify = [("bank_name", "Bank name is required"), ("account_title", "Bank account name is required"), ("account_type", "Bank account type is required"), ("account_number", "Bank account number is required")]
		company_id = str(uuid.uuid4())

		bank_account_info_dict = prepare_bank_account_info_dict(company_id)

		for field_name, expect_error_message in fields_to_nullify:
			saved_bank_field = bank_account_info_dict.get(field_name)
			bank_account_info_dict[field_name] = None  # type: ignore
			err = bank_account_util.is_bank_account_info_valid(
				False,
				bank_account_info_dict,
			)
			bank_account_info_dict[field_name] = saved_bank_field # type: ignore
			self.assertEqual(expect_error_message, err)

	def test_company_ach_or_wire_presence_check(self) -> None:
		company_id = str(uuid.uuid4())

		bank_account_info_dict = prepare_bank_account_info_dict(company_id)

		bank_account_info_dict["can_ach"] = False
		bank_account_info_dict["can_wire"] = False
		err = bank_account_util.is_bank_account_info_valid(
			False,
			bank_account_info_dict,
		)
		self.assertEqual("Bank accounts must be able to either ACH or wire", err)

		bank_account_info_dict["can_ach"] = True
		bank_account_info_dict["can_wire"] = False
		err = bank_account_util.is_bank_account_info_valid(
			False,
			bank_account_info_dict,
		)
		self.assertEqual(None, err)

		bank_account_info_dict["can_ach"] = False
		bank_account_info_dict["can_wire"] = True
		err = bank_account_util.is_bank_account_info_valid(
			False,
			bank_account_info_dict,
		)
		self.assertEqual(None, err)

		bank_account_info_dict["can_ach"] = True
		bank_account_info_dict["can_wire"] = True
		err = bank_account_util.is_bank_account_info_valid(
			False,
			bank_account_info_dict,
		)
		self.assertEqual(None, err)


	def test_ach_field_required_checks(self) -> None:
		fields_to_nullify = [(False, "routing_number", "ACH routing number is required"), (True, "torrey_pines_template_name", "ACH template name is required"), (False, "torrey_pines_template_name", None)]
		company_id = str(uuid.uuid4())

		bank_account_info_dict = prepare_bank_account_info_dict(company_id)

		for is_admin, field_name, expect_error_message in fields_to_nullify:
			saved_bank_field = bank_account_info_dict.get(field_name)
			bank_account_info_dict[field_name] = None # type: ignore
			err = bank_account_util.is_bank_account_info_valid(
				is_admin,
				bank_account_info_dict,
			)

			bank_account_info_dict[field_name] = saved_bank_field # type: ignore
			self.assertEqual(expect_error_message, err)

	def test_wire_field_required_checks(self) -> None:
		fields_to_nullify = [(False, "wire_routing_number", "Wire routing number is required"), (False, "recipient_address", "Wire recipient address is required"), (False, "recipient_address_2", "Wire recipient address 2 is required"), (True, "wire_template_name", "Wire template name is required"), (False, "wire_template_name", None)]
		company_id = str(uuid.uuid4())

		bank_account_info_dict = prepare_bank_account_info_dict(company_id)

		for is_admin, field_name, expect_error_message in fields_to_nullify:
			saved_bank_field = bank_account_info_dict.get(field_name)
			bank_account_info_dict[field_name] = None # type: ignore
			err = bank_account_util.is_bank_account_info_valid(
				is_admin,
				bank_account_info_dict,
			)

			bank_account_info_dict[field_name] = saved_bank_field # type: ignore
			self.assertEqual(expect_error_message, err)

	def test_wire_intermediary_field_required_checks(self) -> None:
		fields_to_nullify = [("intermediary_bank_name", "Intermediary bank name is required"), ("intermediary_bank_address", "Intermediary bank address is required"), ("intermediary_account_name", "Intermediary account name is required"), ("intermediary_account_number", "Intermediary account number is required")]
		company_id = str(uuid.uuid4())

		bank_account_info_dict = prepare_bank_account_info_dict(company_id)

		for field_name, expect_error_message in fields_to_nullify:
			saved_bank_field = bank_account_info_dict.get(field_name)
			bank_account_info_dict[field_name] = None # type: ignore
			err = bank_account_util.is_bank_account_info_valid(
				False,
				bank_account_info_dict,
			)

			bank_account_info_dict[field_name] = saved_bank_field # type: ignore
			self.assertEqual(expect_error_message, err)


class TestAddBankAccountView(db_unittest.TestCase):
	def test_company_does_not_exist_error(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())
			bad_company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id
			)
			bank_account_info_dict = prepare_bank_account_info_dict(bad_company_id)

			template_data, err = bank_account_util.add_bank_account(
				session,
				user,
				True,
				bank_account_info_dict,
				bad_company_id
			)
			self.assertEqual("Could not find requested company", err.msg)

	def test_happy_path_bank_user(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id
			)

			bank_account_info_dict = prepare_bank_account_info_dict(company_id)

			template_data, err = bank_account_util.add_bank_account(
				session,
				user,
				True,
				bank_account_info_dict,
				company_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], False)
			self.assertEqual(message_type["is_create"], True)

	def test_happy_path_customer_user(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_customer_user = True
			)

			bank_account_info_dict = prepare_bank_account_info_dict(company_id)

			template_data, err = bank_account_util.add_bank_account(
				session,
				user,
				False,
				bank_account_info_dict,
				company_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], False)
			self.assertEqual(message_type["is_create"], True)

class TestUpdateBankAccountView(db_unittest.TestCase):
	def test_bank_account_does_not_exist_error(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			bad_bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bad_bank_account_id
			)
			self.assertIn('Could not find the bank account selected for updating', err.msg)

	def test_company_does_not_exist_error(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				setup_company = False
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertIn('Could not find the company associated with this bank account', err.msg)

	def test_customer_trying_to_update_verified_bank_account(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_customer_user = True
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				False, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertIn('Only bank admins may update verified bank accounts', err.msg)

	def test_happy_path_bank_user_verified_bank_account(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)

	def test_happy_path_bank_user_unverified_bank_account(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_verified = False
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)

	def test_happy_path_bank_user_unverified_to_unverified_case(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_verified = False
			)

			bank_account_info_dict = prepare_bank_account_info_dict(
				is_verified = False
			)

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)

	def test_happy_path_bank_user_verified_to_unverified_case(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_verified = True
			)

			bank_account_info_dict = prepare_bank_account_info_dict(
				is_verified = False
			)

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)

	def test_happy_path_customer_user(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = str(uuid.uuid4())

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_customer_user = True,
				is_verified = False
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				False, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "AA Milne")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)

	def test_happy_path_add_bespoke_bank_account(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = None

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_customer_user = True
			)

			bank_account_info_dict = prepare_bank_account_info_dict(company_id)

			template_data, err = bank_account_util.add_bank_account(
				session,
				user,
				True,
				bank_account_info_dict,
				company_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "Bespoke Financial")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], False)
			self.assertEqual(message_type["is_create"], True)

	def test_happy_path_update_bespoke_bank_account(self) -> None:
		with session_scope(self.session_maker) as session:
			bank_account_id = str(uuid.uuid4())
			company_id = None

			user = setup_for_bank_account_test(
				session,
				bank_account_id,
				company_id,
				is_customer_user = True,
				is_verified = False
			)

			bank_account_info_dict = prepare_bank_account_info_dict()

			template_data, err = bank_account_util.update_bank_account(
				session,
				user,
				True, # is_bank_admin, set up with user_session in non-test code
				bank_account_info_dict,
				bank_account_id
			)
			self.assertEqual(None, err)
			self.assertEqual(template_data["company_name"], "Bespoke Financial")
			self.assertEqual(template_data["requesting_user"], "Winnie The Pooh")
			self.assertEqual(template_data["account_last_four"], "6789")
			message_type = cast(Dict[str, str], template_data["message_type"])
			self.assertEqual(message_type["is_update"], True)
			self.assertEqual(message_type["is_create"], False)
