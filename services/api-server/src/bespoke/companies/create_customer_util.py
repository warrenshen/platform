"""
	Logic to help create a company.
"""
from typing import Callable, Dict, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict

# Should match with the graphql types for inserting objects into the DB.
CompanyInsertInputDict = TypedDict('CompanyInsertInputDict', {
	'name': str,
	'identifier': str
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

def create_customer(
	req: CreateCustomerInputDict, bank_admin_user_id: str,
	session_maker: Callable) -> Tuple[CreateCustomerRespDict, errors.Error]:

	with session_scope(session_maker) as session:
		company_name = req['company']['name']
		existing_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.name == company_name
			).first())
		if existing_company:
			return None, errors.Error('A company with the name "{}" already exists'.format(company_name))


		company_settings = models.CompanySettings()
		session.add(company_settings)

		if not req['contract']['product_config']:
			return None, errors.Error('No product config specified')

		contract = models.Contract(
			product_type=req['contract']['product_type'],
			product_config=req['contract']['product_config'],
			start_date=date_util.load_date_str(req['contract']['start_date']),
			end_date=date_util.load_date_str(req['contract']['end_date']),
			adjusted_end_date=date_util.load_date_str(req['contract']['end_date']),
		)
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
		if err:
			return None, err

		# Use whatever the produced product config is after using the validation logic
		# from contract_util.Contract
		contract.product_config = contract_obj.get_product_config()
		session.add(contract)

		session.flush()
		company_settings_id = str(company_settings.id)
		contract_id = str(contract.id)

		company = models.Company(
			name=company_name,
			identifier=req['company']['identifier'],
			company_settings_id=company_settings_id,
			contract_id=contract_id
		)
		session.add(company)
		session.flush()
		company_id = str(company.id)

		company_settings.company_id = company_id
		contract.company_id = company_id


	return CreateCustomerRespDict(
		status='OK'
	), None
