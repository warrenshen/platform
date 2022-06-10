"""
	Logic to help create a company.
"""
import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple, Type, Union, cast

from bespoke import errors
from bespoke.companies import create_user_util
from bespoke.date import date_util
from bespoke.db import models, db_constants, models_util
from bespoke.db.db_constants import CompanyDebtFacilityStatus, CompanyType, TwoFactorMessageMethod, UserRoles
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict
from sqlalchemy.sql import or_
from sqlalchemy.orm.session import Session

# Should match with the graphql types for inserting objects into the DB.
CompanyInsertInputDict = TypedDict('CompanyInsertInputDict', {
	'id': str,
	'name': str,
	'identifier': str,
	'contract_name': str,
	'dba_name': str,
	'is_cannabis': bool,
}, total=False)

CompanySettingsInsertInputDict = TypedDict('CompanySettingsInsertInputDict', {
})

ContractInsertInputDict = TypedDict('ContractInsertInputDict', {
	'start_date': str,
	'end_date': str,
	'product_type': str,
	'product_config': Dict
})

CreateCustomerInputDict = TypedDict('CreateCustomerInputDict', {
	'company': CompanyInsertInputDict,
	'settings': CompanySettingsInsertInputDict,
	'contract': ContractInsertInputDict
})

CreateProspectiveCustomerInputDict = TypedDict('CreateProspectiveCustomerInputDict', {
	'company': CompanyInsertInputDict
})

CreateCustomerRespDict = TypedDict('CreateCustomerRespDict', {
	'status': str
})

CreatePartnershipInputDict = TypedDict('CreatePartnershipInputDict', {
	'partnership_request_id': str,
	'should_create_company': bool,
	'partner_company_id': str, # the company ID of the partner who might already exist in the DB
	'license_info': List[str],
})

CreatePartnershipRespDict = TypedDict('CreatePartnershipRespDict', {
	'company_id': str, # the company ID of the partner
	'company_type': str, # the type of company of the partner
	'customer_id': str, # the person who requested the partnership
	'partnership_id': str,
	'partnership_type': str # e.g., 'vendor' or 'payor'
})

LicenseInfoDict = TypedDict('LicenseInfoDict', {
	'license_ids': List[str]
})

LicenseInfoNewDict = TypedDict('LicenseInfoNewDict', {
	'license_ids': List[str],
	'license_file_id': str,
})

PartnershipRequestRequestInfoDict = TypedDict('PartnershipRequestRequestInfoDict', {
	'dba_name': str,
	'bank_name': str,
	'bank_account_name': str,
	'bank_account_type': db_constants.BankAccountType,
	'bank_account_number': str,
	'bank_ach_routing_number': str,
	'bank_wire_routing_number': str,
	'beneficiary_address': str,
	'bank_instructions_attachment_id': str,
})

CreatePartnershipRequestInputDict = TypedDict('CreatePartnershipRequestInputDict', {
	'customer_id': str,
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
	'license_info': LicenseInfoDict
})

PartnershipRequestNewInputDict = TypedDict('PartnershipRequestNewInputDict', {
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
	'license_info': LicenseInfoNewDict,
	'request_info': PartnershipRequestRequestInfoDict,
})

CreatePartnershipRequestNewInputDict = TypedDict('CreatePartnershipRequestNewInputDict', {
	'customer_id': str,
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
	'license_info': LicenseInfoNewDict,
	'request_info': PartnershipRequestRequestInfoDict,
})

UpdatePartnershipRequestNewInputDict = TypedDict('UpdatePartnershipRequestNewInputDict', {
	'partnership_request_id': str,
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
	'license_info': LicenseInfoNewDict,
	'request_info': PartnershipRequestRequestInfoDict,
})

AddVendorNewInputDict = TypedDict('AddVendorNewInputDict', {
	'email': str,
	'customer_id': str,
})

def _check_is_company_name_already_used(company_name: str, company_identifier: str, session: Session) -> Tuple[bool, errors.Error]:
	existing_company_by_name = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.name == company_name
		).first())
	if existing_company_by_name:
		return False, errors.Error(f'A customer with name "{company_name}" already exists')

	existing_company_by_identifier = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.identifier == company_identifier
		).first())
	if existing_company_by_identifier:
		return False, errors.Error(f'A customer with identifier "{company_identifier}" already exists')

	return True, None

def _create_company(
	name: str,
	identifier: Optional[str],
	dba_name: Optional[str],
	two_factor_message_method: Optional[str],
	session: Session,
) -> models.Company:
	parent_company = models.ParentCompany(name=name)
	session.add(parent_company)

	session.flush()
	parent_company_id = str(parent_company.id)

	company_settings = models.CompanySettings()
	if two_factor_message_method:
		company_settings.two_factor_message_method = two_factor_message_method
	else:
		# Default 2FA method to PHONE.
		company_settings.two_factor_message_method = TwoFactorMessageMethod.PHONE
	session.add(company_settings)

	session.flush()
	company_settings_id = str(company_settings.id)

	company = models.Company(
		parent_company_id=parent_company_id,
		name=name,
		identifier=identifier,
		dba_name=dba_name,
		company_settings_id=company_settings_id,
		debt_facility_status=CompanyDebtFacilityStatus.GOOD_STANDING,
	)

	session.add(company)
	session.flush()

	company_id = str(company.id)
	company_settings.company_id = company_id

	return company

