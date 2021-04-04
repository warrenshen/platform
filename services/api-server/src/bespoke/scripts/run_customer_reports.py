"""
	A script to collect all customer reports and provide them to the Finance
	team in a CSV format for them to use in Excel spreadsheets.
"""
import os
import logging

from dotenv import load_dotenv
from pathlib import Path
from typing import List, cast

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.reports import per_customer
from bespoke.finance.fetchers import per_customer_fetcher
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
	# Run a report per customer
	for company_dict in company_dicts:
		company_name = company_dict['name']
		fetcher = per_customer_fetcher.Fetcher(company_dict, session_maker, ignore_deleted=True)
		_, err = fetcher.fetch()
		if err:
			logging.error('Error fetching for company "{}". Error: {}'.format(
				company_name, err
			))
			continue

		filename = f'report_{company_name}'.replace(' ', '_').replace(',', '').replace('.', '')
		filename = filename + '.xls'
		logging.info(fetcher.summary() + '\n')
		financial_info = fetcher.get_financials()
		excel_creator = per_customer.ExcelCreator(financial_info)
		excel_creator.populate()
		
		with open(f'out/{filename}', 'wb') as f:
			excel_creator.wb.save(f)

	# Done

if __name__ == '__main__':
	main()