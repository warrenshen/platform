"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Any,  Callable, Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import db_constants, metrc_models_util, models

def _add_company_deliveries(
	metrc_transfers: List[models.MetrcTransfer],
	metrc_deliveries: List[models.MetrcDelivery],
	session: Any) -> None:

	metrc_transfer_index = 0
	all_license_numbers = set([])

	transfer_row_ids = set([])
	for metrc_transfer in metrc_transfers:
		transfer_row_ids.add(str(metrc_transfer.id))
		all_license_numbers.add(metrc_transfer.shipper_facility_license_number)

	delivery_row_ids = set([])
	transfer_row_id_to_metrc_deliveries: Dict[str, List[models.MetrcDelivery]] = {}
	for metrc_delivery in metrc_deliveries:
		transfer_row_id = str(metrc_delivery.transfer_row_id)
		if transfer_row_id not in transfer_row_id_to_metrc_deliveries:
			transfer_row_id_to_metrc_deliveries[transfer_row_id] = []

		transfer_row_id_to_metrc_deliveries[transfer_row_id].append(metrc_delivery)
		delivery_row_ids.add(str(metrc_delivery.id))
		all_license_numbers.add(metrc_delivery.recipient_facility_license_number)

	company_deliveries = cast(
		List[models.CompanyDelivery],
		session.query(models.CompanyDelivery).filter(
			models.CompanyDelivery.delivery_row_id.in_(delivery_row_ids)
		).filter(
			models.CompanyDelivery.transfer_row_id.in_(transfer_row_ids)
		).all())

	existing_company_deliveries = {}
	for company_delivery in company_deliveries:
		existing_company_deliveries[(str(company_delivery.transfer_row_id), str(company_delivery.delivery_row_id))] = True

	# Pull licenses
	license_number_to_company_id = {}
	company_licenses = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			cast(Callable, models.CompanyLicense.is_deleted.isnot)(True)
		).filter(
			models.CompanyLicense.license_number.in_(all_license_numbers)
		).all())

	for company_license in company_licenses:
		license_number_to_company_id[company_license.license_number] = str(company_license.company_id)

	for metrc_transfer in metrc_transfers:
		metrc_transfer_index += 1
		transfer_row_id = str(metrc_transfer.id)

		if transfer_row_id not in transfer_row_id_to_metrc_deliveries:
			print(f'[{metrc_transfer_index}] No metrc deliveries! Attempting to determine metrc transfer (manifest number {metrc_transfer.manifest_number})...')
			continue

		metrc_deliveries = transfer_row_id_to_metrc_deliveries[transfer_row_id]

		for metrc_delivery in metrc_deliveries:
			delivery_row_id = str(metrc_delivery.id)

			key = (transfer_row_id, delivery_row_id)
			if key in existing_company_deliveries:
				print(f'NOTE: {key} (transfer_row_id, delivery_row_id) already was backfilled into CompanyDelivery')
				continue

			shipper_license_number = metrc_transfer.shipper_facility_license_number
			shipper_company_id = license_number_to_company_id.get(shipper_license_number, None)

			recipient_facility_license_number = metrc_delivery.recipient_facility_license_number
			recipient_company_id = license_number_to_company_id.get(recipient_facility_license_number, None)
			us_state = metrc_delivery.us_state

			if shipper_company_id:
				print(f'[{metrc_transfer_index}] Adding OUTGOING company delivery (manifest number {metrc_transfer.manifest_number})...')
				# This is an outgoing delivery from the shipper's perspective
				out_delivery = models.CompanyDelivery()
				out_delivery.company_id = cast(Any, shipper_company_id)
				out_delivery.license_number = shipper_license_number
				out_delivery.us_state = us_state
				out_delivery.vendor_id = cast(Any, shipper_company_id)
				out_delivery.payor_id = cast(Any, recipient_company_id)
				out_delivery.transfer_row_id = cast(Any, transfer_row_id)
				out_delivery.transfer_type = db_constants.TransferType.OUTGOING
				out_delivery.delivery_row_id = cast(Any, delivery_row_id)
				out_delivery.delivery_type = metrc_models_util.get_delivery_type(
					transfer_type=db_constants.TransferType.OUTGOING,
					company_id=shipper_company_id,
					shipper_company_id=shipper_company_id,
					recipient_company_id=recipient_company_id
				)
				session.add(out_delivery)

			if recipient_company_id:
				print(f'[{metrc_transfer_index}] Adding INCOMING company delivery (manifest number {metrc_transfer.manifest_number})...')
				# This is an incoming delivery from the receipient's perspective
				in_delivery = models.CompanyDelivery()
				in_delivery.company_id = cast(Any, recipient_company_id)
				in_delivery.license_number = recipient_facility_license_number
				in_delivery.us_state = us_state
				in_delivery.vendor_id = cast(Any, shipper_company_id)
				in_delivery.payor_id = cast(Any, recipient_company_id)
				in_delivery.transfer_row_id = cast(Any, transfer_row_id)
				in_delivery.transfer_type = db_constants.TransferType.INCOMING
				in_delivery.delivery_row_id = cast(Any, delivery_row_id)
				in_delivery.delivery_type = metrc_models_util.get_delivery_type(
					transfer_type=db_constants.TransferType.INCOMING,
					company_id=recipient_company_id,
					shipper_company_id=shipper_company_id,
					recipient_company_id=recipient_company_id
				)
				session.add(in_delivery)

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Trying to add company deliveries from metrc deliveries...')

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
				_add_company_deliveries(
					metrc_transfers_batch, metrc_deliveries, session)
				session.flush()
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
