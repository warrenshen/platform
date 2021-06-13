import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType, RequestStatusEnum
from bespoke.excel import excel_reader

# customer_identifier, vendor_name, order_number, order_date, funded_date, amount

USE_EXCEL = False

if USE_EXCEL:
	path = '<full path to xlsx file>'
	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_name('<name of sheet>')
	if err:
		raise Exception(err)

	NEW_PURCHASE_ORDER_TUPLES = sheet['rows']
else:
	NEW_PURCHASE_ORDER_TUPLES = [
		("LU", "Utopia Manufacturing", "INV-1000", "6/23/2020", "6/24/2020", 68120.00),
		("LU", "Pax Labs", "3205178", "4/2/2020", "6/29/2020", 38000.00),
		("LU", "Pax Labs", "3205838", "4/6/2020", "6/29/2020", 42000.00),
		("LU", "Kim International", "SO165093", "6/26/2020", "7/15/2020", 21971.25),
		("LU", "Hum Made", "1-HM", "7/13/2020", "7/15/2020", 37926.00),
		("LU", "Vets Leaf", "1-TN", "6/16/2020", "7/21/2020", 52455.00),
		("LU", "Pax Labs", "3233199", "6/26/2020", "9/11/2020", 20000.00),
		("LU", "Pax Labs", "3235081", "7/2/2020", "9/18/2020", 42000.00),
		("LU", "Ninja Supply", "PO-00046", "9/11/2020", "9/21/2020", 51058.00),
		("LU", "Hum Made", "2-HM", "9/24/2020", "9/25/2020", 4581.32),
		("LU", "Hum Made", "4-HM", "9/24/2020", "9/25/2020", 64300.00),
		("LU", "Pax Labs", "3321950", "8/3/2020", "9/25/2020", 18000.00),
		("LU", "Pax Labs", "3325869", "8/14/2020", "9/25/2020", 20000.00),
		("LU", "Kim International", "INV108383", "8/11/2020", "10/2/2020", 6640.00),
		("LU", "Kim International", "INV108233", "8/7/2020", "10/2/2020", 51493.15),
		("LU", "Kim International", "INV108690", "8/19/2020", "10/2/2020", 830.00),
		("LU", "Hum Made", "3-08/20/2020", "8/20/2020", "10/14/2020", 27575.50),
		("LU", "Vets Leaf", "VetsLeaf-2", "10/13/2020", "10/15/2020", 10600.00),
		("LU", "Kim International", "INV110240", "10/1/2020", "11/5/2020", 9467.25),
		("LU", "Vets Leaf", "Vets-2", "10/13/2020", "11/13/2020", 3122.17),
		("LU", "Vets Leaf", "Vets-3", "10/13/2020", "11/13/2020", 7840.00),
		("LU", "Ninja Supply", "INV-000313", "11/12/2020", "11/16/2020", 15301.00),
		("LU", "Hum Made", "Hum Made-4", "11/12/2020", "11/16/2020", 30041.62),
		("LU", "Hum Made", "Hum Made-5", "11/12/2020", "11/17/2020", 31100.00),
		("LU", "Vets Leaf", "Vets-1.3", "11/2/2020", "11/18/2020", 14762.31),
		("LU", "Ninja Supply", "INV-000217", "7/25/2020", "11/20/2020", 17361.25),
		("LU", "Utopia Manufacturing", "25933", "11/12/2020", "11/23/2020", 84150.00),
		("LU", "Vets Leaf", "6", "11/20/2020", "11/25/2020", 41850.00),
		("LU", "R&R Connect", "RR696", "11/24/2020", "11/25/2020", 61653.60),
		("LU", "Ninja Supply", "INV-000254", "8/26/2020", "12/7/2020", 30915.50),
	]

def import_funded_purchase_orders_leune(session: Session) -> None:
	purchase_orders_count = len(NEW_PURCHASE_ORDER_TUPLES)
	print(f'Creating {purchase_orders_count} purchase orders...')

	for index, new_purchase_order_tuple in enumerate(NEW_PURCHASE_ORDER_TUPLES):
		print(f'[{index + 1} of {purchase_orders_count}]')
		customer_identifier, vendor_name, order_number, order_date, funded_date, amount = new_purchase_order_tuple

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {purchase_orders_count}] Customer with identifier {customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		vendor = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_vendor == True
			).filter(
				models.Company.name == vendor_name
			).first())

		if not vendor:
			print(f'[{index + 1} of {purchase_orders_count}] Vendor with name {vendor_name} does not exist')
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
			print(f'[{index + 1} of {purchase_orders_count}] Customer {customer.name} and Vendor {vendor_name} do not have a partnership')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {purchase_orders_count}] Found customer {customer_identifier} and vendor {vendor_name}')

		order_date = date_util.load_date_str(order_date)
		funded_at = datetime.combine(date_util.load_date_str(funded_date), time())

		if (
			not order_number or
			not order_date or
			not amount or
			not funded_at
		):
			print(f'[{index + 1} of {purchase_orders_count}] Invalid purchase order field(s)')
			print(f'EXITING EARLY')
			return

		existing_purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.company_id == customer.id
			).filter(
				models.PurchaseOrder.vendor_id == vendor.id
			).filter(
				models.PurchaseOrder.order_number == order_number
			).first())

		if existing_purchase_order:
			print(f'[{index + 1} of {purchase_orders_count}] Purchase order {order_number} for {customer.name} ({customer.identifier}) already exists')
		else:
			print(f'[{index + 1} of {purchase_orders_count}] Purchase order {order_number} for {customer.name} ({customer.identifier}) does not exist, creating it...')
			purchase_order = models.PurchaseOrder(
				company_id=customer.id,
				vendor_id=vendor.id,
				status=RequestStatusEnum.APPROVED,
				order_number=order_number,
				order_date=order_date,
				delivery_date=None,
				amount=amount,
				requested_at=funded_at, # Set requested_at to funded_at.
				approved_at=funded_at, # Set approved_at to funded_at.
				funded_at=funded_at,
				is_cannabis=None, # Set is_cannabis to NULL, which means we do not know whether it is True or False.
			)
			session.add(purchase_order)

			print(f'[{index + 1} of {purchase_orders_count}] Created purchase order {order_number} for {customer.name} ({customer.identifier})')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_funded_purchase_orders_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
