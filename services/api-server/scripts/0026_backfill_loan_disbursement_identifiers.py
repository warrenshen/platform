import os
import string
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models
from bespoke.db.db_constants import CompanyType, PaymentType
from bespoke.finance import number_util

ASCII_CHARACTERS = list(string.ascii_uppercase)

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		print(f'Running...')

		customers = session.query(models.Company).filter(
			models.Company.company_type == CompanyType.Customer
		).all()

		customers_count = len(customers)

		print(f'Found {len(customers)} customers...')

		for index, customer in enumerate(customers):
			print(f'[{index + 1} of {customers_count}]')
			print(f'[{index + 1} of {customers_count}] Running for {customer.name} ({customer.identifier})...')

			payments = session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.ADVANCE
			).order_by(
				models.Payment.payment_date.asc(),
				models.Payment.settlement_date.asc()
			).all()

			latest_disbursement_identifier = 0

			print(f'Found {len(payments)} payments for customer {customer.name}...')

			for payment in payments:
				print(f'Running for payment with amount {number_util.to_dollar_format(payment.amount)} and payment date {payment.payment_date}...')

				transactions = session.query(models.Transaction).filter(
					models.Transaction.payment_id == payment.id
				).filter(
					models.Transaction.loan_id != None
				).all()

				print(f'Found {len(transactions)} transactions / loans for payment with amount {number_util.to_dollar_format(payment.amount)} and payment date {payment.payment_date}...')

				loan_ids = [transaction.loan_id for transaction in transactions]

				loans = session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).order_by(
					models.Loan.identifier
				).all()

				for index, loan in enumerate(loans):
					print(f'Running for loan {loan.identifier} with amount {number_util.to_dollar_format(payment.amount)} and origination date {loan.origination_date}...')

					disbursement_identifier = loan.identifier
					loan.disbursement_identifier = disbursement_identifier

					print(f'Assigned loan {loan.identifier} disbursement identifier {loan.disbursement_identifier}')

					try:
						# If disbursement_identifier is "2", convert it to 2.
						numeric_disbursement_identifier = int(float(disbursement_identifier))
					except Exception:
						# If disbursement_identifier from XLSX is "2A", convert it to 2.
						numeric_disbursement_identifier = int("".join(filter(str.isdigit, disbursement_identifier)))

					latest_disbursement_identifier = max(latest_disbursement_identifier, numeric_disbursement_identifier)

			print(f'Setting customer {customer.name} ({customer.identifier}) latest disbursement identifier to {latest_disbursement_identifier}')

			customer.latest_disbursement_identifier = latest_disbursement_identifier

		print(f'Complete')

if __name__ == "__main__":
	main()
