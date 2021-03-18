import os
import sys
from os import path
from typing import List, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.db import models
from bespoke.db.db_constants import CompanyType


def backfill_loan_identifiers(session: Session) -> None:
    customers = cast(
        List[models.Company],
        session.query(models.Company).filter(
            models.Company.company_type == CompanyType.Customer
        ).all())

    customers_count = len(customers)
    print(f'Running for {customers_count} customers...')

    for index, customer in enumerate(customers):
        loans = cast(
            List[models.Loan],
            session.query(models.Loan).filter(
                models.Loan.company_id == customer.id
            ).filter(
                models.Loan.identifier == None
            ).all())

        print(f'[{index + 1} of {customers_count}] For customer {customer.name}, found {len(loans)} loans that do not have an identifier')

        if len(loans) <= 0:
            continue

        latest_loan_identifier = customer.latest_loan_identifier

        loans_count = len(loans)
        for loan in loans:
            latest_loan_identifier += 1
            loan.identifier = str(latest_loan_identifier)
            print(f'Updated loan {loan.id} identifier to "{latest_loan_identifier}"')

        session.flush()

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		backfill_loan_identifiers(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
