"""
	Logic to help create a company.
"""
from typing import Any, Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.companies import create_user_util
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.db_constants import CompanyType, TwoFactorMessageMethod
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

# Should match with the graphql types for inserting objects into the DB.
CompanyInsertInputDict = TypedDict('CompanyInsertInputDict', {
	'name': str,
	'identifier': str,
	'contract_name': str,
	'dba_name': str,
	'is_cannabis': bool,
})

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

CreateCustomerRespDict = TypedDict('CreateCustomerRespDict', {
	'status': str
})

CreatePartnershipInputDict = TypedDict('CreatePartnershipInputDict', {
	'partnership_request_id': str,
	'should_create_company': bool,
	'partner_company_id': str, # the company ID of the partner who might already exist in the DB
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

CreatePartnershipRequestInputDict = TypedDict('CreatePartnershipRequestInputDict', {
	'customer_id': str,
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
	'license_info': LicenseInfoDict
})

def create_customer_company(
	name: str,
	identifier: str,
	contract_name: str,
	dba_name: str,
	session: Session,
) -> models.Company:
	company_settings = models.CompanySettings()
	session.add(company_settings)

	session.flush()
	company_settings_id = str(company_settings.id)

	company = models.Company(
		is_customer=True,
		name=name,
		identifier=identifier,
		contract_name=contract_name,
		dba_name=dba_name,
		company_settings_id=company_settings_id,
	)

	session.add(company)
	session.flush()

	company_id = str(company.id)
	company_settings.company_id = company_id

	return company

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

		existing_company_by_name = cast(
			models.Company,
			session.query(models.Company).filter(
				cast(Callable, models.Company.is_customer.is_)(True)
			).filter(
				models.Company.name == company_name
			).first())
		if existing_company_by_name:
			raise errors.Error(f'A customer with name "{company_name}" already exists')

		existing_company_by_identifier = cast(
			models.Company,
			session.query(models.Company).filter(
				cast(Callable, models.Company.is_customer.is_)(True)
			).filter(
				models.Company.identifier == company_identifier
			).first())
		if existing_company_by_identifier:
			raise errors.Error(f'A customer with identifier "{company_identifier}" already exists')

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

		company = create_customer_company(
			name=company_name,
			identifier=company_identifier,
			contract_name=company_contract_name,
			dba_name=company_dba_name,
			session=session,
		)

		company_id = str(company.id)
		company.contract_id = contract_id
		contract.company_id = company_id

	return CreateCustomerRespDict(
		status='OK'
	), None

# We will have two methods:
#
# Create partnership and company
#
# Just create the partnership with a company_id

def _create_partner_company_and_its_first_user(
	partnership_req: models.CompanyPartnershipRequest,
	session: Session,
) -> str:
	user_input = cast(Dict, partnership_req.user_info)
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

	company_settings = models.CompanySettings()
	company_settings.two_factor_message_method = partnership_req.two_factor_message_method
	session.add(company_settings)
	session.flush()
	company_settings_id = str(company_settings.id)

	company = models.Company(
		company_settings_id=company_settings_id,
		is_customer=False,
		is_payor=partnership_req.company_type == CompanyType.Payor,
		is_vendor=partnership_req.company_type == CompanyType.Vendor,
		name=partnership_req.company_name,
		is_cannabis=partnership_req.is_cannabis,
	)
	session.add(company)
	session.flush()
	company_id = str(company.id)

	existing_user = session.query(models.User) \
		.filter(models.User.email == user_email) \
		.first()
	if existing_user:
		raise errors.Error('Email is already taken')

	# Note: Payor / Vendor users do not have any role for now.
	user = models.User()
	user.company_id = company_id
	user.first_name = user_first_name
	user.last_name = user_last_name
	user.email = user_email
	user.phone_number = user_phone_number
	session.add(user)

	if partnership_req.license_info:
		# Add any licenses the user might have specified.
		license_ids = cast(Dict, partnership_req.license_info)['license_ids']
		for license_id in license_ids:
			license = models.CompanyLicense()
			license.company_id = cast(Any, company_id)
			license.license_number = license_id
			session.add(license)

	return company_id

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
		session.query(models.Company).get(company_id)
	)

	company_type = partnership_req.company_type
	partnership_id = None
	partnership_type = None

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
