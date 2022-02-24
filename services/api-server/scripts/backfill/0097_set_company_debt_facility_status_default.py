"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Any,  Callable, Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from bespoke.db.db_constants import CompanyDebtFacilityStatus

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Trying to set loans default debt facility status...')

			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).order_by(
						models.Company.id.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				for company in companies:
					contract = cast(
						models.Contract,
						session.query(models.Contract).filter(
							models.Contract.company_id == company.id
						).order_by(
							models.Contract.start_date.desc()
						).first())

					if contract is not None:
						if company and not company.debt_facility_status and contract.product_type:
							if contract.product_type == "dispensary_financing":
								print("{0} is a dispensary financing client. Defaulting to ineligible".format(company.name))
								company.debt_facility_status = CompanyDebtFacilityStatus.INELIGIBLE_FOR_FACILITY
							else:
								print("Setting {0} to good standing as default".format(company.name))
								company.debt_facility_status = CompanyDebtFacilityStatus.GOOD_STANDING
						else:
							print("No loan report associated with loan id:", loan.id)	
					
				session.flush()

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

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

	main(is_test_run)
