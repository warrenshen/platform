"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import argparse
import os
import sys
from os import path
from typing import Any, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models

def main(
	is_test_run: bool,
	from_company_identifier: str,
	to_company_identifier: str,
) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		from_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == from_company_identifier
			).first())

		if not from_company:
			raise errors.Error(f'No company found with identifier {from_company_identifier} (from_company_identifier)')

		to_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == to_company_identifier
			).first())

		if not to_company:
			raise errors.Error(f'No company found with identifier {to_company_identifier} (to_company_identifier)')

		print(f'Ready to copy vendor partnerships... found from company {from_company.name} ({from_company_identifier}) and to company {to_company.name} ({to_company_identifier})')

		if not is_test_run:
			print(f'Copying vendor partnerships from company {from_company.name} ({from_company_identifier}) to company {to_company.name} ({to_company_identifier})...')

		from_vendor_partnerships = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter(
				models.CompanyVendorPartnership.company_id == str(from_company.id)
			).all())

		for from_vendor_partnership in from_vendor_partnerships:
			vendor_id = str(from_vendor_partnership.vendor_id)

			vendor = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == vendor_id
				).first())

			existing_to_vendor_partnership = cast(
				models.CompanyVendorPartnership,
				session.query(models.CompanyVendorPartnership).filter(
					models.CompanyVendorPartnership.company_id == str(to_company.id)
				).filter(
					models.CompanyVendorPartnership.vendor_id == vendor_id
				).first())

			if existing_to_vendor_partnership:
				print(f'Vendor partnership between to company {to_company.name} ({to_company_identifier}) and vendor {vendor.name} already exists, skipping...')
				continue

			print(f'Vendor partnership between to company {to_company.name} ({to_company_identifier}) and vendor {vendor.name} does not exist, creating it...')
			if not is_test_run:
				new_to_vendor_partnership = models.CompanyVendorPartnership(
					company_id=to_company.id,
					vendor_id=vendor_id,
					vendor_bank_id=from_vendor_partnership.vendor_bank_id,
					approved_at=date_util.now() if from_vendor_partnership.approved_at != None else None,
				)
				session.add(new_to_vendor_partnership)

		print(f'Successful copy!')

parser = argparse.ArgumentParser()
parser.add_argument('from_company_identifier', help='Identifier of company to perform action from')
parser.add_argument('to_company_identifier', help='Identifier of company to perform action to')

if __name__ == "__main__":
	args = parser.parse_args()

	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(
		is_test_run=is_test_run,
		from_company_identifier=args.from_company_identifier,
		to_company_identifier=args.to_company_identifier,
	)
