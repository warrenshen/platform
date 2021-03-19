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

# customer_identifier, loan_identifier, payment_type, deposit_date, settlement_date, amount, to_principal, to_interest, to_fees, wire_fee
REPAYMENT_TUPLES = [
	("LU", "1", "repayment", "7/27/2020", "7/28/2020", 69908.15, 68120.00, 1788.15, 0.00, 0.00),
	("LU", "2A", "repayment", "7/27/2020", "7/28/2020", 38855.00, 38000.00, 855.00, 0.00, 0.00),
	("LU", "2B", "repayment", "7/27/2020", "7/28/2020", 42945.00, 42000.00, 945.00, 0.00, 0.00),
	("LU", "3", "repayment", "7/27/2020", "7/28/2020", 22201.95, 21971.25, 230.70, 0.00, 0.00),
	("LU", "4", "repayment", "7/27/2020", "7/28/2020", 19180.72, 18981.42, 199.30, 0.00, 0.00),
	("LU", "5", "repayment", "7/27/2020", "7/28/2020", 10516.63, 10453.91, 62.72, 0.00, 0.00),
	("LU", "6", "repayment", "12/11/2020", "12/14/2020", 21425.00, 20000.00, 1425.00, 0.00, 0.00),
	("LU", "7", "repayment", "12/11/2020", "12/14/2020", 44772.00, 42000.00, 2772.00, 0.00, 0.00),
	("LU", "8", "repayment", "12/11/2020", "12/14/2020", 16293.88, 15317.40, 976.48, 0.00, 0.00),
	("LU", "9A", "repayment", "12/11/2020", "12/14/2020", 4859.64, 4581.32, 278.32, 0.00, 0.00),
	("LU", "9B", "repayment", "1/19/2021", "1/20/2021", 34995.28, 32150.00, 2845.28, 0.00, 0.00),
	("LU", "10A", "repayment", "1/19/2021", "1/20/2021", 19593.00, 18000.00, 1593.00, 0.00, 0.00),
	("LU", "10B", "repayment", "12/11/2020", "12/14/2020", 21215.00, 20000.00, 1215.00, 0.00, 0.00),
	("LU", "11A", "repayment", "1/28/2021", "1/29/2021", 7237.60, 6640.00, 597.60, 0.00, 0.00),
	("LU", "11B", "repayment", "1/28/2021", "1/29/2021", 56127.53, 51493.15, 4634.38, 0.00, 0.00),
	("LU", "11C", "repayment", "1/28/2021", "1/29/2021", 904.70, 830.00, 74.70, 0.00, 0.00),
	("LU", "12", "repayment", "2/10/2021", "2/11/2021", 30077.98, 27575.50, 2502.48, 0.00, 0.00),
	("LU", "13", "repayment", "2/10/2021", "2/11/2021", 8087.80, 7420.00, 667.80, 0.00, 0.00),
	("LU", "14", "repayment", "2/26/2021", "3/1/2021", 10298.00, 9467.25, 830.75, 0.00, 0.00),
	("LU", "15A", "repayment", "2/26/2021", "3/1/2021", 3377.41, 3122.17, 255.24, 0.00, 0.00),
	("LU", "15B", "repayment", "2/26/2021", "3/1/2021", 5936.64, 5488.00, 448.64, 0.00, 0.00),
	("LU", "16", "repayment", "2/26/2021", "3/1/2021", 4955.23, 4590.30, 364.93, 0.00, 0.00),
	("LU", "17", "repayment", "2/26/2021", "3/1/2021", 32429.93, 30041.62, 2388.31, 0.00, 0.00),
	("LU", "18", "repayment", "2/26/2021", "3/1/2021", 16774.56, 15550.00, 1224.56, 0.00, 0.00),
	("LU", "19", "repayment", "2/26/2021", "3/1/2021", 15913.77, 14762.31, 1151.46, 0.00, 0.00),
	("LU", "20", "repayment", "2/26/2021", "3/1/2021", 10314.46, 8986.32, 1328.14, 0.00, 0.00),
	("LU", "20", "repayment", "3/10/2021", "3/11/2021", 8437.74, 8374.93, 62.81, 0.00, 0.00),
	("LU", "21", "repayment", "3/10/2021", "3/11/2021", 63720.48, 58905.00, 4815.48, 0.00, 0.00),
	("LU", "22", "repayment", "3/10/2021", "3/11/2021", 31645.92, 29295.00, 2350.92, 0.00, 0.00),
	("LU", "23", "repayment", "3/10/2021", "3/11/2021", 59941.17, 55488.24, 4452.93, 0.00, 0.00),
	("LU", "24", "repayment", "3/10/2021", "3/11/2021", 33118.23, 30915.50, 2202.73, 0.00, 0.00),
]

def import_settled_repayments_leune(session: Session) -> None:
	repayments_count = len(REPAYMENT_TUPLES)
	print(f'Running for {repayments_count} repayments...')

	for index, new_repayment_tuple in enumerate(REPAYMENT_TUPLES):
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

			# TODO(warrenshen): loan up a LoanCalculator and check if loan is correctly closed.
			# If so, set loan.closed_at to parsed_settled_at. Otherwise, continue.

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_settled_repayments_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
