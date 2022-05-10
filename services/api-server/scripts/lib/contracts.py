import sys
from datetime import datetime, time
from os import path
from typing import cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import PRODUCT_TYPES, ProductType
from bespoke.excel import excel_reader
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
			customer_name,
			customer_identifier,
			product_type,
			start_date,
			end_date,
			termination_date,
			financing_terms,
			maximum_amount, # maximum credit limit
			minimum_monthly_amount,
			minimum_quarterly_amount,
			minimum_annual_amount,
			advance_rate,
			factoring_fee_percentage, # daily interest
			factoring_fee_threshold, # volume discount threshold
			factoring_fee_starting_value, # volume discount starting value
			adjusted_factoring_fee_percentage,
			late_fee_structure, # Not used yet
			wire_fee,
			timezone,
			us_state,
			settlement_timeline, # Not used yet
			borrowing_base_accounts_receivable_percentage,
			borrowing_base_inventory_percentage,
			borrowing_base_cash_percentage,
			borrowing_base_cash_in_daca_percentage,
		) = new_contract_tuple

		parsed_customer_name = customer_name.strip()
		parsed_customer_identifier = customer_identifier.strip()
		parsed_start_date = date_util.load_date_str(start_date)
		# TODO(warrenshen): there is a likely a bug with parsed_end_date, previous imports
		# resulted in contracts with bad end_date and adjusted_end_date column values.
		parsed_end_date = date_util.load_date_str(end_date)
		parsed_termination_date = date_util.load_date_str(termination_date) if termination_date else None
		parsed_financing_terms = int(float(financing_terms)) if financing_terms else None
		parsed_maximum_amount = float(maximum_amount)
		parsed_minimum_monthly_amount = float(minimum_monthly_amount) if minimum_monthly_amount != '' else None
		parsed_minimum_quarterly_amount = float(minimum_quarterly_amount) if minimum_quarterly_amount != '' else None
		parsed_minimum_annual_amount = float(minimum_annual_amount) if minimum_annual_amount != '' else None
		parsed_advance_rate = float(advance_rate)
		parsed_factoring_fee_percentage = float(factoring_fee_percentage)
		parsed_factoring_fee_threshold = float(factoring_fee_threshold) if factoring_fee_threshold else None
		parsed_factoring_fee_starting_value = float(factoring_fee_starting_value) if factoring_fee_starting_value != '' else None
		parsed_adjusted_factoring_fee_percentage = float(adjusted_factoring_fee_percentage) if adjusted_factoring_fee_percentage else None
		parsed_wire_fee = float(wire_fee or 0)
		parsed_timezone = None
		if timezone.strip() == 'PST':
			parsed_timezone = 'Canada/Pacific (GMT-07:00)'
		elif timezone.strip() == 'EST':
			parsed_timezone = 'America/New_York (GMT-04:00)'
		parsed_us_state = us_state.strip()
		parsed_borrowing_base_accounts_receivable_percentage = float(borrowing_base_accounts_receivable_percentage) if borrowing_base_accounts_receivable_percentage != '' else None
		parsed_borrowing_base_inventory_percentage = float(borrowing_base_inventory_percentage) if borrowing_base_inventory_percentage != '' else None
		parsed_borrowing_base_cash_percentage = float(borrowing_base_cash_percentage) if borrowing_base_cash_percentage != '' else None
		parsed_borrowing_base_cash_in_daca_percentage = float(borrowing_base_cash_in_daca_percentage) if borrowing_base_cash_in_daca_percentage != '' else None

		if parsed_factoring_fee_threshold is not None and parsed_factoring_fee_starting_value is None:
			parsed_factoring_fee_starting_value = 0.0

		if parsed_advance_rate == 100.0:
			parsed_advance_rate = 1.0

		if parsed_borrowing_base_accounts_receivable_percentage and parsed_borrowing_base_accounts_receivable_percentage > 1.0:
			parsed_borrowing_base_accounts_receivable_percentage /= 100.0

		if parsed_borrowing_base_inventory_percentage and parsed_borrowing_base_inventory_percentage > 1.0:
			parsed_borrowing_base_inventory_percentage /= 100.0

		if parsed_borrowing_base_cash_percentage and parsed_borrowing_base_cash_percentage > 1.0:
			parsed_borrowing_base_cash_percentage /= 100.0

		if parsed_borrowing_base_cash_in_daca_percentage and parsed_borrowing_base_cash_in_daca_percentage > 1.0:
			parsed_borrowing_base_cash_in_daca_percentage /= 100.0

		today_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
		is_contract_terminated = parsed_termination_date and parsed_termination_date <= today_date
		if is_contract_terminated:
			parsed_terminated_at = datetime.combine(parsed_termination_date, time())
		else:
			parsed_terminated_at = None

		parsed_product_type = None
		if product_type in ['Inventory', 'inventory']:
			parsed_product_type = ProductType.INVENTORY_FINANCING
		elif product_type in ['Line of Credit', 'line_of_credit', 'LOC']:
			parsed_product_type = ProductType.LINE_OF_CREDIT
		elif product_type in ['Invoice', 'invoice']:
			parsed_product_type = ProductType.INVOICE_FINANCING

		if parsed_product_type not in PRODUCT_TYPES:
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): product type')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_customer_name or
			not parsed_customer_identifier or
			(parsed_product_type == ProductType.LINE_OF_CREDIT and parsed_financing_terms) or
			(parsed_product_type != ProductType.LINE_OF_CREDIT and parsed_financing_terms <= 0) or
			parsed_maximum_amount <= 0 or
			parsed_advance_rate <= 0 or
			parsed_advance_rate > 1 or
			parsed_factoring_fee_percentage <= 0 or
			parsed_factoring_fee_percentage > 1 or
			(parsed_adjusted_factoring_fee_percentage and parsed_adjusted_factoring_fee_percentage <= 0) or
			(parsed_adjusted_factoring_fee_percentage and parsed_adjusted_factoring_fee_percentage > 1) or
			parsed_wire_fee is None or
			parsed_timezone is None or
			parsed_us_state is None
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): terms')
			print(f'EXITING EARLY')
			return

		if (
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
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): borrowing base')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_start_date or
			not parsed_end_date
		):
			print(f'[{index + 1} of {contracts_count}] Invalid contract field(s): dates')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if customer:
			print(f'[{index + 1} of {contracts_count}] Customer with identifier {parsed_customer_identifier} exists')
		else:
			print(f'[{index + 1} of {contracts_count}] Customer with identifier {parsed_customer_identifier} does not exist, creating it...')
			company_settings = models.CompanySettings()
			session.add(company_settings)

			session.flush()
			company_settings_id = str(company_settings.id)

			customer = models.Company(
				company_settings_id=company_settings_id,
				is_customer=True,
				name=parsed_customer_name,
				identifier=parsed_customer_identifier,
				contract_name=parsed_customer_name,
			)
			session.add(customer)
			session.flush()

			customer_id = str(customer.id)

			company_settings.company_id = customer_id
			session.flush()
			print(f'[{index + 1} of {contracts_count}] Created customer {customer.name} ({customer.identifier})')

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
			).first())

		parsed_adjusted_end_date = parsed_termination_date if parsed_termination_date else parsed_end_date

		if existing_contract:
			print(f'[{index + 1} of {contracts_count}] Contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} already exists')

			if existing_contract.adjusted_end_date is None:
				existing_contract.adjusted_end_date = parsed_adjusted_end_date
				print(f'[{index + 1} of {contracts_count}] Updated contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} for {customer.name} ({customer.identifier})')
		else:
			print(f'[{index + 1} of {contracts_count}] Contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} does not exist, creating it...')

			if parsed_product_type == ProductType.LINE_OF_CREDIT:
				late_fee_structure = None
				settlement_timeline = '{"wire": 2, "ach": 2, "reverse_draft_ach": 2, "check": 2, "cash": 2}'
			else:
				late_fee_structure = '{"1-14": 0.25, "15-29": 0.5, "30+": 1.0}'
				settlement_timeline = '{"wire": 1, "ach": 1, "reverse_draft_ach": 1, "check": 5, "cash": 5}'

			contract_dict = ContractInputDict(
				max_days_until_repayment=parsed_financing_terms,
				maximum_principal_amount=parsed_maximum_amount,
				minimum_monthly_amount=parsed_minimum_monthly_amount,
				minimum_quarterly_amount=parsed_minimum_quarterly_amount,
				minimum_annual_amount=parsed_minimum_annual_amount,
				advance_rate=parsed_advance_rate,
				interest_rate=parsed_factoring_fee_percentage,
				factoring_fee_threshold=parsed_factoring_fee_threshold,
				factoring_fee_starting_value=parsed_factoring_fee_starting_value,
				adjusted_factoring_fee_percentage=parsed_adjusted_factoring_fee_percentage,
				late_fee_structure=late_fee_structure,
				preceeding_business_day=False,
				wire_fee=parsed_wire_fee,
				timezone=parsed_timezone,
				us_state=parsed_us_state,
				repayment_type_settlement_timeline=settlement_timeline,
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
				adjusted_end_date=parsed_adjusted_end_date,
				terminated_at=parsed_terminated_at,
			)

			session.add(contract)
			session.flush()

			contract_id = str(contract.id)

			print(f'[{index + 1} of {contracts_count}] Created contract of {parsed_product_type} product type with start date {start_date} and end date {end_date} for {customer.name} ({customer.identifier})')

			if not is_contract_terminated:
				print(f'[{index + 1} of {contracts_count}] Contract with start date {start_date} and end date {end_date} is current, setting it as the active contract for {customer.name} ({customer.identifier})...')
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
	# Skip the header row and filter out empty rows.
	filtered_contract_tuples = list(filter(lambda contract_tuple: contract_tuple[0] is not '', contract_tuples[1:]))
	import_contracts(session, filtered_contract_tuples)
	print(f'Finished import')
