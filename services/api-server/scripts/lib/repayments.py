import decimal
import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import (ALL_LOAN_TYPES, CompanyType,
                                     LoanStatusEnum, PaymentMethodEnum,
                                     PaymentStatusEnum, PaymentType)
from bespoke.db.models import session_scope
from bespoke.excel import excel_reader
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import loan_calculator
from bespoke.finance.payments import repayment_util


def import_settled_repayments(
	session: Session,
	repayment_tuples,
) -> None:
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} repayments...')

	for index, new_repayment_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		customer_identifier, loan_identifier, payment_type, deposit_date, settlement_date, amount, to_principal, to_interest, to_fees, wire_fee = new_repayment_tuple

		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.combine(parsed_deposit_date, time())
		parsed_settled_at = datetime.combine(parsed_settlement_date, time())

		if (
			not amount or
			amount <= 0 or
			to_principal < 0 or
			to_interest < 0 or
			to_fees < 0 or
			wire_fee < 0 or
			not number_util.float_eq(amount, to_principal + to_interest + to_fees + wire_fee)
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
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {repayments_count}] Customer with identifier {customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == loan_identifier
			).first())

		if not loan:
			print(f'[{index + 1} of {repayments_count}] Loan with identifier {loan_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'repayment':
			parsed_payment_type = PaymentType.REPAYMENT

		if parsed_payment_type != PaymentType.REPAYMENT:
			print(f'[{index + 1} of {repayments_count}] Invalid repayment field(s)')
			print(f'EXITING EARLY')
			return

		amount_to_loan = to_principal + to_interest + to_fees
		amount_to_account = wire_fee

		if not number_util.float_eq(amount, amount_to_loan + amount_to_account):
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
			).first())

		if existing_repayment_transaction:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} with settlement date {settlement_date} already exists')
			continue
		else:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

			if wire_fee > 0:
				# TODO(warrenshen): support case where wire_fee > 0.
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} with settlement date {settlement_date} includes wire fee payment, skipping...')
				continue

			repayment = models.Payment(
				company_id=customer.id,
				type=PaymentType.REPAYMENT,
				method=PaymentMethodEnum.UNKNOWN,
				amount=amount_to_loan,
				deposit_date=parsed_deposit_date,
				settlement_date=parsed_settlement_date,
				submitted_at=parsed_submitted_at,
				settled_at=parsed_settled_at,
			)
			session.add(repayment)
			session.flush()

			transaction = models.Transaction(
				payment_id=repayment.id,
				loan_id=loan.id,
				type=PaymentType.REPAYMENT,
				subtype=None,
				amount=amount_to_loan,
				to_principal=decimal.Decimal(to_principal),
				to_interest=decimal.Decimal(to_interest),
				to_fees=decimal.Decimal(to_fees),
				effective_date=parsed_settlement_date,
			)
			session.add(transaction)
			session.flush()

			print(f'[{index + 1} of {repayments_count}] Created repayment on loan {loan_identifier} for {customer.name} ({customer.identifier})')

			# Load up a LoanCalculator and check if loan is closed.
			# If so, set loan.closed_at to parsed_settled_at. Otherwise, continue.
			contracts = cast(
				List[models.Contract],
				session.query(models.Contract).filter(
					models.Contract.company_id == customer.id
				).all())
			if not contracts:
				return None, errors.Error('Cannot calculate repayment effect because no contracts are setup for this company')

			contract_dicts = [c.as_dict() for c in contracts]

			contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
			if err:
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} failed because of error with ContractHelper: {err}')
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
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} failed because of error with augmented transactions: {err}')
				print(f'EXITING EARLY')
				return

			fee_accumulator = loan_calculator.FeeAccumulator()
			calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
			transactions_for_loan = loan_calculator.get_transactions_for_loan(
				str(loan.id),
				augmented_transactions,
			)

			loan_update, errs = calculator.calculate_loan_balance(
				loan.as_dict(),
				transactions_for_loan,
				parsed_settlement_date
			)

			if errs:
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} failed because of error with LoanCalculator: {errs}')
				print(f'EXITING EARLY')
				return

			if (
				loan_update['outstanding_principal'] != 0.0 or
				loan_update['outstanding_principal_for_interest'] != 0.0 or
				loan_update['outstanding_interest'] != 0.0 or
				loan_update['outstanding_fees'] != 0.0
			):
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} did not close out loan')
			else:
				print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} closed out loan, setting loan.closed_at to {parsed_settled_at}...')
				loan.closed_at = parsed_settled_at
				loan.payment_status = PaymentStatusEnum.CLOSED


