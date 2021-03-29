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

UserInsertInputDict = TypedDict('UserInsertInputDict', {
	'role': str,
	'first_name': str,
	'last_name': str,
	'email': str,
	'phone_number': str,
})

CreateBankCustomerInputDict = TypedDict('CreateBankCustomerInputDict', {
	'company_id': str,
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

def create_bank_or_customer_user(
	req: CreateBankCustomerInputDict,
	session_maker: Callable,
) -> Tuple[str, errors.Error]:
	# If company id is null, create a bank user. Otherwise, create a customer user.
	company_id = req['company_id']
	user_input = req['user']
	role = user_input['role']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']

	if not role:
		return None, errors.Error('Role must be specified')

	if not first_name or not last_name:
		return None, errors.Error('Full name must be specified')

	if not email:
		return None, errors.Error('Email must be specified')

	user_id = None

	with session_scope(session_maker) as session:
		if company_id:
			customer = session.query(models.Company) \
				.filter(models.Company.id == company_id) \
				.first()
			if not customer:
				return None, errors.Error('Could not find customer')
			if customer.company_type != CompanyType.Customer:
				return None, errors.Error('Company is not Customer company type')

		existing_user = session.query(models.User) \
			.filter(models.User.email == email) \
			.first()
		if existing_user:
			return None, errors.Error('Email is already taken')

		user = models.User()
		user.company_id = company_id
		user.role = role
		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.phone_number = phone_number

		session.add(user)
		session.flush()
		user_id = str(user.id)

	return user_id, None

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

	if not phone_number:
		return None, errors.Error('Phone number must be specified')

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

def update_third_party_user(
	req: UpdateThirdPartyUserInputDict,
	session_maker: Callable,
) -> Tuple[CreateThirdPartyUserRespDict, errors.Error]:
	user_id = req['user_id']
	user_input = req['user']
	first_name = user_input['first_name']
	last_name = user_input['last_name']
	email = user_input['email']
	phone_number = user_input['phone_number']

	if not email:
		return None, errors.Error('Email must be specified')

	if not phone_number:
		return None, errors.Error('Phone number must be specified')

	with session_scope(session_maker) as session:
		user = session.query(models.User) \
			.filter(models.User.id == user_id) \
			.first()
		if not user:
			return None, errors.Error('Could not find existing user')

		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.phone_number = phone_number

	return UpdateThirdPartyUserRespDict(
		status='OK',
		user_id=user_id,
	), None
