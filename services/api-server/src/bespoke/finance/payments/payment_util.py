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
	'requested_to_principal': float,
	'requested_to_interest': float,
	'to_principal': float,
	'to_interest': float,
	'to_user_credit': float,
}, total=False)

PaymentInputDict = TypedDict('PaymentInputDict', {
	'type': str,
	'payment_method': str,
	'amount': float,
})

TransactionAmountDict = TypedDict('TransactionAmountDict', {
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

RepaymentPaymentInputDict = TypedDict('RepaymentPaymentInputDict', {
	'payment_method': str,
	'requested_amount': float,
	'requested_payment_date': datetime.date,
	'payment_date': datetime.date,
	'items_covered': PaymentItemsCoveredDict,
	'company_bank_account_id': str,
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
	'company_bank_account_id': str,
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
	payment.company_bank_account_id = payment_input['company_bank_account_id']
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

def is_adjustment(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.ADJUSTMENT_TYPES

def should_close_loan(
	new_outstanding_principal: float, new_outstanding_interest: float, 
	new_outstanding_fees: float) -> bool:
	return new_outstanding_principal <= 0.0 \
				and new_outstanding_interest <= 0.0 \
				and new_outstanding_fees <= 0.0

def close_loan(cur_loan: models.Loan) -> None:
	cur_loan.closed_at = date_util.now()
	cur_loan.payment_status = db_constants.PaymentStatusEnum.CLOSED

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

@errors.return_error_tuple
def create_and_add_adjustment(
	company_id: str,
	loan_id: str,
	tx_amount_dict: TransactionAmountDict,
	created_by_user_id: str,
	deposit_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> Tuple[models.Transaction, errors.Error]:

	tx_input = tx_amount_dict
	amount = tx_input['to_principal'] + tx_input['to_interest'] + tx_input['to_fees']
	payment = create_payment(
		company_id=company_id,
		payment_input=PaymentInputDict(
			type=db_constants.PaymentType.ADJUSTMENT,
			payment_method='', # Not needed since its an adjustment
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.deposit_date = deposit_date
	payment.settlement_date = effective_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = created_by_user_id
	payment.items_covered = {'loan_ids': [loan_id]}
	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	t = models.Transaction()
	t.type = db_constants.PaymentType.ADJUSTMENT
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(tx_input['to_principal'])
	t.to_interest = decimal.Decimal(tx_input['to_interest'])
	t.to_fees = decimal.Decimal(tx_input['to_fees'])
	t.loan_id = loan_id
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return t, None

def create_and_add_credit_to_user(
	company_id: str,
	amount: float,
	originating_payment_id: str,
	created_by_user_id: str,
	payment_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> models.Transaction:

	payment = create_payment(
		company_id=company_id,
		payment_input=PaymentInputDict(
			type=db_constants.PaymentType.CREDIT_TO_USER,
			payment_method='', # Not needed since its a fee, you can look up the originating payment_id
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.originating_payment_id = originating_payment_id
	payment.payment_date = payment_date
	payment.settlement_date = effective_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = created_by_user_id
	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	t = models.Transaction()
	t.type = db_constants.PaymentType.CREDIT_TO_USER
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	# NOTE: no loan_id is set for credits
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return t

def create_and_add_account_level_fee(
	company_id: str,
	subtype: str,
	amount: float,
	originating_payment_id: str,
	created_by_user_id: str,
	payment_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> models.Transaction:

	payment = create_payment(
		company_id=company_id,
		payment_input=PaymentInputDict(
			type=db_constants.PaymentType.FEE,
			payment_method='', # Not needed since its a fee, you can look up the originating payment_id
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.originating_payment_id = originating_payment_id
	payment.payment_date = payment_date
	payment.settlement_date = effective_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = created_by_user_id

	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	t = models.Transaction()
	t.type = db_constants.PaymentType.FEE
	t.subtype = subtype
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	# NOTE: no loan_id is set for credits
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return t






