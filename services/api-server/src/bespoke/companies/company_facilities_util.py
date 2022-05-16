import logging

from typing import List, Tuple, cast
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.db import models

CompanyFacilityInputDict = TypedDict('CompanyFacilityInputDict', {
	'id': str,
	'company_id': str,
	'name': str,
	'address': str,
})


@errors.return_error_tuple
def create_update_company_facility(
	company_facility_input: CompanyFacilityInputDict,
	session: Session,
) -> Tuple[str, errors.Error]:
	company_facility_id = company_facility_input['id']
	company_id = company_facility_input['company_id']
	company_facility_name = company_facility_input['name']
	company_facility_address = company_facility_input['address']

	if company_facility_id:
		company_facility = cast(
			models.CompanyFacility,
			session.query(models.CompanyFacility).filter(
				models.CompanyFacility.id == company_facility_id
			).first())

		if not company_facility:
			raise errors.Error('Company facility could not be found')

		company_facility.name = company_facility_name
		company_facility.address = company_facility_address
	else:
		company_facility = models.CompanyFacility(
			company_id=company_id,
			name=company_facility_name,
			address=company_facility_address,
		)
		session.add(company_facility)

	return str(company_facility.id), None


@errors.return_error_tuple
def delete_company_facility(
	company_facility_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:
	if not company_facility_id:
		raise errors.Error('Company facility ID is required')

	existing_company_facility = cast(
		models.CompanyFacility,
		session.query(models.CompanyFacility).filter(
			models.CompanyFacility.id == company_facility_id
		).first())
	if not existing_company_facility:
		raise errors.Error('Company facility could not be found')

	company_licenses = cast(
		List[models.CompanyLicense],
		session.query(models.CompanyLicense).filter(
			models.CompanyLicense.facility_row_id == company_facility_id
		).all())

	for company_license in company_licenses:
		company_license.facility_row_id = None

	existing_company_facility.is_deleted = True

	return True, None
