"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
What:
This script adds rows in the database for each parent company to have a parent company settings.
Why:
Parent company settings is a new table being added.
"""

import os
import sys
import time
from os import path
from typing import Dict, List, cast

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.db import models
from bespoke.db.db_constants import CustomerEmailsEnum


def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] of adding parent company settings')

			try:
				parent_companies = cast(
					List[models.ParentCompany],
					session.query(models.ParentCompany).order_by(
						models.ParentCompany.name.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(parent_companies) <= 0:
					is_done = True
					continue

				for parent_company in parent_companies:
					print(f"added new parent company settings for {parent_company.name} with {parent_company.id}")
					if not is_test_run:
						parent_company.settings = cast(models.SettingsDict, { 'emails' : [CustomerEmailsEnum.FINANCIAL_STATEMENT_ALERTS] })

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

	main(is_test_run=is_test_run)
