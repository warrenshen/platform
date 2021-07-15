"""
	Utility functions related to company-vendor and company-payor relationships
"""
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Callable, List, Tuple, cast

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

def update_partnership_contacts(
	is_payor: bool,
	partnership_id: str,
	user_ids: List[str],
	session: Session,
) -> Tuple[bool, errors.Error]:
	if is_payor:
		payor_partnership = cast(
			models.CompanyPayorPartnership,
			session.query(models.CompanyPayorPartnership).get(partnership_id))
		if not payor_partnership:
			return None, errors.Error('Company payor partnership not found')

		existing_payor_contacts = cast(
			List[models.CompanyPayorContact],
			session.query(models.CompanyPayorContact).filter(
				models.CompanyPayorContact.partnership_id == partnership_id
			).all())

		company_payor_contacts_to_delete = []
		for existing_payor_contact in existing_payor_contacts:
			is_payor_contact_deleted = str(existing_payor_contact.id) not in user_ids
			if is_payor_contact_deleted:
				company_payor_contacts_to_delete.append(existing_payor_contact)

		for company_payor_contact_to_delete in company_payor_contacts_to_delete:
			cast(Callable, session.delete)(company_payor_contact_to_delete)

		session.flush()

		for user_id in user_ids:
			existing_payor_contact = cast(
				models.CompanyPayorContact,
				session.query(models.CompanyPayorContact).filter_by(
					partnership_id=partnership_id,
					payor_user_id=user_id,
				).first())
			if not existing_payor_contact:
				new_company_payor_contact = models.CompanyPayorContact( # type: ignore
					partnership_id=partnership_id,
					payor_user_id=user_id,
				)
				session.add(new_company_payor_contact)
	else:
		vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).get(partnership_id))
		if not vendor_partnership:
			return None, errors.Error('Company vendor partnership not found')

		existing_vendor_contacts = cast(
			List[models.CompanyVendorContact],
			session.query(models.CompanyVendorContact).filter(
				models.CompanyVendorContact.partnership_id == partnership_id
			).all())

		company_vendor_contacts_to_delete = []
		for existing_vendor_contact in existing_vendor_contacts:
			is_vendor_contact_deleted = str(existing_vendor_contact.vendor_user_id) not in user_ids
			if is_vendor_contact_deleted:
				company_vendor_contacts_to_delete.append(existing_vendor_contact)

		for company_vendor_contact_to_delete in company_vendor_contacts_to_delete:
			cast(Callable, session.delete)(company_vendor_contact_to_delete)

		session.flush()

		for user_id in user_ids:
			existing_vendor_contact = cast(
				models.CompanyVendorContact,
				session.query(models.CompanyVendorContact).filter_by(
					partnership_id=partnership_id,
					vendor_user_id=user_id,
				).first())
			if not existing_vendor_contact:
				new_company_vendor_contact = models.CompanyVendorContact( # type: ignore
					partnership_id=partnership_id,
					vendor_user_id=user_id,
				)
				session.add(new_company_vendor_contact)

	return True, None
