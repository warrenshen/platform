import os
import sys
from os import path

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models
from bespoke.db.db_constants import CompanyType, PaymentStatusEnum, PaymentType
from bespoke.excel import excel_reader


# Removes all purchase orders, loans, advances, and repayments
# data associated with given customers. Given customers are expected
# to be those customers whose historical information was imported
# from one-time scripts.
def reset_customers(
	session: Session,
	customer_tuples,
) -> None:
	customers_count = len(customer_tuples)
	print(f'Resetting {customers_count} customers...')

	for index, customer_tuple in enumerate(customer_tuples):
		print(f'[{index + 1} of {customers_count}]')

		(
			customer_identifier,
		) = customer_tuple

		parsed_customer_identifier = customer_identifier.strip()

		if (
			not parsed_customer_identifier
		):
			print(f'[{index + 1} of {customers_count}] Invalid row')
			continue

		# Step 1: find customer.
		customer = session.query(models.Company).filter(
			models.Company.company_type == CompanyType.Customer
		).filter(
			models.Company.identifier == parsed_customer_identifier
		).first()

		if not customer:
			print(f'[{index + 1} of {customers_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			continue

		print(f'[{index + 1} of {customers_count}] Resetting customer {customer.name} ({customer.identifier})')

		# Step 2: delete repayment transactions.
		repayments = session.query(models.Payment).filter(
			models.Payment.company_id == customer.id
		).filter(
			models.Payment.type == PaymentType.REPAYMENT
		).all()

		repayment_ids = [str(repayment.id) for repayment in repayments]

		repayment_transactions = session.query(models.Transaction).filter(
			models.Transaction.payment_id.in_(repayment_ids)
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(repayment_transactions)} repayment transactions...')

		for repayment_transaction in repayment_transactions:
			session.delete(repayment_transaction)
		session.flush()

		# Step 3: delete repayment payments.
		print(f'[{index + 1} of {customers_count}] Resetting {len(repayments)} repayments...')

		for repayment in repayments:
			session.delete(repayment)
		session.flush()

		# Step 4: delete advance transactions.
		advances = session.query(models.Payment).filter(
			models.Payment.company_id == customer.id
		).filter(
			models.Payment.type == PaymentType.ADVANCE
		).all()

		advance_ids = [str(advance.id) for advance in advances]

		advance_transactions = session.query(models.Transaction).filter(
			models.Transaction.payment_id.in_(advance_ids)
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(advance_transactions)} advance transactions...')

		for advance_transaction in advance_transactions:
			session.delete(advance_transaction)
		session.flush()

		# Step 5: delete advance payments.
		print(f'[{index + 1} of {customers_count}] Resetting {len(advances)} advances...')

		for advance in advances:
			session.delete(advance)
		session.flush()

		# Step 5: delete loans.
		loans = session.query(models.Loan).filter(
			models.Loan.company_id == customer.id
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(loans)} loans...')

		for loan in loans:
			session.delete(loan)
		session.flush()

		# Step 6: delete artifacts.
		purchase_orders = session.query(models.PurchaseOrder).filter(
			models.PurchaseOrder.company_id == customer.id
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(purchase_orders)} purchase orders...')

		for purchase_order in purchase_orders:
			session.delete(purchase_order)
		session.flush()

		print(f'[{index + 1} of {customers_count}] Reset customer {customer.name} ({customer.identifier})')

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning reset...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	customer_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_customer_tuples = list(filter(lambda customer_tuple: customer_tuple[0] is not '', customer_tuples[1:]))
	reset_customers(session, filtered_customer_tuples)
	print(f'Finished reset')

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	if not os.environ.get("CONFIRM"):
		print("This script DELETES information in the database and is intended for DEVELOPMENT and STAGING environments ONLY")
		print("You must set 'CONFIRM' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	customers_path = 'scripts/data/reset_customers_2021_04_09.xlsx'
	with models.session_scope(session_maker) as session:
		load_into_db_from_excel(session, customers_path)

if __name__ == "__main__":
	main()
