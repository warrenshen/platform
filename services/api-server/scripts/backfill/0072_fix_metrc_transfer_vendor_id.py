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

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	license_number_to_company_id = {}
	with models.session_scope(session_maker) as session:
		company_licenses = cast(
			List[models.CompanyLicense],
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.is_deleted.isnot(True)
			).all())

		for company_license in company_licenses:
			license_number_to_company_id[company_license.license_number] = str(company_license.company_id)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Fixing metrc transfers vendor_id...')

			try:
				metrc_transfers_batch = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).order_by(
						models.MetrcTransfer.id.asc() # Order by is necessary for batch-based iteration to work.
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())
			except Exception:
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_transfers_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_transfer in metrc_transfers_batch:
					shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
					shipper_facility_name = metrc_transfer.shipper_facility_name

					shipper_company_id = license_number_to_company_id.get(shipper_facility_license_number, None)

					if str(metrc_transfer.vendor_id) != shipper_company_id:
						print(f'[ACTION] Updating metrc transfer with manifest number {metrc_transfer.manifest_number}...')
						metrc_transfer.vendor_id = shipper_company_id

				current_page += 1

if __name__ == "__main__":
	main()
