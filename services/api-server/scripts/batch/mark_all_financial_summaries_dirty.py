"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script marks all financial summaries dirty.

Why:
You can run this script after a change to financial calculation logic is made and needs to be applied everywhere.
"""

import argparse
import logging
import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance.loans import reports_util

def main(is_test_run: bool) -> None:
	logging.basicConfig(level=logging.INFO)

	engine = models.create_engine(statement_timeout=30000) # 30 seconds timeout
	session_maker = models.new_sessionmaker(engine)

	today_date = date_util.now_as_date()

	# [(company_id, company_name, company_identifier, contract_start_date, contract_end_date)...]
	company_active_contract_tuples = []
	with models.session_scope(session_maker) as session:
		contracts = session.query(models.Contract).filter(
			models.Contract.is_deleted.isnot(True),
		).order_by(
			models.Contract.company_id,
			models.Contract.start_date,
		).all()
		for contract in contracts:
			company = session.query(models.Company).filter(
				models.Company.id == contract.company_id,
			).first()
			company_active_contract_tuples.append((
				contract.company_id,
				company.name,
				company.identifier,
				contract.start_date,
				contract.adjusted_end_date,
			))

	for company_active_contract_tuple in company_active_contract_tuples:
		with models.session_scope(session_maker) as session:
			company_id, company_name, company_identifier, contract_start_date, contract_end_date = company_active_contract_tuple
			start_date = contract_start_date
			# There is no point in marking financial summaries dirty for dates in the future.
			end_date = contract_end_date if contract_end_date <= today_date else today_date
			logging.info(f'Marking company {company_name} ({company_identifier}) needs recompute for date range {start_date} to {end_date}')
			if not is_test_run:
				_, err = reports_util.set_companies_needs_recompute_by_date_range(
					session=session,
					company_ids=[str(company_id)],
					start_date=start_date,
					end_date=end_date,
				)
				if err:
					logging.error(f'[ERROR] {err}')
					exit(1)

	logging.info("[SUCCESS] Successfully marked all financial summaries dirty")

if __name__ == '__main__':
	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run=is_test_run)
