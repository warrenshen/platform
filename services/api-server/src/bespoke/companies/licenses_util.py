import decimal
import logging

from typing import Any, Callable, Dict, List, Optional, Tuple, cast
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.db import metrc_models_util
from bespoke.db.metrc_models_util import (
	CompanyDeliveryObj 
)


CompanyLicenseInputDict = TypedDict('CompanyLicenseInputDict', {
	'id': str,
	'license_number': str,
	'company_id': str,
	'file_id': str,
	'rollup_id': str,
	'legal_name': str,
	'dba_name': str,
	'is_current': bool,
	'license_status': str,
	'license_category': str,
	'license_description': str,
	'expiration_date': str,
	'us_state': str,
	'estimate_zip': str,
	'estimate_latitude': float,
	'estimate_longitude': float,
	'facility_row_id': str,
	'is_underwriting_enabled': bool,
}, total=False)

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

def _update_company_license(
	company_license: models.CompanyLicense,
	license_input: CompanyLicenseInputDict,
) -> Optional[str]:
	l = license_input

	company_license.license_number = l['license_number'].strip()

	if l.get('company_id'):
		company_license.company_id = cast(Any, l['company_id'])
	if l.get('us_state'):
		company_license.us_state = l['us_state']
	if l.get('rollup_id'):
		company_license.rollup_id = l['rollup_id']
	if l.get('legal_name'):
		company_license.legal_name = l['legal_name']
	if l.get('dba_name'):
		company_license.dba_name = l['dba_name']
	if l.get('is_current') is not None:
		company_license.is_current = l['is_current']
	if l.get('license_status'):
		company_license.license_status = l['license_status']
	if l.get('license_category'):
		company_license.license_category = l['license_category']
	if l.get('license_description'):
		company_license.license_description = l['license_description']
	if l.get('expiration_date'):
		company_license.expiration_date = date_util.load_date_str(l['expiration_date'])
	if l.get('estimate_zip'):
		company_license.estimate_zip = l['estimate_zip']
	if l.get('estimate_latitude'):
		company_license.estimate_latitude = decimal.Decimal(l['estimate_latitude'])
	if l.get('estimate_longitude'):
		company_license.estimate_longitude = decimal.Decimal(l['estimate_longitude'])
	if l.get('facility_row_id'):
		company_license.facility_row_id = cast(Any, l.get('facility_row_id'))
	if l.get('is_underwriting_enabled') is not None:
		company_license.is_underwriting_enabled = l['is_underwriting_enabled']

	company_license.file_id = cast(Any, l.get('file_id')) if l.get('file_id') else None

	return str(company_license.id) if company_license.id else None

def _add_company_license(
	session: Session,
	license_input: CompanyLicenseInputDict,
) -> str:
	company_license = models.CompanyLicense()
	_update_company_license(company_license, license_input)
	session.add(company_license)
	session.flush()
	return str(company_license.id)


@errors.return_error_tuple
def create_update_license(
	session: Session,
	company_license_input: CompanyLicenseInputDict,
) -> Tuple[str, errors.Error]:
	company_license_id = company_license_input['id']
	license_number = company_license_input['license_number']

	if company_license_id:
		company_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).get(company_license_id))

		if not company_license:
			raise errors.Error('Could not find company license')

		license_id = _update_company_license(company_license, company_license_input)
	else:
		license_number = license_number.strip()
		company_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(models.CompanyLicense.license_number == license_number).first()
		)

		if company_license:
			return None, errors.Error(f"This license could not be added because it's already assigned to: {company_license.legal_name}")

		license_id = _add_company_license(session, company_license_input)

	return license_id, None


@errors.return_error_tuple
def create_update_licenses(
	company_id: str,
	company_license_inputs: List[CompanyLicenseInputDict],
	session: Session,
) -> Tuple[List[str], List[str], errors.Error]:
	license_ids = []
	existing_license_numbers = []

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
		# _add_license and _update_license depend on the license_input containing
		# the company_id.
		company_license_input['company_id'] = company_id

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

			license_id = _update_company_license(existing_company_license, company_license_input)
			license_ids.append(license_id)
		else:
			company_license = cast(
				models.CompanyLicense,
				session.query(models.CompanyLicense).filter(models.CompanyLicense.license_number == license_number).first()
			)

			if company_license:
				existing_license_numbers.append(company_license.license_number)

			else:
				license_id = _add_company_license(session, company_license_input)
				license_ids.append(license_id)

	return license_ids, existing_license_numbers, None

