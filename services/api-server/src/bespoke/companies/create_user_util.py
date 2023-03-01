"""
Logic to create users.
"""
from typing import Callable, Tuple, cast

from bespoke import errors
from bespoke.db import db_constants, models, queries
from bespoke.db.db_constants import LoginMethod
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

UserInsertInputDict = TypedDict('UserInsertInputDict', {
	'role': str,
	'company_role': str,
	'first_name': str,
	'last_name': str,
	'email': str,
	'phone_number': str,
	'parent_company_id': str,
}, total=False)

CreateBankOrCustomerUserInputDict = TypedDict('CreateBankOrCustomerUserInputDict', {
	'company_id': str,
	'user': UserInsertInputDict,
})

CreateParentCompanyUserInputDict = TypedDict('CreateParentCompanyUserInputDict', {
	'parent_company_id': str,
	'user': UserInsertInputDict,
})

CreateThirdPartyUserInputDict = TypedDict('CreateThirdPartyUserInputDict', {
	'company_id': str,
	'user': UserInsertInputDict,
})

CreateThirdPartyUserRespDict = TypedDict('CreateThirdPartyUserRespDict', {
	'status': str,
	'user_id': str,
})

UpdateThirdPartyUserInputDict = TypedDict('UpdateThirdPartyUserInputDict', {
	'company_id': str,
	'user_id': str,
	'user': UserInsertInputDict,
})

UpdateThirdPartyUserRespDict = TypedDict('UpdateThirdPartyUserRespDict', {
	'status': str,
	'user_id': str,
})

@errors.return_error_tuple
def create_user_with_session(
	session: Session,
	req: CreateBankOrCustomerUserInputDict,
	created_by_user_id: str,
) -> Tuple[str, errors.Error]:
	company_id = req['company_id'] 
	user_input = req['user']
	role = user_input['role']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']

	if not role:
		raise errors.Error('Role must be specified')

	if not first_name or not last_name:
		raise errors.Error('Full name must be specified')

	if not email:
		raise errors.Error('Email must be specified')

	user_id = None
	is_bank_user = db_constants.is_bank_user([role])

	
	parent_company_id = None
	company = None
	if company_id:
		company = session.query(models.Company) \
			.filter(models.Company.id == company_id) \
			.first()
		if not company:
			raise errors.Error('Could not find company')

		if role == db_constants.UserRoles.COMPANY_CONTACT_ONLY:
			if not company.is_payor and not company.is_vendor:
				raise errors.Error('Company is neither Payor or Vendor company type')
		elif role == db_constants.UserRoles.VENDOR_ADMIN:
			if not company.is_vendor:
				raise errors.Error('Company is not Vendor company type')
		elif role == db_constants.InheritedRoles.COMPANY_ADMIN_VENDOR_ADMIN_INHERITED:
			if not company.is_vendor and not company.is_customer:
				raise errors.Error('Company is not both Customer and Vendor company type')
		else:
			if not company.is_customer:
				raise errors.Error('Company is not Customer company type')

		parent_company_id = company.parent_company_id

	existing_user = session.query(models.User).filter(
		models.User.email == email.lower()
	).first()
	if existing_user:
		raise errors.Error('Email is already taken')

	user = models.User()
	user.parent_company_id = parent_company_id
	user.company_id = company_id
	user.role = role
	user.first_name = first_name
	user.last_name = last_name
	user.email = email.lower()
	user.phone_number = phone_number
	user.login_method = LoginMethod.TWO_FA if is_bank_user else LoginMethod.SIMPLE
	if "company_role" in user_input:
		user.company_role = user_input["company_role"]
	user.created_by_user_id = created_by_user_id # type: ignore

	session.add(user)
	session.flush()
	user_id = str(user.id)

	if company_id and company.is_vendor:
		partnerships, err = queries.get_company_vendor_partnerships_by_vendor_id(
			session,
			company_id
		)
		if err:
			# Not having a partnership for a vendor isn't inherently bad in this scenario
			# as someone may be setting up a vendor ahead of time
			pass

		if partnerships is not None:
			for partnership in partnerships:
				contact = models.CompanyVendorContact( # type:ignore
					partnership_id = str(partnership.id),
					vendor_user_id = user_id,
					is_active = False,
				)
				session.add(contact)

	return user_id, None

