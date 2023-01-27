from typing import Any, Callable, Dict, List, cast

from sqlalchemy.orm.session import Session

from bespoke.db import db_constants, metrc_models_util, models

def create_missing_company_deliveries_for_metrc_transfers(
	session: Session,
	metrc_transfers: List[models.MetrcTransfer],
	is_test_run: bool,
) -> None:
	all_license_numbers = set([])

	transfer_row_ids = set([])
	for metrc_transfer in metrc_transfers:
		transfer_row_ids.add(str(metrc_transfer.id))
		all_license_numbers.add(metrc_transfer.shipper_facility_license_number)

	metrc_deliveries = cast(
		List[models.MetrcDelivery],
		session.query(models.MetrcDelivery).filter(
			models.MetrcDelivery.transfer_row_id.in_(transfer_row_ids)
		).all())

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
		license_number_to_company_id[company_license.license_number] = str(company_license.company_id) if company_license.company_id else None

	metrc_transfer_index = 0

	for metrc_transfer in metrc_transfers:
		metrc_transfer_index += 1
		transfer_row_id = str(metrc_transfer.id)

		if transfer_row_id not in transfer_row_id_to_metrc_deliveries:
			print(f'[{metrc_transfer_index}] No metrc deliveries! Attempting to determine metrc transfer (manifest number {metrc_transfer.manifest_number})...')
			continue

		metrc_deliveries = transfer_row_id_to_metrc_deliveries[transfer_row_id]

		for metrc_delivery in metrc_deliveries:
			delivery_row_id = str(metrc_delivery.id)

			shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
			shipper_company_id = license_number_to_company_id.get(shipper_facility_license_number, None)

			recipient_facility_license_number = metrc_delivery.recipient_facility_license_number
			recipient_company_id = license_number_to_company_id.get(recipient_facility_license_number, None)
			us_state = metrc_delivery.us_state

			is_same_license = shipper_facility_license_number == recipient_facility_license_number

			if shipper_company_id:
				# us_state, license_number, company_id, transfer_row_id, delivery_row_id
				existing_outgoing_company_delivery = cast(
					models.CompanyDelivery,
					session.query(models.CompanyDelivery).filter(
						models.CompanyDelivery.us_state == us_state
					).filter(
						models.CompanyDelivery.license_number == shipper_facility_license_number
					).filter(
						models.CompanyDelivery.company_id == shipper_company_id
					).filter(
						models.CompanyDelivery.transfer_row_id == transfer_row_id
					).filter(
						models.CompanyDelivery.delivery_row_id == delivery_row_id
					).first())

				# if existing_outgoing_company_delivery:
					# print(f'[{metrc_transfer_index}] Existing OUTGOING company delivery (manifest number {metrc_transfer.manifest_number})...')
				if not existing_outgoing_company_delivery:
					print(f'[{metrc_transfer_index}] Adding OUTGOING company delivery (manifest number {metrc_transfer.manifest_number})...')
					if not is_test_run:
						# This is an outgoing delivery from the shipper's perspective
						out_delivery = models.CompanyDelivery()
						out_delivery.company_id = cast(Any, shipper_company_id)
						out_delivery.license_number = shipper_facility_license_number
						out_delivery.us_state = us_state
						out_delivery.vendor_id = cast(Any, shipper_company_id)
						out_delivery.payor_id = cast(Any, recipient_company_id)
						out_delivery.transfer_row_id = cast(Any, transfer_row_id)
						out_delivery.transfer_type = db_constants.TransferType.INTERNAL if is_same_license else db_constants.TransferType.OUTGOING
						out_delivery.delivery_row_id = cast(Any, delivery_row_id)
						out_delivery.delivery_type = metrc_models_util.get_delivery_type(
							transfer_type=out_delivery.transfer_type,
							company_id=shipper_company_id,
							shipper_company_id=shipper_company_id,
							recipient_company_id=recipient_company_id
						)
						session.add(out_delivery)

			if not is_same_license and recipient_company_id:
				# us_state, license_number, company_id, transfer_row_id, delivery_row_id
				existing_incoming_company_delivery = cast(
					models.CompanyDelivery,
					session.query(models.CompanyDelivery).filter(
						models.CompanyDelivery.us_state == us_state
					).filter(
						models.CompanyDelivery.license_number == recipient_facility_license_number
					).filter(
						models.CompanyDelivery.company_id == recipient_company_id
					).filter(
						models.CompanyDelivery.transfer_row_id == transfer_row_id
					).filter(
						models.CompanyDelivery.delivery_row_id == delivery_row_id
					).first())

				# if existing_incoming_company_delivery:
					# print(f'[{metrc_transfer_index}] Existing INCOMING company delivery (manifest number {metrc_transfer.manifest_number})...')
				if not existing_incoming_company_delivery:
					# Dont add another transfer if it's coming from the same license
					print(f'[{metrc_transfer_index}] Adding INCOMING company delivery (manifest number {metrc_transfer.manifest_number})...')
					if not is_test_run:
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
