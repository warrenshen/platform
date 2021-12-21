'''
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script resets the delivery_type column of relevant company deliveries.
It additionally sets the payor_id and vendor_id columns if appropriate.

Why:
You can run this script to fix incorrect values in the delivery_type column of company deliveries in the database.
'''

import argparse
import os
import sys
import time
from os import path
from typing import Any, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../../src')))
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../')))

from bespoke.companies import licenses_util
from bespoke.db import models

def main(is_test_run: bool, license_number: str) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_license_id = None

	with models.session_scope(session_maker) as session:
		company_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.license_number == license_number
			).first())

		if not company_license:
			print('ERROR! No company license exists for given license number')
			return
		else:
			company_license_id = str(company_license.id)

	print(f'Updating metrc rows on license change for license {license_number}...')
	if not is_test_run:
		licenses_util.update_metrc_rows_on_license_change(
			licenses_util.LicenseModificationDict(
				license_row_id=company_license_id,
				license_number=license_number,
				op='INSERT'
			),
			session_maker
		)

parser = argparse.ArgumentParser()
parser.add_argument('license_number', help='License number to perform action on')

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

	main(is_test_run=is_test_run, license_number=args.license_number)
