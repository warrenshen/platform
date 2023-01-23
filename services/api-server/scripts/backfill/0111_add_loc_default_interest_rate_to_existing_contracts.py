"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script adds a default interest rate for LoC customers
- 0.00820 if the contract includes the February leap year day
- 0.00822 if the contract - do not include - the February leap year day

Why:
The finance team needs a way to enforce the default interest rate as in
the actual legal document for when the team determines an LoC customer
is late / in default (currently a manual process)
"""

import os
import sys
from datetime import timedelta
from os import path
from typing import Callable, cast, List

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType


def main(is_test_run: bool) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			contracts = cast(
				List[models.Contract],
			session.query(
				models.Contract
			).filter(
				cast(Callable, models.Contract.is_deleted.isnot)(True)
			).filter(
				models.Contract.product_type == ProductType.LINE_OF_CREDIT
			).order_by(
				models.Contract.start_date.desc()
			).offset(
				current_page * BATCH_SIZE
			).limit(
				BATCH_SIZE
			).all())

			if len(contracts) <= 0:
				is_done = True
			else:
				for contract in contracts:
					
					fields = contract.product_config['v1']['fields']
					has_default_interest_field = False
					for field in fields:
						if field['internal_name'] == 'default_interest_rate':
							has_default_interest_field = True

					# Defaulting to the legal contract terms of
					# 3% over 30 day period
					interest_rate = 0.001

					if not has_default_interest_field:
						print(f'Appending a default interest rate of {interest_rate} to the contract for company with id { str(contract.company_id) } starting on { str(contract.start_date) } and ending on { str(contract.end_date) }')
						fields.append({
							'interrnal_name': 'default_interest_rate',
							'value': interest_rate,
						})
						contract.product_config = {
							'v1': {
								'fields': fields
							}
						}

			current_page += 1
					

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run=is_test_run)
