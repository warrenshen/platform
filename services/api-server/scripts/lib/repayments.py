import datetime
import decimal
import os
import sys
import time
from os import path
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import (CompanyType, PaymentMethodEnum,
                                     PaymentStatusEnum, PaymentType,
                                     TransactionSubType)
from bespoke.db.models import session_scope
from bespoke.excel import excel_reader
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import fee_util, loan_calculator
from bespoke.finance.payments import payment_util, repayment_util


def import_settled_repayments(
	session: Session,
	repayment_tuples,
) -> None:
	"""
	Imports repayments for all product types except for Line of Credit.
	"""
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} repayments...')

	for index, new_repayment_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		(
			customer_identifier,
			loan_identifier,
			payment_type,
			deposit_date,
			settlement_date,
			amount,
			to_principal,
			to_interest,
			to_late_fees,
			to_wire_fee,
		) = new_repayment_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.datetime.combine(parsed_deposit_date, datetime.time())
		parsed_settled_at = datetime.datetime.combine(parsed_settlement_date, datetime.time())
		parsed_amount = number_util.round_currency(float(amount))
		parsed_to_principal = number_util.round_currency(float(to_principal or 0)) # Value may be ''.
		parsed_to_interest = number_util.round_currency(float(to_interest or 0))
		parsed_to_late_fees = number_util.round_currency(float(to_late_fees or 0))
		parsed_to_wire_fee = number_util.round_currency(float(to_wire_fee or 0))

		try:
			# If loan_identifier from XLSX is "25.0", convert it to 25.
			numeric_loan_identifier = int(float(loan_identifier))
			parsed_loan_identifier = str(numeric_loan_identifier)
		except Exception:
			# If loan_identifier from XLSX is "25A", convert it to 25.
			numeric_loan_identifier = int("".join(filter(str.isdigit, loan_identifier)))
			parsed_loan_identifier = loan_identifier

		if (
			not parsed_customer_identifier or
			not parsed_loan_identifier or
			not numeric_loan_identifier or
			not parsed_amount or
			parsed_amount <= 0 or
			parsed_to_principal < 0 or
			parsed_to_interest < 0 or
			parsed_to_late_fees < 0 or
			parsed_to_wire_fee < 0 or
			not number_util.float_eq(parsed_amount, parsed_to_principal + parsed_to_interest + parsed_to_late_fees + parsed_to_wire_fee)
		):
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): numbers')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): dates')
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
			print(f'[{index + 1} of {repayments_count}] Customer with identifier {parsed_customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == parsed_loan_identifier
			).first())

		if not loan:
			print(f'[{index + 1} of {repayments_count}] Loan with identifier {parsed_loan_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'repayment':
			parsed_payment_type = PaymentType.REPAYMENT

		if parsed_payment_type != PaymentType.REPAYMENT:
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s)')
			print(f'EXITING EARLY')
			return

		amount_to_loan = parsed_to_principal + parsed_to_interest + parsed_to_late_fees
		amount_to_account = parsed_to_wire_fee

		if not number_util.float_eq(parsed_amount, amount_to_loan + amount_to_account):
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): math')
			print(f'EXITING EARLY')
			return

		existing_repayment_transaction = cast(
			models.Transaction,
			session.query(models.Transaction).filter(
				models.Transaction.type == PaymentType.REPAYMENT
			).filter(
				models.Transaction.loan_id == loan.id
			).filter(
				models.Transaction.effective_date == parsed_settlement_date
			).filter(
				models.Transaction.amount == amount_to_loan
			).first())

		if existing_repayment_transaction:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} with settlement date {settlement_date} already exists')
			continue

		print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

		customer.latest_repayment_identifier += 1
		new_latest_repayment_identifier = customer.latest_repayment_identifier

		repayment = models.Payment(
			company_id=customer.id,
			settlement_identifier=str(new_latest_repayment_identifier),
			type=PaymentType.REPAYMENT,
			method=PaymentMethodEnum.UNKNOWN,
			amount=parsed_amount,
			deposit_date=parsed_deposit_date,
			settlement_date=parsed_settlement_date,
			submitted_at=parsed_submitted_at,
			settled_at=parsed_settled_at,
		)
		session.add(repayment)
		session.flush()

		to_loan_transaction = models.Transaction(
			payment_id=repayment.id,
			loan_id=loan.id,
			type=PaymentType.REPAYMENT,
			subtype=None,
			amount=amount_to_loan,
			to_principal=decimal.Decimal(parsed_to_principal),
			to_interest=decimal.Decimal(parsed_to_interest),
			to_fees=decimal.Decimal(parsed_to_late_fees),
			effective_date=parsed_settlement_date,
		)
		session.add(to_loan_transaction)
		session.flush()

		if parsed_to_wire_fee > 0:
			to_account_transaction = models.Transaction(
				payment_id=repayment.id,
				loan_id=None,
				type=PaymentType.REPAYMENT_OF_ACCOUNT_FEE,
				subtype=None,
				amount=amount_to_account,
				to_principal=decimal.Decimal(0.0),
				to_interest=decimal.Decimal(0.0),
				to_fees=decimal.Decimal(0.0),
				effective_date=parsed_settlement_date,
			)
			session.add(to_account_transaction)
			session.flush()

		print(f'[{index + 1} of {repayments_count}] Created repayment on loan {parsed_loan_identifier} for {customer.name} ({customer.identifier})')
		print(f'Customer {customer.name} latest_repayment_identifier is now "{customer.latest_repayment_identifier}"')

		if loan.is_frozen:
			print(f'[{index + 1} of {repayments_count}] Repayment is on a frozen loan, setting loan.closed_at...')
			loan.outstanding_principal_balance = decimal.Decimal(0.0)
			loan.outstanding_interest = decimal.Decimal(0.0)
			loan.outstanding_fees = decimal.Decimal(0.0)
			loan.closed_at = parsed_settled_at
			continue

		# Load up a LoanCalculator and check if loan is closed.
		# If so, set loan.closed_at to parsed_settled_at. Otherwise, continue.
		contracts = cast(
			List[models.Contract],
			contract_util.get_active_contracts_base_query(session).filter(
				models.Contract.company_id == customer.id
			).all())
		if not contracts:
			print(f'[{index + 1} of {repayments_count}] No contracts are setup for this {customer.name}')
			print(f'EXITING EARLY')
			return

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
		if err:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} failed because of error with ContractHelper: {err}')
			print(f'EXITING EARLY')
			return

		# Get all transactions associated with loan
		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.loan_id == loan.id
			).all())

		# Get all payments associated with loan
		payment_ids = list(set([transaction.payment_id for transaction in transactions]))

		payments = cast(
			List[models.Payment],
			session.query(models.Payment).filter(
				models.Payment.id.in_(payment_ids)
			).all())

		augmented_transactions, err = models_util.get_augmented_transactions(
			[transaction.as_dict() for transaction in transactions],
			[payment.as_dict() for payment in payments],
		)
		if err:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} failed because of error with augmented transactions: {err}')
			print(f'EXITING EARLY')
			return

		fee_accumulator = fee_util.FeeAccumulator()
		calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
		transactions_for_loan = loan_calculator.get_transactions_for_loan(
			str(loan.id),
			augmented_transactions,
		)

		# Note: invoice may or may not exist, both are valid cases.
		# For Invoice Financing product type an invoice is supposed to exist,
		# but for other product types an invoice is not supposed to exist.
		invoice = cast(
			models.Invoice,
			session.query(models.Invoice).get(loan.artifact_id))

		calculate_result_dict, errs = calculator.calculate_loan_balance(
			threshold_info=loan_calculator.ThresholdInfoDict(day_threshold_met=None),
			loan=loan.as_dict(),
			invoice=invoice.as_dict() if invoice else None,
			augmented_transactions=transactions_for_loan,
			today=parsed_settlement_date,
		)

		if errs:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} failed because of error with LoanCalculator: {errs}')
			print(f'EXITING EARLY')
			return

		loan_update = calculate_result_dict['loan_update']

		if (
			loan_update['outstanding_principal'] != 0.0 or
			loan_update['outstanding_principal_for_interest'] != 0.0 or
			loan_update['outstanding_interest'] != 0.0 or
			loan_update['outstanding_fees'] != 0.0
		):
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} did not close out loan')
			loan.payment_status = PaymentStatusEnum.PARTIALLY_PAID
		else:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {parsed_loan_identifier} closed out loan, setting loan.closed_at to {parsed_settled_at}...')
			loan.payment_status = PaymentStatusEnum.CLOSED
			loan.closed_at = parsed_settled_at

