import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models
from bespoke.db.db_constants import PaymentStatusEnum, PaymentType

from lib import advances, companies, loans, purchase_orders, repayments


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		transactions = session.query(models.Transaction).filter(
			models.Transaction.type == PaymentType.REPAYMENT
		).filter(
			models.Transaction.to_principal == 0
		).filter(
			models.Transaction.to_interest == 0
		).filter(
			models.Transaction.to_fees == 0
		).all()

		print(f'Found {len(transactions)} transactions equivalent to zero...')

		loan_ids = list(set([transaction.loan_id for transaction in transactions]))

		for transaction in transactions:
			session.delete(transaction)

		session.flush()

		print(f'Deleted {len(transactions)} transactions equivalent to zero...')

		loans = session.query(models.Loan).filter(
			models.Loan.id.in_(loan_ids)
		).all()

		partially_paid_loans = list(filter(lambda loan: loan.payment_status == PaymentStatusEnum.PARTIALLY_PAID, loans))

		print(f'Found {len(partially_paid_loans)} loans of deleted transactions with partially paid status...')

		updated_loans_count = 0

		for loan in partially_paid_loans:
			loan_transactions = session.query(models.Transaction).filter(
				models.Transaction.type == PaymentType.REPAYMENT
			).filter(
				models.Transaction.loan_id == loan.id
			).all()

			if len(loan_transactions) <= 0:
				loan.payment_status = None
				updated_loans_count += 1

		print(f'Updated payment status of {updated_loans_count} loans of deleted transactions...')

if __name__ == "__main__":
	main()
