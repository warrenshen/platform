import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType, PaymentType
from bespoke.finance import contract_util, number_util


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		print(f'Running...')

		customer = session.query(models.Company).filter(
			models.Company.is_customer == True
		).filter(
			models.Company.identifier == 'CAN'
		).first()


		print(f'Found customer {customer.name} ({customer.identifier})...')

		# Get oustanding loans.
		loans = session.query(models.Loan).filter(
			models.Loan.company_id == customer.id
		).filter(
			models.Loan.origination_date.isnot(None)
		).filter(
			models.Loan.maturity_date.isnot(None)
		).filter(
			models.Loan.closed_at.is_(None)
		).order_by(
			models.Loan.origination_date.asc()
		).all()

		contracts = session.query(models.Contract).filter(
			models.Contract.company_id == customer.id
		).all()
		if not contracts:
			raise errors.Error('No contracts are set up')

		contract_dicts = [c.as_dict() for c in contracts]

		contract_helper, err = contract_util.ContractHelper.build(customer.id, contract_dicts)
		if err:
			raise err

		active_contract, err = contract_helper.get_contract(date_util.today_as_date())
		if err:
			raise err
		if not active_contract:
			raise errors.Error('No active contract on settlement date')

		for index, loan in enumerate(loans):
			maturity_date, err = active_contract.get_maturity_date(loan.origination_date)
			if err:
				raise err

			adjusted_maturity_date, err = active_contract.get_adjusted_maturity_date(loan.origination_date)
			if err:
				raise err

			print(f'[{index + 1} of {len(loans)}] Updating loan {loan.disbursement_identifier} (disbursement) maturity date to {date_util.human_readable_yearmonthday(maturity_date)} and adjusted maturity date to {date_util.human_readable_yearmonthday(adjusted_maturity_date)}...')

			loan.maturity_date = maturity_date
			loan.adjusted_maturity_date = adjusted_maturity_date

		print(f'Complete')

if __name__ == "__main__":
	main()