# Line of credit is different, because we don't have a given loan identifier for each repayment.
def import_settled_repayments_line_of_credit(
	session_maker: Callable,
	repayment_tuples,
) -> None:
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} repayments...')

	for index, new_repayment_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		customer_identifier, payment_type, deposit_date, settlement_date, amount, to_principal, to_interest = new_repayment_tuple

		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.combine(parsed_deposit_date, time())
		parsed_settled_at = datetime.combine(parsed_settlement_date, time())

		parsed_amount = float(amount)
		parsed_to_principal = float(to_principal) if to_principal else 0.0
		parsed_to_interest = float(to_interest) if to_interest else 0.0

		if (
			not parsed_amount or
			parsed_amount <= 0 or
			parsed_to_principal < 0 or
			parsed_to_interest < 0 or
			not number_util.float_eq(parsed_amount, parsed_to_principal + parsed_to_interest)
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
					models.Company.company_type == CompanyType.Customer
				).filter(
					models.Company.identifier == customer_identifier
				).first())

			if not customer:
				print(f'[{index + 1} of {repayments_count}] Customer with identifier {customer_identifier} does not exist')
				print(f'EXITING EARLY')
				return

			customer_id = customer.id
			customer_name = customer.name
			customer_identifier = customer.identifier

			existing_repayment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.type == PaymentType.REPAYMENT
				).filter(
					models.Payment.company_id == customer_id
				).filter(
					models.Payment.amount == parsed_amount
				).filter(
					models.Payment.settlement_date == parsed_settlement_date
				).first())

			if existing_repayment:
				print(f'[{index + 1} of {repayments_count}] Repayment with amount {parsed_amount} and settlement date {settlement_date} already exists')
				continue

			print(f'[{index + 1} of {repayments_count}] Repayment for {customer_name} ({customer_identifier}) does not exist, creating it...')

			payment = models.Payment(
				company_id=customer_id,
				type=PaymentType.REPAYMENT,
				method=PaymentMethodEnum.UNKNOWN,
				payment_date=deposit_date,
				submitted_at=parsed_submitted_at,
			)

			session.add(payment)
			session.flush()

			payment_id = str(payment.id)

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
					'to_user_credit': 0.0,
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

		print(f'[{index + 1} of {repayments_count}] Created repayment for {customer_name} ({customer_identifier})')

		with session_scope(session_maker) as session:
			# Load up a LoanCalculator and check if loan is closed.
			# If so, set loan.closed_at to parsed_settled_at. Otherwise, continue.
			contracts = cast(
				List[models.Contract],
				session.query(models.Contract).filter(
					models.Contract.company_id == customer_id
				).all())
			if not contracts:
				return None, errors.Error('Error: no contracts are setup for this company!!')

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

				fee_accumulator = loan_calculator.FeeAccumulator()
				calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
				transactions_for_loan = loan_calculator.get_transactions_for_loan(
					str(loan.id),
					augmented_transactions,
				)

				loan_update, errs = calculator.calculate_loan_balance(
					loan_calculator.ThresholdInfoDict(day_threshold_met=None),
					loan.as_dict(),
					transactions_for_loan,
					parsed_settlement_date,
				)

				if errs:
					print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan.identifier} failed because of error with LoanCalculator: {errs}')
					print(f'EXITING EARLY')
					return

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

def load_into_db_from_excel(session: Session, path: str) -> None:
	print(f'Beginning import...')

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	advances_tuples = sheet['rows']
	import_settled_repayments(session, advances_tuples)
	print(f'Finished import')
