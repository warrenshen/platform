import sys
from datetime import datetime, time
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.excel import excel_reader
from bespoke.finance import number_util
from sqlalchemy.orm.session import Session


def import_funded_purchase_orders(
	session: Session,
	purchase_order_tuples: List[List[str]],
) -> None:
	purchase_orders_count = len(purchase_order_tuples)
	print(f'Creating {purchase_orders_count} purchase orders...')

	for index, new_purchase_order_tuple in enumerate(purchase_order_tuples):
		print(f'[{index + 1} of {purchase_orders_count}]')
		(
			customer_identifier,
			vendor_name,
			order_number,
			order_date,
			funded_date,
			amount,
		) = new_purchase_order_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_vendor_name = vendor_name.strip()
		parsed_order_date = date_util.load_date_str(order_date) if order_date else None
		parsed_funded_at = datetime.combine(date_util.load_date_str(funded_date), time())
		parsed_amount = number_util.round_currency(float(amount))

		try:
			# If order_number from XLSX is "25.0", convert it to 25.
			numeric_order_number = int(float(order_number))
			parsed_order_number = str(numeric_order_number)
		except Exception:
			parsed_order_number = order_number

		# Note: we are ok with None for order date.
		if (
			not parsed_customer_identifier or
			not parsed_vendor_name or
			not parsed_order_number or
			# not parsed_order_date or
			not parsed_amount or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {purchase_orders_count}] Invalid purchase order field(s)')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {purchase_orders_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		vendor = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_vendor == True
			).filter(
				models.Company.name == parsed_vendor_name
			).first())

		if not vendor:
			print(f'[{index + 1} of {purchase_orders_count}] Vendor with name {parsed_vendor_name} does not exist')
			print(f'EXITING EARLY')
			return

		customer_vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.company_id == customer.id
			).filter(
				models.CompanyVendorPartnership.vendor_id == vendor.id
			).first())

		if not customer_vendor_partnership:
			print(f'[{index + 1} of {purchase_orders_count}] Customer {customer.name} and Vendor {parsed_vendor_name} do not have a partnership')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {purchase_orders_count}] Found customer {parsed_customer_identifier} and vendor {parsed_vendor_name}')

		existing_purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.company_id == customer.id
			).filter(
				models.PurchaseOrder.vendor_id == vendor.id
			).filter(
				models.PurchaseOrder.order_number == parsed_order_number
			).first())

		if existing_purchase_order:
			print(f'[{index + 1} of {purchase_orders_count}] Purchase order {parsed_order_number} for {customer.name} ({customer.identifier}) already exists')
		else:
			print(f'[{index + 1} of {purchase_orders_count}] Purchase order {parsed_order_number} for {customer.name} ({customer.identifier}) does not exist, creating it...')
			purchase_order = models.PurchaseOrder(
				company_id=customer.id,
				vendor_id=vendor.id,
				status=RequestStatusEnum.APPROVED,
				order_number=parsed_order_number,
				order_date=parsed_order_date,
				delivery_date=None,
				amount=parsed_amount,
				requested_at=parsed_funded_at, # Set requested_at to funded_at.
				approved_at=parsed_funded_at, # Set approved_at to funded_at.
				funded_at=parsed_funded_at,
				is_cannabis=None, # Set is_cannabis to NULL, which means we do not know whether it is True or False.
			)
			session.add(purchase_order)

			print(f'[{index + 1} of {purchase_orders_count}] Created purchase order {parsed_order_number} for {customer.name} ({customer.identifier})')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	purchase_order_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_purchase_order_tuples = list(filter(lambda purchase_order_tuple: purchase_order_tuple[0] is not '', purchase_order_tuples[1:]))
	import_funded_purchase_orders(session, filtered_purchase_order_tuples)
	print(f'Finished import')
