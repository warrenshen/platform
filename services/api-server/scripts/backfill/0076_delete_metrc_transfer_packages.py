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
	BATCH_SIZE = 10
	is_done = False
	metrc_transfer_package_index = 0

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Deleting metrc transfer packages with empty transfer_row_id...')

			try:
				metrc_transfer_packages_batch = cast(
					List[models.MetrcTransferPackage],
					session.query(models.MetrcTransferPackage).filter(
						models.MetrcTransferPackage.transfer_row_id.is_(None)
					).order_by(
						models.MetrcTransferPackage.id.asc() # Order by is necessary for batch-based iteration to work.
					).limit(BATCH_SIZE).all())
			except Exception:
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_transfer_packages_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_transfer_package in metrc_transfer_packages_batch:
					metrc_transfer_package_index += 1

					if metrc_transfer_package.transfer_row_id is not None:
						print('ERROR! Exiting early')
						return

					print(f'[{metrc_transfer_package_index}] Deleting metrc transfer package with empty transfer_row_id...')
					if not is_test_run:
						session.delete(metrc_transfer_package)

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
