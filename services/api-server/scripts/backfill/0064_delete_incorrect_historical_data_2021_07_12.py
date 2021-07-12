"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import db_constants, models

LOAN_IDS_TO_DELETE = [
	# 5MIL
	'bac56ac4-bd2c-455e-aa56-11847ce335ff',
	'dd901951-e982-49ec-8eb5-eb3b56813490',
	'0edf5d8c-9592-41dc-9708-9d21d5c417be',
	'278594a2-98d7-4d2a-9fa2-6ec5ae5cdf88',
	'63844471-c928-4334-94e1-1b2651f1f0ae',
	'259b4998-2e09-40d5-9e09-e897967009d9',
	'7ff9abca-7983-429a-bdd4-49c1c8071821',
	'79090807-d062-44ff-8c22-88442e96b106',
	'd2f63c43-d673-46bc-843f-889bd38191be',
	'8183c790-ee78-463b-bb21-6cc88aab5c80',
	'fb1d5a0a-99cb-4622-a45a-c225b42fdc78',
	'992b75ec-4a3b-4643-95d2-69b707baac73',
	'a08ddfb6-a51e-48ab-8c39-b4fb6054585d',
	'232df482-2a6b-4a53-a06c-d1d988fd23e1',
	'c4c32cf3-d340-4c13-869b-7f8d8579f4d6',
	'3e86a4a8-4401-40fd-a4c3-a3b2fa31bc5a',

	# Pioneer Valley
	'1a219b7f-2b2f-4933-aa80-a46262c54d41',
	'e1157cda-5e3b-4d8a-9bc3-16e4a5618111',
]

def main(is_test_run: bool) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		loan_ids = LOAN_IDS_TO_DELETE
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if len(loans) != len(loan_ids):
			print(f'[ERROR] Did not find all expected loans in the database')
			print(f'EXITING EARLY')
			return

		for loan in loans:
			if not loan.is_frozen:
				print(f'[ERROR] Loan {str(loan.id)} is not frozen')
				print(f'EXITING EARLY')
				return

			if loan.loan_type != db_constants.LoanTypeEnum.INVENTORY or not loan.artifact_id:
				print(f'[ERROR] Loan {str(loan.id)} is not type inventory or does not have an artifact')
				print(f'EXITING EARLY')
				return

		loans_count = len(loans)

		for index, loan in enumerate(loans):
			print(f'[{index + 1} of {loans_count}]')

			loan_report = cast(
				models.LoanReport,
				session.query(models.LoanReport).get(loan.loan_report_id))

			if not loan_report:
				print(f'[ERROR] Loan report for loan {str(loan.id)} is missing')
				print(f'EXITING EARLY')
				return

			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).get(loan.artifact_id))

			if not purchase_order:
				print(f'[ERROR] Artifact for loan {str(loan.id)} is missing')
				print(f'EXITING EARLY')
				return

			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).filter(
					models.Transaction.loan_id == loan.id).all())

			if not len(transactions):
				print(f'[ERROR] Transaction(s) for loan {str(loan.id)} are missing')
				print(f'EXITING EARLY')
				return

			payment_ids = [transaction.payment_id for transaction in transactions]

			payments = cast(
				List[models.Payment],
				session.query(models.Payment).filter(
					models.Payment.id.in_(payment_ids)
				).all())

			if not len(payments):
				print(f'[ERROR] Payment(s) for loan {str(loan.id)} are missing')
				print(f'EXITING EARLY')
				return

			print(f'[{index + 1} of {loans_count}] Deleting loan {str(loan.id)} and related entities...')

			if not is_test_run:
				for transaction in transactions:
					session.delete(transaction)

				session.flush()

				for payment in payments:
					session.delete(payment)

				session.flush()

				session.delete(loan)

				session.flush()

				session.delete(loan_report)

				session.flush()

				session.delete(purchase_order)

				session.flush()

				print(f'[{index + 1} of {loans_count}] Success')
			else:
				print(f'[{index + 1} of {loans_count}] Did not actually perform deletes since this is a test run')

if __name__ == "__main__":
	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script DELETES information in the database")
		print("You must set 'CONFIRM' in the environment to actually perform deletes in this script")
	else:
		is_test_run = False

	main(is_test_run)