def create_customer_company(
	name: str,
	identifier: str,
	contract_name: str,
	dba_name: str,
	session: Session,
) -> models.Company:
	company = _create_company(
		name=name,
		identifier=identifier,
		dba_name=dba_name,
		two_factor_message_method=None,
		session=session,
	)
	company.is_customer = True
	company.contract_name = contract_name
	return company

def create_prospective_company(
	name: str,
	identifier: str,
	dba_name: str,
	session: Session,
) -> models.Company:
	company = _create_company(
		name=name,
		identifier=identifier,
		dba_name=dba_name,
		two_factor_message_method=None,
		session=session,
	)
	return company

@errors.return_error_tuple
def create_prospective_customer(
	req: CreateProspectiveCustomerInputDict,
	bank_admin_user_id: str,
	session_maker: Callable
) -> Tuple[CreateCustomerRespDict, errors.Error]:

	with session_scope(session_maker) as session:
		company_name = req['company']['name']
		company_identifier = req['company']['identifier']
		company_dba_name = req['company']['dba_name']

		success, err = _check_is_company_name_already_used(
			company_name, company_identifier, session)
		if err:
			raise err

		create_prospective_company(
			name=company_name,
			identifier=company_identifier,
			dba_name=company_dba_name,
			session=session)

	return CreateCustomerRespDict(
		status='OK'
	), None

@errors.return_error_tuple
def create_customer(
	req: CreateCustomerInputDict,
	bank_admin_user_id: str,
	session_maker: Callable,
) -> Tuple[CreateCustomerRespDict, errors.Error]:

	with session_scope(session_maker) as session:
		company_name = req['company']['name']
		company_identifier = req['company']['identifier']
		company_contract_name = req['company']['contract_name']
		company_dba_name = req['company']['dba_name']
		company_id = req['company']['id']

		should_create_company = company_id is None

		if should_create_company:
			success, err = _check_is_company_name_already_used(
				company_name, company_identifier, session)
			if err:
				raise err

		if not req['contract']['product_config']:
			raise errors.Error('No product config specified')

		contract = models.Contract(
			product_type=req['contract']['product_type'],
			product_config=req['contract']['product_config'],
			start_date=date_util.load_date_str(req['contract']['start_date']),
			end_date=date_util.load_date_str(req['contract']['end_date']),
			adjusted_end_date=date_util.load_date_str(req['contract']['end_date']),
		)
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		if err:
			raise err

		# Use whatever the produced product config is after using the validation logic
		# from contract_util.Contract
		contract.product_config = contract_obj.get_product_config()
		session.add(contract)

		session.flush()
		contract_id = str(contract.id)

		if should_create_company:
			company = create_customer_company(
				name=company_name,
				identifier=company_identifier,
				contract_name=company_contract_name,
				dba_name=company_dba_name,
				session=session,
			)
		else:
			company = session.query(models.Company).filter(
				models.Company.id == company_id
			).first()
			if not company:
				raise errors.Error('Company ID provided does not exist')

			company.is_customer = True

		company_id = str(company.id)
		company.contract_id = contract_id
		contract.company_id = company_id

	return CreateCustomerRespDict(
		status='OK'
	), None

@errors.return_error_tuple
def upsert_feature_flags_payload(
	company_settings_id: str,
	feature_flags_payload: Dict[str, bool],
	session: Session,
) -> Tuple[bool, errors.Error]:

	settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).get(company_settings_id))

	if not settings:
		return None, errors.Error('No settings found')

	for feature_flag in feature_flags_payload.keys():
		if feature_flag not in db_constants.ALL_FEATURE_FLAGS:
			return None, errors.Error(f'Invalid feature flag: {feature_flag}')

	settings.feature_flags_payload = feature_flags_payload

	return True, None

@errors.return_error_tuple
def upsert_custom_messages_payload(
	company_settings_id: str,
	custom_messages_payload: Dict[str, bool],
	session: Session,
) -> Tuple[bool, errors.Error]:

	settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).get(company_settings_id))

	if not settings:
		return None, errors.Error('No settings found')

	for custom_message in custom_messages_payload.keys():
		if custom_message not in db_constants.ALL_CUSTOM_MESSAGES:
			return None, errors.Error(f'Invalid custom message: {custom_message}')

	settings.custom_messages_payload = custom_messages_payload

	return True, None

# We will have two methods:
#
# Create partnership and company
#
# Just create the partnership with a company_id

