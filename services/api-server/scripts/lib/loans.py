import decimal
import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import (ALL_LOAN_TYPES, LoanStatusEnum, LoanTypeEnum)
from bespoke.db.models import session_scope
from bespoke.excel import excel_reader
from bespoke.finance import contract_util, number_util
from bespoke.finance.reports import loan_balances

def populate_frozen_loan_reports(session_maker: Callable) -> None:
	customer_dicts = []

	with models.session_scope(session_maker) as session:
		customers = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).all())

		customer_dicts += [customer.as_dict() for customer in customers]

	customers_count = len(customer_dicts)

	for index, customer_dict in enumerate(customer_dicts):
		print(f'[{index + 1} of {customers_count}]')
		print(f'[{index + 1} of {customers_count}] Updating frozen loans for customer {customer_dict["name"]}')

		customer_balance = loan_balances.CustomerBalance(customer_dict, session_maker)
		customer_update_dict, err = customer_balance.update(
			today=date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE),
			include_debug_info=False,
			include_frozen=True,
		)

		if customer_update_dict is not None:
			with session_scope(session_maker) as session:
				loan_ids = []

				loan_id_to_update = {}
				for loan_update in customer_update_dict['loan_updates']:
					loan_id = loan_update['loan_id']
					loan_id_to_update[loan_id] = loan_update
					loan_ids.append(loan_id)

				with session_scope(session_maker) as session:
					loans = cast(
						List[models.Loan],
						session.query(models.Loan).filter(
							models.Loan.id.in_(loan_ids)
						).all())

					if not loans:
						loans = []

					loan_report_ids = [loan.loan_report_id for loan in loans]
					loan_reports = cast(
						List[models.LoanReport],
						session.query(models.LoanReport).filter(
							models.LoanReport.id.in_(loan_report_ids)
						).all())

					loan_report_id_to_loan_report = dict({})
					for loan_report in loan_reports:
						loan_report_id_to_loan_report[str(loan_report.id)] = loan_report

					for loan in loans:
						if not loan.is_frozen:
							continue

						cur_loan_update = loan_id_to_update[str(loan.id)]

						loan_report = loan_report_id_to_loan_report.get(str(loan.id), None)

						if not loan_report:
							loan_report = models.LoanReport()
							session.add(loan_report)
							session.flush()
							loan.loan_report_id = loan_report.id

						loan_report.repayment_date = cur_loan_update['repayment_date']
						loan_report.financing_period = cur_loan_update['financing_period']
						loan_report.financing_day_limit = cur_loan_update['financing_day_limit']
						loan_report.total_principal_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_principal_paid']))
						loan_report.total_interest_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_interest_paid']))
						loan_report.total_fees_paid = decimal.Decimal(number_util.round_currency(cur_loan_update['total_fees_paid']))

def reset_loan_statuses(session: Session) -> None:
	loans = cast(
		List[models.Loan],
		session.query(models.Loan).all())

	loans_count = len(loans)

	for index, loan in enumerate(loans):
		print(f'[{index + 1} of {loans_count}]')

		new_approval_status = models_util.compute_loan_approval_status(loan)
		new_payment_status = models_util.compute_loan_payment_status(loan, session)

		if loan.status == new_approval_status and loan.payment_status == new_payment_status:
			print(f'[{index + 1} of {loans_count}] Loan status column values are correct, skipping')
			continue

		print(f'[{index + 1} of {loans_count}] Found incorrect status column value(s), updating loan statuses (new values: {new_approval_status}, {new_payment_status})...')
		loan.status = new_approval_status
		loan.payment_status = new_payment_status

