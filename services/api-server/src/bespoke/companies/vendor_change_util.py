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
		# new vs active and delete vs inactive is a historical artifact
		# We used to delete the CompanyVendorContact entry, now we set an `is_active` flag
		# The if statement is to cover the transition period since there are active request in prod
		# TODO(JR): clean up once the old new/delete requests are processed in prod/staging
		active_user_ids = request_info['new_users'] if 'new_users' in request_info else request_info['active_user_ids']
		inactive_user_ids = request_info['delete_users'] if 'delete_users' in request_info else request_info['inactive_user_ids']

		# finds partnerships
		company_vendor_partnerships, err = queries.get_company_vendor_partnerships(
			session,
			[( 
				str(vendor_change_request.requesting_company_id),
				str(vendor_change_request.requested_vendor_id),
			)]
		)
		if not company_vendor_partnerships:
			return None, errors.Error('Company vendor partnership not found')
		
		company_vendor_partnership = company_vendor_partnerships[0]

		# find all the vendor contacts to make active
		active_vendor_contacts = cast(
			List[models.CompanyVendorContact],
			session.query(models.CompanyVendorContact).filter(
				models.CompanyVendorContact.partnership_id == company_vendor_partnership.id
			).filter(
				models.CompanyVendorContact.vendor_user_id.in_(active_user_ids)
			).all())

		for contact in active_vendor_contacts:
			contact.is_active = True

		inactive_vendor_contacts = cast(
			List[models.CompanyVendorContact],
			session.query(models.CompanyVendorContact).filter(
				models.CompanyVendorContact.partnership_id == company_vendor_partnership.id
			).filter(
				models.CompanyVendorContact.vendor_user_id.in_(inactive_user_ids)
			).all())

		for contact in inactive_vendor_contacts:
			contact.is_active = False

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
	active_user_ids: List[str],
	inactive_user_ids: List[str],
	requesting_company_id: str,
) -> Tuple[bool, errors.Error]:

	new_vendor_change_request = models.VendorChangeRequests( # type: ignore
		requesting_user_id = requesting_user_id,
		requested_vendor_id = requested_vendor_id,
		requesting_company_id = requesting_company_id,
		status = VendorChangeRequestsStatusEnum.APPROVAL_REQUESTED,
		category = VendorChangeRequestsCategoryEnum.PARTNERSHIP_CONTACT_CHANGE,
		request_info = { 
			'active_user_ids' : active_user_ids, 
			'inactive_user_ids' : inactive_user_ids,
		}
	)

	session.add(new_vendor_change_request)

	return True, None