def _create_user(
	user_input: Dict,
	parent_company_id: str,
	company_id: str,
	session: Session,
) -> str:
	# Note: Payor / Vendor users do not have any role for now.
	user_first_name = user_input['first_name']
	user_last_name = user_input['last_name']
	user_email = user_input['email']
	user_phone_number = user_input['phone_number']

	if not user_first_name or not user_last_name:
		raise errors.Error('User full name must be specified')

	if not user_email:
		raise errors.Error('User email must be specified')

	if not user_phone_number:
		raise errors.Error('User phone number must be specified')

	user = models.User()
	user.parent_company_id = parent_company_id
	user.company_id = company_id
	user.first_name = user_first_name
	user.last_name = user_last_name
	user.email = user_email.lower()
	user.phone_number = user_phone_number
	user.role = db_constants.UserRoles.COMPANY_CONTACT_ONLY
	user.login_method = db_constants.LoginMethod.SIMPLE
	session.add(user)
	session.flush()
	return str(user.id)

def _create_partner_company_and_its_first_user(
	partnership_req: models.CompanyPartnershipRequest,
	session: Session,
) -> str:
	user_input = cast(Dict, partnership_req.user_info)

	if not user_input.get('email'):
		raise errors.Error('User email must be specified')

	company = _create_company(
		name=partnership_req.company_name,
		identifier=None,
		dba_name=None,
		two_factor_message_method=partnership_req.two_factor_message_method,
		session=session,
	)
	company.is_customer = False
	company.is_payor = partnership_req.company_type == CompanyType.Payor
	company.is_vendor = partnership_req.company_type == CompanyType.Vendor
	company.is_cannabis = partnership_req.is_cannabis

	company_id = str(company.id)
	parent_company_id = str(company.parent_company_id)

	existing_user = session.query(models.User).filter(
		models.User.email == user_input['email'].lower()
	).first()
	if existing_user:
		raise errors.Error('Email is already taken')

	_create_user(
		user_input=user_input,
		parent_company_id=parent_company_id,
		company_id=company_id,
		session=session,
	)

	if partnership_req.license_info:
		# Add any licenses the user might have specified.
		license_numbers = cast(Dict, partnership_req.license_info)['license_ids']
		for license_number in license_numbers:
			existing_license = cast(
				models.CompanyLicense,
				session.query(models.CompanyLicense).filter(
					models.CompanyLicense.license_number == license_number
				).first())

			if existing_license:
				# If company license exists in our system but does not have a company
				# associated with it, associate the newly created company with the license.
				#
				# If company license exists in our system but does have a company associated
				# with it, perhaps the newly created company already exists in the system?
				# We do NOT block this case for now, but can change this later.
				if not existing_license.company_id:
					existing_license.company_id = cast(Any, company_id)
			else:
				new_license = models.CompanyLicense()
				new_license.company_id = cast(Any, company_id)
				new_license.license_number = license_number
				session.add(new_license)

	return company_id

def _create_partner_company_and_its_first_user_new(
	partnership_req: models.CompanyPartnershipRequest,
	session: Session,
) -> str:
	user_input = cast(Dict, partnership_req.user_info)

	if not user_input.get('email'):
		raise errors.Error('User email must be specified')
	
	license_info = cast(LicenseInfoNewDict, partnership_req.license_info)
	request_info = cast(PartnershipRequestRequestInfoDict, partnership_req.request_info)

	company = _create_company(
		name=partnership_req.company_name,
		identifier=None,
		dba_name=request_info.get('dba_name', None),
		two_factor_message_method=partnership_req.two_factor_message_method,
		session=session,
	)
	company.is_customer = False
	company.is_payor = partnership_req.company_type == CompanyType.Payor
	company.is_vendor = partnership_req.company_type == CompanyType.Vendor
	company.is_cannabis = partnership_req.is_cannabis

	company_id = str(company.id)
	parent_company_id = str(company.parent_company_id)

	existing_user = session.query(models.User).filter(
		models.User.email == user_input['email'].lower()
	).first()
	if existing_user:
		raise errors.Error('Email is already taken')

	_create_user(
		user_input=user_input,
		parent_company_id=parent_company_id,
		company_id=company_id,
		session=session,
	)

	if license_info:
		# Add any licenses the user might have specified.
		license_numbers = cast(Dict, license_info)['license_ids']
		for license_number in license_numbers:
			existing_license = cast(
				models.CompanyLicense,
				session.query(models.CompanyLicense).filter(
					models.CompanyLicense.license_number == license_number
				).first())

			if existing_license:
				# If company license exists in our system but does not have a company
				# associated with it, associate the newly created company with the license.
				#
				# If company license exists in our system but does have a company associated
				# with it, perhaps the newly created company already exists in the system?
				# We do NOT block this case for now, but can change this later.
				if not existing_license.company_id:
					existing_license.company_id = cast(Any, company_id)
			else:
				new_license = models.CompanyLicense()
				new_license.company_id = cast(Any, company_id)
				new_license.license_number = license_number

				if license_info.get('license_file_id', None):
					new_license.file_id = license_info.get('license_file_id') # type: ignore

				session.add(new_license)
	
	# Add bank account
	bank_account = models.BankAccount( # type: ignore
        company_id=company_id,
        bank_name=request_info.get('bank_name'),
        account_title=request_info.get('bank_account_name'),
        account_type=request_info.get('bank_account_type'),
        account_number=request_info.get('bank_account_number'),
        routing_number=request_info.get('bank_ach_routing_number'),
		wire_routing_number=request_info.get('bank_wire_routing_number'),
        can_ach=bool(request_info.get('bank_ach_routing_number')),
        can_wire=bool(request_info.get('bank_wire_routing_number')),
        recipient_address=request_info.get('beneficiary_address'),
		bank_instructions_file_id=request_info.get('bank_instructions_attachment_id', None),
        is_cannabis_compliant=True,
		verified_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE),
		verified_at=date_util.now(),
    )
	session.add(bank_account)

	return company_id

