"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/
"""

import argparse
import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../../src")))

from bespoke.db import models, queries

from sqlalchemy.orm.session import Session

def create_blaze_shop_entry(
    session: Session,
	is_test_run: bool,
	external_blaze_shop_id: str,
    company_id: str,
) -> None:
    company, err = queries.get_company_by_id(
        session=session,
        company_id=company_id,
    )

    if err or not company:
        print(f'Company does not exist')
        print(f'EXITING EARLY')
        return

    existing_blaze_shop_entry = cast(
        models.BlazeShopEntry,
        session.query(models.BlazeShopEntry).filter(
            models.BlazeShopEntry.external_blaze_shop_id == external_blaze_shop_id
        ).filter(
            models.BlazeShopEntry.company_id == company_id
        ).first())

    if existing_blaze_shop_entry:
        print(f'Blaze shop entry already exists')
        print(f'EXITING EARLY')
        return

    if not is_test_run:
        blaze_shop_entry = models.BlazeShopEntry(
            external_blaze_shop_id=external_blaze_shop_id,
            company_id=company_id,
        )
        session.add(blaze_shop_entry)

    print(f'Created shop entry ({external_blaze_shop_id}, {company_id})')

def main(
	is_test_run: bool,
	external_blaze_shop_id: str,
    company_id: str,
) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	print(f'Beginning import...')

	with models.session_scope(session_maker) as session:
		create_blaze_shop_entry(
            session,
            is_test_run,
            external_blaze_shop_id,
            company_id,
        )

	print(f'Finished import')

parser = argparse.ArgumentParser()
parser.add_argument('external_blaze_shop_id', help='Blaze shop ID')
parser.add_argument('company_id', help='Bespoke Financial company ID')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get('CONFIRM'):
		print('This script CHANGES information in the database')
		print('You must set "CONFIRM=1" as an environment variable to actually perform database changes with this script')
	else:
		is_test_run = False

	main(
        is_test_run=is_test_run,
        external_blaze_shop_id=args.external_blaze_shop_id,
        company_id=args.company_id,
    )
