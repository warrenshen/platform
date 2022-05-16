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
from bespoke.db.db_constants import LoanDebtFacilityStatus, ProductType

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
			print(f'[Page {current_page + 1}] Splitting active_ebba_application_id in company settings...')

			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).filter(
						models.Company.is_customer == True
					).order_by(
						models.Company.id.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				all_company_setting_ids = []
				all_company_ids = []
				for company in companies:
					all_company_setting_ids.append(str(company.company_settings_id))
					all_company_ids.append(str(company.id))

				company_settings = cast(
					List[models.CompanySettings],
					session.query(models.CompanySettings).filter(
						models.CompanySettings.id.in_(all_company_setting_ids)
					).all())

				company_settings_lookup: Dict[str, models.CompanySettings] = {}
				for settings in company_settings:
					company_settings_lookup[str(settings.id)] = settings

				most_recent_summaries = cast(
					List[models.FinancialSummary],
					session.query(models.FinancialSummary).group_by(
						models.FinancialSummary.id,
						models.FinancialSummary.company_id
					).filter(
						models.FinancialSummary.company_id.in_(all_company_ids)
					).filter(
						models.FinancialSummary.date == today_date
					).all())

				financial_summary_lookup: Dict[str, models.FinancialSummary] = {}
				for financial_summary in most_recent_summaries:
					financial_summary_lookup[str(financial_summary.company_id)] = financial_summary

				for company in companies:
					settings = company_settings_lookup[str(company.company_settings_id)]
					if settings.active_ebba_application_id is not None:
						financial_summary = financial_summary_lookup[str(company.id)]
						product_type = financial_summary.product_type

						if product_type == ProductType.LINE_OF_CREDIT:
							print(f"Switching {company.name} to use active_borrowing_base_id")
							settings.active_borrowing_base_id = copy.copy(settings.active_ebba_application_id)
						else:
							print(f"Switching {company.name} to use active_financial_report_id")
							settings.active_financial_report_id = copy.copy(settings.active_ebba_application_id)

						# Can add this line back in for future use once we have verified that the split is okay
						# settings.active_ebba_application_id = None

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
