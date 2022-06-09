"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
from dateutil import relativedelta
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	ebba_application_index = 0

	with models.session_scope(session_maker) as session:
		print(f'Resetting ebba applications expiration date...')

		ebba_applications = cast(
			List[models.EbbaApplication],
			session.query(models.EbbaApplication).order_by(
				models.EbbaApplication.id
			).all())

		for ebba_application in ebba_applications:
			ebba_application_index += 1

			if not ebba_application.application_date:
				continue

			application_date = ebba_application.application_date
			new_expiration_date = (application_date + relativedelta.relativedelta(months=2)).replace(day=15)

			print(f'[{ebba_application_index}] Updating ebba application (certification date {ebba_application.application_date}) expiration date from {ebba_application.expires_date} to {new_expiration_date}...')

			if not is_test_run:
				ebba_application.expires_date = new_expiration_date

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
