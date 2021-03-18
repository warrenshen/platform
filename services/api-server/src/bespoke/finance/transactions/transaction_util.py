import datetime
import decimal

from bespoke.db import db_constants, models

def create_credit_to_user(
	amount: float, payment_id: str,
	created_by_user_id: str, effective_date: datetime.date) -> models.Transaction: 
	t = models.Transaction()
	t.type = db_constants.TransactionType.CREDIT_TO_USER
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	# NOTE: no loan_id is set for credits
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date
	return t

def create_account_level_fee(
	subtype: str, amount: float, payment_id: str, 
	created_by_user_id: str, effective_date: datetime.date) -> models.Transaction:
	t = models.Transaction()
	t.type = db_constants.TransactionType.FEE
	t.subtype = subtype
	t.amount = decimal.Decimal(amount)
	t.to_principal = decimal.Decimal(0.0)
	t.to_interest = decimal.Decimal(0.0)
	t.to_fees = decimal.Decimal(0.0)
	# NOTE: no loan_id is set for credits
	t.payment_id = payment_id
	t.created_by_user_id = created_by_user_id
	t.effective_date = effective_date
	return t