"""
  This file provides helper code related to handling payments.
  Essentially common code between repayment_util.py and advance_util.py
"""
import datetime
import decimal
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import number_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

PaymentItemsCoveredDict = TypedDict('PaymentItemsCoveredDict', {
	'loan_ids': List[str],
	'invoice_ids': List[str],
	'to_principal': float,
	'to_interest': float,
}, total=False)

PaymentInputDict = TypedDict('PaymentInputDict', {
	'type': str,
	'payment_method': str,
	'amount': float,
})

RepaymentPaymentInputDict = TypedDict('RepaymentPaymentInputDict', {
	'payment_method': str,
	'requested_amount': float,
	'requested_payment_date': datetime.date,
	'payment_date': datetime.date,
	'items_covered': PaymentItemsCoveredDict,
})

PaymentInsertInputDict = TypedDict('PaymentInsertInputDict', {
	'company_id': str,
	'type': str,
	'requested_amount': float,
	'amount': float,
	'method': str,
	'requested_payment_date': str,
	'payment_date': str,
	'settlement_date': str,
	'items_covered': PaymentItemsCoveredDict,
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

def create_repayment_payment(
	company_id: str,
	payment_input: RepaymentPaymentInputDict,
	user_id: str) -> models.Payment:

	payment = models.Payment()
	payment.company_id = company_id
	payment.type = db_constants.PaymentType.REPAYMENT
	payment.method = payment_input['payment_method']
	payment.requested_amount = decimal.Decimal(payment_input['requested_amount'])
	payment.requested_payment_date = payment_input['requested_payment_date']
	payment.payment_date = payment_input['payment_date']
	payment.items_covered = cast(Dict[str, Any], payment_input['items_covered'])
	payment.submitted_at = datetime.datetime.now()
	payment.submitted_by_user_id = user_id
	return payment

def make_advance_payment_settled(
	payment: models.Payment,
	amount: decimal.Decimal,
	payment_date: datetime.date,
	settlement_date: datetime.date,
	settled_by_user_id: str,
) -> None:
	"""
	Call this method when you are ready to settle an advance payment

	payment_date:
	When the payment was withdrawn from a Bespoke bank

	settlement_date:
	When the payment arrived to a Customer bank and when interest starts to accrue
	"""
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = settled_by_user_id
	payment.amount = amount
	payment.payment_date = payment_date
	# For advances, deposit date is always equal to the settlement date.
	payment.deposit_date = settlement_date
	payment.settlement_date = settlement_date

def make_repayment_payment_settled(
	payment: models.Payment,
	amount: decimal.Decimal,
	deposit_date: datetime.date,
	settlement_date: datetime.date,
	settled_by_user_id: str,
) -> None:
	"""
		Call this method when you are ready to settle a repayment payment

		deposit_date:
		When the payment was deposited to a Bespoke bank and is applied to principal balance

		settlement_date:
		When the payment arrived to a Bespoke bank and is applied to interest balance
	"""
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = settled_by_user_id
	payment.amount = amount
	payment.deposit_date = deposit_date
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





