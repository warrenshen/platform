import decimal
import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PRODUCT_TYPES, CompanyType, ProductType
from bespoke.finance import number_util
from bespoke_test.contract.contract_test_helper import (ContractInputDict,
                                                        create_contract_config)

# customer_identifier, product_type, start_date, end_date, termination_date, financing_terms, maximum_amount, minimum_monthly_amount, advance_rate, factoring_fee_percentage, factoring_fee_threshold, wire_fee
CONTRACT_TUPLES = [
	("LU", "Inventory", "6/5/2020", "6/5/2021", "12/8/2020", 120.00, 600000.00, 0.00, 100.00, 0.00075, 0.00, 0),
	("LU", "Inventory", "12/09/2020", "12/09/2021", "12/09/2021", 120.00, 1000000.00, 0.00, 100.00, 0.00075, 0.00, 0),
]

def import_historical_contracts_leune(session: Session) -> None:
	contracts_count = len(CONTRACT_TUPLES)
	print(f'Running for {contracts_count} contracts...')

	for index, new_contract_tuple in enumerate(CONTRACT_TUPLES):
		print(f'[{index + 1} of {contracts_count}]')
		customer_identifier, product_type, start_date, end_date, termination_date, financing_terms, maximum_amount, minimum_monthly_amount, advance_rate, factoring_fee_percentage, factoring_fee_threshold, wire_fee = new_contract_tuple

		parsed_start_date = date_util.load_date_str(start_date)
		parsed_end_date = date_util.load_date_str(end_date)
		parsed_termination_date = date_util.load_date_str(termination_date)

		today_date = date_util.today_as_date()
		is_contract_terminated = parsed_termination_date <= today_date
		if is_contract_terminated:
			parsed_terminated_at = datetime.combine(parsed_termination_date, time())
		else:
			parsed_terminated_at = None

		parsed_product_type = None
		if product_type == 'Inventory':
			parsed_product_type = ProductType.INVENTORY_FINANCING

		if parsed_product_type not in PRODUCT_TYPES:
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): product type')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_start_date or
			not parsed_end_date or
			not parsed_termination_date
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): dates')
			print(f'EXITING EARLY')
			return

		if (
			financing_terms <= 0 or
			maximum_amount <= 0 or
			minimum_monthly_amount is None or
			advance_rate <= 0 or
			factoring_fee_percentage <= 0 or
			factoring_fee_percentage > 1 or
			factoring_fee_threshold is None or
			wire_fee is None
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): terms')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {contracts_count}] Customer with identifier {customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		existing_contract = cast(
			models.Contract,
			session.query(models.Contract).filter(
				models.Contract.company_id == customer.id
			).filter(
				models.Contract.product_type == parsed_product_type
			).filter(
				models.Contract.start_date == parsed_start_date
			).filter(
				models.Contract.end_date == parsed_end_date
			).filter(
				models.Contract.adjusted_end_date == parsed_termination_date
			).first())

		if existing_contract:
			print(f'[{index + 1} of {contracts_count}] Contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} already exists')
			continue
		else:
			print(f'[{index + 1} of {contracts_count}] Contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} does not exist, creating it...')

			contract_dict = ContractInputDict(
				max_days_until_repayment=financing_terms,
				maximum_principal_amount=maximum_amount,
				minimum_monthly_amount=minimum_monthly_amount,
				advance_rate=advance_rate,
				interest_rate=factoring_fee_percentage,
				factoring_fee_threshold=factoring_fee_threshold,
				late_fee_structure='{"1-14": 0.25, "15-29": 0.5, "30+": 1.0}',
				preceeding_business_day=False,
				wire_fee=wire_fee,
				repayment_type_settlement_timeline='{}',
			)
			product_config = create_contract_config(
				product_type=parsed_product_type,
				input_dict=cast(ContractInputDict, contract_dict),
			)

			contract = models.Contract(
				company_id=customer.id,
				product_type=parsed_product_type,
				product_config=product_config,
				start_date=parsed_start_date,
				end_date=parsed_end_date,
				adjusted_end_date=parsed_termination_date,
				terminated_at=parsed_terminated_at,
			)
			session.add(contract)

			print(f'[{index + 1} of {contracts_count}] Created contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} for {customer.name} ({customer.identifier})')

			if not is_contract_terminated:
				print(f'[{index + 1} of {contracts_count}] Contract with termination date {termination_date} is not terminated, setting it as the active contract for {customer.name} ({customer.identifier})...')
				customer.contract_id = contract.id

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_historical_contracts_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
