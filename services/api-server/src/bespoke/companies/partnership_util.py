"""
	Utility functions related to company-vendor and company-payor relationships
"""
from typing import List, Tuple, cast
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

from bespoke.db import models, db_constants
from bespoke import errors

ContactDict = TypedDict('ContactDict', {
	'email': str,
	'phone_number': str
})

def _users_to_contacts(users: List[models.User]) -> List[ContactDict]:
	if not users:
		return []

	return [
		ContactDict(
			email=user.email,
			phone_number=user.phone_number
		) for user in users
	]

def _get_vendor_contacts(partnership_id: str, session: Session) -> Tuple[List[ContactDict], errors.Error]:
	partnership = cast(
		models.CompanyVendorPartnership,
		session.query(models.CompanyVendorPartnership).filter(
			models.CompanyVendorPartnership.id == partnership_id
		).first())
	if not partnership:
		return None, errors.Error('Could not determine vendor contacts because the partnership was not found')

	contacts = cast(
		List[models.CompanyVendorContact],
		session.query(models.CompanyVendorContact).filter(
			models.CompanyVendorContact.partnership_id == partnership_id
		).all())

	if contacts:
		return _users_to_contacts([contact.vendor_user for contact in contacts]), None

	# If users specific to the company / vendor relationship are not set, then default to all
	# all users associated with this vendor
	vendor_users = cast(List[models.User], session.query(
		models.User).filter_by(company_id=partnership.vendor_id).all())

	return _users_to_contacts(vendor_users), None

def _get_payor_contacts(partnership_id: str, session: Session) -> Tuple[List[ContactDict], errors.Error]:
	partnership = cast(
		models.CompanyPayorPartnership,
		session.query(models.CompanyPayorPartnership).filter(
			models.CompanyPayorPartnership.id == partnership_id
		).first())
	if not partnership:
		return None, errors.Error('Could not determine payor contacts because the partnership was not found')

	contacts = cast(
		List[models.CompanyPayorContact],
		session.query(models.CompanyPayorContact).filter(
			models.CompanyPayorContact.partnership_id == partnership_id
		).all())

	if contacts:
		return _users_to_contacts([contact.payor_user for contact in contacts]), None

	# If users specific to the company / payor relationship are not set, then default to all
	# all users associated with this payor
	payor_users = cast(List[models.User], session.query(
		models.User).filter_by(company_id=partnership.payor_id).all())

	return _users_to_contacts(payor_users), None

def get_partner_contacts(
	partnership_id: str, partnership_type: str, session: Session) -> Tuple[List[ContactDict], errors.Error]:
	"""
	In this case, the partner is either the vendor or the payor. 
	"""
	if partnership_type == db_constants.CompanyType.Vendor:
		return _get_vendor_contacts(partnership_id, session)
	elif partnership_type == db_constants.CompanyType.Payor:
		return _get_payor_contacts(partnership_id, session)

	return None, errors.Error('Unrecognized partnership type "{}"'.format(partnership_type))

def get_partner_contacts_using_company_ids(
	customer_company_id: str,
	partner_company_id: str, 
	partnership_type: str, 
	session: Session) -> Tuple[List[ContactDict], errors.Error]:
	"""
	In this case, the partner is either the vendor or the payor. 
	"""
	if partnership_type == db_constants.CompanyType.Vendor:
		vendor_partnership = cast(
				models.CompanyVendorPartnership,
				session.query(models.CompanyVendorPartnership).filter(
					models.CompanyVendorPartnership.company_id == customer_company_id
				).filter(
					models.CompanyVendorPartnership.vendor_id == partner_company_id
				).first())
		if not vendor_partnership:
			return None, errors.Error('Could not determine vendor contacts because the partnership was not found based on the provided company IDs')

		return _get_vendor_contacts(str(vendor_partnership.id), session)

	elif partnership_type == db_constants.CompanyType.Payor:
		payor_partnership = cast(
				models.CompanyPayorPartnership,
				session.query(models.CompanyPayorPartnership).filter(
					models.CompanyPayorPartnership.company_id == customer_company_id
				).filter(
					models.CompanyPayorPartnership.payor_id == partner_company_id
				).first())
		if not payor_partnership:
			return None, errors.Error('Could not determine payor contacts because the partnership was not found based on the provided company IDs')

		return _get_payor_contacts(str(payor_partnership.id), session)

	return None, errors.Error('Unrecognized partnership type "{}"'.format(partnership_type))
