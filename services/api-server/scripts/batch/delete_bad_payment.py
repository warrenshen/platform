"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script soft deletes failed async jobs.

Why:
You can run this script after a incident which creates a large amount of failed async jobs.
"""

import argparse
import sys
import os
import logging
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import db_constants, models

def main(
	is_test_run: bool,
	payment_id: str,
) -> None:
	logging.basicConfig(level=logging.INFO)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	# Delete payment by payment ID
	with models.session_scope(session_maker) as session:
		payment = session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first()

		if not payment:
			print('ERROR! No repayment exists for given payment id')
			return

		# Get transactions associated with payment
		transactions = session.query(models.Transaction).filter(
			models.Transaction.payment_id == payment_id
		).all()

		# Delete transactions
		for transaction in transactions:
			loan = session.query(models.Loan).filter(
				models.Loan.id == transaction.loan_id
			).first()

			if loan and loan.closed_at is not None:
				logging.info(f'Opening loan {loan.id}')
				if not is_test_run:
					loan.closed_at = None

			logging.info(f'Deleting transaction {transaction.id}')
			if not is_test_run:
				print("deleting transaction")
				session.delete(transaction)
		session.commit()

		if payment.type == db_constants.PaymentType.REPAYMENT:
			company = session.query(models.Company).filter(
				models.Company.id == payment.company_id
			).first()
			logging.info(f'Decrementing company latest repayment identifier')
			if not is_test_run:
				company.latest_payment_identifier -= 1

		logging.info(f'Deleting payment {payment.id}')
		if not is_test_run:
			session.delete(payment)

	logging.info(f"[SUCCESS] Successfully deleted payment")

parser = argparse.ArgumentParser()
parser.add_argument('payment_id', help='ID of payment to delete')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(
		is_test_run=is_test_run,
		payment_id=args.payment_id,
	)
