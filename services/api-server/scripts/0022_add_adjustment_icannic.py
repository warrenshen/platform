import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PaymentStatusEnum, PaymentType
from bespoke.finance.payments import payment_util

from lib import advances, companies, loans, purchase_orders, repayments


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		print(f'Running...')

		customer = session.query(models.Company).filter(
			models.Company.identifier == 'IC'
		).first()

		if customer is None:
			print(f'Could not find customer with identifier IC')
			print(f'EXITING EARLY')
			return

		loan = session.query(models.Loan).filter(
			models.Loan.company_id == customer.id
		).filter(
			models.Loan.closed_at == None
		).order_by(
			models.Loan.origination_date.asc()
		).first()

		if loan is None:
			print(f'Could not find an open loan to create adjustment on')
			print(f'EXITING EARLY')
			return

		effective_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		payment_util.create_and_add_adjustment(
			company_id=str(customer.id),
			loan_id=str(loan.id),
			tx_amount_dict=payment_util.TransactionAmountDict(
				to_principal=0.0,
				to_interest=-0.68, # THIS IS THE MAIN EFFECT OF THIS SCRIPT.
				to_fees=0.0,
			),
			created_by_user_id=None,
			deposit_date=effective_date,
			effective_date=effective_date,
			session=session,
		)

		print(f'Created adjustment for customer IC on loan {str(loan.identifier)}')

if __name__ == "__main__":
	main()