def _setup_users_for_existing_company(
	parent_company_id: str,
	company_id: str,
	partnership_req: models.CompanyPartnershipRequest,
	session: Session,
) -> str:
	
	user_input = cast(Dict, partnership_req.user_info)

	if not user_input.get('email'):
		raise errors.Error('User email must be specified')

	existing_user = cast(
		models.User,
		session.query(models.User).filter(
			models.User.email == user_input['email'].lower()
		).first())
	if existing_user:
		user_id = str(existing_user.id)
	else:
		# Only create the user if it doesn't exist by email
		user_id = _create_user(
			user_input=user_input,
			parent_company_id=parent_company_id,
			company_id=company_id,
			session=session,
		)

	return user_id

@errors.return_error_tuple
def create_partnership(
	req: CreatePartnershipInputDict,
	session: Session,
	bank_admin_user_id: str,
) -> Tuple[CreatePartnershipRespDict, errors.Error]:
	should_create_company = req['should_create_company']

	if should_create_company is None:
		raise errors.Error('should_create_company must be True or False')

	partnership_req = cast(
		models.CompanyPartnershipRequest,
		session.query(models.CompanyPartnershipRequest).filter(
			models.CompanyPartnershipRequest.id == req['partnership_request_id']
		).first())
	if not partnership_req:
		raise errors.Error('No partnership request found to create this partnership')

	customer_id = str(partnership_req.requesting_company_id)

	if should_create_company:
		company_id = _create_partner_company_and_its_first_user(
			partnership_req, session
		)
	else:
		company_id = req.get('partner_company_id')
		if not company_id:
			raise errors.Error('partner_company_id must be specified because the partnership is based on a pre-existing company')

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())
		if not company or not company.parent_company_id:
			raise errors.Error('company and parent company must be exist because the partnership is based on a pre-existing company')

		_setup_users_for_existing_company(
			parent_company_id=str(company.parent_company_id),
			company_id=company_id,
			partnership_req=partnership_req,
			session=session,
		)

	company = cast(
		models.Company,
		session.query(models.Company).get(company_id)
	)

	company_type = partnership_req.company_type
	partnership_id = None
	partnership_type = None

	# Later on in this function we will create a default contact for the partnership
	# This section either grabs the existing user based off the request's contact email or creates a user
	user_info = partnership_req.user_info

	existing_user = cast(
		models.User,
		session.query(models.User).filter(
			models.User.email == cast(Dict[str, Any], user_info).get("email", "").lower()
	).first())

	if existing_user is None:
		user_id, err = create_user_util.create_bank_or_customer_user_with_session(
			req = create_user_util.CreateBankOrCustomerUserInputDict(
				company_id = company_id,
				user = create_user_util.UserInsertInputDict(
					role = UserRoles.COMPANY_CONTACT_ONLY,
					first_name = cast(Dict[str, Any], user_info).get("first_name", ""),
					last_name = cast(Dict[str, Any], user_info).get("last_name", ""),
					email = cast(Dict[str, Any], user_info).get("email", ""),
					phone_number = cast(Dict[str, Any], user_info).get("phone_number", "")
				),
			),
			session = session
		)

	contact_user_id = existing_user.id if existing_user is not None else user_id

	if not contact_user_id:
		raise errors.Error("Cannot find contact user id")

	if company_type == CompanyType.Payor:
		prev_partnership = cast(
			models.CompanyPayorPartnership,
			session.query(models.CompanyPayorPartnership).filter(
				models.CompanyPayorPartnership.company_id == customer_id
			).filter(
				models.CompanyPayorPartnership.payor_id == company_id
			).first())
		if prev_partnership:
			raise errors.Error('Partnership already exists. Please delete this payor partnership request')

		company_payor_partnership = models.CompanyPayorPartnership(
			company_id=customer_id,
			payor_id=company_id,
		)
		session.add(company_payor_partnership)
		session.flush()
		partnership_id = str(company_payor_partnership.id)
		partnership_type = db_constants.CompanyType.Payor

		# Existing company may not have is_payor set to True yet,
		# for example it may only have is_customer set to True.
		if not should_create_company:
			company.is_payor = True

		# Create a default user for the partnership based on who was submitted with the request
		company_payor_contact = models.CompanyPayorContact()
		company_payor_contact.partnership_id = company_payor_partnership.id
		company_payor_contact.payor_user_id = contact_user_id
		session.add(company_payor_contact)
		session.flush()

	elif company_type == CompanyType.Vendor:
		prev_vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.company_id == customer_id
			).filter(
				models.CompanyVendorPartnership.vendor_id == company_id
			).first())
		if prev_vendor_partnership:
			raise errors.Error('Partnership already exists. Please delete this vendor partnership request')

		company_vendor_partnership = models.CompanyVendorPartnership(
			company_id=customer_id,
			vendor_id=company_id,
		)
		session.add(company_vendor_partnership)
		session.flush()
		partnership_id = str(company_vendor_partnership.id)
		partnership_type = db_constants.CompanyType.Vendor

		# Existing company may not have is_vendor set to True yet,
		# for example it may only have is_customer set to True.
		if not should_create_company:
			company.is_vendor = True

		# Create a default user for the partnership based on who was submitted with the request
		company_vendor_contact = models.CompanyVendorContact()
		company_vendor_contact.partnership_id = company_vendor_partnership.id
		company_vendor_contact.vendor_user_id = contact_user_id
		session.add(company_vendor_contact)
		session.flush()

	else:
		raise errors.Error('Unexpected company_type {}'.format(company_type))

	# Weve fulfilled the partnership request so we can mark it as "settled" now.
	partnership_req.settled_at = date_util.now()
	partnership_req.settled_by_user_id = bank_admin_user_id

	return CreatePartnershipRespDict(
		company_id=company_id,
		customer_id=customer_id,
		partnership_id=partnership_id,
		partnership_type=partnership_type,
		company_type=company_type
	), None

