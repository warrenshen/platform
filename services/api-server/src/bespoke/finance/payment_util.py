"""
  This file handles calculations related to handling payments
"""
import datetime

from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

from bespoke.db import models

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
