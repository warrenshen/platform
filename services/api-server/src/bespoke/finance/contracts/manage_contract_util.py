"""
	A file to help us manage the state of a contract in the DB
"""
import datetime
import json
import logging

from mypy_extensions import TypedDict
from typing import cast, Union, Tuple, Callable, Dict, List, Any

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope


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

EndContractReqDict = TypedDict('EndContractReqDict', {
	'contract_id': str,
	'termination_date': str
})

AddNewContractReqDict = TypedDict('AddNewContractReqDict', {
	'company_id': str,
	'cur_contract_id': str,
	'contract_fields': ContractFieldsDict
})

def _update_contract(
	contract: models.Contract, fields_dict: ContractFieldsDict,
	bank_admin_user_id: str) -> None:
	end_date = date_util.load_date_str(fields_dict['end_date'])

	contract.product_type = fields_dict['product_type']
	contract.product_config = fields_dict['product_config']
	contract.start_date = date_util.load_date_str(fields_dict['start_date'])
	contract.end_date = end_date
	contract.adjusted_end_date = end_date
	contract.modified_by_user_id = bank_admin_user_id

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

		_update_contract(contract, req['contract_fields'], bank_admin_user_id)

	return True, None

def end_contract(req: EndContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'end_contract'}

	with session_scope(session_maker) as session:
		contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['contract_id']
			).first())
		if not contract:
			return False, errors.Error('Contract could not be found', details=err_details)

		contract.adjusted_end_date = date_util.load_date_str(req['termination_date'])
		contract.terminated_at = date_util.now()
		contract.terminated_by_user_id = bank_admin_user_id

	return True, None

def add_new_contract(req: AddNewContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'add_new_contract'}

	with session_scope(session_maker) as session:
		cur_contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['cur_contract_id']
			).first())
		if not cur_contract:
			return False, errors.Error('Contract could not be found', details=err_details)

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == req['company_id']
			).first())
		if not company:
			return False, errors.Error('Company could not be found', details=err_details)

		new_contract = models.Contract()
		_update_contract(new_contract, req['contract_fields'], bank_admin_user_id)

		# Check no overlap in dates.
		start_date = new_contract.start_date
		end_date = new_contract.adjusted_end_date

		if not cur_contract.adjusted_end_date:
			return False, errors.Error('Adjusted end date must be set on the current contract', details=err_details)

		if start_date > cur_contract.start_date and start_date < cur_contract.adjusted_end_date:
			return False, errors.Error('New contract start_date intersects with the current contract start and end date', details=err_details)

		if end_date > cur_contract.start_date and end_date < cur_contract.adjusted_end_date:
			return False, errors.Error('New contract end_date intersects with the current contract start and end date', details=err_details)

		session.add(new_contract)
		session.flush()
		new_contract_id = str(new_contract.id)

		company.contract_id = new_contract_id

	return True, None
