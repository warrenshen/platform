"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import copy
import os
import sys
import time
from os import path
from typing import Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ClientSurveillanceCategoryEnum

from sqlalchemy.sql import func, or_

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date: datetime.date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] renaming financial_reports to financial_report in Ebba Applications')

			try:
				ebba_applications = cast(
					List[models.EbbaApplication],
					session.query(models.EbbaApplication).filter(
						models.EbbaApplication.category == "financial_reports"
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(ebba_applications) <= 0:
					is_done = True
					continue

				all_company_ids = []
				for ebba_application in ebba_applications:
					all_company_ids.append(str(ebba_application.company_id))

				companies = cast(
					List[models.Company],
					session.query(models.Company).filter(
						models.Company.id.in_(all_company_ids)
					).all())

				company_lookup: Dict[str, str] = {}
				for company in companies:
					company_lookup[str(company.id)] = str(company.name)

				for ebba_application in ebba_applications:
					print(f"switching ebba application for {company_lookup[str(ebba_application.company_id)]} with application id {ebba_application.id} in category column to financial_reports")
					ebba_application.category = ClientSurveillanceCategoryEnum.FINANCIAL_REPORT


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