@errors.return_error_tuple
def create_partnership_new(
	req: CreatePartnershipInputDict,
	session: Session,
	bank_admin_user_id: str,
) -> Tuple[CreatePartnershipRespDict, errors.Error]:
	should_create_company = req['should_create_company']

	if should_create_company is None:
		raise errors.Error('should_create_company must be True or False')

	partnership_req = cast(
		models.CompanyPartnershipRequest,
		session.query(models.CompanyPartnershipRequest).filter(
			models.CompanyPartnershipRequest.id == req['partnership_request_id']
		).first())
	if not partnership_req:
		raise errors.Error('No partnership request found to create this partnership')
	
	# Store the license info if it's updated while triage
	if req.get('license_info'):
		partnership_req.license_info = req.get('license_info')

	customer_id = str(partnership_req.requesting_company_id)

	if should_create_company:
		company_id = _create_partner_company_and_its_first_user_new(
			partnership_req, session
		)
	else:
		company_id = req.get('partner_company_id')
		if not company_id:
			raise errors.Error('partner_company_id must be specified because the partnership is based on a pre-existing company')

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())
		if not company or not company.parent_company_id:
			raise errors.Error('company and parent company must be exist because the partnership is based on a pre-existing company')

		_setup_users_for_existing_company(
			parent_company_id=str(company.parent_company_id),
			company_id=company_id,
			partnership_req=partnership_req,
			session=session,
		)

		request_info = cast(PartnershipRequestRequestInfoDict, partnership_req.request_info)

		existing_bank_account = cast(
			models.BankAccount,
			session.query(models.BankAccount).filter(
				models.BankAccount.company_id == company_id
			).filter(
				models.BankAccount.account_number == request_info.get('bank_account_number'),
			).filter(
				or_(
					models.BankAccount.routing_number == request_info.get('bank_ach_routing_number'),
					models.BankAccount.wire_routing_number == request_info.get('bank_wire_routing_number'),
				)
			).first()
		)

		if not existing_bank_account:
			# Add bank account
			bank_account = models.BankAccount( # type: ignore
				company_id=company_id,
				bank_name=request_info.get('bank_name'),
				account_title=request_info.get('bank_account_name'),
        		account_type=request_info.get('bank_account_type'),
				account_number=request_info.get('bank_account_number'),
				routing_number=request_info.get('bank_ach_routing_number'),
				wire_routing_number=request_info.get('bank_wire_routing_number'),
				can_ach=bool(request_info.get('bank_ach_routing_number')),
				can_wire=bool(request_info.get('bank_wire_routing_number')),
				recipient_address=request_info.get('beneficiary_address'),
				bank_instructions_file_id=request_info.get('bank_instructions_attachment_id', None),
				is_cannabis_compliant=True,
				verified_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE),
				verified_at=date_util.now(),
			)
			session.add(bank_account)

	company = cast(
		models.Company,
		session.query(models.Company).get(company_id)
	)

	company_type = partnership_req.company_type
	partnership_id = None
	partnership_type = None

	# Later on in this function we will create a default contact for the partnership
	# This section either grabs the existing user based off the request's contact email or creates a user
	user_info = cast(create_user_util.UserInsertInputDict, partnership_req.user_info)

	existing_user = cast(
		models.User,
		session.query(models.User).filter(
			models.User.email == user_info.get("email", "").lower()
	).first())

	if existing_user is None:
		user_id, err = create_user_util.create_bank_or_customer_user_with_session(
			req = create_user_util.CreateBankOrCustomerUserInputDict(
				company_id = company_id,
				user = create_user_util.UserInsertInputDict(
					role = UserRoles.COMPANY_CONTACT_ONLY,
					first_name = cast(Dict[str, Any], user_info).get("first_name", ""),
					last_name = cast(Dict[str, Any], user_info).get("last_name", ""),
					email = cast(Dict[str, Any], user_info).get("email", ""),
					phone_number = cast(Dict[str, Any], user_info).get("phone_number", "")
				),
			),
			session = session
		)

	contact_user_id = existing_user.id if existing_user is not None else user_id

	if not contact_user_id:
		raise errors.Error("Cannot find contact user id")

	if company_type == CompanyType.Payor:
		prev_partnership = cast(
			models.CompanyPayorPartnership,
			session.query(models.CompanyPayorPartnership).filter(
				models.CompanyPayorPartnership.company_id == customer_id
			).filter(
				models.CompanyPayorPartnership.payor_id == company_id
			).first())
		if prev_partnership:
			raise errors.Error('Partnership already exists. Please delete this payor partnership request')

		company_payor_partnership = models.CompanyPayorPartnership(
			company_id=customer_id,
			payor_id=company_id,
		)
		session.add(company_payor_partnership)
		session.flush()
		partnership_id = str(company_payor_partnership.id)
		partnership_type = db_constants.CompanyType.Payor

		# Existing company may not have is_payor set to True yet,
		# for example it may only have is_customer set to True.
		if not should_create_company:
			company.is_payor = True

		# Create a default user for the partnership based on who was submitted with the request
		company_payor_contact = models.CompanyPayorContact()
		company_payor_contact.partnership_id = company_payor_partnership.id
		company_payor_contact.payor_user_id = contact_user_id
		session.add(company_payor_contact)
		session.flush()

	elif company_type == CompanyType.Vendor:
		prev_vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.company_id == customer_id
			).filter(
				models.CompanyVendorPartnership.vendor_id == company_id
			).first())
		if prev_vendor_partnership:
			raise errors.Error('Partnership already exists. Please delete this vendor partnership request')

		company_vendor_partnership = models.CompanyVendorPartnership(
			company_id=customer_id,
			vendor_id=company_id,
		)
		session.add(company_vendor_partnership)
		session.flush()
		partnership_id = str(company_vendor_partnership.id)
		partnership_type = db_constants.CompanyType.Vendor

		# Existing company may not have is_vendor set to True yet,
		# for example it may only have is_customer set to True.
		if not should_create_company:
			company.is_vendor = True

		# Create a default user for the partnership based on who was submitted with the request
		company_vendor_contact = models.CompanyVendorContact()
		company_vendor_contact.partnership_id = company_vendor_partnership.id
		company_vendor_contact.vendor_user_id = contact_user_id
		session.add(company_vendor_contact)
		session.flush()

	else:
		raise errors.Error('Unexpected company_type {}'.format(company_type))

	# Weve fulfilled the partnership request so we can mark it as "settled" now.
	partnership_req.settled_at = date_util.now()
	partnership_req.settled_by_user_id = bank_admin_user_id

	return CreatePartnershipRespDict(
		company_id=company_id,
		customer_id=customer_id,
		partnership_id=partnership_id,
		partnership_type=partnership_type,
		company_type=company_type
	), None

