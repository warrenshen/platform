"""
  This file provides helper code related to handling payments.
  Essentially common code between repayment_util.py and advance_util.py
"""
import datetime
import decimal
import pytz
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models, model_types, models_util
from bespoke.finance import financial_summary_util
from bespoke.finance.types import payment_types, finance_types
from sqlalchemy.orm.session import Session


class RepaymentOption(object):
	CUSTOM_AMOUNT_FOR_SETTLING_LOC = 'custom_amount_for_settling_loc'
	CUSTOM_AMOUNT_FOR_SETTLING_NON_LOC_LOAN = 'custom_amount_for_settling_non_loc_loan'

	CUSTOM_AMOUNT = 'custom_amount'
	PAY_MINIMUM_DUE = 'pay_minimum_due'
	PAY_IN_FULL = 'pay_in_full'

def create_payment(
	company_id: str,
	payment_input: payment_types.PaymentInputDict,
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
	payment_type: str,
	payment_input: payment_types.RepaymentPaymentInputDict,
	created_by_user_id: str
	) -> models.Payment:

	payment = models.Payment()
	payment.company_id = company_id
	payment.type = payment_type
	payment.method = payment_input['payment_method']
	payment.requested_amount = decimal.Decimal(payment_input['requested_amount'])
	payment.requested_payment_date = payment_input['requested_payment_date']
	payment.payment_date = payment_input['payment_date']
	payment.items_covered = cast(model_types.PaymentItemsCoveredDict, payment_input['items_covered'])
	payment.company_bank_account_id = payment_input['company_bank_account_id']
	payment.submitted_at = datetime.datetime.now()
	payment.submitted_by_user_id = created_by_user_id
	payment.requested_by_user_id = created_by_user_id
	payment.customer_note = payment_input.get('customer_note', '')

	return payment

def make_advance_payment_settled(
	payment: models.Payment,
	settlement_identifier: str,
	amount: decimal.Decimal,
	payment_date: datetime.date,
	settlement_date: datetime.date,
	settled_by_user_id: str,
	sender_bank_account_id: str,
	recipient_bank_account_id: str,
	bank_note: str,
) -> None:
	"""
	Call this method when you are ready to settle an advance payment

	payment_date:
	When the payment was withdrawn from a Bespoke bank

	settlement_date:
	When the payment arrived to a Customer bank and when interest starts to accrue
	"""
	payment.settlement_identifier = settlement_identifier
	payment.amount = amount
	payment.payment_date = payment_date
	# For advances, deposit date is always equal to the settlement date.
	payment.deposit_date = settlement_date
	payment.settlement_date = settlement_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = settled_by_user_id
	payment.company_bank_account_id = sender_bank_account_id
	payment.recipient_bank_account_id = recipient_bank_account_id
	payment.bank_note = bank_note

def get_and_increment_repayment_identifier(company_id: str, session: Session) -> str:
	company = cast(
		models.Company,
		session.query(models.Company).get(company_id))

	# Generate a repayment identifier for this payment for this company.
	company.latest_repayment_identifier += 1
	repayment_identifier = str(company.latest_repayment_identifier)
	return repayment_identifier

