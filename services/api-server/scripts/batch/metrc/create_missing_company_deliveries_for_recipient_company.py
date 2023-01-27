"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script creates incoming company deliveries for a given (recipient) company.
1. Get licenses associated with given company.
2. For each license, find metrc deliveries for which recipient facility license number is this license.
3. For each metrc delivery, create incoming company delivery if it is missing.

Why:
You can run this script when you think a company is missing incoming company deliveries.
"""

import argparse
import os
import sys
import time
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../")))

from bespoke.db import models
from bespoke.metrc import company_deliveries_util

def main(is_test_run: bool, company_identifier: str) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_id = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		if not company:
			print('ERROR! No company exists for given company identifier')
			return
		else:
			company_id = str(company.id)

	company_license_numbers = []

	with models.session_scope(session_maker) as session:
		company_licenses = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.company_id == company_id
			).all())

		company_license_numbers = [company_license.license_number for company_license in company_licenses]

	for license_number in company_license_numbers:
		current_page = 0
		BATCH_SIZE = 50
		is_done = False

		print(f'[License number {license_number}] Trying to create missing company deliveries for recipient company...')
		while not is_done:
			print(f'[License number {license_number}] Page {current_page + 1}]...')

			with models.session_scope(session_maker) as session:
				try:
					metrc_deliveries_batch = cast(
						List[models.MetrcDelivery],
						session.query(models.MetrcDelivery).filter(
							models.MetrcDelivery.recipient_facility_license_number == license_number
						).order_by(
							models.MetrcDelivery.id
						).offset(
							current_page * BATCH_SIZE
						).limit(BATCH_SIZE).all())
				except Exception as e:
					print(e)
					print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
					time.sleep(5)

				if len(metrc_deliveries_batch) <= 0:
					is_done = True
					continue
				else:
					transfer_row_ids = set([])
					for metrc_delivery in metrc_deliveries_batch:
						transfer_row_ids.add(str(metrc_delivery.transfer_row_id))

					metrc_transfers = cast(
						List[models.MetrcTransfer],
						session.query(models.MetrcTransfer).filter(
							models.MetrcTransfer.id.in_(transfer_row_ids)
						).all())

					company_deliveries_util.create_missing_company_deliveries_for_metrc_transfers(
						session=session,
						metrc_transfers=metrc_transfers,
						is_test_run=is_test_run,
					)

					session.flush()
					current_page += 1

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to perform action on')

if __name__ == "__main__":
	args = parser.parse_args()

	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run=is_test_run, company_identifier=args.company_identifier)
