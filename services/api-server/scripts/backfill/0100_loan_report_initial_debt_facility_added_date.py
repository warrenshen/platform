"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Any,  Callable, Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from bespoke.db.db_constants import (LoanDebtFacilityStatus)

from sqlalchemy.sql import or_

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	DEBT_FACILITY_LAST_REPORT_DATE = '2022-02-15'

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Adding debt_facility_added_date to loan reports...')

			try:
				loan_reports = cast(
					List[models.LoanReport],
					session.query(models.LoanReport).filter(
						or_(
							models.LoanReport.debt_facility_status == LoanDebtFacilityStatus.SOLD_INTO_DEBT_FACILITY,
							models.LoanReport.debt_facility_status == LoanDebtFacilityStatus.WAIVER
						)
					).order_by(
						models.LoanReport.id.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				print(len(loan_reports))
				if len(loan_reports) <= 0:
					is_done = True
					continue

				for loan_report in loan_reports:
					loan_report.debt_facility_added_date = DEBT_FACILITY_LAST_REPORT_DATE if loan_report.debt_facility_added_date is None

					print(f'Setting debt_facility_added_date for {loan_report.id} to {DEBT_FACILITY_LAST_REPORT_DATE}')


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
