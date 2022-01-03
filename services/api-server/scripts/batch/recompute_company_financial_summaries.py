"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script resets the status columns of all loans.

Why:
You can run this script to fix incorrect values in the status columns of loans in the database.
"""

import argparse
import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance.loans import reports_util

from lib import loans

def main(company_identifier: str, anchor_date: str, update_days_back: int) -> None:
	engine = models.create_engine(statement_timeout=30000) # 30 seconds timeout
	session_maker = models.new_sessionmaker(engine)

	company_id: str = None
	company_name: str = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		if not company:
			print('ERROR! No company exists for given company identifier')
			return
		else:
			company_id = str(company.id)
			company_name = company.name

	compute_requests = [{
		'company': {
			'id': company_id,
			'identifier': company_identifier,
			'name': company_name,
		},
		'company_id': company_id,
		'report_date': date_util.load_date_str(anchor_date),
		'update_days_back': update_days_back,
	}]

	dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
		session_maker,
		compute_requests
	)

	if fatal_error:
		print(f"[ERROR] FATAL error thrown when recomputing balances for company: '{fatal_error}'")
	else:
		print("[SUCCESS] Successfully recomputed balances for company")

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to perform action on')
parser.add_argument('anchor_date', help='Anchor date (MM/DD/YYYY format) to perform action on')
parser.add_argument('update_days_back', help='How many days back to perform action on')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	main(
		company_identifier=args.company_identifier,
		anchor_date=args.anchor_date,
		update_days_back=int(args.update_days_back),
	)