@errors.return_error_tuple
def delete_partnership_request(
	partnership_request_id: str,
	session: Session
) -> Tuple[bool, errors.Error]:

	partnership_req = cast(
		models.CompanyPartnershipRequest,
		session.query(models.CompanyPartnershipRequest).filter(
			models.CompanyPartnershipRequest.id == partnership_request_id
		).first())
	if not partnership_req:
		raise errors.Error('No partnership request found to delete this partnership')

	partnership_req.is_deleted = True

	return True, None

@errors.return_error_tuple
def create_partnership_request(
	req: CreatePartnershipRequestInputDict,
	requested_user_id: str,
	session: Session,
	is_payor: bool,
) -> Tuple[str, errors.Error]:
	customer_id = req['customer_id']

	company_input = req['company']
	company_name = company_input['name']
	is_cannabis = company_input['is_cannabis']

	if not company_name:
		raise errors.Error('Name must be specified')

	user_input = req['user']
	user_first_name = user_input['first_name']
	user_last_name = user_input['last_name']
	user_email = user_input['email']
	user_phone_number = user_input['phone_number']

	if not user_first_name or not user_last_name:
		raise errors.Error('User full name must be specified')

	if not user_email:
		raise errors.Error('User email must be specified')

	if not user_phone_number:
		raise errors.Error('User phone number must be specified')

	partnership_req = models.CompanyPartnershipRequest()
	partnership_req.requesting_company_id = customer_id
	partnership_req.two_factor_message_method = TwoFactorMessageMethod.PHONE
	partnership_req.company_type = CompanyType.Payor if is_payor else CompanyType.Vendor
	partnership_req.company_name = company_name
	partnership_req.is_cannabis = is_cannabis
	partnership_req.requested_by_user_id = requested_user_id
	partnership_req.license_info = cast(Dict, req['license_info'])

	partnership_req.user_info = {
		'first_name': user_first_name,
		'last_name': user_last_name,
		'email': user_email,
		'phone_number': user_phone_number
	}
	session.add(partnership_req)
	session.flush()
	partnership_req_id = str(partnership_req.id)

	return partnership_req_id, None

