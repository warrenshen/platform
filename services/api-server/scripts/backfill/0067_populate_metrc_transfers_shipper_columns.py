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

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Populating metrc transfers transfer_id...')

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
					transfer_payload = metrc_transfer.transfer_payload
					shipper_facility_license_number = transfer_payload['ShipperFacilityLicenseNumber']
					shipper_facility_name = transfer_payload['ShipperFacilityName']

					if not metrc_transfer.shipper_facility_license_number or not metrc_transfer.shipper_facility_name:
						metrc_transfer.shipper_facility_license_number = shipper_facility_license_number
						metrc_transfer.shipper_facility_name = shipper_facility_name

				current_page += 1

if __name__ == "__main__":
	main()
