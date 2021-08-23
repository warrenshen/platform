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

from bespoke.db import db_constants, metrc_models_util, models

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False
	metrc_transfer_index = 0

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
			print(f'[Page {current_page + 1}] Resetting metrc transfers with UNKNOWN type...')

			try:
				metrc_transfers_batch = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).order_by(
						models.MetrcTransfer.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				transfer_row_ids = [str(metrc_transfer.id) for metrc_transfer in metrc_transfers_batch]

				metrc_deliveries = cast(
					List[models.MetrcDelivery],
					session.query(models.MetrcDelivery).filter(
						models.MetrcDelivery.transfer_row_id.in_(transfer_row_ids)
					).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_transfers_batch) <= 0:
				is_done = True
				continue
			else:
				transfer_row_id_to_metrc_delivery = {}
				for metrc_delivery in metrc_deliveries:
					transfer_row_id_to_metrc_delivery[str(metrc_delivery.transfer_row_id)] = metrc_delivery

				for metrc_transfer in metrc_transfers_batch:
					metrc_transfer_index += 1

					if str(metrc_transfer.id) not in transfer_row_id_to_metrc_delivery:
						print(f'[{metrc_transfer_index}] Updating metrc type from {metrc_transfer.type} to UNKNOWN...')
						if not is_test_run:
							metrc_transfer.type = db_constants.TransferType.UNKNOWN
						continue

					if metrc_transfer.type and metrc_transfer.type in [
						db_constants.TransferType.INCOMING,
						db_constants.TransferType.OUTGOING,
					]:
						continue
					else:
						print(f'Found metrc transfer of invalid type "{metrc_transfer.type}" (manifest number {metrc_transfer.manifest_number})')

					metrc_delivery = transfer_row_id_to_metrc_delivery[str(metrc_transfer.id)]
					delivery_type = metrc_delivery.delivery_type

					if 'INCOMING' in delivery_type:
						transfer_type = db_constants.TransferType.INCOMING
					elif 'OUTGOING' in delivery_type:
						transfer_type = db_constants.TransferType.OUTGOING
					else:
						transfer_type = db_constants.TransferType.UNKNOWN

					print(f'[{metrc_transfer_index}] Updating metrc type from {metrc_transfer.type} to {transfer_type}...')
					if not is_test_run:
						metrc_transfer.type = transfer_type

					shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
					shipper_facility_name = metrc_transfer.shipper_facility_name
					shipper_company_id = license_number_to_company_id.get(shipper_facility_license_number, None)

					recipient_facility_license_number = metrc_delivery.recipient_facility_license_number
					recipient_facility_name = metrc_delivery.recipient_facility_name
					recipient_company_id = license_number_to_company_id.get(recipient_facility_license_number, None)

					if transfer_type == db_constants.TransferType.UNKNOWN:
						new_delivery_type = 'UNKNOWN'
					else:
						new_delivery_type = metrc_models_util.get_delivery_type(
							transfer_type=transfer_type,
							company_id=str(metrc_transfer.company_id),
							shipper_company_id=shipper_company_id,
							recipient_company_id=recipient_company_id
						)

					print(f'[{metrc_transfer_index}] Updating metrc delivery delivery type from {metrc_delivery.delivery_type} to {new_delivery_type}...')
					if not is_test_run:
						metrc_delivery.delivery_type = new_delivery_type

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
