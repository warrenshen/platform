"""
  This file handles calculations related to handling payments
"""
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

PaymentInputDict = TypedDict('PaymentInputDict', {
	'type': str,
	'amount': float,
	'payment_method': str
})

PaymentInsertInputDict = TypedDict('PaymentInsertInputDict', {
	'company_id': str,
	'type': str,
	'amount': float,
	'method': str,
	'deposit_date': str
})

def add_payment(
	company_id: str,
	payment_input: PaymentInputDict,
	session: Session) -> models.PaymentDict:

	# TODO(dlluncor): Lots of validations needed before being able to submit a payment

	payment = models.Payment()
	payment.amount = payment_input['amount']
	payment.type = payment_input['type']
	payment.company_id = company_id
	payment.method = payment_input['payment_method']
	payment.submitted_at = datetime.datetime.now()

	session.add(payment)
	session.flush()
	return payment.as_dict()

RepaymentEffectRespDict = TypedDict('RepaymentEffectRespDict', {
	'status': str,
	'loans_due': List[models.LoanDict],
	'total_due': float,
	'amount_leftover': float
})

def is_advance(p: models.PaymentDict) -> bool:
	return p['type'] in db_constants.ADVANCE_TYPES

# Loans represent balances
# Fees represent account level fees (not tied to a loan)

# Payments represent someone submitting a dollar amount to their account 
# Transactions represent how that payment is applied to their balances and fees

def _sum(vals: List[float]) -> float:
	# NOTE: These are actually decimal.Decimal coming back from the DB
	sum_val = 0.0
	for val in vals:
		if not val:
			continue

		sum_val += float(val)

	return sum_val

def calculate_repayment_effect(
	payment_input: PaymentInsertInputDict,
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
		total_due += _sum([
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

FundLoansRespDict = TypedDict('FundLoansRespDict', {
	'status': str
})

def fund_loans_with_advance(
	bank_admin_user_id: str,
	company_id: str, loan_ids: List[str], payment_id: str,
	session_maker: Callable) -> Tuple[FundLoansRespDict, errors.Error]:

	err_details = {'company_id': company_id, 'payment_id': payment_id, 'method': 'fund_loans_with_advance'}
	loan_dicts = []
	payment_dict: models.PaymentDict = None

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

		already_funded_loan_ids: List[str] = []
		for loan in loans:
			if loan.funded_at:
				already_funded_loan_ids.append(str(loan.id))
			loan_dicts.append(loan.as_dict())

		if already_funded_loan_ids:
			return None, errors.Error('These loans have already been funded. Please remove them from the advances process: {}'.format(
				already_funded_loan_ids), details=err_details)

		if len(loans) != len(loan_ids):
			return None, errors.Error('Not all loans were found to fund in database', details=err_details)

		payment = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.id == payment_id
			).first())
		if not payment:
			return None, errors.Error('Advance was not found in the database', details=err_details)

		if not is_advance(payment.as_dict()):
			return None, errors.Error('Payment id provided is not an advance, therefore it cannot be used for funding', details=err_details)

		if payment.applied_at:
			return None, errors.Error('Payment id has already been applied to loans, therefore it cannot be used again', details=err_details)

		payment_dict = payment.as_dict()

		loans_sum = 0.0
		for loan_dict in loan_dicts:
			loans_sum += float(loan_dict['amount'])

		if not number_util.float_eq(loans_sum, payment_dict['amount']):
			# NOTE: Only support exact amounts for now, where this advance covers exactly all
			# the amounts of the loans listed.
			return None, errors.Error('Advance amount must the sum of loans to fund exactly. Advance amount: {}, sum of loans: {}'.format(
				number_util.to_dollar_format(payment_dict['amount']),
				number_util.to_dollar_format(loans_sum)), details=err_details)

		payment.applied_at = date_util.now()

		for loan_dict in loan_dicts:
			amount = loan_dict['amount']
			t = models.Transaction()
			t.type = 'advance'
			t.amount = amount
			t.to_principal = amount
			t.to_interest = 0.0
			t.to_fees = 0.0
			t.loan_id = loan_dict['id']
			t.payment_id = payment_dict['id']
			t.created_by_user_id = bank_admin_user_id
			session.add(t)

		for loan in loans:
			loan.funded_at = date_util.now()
			loan.funded_by_user_id = bank_admin_user_id
			loan.outstanding_principal_balance = loan.amount
			loan.outstanding_interest = 0.0
			loan.outstanding_fees = 0.0

	return FundLoansRespDict(status='OK'), None





