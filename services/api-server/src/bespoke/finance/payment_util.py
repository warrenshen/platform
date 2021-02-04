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
	session: Session) -> None:

	# TODO(dlluncor): Lots of validations needed before being able to submit a payment

	payment = models.Payment()
	payment.amount = payment_input['amount']
	payment.type = payment_input['type']
	payment.company_id = company_id
	payment.method = payment_input['payment_method']
	payment.submitted_at = datetime.datetime.now()

	session.add(payment)

EffectRespDict = TypedDict('EffectRespDict', {
	'status': str
})

def is_advance(p: models.PaymentDict) -> bool:
	return p['type'] in db_constants.ADVANCE_TYPES

# Loans represent balances
# Fees represent account level fees (not tied to a loan)

# Payments represent someone submitting a dollar amount to their account 
# Transactions represent how that payment is applied to their balances and fees

def calculate_effect(
	payment_input: PaymentInputDict, 
	financial_info: per_customer_types.CustomerFinancials) -> Tuple[EffectRespDict, errors.Error]:
	# What loans and fees does would this payment pay off?
	return None, errors.Error('Not implemented')

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

		for loan in loans:
			loan_dicts.append(loan.as_dict())

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
			t = models.Transaction()
			t.type= 'advance'
			t.to_principal= loan_dict['amount']
			t.to_interest = 0.0
			t.to_fees = 0.0
			t.loan_id = loan_dict['id']
			t.payment_id = payment_dict['id']
			t.created_by_user_id = bank_admin_user_id
			session.add(t)

		for loan in loans:
			loan.funded_at = date_util.now()
			loan.funded_by_user_id = bank_admin_user_id

	return None, errors.Error('Not implemented')





