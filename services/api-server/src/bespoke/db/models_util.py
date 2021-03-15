"""
	A file that contains some helpers needed to construct certain types or perform some
	common operations on models.py
"""

from sqlalchemy.orm.session import Session
from typing import List, Tuple

from bespoke.db import models
from bespoke import errors

def set_needs_balance_recomputed(company_id: str, session: Session) -> Tuple[bool, errors.Error]:

	company = session.query(models.Company).filter(models.Company.id == company_id).first()
	if not company:
		return None, errors.Error(
			"Failed to find company associated with the company_id {}".format(company_id))

	company.needs_balance_recomputed = True

	return True, None

def get_augmented_transactions(transactions: List[models.TransactionDict], payments: List[models.PaymentDict]) -> Tuple[List[models.AugmentedTransactionDict], errors.Error]:
		id_to_payment = {}
		for payment in payments:
			id_to_payment[payment['id']] = payment

		augmented_transactions = []
		for t in transactions:
			if t['payment_id'] not in id_to_payment:
				return None, errors.Error(
					'[DATA ERROR]: Transaction {} is missing an associated payment'.format(t['id']))
			
			augmented_transactions.append(models.AugmentedTransactionDict(
				transaction=t,
				payment=id_to_payment[t['payment_id']]
			))

		return augmented_transactions, None
