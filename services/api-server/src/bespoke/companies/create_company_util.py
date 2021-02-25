"""
	Logic to help create a company.
"""

from typing import Callable, Dict, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
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
	'product_type': str,
	'product_config': Dict
})

CreateCompanyReqDict = TypedDict('CreateCompanyReqDict', {
	'company': CompanyInsertInputDict,
	'settings': CompanySettingsInsertInputDict,
	'contract': ContractInsertInputDict
})

CreateCompanyRespDict = TypedDict('CreateCompanyRespDict', {
	'status': str
})

def create_company(
	req: CreateCompanyReqDict, bank_admin_user_id: str,
	session_maker: Callable) -> Tuple[CreateCompanyRespDict, errors.Error]:

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

		# TODO(dlluncor): Once we have the contract being built on the frontend
		# we can do real validation here.
		contract = models.Contract(
			product_type=req['contract']['product_type'],
			product_config=req['contract']['product_config'],
			start_date=date_util.load_date_str(req['contract']['start_date'])
		)
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


	return CreateCompanyRespDict(
		status='OK'
	), None
