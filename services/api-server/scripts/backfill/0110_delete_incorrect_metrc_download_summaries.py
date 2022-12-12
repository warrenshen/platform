"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script deletes incorrect metrc_download_summaries that were created on 11/29/2022.
All the incorrect metrc_download_summaries have SUCCESS for all the status columns.

Why:
There was a bug in the code which resulted in these incorrect metrc_download_summaries being created.
"""

import os
import sys
from datetime import timedelta
from os import path

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import MetrcLicenseCategoryDownloadStatus


def main(is_test_run: bool) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			metrc_download_summaries = session.query(
				models.MetrcDownloadSummary
			).filter(
				models.MetrcDownloadSummary.updated_at > date_util.load_date_str('2022-11-29')
			).filter(
				models.MetrcDownloadSummary.updated_at < date_util.load_date_str('2022-12-01')
			).filter(
				models.MetrcDownloadSummary.harvests_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).filter(
				models.MetrcDownloadSummary.packages_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).filter(
				models.MetrcDownloadSummary.plant_batches_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).filter(
				models.MetrcDownloadSummary.plants_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).filter(
				models.MetrcDownloadSummary.sales_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).filter(
				models.MetrcDownloadSummary.transfers_status == MetrcLicenseCategoryDownloadStatus.SUCCESS
			).order_by(
				models.MetrcDownloadSummary.updated_at.desc()
			).limit(
				50
			).all()

			if len(metrc_download_summaries) <= 0:
				is_done = True
			else:
				print(f'Total count of Metrc download summaries to be deleted: {len(metrc_download_summaries)}')

				for metrc_download_summary in metrc_download_summaries:
					print(f'Deleting incorrect Metrc download summary ({metrc_download_summary.date}, {metrc_download_summary.license_number}, {metrc_download_summary.updated_at})...')
					if not is_test_run:
						session.delete(metrc_download_summary)

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
