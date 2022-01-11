"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/
"""

import os
import sys
import time
import traceback
from os import path
from typing import List, cast
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from sqlalchemy.orm.session import Session
from bespoke.db import models

# company_identifier: [(license_number, facility_name)]
company_identifier_to_license_facilities = {
	'EM': [
		('C10-0000695-LIC', 'Embarc Tahoe'),
		('C10-0000774-LIC', 'Embarc Alameda'),
		('C10-0000786-LIC', 'Embarc Martinez'),
	]
}

def main(is_test_run: bool = True):
	load_dotenv(os.path.join("../..", '.env'))

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_identifiers = list(company_identifier_to_license_facilities.keys())

	company_identifier_to_company = {}
	with models.session_scope(session_maker) as session:
		companies = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.identifier.in_(company_identifiers)
			).all())

		for c in companies:
			company_identifier_to_company[c.identifier] = c.as_dict()

	for company_identifier in company_identifiers:

		with models.session_scope(session_maker) as session:
			print('Processing company_facilities for {}'.format(company_identifier))
			company = company_identifier_to_company[company_identifier]
			license_facility_list = company_identifier_to_license_facilities[company_identifier]
			license_numbers = [license_number for (license_number, facility_name) in license_facility_list]

			try:
				prev_company_facilities = cast(
					List[models.CompanyFacility],
					session.query(models.CompanyFacility).filter(
						models.CompanyFacility.company_id == company['id']
					).all())
				facility_name_to_facility = {}
				for company_facility in prev_company_facilities:
					facility_name_to_facility[company_facility.name] = company_facility

				prev_company_licenses = cast(
					List[models.CompanyLicense],
					session.query(models.CompanyLicense).filter(
						models.CompanyLicense.license_number.in_(license_numbers)
					).all())
				license_number_to_license = {}
				for company_license in prev_company_licenses:
					license_number_to_license[company_license.license_number] = company_license

				for (license_number, facility_name) in license_facility_list:
					if license_number not in license_number_to_license:
						raise Exception('License number {} is not stored in the DB associated with {}. Please add and re-run'.format(
							license_number, company_identifier))

					license = license_number_to_license[license_number]
					prev_facility = facility_name_to_facility.get(facility_name)

					if is_test_run:
						print('Not doing anything because CONFIRM=1 is not included')
						continue

					if license.facility_row_id:
						# License has a pre-existing facility associated with it
						print('Company identifier {}, License {} already has a facility associated with it, skipping'.format(
							company_identifier, license.license_number))
						pass
					else:
						# License has never had a facility associated with it
						facility_row_id = None
						if prev_facility:
							facility_row_id = str(prev_facility.id)
						else:
							new_company_facility = models.CompanyFacility()
							new_company_facility.name = facility_name
							new_company_facility.address = ''
							new_company_facility.company_id = company['id']
							session.add(new_company_facility)
							session.flush()
							facility_row_id = str(new_company_facility.id)
							facility_name_to_facility[facility_name] = new_company_facility
							print('Creating facility {} for license {}'.format(
								license_number, facility_name))

						license.facility_row_id = facility_row_id

			except Exception as e:
				print(e)
				print(traceback.format_exc())
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

if __name__ == '__main__':
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run)
