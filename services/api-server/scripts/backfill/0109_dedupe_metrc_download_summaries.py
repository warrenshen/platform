"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script dedupes the metrc_download_summaries table by unique key (date, license_number).

Why:
Before this script, the unique key for the metrc_download_summaries table was
(metrc_api_key_id, date, license_number). Since we changed how the download logic
works, after this script we want the unique key to be (date, license_number).
"""

import os
import sys
from datetime import timedelta
from os import path

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.db import models


def main(is_test_run: bool) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	earliest_date = None
	latest_date = None

	with models.session_scope(session_maker) as session:
		earliest_metrc_download_summary = session.query(
			models.MetrcDownloadSummary
		).order_by(
			models.MetrcDownloadSummary.date.asc()
		).first()

		earliest_date = earliest_metrc_download_summary.date

		latest_metrc_download_summary = session.query(
			models.MetrcDownloadSummary
		).order_by(
			models.MetrcDownloadSummary.date.desc()
		).first()

		latest_date = latest_metrc_download_summary.date

	print(f'The earliest date Metrc download summary found is date {earliest_date}')
	print(f'The latest date Metrc download summary found is date {latest_date}')

	current_date = earliest_date
	while current_date <= latest_date:
		print(f'Deduping Metrc download summaries for date {current_date}...')

		with models.session_scope(session_maker) as session:
			metrc_download_summaries = session.query(
				models.MetrcDownloadSummary
			).filter(
				models.MetrcDownloadSummary.date == current_date
			).order_by(
				models.MetrcDownloadSummary.updated_at.desc()
			).all()

			license_number_set = set([])

			for metrc_download_summary in metrc_download_summaries:
				license_number = metrc_download_summary.license_number

				if license_number in license_number_set:
					print(f'Deleting duplicate Metrc download summary ({metrc_download_summary.date}, {metrc_download_summary.license_number})...')
					if not is_test_run:
						session.delete(metrc_download_summary)
				else:
					license_number_set.add(license_number)

		current_date = current_date + timedelta(days=1)


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
