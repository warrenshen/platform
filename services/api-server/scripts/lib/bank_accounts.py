import decimal
import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (ALL_LOAN_TYPES, CompanyType,
                                     LoanStatusEnum, PaymentMethodEnum,
                                     PaymentType)
from bespoke.excel import excel_reader
from bespoke.finance import number_util


def import_vendor_bank_accounts(
	session: Session,
	vendor_bank_account_tuples,
) -> None:
	vendor_bank_accounts_count = len(vendor_bank_account_tuples)
	print(f'Running for {vendor_bank_accounts_count} vendor bank accounts...')

	for index, new_vendor_bank_account_tuple in enumerate(vendor_bank_account_tuples):
		print(f'[{index + 1} of {vendor_bank_accounts_count}]')
		(
			customer_name,
			vendor_name,
			bank_name,
			account_title,
			account_type,
			routing_number,
			account_number,
			is_ach,
			is_wire,
			wire_routing_number,
			bank_address,
			recipient_name,
			recipient_address,
			is_bank_account_transfer_verified,
			verified_date,
			is_cannabis_compliant,
		) = new_vendor_bank_account_tuple

		if bank_name == '':
			print(f'[{index + 1} of {vendor_bank_accounts_count}] Bank name is blank, skipping...')
			continue

		parsed_customer_name = customer_name.strip()
		parsed_vendor_name = vendor_name.strip()
		parsed_bank_name = bank_name.strip()
		parsed_account_title = account_title.strip()
		parsed_account_type = account_type.strip()
		parsed_routing_number = routing_number.strip()
		parsed_account_number = account_number.strip()
		parsed_is_ach = True if is_ach == 'Y' else False
		parsed_is_wire = True if is_wire == 'Y' else False
		parsed_wire_routing_number = wire_routing_number.strip() or None # Unused.
		parsed_bank_address = bank_address.strip() or None
		parsed_recipient_name = recipient_name.strip() or None
		parsed_recipient_address = recipient_address.strip() or None
		parsed_is_bank_account_transfer_verified = True if is_bank_account_transfer_verified == 'Y' else False # Unused.
		parsed_verified_date = date_util.load_date_str(verified_date) if verified_date else None
		parsed_is_cannabis_compliant = True if is_cannabis_compliant == 'Y' else False
		parsed_verified_at = datetime.combine(parsed_verified_date, time()) if parsed_verified_date else None

		if (
			not parsed_customer_name or
			not parsed_vendor_name or
			not parsed_account_title or
			not parsed_account_type or
			not parsed_routing_number or
			not parsed_account_number
		):
			print(f'[{index + 1} of {vendor_bank_accounts_count}] Invalid field(s)')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer.is_(True)
			).filter(
				models.Company.name == parsed_customer_name
			).first())

		if not customer:
			print(f'[{index + 1} of {vendor_bank_accounts_count}] Customer with name {parsed_customer_name} does not exist')
			print(f'EXITING EARLY')
			return

		vendor = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_vendor.is_(True)
			).filter(
				models.Company.name == parsed_vendor_name
			).first())

		if not vendor:
			print(f'[{index + 1} of {vendor_bank_accounts_count}] WARNING: Vendor with name {parsed_vendor_name} does not exist')
			print(f'[{index + 1} of {vendor_bank_accounts_count}] SKIPPING')
			continue

		company_vendor_partnership = session.query(models.CompanyVendorPartnership).filter(
			models.CompanyVendorPartnership.company_id == customer.id
		).filter(
			models.CompanyVendorPartnership.vendor_id == vendor.id
		).first()

		if not company_vendor_partnership:
			print(f'[{index + 1} of {vendor_bank_accounts_count}] WARNING: Partnership between customer {parsed_customer_name} and vendor {parsed_vendor_name} does not exist')
			print(f'[{index + 1} of {vendor_bank_accounts_count}] SKIPPING')
			continue

		existing_bank_account = session.query(models.BankAccount).filter(
			models.BankAccount.company_id == vendor.id
		).filter(
			models.BankAccount.bank_name == parsed_bank_name
		).filter(
			models.BankAccount.account_type == parsed_account_type
		).filter(
			models.BankAccount.account_number == parsed_account_number
		).filter(
			models.BankAccount.routing_number == parsed_routing_number
		).first()

		if existing_bank_account:
			print(f'[{index + 1} of {vendor_bank_accounts_count}] Vendor bank account for vendor {parsed_vendor_name} with bank name {parsed_bank_name} and account type {parsed_account_type} already exists')
			continue

		bank_account = models.BankAccount(
			company_id=vendor.id,
			bank_name=parsed_bank_name,
			account_type=parsed_account_type,
			account_number=parsed_account_number,
			routing_number=parsed_routing_number,
			can_ach=parsed_is_ach,
			can_wire=parsed_is_wire,
			recipient_name=parsed_recipient_name,
			recipient_address=parsed_recipient_address,
			bank_address=parsed_bank_address,
			account_title=parsed_account_title,
			verified_date=parsed_verified_date,
			is_cannabis_compliant=parsed_is_cannabis_compliant,
			verified_at=parsed_verified_at,
		)

		session.add(bank_account)
		session.flush()

		company_vendor_partnership.vendor_bank_id = bank_account.id

		print(f'[{index + 1} of {vendor_bank_accounts_count}] Created bank account for vendor {parsed_vendor_name} and set it as bank account for partnership between customer {parsed_customer_name} and vendor {parsed_vendor_name}')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	vendor_bank_account_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_vendor_bank_account_tuples = list(filter(lambda vendor_bank_account_tuple: vendor_bank_account_tuple[0] is not '', vendor_bank_account_tuples[1:]))
	import_vendor_bank_accounts(session, filtered_vendor_bank_account_tuples)
	print(f'Finished import')