# Note: this method name is misleading, we use this for vendor / payor users too.
@errors.return_error_tuple
def create_user(
	session_maker: Callable,
	req: CreateBankOrCustomerUserInputDict,
	created_by_user_id: str,
) -> Tuple[str, errors.Error]:
	with session_scope(session_maker) as session:
		return create_user_with_session(session, req, created_by_user_id)

	raise errors.Error("Could not create session")

@errors.return_error_tuple
def create_parent_company_user(
	session: Session,
	req: CreateParentCompanyUserInputDict,
	created_by_user_id: str,
) -> Tuple[str, errors.Error]:
	user_input = req['user']
	role = user_input['role']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']
	parent_company_id = user_input['parent_company_id']

	if not role:
		raise errors.Error('Role must be specified')

	if not first_name or not last_name:
		raise errors.Error('Full name must be specified')

	if not email:
		raise errors.Error('Email must be specified')

	user_id = None
	
	parent_company, err = queries.get_parent_company_by_id(
		session,
		parent_company_id
	)
	if err:
		return None, err

	# adding a company id for now so users can still access the site
	child_companies, err = queries.get_companies_by_parent_company_id(
		session,
		parent_company_id
	)
	if err:
		return None, err
	child_company = child_companies[0]

	# Since an existing user would actually be an error
	# for this flow, we mark err with _
	existing_user, _ = queries.get_user_by_email(
		session,
		email.lower()
	)
	if existing_user:
		return None, errors.Error('Email is already taken')

	user = models.User()
	user.parent_company_id = parent_company_id
	user.company_id = child_company.id
	user.role = role
	user.first_name = first_name
	user.last_name = last_name
	user.email = email.lower()
	user.phone_number = phone_number
	user.login_method = LoginMethod.SIMPLE
	if "company_role" in user_input:
		user.company_role = user_input["company_role"]
	user.created_by_user_id = created_by_user_id # type: ignore

	session.add(user)
	session.flush()
	user_id = str(user.id)

	return user_id, None

# This method is deprecated and is no longer used.
@errors.return_error_tuple
def create_third_party_user(
	req: CreateThirdPartyUserInputDict,
	session_maker: Callable,
	is_payor: bool,
) -> Tuple[CreateThirdPartyUserRespDict, errors.Error]:
	company_id = req['company_id']
	user_input = req['user']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']

	if not email:
		raise errors.Error('Email must be specified')

	if not phone_number:
		raise errors.Error('Phone number must be specified')

	user_id = None

	with session_scope(session_maker) as session:
		company = session.query(models.Company) \
			.filter(models.Company.id == company_id) \
			.first()
		if not company:
			raise errors.Error('Could not find company')
		if is_payor and not company.is_payor:
			raise errors.Error('Company is not Payor company type')
		if not is_payor and not company.is_vendor:
			raise errors.Error('Company is not Vendor company type')

		user = session.query(models.User).filter(
			models.User.email == email.lower()
		).first()
		if user:
			raise errors.Error('Email is already taken')

		user = models.User()
		user.parent_company_id = company.parent_company_id
		user.company_id = company_id
		user.first_name = first_name
		user.last_name = last_name
		user.email = email.lower()
		user.phone_number = phone_number
		user.login_method = db_constants.LoginMethod.SIMPLE

		session.add(user)
		session.flush()
		user_id = str(user.id)

	return CreateThirdPartyUserRespDict(
		status='OK',
		user_id=user_id,
	), None

@errors.return_error_tuple
def update_third_party_user(
	req: UpdateThirdPartyUserInputDict,
	session_maker: Callable,
) -> Tuple[UpdateThirdPartyUserRespDict, errors.Error]:
	user_id = req['user_id']
	user_input = req['user']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']

	if not email:
		raise errors.Error('Email must be specified')

	if not phone_number:
		raise errors.Error('Phone number must be specified')

	with session_scope(session_maker) as session:
		user = session.query(models.User) \
			.filter(models.User.id == user_id) \
			.first()
		if not user:
			raise errors.Error('Could not find existing user')

		user.first_name = first_name
		user.last_name = last_name
		user.email = email.lower()
		user.phone_number = phone_number

	return UpdateThirdPartyUserRespDict(
		status='OK',
		user_id=user_id,
	), None
