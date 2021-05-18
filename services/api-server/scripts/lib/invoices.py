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


def import_funded_invoices(
	session: Session,
	invoice_tuples: List[List[str]],
) -> None:
	invoices_count = len(invoice_tuples)
	print(f'Creating {invoices_count} invoices...')

	for index, new_invoice_tuple in enumerate(invoice_tuples):
		print(f'[{index + 1} of {invoices_count}]')
		(
			customer_identifier,
			payor_name,
			invoice_number,
			invoice_date,
			due_date,
			funded_date,
			amount,
		) = new_invoice_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_payor_name = payor_name.strip()
		parsed_due_date = date_util.load_date_str(due_date) if due_date else None
		parsed_invoice_date = date_util.load_date_str(invoice_date) if invoice_date else None
		parsed_amount = float(amount)
		parsed_funded_at = datetime.combine(date_util.load_date_str(funded_date), time())

		try:
			# If invoice_number from XLSX is "25.0", convert it to 25.
			numeric_invoice_number = int(float(invoice_number))
			parsed_invoice_number = str(numeric_invoice_number)
		except Exception:
			parsed_invoice_number = invoice_number

		# Note: we are ok with None for order date.
		if (
			not parsed_customer_identifier or
			not parsed_payor_name or
			not parsed_invoice_number or
			# not parsed_invoice_date or
			not parsed_amount or
			parsed_amount <= 0 or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {invoices_count}] Invalid Invoice field(s)')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {invoices_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		payor = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Payor
			).filter(
				models.Company.name == parsed_payor_name
			).first())

		if not payor:
			print(f'[{index + 1} of {invoices_count}] Payor with name {parsed_payor_name} does not exist')
			print(f'EXITING EARLY')
			return

		customer_payor_partnership = cast(
			models.CompanyPayorPartnership,
			session.query(models.CompanyPayorPartnership).filter(
				models.CompanyPayorPartnership.company_id == customer.id
			).filter(
				models.CompanyPayorPartnership.payor_id == payor.id
			).first())

		if not customer_payor_partnership:
			print(f'[{index + 1} of {invoices_count}] Customer {customer.name} and Vendor {parsed_payor_name} do not have a partnership')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {invoices_count}] Found customer {parsed_customer_identifier} and vendor {parsed_payor_name}')

		existing_invoice = cast(
			models.Invoice,
			session.query(models.Invoice).filter(
				models.Invoice.company_id == customer.id
			).filter(
				models.Invoice.payor_id == payor.id
			).filter(
				models.Invoice.invoice_number == parsed_invoice_number
			).first())

		if existing_invoice:
			print(f'[{index + 1} of {invoices_count}] Invoice {parsed_invoice_number} for {customer.name} ({customer.identifier}) already exists')
		else:
			print(f'[{index + 1} of {invoices_count}] Invoice {parsed_invoice_number} for {customer.name} ({customer.identifier}) does not exist, creating it...')
			invoice = models.Invoice(
				company_id=customer.id,
				payor_id=payor.id,
				status=RequestStatusEnum.APPROVED,
				invoice_number=parsed_invoice_number,
				invoice_date=parsed_invoice_date,
				invoice_due_date=parsed_due_date,
				subtotal_amount=parsed_amount,
				taxes_amount=0.0,
				total_amount=parsed_amount,
				requested_at=parsed_funded_at, # Set requested_at to funded_at.
				approved_at=parsed_funded_at, # Set approved_at to funded_at.
				funded_at=parsed_funded_at,
				is_cannabis=None, # Set is_cannabis to NULL, which means we do not know whether it is True or False.
			)
			session.add(invoice)

			print(f'[{index + 1} of {invoices_count}] Created invoice {parsed_invoice_number} for {customer.name} ({customer.identifier})')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	invoice_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_invoice_tuples = list(filter(lambda invoice_tuple: invoice_tuple[0] is not '', invoice_tuples[1:]))
	import_funded_invoices(session, filtered_invoice_tuples)
	print(f'Finished import')
