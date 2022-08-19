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
from bespoke.db.db_constants import ProductType
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
					session.query(models.Company).order_by(
						models.Company.name.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				all_company_ids: List[str] = []
				for company in companies:
					all_company_ids.append(str(company.id))

				company_settings, err = queries.get_company_settings_for_target_companies(
					session,
					all_company_ids,
				)
				if err:
					raise err

				company_settings_lookup: Dict[str, models.CompanySettings] = {}
				for settings in company_settings:
					company_settings_lookup[str(settings.company_id)] = settings

				for company in companies:
					financial_reports, err = queries.get_approved_financial_reports_by_company_id(
						session,
						str(company.id),
					)
					if err:
						raise err
					
					company_settings = company_settings_lookup[str(company.id)]
					if financial_reports is not None and \
						len(financial_reports) > 0 and \
						str(financial_reports[0].id) != company_settings.active_financial_report_id:
						print(f'Correcting the active financial certification for { company.name } to application with id: { str(financial_reports[0].id) }')
						company_settings.active_financial_report_id = financial_reports[0].id

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
