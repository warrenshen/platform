"""
    A script to collect all customer reports and provide them to the Finance
    team in a CSV format for them to use in Excel spreadsheets.
"""
import os
import logging

from dotenv import load_dotenv
from typing import List, cast

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.reports import per_customer
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

    logging.info('There are {} companies in our database'.format(len(company_dicts)))
    # Run a report per customer
    for company_dict in company_dicts:
        fetcher = per_customer.Fetcher(company_dict, session_maker)
        _, err = fetcher.fetch()
        if err:
            logging.error('Error fetching for company "{}". Error: {}'.format(
                company_dict['name'], err
            ))
            continue
        logging.info(fetcher.summary())

    pass

if __name__ == '__main__':
    main()