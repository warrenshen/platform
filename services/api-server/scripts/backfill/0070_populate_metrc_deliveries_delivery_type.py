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
			print(f'[Page {current_page + 1}] Populating metrc deliveries delivery_type...')

			try:
				metrc_deliveries_batch = cast(
					List[models.MetrcDelivery],
					session.query(models.MetrcDelivery).order_by(
						models.MetrcDelivery.id.asc() # Order by is necessary for batch-based iteration to work.
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				transfer_row_ids = [metrc_delivery.transfer_row_id for metrc_delivery in metrc_deliveries_batch]

				metrc_transfers = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).filter(
						models.MetrcTransfer.id.in_(transfer_row_ids)
					).all())
			except Exception:
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_deliveries_batch) <= 0:
				is_done = True
				continue
			else:
				transfer_row_id_to_metrc_transfer = {}
				for metrc_transfer in metrc_transfers:
					transfer_row_id_to_metrc_transfer[str(metrc_transfer.id)] = metrc_transfer

				for metrc_delivery in metrc_deliveries_batch:
					recipient_facility_license_number = metrc_delivery.recipient_facility_license_number
					recipient_facility_name = metrc_delivery.recipient_facility_name
					recipient_company_id = license_number_to_company_id.get(recipient_facility_license_number, None)
					metrc_delivery.payor_id = recipient_company_id

					if not metrc_delivery.delivery_type:
						metrc_transfer = transfer_row_id_to_metrc_transfer[str(metrc_delivery.transfer_row_id)]
						shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
						shipper_facility_name = metrc_transfer.shipper_facility_name
						shipper_company_id = license_number_to_company_id.get(shipper_facility_license_number, None)
						company_id = str(metrc_transfer.company_id)

						is_company_shipper = shipper_company_id and shipper_company_id == company_id
						is_company_recipient = recipient_company_id and recipient_company_id == company_id

						transfer_type = None
						if is_company_shipper:
							transfer_type = db_constants.TransferType.OUTGOING
						elif is_company_recipient:
							transfer_type = db_constants.TransferType.INCOMING
						else:
							print(f'Could not determine transfer type for metrc transfer with id {str(metrc_transfer.id)} manifest number {metrc_transfer.manifest_number}')
							print(company_id, shipper_company_id, recipient_company_id)
							print(shipper_facility_name, shipper_facility_license_number, recipient_facility_name, recipient_facility_license_number)
							continue

						if not is_company_shipper and not is_company_recipient:
							delivery_type = 'UNKNOWN'
						else:
							if is_company_shipper and is_company_recipient:
								delivery_type = f'{transfer_type}_INTERNAL'
							elif transfer_type == db_constants.TransferType.INCOMING:
								delivery_type = 'INCOMING_FROM_VENDOR'
							else: # transfer_type == db_constants.TransferType.OUTGOING:
								delivery_type = 'OUTGOING_TO_PAYOR'

						metrc_delivery.delivery_type = delivery_type

				current_page += 1

if __name__ == "__main__":
	main()
