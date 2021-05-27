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

		payments = session.query(models.Payment).filter(
			models.Payment.deposit_date.is_(None)
		).filter(
			models.Payment.settlement_date.isnot(None)
		).all()

		print(f'Found {len(payments)} payments with settlement date but not deposit date, setting deposit date to settlement date...')

		for payment in payments:
			payment.deposit_date = payment.settlement_date

		customers = session.query(models.Company).filter(
			models.Company.is_customer == True
		).all()

		customers_count = len(customers)

		print(f'Found {len(customers)} customers...')

		for index, customer in enumerate(customers):
			print(f'[{index + 1} of {customers_count}]')
			print(f'[{index + 1} of {customers_count}] Running for {customer.name} ({customer.identifier})...')

			# Backfill settlement_identifier column of advances.
			advances = session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.ADVANCE
			).order_by(
				models.Payment.payment_date.asc(),
				models.Payment.deposit_date.asc(),
				models.Payment.settlement_date.asc()
			).all()

			latest_disbursement_identifier = 0

			print(f'Found {len(advances)} advances for customer {customer.name}...')

			for advance in advances:
				print(f'Running for advance with amount {number_util.to_dollar_format(advance.amount)} and payment date {advance.payment_date}...')

				transactions = session.query(models.Transaction).filter(
					models.Transaction.payment_id == advance.id
				).filter(
					models.Transaction.loan_id != None
				).all()

				print(f'Found {len(transactions)} transactions / loans for payment with amount {number_util.to_dollar_format(advance.amount)} and payment date {advance.payment_date}...')

				loan_ids = [transaction.loan_id for transaction in transactions]

				loans = session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).order_by(
					models.Loan.identifier
				).all()

				loan = loans[0]

				raw_disbursement_identifier = loan.identifier
				try:
					# If disbursement_identifier is "2", convert it to 2.
					numeric_disbursement_identifier = int(float(raw_disbursement_identifier))
				except Exception:
					if raw_disbursement_identifier.strip() == 'PB':
						numeric_disbursement_identifier = 0
					else:
						# If disbursement_identifier from XLSX is "2A", convert it to 2.
						numeric_disbursement_identifier = int("".join(filter(str.isdigit, raw_disbursement_identifier)))

				print(f'Setting advance settlement identifier to {numeric_disbursement_identifier}')
				# advance.settlement_identifier = str(numeric_disbursement_identifier)
				latest_disbursement_identifier = max(latest_disbursement_identifier, numeric_disbursement_identifier)

			print(f'Setting customer {customer.name} ({customer.identifier}) latest disbursement identifier to {latest_disbursement_identifier}')
			customer.latest_disbursement_identifier = latest_disbursement_identifier

			# Backfill settlement_identifier column of repayments.
			repayments = session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.REPAYMENT
			).filter(
				models.Payment.amount.isnot(None)
			).filter(
				models.Payment.settlement_date.isnot(None)
			).order_by(
				models.Payment.deposit_date.asc(),
				models.Payment.settlement_date.asc(),
				models.Payment.created_at.asc()
			).all()

			latest_repayment_identifier = 0

			print(f'Found {len(repayments)} repayments for customer {customer.name}...')

			for repayment in repayments:
				print(f'Running for repayment with amount {number_util.to_dollar_format(repayment.amount)} and deposit date {repayment.deposit_date}...')

				latest_repayment_identifier += 1
				print(f'Setting repayment settlement identifier to {latest_repayment_identifier}')
				repayment.settlement_identifier = str(latest_repayment_identifier)

			print(f'Setting customer {customer.name} ({customer.identifier}) latest repayment identifier to {latest_repayment_identifier}')
			customer.latest_repayment_identifier = latest_repayment_identifier

		print(f'Complete')

if __name__ == "__main__":
	main()
