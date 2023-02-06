"""
	Utility functions related to company-vendor and company-payor relationships
"""
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Callable, List, Tuple, cast

from bespoke.db import models, db_constants
from bespoke import errors

ContactDict = TypedDict('ContactDict', {
	'parent_company_id': str,
	'company_id': str,
	'email': str,
	'phone_number': str,
	'first_name': str
})

def _users_to_contacts(users: List[models.User]) -> List[ContactDict]:
	if not users:
		return []

	return [
		ContactDict(
			parent_company_id=str(user.parent_company_id),
			company_id=str(user.company_id),
			email=user.email,
			phone_number=user.phone_number,
			first_name=user.first_name
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
		).filter(
			cast(Callable, models.CompanyVendorContact.is_active.is_)(True)
		).all())

	if contacts:
		return _users_to_contacts([contact.vendor_user for contact in contacts]), None
	else:
		return None, errors.Error('Could not find contacts for this vendor partnership')

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
	else:
		return None, errors.Error('Could not find contacts for this payor partnership')

def get_partner_contacts(
	partnership_id: str,
	partnership_type: str,
	session: Session,
) -> Tuple[List[ContactDict], errors.Error]:
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

		for contact in existing_vendor_contacts:
			if str(contact.vendor_user_id) in user_ids:
				contact.is_active = True
			else:
				contact.is_active = False

	return True, None
