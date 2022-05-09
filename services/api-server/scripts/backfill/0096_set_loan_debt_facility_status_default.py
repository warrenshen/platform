"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from bespoke.db.db_constants import LoanDebtFacilityStatus

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Trying to set loans default debt facility status...')

			try:
				loans = cast(
					List[models.Loan],
					session.query(models.Loan).order_by(
						models.Loan.id.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(loans) <= 0:
					is_done = True
					continue

				for loan in loans:
					loan_report = cast(
						models.LoanReport,
						session.query(models.LoanReport).filter(
							models.LoanReport.id == loan.loan_report_id
						).first())

					if loan_report and not loan_report.debt_facility_status:
						print("Setting loan report status to bespoke balance sheet for loan report with id:", loan_report.id)
						loan_report.debt_facility_status = LoanDebtFacilityStatus.BESPOKE_BALANCE_SHEET
					else:
						print("No loan report associated with loan id:", loan.id)

				session.flush()

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			current_page += 1

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run)