@errors.return_error_tuple
def _validate_partnership_request_new(
	req: PartnershipRequestNewInputDict,
	session: Session,
) -> Optional[errors.Error]:
	company_input = req['company']
	company_name = company_input['name']
	is_cannabis = company_input['is_cannabis']

	user_input = req['user']
	user_first_name = user_input['first_name']
	user_last_name = user_input['last_name']
	user_email = user_input['email']
	user_phone_number = user_input['phone_number']

	if not user_first_name or not user_last_name:
		return errors.Error('User full name must be specified')

	if not user_email:
		return errors.Error('User email must be specified')

	if not user_phone_number:
		return errors.Error('User phone number must be specified')
	
	request_info_input = req['request_info']
	request_info_dba_name = request_info_input['dba_name']
	request_info_bank_name = request_info_input['bank_name']
	request_info_bank_account_name = request_info_input['bank_account_name']
	request_info_bank_account_type = request_info_input['bank_account_type']
	request_info_bank_account_number = request_info_input['bank_account_number']
	request_info_bank_ach_routing_number = request_info_input['bank_ach_routing_number']
	request_info_bank_wire_routing_number = request_info_input['bank_wire_routing_number']
	request_info_beneficiary_address = request_info_input['beneficiary_address']
	request_info_bank_instructions_attachment_id = request_info_input['bank_instructions_attachment_id']

	if not request_info_bank_name:
		return errors.Error('Bank name must be specified')
	
	if not request_info_bank_account_name:
		return errors.Error('Bank account name must be specified')
	
	if not request_info_bank_account_type:
		return errors.Error('Bank account type must be specified')
	
	if not request_info_bank_account_number:
		return errors.Error('Bank account number must be specified')
	
	if not request_info_bank_ach_routing_number and not request_info_bank_wire_routing_number:
		return errors.Error('Bank ACH / wire routing number must be specified')
	
	if not request_info_beneficiary_address:
		return errors.Error('Beneficiary address wire routing number must be specified')
	
	if not request_info_bank_instructions_attachment_id:
		return errors.Error('Canceled check / bank instructions attachment must be specified')

	if not models_util.is_valid_uuid(request_info_bank_instructions_attachment_id):
		return errors.Error('File id of bank instructions attachment is not valid')
	
	return None

@errors.return_error_tuple
def _create_or_update_partnership_request_new(
	req: PartnershipRequestNewInputDict,
	session: Session,
	partnership_req_id: Optional[str] = None,
	customer_id: Optional[str] = None,
) -> Tuple[str, errors.Error]:
	company_input = req['company']
	company_name = company_input['name']
	is_cannabis = company_input['is_cannabis']

	user_input = req['user']
	user_first_name = user_input['first_name']
	user_last_name = user_input['last_name']
	user_email = user_input['email']
	user_phone_number = user_input['phone_number']

	request_info_input = req['request_info']
	request_info_dba_name = request_info_input['dba_name']
	request_info_bank_name = request_info_input['bank_name']
	request_info_bank_account_name = request_info_input['bank_account_name']
	request_info_bank_account_type = request_info_input['bank_account_type']
	request_info_bank_account_number = request_info_input['bank_account_number']
	request_info_bank_ach_routing_number = request_info_input['bank_ach_routing_number']
	request_info_bank_wire_routing_number = request_info_input['bank_wire_routing_number']
	request_info_beneficiary_address = request_info_input['beneficiary_address']
	request_info_bank_instructions_attachment_id = request_info_input['bank_instructions_attachment_id']

	if partnership_req_id:
		# Update
		partnership_req = cast(
			models.CompanyPartnershipRequest,
			session.query(models.CompanyPartnershipRequest).filter(
				models.CompanyPartnershipRequest.id == partnership_req_id
			).first())
	else:
		# Create
		partnership_req = models.CompanyPartnershipRequest()
	
	if not partnership_req_id:
		# Create
		partnership_req.requesting_company_id = customer_id
		partnership_req.two_factor_message_method = TwoFactorMessageMethod.PHONE
		partnership_req.company_type = CompanyType.Vendor

	partnership_req.company_name = company_name
	partnership_req.is_cannabis = is_cannabis

	license_info = cast(LicenseInfoNewDict, req['license_info'])
	if is_cannabis is True and not models_util.is_valid_uuid(license_info['license_file_id']):
		return None, errors.Error('File id of license file attachment is not valid')

	partnership_req.license_info = cast(Dict[str, Any], license_info)

	partnership_req.user_info = {
		'first_name': user_first_name,
		'last_name': user_last_name,
		'email': user_email,
		'phone_number': user_phone_number
	}

	partnership_req.request_info = {
		'dba_name': request_info_dba_name,
		'bank_name': request_info_bank_name,
		'bank_account_name': request_info_bank_account_name,
		'bank_account_type': request_info_bank_account_type,
		'bank_account_number': request_info_bank_account_number,
		'bank_ach_routing_number': request_info_bank_ach_routing_number,
		'bank_wire_routing_number': request_info_bank_wire_routing_number,
		'beneficiary_address': request_info_beneficiary_address,
		'bank_instructions_attachment_id': request_info_bank_instructions_attachment_id
	}

	# Set the submitted_by_user_id from partnership invite
	company_partnership_invite = cast(
		models.CompanyPartnershipInvitation,
		session.query(models.CompanyPartnershipInvitation).filter(
			models.CompanyPartnershipInvitation.email == user_email
		).first()
	)
	if company_partnership_invite and company_partnership_invite.submitted_by_user_id:
		partnership_req.requested_by_user_id = company_partnership_invite.submitted_by_user_id

	if not partnership_req_id:
		# Create
		session.add(partnership_req)
		session.flush()
	
	partnership_req_id = str(partnership_req.id)

	return partnership_req_id, None


