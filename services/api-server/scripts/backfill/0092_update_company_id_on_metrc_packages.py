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

from bespoke.db import db_constants, models

def main(is_test_run: bool = True) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False
	demo_inventory_company_id = 'b25e95c6-7696-4c7f-aa79-6074c44be2fe'
	ra_company_id = '77fd542f-154b-485f-b294-83a4278f2f37'

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Updating metrc_packages.company_id...')

			try:
				metrc_packages_batch = cast(
					List[models.MetrcPackage],
					session.query(models.MetrcPackage).filter(
						models.MetrcPackage.company_id == demo_inventory_company_id
					).order_by(
						models.MetrcPackage.last_modified_at.asc() # Order by is necessary for batch-based iteration to work.
					).offset( 
						current_page * BATCH_SIZE 
					).limit(BATCH_SIZE).all())
			except Exception:
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_packages_batch) <= 0:
				print('Got 0 metrc packages back')
				is_done = True
				continue
			else:
				for metrc_package in metrc_packages_batch:
					print(f'Updating metrc package {str(metrc_package.id)}... TEST_RUN={is_test_run}')
					if not is_test_run:
						metrc_package.company_id = ra_company_id

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
