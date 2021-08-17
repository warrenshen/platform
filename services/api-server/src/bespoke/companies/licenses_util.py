import datetime
import decimal
import json
from typing import Any, Callable, Dict, List, Optional, Tuple, cast
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.db import models
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.db import metrc_models_util
from bespoke.db.metrc_models_util import MetrcDeliveryObj, MetrcTransferObj, TransferDetails


CompanyLicenseInsertInputDict = TypedDict('CompanyLicenseInsertInputDict', {
	'id': str,
	'company_id': str,
	'file_id': str,
	'license_number': str,
})

LicenseModificationDict = TypedDict('LicenseModificationDict', {
	'license_number': str,
	'license_row_id': str,
	'op': str
})

@errors.return_error_tuple
def add_licenses(
	company_id: str,
	file_ids: List[str],
	session: Session,
) -> Tuple[List[str], errors.Error]:

	if not company_id:
		raise errors.Error('Company ID is required')

	if not file_ids:
		raise errors.Error('File IDs are required')

	new_license_ids = []
	for file_id in file_ids:
		new_license = models.CompanyLicense( # type: ignore
			company_id=company_id,
			file_id=file_id
		)
		session.add(new_license)
		session.flush()
		new_license_ids.append(str(new_license.id))

	return new_license_ids, None


@errors.return_error_tuple
def create_update_licenses(
	company_id: str,
	company_license_inputs: List[CompanyLicenseInsertInputDict],
	session: Session,
) -> Tuple[List[str], errors.Error]:
	license_ids = []

	existing_company_licenses = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.company_id == company_id
		).all())

	company_licenses_to_delete = []
	for existing_company_license in existing_company_licenses:
		is_company_license_deleted = len(list(filter(
			lambda company_license_input: company_license_input['id'] == str(existing_company_license.id),
			company_license_inputs
		))) <= 0
		if is_company_license_deleted:
			company_licenses_to_delete.append(existing_company_license)

	for company_license_to_delete in company_licenses_to_delete:
		company_license_to_delete.is_deleted = True

	for company_license_input in company_license_inputs:
		company_license_id = company_license_input['id']
		license_number = company_license_input['license_number']
		file_id = company_license_input['file_id']

		################################
		# Validations
		# Note that we do not enforce that file id is present. This is because
		# we want to allow bank user to enter in a license with only a license
		# number and then later on upload the corresponding file attachment.
		################################
		if not license_number:
			raise errors.Error('License number is required')

		license_number = license_number.strip()

		if company_license_id:
			existing_company_license = cast(
				models.CompanyLicense,
				session.query(models.CompanyLicense).get(company_license_id)
			)

			if not existing_company_license:
				raise errors.Error('Could not find company license')

			existing_company_license.license_number = license_number
			existing_company_license.file_id = file_id # type: ignore

			license_ids.append(str(existing_company_license.id))
		else:
			new_company_license = models.CompanyLicense( # type: ignore
				company_id=company_id,
				file_id=file_id,
				license_number=license_number,
			)
			session.add(new_company_license)
			session.flush()

			license_ids.append(str(new_company_license.id))

	return license_ids, None


@errors.return_error_tuple
def delete_license(
	company_id: str,
	file_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:

	if not company_id:
		raise errors.Error('Company ID is required')

	if not file_id:
		raise errors.Error('File ID is required')

	existing_license = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.company_id == company_id
		).filter(
			models.CompanyLicense.file_id == file_id
		).first())

	if not existing_license:
		raise errors.Error('No file to delete could be found')

	cast(Callable, session.delete)(existing_license)

	return True, None


def populate_transfer_vendor_details(
	metrc_transfer_objs: List[MetrcTransferObj],
	transfer_id_to_details: Dict[str, TransferDetails],
	session: Session) -> None:

	# Vendor licenses lookup
	shipper_license_numbers = []
	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		shipper_license_numbers.append(shipper_license_number)

	shipper_licenses = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number.in_(shipper_license_numbers)
	).all()

	shipper_license_to_company_id = {}
	for shipper_license in shipper_licenses:
		shipper_license_to_company_id[shipper_license.license_number] = str(shipper_license.company_id)

	# Match based on license number
	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		shipper_company_id = shipper_license_to_company_id.get(shipper_license_number)
		if shipper_company_id:
			metrc_transfer.vendor_id = cast(Any, shipper_company_id)
			transfer_id_to_details[metrc_transfer.transfer_id] = TransferDetails(
				vendor_id=shipper_company_id 
			)

def populate_delivery_details(
	deliveries: List[MetrcDeliveryObj],
	transfer_id_to_details: Dict[str, TransferDetails],  
	session: Session
	) -> None:
	# Recipient licenses lookup
	recipient_license_numbers = []
	for delivery in deliveries:
		metrc_delivery = delivery.metrc_delivery
		recipient_license_number = metrc_delivery.recipient_facility_license_number
		recipient_license_numbers.append(recipient_license_number)

	recipient_licenses = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number.in_(recipient_license_numbers)
	).all()
	recipient_license_to_company_id = {}
	for recipient_license in recipient_licenses:
		recipient_license_to_company_id[recipient_license.license_number] = str(recipient_license.company_id)

	for delivery in deliveries:
		# TODO(dlluncor): Drop: payor_id, transfer_type from transfers table
		metrc_delivery = delivery.metrc_delivery
		transfer_type = delivery.transfer_type
		recipient_license_number = metrc_delivery.recipient_facility_license_number
		recipient_company_id = recipient_license_to_company_id.get(recipient_license_number)
		if recipient_company_id:
			metrc_delivery.payor_id = cast(Any, recipient_company_id)

		shipper_company_id = None
		if delivery.transfer_id in transfer_id_to_details:
			shipper_company_id = transfer_id_to_details[delivery.transfer_id]['vendor_id']

		company_id = delivery.company_id

		delivery_type = metrc_models_util.get_delivery_type(
			transfer_type=transfer_type,
			company_id=company_id,
			shipper_company_id=shipper_company_id,
			recipient_company_id=recipient_company_id
		)

		metrc_delivery.delivery_type = delivery_type

