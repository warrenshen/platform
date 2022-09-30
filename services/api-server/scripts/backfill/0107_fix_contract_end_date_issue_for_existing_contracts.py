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

				all_active_contract_ids = []
				contract_id_to_company_name: Dict[str, str] = {}
				for company in companies:
					if company.contract_id is not None:
						all_active_contract_ids.append(str(company.contract_id))
						contract_id_to_company_name[str(company.contract_id)] = company.name

				contracts = cast(
					List[models.Contract],
					session.query(models.Contract).filter(
						models.Contract.id.in_(all_active_contract_ids)
					).all())

				
				for contract in contracts:
					start_date = contract.start_date
					end_date = start_date.replace(year = start_date.year + 1)
					adjusted_end_date = date_util.get_nearest_business_day(
						end_date,
						preceeding = False,
					)
					print(f"Changing the contract end date for {contract_id_to_company_name[str(contract.id)]} from {contract.adjusted_end_date} to {adjusted_end_date}")
					contract.end_date = end_date
					contract.adjusted_end_date = adjusted_end_date

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
