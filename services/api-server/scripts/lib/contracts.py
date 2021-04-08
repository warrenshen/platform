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
from bespoke.excel import excel_reader
from bespoke.finance import number_util
from bespoke_test.contract.contract_test_helper import (ContractInputDict,
                                                        create_contract_config)


def import_contracts(
	session: Session,
	contract_tuples,
) -> None:
	contracts_count = len(contract_tuples)
	print(f'Running for {contracts_count} contracts...')

	for index, new_contract_tuple in enumerate(contract_tuples):
		print(f'[{index + 1} of {contracts_count}]')
		(
			customer_identifier,
			product_type,
			start_date,
			end_date,
			termination_date,
			financing_terms,
			maximum_amount,
			minimum_monthly_amount,
			advance_rate,
			factoring_fee_percentage,
			factoring_fee_threshold,
			adjusted_factoring_fee_percentage,
			late_fee_structure, # Not used yet
			wire_fee,
			settlement_timeline, # Not used yet
			borrowing_base_accounts_receivable_percentage,
			borrowing_base_inventory_percentage,
			borrowing_base_cash_percentage,
			borrowing_base_cash_in_daca_percentage,
		) = new_contract_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_start_date = date_util.load_date_str(start_date)
		parsed_end_date = date_util.load_date_str(end_date)
		parsed_termination_date = date_util.load_date_str(termination_date) if termination_date else None
		parsed_financing_terms = int(float(financing_terms))
		parsed_maximum_amount = float(maximum_amount)
		parsed_minimum_monthly_amount = float(minimum_monthly_amount) if minimum_monthly_amount else 0.0
		parsed_advance_rate = float(advance_rate)
		parsed_factoring_fee_percentage = float(factoring_fee_percentage)
		parsed_factoring_fee_threshold = float(factoring_fee_threshold) if factoring_fee_threshold else None
		parsed_adjusted_factoring_fee_percentage = float(adjusted_factoring_fee_percentage) if adjusted_factoring_fee_percentage else None
		parsed_wire_fee = float(wire_fee or 0)
		parsed_borrowing_base_accounts_receivable_percentage = float(borrowing_base_accounts_receivable_percentage) if borrowing_base_accounts_receivable_percentage else None
		parsed_borrowing_base_inventory_percentage = float(borrowing_base_inventory_percentage) if borrowing_base_inventory_percentage else None
		parsed_borrowing_base_cash_percentage = float(borrowing_base_cash_percentage) if borrowing_base_cash_percentage else None
		parsed_borrowing_base_cash_in_daca_percentage = float(borrowing_base_cash_in_daca_percentage) if borrowing_base_cash_in_daca_percentage else None

		if (
			parsed_financing_terms <= 0 or
			parsed_maximum_amount <= 0 or
			parsed_minimum_monthly_amount is None or
			parsed_advance_rate <= 0 or
			parsed_advance_rate > 1 or
			parsed_factoring_fee_percentage <= 0 or
			parsed_factoring_fee_percentage > 1 or
			(parsed_adjusted_factoring_fee_percentage and parsed_adjusted_factoring_fee_percentage <= 0) or
			(parsed_adjusted_factoring_fee_percentage and parsed_adjusted_factoring_fee_percentage > 1) or
			parsed_wire_fee is None or
			(
				parsed_borrowing_base_accounts_receivable_percentage is not None and
				(
					parsed_borrowing_base_accounts_receivable_percentage < 0 or
					parsed_borrowing_base_accounts_receivable_percentage > 1
				)
			) or
			(
				parsed_borrowing_base_inventory_percentage is not None and
				(
					parsed_borrowing_base_inventory_percentage < 0 or
					parsed_borrowing_base_inventory_percentage > 1
				)
			) or
			(
				parsed_borrowing_base_cash_percentage is not None and
				(
					parsed_borrowing_base_cash_percentage < 0 or
					parsed_borrowing_base_cash_percentage > 1
				)
			) or
			(
				parsed_borrowing_base_cash_in_daca_percentage is not None and
				(
					parsed_borrowing_base_cash_in_daca_percentage < 0 or
					parsed_borrowing_base_cash_in_daca_percentage > 1
				)
			)
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): terms')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_start_date or
			not parsed_end_date
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): dates')
			print(f'EXITING EARLY')
			return

		today_date = date_util.today_as_date()
		is_contract_terminated = parsed_termination_date and parsed_termination_date <= today_date
		if is_contract_terminated:
			parsed_terminated_at = datetime.combine(parsed_termination_date, time())
		else:
			parsed_terminated_at = None

		parsed_product_type = None
		if product_type in ['Inventory', 'inventory']:
			parsed_product_type = ProductType.INVENTORY_FINANCING
		elif product_type in ['Line of Credit', 'line_of_credit']:
			parsed_product_type = ProductType.LINE_OF_CREDIT


		if parsed_product_type not in PRODUCT_TYPES:
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): product type')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {contracts_count}] Customer with identifier {parsed_customer_identifier} does not exist')
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
				max_days_until_repayment=parsed_financing_terms,
				maximum_principal_amount=parsed_maximum_amount,
				minimum_monthly_amount=parsed_minimum_monthly_amount,
				advance_rate=parsed_advance_rate,
				interest_rate=parsed_factoring_fee_percentage,
				factoring_fee_threshold=parsed_factoring_fee_threshold,
				adjusted_factoring_fee_percentage=parsed_adjusted_factoring_fee_percentage,
				late_fee_structure='{"1-14": 0.25, "15-29": 0.5, "30+": 1.0}',
				preceeding_business_day=False,
				wire_fee=parsed_wire_fee,
				repayment_type_settlement_timeline='{"wire": 1, "ach": 1, "reverse_draft_ach": 1, "check": 5, "cash": 5}',
				borrowing_base_accounts_receivable_percentage=parsed_borrowing_base_accounts_receivable_percentage,
				borrowing_base_inventory_percentage=parsed_borrowing_base_inventory_percentage,
				borrowing_base_cash_percentage=parsed_borrowing_base_cash_percentage,
				borrowing_base_cash_in_daca_percentage=parsed_borrowing_base_cash_in_daca_percentage,
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
			session.flush()

			contract_id = str(contract.id)

			print(f'[{index + 1} of {contracts_count}] Created contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} for {customer.name} ({customer.identifier})')

			if not is_contract_terminated:
				print(f'[{index + 1} of {contracts_count}] Contract with termination date {termination_date} is not terminated, setting it as the active contract for {customer.name} ({customer.identifier})...')
				customer.contract_id = contract_id

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	contract_tuples = sheet['rows']
	# TODO(warrenshen): in the future, handle line of credit repayments as well.
	# Skip the header row and filter out empty rows.
	filtered_contract_tuples = list(filter(lambda contract_tuple: contract_tuple[0] is not '', contract_tuples[1:]))
	import_contracts(session, filtered_contract_tuples)
	print(f'Finished import')