@errors.return_error_tuple
def create_partnership_request_new(
	req: CreatePartnershipRequestNewInputDict,
	session: Session,
	is_payor: bool,
) -> Tuple[str, errors.Error]:
	customer_id = req['customer_id']

	if not customer_id:
		return None, errors.Error('Name must be specified')

	err = _validate_partnership_request_new(
		req=req,
		session=session,
	)

	if err:
		return None, err

	partnership_req_id, err = _create_or_update_partnership_request_new(
		req=req,
		session=session,
		customer_id=customer_id,
	)
	if err:
		return None, err

	return partnership_req_id, None


@errors.return_error_tuple
def update_partnership_request_new(
	req: UpdatePartnershipRequestNewInputDict,
	session: Session,
) -> Tuple[bool, errors.Error]:
	partnership_req_id = req['partnership_request_id']

	partnership_req = cast(
		models.CompanyPartnershipRequest,
		session.query(models.CompanyPartnershipRequest).filter(
			models.CompanyPartnershipRequest.id == partnership_req_id
		).first())

	if not partnership_req:
		return False, errors.Error('No partnership request found to update this partnership')
	
	err = _validate_partnership_request_new(
		req=req,
		session=session,
	)

	if err:
		raise err
	
	_, err = _create_or_update_partnership_request_new(
		req=req,
		session=session,
		partnership_req_id=partnership_req_id,
	)
	if err:
		return False, err

	return True, None

@errors.return_error_tuple
def approve_partnership(
	partnership_id: str,
	is_payor: bool,
	session: Session,
) -> Tuple[bool, errors.Error]:
	if is_payor:
		company_payor_partnership = cast(
			models.CompanyPayorPartnership,
			session.query(models.CompanyPayorPartnership).get(partnership_id))

		if not company_payor_partnership:
			raise errors.Error('Partnership not found')

		company_payor_partnership.approved_at = date_util.now()

	else:
		company_vendor_partnership = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).get(partnership_id))

		if not company_vendor_partnership:
			raise errors.Error('Partnership not found')

		company_vendor_partnership.approved_at = date_util.now()

	return True, None

@errors.return_error_tuple
def certify_customer_surveillance_result(
	session: Session,
	company_id: str,
	surveillance_status: str,
	surveillance_status_note: str,
	surveillance_info: Dict[str, Union[str, bool]],
	qualifying_product: str,
	qualifying_date: str,
	user_id: str,
) -> Tuple[str, errors.Error]:
	customer_surveillance_result = cast(
		models.CustomerSurveillanceResult,
		session.query(models.CustomerSurveillanceResult).filter(
			models.CustomerSurveillanceResult.company_id == company_id
		).filter(
			models.CustomerSurveillanceResult.qualifying_date == qualifying_date
		).first())

	if not customer_surveillance_result:
		customer_surveillance_result = models.CustomerSurveillanceResult( #type: ignore
			company_id = company_id,
			qualifying_date = qualifying_date,
			submitting_user_id = user_id,
			metadata_info = {}
		)
	
		session.add(customer_surveillance_result)
		session.flush()

	# Shared across create and update flow
	customer_surveillance_result.surveillance_status = surveillance_status
	customer_surveillance_result.bank_note = surveillance_status_note
	customer_surveillance_result.surveillance_info = surveillance_info
	customer_surveillance_result.qualifying_product = qualifying_product

	# If qualifying date is equal to the month previous to the current month,
	# then we also want to update the company's surveillance_status and
	# surveillance_status_note. This is then displayed in the current CS tab.
	# The historical CS tab pulls from the customer_surveillance_results table
	today_date = date_util.now_as_date()
	qualifying_month = date_util.load_date_str(qualifying_date)
	if qualifying_month > today_date:
		return None, errors.Error("Certification month cannot be set to in the future")

	previous_month = date_util.get_previous_month_last_date(today_date)
	if qualifying_month.month == previous_month.month and \
		qualifying_month.year == previous_month.year:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())

		if not company:
			return None, errors.Error("Could not find company with specified id")

		company.surveillance_status = surveillance_status
		company.surveillance_status_note = surveillance_status_note

	return str(customer_surveillance_result.id), None
