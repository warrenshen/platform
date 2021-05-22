import decimal
from typing import Any, Tuple

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentType


def make_advance(session: Any, loan: models.Loan, amount: float, payment_date: str, effective_date: str) -> models.Transaction:
	# Advance is made
	payment = models.Payment(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id,
		payment_date=date_util.load_date_str(payment_date),
		deposit_date=date_util.load_date_str(effective_date),
		settlement_date=date_util.load_date_str(effective_date),
	)
	session.add(payment)
	session.flush()
	t = models.Transaction(
		type=PaymentType.ADVANCE,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(amount),
		to_interest=decimal.Decimal(0.0),
		to_fees=decimal.Decimal(0.0),
		effective_date=date_util.load_date_str(effective_date)
	)
	session.add(t)
	session.flush()
	return t

def make_repayment(
	session: Any, loan: models.Loan,
	to_principal: float, to_interest: float, to_fees: float,
	payment_date: str, effective_date: str) -> Tuple[models.Payment, models.Transaction]:
	amount = to_principal + to_interest + to_fees
	payment = models.Payment(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		company_id=loan.company_id,
		payment_date=date_util.load_date_str(payment_date),
		deposit_date=date_util.load_date_str(payment_date),
		settled_at=date_util.now()
	)
	session.add(payment)
	session.flush()

	transaction = models.Transaction(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(amount),
		loan_id=loan.id,
		payment_id=payment.id,
		to_principal=decimal.Decimal(to_principal),
		to_interest=decimal.Decimal(to_interest),
		to_fees=decimal.Decimal(to_fees),
		effective_date=date_util.load_date_str(effective_date)
	)
	session.add(transaction)
	return payment, transaction
