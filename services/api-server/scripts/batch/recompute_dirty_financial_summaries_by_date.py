"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script finds dirty financial summaries for a specific date and updates them.

Why:
You can run this script to update dirty financial summaries for a specific date.
"""

import argparse
import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance.loans import reports_util

def main(target_date: str) -> None:
	engine = models.create_engine(statement_timeout=30000) # 30 seconds timeout
	session_maker = models.new_sessionmaker(engine)

	compute_requests = []

	with models.session_scope(session_maker) as session:
		compute_requests = reports_util.list_financial_summaries_that_need_balances_recomputed(
			session=session,
			today=date_util.load_date_str(target_date),
			amount_to_fetch=5 # Developer note: change this to run for different amounts of financial summaries at a time.
		)

		print("[INFO] Financial summaries to be recomputed...")
		print(compute_requests)

	with models.session_scope(session_maker) as session:
		dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
			session=session,
			compute_requests=compute_requests
		)

	if fatal_error:
		print(f"[ERROR] FATAL error thrown when recomputing balances: '{fatal_error}'")
	else:
		print("[SUCCESS] Successfully recomputed balances")

parser = argparse.ArgumentParser()
parser.add_argument('target_date', help='Target date (MM/DD/YYYY format) to perform action on')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	main(target_date=args.target_date)
