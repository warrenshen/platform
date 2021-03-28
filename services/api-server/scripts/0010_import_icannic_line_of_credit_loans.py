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
from bespoke.finance import contract_util, number_util

# customer_identifier, loan_identifier, loan_type, is_credit_for_vendor, recipient_vendor_name, amount, origination_date, funded_date
LOAN_TUPLES = [
	("IC", "1", "line_of_credit", "FALSE", "", 185000.00, "6/10/2020", "6/10/2020"),
	("IC", "2", "line_of_credit", "FALSE", "", 100000.00, "8/13/2020", "8/13/2020"),
	("IC", "3", "line_of_credit", "FALSE", "", 40000.00, "10/19/2020", "10/19/2020"),
]

def import_line_of_credit_loans_icannic(session: Session) -> None:
	loans_count = len(LOAN_TUPLES)
	print(f'Running for {loans_count} loans...')

	for index, new_loan_tuple in enumerate(LOAN_TUPLES):
		print(f'[{index + 1} of {loans_count}]')
		customer_identifier, loan_identifier, loan_type, is_credit_for_vendor, recipient_vendor_name, amount, origination_date, funded_date = new_loan_tuple

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
		if loan_type == 'line_of_credit':
			parsed_loan_type = LoanTypeEnum.LINE_OF_CREDIT

		if parsed_loan_type not in ALL_LOAN_TYPES:
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s): loan_type')
			print(f'EXITING EARLY')
			return

		parsed_origination_date = date_util.load_date_str(origination_date)
		parsed_funded_at = datetime.combine(date_util.load_date_str(funded_date), time())

		parsed_is_credit_for_vendor = None
		if is_credit_for_vendor == 'TRUE':
			parsed_is_credit_for_vendor = True
		elif is_credit_for_vendor == 'FALSE':
			parsed_is_credit_for_vendor = False
		else:
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s): is_credit_for_vendor')
			print(f'EXITING EARLY')
			return

		vendor_id = None

		if parsed_is_credit_for_vendor:
			vendor = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.company_type == CompanyType.Vendor
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
			session.query(models.Contract).filter(
				models.Contract.company_id == customer.id
			).all())
		if not contracts:
			print(f'[{index + 1} of {loans_count}] No contracts are setup for {customer.name}')
			print(f'EXITING EARLY')
			return

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
		if err:
			print(f'[{index + 1} of {repayments_count}] Repayment on loan {loan_identifier} failed because of error with ContractHelper: {err}')
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
			not amount or
			amount <= 0 or
			not adjusted_maturity_date or
			not parsed_origination_date or
			not parsed_funded_at
		):
			print(f'[{index + 1} of {loans_count}] Invalid loan field(s)')
			print(f'EXITING EARLY')
			return

		print(f'[{index + 1} of {loans_count}] Loan {loan_identifier} for {customer.name} ({customer.identifier}) does not exist, creating it...')

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
			identifier=loan_identifier,
			loan_type=parsed_loan_type,
			artifact_id=artifact_id,
			status=LoanStatusEnum.APPROVED, # Set status to APPROVED. If this loan is actually closed, a script that imports repayments will handle that.
			origination_date=parsed_origination_date,
			maturity_date=adjusted_maturity_date, # Default maturity_date to adjusted_maturity_date.
			adjusted_maturity_date=adjusted_maturity_date,
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
		import_line_of_credit_loans_icannic(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
