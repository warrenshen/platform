"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script adjusts all loans of a given company to have zero balances.

Why:
You can run this script to completely zero out balances of a company.
"""

import argparse
import sys
import os
import logging
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance.payments import payment_util

def main(
	is_test_run: bool,
	company_identifier: str,
) -> None:
	logging.basicConfig(level=logging.INFO)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		company = session.query(models.Company).filter(
			models.Company.identifier == company_identifier
		).first()

		if not company:
			print('ERROR! No company exists for given company identifier')

		loans = session.query(models.Loan).filter(
			models.Loan.company_id == company.id
		).filter(
			models.Loan.origination_date != None
		).all()

		for loan in loans:
			if abs(loan.outstanding_principal_balance) < 0.02 and abs(loan.outstanding_interest) < 0.02 and abs(loan.outstanding_fees) < 0.02:
				continue

			effective_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
			adjustment_amount_dict = {
				'to_principal': -round(loan.outstanding_principal_balance, 2),
				'to_interest': -round(loan.outstanding_interest, 2),
				'to_fees': -round(loan.outstanding_fees, 2),
			}
			loan_balances_dict = {
				'outstanding_principal_balance': round(loan.outstanding_principal_balance, 2),
				'outstanding_interest': round(loan.outstanding_interest, 2),
				'outstanding_fees': round(loan.outstanding_fees, 2),
			}
			print(f'Adjusting loan {loan.id} with balances {loan_balances_dict}')
			print(f'Effective date {effective_date} and adjustment of {adjustment_amount_dict}')
			print('')
			if not is_test_run:
				transaction, err = payment_util.create_and_add_adjustment(
					company_id=str(company.id),
					loan_id=str(loan.id),
					tx_amount_dict=adjustment_amount_dict,
					created_by_user_id=None,
					deposit_date=effective_date,
					effective_date=effective_date,
					session=session,
				)

	logging.info(f"[SUCCESS] Success")

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to perform action on')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(
		is_test_run=is_test_run,
		company_identifier=args.company_identifier,
	)
