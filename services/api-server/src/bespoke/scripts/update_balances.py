"""
	A script to collect all customer reports and provide them to the Finance
	team in a CSV format for them to use in Excel spreadsheets.
"""
import os
import logging

from dotenv import load_dotenv
from pathlib import Path
from typing import List, cast

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.reports import loan_balances
load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
					datefmt='%m/%d/%Y %H:%M:%S',
					level=logging.INFO)

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_dicts = []
	with session_scope(session_maker) as session:
		# Find customers to run reports for
		companies = cast(
			List[models.Company],
			session.query(models.Company).all())
		company_dicts = [company.as_dict() for company in companies]

	Path('out').mkdir(exist_ok=True)

	logging.info('There are {} companies in our database'.format(len(company_dicts)))

	# Update balances per customer
	for company_dict in company_dicts:
		company_name = company_dict['name']
		customer_balance = loan_balances.CustomerBalance(company_dict, session_maker)
		updates, err = customer_balance.update(today=date_util.today_as_date())
		if err:
			logging.error('Error updating customer balance for company "{}". Error: {}'.format(
				company_name, err
			))
			continue

		customer_balance.write(updates)

	# Done

if __name__ == '__main__':
	main()