def import_settled_repayments_line_of_credit(
	session_maker: Callable,
	repayment_tuples,
) -> None:
	"""
	Imports loans for Line of Credit product type.
	Line of Credit is different because we don't have a given loan identifier for each repayment.
	"""
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} repayments...')

	for index, new_repayment_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		(
			customer_identifier,
			payment_type,
			deposit_date,
			settlement_date,
			amount,
			to_principal,
			to_interest,
			to_late_fees,
			to_wire_fee,
			to_minimum_fee,
			to_customer, # Part of payment passed through to customer.
		) = new_repayment_tuple

		parsed_customer_identifier = customer_identifier.strip()
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.datetime.combine(parsed_deposit_date, datetime.time())
		parsed_settled_at = datetime.datetime.combine(parsed_settlement_date, datetime.time())

		parsed_amount = number_util.round_currency(float(amount))
		parsed_to_principal = number_util.round_currency(float(to_principal)) if to_principal else 0.0
		parsed_to_interest = number_util.round_currency(float(to_interest)) if to_interest else 0.0
		parsed_to_late_fees = number_util.round_currency(float(to_late_fees)) if to_late_fees else 0.0
		parsed_to_wire_fee = number_util.round_currency(float(to_wire_fee)) if to_wire_fee else 0.0
		parsed_to_minimum_fee = number_util.round_currency(float(to_minimum_fee)) if to_minimum_fee else 0.0
		parsed_to_customer = number_util.round_currency(float(to_customer)) if to_customer else 0.0

		if parsed_to_late_fees > 0.0:
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): to late fees')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_customer_identifier or
			not parsed_amount or
			parsed_amount <= 0 or
			parsed_to_principal < 0 or
			parsed_to_interest < 0 or
			parsed_to_wire_fee < 0 or
			parsed_to_minimum_fee < 0 or
			not number_util.float_eq(
				parsed_amount,
				(
					parsed_to_principal +
					parsed_to_interest +
					parsed_to_wire_fee +
					parsed_to_minimum_fee +
					parsed_to_customer
				)
			)
		):
			print(
				parsed_amount,
				parsed_to_principal,
				parsed_to_interest,
				parsed_to_late_fees,
				parsed_to_wire_fee,
				parsed_to_minimum_fee,
				parsed_to_customer,
			)
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): numbers')
			print(f'EXITING EARLY')
			return

		if (
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s): dates')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'repayment':
			parsed_payment_type = PaymentType.REPAYMENT

		if parsed_payment_type != PaymentType.REPAYMENT:
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s)')
			print(f'EXITING EARLY')
			return

		payment_id = None
		customer_id = None
		customer_name = None

		with session_scope(session_maker) as session:
			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.is_customer == True
				).filter(
					models.Company.identifier == parsed_customer_identifier
				).first())

			if not customer:
				print(f'[{index + 1} of {repayments_count}] Customer with identifier {parsed_customer_identifier} does not exist')
				print(f'EXITING EARLY')
				return

			customer_id = customer.id
			customer_name = customer.name
			parsed_customer_identifier = customer.identifier

			if parsed_to_minimum_fee > 0.0:
				_ = payment_util.create_and_add_account_level_fee(
					company_id=customer_id,
					subtype=TransactionSubType.MINIMUM_INTEREST_FEE,
					amount=parsed_to_minimum_fee,
					originating_payment_id=None,
					created_by_user_id=None,
					deposit_date=parsed_deposit_date,
					effective_date=parsed_deposit_date,
					session=session,
				)

				print(f'[{index + 1} of {repayments_count}] Created account level fee for {customer_name} ({parsed_customer_identifier}) of amount {parsed_to_minimum_fee}')

			existing_repayment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.type == PaymentType.REPAYMENT
				).filter(
					models.Payment.company_id == customer_id
				).filter(
					models.Payment.amount == parsed_amount
				).filter(
					models.Payment.deposit_date == parsed_deposit_date
				).filter(
					models.Payment.settlement_date == parsed_settlement_date
				).first())

			if not existing_repayment:
				print(f'[{index + 1} of {repayments_count}] Repayment for {customer_name} ({parsed_customer_identifier}) does not exist, creating it...')

				customer.latest_repayment_identifier += 1
				new_latest_repayment_identifier = customer.latest_repayment_identifier

				repayment = models.Payment(
					company_id=customer_id,
					settlement_identifier=str(new_latest_repayment_identifier),
					type=PaymentType.REPAYMENT,
					method=PaymentMethodEnum.UNKNOWN,
					amount=parsed_amount,
					payment_date=parsed_deposit_date,
					deposit_date=parsed_deposit_date,
					settlement_date=parsed_settlement_date,
					submitted_at=parsed_submitted_at,
				)
				session.add(repayment)
				session.flush()
				payment_id = str(repayment.id)
			elif existing_repayment.settled_at:
				print(f'[{index + 1} of {repayments_count}] Repayment with amount {parsed_amount} and settlement date {settlement_date} already exists')
				continue
			elif existing_repayment and not existing_repayment.settled_at:
				payment_id = str(existing_repayment.id)
				print(f'[{index + 1} of {repayments_count}] Repayment for {customer_name} ({parsed_customer_identifier}) exists but is not settled, settling it...')

		if not payment_id:
			print(f'[{index + 1} of {repayments_count}] Could not create repayment')
			print(f'EXITING EARLY')
			return

		transaction_ids, err = repayment_util.settle_repayment(
			req=repayment_util.SettleRepaymentReqDict(
				company_id=customer_id,
				payment_id=payment_id,
				amount=parsed_amount,
				deposit_date=deposit_date,
				settlement_date=settlement_date,
				items_covered={
					'to_principal': parsed_to_principal,
					'to_interest': parsed_to_interest,
					'to_user_credit': parsed_to_customer,
					'to_account_fees': parsed_to_wire_fee + parsed_to_minimum_fee,
				},
				transaction_inputs=None,
			),
			user_id=None,
			session_maker=session_maker,
			is_line_of_credit=True,
		)

		if err:
			print(f'[{index + 1} of {repayments_count}] Could not settle repayment because of err: {err}')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {repayments_count}] Created repayment for {customer_name} ({parsed_customer_identifier})')

		if parsed_to_customer > 0.0:
			with session_scope(session_maker) as session:
				_, err = payment_util.create_and_add_credit_payout_to_customer(
					company_id=customer_id,
					payment_method=PaymentMethodEnum.UNKNOWN,
					amount=parsed_to_customer,
					created_by_user_id=None,
					deposit_date=parsed_settlement_date,
					effective_date=parsed_settlement_date,
					session=session,
				)

				if err:
					print(f'[{index + 1} of {repayments_count}] Could not create payout to customer because of err: {err}')
					print(f'EXITING EARLY')
					return
				else:
					print(f'[{index + 1} of {repayments_count}] Created payout to customer for {customer_name} ({parsed_customer_identifier}) of amount {parsed_to_customer}')

		with session_scope(session_maker) as session:
			# Load up a LoanCalculator and check if loan is closed.
			# If so, set loan.closed_at to parsed_settled_at. Otherwise, continue.
			contracts = cast(
				List[models.Contract],
				contract_util.get_active_contracts_base_query(session).filter(
					models.Contract.company_id == customer_id
				).all())
			if not contracts:
				print(f'[{index + 1} of {repayments_count}] Error: no contracts are setup for this company!!')
				return None

			contract_dicts = [c.as_dict() for c in contracts]

			contract_helper, err = contract_util.ContractHelper.build(customer_id, contract_dicts)
			if err:
				print(f'[{index + 1} of {repayments_count}] Repayment with amount {parsed_amount} and settlement date {settlement_date} failed because of error with ContractHelper: {err}')
				print(f'EXITING EARLY')
				return

			transactions = cast(
				List[models.Transaction],
				session.query(models.Transaction).filter(
					models.Transaction.id.in_(transaction_ids)
				).all())

			loan_ids = [transaction.loan_id for transaction in transactions]

			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				))

			for loan in loans:
				# Get all transactions associated with loan
				transactions = cast(
					List[models.Transaction],
					session.query(models.Transaction).filter(
						models.Transaction.loan_id == loan.id
					).all())

				# Get all payments associated with loan
				payment_ids = list(set([transaction.payment_id for transaction in transactions]))

				payments = cast(
					List[models.Payment],
					session.query(models.Payment).filter(
						models.Payment.id.in_(payment_ids)
					).all())

				augmented_transactions, err = models_util.get_augmented_transactions(
					[transaction.as_dict() for transaction in transactions],
					[payment.as_dict() for payment in payments],
				)
				if err:
					print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan.identifier} failed because of error with augmented transactions: {err}')
					print(f'EXITING EARLY')
					return

				fee_accumulator = fee_util.FeeAccumulator()
				calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
				transactions_for_loan = loan_calculator.get_transactions_for_loan(
					str(loan.id),
					augmented_transactions,
				)

				calculate_result_dict, errs = calculator.calculate_loan_balance(
					loan_calculator.ThresholdInfoDict(day_threshold_met=None),
					loan.as_dict(),
					transactions_for_loan,
					parsed_settlement_date,
				)

				if errs:
					print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan.identifier} failed because of error with LoanCalculator: {errs}')
					print(f'EXITING EARLY')
					return

				loan_update = calculate_result_dict['loan_update']

				if (
					loan_update['outstanding_principal'] != 0.0 or
					loan_update['outstanding_principal_for_interest'] != 0.0 or
					loan_update['outstanding_interest'] != 0.0 or
					loan_update['outstanding_fees'] != 0.0
				):
					print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan.identifier} did not close out loan')
				else:
					print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan.identifier} closed out loan, setting loan.closed_at to {parsed_settled_at}...')
					loan.closed_at = parsed_settled_at
					loan.payment_status = PaymentStatusEnum.CLOSED

		time.sleep(0.5)

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	repayment_tuples = sheet['rows']
	# TODO(warrenshen): in the future, handle line of credit repayments as well.
	# Skip the header row and filter out empty rows.
	filtered_repayment_tuples = list(filter(lambda repayment_tuple: repayment_tuple[0] is not '', repayment_tuples[1:]))
	import_settled_repayments(session, filtered_repayment_tuples)
	print(f'Finished import')
