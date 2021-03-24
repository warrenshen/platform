"""
Logic to create users.
"""
from typing import Callable, Dict, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict

UsersInsertInput = TypedDict('UsersInsertInput', {
	'first_name': str,
	'last_name': str,
	'email': str,
	'phone_number': str,
})

CreateThirdPartyUserInputDict = TypedDict('CreateThirdPartyUserInputDict', {
	'company_id': str,
	'user': UsersInsertInput,
})

CreateThirdPartyUserRespDict = TypedDict('CreateThirdPartyUserRespDict', {
	'status': str,
	'user_id': str,
})

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
		return None, errors.Error('Email must be specified')

	user_id = None

	with session_scope(session_maker) as session:
		company = session.query(models.Company) \
			.filter(models.Company.id == company_id) \
			.first()
		if not company:
			return None, errors.Error('Could not find company')
		if is_payor and company.company_type != CompanyType.Payor:
			return None, errors.Error('Company is not Payor company type')
		if not is_payor and company.company_type != CompanyType.Vendor:
			return None, errors.Error('Company is not Vendor company type')

		user = session.query(models.User) \
			.filter(models.User.email == email) \
			.first()
		if user:
			return None, errors.Error('Email is already taken')

		user = models.User()
		user.company_id = company_id
		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.phone_number = phone_number

		session.add(user)
		session.flush()
		user_id = str(user.id)

	return CreateThirdPartyUserRespDict(
		status='OK',
		user_id=user_id,
	), None
