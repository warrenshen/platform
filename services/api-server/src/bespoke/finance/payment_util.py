"""
  This file handles calculations related to handling payments
"""
import datetime

from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Tuple

from bespoke import errors
from bespoke.db import models
from bespoke.finance.types import per_customer_types

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

})

# Loans represent balances
# Fees represent account level fees (not tied to a loan)

# Payments represent someone submitting a dollar amount to their account 
# Transactions represent how that payment is applied to their balances and fees

def calculate_effect(
	payment_input: PaymentInputDict, 
	financial_info: per_customer_types.CustomerFinancials) -> Tuple[EffectRespDict, errors.Error]:
	# What loans and fees does this pay off?
	return None, errors.Error('Not implemeneted')







