"""
	Utility functions for helping to calculate and create the effect of advances
"""

import datetime
import decimal
from datetime import timedelta
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

FundLoansReqDict = TypedDict('FundLoansReqDict', {
	'loan_ids': List[str],
	'payment': payment_util.PaymentInsertInputDict
})

FundLoansRespDict = TypedDict('FundLoansRespDict', {
	'status': str
})

def _get_contracts_by_company_id(
	company_ids: List[str], session: Session,
	err_details: Dict) -> Tuple[Dict[str, contract_util.Contract], errors.Error]:
	companies = cast(
		List[models.Company],
		session.query(models.Company).filter(
			models.Company.id.in_(company_ids)
		).all())
	if not companies or len(companies) != len(company_ids):
		return None, errors.Error('Could not find all the companies associated with all the loans provided', details=err_details)

	contract_ids = []
	companies_with_missing_contracts = []
	for company in companies:
		if not company.contract_id:
			companies_with_missing_contracts.append(str(company.name))
		else:
			contract_ids.append(str(company.contract_id))

	if companies_with_missing_contracts:
		return None, errors.Error('{} have missing contracts, cannot proceed with the advances process'.format(companies_with_missing_contracts), details=err_details)		

	contracts = cast(
		List[models.Contract],
		session.query(models.Contract).filter(
			models.Contract.id.in_(contract_ids)
		).all())
	if not contracts or len(contracts) != len(contract_ids):
		return None, errors.Error('Could not find all the contracts associated with all companies associated with the loans provided', details=err_details)

	company_id_to_contract = {}
	for contract in contracts:
		company_id = str(contract.company_id)
		contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=False)
		if err:
			return None, err
		company_id_to_contract[company_id] = contract_obj

	return company_id_to_contract, None

def fund_loans_with_advance(
	req: FundLoansReqDict, bank_admin_user_id: str, 
	session_maker: Callable) -> Tuple[FundLoansRespDict, errors.Error]:

	payment_input = req['payment']
	loan_ids = req['loan_ids']

	err_details = {
		'payment_input': payment_input,
		'loan_ids': loan_ids,
		'method': 'fund_loans_with_advance'
	}
	loan_dicts = []
	payment_dict: models.PaymentDict = None

	with session_scope(session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		if len(loans) != len(loan_ids):
			return None, errors.Error('Not all loans were found to fund in database', details=err_details)

		already_funded_loan_ids: List[str] = []
		not_approved_loan_ids: List[str] = []
		for loan in loans:
			loan_id = str(loan.id)
			if loan.funded_at:
				already_funded_loan_ids.append(loan_id)
			if not loan.approved_at:
				not_approved_loan_ids.append(loan_id)

			loan_dicts.append(loan.as_dict())

		if not_approved_loan_ids:
			return None, errors.Error('These loans are not approved yet. Please remove them from the advances process: {}'.format(
				not_approved_loan_ids), details=err_details)

		if already_funded_loan_ids:
			return None, errors.Error('These loans have already been funded. Please remove them from the advances process: {}'.format(
				already_funded_loan_ids), details=err_details)

		loans_sum = 0.0
		for loan_dict in loan_dicts:
			loans_sum += float(loan_dict['amount'])

		advance_amount = payment_input['amount']

		if not number_util.float_eq(loans_sum, advance_amount):
			# NOTE: Only support exact amounts for now, where this advance covers exactly all
			# the amounts of the loans listed.
			return None, errors.Error('Advance amount must the sum of loans to fund exactly. Advance amount: {}, sum of loans: {}'.format(
				number_util.to_dollar_format(advance_amount),
				number_util.to_dollar_format(loans_sum)), details=err_details)

		# Group loans by company_id and create an advance per company_id
		company_id_to_loans: Dict[str, List[models.LoanDict]] = {}
		for loan_dict in loan_dicts:
			company_id = loan_dict['company_id']
			if company_id not in company_id_to_loans:
				company_id_to_loans[company_id] = []

			company_id_to_loans[company_id].append(loan_dict)

		# Load up the contracts for all the companies listed here

		unique_company_ids = list(company_id_to_loans.keys())
		contracts_by_company_id, err = _get_contracts_by_company_id(
			unique_company_ids, session, err_details)
		if err:
			return None, err

		payment_date = date_util.load_date_str(payment_input['payment_date'])
		settlement_date = date_util.load_date_str(payment_input['settlement_date'])

		for company_id, loans_for_company in company_id_to_loans.items():
			amount_to_company = sum([cur_loan_dict['amount'] for cur_loan_dict in loans_for_company])
			payment = payment_util.create_payment(company_id, payment_util.PaymentInputDict(
				type=db_constants.PaymentType.ADVANCE,
				amount=amount_to_company,
				payment_method=payment_input['method']
			), 
			user_id=bank_admin_user_id)
			payment_util.make_payment_applied(
				payment, settled_by_user_id=bank_admin_user_id, 
				payment_date=payment_date,
				settlement_date=settlement_date)
			session.add(payment)
			session.flush()
			payment_id = payment.id

			for loan_dict in loans_for_company:
				amount = loan_dict['amount']
				t = models.Transaction()
				t.type = db_constants.PaymentType.ADVANCE
				t.amount = decimal.Decimal(amount)
				t.to_principal = decimal.Decimal(amount)
				t.to_interest = decimal.Decimal(0.0)
				t.to_fees = decimal.Decimal(0.0)
				t.loan_id = loan_dict['id']
				t.payment_id = payment_id
				t.created_by_user_id = bank_admin_user_id
				t.effective_date = settlement_date
				session.add(t)

		for loan in loans:
			cur_contract = contracts_by_company_id[str(loan.company_id)]
			maturity_date, err = cur_contract.get_maturity_date(settlement_date)
			if err:
				return None, err

			adjusted_maturity_date, err = cur_contract.get_adjusted_maturity_date(settlement_date)
			if err:
				return None, err

			loan.funded_at = date_util.now()
			loan.funded_by_user_id = bank_admin_user_id
			loan.outstanding_principal_balance = loan.amount
			loan.outstanding_interest = decimal.Decimal(0.0)
			loan.outstanding_fees = decimal.Decimal(0.0)
			loan.origination_date = settlement_date
			loan.maturity_date = maturity_date
			loan.adjusted_maturity_date = adjusted_maturity_date

	return FundLoansRespDict(status='OK'), None

