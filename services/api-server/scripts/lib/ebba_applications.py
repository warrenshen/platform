import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

# Path hack before we try to import bespoke
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType, RequestStatusEnum
from bespoke.excel import excel_reader
from bespoke.finance import contract_util
from sqlalchemy.orm.session import Session


def import_approved_ebba_applications(
	session: Session,
	ebba_application_tuples: List[List[str]]) -> None:
	ebba_applications_count = len(ebba_application_tuples)
	print(f'Creating {ebba_applications_count} ebba applications...')

	for index, new_ebba_application_tuple in enumerate(ebba_application_tuples):
		print(f'[{index + 1} of {ebba_applications_count}]')
		(
			customer_identifier,
			application_date,
			amount_accounts_receivable,
			amount_inventory,
			amount_cash,
			amount_cash_in_daca,
		) = new_ebba_application_tuple

		parsed_application_date = date_util.load_date_str(application_date)
		parsed_requested_at = datetime.combine(parsed_application_date, time())
		parsed_approved_at = datetime.combine(parsed_application_date, time())
		parsed_amount_accounts_receivable = float(amount_accounts_receivable or 0)
		parsed_amount_inventory = float(amount_inventory or 0)
		parsed_amount_cash = float(amount_cash or 0)
		parsed_amount_cash_in_daca = float(amount_cash_in_daca or 0)

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {ebba_applications_count}] Customer with identifier {customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_application_date or
			parsed_amount_accounts_receivable < 0 or
			parsed_amount_inventory < 0 or
			parsed_amount_cash < 0 or
			parsed_amount_cash_in_daca < 0
		):
			print(f'[{index + 1} of {ebba_applications_count}] Invalid ebba application field(s)')
			print(f'EXITING EARLY')
			return

		existing_ebba_application = cast(
			models.EbbaApplication,
			session.query(models.EbbaApplication).filter(
				models.EbbaApplication.company_id == customer.id
			).filter(
				models.EbbaApplication.application_date == parsed_application_date
			).filter(
				models.EbbaApplication.monthly_accounts_receivable == parsed_amount_accounts_receivable
			).first())

		if existing_ebba_application:
			print(f'[{index + 1} of {ebba_applications_count}] Ebba application on {application_date} with AR {parsed_amount_accounts_receivable} for {customer.name} ({customer.identifier}) already exists')
			continue

		print(f'[{index + 1} of {ebba_applications_count}] Ebba application on {application_date} with AR {parsed_amount_accounts_receivable} for {customer.name} ({customer.identifier}) does not exist, creating it...')

		contracts = cast(
			List[models.Contract],
			contract_util.get_active_contracts_base_query(session).filter(
				models.Contract.company_id == customer.id
			).all())
		if not contracts:
			print(f'[{index + 1} of {ebba_applications_count}] No contracts are setup for this {customer.name}')
			print(f'EXITING EARLY')
			return

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
		if err:
			print(f'[{index + 1} of {ebba_applications_count}] Failed because of error with ContractHelper: {err}')
			print(f'EXITING EARLY')
			return

		contract, err = contract_helper.get_contract(parsed_application_date)
		if err:
			print(f'[{index + 1} of {ebba_applications_count}] No contract is available for {customer.name} at date {parsed_application_date}')
			print(f'EXITING EARLY')
			return

		product_type, err = contract.get_product_type()
		if err:
			print(f'[{index + 1} of {ebba_applications_count}] Failed because of error with contract: {err}')
			print(f'EXITING EARLY')
			return

		# If we're not working with a LINE_OF_CREDIT contract, we just return None
		# for the update dict without an error
		if product_type != ProductType.LINE_OF_CREDIT:
			print(f'[{index + 1} of {ebba_applications_count}] Failed because contract is not Line of Credit product type')
			print(f'EXITING EARLY')
			return

		loc_contract = contract_util.LOCContract(contract._contract_dict, private=True)

		ebba_application = models.EbbaApplication(
			company_id=customer.id,
			status=RequestStatusEnum.APPROVED,
			application_date=parsed_application_date,
			monthly_accounts_receivable=parsed_amount_accounts_receivable,
			monthly_inventory=parsed_amount_inventory,
			monthly_cash=parsed_amount_cash,
			amount_cash_in_daca=parsed_amount_cash_in_daca,
			requested_at=parsed_requested_at,
			approved_at=parsed_approved_at,
		)

		calculated_borrowing_base, err = loc_contract.compute_borrowing_base(ebba_application.as_dict())
		if err:
			print(f'[{index + 1} of {ebba_applications_count}] Failed because of error with contract compute borrowing base: {err}')
			print(f'EXITING EARLY')
			return
		ebba_application.calculated_borrowing_base = calculated_borrowing_base

		calculated_expires_at = date_util.calculate_ebba_application_expires_at(parsed_application_date)
		ebba_application.expires_at = calculated_expires_at

		session.add(ebba_application)
		session.flush()

		ebba_application_id = str(ebba_application.id)

		company_settings = cast(
			models.CompanySettings,
			session.query(models.CompanySettings).filter(
				models.CompanySettings.company_id == customer.id
			).first())

		# Set this most recently created approved ebba application
		# to be the customer's active ebba application.
		company_settings.active_ebba_application_id = ebba_application_id

		print(f'[{index + 1} of {ebba_applications_count}] Created ebba application on {application_date} for {customer.name} ({customer.identifier})')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	ebba_application_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_ebba_application_tuples = list(filter(lambda ebba_application_tuple: ebba_application_tuple[0] is not '', ebba_application_tuples[1:]))
	import_approved_ebba_applications(session, filtered_ebba_application_tuples)
	print(f'Finished import')
