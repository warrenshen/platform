import decimal

from typing import Any

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentType

def make_advance(session: Any, loan: models.Loan, amount: float, payment_date: str, effective_date: str) -> None:
	# Advance is made
	payment = models.Payment(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id,
		payment_date=date_util.load_date_str(payment_date)
	)
	session.add(payment)
	session.flush()
	session.add(models.Transaction(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(amount),
		to_interest=decimal.Decimal(0.0),
		to_fees=decimal.Decimal(0.0),
		effective_date=date_util.load_date_str(effective_date)
	))

def make_repayment(
	session: Any, loan: models.Loan, 
	to_principal: float, to_interest: float, to_fees: float, 
	payment_date: str, effective_date: str) -> None:
	# Advance is made
	amount = to_principal + to_interest + to_fees
	payment = models.Payment(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id,
		payment_date=date_util.load_date_str(payment_date)
	)
	session.add(payment)
	session.flush()
	session.add(models.Transaction(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(to_principal),
		to_interest=decimal.Decimal(to_interest),
		to_fees=decimal.Decimal(to_fees),
		effective_date=date_util.load_date_str(effective_date)
	))