def _get_transfer_objs(
	matching_transfers: List[models.MetrcTransfer], 
	matching_deliveries: List[models.MetrcDelivery]) -> List[MetrcTransferObj]:
	transfer_objs = []

	transfer_id_to_deliveries: Dict[str, List[models.MetrcDelivery]] = {}
	for metrc_delivery in matching_deliveries:
		transfer_id = str(metrc_delivery.transfer_row_id)
		if transfer_id not in transfer_id_to_deliveries:
			transfer_id_to_deliveries[transfer_id] = []

		transfer_id_to_deliveries[transfer_id].append(metrc_delivery)

	for metrc_transfer in matching_transfers:
		transfer_id = str(metrc_transfer.id)

		delivery_objs = []
		if transfer_id in transfer_id_to_deliveries:
			metrc_deliveries = transfer_id_to_deliveries[transfer_id]

			for metrc_delivery in metrc_deliveries:
				delivery_objs.append(MetrcDeliveryObj(
					metrc_delivery=metrc_delivery, 
					transfer_type=metrc_transfer.type,
					transfer_id=str(metrc_transfer.id),
					company_id=str(metrc_transfer.company_id)
				))

		transfer_objs.append(MetrcTransferObj(
			metrc_transfer=metrc_transfer,
			deliveries=delivery_objs
		))

	return transfer_objs

def _update_matching_transfers_and_deliveries(
	matching_transfers: List[models.MetrcTransfer], 
	matching_deliveries: List[models.MetrcDelivery],
	session: Session) -> None:

	transfer_id_to_details: Dict[str, TransferDetails] = {}
	transfer_objs = _get_transfer_objs(matching_transfers, matching_deliveries)
	populate_transfer_vendor_details(transfer_objs, transfer_id_to_details, session)		
	
	all_delivery_objs = []
	for transfer_obj in transfer_objs:
		all_delivery_objs.extend(transfer_obj.deliveries)

	populate_delivery_details(all_delivery_objs, transfer_id_to_details, session)

def _update_metrc_rows_based_on_vendor(company_id: str, license_number: str, session: Session) -> None:
	# Update the vendor_id if it matches any shipper license numbers
	is_done = False
	page_index = 0
	batch_size = 5

	while not is_done:
		matching_transfers = cast(
			List[models.MetrcTransfer],
			session.query(models.MetrcTransfer).filter(
				models.MetrcTransfer.shipper_facility_license_number == license_number).offset(
				page_index * batch_size
			).limit(batch_size).all())

		if not matching_transfers:
			is_done = True
			break

		transfer_row_ids = []
		for metrc_transfer in matching_transfers:
			metrc_transfer.vendor_id = cast(Any, company_id)
			transfer_row_ids.append(str(metrc_transfer.id))

		matching_deliveries = cast(
			List[models.MetrcDelivery],
			session.query(models.MetrcDelivery).filter(
				models.MetrcDelivery.transfer_row_id.in_(transfer_row_ids)).all())

		_update_matching_transfers_and_deliveries(matching_transfers, matching_deliveries, session)

		page_index += 1

def _update_metrc_rows_based_on_recipient(company_id: str, license_number: str, session: Session) -> None:
	is_done = False
	page_index = 0
	batch_size = 5

	while not is_done:
		matching_deliveries = cast(
			List[models.MetrcDelivery],
			session.query(models.MetrcDelivery).filter(
				models.MetrcDelivery.recipient_facility_license_number == license_number).offset(
				page_index * batch_size
			).limit(batch_size).all())

		if not matching_deliveries:
			is_done = True
			break

		transfer_row_ids = set([])
		for metrc_delivery in matching_deliveries:
			transfer_row_ids.add(str(metrc_delivery.transfer_row_id))

		matching_transfers = cast(
			List[models.MetrcTransfer],
			session.query(models.MetrcTransfer).filter(
				models.MetrcTransfer.id.in_(transfer_row_ids)).all())

		_update_matching_transfers_and_deliveries(matching_transfers, matching_deliveries, session)

		page_index += 1

@errors.return_error_tuple
def update_metrc_rows_on_license_change(
	mod: LicenseModificationDict, session_maker: Callable) -> Tuple[bool, errors.Error]:

	with session_scope(session_maker) as session:
		existing_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.id == mod['license_row_id']).first())
		if not existing_license:
			raise errors.Error('No license found in DB matching row ID {}'.format(mod['license_row_id']))

		company_id = str(existing_license.company_id)
		if mod['op'] == DBOperation.DELETE:
			# If the user deleted the license, we want to set company_id to None, since
			# this license is no longer associated with a company.
			company_id = None

		_update_metrc_rows_based_on_vendor(company_id, mod['license_number'], session)

	with session_scope(session_maker) as session:
		_update_metrc_rows_based_on_recipient(company_id, mod['license_number'], session)

	return True, None
