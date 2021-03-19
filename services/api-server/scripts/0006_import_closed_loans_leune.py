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
                                     LoanStatusEnum, LoanTypeEnum)
from bespoke.finance import number_util

# customer_identifier, loan_identifier, loan_type, artifact_identifier, amount, origination_date, maturity_date, adjusted_maturity_date, funded_date
LOAN_TUPLES = [
	("LU", "1", "Inventory", "INV-1000", 68120.00, "6/24/2020", "10/22/2020", "10/22/2020", "6/24/2020"),
	("LU", "2A", "Inventory", "3205178", 38000.00, "6/29/2020", "10/27/2020", "10/27/2020", "6/29/2020"),
	("LU", "2B", "Inventory", "3205838", 42000.00, "6/29/2020", "10/27/2020", "10/27/2020", "6/29/2020"),
	("LU", "3", "Inventory", "SO165093", 21971.25, "7/15/2020", "11/12/2020", "11/12/2020", "7/15/2020"),
	("LU", "4", "Inventory", "1-HM", 18981.42, "7/15/2020", "11/12/2020", "11/12/2020", "7/15/2020"),
	("LU", "5", "Inventory", "1-TN", 10453.91, "7/21/2020", "11/18/2020", "11/18/2020", "7/21/2020"),
	("LU", "6", "Inventory", "3233199", 20000.00, "9/11/2020", "1/9/2021", "1/8/2021", "9/11/2020"),
	("LU", "7", "Inventory", "3235081", 42000.00, "9/18/2020", "1/16/2021", "1/15/2021", "9/18/2020"),
	("LU", "8", "Inventory", "PO-00046", 15317.40, "9/21/2020", "1/19/2021", "1/19/2021", "9/21/2020"),
	("LU", "9A", "Inventory", "2-HM", 4581.32, "9/25/2020", "1/23/2021", "1/25/2021", "9/25/2020"),
	("LU", "9B", "Inventory", "4-HM", 32150.00, "9/25/2020", "1/23/2021", "1/25/2021", "9/25/2020"),
	("LU", "10A", "Inventory", "3321950", 18000.00, "9/25/2020", "1/23/2021", "1/25/2021", "9/25/2020"),
	("LU", "10B", "Inventory", "3325869", 20000.00, "9/25/2020", "1/23/2021", "1/25/2021", "9/25/2020"),
	("LU", "11A", "Inventory", "INV108383", 6640.00, "10/2/2020", "1/30/2021", "2/1/2021", "10/2/2020"),
	("LU", "11B", "Inventory", "INV108233", 51493.15, "10/2/2020", "1/30/2021", "2/1/2021", "10/2/2020"),
	("LU", "11C", "Inventory", "INV108690", 830.00, "10/2/2020", "1/30/2021", "2/1/2021", "10/2/2020"),
	("LU", "12", "Inventory", "3-08/20/2020", 27575.50, "10/14/2020", "2/11/2021", "2/11/2021", "10/14/2020"),
	("LU", "13", "Inventory", "VetsLeaf-2", 7420.00, "10/15/2020", "2/12/2021", "2/12/2021", "10/15/2020"),
	("LU", "14", "Inventory", "INV110240", 9467.25, "11/5/2020", "3/5/2021", "3/5/2021", "11/5/2020"),
	("LU", "15A", "Inventory", "Vets-2", 3122.17, "11/13/2020", "3/13/2021", "3/15/2021", "11/13/2020"),
	("LU", "15B", "Inventory", "Vets-3", 5488.00, "11/13/2020", "3/13/2021", "3/15/2021", "11/13/2020"),
	("LU", "16", "Inventory", "INV-000313", 4590.30, "11/16/2020", "3/16/2021", "3/16/2021", "11/16/2020"),
	("LU", "17", "Inventory", "Hum Made-4", 30041.62, "11/16/2020", "3/16/2021", "3/16/2021", "11/16/2020"),
	("LU", "18", "Inventory", "Hum Made-5", 15550.00, "11/17/2020", "3/17/2021", "3/17/2021", "11/17/2020"),
	("LU", "19", "Inventory", "Vets-1.3", 14762.31, "11/18/2020", "3/18/2021", "3/18/2021", "11/18/2020"),
	("LU", "20", "Inventory", "INV-000217", 17361.25, "11/20/2020", "3/20/2021", "3/22/2021", "11/20/2020"),
	("LU", "21", "Inventory", "25933", 58905.00, "11/23/2020", "3/23/2021", "3/23/2021", "11/23/2020"),
	("LU", "22", "Inventory", "6", 29295.00, "11/25/2020", "3/25/2021", "3/25/2021", "11/25/2020"),
	("LU", "23", "Inventory", "RR696", 55488.24, "11/25/2020", "3/25/2021", "3/25/2021", "11/25/2020"),
	("LU", "24", "Inventory", "INV-000254", 30915.50, "12/7/2020", "4/6/2021", "4/6/2021", "12/7/2020"),
]

