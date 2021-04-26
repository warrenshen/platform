"""
	Logic to help create a company.
"""
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.companies import create_user_util
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType, TwoFactorMessageMethod
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict

# Should match with the graphql types for inserting objects into the DB.
CompanyInsertInputDict = TypedDict('CompanyInsertInputDict', {
	'name': str,
	'identifier': str,
	'contract_name': str,
	'dba_name': str
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

CreatePayorVendorInputDict = TypedDict('CreatePayorVendorInputDict', {
	'customer_id': str,
	'company': CompanyInsertInputDict,
	'user': create_user_util.UserInsertInputDict,
})

@errors.return_error_tuple
def create_customer(
	req: CreateCustomerInputDict, bank_admin_user_id: str,
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
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.name == company_name
			).first())
		if existing_company_by_name:
			raise errors.Error(f'A customer with name "{company_name}" already exists')

		existing_company_by_identifier = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == company_identifier
			).first())
		if existing_company_by_identifier:
			raise errors.Error(f'A customer with identifier "{company_identifier}" already exists')

		company_settings = models.CompanySettings()
		session.add(company_settings)

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
		company_settings_id = str(company_settings.id)
		contract_id = str(contract.id)

		company = models.Company(
			company_type=CompanyType.Customer,
			name=company_name,
			identifier=company_identifier,
			contract_name=company_contract_name,
			dba_name=company_dba_name,
			company_settings_id=company_settings_id,
			contract_id=contract_id,
		)
		session.add(company)
		session.flush()
		company_id = str(company.id)

		company_settings.company_id = company_id
		contract.company_id = company_id


	return CreateCustomerRespDict(
		status='OK'
	), None

@errors.return_error_tuple
def create_payor_vendor(
	req: CreatePayorVendorInputDict,
	session_maker: Callable,
	is_payor: bool,
) -> Tuple[str, errors.Error]:
	customer_id = req['customer_id']

	company_input = req['company']
	company_name = company_input['name']

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

	with session_scope(session_maker) as session:
		company_settings = models.CompanySettings()
		company_settings.two_factor_message_method = TwoFactorMessageMethod.PHONE
		session.add(company_settings)
		session.flush()
		company_settings_id = str(company_settings.id)

		company = models.Company(
			company_settings_id=company_settings_id,
			company_type=CompanyType.Payor if is_payor else CompanyType.Vendor,
			name=company_name,
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

		if is_payor:
			company_payor_partnership = models.CompanyPayorPartnership(
				company_id=customer_id,
				payor_id=company_id,
			)
			session.add(company_payor_partnership)
		else:
			company_vendor_partnership = models.CompanyVendorPartnership(
				company_id=customer_id,
				vendor_id=company_id,
			)
			session.add(company_vendor_partnership)

	return company_id, None
