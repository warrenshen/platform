"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This table adds an started_at or ended_at timestamp to async jobs that don't have one.

Why:
There are some async jobs that were  not recording started_at or ended_at timestamps. 
They should be added back in so there are no gaps in data.
"""

import os
import sys
import time
from os import path
from typing import Dict, List, cast

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.db import models


def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] of adding missing started_at and ended_at to async jobs')

			try:
				async_jobs = cast(
					List[models.AsyncJob],
					session.query(models.AsyncJob).filter(
						(models.AsyncJob.started_at == None) | (models.AsyncJob.ended_at == None)
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(async_jobs) <= 0:
					is_done = True
					continue

				for job in async_jobs:
					if job.started_at == None:
						print(f"adding started_at for async job ({job.id})")
						if not is_test_run:
							job.started_at = job.initialized_at
					if job.ended_at == None:
						print(f"adding ended_at for async job ({job.id})")
						if not is_test_run:
							job.ended_at = job.started_at
					
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
