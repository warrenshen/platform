import os
import sys
from os import path

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models
from bespoke.db.db_constants import PaymentType
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
			models.Company.is_customer == True
		).filter(
			models.Company.identifier == parsed_customer_identifier
		).first()

		if not customer:
			print(f'[{index + 1} of {customers_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			continue

		print(f'[{index + 1} of {customers_count}] Resetting customer {customer.name} ({customer.identifier})')

		def _reset_payments_by_type(payment_type):
			payments = session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == payment_type
			).all()

			payment_ids = [str(payment.id) for payment in payments]

			payment_transactions = session.query(models.Transaction).filter(
				models.Transaction.payment_id.in_(payment_ids)
			).all()

			print(f'[{index + 1} of {customers_count}] Resetting {len(payment_transactions)} {payment_type} transactions...')

			for payment_transaction in payment_transactions:
				session.delete(payment_transaction)
			session.flush()

			print(f'[{index + 1} of {customers_count}] Resetting {len(payments)} {payment_type} payments...')

			for payment in payments:
				session.delete(payment)
			session.flush()

		# Step 2: delete repayment payments.
		_reset_payments_by_type(PaymentType.REPAYMENT)

		# Step 3: delete advance payments.
		_reset_payments_by_type(PaymentType.ADVANCE)

		# Step 4: delete credit to user payments.
		_reset_payments_by_type(PaymentType.CREDIT_TO_USER)

		# Step 5: delete fee payments.
		_reset_payments_by_type(PaymentType.FEE)

		# Step 6: delete adjustment payments.
		_reset_payments_by_type(PaymentType.ADJUSTMENT)

		# Step 7: delete loans.
		loans = session.query(models.Loan).filter(
			models.Loan.company_id == customer.id
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(loans)} loans...')

		for loan in loans:
			session.delete(loan)
		session.flush()

		# Step 8: delete artifacts.
		purchase_orders = session.query(models.PurchaseOrder).filter(
			models.PurchaseOrder.company_id == customer.id
		).all()

		print(f'[{index + 1} of {customers_count}] Resetting {len(purchase_orders)} purchase orders...')

		for purchase_order in purchase_orders:
			session.delete(purchase_order)
		session.flush()

		# Step 9: reset customer loan-related identifiers.
		customer.latest_loan_identifier = 0
		customer.latest_disbursement_identifier = 0

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
