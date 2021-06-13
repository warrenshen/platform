"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/

What:
This script resets the status columns of all loans.

Why:
You can run this script to fix incorrect values in the status columns of loans in the database.
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models, models_util

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).all())

		loans_count = len(loans)

		for index, loan in enumerate(loans):
			print(f'[{index + 1} of {loans_count}]')

			new_approval_status = models_util.compute_loan_approval_status(loan)
			new_payment_status = models_util.compute_loan_payment_status(loan, session)

			if loan.status == new_approval_status and loan.payment_status == new_payment_status:
				print(f'[{index + 1} of {loans_count}] Loan status column values are correct, skipping')
				continue

			print(f'[{index + 1} of {loans_count}] Found incorrect status column value(s), updating loan statuses (new values: {new_approval_status}, {new_payment_status})...')
			loan.status = new_approval_status
			loan.payment_status = new_payment_status

if __name__ == "__main__":
	main()