@errors.return_error_tuple
def bulk_update_licenses(
	session: Session,
	company_license_inputs: List[CompanyLicenseInputDict],
) -> Tuple[List[str], errors.Error]:

	license_numbers = []
	for license_input in company_license_inputs:
		if not license_input.get('license_number'):
			raise errors.Error('License number missing from license input {}'.format(license_input))

		license_numbers.append(license_input['license_number'])

	existing_company_licenses = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.license_number.in_(license_numbers)
		).all())

	license_number_to_license = {}
	for license in existing_company_licenses:
		license_number_to_license[license.license_number] = license

	license_ids = []

	for company_license_input in company_license_inputs:
		license_number = company_license_input['license_number']

		if license_number in license_number_to_license:
			existing_company_license = license_number_to_license[license_number]
			license_id = _update_company_license(existing_company_license, company_license_input)
			license_ids.append(license_id)
		else:
			license_id = _add_company_license(session, company_license_input)
			license_ids.append(license_id)

	return license_ids, None


@errors.return_error_tuple
def delete_license(license_id: str, session: Session) -> Tuple[str, errors.Error]:
	license = cast(models.CompanyLicense, session.query(models.CompanyLicense).get(
		license_id
	))

	if not license:
		raise errors.Error('No license found in DB matching license ID: ' + license_id)
	if license.is_underwriting_enabled:
		raise errors.Error('Cannot delete a license that is underwriting enabled')
	if license.facility_row_id != None:
		raise errors.Error('Cannot delete a license that is attached to a facility')

	license.is_deleted = True 

	return str(license.id), None

def populate_vendor_details(
	company_delivery_objs: List[CompanyDeliveryObj],
	session: Session) -> None:

	# Vendor licenses lookup
	shipper_license_numbers = []
	for company_delivery_obj in company_delivery_objs:
		metrc_transfer = company_delivery_obj.metrc_transfer
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		shipper_license_numbers.append(shipper_license_number)

	shipper_licenses = models_util.get_licenses_base_query(session).filter(
		models.CompanyLicense.license_number.in_(shipper_license_numbers)
	).all()

	shipper_license_to_company_id = {}
	for shipper_license in shipper_licenses:
		if shipper_license.company_id:
			shipper_license_to_company_id[shipper_license.license_number] = str(shipper_license.company_id)

	# Match based on license number
	for company_delivery_obj in company_delivery_objs:
		company_delivery = company_delivery_obj.company_delivery
		metrc_transfer = company_delivery_obj.metrc_transfer

		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		shipper_company_id = shipper_license_to_company_id.get(shipper_license_number)
		if shipper_company_id:
			company_delivery.vendor_id = cast(Any, shipper_company_id)

def populate_delivery_details(
	company_delivery_objs: List[CompanyDeliveryObj],  
	session: Session
) -> None:
	# Recipient licenses lookup
	recipient_license_numbers = []
	for company_delivery_obj in company_delivery_objs:
		metrc_delivery = company_delivery_obj.metrc_delivery
		recipient_license_number = metrc_delivery.recipient_facility_license_number
		recipient_license_numbers.append(recipient_license_number)

	recipient_licenses = models_util.get_licenses_base_query(session).filter(
		models.CompanyLicense.license_number.in_(recipient_license_numbers)
	).all()
	recipient_license_to_company_id = {}
	for recipient_license in recipient_licenses:
		if recipient_license.company_id:
			recipient_license_to_company_id[recipient_license.license_number] = str(recipient_license.company_id)

	for company_delivery_obj in company_delivery_objs:
		company_delivery = company_delivery_obj.company_delivery
		metrc_delivery = company_delivery_obj.metrc_delivery

		transfer_type = company_delivery.transfer_type
		recipient_license_number = metrc_delivery.recipient_facility_license_number
		recipient_company_id = recipient_license_to_company_id.get(recipient_license_number)
		if recipient_company_id:
			company_delivery.payor_id = cast(Any, recipient_company_id)

		shipper_company_id = company_delivery.vendor_id
		company_id = company_delivery.company_id

		delivery_type = metrc_models_util.get_delivery_type(
			transfer_type=transfer_type,
			company_id=str(company_id) if company_id else None,
			shipper_company_id=str(shipper_company_id) if shipper_company_id else None,
			recipient_company_id=recipient_company_id
		)
		company_delivery.delivery_type = delivery_type

