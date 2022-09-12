import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple, Union, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants, models_util, queries
from bespoke.db.db_constants import ( VendorChangeRequestsCategoryEnum, VendorChangeRequestsStatusEnum)
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict
from sqlalchemy.sql import or_, and_
from sqlalchemy.orm.session import Session


@errors.return_error_tuple
def approve_vendor_change_request(
	session: Session,
	vendor_change_request_id: str,
	bank_admin_user_id: str,
) -> Tuple[Dict[str, str], errors.Error]:

	vendor_change_request = cast(
		models.VendorChangeRequests,
		session.query(models.VendorChangeRequests).filter(
			models.VendorChangeRequests.id == vendor_change_request_id
		).first())
	if not vendor_change_request:
		return None, errors.Error('Vendor change request not found')

	requesting_user = cast(
		models.User,
		session.query(models.User).filter(
			models.User.id == vendor_change_request.requesting_user_id
		).first())
	if not requesting_user:
		return None, errors.Error('Requesting user not found in system')

	vendor = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == vendor_change_request.requested_vendor_id
		).first())
	if not vendor:
		return None, errors.Error('Requested vendor for contact info change not found in system')

	request_info: Dict[str, Any] = cast(Dict[str, Any], vendor_change_request.request_info)

	if vendor_change_request.category == VendorChangeRequestsCategoryEnum.CONTACT_INFO_CHANGE:
		requested_vendor_contact_id = request_info["user_id"]

		requested_vendor_contact = cast(
			models.User,
			session.query(models.User).filter(
				models.User.id == requested_vendor_contact_id
			).first())
		requested_vendor_contact.first_name = (request_info["first_name"])
		requested_vendor_contact.last_name = request_info["last_name"]
		requested_vendor_contact.phone_number = request_info["phone_number"]
		requested_vendor_contact.email = request_info["email"].lower()

	else:
		new_users = request_info['new_users']
		delete_users = request_info['delete_users']

		# finds partnerships
		company_vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter(
					models.CompanyVendorPartnership.vendor_id == vendor_change_request.requested_vendor_id
				).filter(
					models.CompanyVendorPartnership.company_id == vendor_change_request.requesting_company_id
				).first())
		if not company_vendor_partnership:
			return None, errors.Error('Company vendor partnership not found')


		partnership_id = company_vendor_partnership.id
		# find all the existing vendor contact
		existing_vendor_contacts = cast(
			List[models.CompanyVendorContact],
			session.query(models.CompanyVendorContact).filter(
				models.CompanyVendorContact.partnership_id == partnership_id
			).all())

		# deletes users in company vendor contacts that are not contacts
		company_vendor_contacts_to_delete = []
		for existing_vendor_contact in existing_vendor_contacts:
			if str(existing_vendor_contact.vendor_user_id) in delete_users:
				company_vendor_contacts_to_delete.append(existing_vendor_contact)

		for company_vendor_contact_to_delete in company_vendor_contacts_to_delete:
			cast(Callable, session.delete)(company_vendor_contact_to_delete)

		session.flush()


		existing_vendor_contacts = cast(
			List[models.CompanyVendorContact],
			session.query(models.CompanyVendorContact).filter(
				models.CompanyVendorContact.partnership_id == partnership_id
			).all())

		existing_vendor_contact_ids = []
		for contact in existing_vendor_contacts:
			existing_vendor_contact_ids.append(str(contact.vendor_user_id))

		for user_id in new_users:			
			if user_id not in existing_vendor_contact_ids:
				new_company_vendor_contact = models.CompanyVendorContact( # type: ignore
					partnership_id = partnership_id,
					vendor_user_id = user_id,
				)
				session.add(new_company_vendor_contact)

	vendor_change_request.status = VendorChangeRequestsStatusEnum.APPROVED
	vendor_change_request.approved_at = date_util.now()
	vendor_change_request.approved_by_user_id = bank_admin_user_id # type: ignore
	vendor_change_request.updated_at = date_util.now()

	data_for_template: Dict[str, str] = {
		'request_category': vendor_change_request.category.replace("_", " "),
		'user_email': requesting_user.email,
		'user_name': requesting_user.first_name,
		'vendor_name': vendor.name,
	}

	return data_for_template, None

@errors.return_error_tuple
def delete_vendor_change_request(
	session: Session,
	vendor_change_request_id: str,
	bank_admin_user_id: str,
) -> Tuple[bool, errors.Error]:

	vendor_change_request = cast(
		models.VendorChangeRequests,
		session.query(models.VendorChangeRequests)
			.filter(models.VendorChangeRequests.id == vendor_change_request_id)
			.first())

	if not vendor_change_request:
		raise errors.Error('Vendor change request not found')

	vendor_change_request.is_deleted = True
	vendor_change_request.updated_at = date_util.now()
	vendor_change_request.deleted_at = date_util.now()

	return True, None


@errors.return_error_tuple
def create_edit_vendor_change_request(
	session: Session,
	requesting_user_id: str,
	requested_vendor_id: str,
	first_name: str,
	last_name: str,
	email: str,
	phone_number: str,
	vendor_user_id: str,
	requesting_company_id: str,
) -> Tuple[Dict[str, str], errors.Error]:

	user = cast(
		models.User,
		session.query(models.User).filter(
			models.User.id == requesting_user_id
		).first())
	if not user:
		return None, errors.Error('Could not find requesting user in system')

	vendor = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == requested_vendor_id
		).first())
	if not vendor:
		return None, errors.Error('Could not find requested vendor in system')

	new_vendor_change_request = models.VendorChangeRequests( # type: ignore
		requesting_user_id = requesting_user_id,
		requested_vendor_id = requested_vendor_id,
		category = VendorChangeRequestsCategoryEnum.CONTACT_INFO_CHANGE,
		status = VendorChangeRequestsStatusEnum.APPROVAL_REQUESTED,
		requesting_company_id = requesting_company_id,
		request_info = { 
			'user_id' : vendor_user_id, 
			'first_name': first_name,
			'last_name': last_name,
			'email': email,
			'phone_number': phone_number,
		},
	)

	session.add(new_vendor_change_request)

	data_for_template: Dict[str, str] = {
		'customer_name': user.first_name,
		'vendor_name': vendor.name
	}

	return data_for_template, None

@errors.return_error_tuple
def create_change_vendor_change_request(
	session: Session,
	requested_vendor_id: str,
	requesting_user_id: str,
	new_users: List[str],
	delete_users: List[str],
	requesting_company_id: str,
) -> Tuple[bool, errors.Error]:

	new_vendor_change_request = models.VendorChangeRequests( # type: ignore
		requesting_user_id = requesting_user_id,
		requested_vendor_id = requested_vendor_id,
		requesting_company_id = requesting_company_id,
		status = VendorChangeRequestsStatusEnum.APPROVAL_REQUESTED,
		category = VendorChangeRequestsCategoryEnum.PARTNERSHIP_CONTACT_CHANGE,
		request_info = { 
			'new_users' : new_users, 
			'delete_users' : delete_users,
		}
	)

	session.add(new_vendor_change_request)

	return True, None

