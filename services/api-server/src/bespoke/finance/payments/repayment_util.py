
import datetime

from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple, List, Callable, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.models import session_scope
from bespoke.finance.types import per_customer_types
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util

RepaymentEffectRespDict = TypedDict('RepaymentEffectRespDict', {
	'status': str,
	'loans_due': List[models.LoanDict],
	'total_due': float,
	'amount_leftover': float
})

def calculate_repayment_effect(
	payment_input: payment_util.PaymentInsertInputDict,
	company_id: str,
	loan_ids: List[str],
	session_maker: Callable) -> Tuple[RepaymentEffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?
	
	# TODO(dlluncor): Handle the case where we change the loans a user tries to pay off
	# because they haven't selected loans that have already come due.

	# Figure out how much is due by a particular date
	loan_dicts = []
	err_details = {'company_id': company_id, 'loan_ids': loan_ids, 'method': 'calculate_repayment_effect'}

	with session_scope(session_maker) as session:
		if loan_ids:			
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.company_id == company_id
				).filter(
					models.Loan.id.in_(loan_ids)
				).all())
		else:
			# No loans selected so grab all from the user
			loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).all())

		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		# Do I use the adjusted_maturity date or maturity_date?
		for loan in loans:
			loan_dicts.append(loan.as_dict())

	date_selected = date_util.load_date_str(payment_input['deposit_date'])
	loans_due = []
	total_due = 0.0

	for loan_dict in loan_dicts:
		# TODO(dlluncor): This can be done in the SQL query as well.
		if loan_dict['adjusted_maturity_date'] > date_selected:
			# You dont have to worry about paying off this loan yet.
			continue

		loans_due.append(loan_dict)
		total_due += payment_util.sum([
			loan_dict['outstanding_principal_balance'],
			loan_dict['outstanding_interest'],
			loan_dict['outstanding_fees']
		])

	amount_leftover = 0.0
	if payment_input.get('amount'):
		# How much is remaining after this amount is provided?
		amount_leftover = total_due - payment_input['amount']

	return RepaymentEffectRespDict(
		status='OK',
		loans_due=[models.safe_serialize(l) for l in loans_due],
		total_due=total_due,
		amount_leftover=amount_leftover
	), None
