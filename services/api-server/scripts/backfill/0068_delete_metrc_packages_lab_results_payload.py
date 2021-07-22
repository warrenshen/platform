"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

from datetime import datetime, timezone
import os
import pytz
import sys
import time
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import db_constants, models

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 10
	is_done = False

	# Use hard-coded threshold timestamp to determine whether to update metrc package or not.
	# Threshold timestamp value is Thu Jul 22 2021 00:00:00 GMT-0700 (Pacific Daylight Time).
	threshold_timestamp = datetime.fromtimestamp(1626937200, tz=timezone.utc)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Deleting metrc packages lab_result_payload...')

			metrc_packages_batch = cast(
				List[models.MetrcPackage],
				session.query(models.MetrcPackage).order_by(
					models.MetrcPackage.id.asc() # Order by is necessary for batch-based iteration to work.
				).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all())

			if len(metrc_packages_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_package in metrc_packages_batch:
					if metrc_package.updated_at is None or metrc_package.updated_at < threshold_timestamp:
						metrc_package.lab_results_payload = None

			current_page += 1

if __name__ == "__main__":
	main()
