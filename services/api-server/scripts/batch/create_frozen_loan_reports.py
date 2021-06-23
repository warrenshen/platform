"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/

What:
This script creates loan reports for frozen loans.

Why:
You can run this script to create loan reports for frozen loans in the database.
"""

import decimal
import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.date import date_util
from bespoke.finance import number_util
from bespoke.finance.reports import loan_balances

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	customer_dicts = []

	with models.session_scope(session_maker) as session:
		customers = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).all())

		customer_dicts += [customer.as_dict() for customer in customers]
		print(len(customer_dicts))

	for customer_dict in customer_dicts:
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

if __name__ == "__main__":
	main()
