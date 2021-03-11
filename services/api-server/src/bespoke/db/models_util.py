"""
	A file that contains some helpers needed to construct certain types in models.py
"""

from typing import List, Tuple

from bespoke.db import models
from bespoke import errors

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
