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
from bespoke.db.db_constants import (ALL_LOAN_TYPES, CompanyType,
                                     LoanStatusEnum, PaymentMethodEnum,
                                     PaymentType)
from bespoke.finance import number_util


def import_settled_repayments(
	session: Session,
	repayment_tuples,
) -> None:
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} advances...')

	for index, new_advance_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		customer_identifier, loan_identifier, payment_type, amount, payment_date, deposit_date, settlement_date = new_advance_tuple

		parsed_payment_date = date_util.load_date_str(payment_date)
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.combine(parsed_payment_date, time())
		parsed_settled_at = datetime.combine(parsed_settlement_date, time())

		if (
			not amount or
			amount <= 0 or
			not parsed_payment_date or
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {repayments_count}] Invalid advance field(s)')
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

		if not number_util.float_eq(loan.amount, amount):
			print(f'[{index + 1} of {repayments_count}] Loan with identifer {loan_identifier} but incorrect amount exists')
			print(f'EXITING EARLY')
			return

		if loan.origination_date != parsed_settlement_date:
			print(f'[{index + 1} of {repayments_count}] Loan with identifer {loan_identifier} but incorrect origination date exists')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'advance':
			parsed_payment_type = PaymentType.ADVANCE

		if parsed_payment_type != PaymentType.ADVANCE:
			print(f'[{index + 1} of {repayments_count}] Invalid advance field(s)')
			print(f'EXITING EARLY')
			return

		existing_advance = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.ADVANCE
			).filter(
				models.Payment.amount == amount
			).filter(
				models.Payment.settlement_date == parsed_settlement_date
			).first())

		if existing_advance:
			print(f'[{index + 1} of {repayments_count}] Advance on loan {loan_identifier} with settlement date {settlement_date} already exists')
			continue
		else:
			print(f'[{index + 1} of {repayments_count}] Advance on loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

			advance = models.Payment(
				company_id=customer.id,
				type=PaymentType.ADVANCE,
				method=PaymentMethodEnum.UNKNOWN,
				amount=amount,
				payment_date=parsed_payment_date,
				deposit_date=parsed_deposit_date,
				settlement_date=parsed_settlement_date,
				submitted_at=parsed_submitted_at,
				settled_at=parsed_settled_at,
			)
			session.add(advance)
			session.flush()

			transaction = models.Transaction(
				payment_id=advance.id,
				loan_id=loan.id,
				type=PaymentType.ADVANCE,
				subtype=None,
				amount=amount,
				to_principal=decimal.Decimal(amount),
				to_interest=decimal.Decimal(0.0),
				to_fees=decimal.Decimal(0.0),
				effective_date=parsed_settlement_date,
			)
			session.add(transaction)
			session.flush()

			print(f'[{index + 1} of {repayments_count}] Created advance on loan {loan_identifier} for {customer.name} ({customer.identifier})')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_settled_advances_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()


# Line of credit is different, because we don't have a given loan identifier for each repayment.
def import_settled_repayments_line_of_credit(
	session: Session,
	repayment_tuples,
) -> None:
	repayments_count = len(repayment_tuples)
	print(f'Running for {repayments_count} advances...')

	for index, new_repayment_tuple in enumerate(repayment_tuples):
		print(f'[{index + 1} of {repayments_count}]')
		customer_identifier, payment_type, amount, payment_date, deposit_date, settlement_date, to_principal, to_interest = new_repayment_tuple

		parsed_payment_date = date_util.load_date_str(payment_date)
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_submitted_at = datetime.combine(parsed_payment_date, time())
		parsed_settled_at = datetime.combine(parsed_settlement_date, time())

		if (
			not amount or
			amount <= 0 or
			not parsed_payment_date or
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {repayments_count}] Invalid advance field(s)')
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

		if not number_util.float_eq(loan.amount, amount):
			print(f'[{index + 1} of {repayments_count}] Loan with identifer {loan_identifier} but incorrect amount exists')
			print(f'EXITING EARLY')
			return

		if loan.origination_date != parsed_settlement_date:
			print(f'[{index + 1} of {repayments_count}] Loan with identifer {loan_identifier} but incorrect origination date exists')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'advance':
			parsed_payment_type = PaymentType.ADVANCE

		if parsed_payment_type != PaymentType.ADVANCE:
			print(f'[{index + 1} of {repayments_count}] Invalid advance field(s)')
			print(f'EXITING EARLY')
			return

		existing_advance = cast(
			models.Payment,
			session.query(models.Payment).filter(
				models.Payment.company_id == customer.id
			).filter(
				models.Payment.type == PaymentType.ADVANCE
			).filter(
				models.Payment.amount == amount
			).filter(
				models.Payment.settlement_date == parsed_settlement_date
			).first())

		if existing_advance:
			print(f'[{index + 1} of {repayments_count}] Advance on loan {loan_identifier} with settlement date {settlement_date} already exists')
			continue
		else:
			print(f'[{index + 1} of {repayments_count}] Advance on loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

			advance = models.Payment(
				company_id=customer.id,
				type=PaymentType.ADVANCE,
				method=PaymentMethodEnum.UNKNOWN,
				amount=amount,
				payment_date=parsed_payment_date,
				deposit_date=parsed_deposit_date,
				settlement_date=parsed_settlement_date,
				submitted_at=parsed_submitted_at,
				settled_at=parsed_settled_at,
			)
			session.add(advance)
			session.flush()

			transaction = models.Transaction(
				payment_id=advance.id,
				loan_id=loan.id,
				type=PaymentType.ADVANCE,
				subtype=None,
				amount=amount,
				to_principal=decimal.Decimal(amount),
				to_interest=decimal.Decimal(0.0),
				to_fees=decimal.Decimal(0.0),
				effective_date=parsed_settlement_date,
			)
			session.add(transaction)
			session.flush()

			print(f'[{index + 1} of {repayments_count}] Created advance on loan {loan_identifier} for {customer.name} ({customer.identifier})')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_settled_advances_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
