
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
	'loans_afterwards': List[models.LoanDict],
	'amount_to_pay': float
})

def calculate_repayment_effect(
	payment_input: payment_util.PaymentInsertInputDict,
	payment_option: str,
	company_id: str,
	loan_ids: List[str],
	session_maker: Callable) -> Tuple[RepaymentEffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?

	if payment_option == 'custom_amount':
		if not number_util.is_number(payment_input.get('amount')) and payment_input['amount'] <= 0:
			return None, errors.Error('Amount must greater than 0 when the payment option is Custom Amount')

	if not payment_input.get('deposit_date'):
		return None, errors.Error('Deposit date must be specified')
	
	if not loan_ids:
		return None, errors.Error('No loan ids are selected')

	# TODO(dlluncor): Handle the case where we change the loans a user tries to pay off
	# because they haven't selected loans that have already come due.

	# Figure out how much is due by a particular date
	loan_dicts = []
	err_details = {'company_id': company_id, 'loan_ids': loan_ids, 'method': 'calculate_repayment_effect'}

	with session_scope(session_maker) as session:		
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.company_id == company_id
			).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		# Do I use the adjusted_maturity date or maturity_date?
		for loan in loans:
			loan_dicts.append(loan.as_dict())

	date_selected = date_util.load_date_str(payment_input['deposit_date'])

	amount_to_pay = 0.0
	if payment_option == 'custom_amount':
		amount_to_pay = payment_input['amount']

	elif payment_option == 'pay_minimum_due':
		for loan_dict in loan_dicts:
			if loan_dict['adjusted_maturity_date'] > date_selected:
				# You dont have to worry about paying off this loan yet.
				continue

			# Pay loans that have come due.
			amount_to_pay += payment_util.sum([
				loan_dict['outstanding_principal_balance'],
				loan_dict['outstanding_interest'],
				loan_dict['outstanding_fees']
			])

	elif payment_option == 'pay_in_full':

		for loan_dict in loan_dicts:
			amount_to_pay += payment_util.sum([
				loan_dict['outstanding_principal_balance'],
				loan_dict['outstanding_interest'],
				loan_dict['outstanding_fees']
			])
	else:
		return None, errors.Error('Unrecognized payment option')

	# TODO(dlluncor): Calculate what actually happens to the loans after you
	# have applied this payment.
	return RepaymentEffectRespDict(
		status='OK',
		loans_afterwards=[models.safe_serialize(l) for l in loan_dicts],
		amount_to_pay=amount_to_pay
	), None