def import_loans(
	session: Session, 
	loan_tuples: List[List[str]],
	is_frozen: bool = None,
) -> None:
	"""
	Imports loans for all product types except for Line of Credit.
	"""
	loans_count = len(loan_tuples)
	print(f'Running for {loans_count} loans...')

	for index, new_loan_tuple in enumerate(loan_tuples):
		print(f'[{index + 1} of {loans_count}]')
		(
			customer_identifier,
			loan_identifier,
			loan_type,
			amount,
			origination_date,
			maturity_date,
			adjusted_maturity_date,
			artifact_identifier,
		) = new_loan_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_amount = number_util.round_currency(float(amount))
		parsed_origination_date = date_util.load_date_str(origination_date)
		parsed_maturity_date = date_util.load_date_str(maturity_date)
		parsed_adjusted_maturity_date = date_util.load_date_str(adjusted_maturity_date)
		# Note we don't use the funded_date column from the XLSX.
		parsed_funded_at = datetime.combine(parsed_origination_date, time())

		try:
			# If loan_identifier from XLSX is "25.0", convert it to 25.
			numeric_loan_identifier = int(float(loan_identifier))
			parsed_loan_identifier = str(numeric_loan_identifier)
		except Exception:
			# If loan_identifier from XLSX is "25A", convert it to 25.
			numeric_loan_identifier = int("".join(filter(str.isdigit, loan_identifier)))
			parsed_loan_identifier = loan_identifier

		try:
			# If artifact_identifier from XLSX is "25.0", convert it to 25.
			numeric_artifact_identifier = int(float(artifact_identifier))
			parsed_artifact_identifier = str(numeric_artifact_identifier)
		except Exception:
			parsed_artifact_identifier = artifact_identifier

		if (
			not parsed_customer_identifier or
			not parsed_loan_identifier or
			not parsed_artifact_identifier or
			not parsed_amount or
			parsed_amount <= 0 or
			not parsed_origination_date or
			not parsed_maturity_date or
			not parsed_adjusted_maturity_date or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {loans_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		existing_loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == parsed_loan_identifier
			).first())

		if existing_loan:
			if not number_util.float_eq(existing_loan.amount, parsed_amount):
				# If there is an existing loan with a different amount, this indicates
				# that there is a pre-existing valid loan created for this customer. This is not
				# supposed to happen on production, as we plan to import historical closed loans prior
				# to the platform going live, but may happen on local or staging. In this case,
				# suffix the identifier of pre-existing loan with an "A" character and continue.
				print(f'[{index + 1} of {loans_count}] Loan with identifer {parsed_loan_identifier} but different amount exists')
				existing_loan.identifier = parsed_loan_identifier + 'A'
				session.flush()
			else:
				print(f'[{index + 1} of {loans_count}] Loan with identifer {parsed_loan_identifier} already exists')
				continue

		parsed_loan_type = None
		if loan_type in ['Inventory', 'PMF']:
			parsed_loan_type = LoanTypeEnum.INVENTORY
		elif loan_type in ['invoice', 'Invoice']:
			parsed_loan_type = LoanTypeEnum.INVOICE

		if parsed_loan_type not in ALL_LOAN_TYPES:
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		artifact_id = None

		if parsed_loan_type == LoanTypeEnum.INVENTORY:
			existing_purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter(
					models.PurchaseOrder.company_id == customer.id
				).filter(
					models.PurchaseOrder.order_number == parsed_artifact_identifier
				).first())

			if not existing_purchase_order:
				print(f'[{index + 1} of {loans_count}] Purchase order with identifier {parsed_artifact_identifier} does not exist')
				print(f'EXITING EARLY')
				return
			else:
				artifact_id = existing_purchase_order.id

		elif parsed_loan_type == LoanTypeEnum.INVOICE:
			existing_invoice = cast(
				models.Invoice,
				session.query(models.Invoice).filter(
					models.Invoice.company_id == customer.id
				).filter(
					models.Invoice.invoice_number == parsed_artifact_identifier
				).first())

			if not existing_invoice:
				print(f'[{index + 1} of {loans_count}] Invoice with identifier {parsed_artifact_identifier} does not exist')
				print(f'EXITING EARLY')
				return
			else:
				artifact_id = existing_invoice.id

		if not artifact_id:
			print(f'[{index + 1} of {loans_count}] Invalid artifact')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {loans_count}] Loan {parsed_loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

		loan = models.Loan(
			company_id=customer.id,
			identifier=parsed_loan_identifier,
			loan_type=parsed_loan_type,
			artifact_id=artifact_id,
			status=LoanStatusEnum.APPROVED,
			origination_date=parsed_origination_date,
			maturity_date=parsed_maturity_date,
			adjusted_maturity_date=parsed_adjusted_maturity_date,
			amount=parsed_amount,
			requested_at=parsed_funded_at, # Set requested_at to funded_at.
			approved_at=parsed_funded_at, # Set approved_at to funded_at.
			funded_at=parsed_funded_at,
			closed_at=None, # Note we leave closed_at to None; when payments are imported in, we will set this field.
			is_frozen=is_frozen,
		)
		session.add(loan)

		print(f'[{index + 1} of {loans_count}] Created loan {parsed_loan_identifier} for {customer.name} ({customer.identifier})')

		customer_latest_loan_identifier = customer.latest_loan_identifier
		new_latest_loan_identifier = max(numeric_loan_identifier, customer_latest_loan_identifier)
		customer.latest_loan_identifier = new_latest_loan_identifier

		print(f'Customer {customer.name} latest_loan_identifier is now "{new_latest_loan_identifier}"')
		session.flush()

def import_line_of_credit_loans(session: Session, loan_tuples: List[List[str]]) -> None:
	loans_count = len(loan_tuples)
	print(f'Running for {loans_count} loans...')

	for index, new_loan_tuple in enumerate(loan_tuples):
		print(f'[{index + 1} of {loans_count}]')
		(
			customer_identifier,
			loan_identifier,
			loan_type,
			# is_credit_for_vendor,
			# recipient_vendor_name,
			amount,
			origination_date,
		) = new_loan_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_amount = number_util.round_currency(float(amount))
		parsed_origination_date = date_util.load_date_str(origination_date)
		# Note we don't use the funded_date column from the XLSX.
		parsed_funded_at = datetime.combine(parsed_origination_date, time())

		try:
			# If loan_identifier from XLSX is "25.0", convert it to 25.
			numeric_loan_identifier = int(float(loan_identifier))
			parsed_loan_identifier = str(numeric_loan_identifier)
		except Exception:
			# If loan_identifier is "PB", leave it as is.
			# This is a special identifier signifying "Previous Balance".
			if loan_identifier.strip() == 'PB':
				parsed_loan_identifier = 'PB'
			else:
				# If loan_identifier from XLSX is "25A", convert it to 25.
				numeric_loan_identifier = int("".join(filter(str.isdigit, loan_identifier)))
				parsed_loan_identifier = loan_identifier

		if (
			not parsed_customer_identifier or
			not parsed_loan_identifier or
			not parsed_amount or
			parsed_amount <= 0 or
			not parsed_origination_date or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).filter(
				models.Company.identifier == parsed_customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {loans_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		existing_loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == parsed_loan_identifier
			).first())

		if existing_loan:
			if not number_util.float_eq(existing_loan.amount, parsed_amount):
				# If there is an existing loan with a different amount, this indicates
				# that there is a pre-existing valid loan created for this customer. This is not
				# supposed to happen on production, as we plan to import historical closed loans prior
				# to the platform going live, but may happen on local or staging. In this case,
				# suffix the identifier of pre-existing loan with an "A" character and continue.
				print(f'[{index + 1} of {loans_count}] Loan with identifer {parsed_loan_identifier} but different amount exists')
				existing_loan.identifier = parsed_loan_identifier + 'A'
				session.flush()
			else:
				print(f'[{index + 1} of {loans_count}] Loan with identifer {parsed_loan_identifier} already exists')
				continue

		parsed_loan_type = None
		if loan_type in ['line_of_credit', 'line of credit']:
			parsed_loan_type = LoanTypeEnum.LINE_OF_CREDIT

		if parsed_loan_type not in ALL_LOAN_TYPES:
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s): loan_type')
			print(f'EXITING EARLY')
			return

		parsed_is_credit_for_vendor = False
		recipient_vendor_name = None
		vendor_id = None

		if parsed_is_credit_for_vendor:
			vendor = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.is_vendor == True
				).filter(
					models.Company.name == recipient_vendor_name
				).first())

			if not vendor:
				print(f'[{index + 1} of {loans_count}] Vendor with name {recipient_vendor_name} does not exist')
				print(f'EXITING EARLY')
				return
			else:
				vendor_id = vendor.id

		contracts = cast(
			List[models.Contract],
			contract_util.get_active_contracts_base_query(session).filter(
				models.Contract.company_id == customer.id
			).all())
		if not contracts:
			print(f'[{index + 1} of {loans_count}] No contracts are setup for this {customer.name}')
			print(f'EXITING EARLY')
			return

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
		if err:
			print(f'[{index + 1} of {loans_count}] Loan {parsed_loan_identifier} failed because of error with ContractHelper: {err}')
			print(f'EXITING EARLY')
			return

		contract, err = contract_helper.get_contract(parsed_origination_date)
		if err:
			print(f'[{index + 1} of {loans_count}] No contract is available for {customer.name} at date {origination_date}')
			print(f'EXITING EARLY')
			return

		contract_adjusted_end_date, err = contract.get_adjusted_end_date()
		if err:
			print(f'[{index + 1} of {loans_count}] Contract is available but could not get adjusted end date')
			print(f'EXITING EARLY')
			return

		adjusted_maturity_date = contract_adjusted_end_date

		if (
			(parsed_is_credit_for_vendor is True and not vendor_id) or
			not adjusted_maturity_date or
			not parsed_origination_date
		):
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {loans_count}] Loan {parsed_loan_identifier} for {customer.name} ({customer.identifier}) with amount {parsed_amount} does not exist, creating it...')

		line_of_credit = models.LineOfCredit(
			company_id=customer.id,
			recipient_vendor_id=vendor_id,
			is_credit_for_vendor=parsed_is_credit_for_vendor,
		)

		session.add(line_of_credit)
		session.flush()

		if not line_of_credit.id:
			print(f'[{index + 1} of {loans_count}] Failed to create line_of_credit!!!')
			print(f'EXITING EARLY')
			return

		artifact_id = str(line_of_credit.id)

		loan = models.Loan(
			company_id=customer.id,
			identifier=parsed_loan_identifier,
			loan_type=parsed_loan_type,
			artifact_id=artifact_id,
			status=LoanStatusEnum.APPROVED, # Set status to APPROVED. If this loan is actually closed, a script that imports repayments will handle that.
			origination_date=parsed_origination_date,
			maturity_date=adjusted_maturity_date, # Default maturity_date to adjusted_maturity_date.
			adjusted_maturity_date=adjusted_maturity_date,
			amount=parsed_amount,
			requested_at=parsed_funded_at, # Set requested_at to funded_at.
			approved_at=parsed_funded_at, # Set approved_at to funded_at.
			funded_at=parsed_funded_at,
			closed_at=None, # Note we leave closed_at to None; when payments are imported in, we will set this field.
		)
		session.add(loan)

		print(f'[{index + 1} of {loans_count}] Created loan {parsed_loan_identifier} for {customer.name} ({customer.identifier})')

		if parsed_loan_identifier != 'PB':
			customer_latest_loan_identifier = customer.latest_loan_identifier
			new_latest_loan_identifier = max(numeric_loan_identifier, customer_latest_loan_identifier)
			customer.latest_loan_identifier = new_latest_loan_identifier

			print(f'Customer {customer.name} latest_loan_identifier is now "{new_latest_loan_identifier}"')
			session.flush()

# Normal (not line of credit) loans.
def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	loan_tuples = sheet['rows']
	# TODO(warrenshen): in the future, handle line of credit loans as well.
	# Skip the header row and filter out empty rows.
	filtered_loan_tuples = list(filter(lambda loan_tuple: loan_tuple[0] is not '', loan_tuples[1:]))
	import_loans(session, filtered_loan_tuples)
	print(f'Finished import')
