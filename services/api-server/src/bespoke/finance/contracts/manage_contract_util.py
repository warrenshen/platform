"""
	A file to help us manage the state of a contract in the DB
"""
import datetime
import json
import logging
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from mypy_extensions import TypedDict
from sqlalchemy.orm import Session

ContractFieldsDict = TypedDict('ContractFieldsDict', {
	'product_type': str,
	'start_date': str,
	'end_date': str,
	'product_config': Dict,
	'termination_date': str
})

UpdateContractReqDict = TypedDict('UpdateContractReqDict', {
	'contract_id': str,
	'contract_fields': ContractFieldsDict
})

TerminateContractReqDict = TypedDict('TerminateContractReqDict', {
	'contract_id': str,
	'termination_date': str
})

AddNewContractReqDict = TypedDict('AddNewContractReqDict', {
	'company_id': str,
	'contract_fields': ContractFieldsDict
})

def _update_contract(
	contract: models.Contract, fields_dict: ContractFieldsDict,
	bank_admin_user_id: str) -> Tuple[bool, errors.Error]:

	start_date = date_util.load_date_str(fields_dict['start_date'])
	end_date = date_util.load_date_str(fields_dict['end_date'])

	contract.product_type = fields_dict['product_type']
	contract.product_config = fields_dict['product_config']
	contract.start_date = start_date
	contract.end_date = end_date
	contract.adjusted_end_date = end_date
	contract.modified_by_user_id = bank_admin_user_id

	contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
	if err:
		return None, err

	contract.product_config = contract_obj.get_product_config()

	return True, None

def _update_loans_on_active_contract_updated(
	contract: models.Contract,
	session: Session,
) -> Tuple[bool, errors.Error]:
	"""
	For line of credit customers, we update maturity date of all active loans when active contract is updated.
	"""
	contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)

	product_type, err = contract_obj.get_product_type()
	if err:
		return False, err

	if product_type != ProductType.LINE_OF_CREDIT:
		return True, None

	maturity_date, err = contract_obj.get_maturity_date(None)
	if err:
		return False, err

	adjusted_maturity_date, err = contract_obj.get_adjusted_maturity_date(None)
	if err:
		return False, err

	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.company_id == contract.company_id
		).filter(
			models.Loan.closed_at == None
		).all())

	for loan in loans:
		loan.maturity_date = maturity_date
		loan.adjusted_maturity_date = adjusted_maturity_date

	return True, None

def update_contract(req: UpdateContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'update_contract'}

	with session_scope(session_maker) as session:
		contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['contract_id']
			).first())
		if not contract:
			return False, errors.Error('Contract could not be found', details=err_details)

		if contract.terminated_at:
			return False, errors.Error('Cannot modify a contract which already has been terminated or "frozen"', details=err_details)

		_, err = _update_contract(contract, req['contract_fields'], bank_admin_user_id)
		if err:
			return None, err

		_, err = _update_loans_on_active_contract_updated(contract, session)
		if err:
			return None, err

	return True, None

def terminate_contract(req: TerminateContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'terminate_contract'}

	with session_scope(session_maker) as session:
		contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['contract_id']
			).first())
		if not contract:
			return False, errors.Error('Contract could not be found', details=err_details)

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == contract.company_id
			).first())
		if not company:
			return False, errors.Error('Contract does not have a Company', details=err_details)

		termination_date = date_util.load_date_str(req['termination_date'])

		if termination_date > date_util.today_as_date():
			return False, errors.Error('Cannot set contract termination date to a date in the future', details=err_details)

		contract.adjusted_end_date = date_util.load_date_str(req['termination_date'])
		contract.terminated_at = date_util.now()
		contract.terminated_by_user_id = bank_admin_user_id

		company.contract_id = None

		_, err = _update_loans_on_active_contract_updated(contract, session)
		if err:
			return None, err

	return True, None

def add_new_contract(req: AddNewContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'add_new_contract'}

	with session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == req['company_id']
			).first())
		if not company:
			return False, errors.Error('Company could not be found', details=err_details)

		existing_contracts = cast(
			List[models.Contract],
			session.query(models.Contract).filter(
				models.Contract.company_id == req['company_id']
			).all())
		if not existing_contracts:
			existing_contracts = []

		new_contract = models.Contract(company_id=company.id)
		success, err = _update_contract(new_contract, req['contract_fields'], bank_admin_user_id)
		if err:
			return None, err

		# Check no overlap in dates.
		start_date = new_contract.start_date
		end_date = new_contract.adjusted_end_date

		for cur_contract in existing_contracts:

			if not cur_contract.adjusted_end_date:
				return False, errors.Error('Adjusted end date must be set on the all contracts', details=err_details)

			if start_date >= cur_contract.start_date and start_date <= cur_contract.adjusted_end_date:
				return False, errors.Error('New contract start_date intersects with the current contract start and end date', details=err_details)

			if end_date >= cur_contract.start_date and end_date <= cur_contract.adjusted_end_date:
				return False, errors.Error('New contract end_date intersects with the current contract start and end date', details=err_details)

		session.add(new_contract)

		_, err = _update_loans_on_active_contract_updated(new_contract, session)
		if err:
			return None, err

		session.flush()

		new_contract_id = str(new_contract.id)
		company.contract_id = new_contract_id
		session.flush()

	return True, None
