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
	'product_config': Dict
}, total=False)

UpdateContractReqDict = TypedDict('UpdateContractReqDict', {
	'contract_id': str,
	'contract_fields': ContractFieldsDict,
	'update_dates_only': bool
}, total=False)

TerminateContractReqDict = TypedDict('TerminateContractReqDict', {
	'contract_id': str,
	'termination_date': str
})

DeleteContractReqDict = TypedDict('DeleteContractReqDict', {
	'contract_id': str
})

AddNewContractReqDict = TypedDict('AddNewContractReqDict', {
	'company_id': str,
	'contract_fields': ContractFieldsDict
})

def _update_fields_based_on_new_dates(contract: models.Contract, new_start_date: datetime.date, new_end_date: datetime.date) -> Tuple[bool, errors.Error]:
	# We need to update fields based on the contract date ending. We have to set validate=False
	# so we don't error out when building the contract object
	contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=False)
	if err:
		return None, err
	success, err = contract_obj.update_fields_dependent_on_contract_dates(
		new_contract_start_date=new_start_date,
		new_contract_end_date=new_end_date
	)
	if err:
		return None, err
	contract.product_config = contract_obj.get_product_config()
	return True, None

def _update_contract(
	contract: models.Contract, 
	fields_dict: ContractFieldsDict,
	update_dates_only: bool,
	bank_admin_user_id: str) -> Tuple[bool, errors.Error]:

	start_date = date_util.load_date_str(fields_dict['start_date'])
	end_date = date_util.load_date_str(fields_dict['end_date'])

	if not update_dates_only:
		contract.product_type = fields_dict['product_type']
		contract.product_config = fields_dict['product_config']

	contract.start_date = start_date
	contract.end_date = end_date
	contract.adjusted_end_date = end_date
	contract.modified_by_user_id = bank_admin_user_id # type: ignore

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
	Updates maturity date related columns of all active and funded loans
	(NOT deleted, closed, nor unfunded loans).
	"""
	contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=True)
	if err:
		return False, err

	product_type, err = contract_obj.get_product_type()
	if err:
		return False, err	

	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Loan.company_id == contract.company_id
		).filter(
			models.Loan.funded_at != None
		).filter(
			models.Loan.closed_at == None
		).all())

	if product_type == ProductType.LINE_OF_CREDIT:		
		maturity_date, err = contract_obj.get_maturity_date(None)
		if err:
			return False, err

		adjusted_maturity_date, err = contract_obj.get_adjusted_maturity_date(None)
		if err:
			return False, err

		for loan in loans:
			loan.maturity_date = maturity_date
			loan.adjusted_maturity_date = adjusted_maturity_date

	else:
		for loan in loans:
			# In the non-line of credit case, the maturity date is determined by
			# taking the origination_date and adding the financing terms to that
			maturity_date, err = contract_obj.get_maturity_date(loan.origination_date)
			if err:
				return False, err

			adjusted_maturity_date, err = contract_obj.get_adjusted_maturity_date(loan.origination_date)
			if err:
				return False, err

			loan.maturity_date = maturity_date
			loan.adjusted_maturity_date = adjusted_maturity_date

	return True, None

@errors.return_error_tuple
def update_contract(
	req: UpdateContractReqDict, bank_admin_user_id: str, session: Session) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'update_contract'}

	contract = cast(
		models.Contract,
		session.query(models.Contract).filter(
			models.Contract.id == req['contract_id']
		).first())
	if not contract:
		raise errors.Error('Contract could not be found', details=err_details)

	if contract.terminated_at:
		raise errors.Error('Cannot modify a contract which already has been terminated or "frozen"', details=err_details)

	if contract.is_deleted:
		raise errors.Error('Cannot update a deleted contract')

	if not req['contract_fields']['start_date']:
		raise errors.Error('Start date must be specified', details=err_details)

	if not req['contract_fields']['end_date']:
		raise errors.Error('End date must be specified', details=err_details)

	success, err = _update_fields_based_on_new_dates(
		contract,
		new_start_date=date_util.load_date_str(req['contract_fields']['start_date']),
		new_end_date=date_util.load_date_str(req['contract_fields']['end_date'])
	)
	if err:
		raise err

	_, err = _update_contract(
		contract, 
		req['contract_fields'],
		update_dates_only=req.get('update_dates_only', False),
		bank_admin_user_id=bank_admin_user_id)
	if err:
		raise err

	_, err = _update_loans_on_active_contract_updated(contract, session)
	if err:
		raise err

	return True, None

@errors.return_error_tuple
def terminate_contract(
	req: TerminateContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'terminate_contract'}

	with session_scope(session_maker) as session:
		contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['contract_id']
			).first())
		if not contract:
			raise errors.Error('Contract could not be found', details=err_details)

		if contract.is_deleted:
			raise errors.Error('Cannot terminate a contract that is already deleted')

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == contract.company_id
			).first())
		if not company:
			raise errors.Error('Contract does not have a Company', details=err_details)

		termination_date = date_util.load_date_str(req['termination_date'])

		if termination_date > date_util.now_as_date(date_util.DEFAULT_TIMEZONE):
			raise errors.Error('Cannot set contract termination date to a date in the future', details=err_details)

		contract.adjusted_end_date = date_util.load_date_str(req['termination_date'])
		contract.terminated_at = date_util.now()
		contract.terminated_by_user_id = bank_admin_user_id # type: ignore

		success, err = _update_fields_based_on_new_dates(
			contract,
			new_start_date=contract.start_date,
			new_end_date=contract.adjusted_end_date
		)
		if err:
			raise err

		company.contract_id = None

		_, err = _update_loans_on_active_contract_updated(contract, session)
		if err:
			raise err

	return True, None

@errors.return_error_tuple
def delete_contract(
	req: DeleteContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:
	err_details = {'req': req, 'method': 'delete_contract'}

	with session_scope(session_maker) as session:
		contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.id == req['contract_id']
			).first())
		if not contract:
			raise errors.Error('Contract could not be found', details=err_details)

		if contract.is_deleted:
			raise errors.Error('Could not delete a contract which is already deleted')

		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == contract.company_id
			).first())
		if not company:
			raise errors.Error('Contract does not have a Company', details=err_details)

		if not contract.terminated_at:
			raise errors.Error('Cannot delete a contract which has not been terminated yet', details=err_details)

		contract.is_deleted = True

	return True, None

@errors.return_error_tuple
def add_new_contract(
	req: AddNewContractReqDict, bank_admin_user_id: str, session_maker: Callable) -> Tuple[str, errors.Error]:
	err_details = {'req': req, 'method': 'add_new_contract'}

	with session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == req['company_id']
			).first())
		if not company:
			raise errors.Error('Company could not be found', details=err_details)

		existing_contracts = cast(
			List[models.Contract],
			contract_util.get_active_contracts_base_query(session).filter(
				models.Contract.company_id == req['company_id']
			).all())
		if not existing_contracts:
			existing_contracts = []

		new_contract = models.Contract(company_id=company.id)
		success, err = _update_contract(
			new_contract, 
			req['contract_fields'],
			update_dates_only=False, 
			bank_admin_user_id=bank_admin_user_id
		)
		if err:
			raise err

		# Check no overlap in dates.
		start_date = new_contract.start_date
		end_date = new_contract.adjusted_end_date

		for cur_contract in existing_contracts:

			if not cur_contract.adjusted_end_date:
				raise errors.Error('Adjusted end date must be set on the all contracts', details=err_details)

			if start_date >= cur_contract.start_date and start_date <= cur_contract.adjusted_end_date:
				raise errors.Error('New contract start_date intersects with the current contract start and end date', details=err_details)

			if end_date >= cur_contract.start_date and end_date <= cur_contract.adjusted_end_date:
				raise errors.Error('New contract end_date intersects with the current contract start and end date', details=err_details)

		session.add(new_contract)

		_, err = _update_loans_on_active_contract_updated(new_contract, session)
		if err:
			raise err

		session.flush()

		new_contract_id = str(new_contract.id)
		company.contract_id = new_contract_id
		session.flush()

	return new_contract_id, None
