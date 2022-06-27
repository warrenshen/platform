"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.finance import contract_util

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date: datetime.date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] moving US state from contract to company')

			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).filter(
						models.Company.is_customer == True
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				all_company_ids = []
				for company in companies:
					all_company_ids.append(str(company.id))

				financial_summaries = cast(
					List[models.FinancialSummary],
					session.query(models.FinancialSummary).filter(
						models.FinancialSummary.date == date_util.now_as_date()
					).filter(
						models.FinancialSummary.company_id.in_(all_company_ids)
					).all())

				active_company_ids = []
				inactive_company_ids = []
				for financial_summary in financial_summaries:
					company_id = str(financial_summary.company_id)
					if financial_summary.product_type is not None:
						active_company_ids.append(company_id)
					else:
						inactive_company_ids.append(company_id)

				company_id_to_contract_lookup: Dict[str, models.Contract or contract_util.Contract] = {}
				
				active_company_id_to_contract_dict = contract_util.get_active_contracts_by_company_ids(session, active_company_ids, {})[0]
				for company_id in active_company_ids:
					contract = active_company_id_to_contract_dict[company_id]
					company_id_to_contract_lookup[company_id] = contract

				inactive_contracts = cast(
					List[models.Contract],
					session.query(models.Contract).filter(
						models.Contract.company_id.in_(inactive_company_ids)
					).order_by(
						models.Contract.start_date.desc(),
						models.Contract.company_id
					).all())

				for inactive_contract in inactive_contracts:
					company_id = str(inactive_contract.company_id)
					if company_id not in company_id_to_contract_lookup:
						company_id_to_contract_lookup[company_id] = inactive_contract

				for company in companies:
					company_id = str(company.id)
					if company_id in company_id_to_contract_lookup:
						contract = company_id_to_contract_lookup[company_id]
						if company_id in inactive_company_ids:
							product_config = contract.product_config
							contract_id = contract.id
						elif company_id in active_company_ids:
							product_config = contract.get_product_config()
							contract_id = contract.contract_id
						state = None
						for field in product_config["v1"]["fields"]:
							if field["internal_name"] == "us_state":
								state = field["value"]
						if state == None:
							print(f"no state found for {company.name} with company_id id {company.id} in contract id {contract_id}")
						else:
							print(f"updating state for {company.name} with company_id id {company.id} in state column to {state} from contract id {contract_id}")
							company.state = state
					else:
						print(f"no contract found for company id {company_id} with company name {company.name}")

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