def make_repayment_payment_settled(
	payment: models.Payment,
	settlement_identifier: str,
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
	payment.settlement_identifier = settlement_identifier
	payment.amount = amount
	payment.deposit_date = deposit_date
	payment.settlement_date = settlement_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = settled_by_user_id

def is_advance(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.ADVANCE_TYPES

def is_repayment(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.REPAYMENT_TYPES

def is_adjustment(p: Union[models.PaymentDict, models.TransactionDict]) -> bool:
	return p['type'] in db_constants.ADJUSTMENT_TYPES

def is_loan_balance_zero(
	new_outstanding_principal: float, 
	new_outstanding_interest: float,
	new_outstanding_fees: float
	) -> bool:
	return new_outstanding_principal <= 0.0 \
				and new_outstanding_interest <= 0.0 \
				and new_outstanding_fees <= 0.0

def should_close_loan(
	new_outstanding_principal: float, 
	new_outstanding_interest: float,
	new_outstanding_fees: float,
	day_last_repayment_settles: datetime.date,
	today: datetime.date) -> bool:

	repayment_happened_before_report_date = True
	if day_last_repayment_settles:
		repayment_happened_before_report_date = day_last_repayment_settles <= today

	return is_loan_balance_zero(
		new_outstanding_principal, new_outstanding_interest, new_outstanding_fees
		) and repayment_happened_before_report_date

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

# Create transaction only.
def create_and_add_credit_to_user_transaction(
	amount: float,
	payment_id: str,
	created_by_user_id: str,
	effective_date: datetime.date,
	session: Session,
) -> models.Transaction:
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

@errors.return_error_tuple
def create_and_add_adjustment(
	company_id: str,
	loan_id: str,
	tx_amount_dict: payment_types.TransactionAmountDict,
	created_by_user_id: str,
	deposit_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> Tuple[models.Transaction, errors.Error]:

	tx_input = tx_amount_dict
	amount = tx_input['to_principal'] + tx_input['to_interest'] + tx_input['to_fees']
	payment = create_payment(
		company_id=company_id,
		payment_input=payment_types.PaymentInputDict(
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

@errors.return_error_tuple
def create_and_add_credit_payout_to_customer(
	company_id: str,
	payment_method: str,
	amount: float,
	created_by_user_id: str,
	deposit_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> Tuple[str, errors.Error]:

	financial_summary = financial_summary_util.get_latest_financial_summary(
		company_id=company_id, session=session
	)
	if not financial_summary:
		raise errors.Error('No financial summary found for the customer')

	account_balance_dict = cast(finance_types.AccountBalanceDict, financial_summary.account_level_balance_payload)

	if amount > account_balance_dict['credits_total']:
		overpayment_amount = amount - account_balance_dict['credits_total']
		raise errors.Error('Cannot disburse ${} worth of fees because the total credits available to the customer is ${}. Please reduce the amount disbursed by ${}'.format(
			amount, account_balance_dict['credits_total'], overpayment_amount))

	payment = create_payment(
		company_id=company_id,
		payment_input=payment_types.PaymentInputDict(
			type=db_constants.PaymentType.PAYOUT_USER_CREDIT_TO_CUSTOMER,
			payment_method=payment_method,
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.deposit_date = deposit_date
	payment.settlement_date = effective_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = created_by_user_id
	payment.items_covered = model_types.PayoutItemsCoveredDict()
	session.add(payment)
	session.flush()
	payment_id = str(payment.id)

	t = models.Transaction()
	t.type = db_constants.PaymentType.PAYOUT_USER_CREDIT_TO_CUSTOMER
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return payment_id, None

def create_and_add_credit_to_user(
	company_id: str,
	amount: float,
	created_by_user_id: str,
	deposit_date: datetime.date,
	effective_date: datetime.date,
	session: Session) -> Tuple[str, errors.Error]:

	payment = create_payment(
		company_id=company_id,
		payment_input=payment_types.PaymentInputDict(
			type=db_constants.PaymentType.CREDIT_TO_USER,
			payment_method='', # Not needed since its a credit to user
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.deposit_date = deposit_date
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
	# NOTE: no loan_id is set for credit to user
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return payment_id, None

def create_and_add_account_level_fee(
	company_id: str,
	subtype: str,
	amount: float,
	originating_payment_id: str,
	created_by_user_id: str,
	deposit_date: datetime.date,
	effective_date: datetime.date,
	items_covered: model_types.ItemsCoveredDict,
	session: Session) -> str:

	payment = create_payment(
		company_id=company_id,
		payment_input=payment_types.PaymentInputDict(
			type=db_constants.PaymentType.FEE,
			payment_method='', # Not needed since its a fee, you can look up the originating payment_id
			amount=amount
		),
		user_id=created_by_user_id
	)
	payment.originating_payment_id = originating_payment_id
	payment.deposit_date = deposit_date
	payment.settlement_date = effective_date
	payment.settled_at = date_util.now()
	payment.settled_by_user_id = created_by_user_id
	payment.items_covered = items_covered

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
	# NOTE: no loan_id is set for fees
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date

	session.add(t)
	return payment_id

def _reset_payment_status_on_loans(loan_ids: List[str], session: Session) -> None:
	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.id.in_(loan_ids)
		).all())

	for loan in loans:
		loan.payment_status = models_util.compute_loan_payment_status(loan, session)

@errors.return_error_tuple
def unsettle_payment(payment_type: str, payment_id: str, is_undo: bool, session: Session) -> Tuple[bool, errors.Error]:
	# Mark payment as not settled
	# Find any additional payments created from it, and mark them as is_deleted
	# Mark transactions as is_deleted
	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())

	if not payment:
		raise errors.Error(f'No {payment_type} found to undo')

	if not payment.settled_at:
		raise errors.Error(f'Cannot undo a {payment_type} which is not settled')

	originated_payments = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.originating_payment_id == payment_id
		).all())
	if not originated_payments:
		originated_payments = []

	loan_ids_set = set([])

	def _unsettle_payment(cur_payment: models.Payment) -> None:
		cur_payment.settled_at = None
		cur_payment.settled_by_user_id = None
		cur_payment.settlement_date = None

		if is_undo:
			# Only in the undo case does the deposit_date get cleared
			cur_payment.deposit_date = None

		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.payment_id == cur_payment.id
			).all())

		if not transactions:
			raise errors.Error(f'No transactions are associated with {payment_type} {cur_payment.id}, therefore we assume it is not settled')

		for tx in transactions:
			tx.is_deleted = True
			if tx.loan_id:
				loan_ids_set.add(str(tx.loan_id))

	_unsettle_payment(payment)
	for cur_payment in originated_payments:
		_unsettle_payment(cur_payment)

	loan_ids = list(loan_ids_set)

	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.id.in_(loan_ids)
		).all())

	# For any closed loan related to one of the unsettled payments,
	# by definition the loan is no longer closed.
	for loan in loans:
		if loan.closed_at:
			loan.closed_at = None

	session.flush()
	_reset_payment_status_on_loans(loan_ids, session)

	return True, None

@errors.return_error_tuple
def reverse_payment(payment_type: str, payment_id: str, session: Session) -> Tuple[bool, errors.Error]:
	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())

	if not payment:
		raise errors.Error(f'No payment found to reverse')

	payment.reversed_at = date_util.now()

	success, err = unsettle_payment(payment_type, payment_id, is_undo=False, session=session)
	if err:
		raise err

	return True, None

@errors.return_error_tuple
def delete_payment(
	payment_types: List[str],
	payment_id: str,
	session: Session,
) -> Tuple[bool, errors.Error]:
	# Mark payment as not settled
	# Find any additional payments created from it, and mark them as is_deleted
	# Mark transactions as is_deleted
	payment = cast(
		models.Payment,
		session.query(models.Payment).filter(
			models.Payment.id == payment_id
		).first())

	if payment.type == db_constants.PaymentType.FEE:
		# If we have a fee, we can immediately unsettle it while also deleting it.
		success, err = unsettle_payment(payment.type, payment_id, is_undo=False, session=session)
		if err:
			raise err

	if not payment:
		raise errors.Error(f'No payment found to delete')

	if payment.settled_at:
		raise errors.Error(f'Cannot delete a payment of type {payment.type} which is still settled. You must undo it first')

	if payment.reversed_at:
		raise errors.Error('Cannot delete a payment which is already reversed')

	if payment.type not in payment_types:
		raise errors.Error(f'Cannot delete this payment which of type "{payment.type}" when you indicated you want to delete a payment of type "{payment_types}"')

	originated_payments = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			models.Payment.originating_payment_id == payment_id
		).all())
	if not originated_payments:
		originated_payments = []

	loan_ids_set = set([])

	def _delete_payment(cur_payment: models.Payment) -> None:
		cur_payment.is_deleted = True

		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.payment_id == cur_payment.id
			).all())

		# Note: repayment may or may not have transactions.
		# No transactions: customer creates repayment and then requests it to be deleted.
		# Yes transactions: customer creates repayment, it is settled by bank, and then bank wants to delete it.
		for tx in transactions:
			tx.is_deleted = True
			if tx.loan_id:
				loan_ids_set.add(str(tx.loan_id))

	_delete_payment(payment)
	for cur_payment in originated_payments:
		_delete_payment(cur_payment)

	loan_ids = list(loan_ids_set)
	_reset_payment_status_on_loans(loan_ids, session)

	return True, None
