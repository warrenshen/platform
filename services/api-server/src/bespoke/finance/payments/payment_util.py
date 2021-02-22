"""
  This file provides helper code related to handling payments.
  Essentially common code between repayment_util.py and advance_util.py
"""
import datetime
import decimal
from typing import Callable, List, Tuple, Union, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

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
	'payment_date': str,
	'settlement_date': str
})

def create_payment(
	company_id: str,
	payment_input: PaymentInputDict,
	user_id: str) -> models.Payment:
	payment = models.Payment()
	payment.amount = decimal.Decimal(payment_input['amount'])
	payment.type = payment_input['type']
	payment.company_id = company_id
	payment.method = payment_input['payment_method']
	payment.submitted_at = datetime.datetime.now()
	payment.submitted_by_user_id = user_id
	return payment

def make_payment_applied(
	payment: models.Payment, settled_by_user_id: str,
	payment_date: datetime.date, settlement_date: datetime.date) -> None:
	"""
		Call this method when you are ready to apply a payment

		payment_date:    When the payment was deposited to the bank
		settlement_date: When the funds are available to withdraw, and when fees / interest
		                 start to accrue
	"""
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = settled_by_user_id
	payment.payment_date = payment_date
	payment.settlement_date = settlement_date

def is_advance(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.ADVANCE_TYPES

def is_repayment(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.REPAYMENT_TYPES

# Loans represent balances
# Fees represent account level fees (not tied to a loan)

# Payments represent someone submitting a dollar amount to their account
# Transactions represent how that payment is applied to their balances and fees

def sum(vals: List[float]) -> float:
	# NOTE: These are actually decimal.Decimal coming back from the DB
	sum_val = 0.0
	for val in vals:
		if not val:
			continue

		sum_val += float(val)

	return sum_val





