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

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False
	metrc_transfer_index = 0

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc packages fields...')

			try:
				metrc_packages_batch = cast(
					List[models.MetrcPackage],
					session.query(models.MetrcPackage).order_by(
						models.MetrcPackage.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_packages_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_package in metrc_packages_batch:
					metrc_package.quantity = metrc_package.package_payload['Quantity']
					metrc_package.unit_of_measure = metrc_package.package_payload['UnitOfMeasureName']
					pass

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