def import_closed_loans_leune(session: Session) -> None:
	loans_count = len(LOAN_TUPLES)
	print(f'Running for {loans_count} loans...')

	for index, new_loan_tuple in enumerate(LOAN_TUPLES):
		customer_identifier, loan_identifier, loan_type, artifact_identifier, amount, origination_date, maturity_date, adjusted_maturity_date, funded_date = new_loan_tuple

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == customer_identifier
			).first())

		if not customer:
			print(f'[{index + 1} of {loans_count}] Customer with identifier {customer_identifier} does not exist')
			print(f'EXITING EARLY')
			return

		existing_loan = cast(
			models.Loan,
			session.query(models.Loan).filter(
				models.Loan.company_id == customer.id,
			).filter(
				models.Loan.identifier == loan_identifier
			).first())

		if existing_loan:
			if not number_util.float_eq(existing_loan.amount, amount):
				# If there is an existing loan with a different amount, this indicates
				# that there is a pre-existing valid loan created for this customer. This is not
				# supposed to happen on production, as we plan to import historical closed loans prior
				# to the platform going live, but may happen on local or staging. In this case,
				# suffix the identifier of pre-existing loan with an "A" character and continue.
				print(f'[{index + 1} of {loans_count}] Loan with identifer {loan_identifier} but different amount exists')
				existing_loan.identifier = loan_identifier + 'A'
				session.flush()
			else:
				print(f'[{index + 1} of {loans_count}] Loan with identifer {loan_identifier} already exists')
				continue

		parsed_loan_type = None
		if loan_type == 'Inventory':
			parsed_loan_type = LoanTypeEnum.INVENTORY

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
					models.PurchaseOrder.order_number == artifact_identifier
				).first())

			if not existing_purchase_order:
				print(f'[{index + 1} of {loans_count}] Purchase order with identifier {artifact_identifier} does not exist')
				print(f'EXITING EARLY')
				return
			else:
				artifact_id = existing_purchase_order.id

		parsed_origination_date = date_util.load_date_str(origination_date)
		parsed_maturity_date = date_util.load_date_str(maturity_date)
		parsed_adjusted_maturity_date = date_util.load_date_str(adjusted_maturity_date)
		parsed_funded_at = datetime.combine(date_util.load_date_str(funded_date), time())

		if (
			not artifact_id or
			not amount or
			amount <= 0 or
			not parsed_origination_date or
			not parsed_maturity_date or
			not parsed_adjusted_maturity_date or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {loans_count}] Loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')
		loan = models.Loan(
			company_id=customer.id,
			identifier=loan_identifier,
			loan_type=parsed_loan_type,
			artifact_id=artifact_id,
			status=LoanStatusEnum.CLOSED,
			origination_date=parsed_origination_date,
			maturity_date=parsed_maturity_date,
			adjusted_maturity_date=parsed_adjusted_maturity_date,
			amount=amount,
			requested_at=parsed_funded_at, # Set requested_at to funded_at.
			approved_at=parsed_funded_at, # Set approved_at to funded_at.
			funded_at=parsed_funded_at,
			closed_at=None, # Note we leave closed_at to None; when payments are imported in, we will set this field.
		)
		session.add(loan)

		print(f'[{index + 1} of {loans_count}] Created loan {loan_identifier} for {customer.name} ({customer.identifier})')

		numeric_loan_identifier = int("".join(filter(str.isdigit, loan_identifier)))
		customer_latest_loan_identifier = customer.latest_loan_identifier

		new_latest_loan_identifier = max(numeric_loan_identifier, customer_latest_loan_identifier)
		customer.latest_loan_identifier = new_latest_loan_identifier

		print(f'Customer {customer.name} latest_loan_identifier is now "{new_latest_loan_identifier}"')
		session.flush()


def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_closed_loans_leune(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
