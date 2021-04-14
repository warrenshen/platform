import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

# Path hack before we try to import bespoke
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType, RequestStatusEnum
from bespoke.excel import excel_reader
from sqlalchemy.orm.session import Session


def import_payor_vendor_users(
	session: Session,
	payor_vendor_users_tuples: List[List[str]],
) -> None:
	users_count = len(payor_vendor_users_tuples)
	print(f'Creating {users_count} purchase orders...')

	for index, new_payor_vendor_user_tuple in enumerate(payor_vendor_users_tuples):
		print(f'[{index + 1} of {users_count}]')
		(
			customer_name,
			payor_vendor_name,
			first_name,
			last_name,
			email,
			phone_number,
		) = new_payor_vendor_user_tuple

		parsed_customer_name = customer_name.strip()
		parsed_payor_vendor_name = payor_vendor_name.strip()
		parsed_first_name = first_name.strip()
		parsed_last_name = last_name.strip()
		parsed_email = email.strip()
		parsed_phone_number = phone_number.strip()

		if (
			not parsed_customer_name or
			not parsed_payor_vendor_name or
			not parsed_first_name or
			not parsed_last_name or
			not parsed_email or
			not parsed_phone_number
		):
			print(f'[{index + 1} of {users_count}] Invalid user field(s)')
			print(f'EXITING EARLY')
			return

		payor_vendor = session.query(models.Company).filter(
				models.Company.company_type.in_([CompanyType.Payor, CompanyType.Vendor])
			).filter(
				models.Company.name == parsed_payor_vendor_name
			).first()

		if not payor_vendor:
			print(f'[{index + 1} of {users_count}] Payor / vendor with name {parsed_payor_vendor_name} does not exist')
			print(f'EXITING EARLY')
			return

		existing_user = session.query(models.User).filter(
				models.User.company_id == payor_vendor.id
			).filter(
				models.User.first_name == parsed_first_name
			).filter(
				models.User.last_name == parsed_last_name
			).filter(
				models.User.email == parsed_email
			).first()

		if existing_user:
			print(f'[{index + 1} of {users_count}] User {parsed_first_name} ({parsed_email}) for {payor_vendor.name} already exists')
		else:
			print(f'[{index + 1} of {users_count}] User {parsed_first_name} ({parsed_email}) for {payor_vendor.name} does not exist, creating it...')
			user = models.User(
				company_id=payor_vendor.id,
				role=None,
				first_name=parsed_first_name,
				last_name=parsed_last_name,
				email=parsed_email,
				phone_number=parsed_phone_number,
			)
			session.add(user)

			print(f'[{index + 1} of {users_count}] Created user {parsed_first_name} ({parsed_email}) for {payor_vendor.name}')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	payor_vendor_user_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_payor_vendor_user_tuples = list(filter(lambda payor_vendor_user_tuple: payor_vendor_user_tuple[0] is not '', payor_vendor_user_tuples[1:]))
	import_payor_vendor_users(session, filtered_payor_vendor_user_tuples)
	print(f'Finished import')
