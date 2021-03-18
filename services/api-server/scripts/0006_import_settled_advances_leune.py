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

# customer_identifier, loan_identifier, payment_type, payment_date, deposit_date, settlement_date
ADVANCE_TUPLES = [
	("LU", "1", 68120.00, "advance", "6/24/2020", "6/24/2020", "6/24/2020"),
	("LU", "2A", 38000.00, "advance", "6/29/2020", "6/29/2020", "6/29/2020"),
	("LU", "2B", 42000.00, "advance", "6/29/2020", "6/29/2020", "6/29/2020"),
	("LU", "3", 21971.25, "advance", "7/15/2020", "7/15/2020", "7/15/2020"),
	("LU", "4", 18981.42, "advance", "7/15/2020", "7/15/2020", "7/15/2020"),
	("LU", "5", 10453.91, "advance", "7/21/2020", "7/21/2020", "7/21/2020"),
	("LU", "6", 20000.00, "advance", "9/11/2020", "9/11/2020", "9/11/2020"),
	("LU", "7", 42000.00, "advance", "9/18/2020", "9/18/2020", "9/18/2020"),
	("LU", "8", 15317.40, "advance", "9/21/2020", "9/21/2020", "9/21/2020"),
	("LU", "9A", 4581.32, "advance", "9/25/2020", "9/25/2020", "9/25/2020"),
	("LU", "9B", 32150.00, "advance", "9/25/2020", "9/25/2020", "9/25/2020"),
	("LU", "10A", 18000.00, "advance", "9/25/2020", "9/25/2020", "9/25/2020"),
	("LU", "10B", 20000.00, "advance", "9/25/2020", "9/25/2020", "9/25/2020"),
	("LU", "11A", 6640.00, "advance", "10/2/2020", "10/2/2020", "10/2/2020"),
	("LU", "11B", 51493.15, "advance", "10/2/2020", "10/2/2020", "10/2/2020"),
	("LU", "11C", 830.00, "advance", "10/2/2020", "10/2/2020", "10/2/2020"),
	("LU", "12", 27575.50, "advance", "10/14/2020", "10/14/2020", "10/14/2020"),
	("LU", "13", 7420.00, "advance", "10/15/2020", "10/15/2020", "10/15/2020"),
	("LU", "14", 9467.25, "advance", "11/5/2020", "11/5/2020", "11/5/2020"),
	("LU", "15A", 3122.17, "advance", "11/13/2020", "11/13/2020", "11/13/2020"),
	("LU", "15B", 5488.00, "advance", "11/13/2020", "11/13/2020", "11/13/2020"),
	("LU", "16", 4590.30, "advance", "11/16/2020", "11/16/2020", "11/16/2020"),
	("LU", "17", 30041.62, "advance", "11/16/2020", "11/16/2020", "11/16/2020"),
	("LU", "18", 15550.00, "advance", "11/17/2020", "11/17/2020", "11/17/2020"),
	("LU", "19", 14762.31, "advance", "11/18/2020", "11/18/2020", "11/18/2020"),
	("LU", "20", 17361.25, "advance", "11/20/2020", "11/20/2020", "11/20/2020"),
	("LU", "21", 58905.00, "advance", "11/23/2020", "11/23/2020", "11/23/2020"),
	("LU", "22", 29295.00, "advance", "11/25/2020", "11/25/2020", "11/25/2020"),
	("LU", "23", 55488.24, "advance", "11/25/2020", "11/25/2020", "11/25/2020"),
	("LU", "24", 30915.50, "advance", "12/7/2020", "12/7/2020", "12/7/2020"),
]

def import_settled_advances_leune(session: Session) -> None:
	advances_count = len(ADVANCE_TUPLES)
	print(f'Running for {advances_count} advances...')

	for index, new_advance_tuple in enumerate(ADVANCE_TUPLES):
		customer_identifier, loan_identifier, amount, payment_type, payment_date, deposit_date, settlement_date = new_advance_tuple

		parsed_payment_date = date_util.load_date_str(payment_date)
		parsed_deposit_date = date_util.load_date_str(deposit_date)
		parsed_settlement_date = date_util.load_date_str(settlement_date)
		parsed_settled_at = datetime.combine(date_util.load_date_str(settlement_date), time())

		if (
			not amount or
			amount <= 0 or
			not parsed_payment_date or
			not parsed_deposit_date or
			not parsed_settlement_date
		):
			print(f'[{index + 1} of {advances_count}] Invalid advance field(s)')
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
			print(f'[{index + 1} of {advances_count}] Customer with identifier {customer_identifier} does not exist')
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
			print(f'[{index + 1} of {advances_count}] Loan with identifier {loan_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		if not number_util.float_eq(loan.amount, amount):
			print(f'[{index + 1} of {advances_count}] Loan with identifer {loan_identifier} but incorrect amount exists')
			print(f'EXITING EARLY')
			return

		if loan.origination_date != parsed_settlement_date:
			print(f'[{index + 1} of {advances_count}] Loan with identifer {loan_identifier} but incorrect origination date exists')
			print(f'EXITING EARLY')
			return

		parsed_payment_type = None
		if payment_type == 'advance':
			parsed_payment_type = PaymentType.ADVANCE

		if parsed_payment_type != PaymentType.ADVANCE:
			print(f'[{index + 1} of {advances_count}] Invalid advance field(s)')
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
			print(f'[{index + 1} of {advances_count}] Advance on loan {loan_identifier} with settlement date {settlement_date} already exists')
			continue
		else:
			print(f'[{index + 1} of {advances_count}] Advance on loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

			advance = models.Payment(
				company_id=customer.id,
				type=PaymentType.ADVANCE,
				method=PaymentMethodEnum.UNKNOWN,
				amount=amount,
				payment_date=parsed_payment_date,
				deposit_date=parsed_deposit_date,
				settlement_date=parsed_settlement_date,
				submitted_at=parsed_settled_at, # Set submitted_at to settled_at.
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

			print(f'[{index + 1} of {advances_count}] Created advance on loan {loan_identifier} for {customer.name} ({customer.identifier})')

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