def _get_company_delivery_objs(
	matching_transfers: List[models.MetrcTransfer], 
	matching_deliveries: List[models.MetrcDelivery],
	matching_company_deliveries: List[models.CompanyDelivery]
) -> List[CompanyDeliveryObj]:
	
	transfer_row_id_to_transfer: Dict[str, models.MetrcTransfer] = {}
	for metrc_transfer in matching_transfers:
		transfer_row_id = str(metrc_transfer.id)
		transfer_row_id_to_transfer[transfer_row_id] = metrc_transfer

	delivery_row_id_to_delivery: Dict[str, models.MetrcDelivery] = {}
	for metrc_delivery in matching_deliveries:
		delivery_row_id = str(metrc_delivery.id)
		delivery_row_id_to_delivery[delivery_row_id] = metrc_delivery

	company_delivery_objs: List[CompanyDeliveryObj] = []

	for company_delivery in matching_company_deliveries:
		transfer_row_id = str(company_delivery.transfer_row_id)
		delivery_row_id = str(company_delivery.delivery_row_id)

		if transfer_row_id not in transfer_row_id_to_transfer:
			logging.error('ERROR: Company Delivery ID {} has no matching MetrcTransfer'.format(company_delivery.id))
			continue
		metrc_transfer = transfer_row_id_to_transfer[transfer_row_id]

		if delivery_row_id not in delivery_row_id_to_delivery:
			logging.error('ERROR: Company Delivery ID {} has no matching MetrcDelivery'.format(company_delivery.id))
			continue

		metrc_delivery = delivery_row_id_to_delivery[delivery_row_id]
		company_delivery_objs.append(CompanyDeliveryObj(
			metrc_transfer=metrc_transfer,
			metrc_delivery=metrc_delivery,
			company_delivery=company_delivery
		))

	return company_delivery_objs

def _update_matching_transfers_and_deliveries(
	matching_transfers: List[models.MetrcTransfer], 
	matching_deliveries: List[models.MetrcDelivery],
	matching_company_deliveries: List[models.CompanyDelivery],
	session: Session,
) -> None:
	company_delivery_objs = _get_company_delivery_objs(
		matching_transfers, matching_deliveries, matching_company_deliveries)
	populate_vendor_details(company_delivery_objs, session)
	populate_delivery_details(company_delivery_objs, session)

def _update_metrc_rows_based_on_shipper(company_id: str, op: str, license_number: str, session: Session) -> None:
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

		transfer_row_ids = [str(metrc_transfer.id) for metrc_transfer in matching_transfers]
		
		matching_deliveries = []
		for transfer_row_id in transfer_row_ids:
			matching_deliveries_chunk = cast(
				List[models.MetrcDelivery],
				session.query(models.MetrcDelivery).filter(
					models.MetrcDelivery.transfer_row_id == transfer_row_id
				).all())
			matching_deliveries += matching_deliveries_chunk

		matching_company_deliveries = []
		for transfer_row_id in transfer_row_ids:
			matching_company_deliveries_chunk = cast(
				List[models.CompanyDelivery],
				session.query(models.CompanyDelivery).filter(
					models.CompanyDelivery.transfer_row_id == transfer_row_id
				).all())
			matching_company_deliveries += matching_company_deliveries_chunk

		for company_delivery in matching_company_deliveries:
			company_delivery.vendor_id = cast(Any, company_id)
			session.flush()

		_update_matching_transfers_and_deliveries(
			matching_transfers, matching_deliveries, matching_company_deliveries, session
		)

		page_index += 1

def _update_metrc_rows_based_on_recipient(company_id: str, op: str, license_number: str, session: Session) -> None:
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
		delivery_row_ids = set([])
		for metrc_delivery in matching_deliveries:
			transfer_row_ids.add(str(metrc_delivery.transfer_row_id))
			delivery_row_ids.add(str(metrc_delivery.id))

		matching_company_deliveries = []
		for transfer_row_id in transfer_row_ids:
			matching_company_deliveries_chunk = cast(
				List[models.CompanyDelivery],
				session.query(models.CompanyDelivery).filter(
					models.CompanyDelivery.transfer_row_id == transfer_row_id
				).all())
			matching_company_deliveries += matching_company_deliveries_chunk

		for company_delivery in matching_company_deliveries:
			company_delivery.payor_id = cast(Any, company_id)

		matching_transfers = []
		for transfer_row_id in transfer_row_ids:
			matching_transfers_chunk = cast(
				List[models.MetrcTransfer],
				session.query(models.MetrcTransfer).filter(
					models.MetrcTransfer.id == transfer_row_id
				).all())
			matching_transfers += matching_transfers_chunk

		_update_matching_transfers_and_deliveries(
			matching_transfers, matching_deliveries, matching_company_deliveries, session)

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

		_update_metrc_rows_based_on_shipper(company_id, mod['op'], mod['license_number'], session)

	with session_scope(session_maker) as session:
		_update_metrc_rows_based_on_recipient(company_id, mod['op'], mod['license_number'], session)

	return True, None
	