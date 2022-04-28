import decimal
from typing import Any, Optional, Tuple

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentType
from bespoke.finance.payments import repayment_util_fees


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
	session: Any,
	company_id: str,
	loan: Optional[models.Loan],
	payment_date: str,
	effective_date: str,
	to_principal: float,
	to_interest: float,
	to_late_fees: float,
	to_account_balance: float,
) -> Tuple[models.Payment, Optional[models.Transaction]]:
	transaction = None

	payment_amount = to_principal + to_interest + to_late_fees + to_account_balance
	payment = models.Payment(
		type=PaymentType.REPAYMENT,
		amount=decimal.Decimal(payment_amount),
		company_id=company_id,
		payment_date=date_util.load_date_str(payment_date),
		deposit_date=date_util.load_date_str(payment_date),
		settled_at=date_util.now(),
	)
	session.add(payment)
	session.flush()

	to_loan_amount = to_principal + to_interest + to_late_fees
	if to_loan_amount > 0.0:
		transaction = models.Transaction(
			type=PaymentType.REPAYMENT,
			amount=decimal.Decimal(to_loan_amount),
			loan_id=loan.id,
			payment_id=payment.id,
			to_principal=decimal.Decimal(to_principal),
			to_interest=decimal.Decimal(to_interest),
			to_fees=decimal.Decimal(to_late_fees),
			effective_date=date_util.load_date_str(effective_date),
		)
		session.add(transaction)

	to_account_balance_amount = to_account_balance
	if to_account_balance_amount > 0.0:
		repayment_util_fees.create_and_add_repayment_of_account_fee(
			amount=to_account_balance_amount,
			payment_id=payment.id,
			created_by_user_id=None,
			effective_date=date_util.load_date_str(effective_date),
			session=session,
		)

	return payment, transaction
