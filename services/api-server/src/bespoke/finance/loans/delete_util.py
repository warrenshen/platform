from typing import Callable, List, Tuple, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict


DeleteLoanReqDict = TypedDict('DeleteLoanReqDict', {
	'loan_id': str
})


@errors.return_error_tuple
def delete_loan(
	req: DeleteLoanReqDict,
	user_id: str,
	session_maker: Callable
) -> Tuple[bool, errors.Error]:

	loan_id = req['loan_id']

	with session_scope(session_maker) as session:
		# Check if there are non-deleted transactions
		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.loan_id == loan_id
			).all())

		if not transactions:
			transactions = []

		non_deleted_transaction_ids = []

		payment_ids = []
		for tx in transactions:
			if not tx.is_deleted:
				non_deleted_transaction_ids.append(str(tx.id))

			payment_ids.append(str(tx.payment_id))

		if non_deleted_transaction_ids:
			raise errors.Error('Cannot delete loan because these transactions associated with this loan must be deleted first. Transaction IDs: {}'.format(
				non_deleted_transaction_ids))

		# Check if there are non-deleted payments
		payments = cast(
			List[models.Payment],
			session.query(models.Payment).filter(
				models.Payment.id.in_(payment_ids)
			).all())

		if not payments:
			payments = []

		non_deleted_payment_ids = []

		for payment in payments:
			if not payment.is_deleted:
				non_deleted_payment_ids.append(str(payment.id))

		if non_deleted_payment_ids:
			raise errors.Error('Cannot delete loan because these payments associated with this loan must be deleted first. Payment IDs: {}'.format(
				non_deleted_payment_ids))

		loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.id == loan_id
			).first())
		if not loan:
			raise errors.Error('Cannot find loan to delete')

		# Now the loan is actually deleted.
		loan.is_deleted = True

	return True, None
