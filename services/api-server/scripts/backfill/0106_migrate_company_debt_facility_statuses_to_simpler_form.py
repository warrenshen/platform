"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models, queries
from bespoke.db.db_constants import CompanyDebtFacilityStatus, OldCompanyDebtFacilityStatus
from bespoke.finance import contract_util

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date: datetime.date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] correcting active_financial_report_id to latest accepted application')

			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).filter(
			            models.Company.is_customer == True
			        ).order_by(
						models.Company.name.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				for company in companies:
					old_debt_facility_status = company.debt_facility_status

					if old_debt_facility_status == OldCompanyDebtFacilityStatus.GOOD_STANDING or \
						old_debt_facility_status == OldCompanyDebtFacilityStatus.ON_PROBATION:
						print(f'Changing {company.name}\'s debt facility status from {old_debt_facility_status} to {CompanyDebtFacilityStatus.ELIGIBLE}')
						company.debt_facility_status = CompanyDebtFacilityStatus.ELIGIBLE
					elif old_debt_facility_status == OldCompanyDebtFacilityStatus.OUT_OF_COMPLIANCE or \
						old_debt_facility_status == OldCompanyDebtFacilityStatus.DEFAULTING or \
						old_debt_facility_status == OldCompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY:
						print(f'Changing {company.name}\'s debt facility status from {old_debt_facility_status} to {CompanyDebtFacilityStatus.INELIGIBLE}')
						company.debt_facility_status = CompanyDebtFacilityStatus.INELIGIBLE
					elif old_debt_facility_status == OldCompanyDebtFacilityStatus.WAIVER:
						print(f'Changing {company.name}\'s debt facility status from {old_debt_facility_status} to {CompanyDebtFacilityStatus.WAIVER}')
						company.debt_facility_status = CompanyDebtFacilityStatus.WAIVER

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
