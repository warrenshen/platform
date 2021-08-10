import datetime
import decimal
import json
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

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

def _update_vendor_id_on_metrc_rows(company_id: str, license_number: str, session: Session) -> None:
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

		for metrc_transfer in matching_transfers:
			metrc_transfer.vendor_id = cast(Any, company_id)

		page_index += 1

def _update_payor_id_on_metrc_rows(company_id: str, license_number: str, session: Session) -> None:
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

		transfer_row_ids = [metrc_delivery.transfer_row_id for metrc_delivery in matching_deliveries]

		matching_transfers = cast(
			List[models.MetrcTransfer],
			session.query(models.MetrcTransfer).filter(
				models.MetrcTransfer.id.in_(transfer_row_ids)).all())

		for metrc_transfer in matching_transfers:
			metrc_transfer.payor_id = cast(Any, company_id)

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

		_update_vendor_id_on_metrc_rows(company_id, mod['license_number'], session)

	with session_scope(session_maker) as session:
		_update_payor_id_on_metrc_rows(company_id, mod['license_number'], session)

	return True, None
