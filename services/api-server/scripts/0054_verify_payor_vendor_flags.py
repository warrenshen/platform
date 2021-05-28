"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		company_vendor_partnerships = cast(
			List[models.CompanyVendorPartnership],
			session.query(models.CompanyVendorPartnership).all())

		company_vendor_partnership_count = len(company_vendor_partnerships)

		print(f'Verifying vendors of {company_vendor_partnership_count} partnerships...')
		for index, company_vendor_partnership in enumerate(company_vendor_partnerships):
			print(f'[{index + 1} of {company_vendor_partnership_count}]')

			vendor = cast(
				models.Company,
				session.query(models.Company).get(company_vendor_partnership.vendor_id)
			)

			if vendor.is_vendor is not True:
				print(f'[{index + 1} of {company_vendor_partnership_count}] Found vendor company with is_vendor flag set to False, setting to True...')
				vendor.is_vendor = True

		company_payor_partnerships = cast(
			List[models.CompanyPayorPartnership],
			session.query(models.CompanyPayorPartnership).all())

		company_payor_partnerships_count = len(company_payor_partnerships)

		print(f'Verifying payors of {company_payor_partnerships_count} partnerships...')
		for index, company_payor_partnership in enumerate(company_payor_partnerships):
			print(f'[{index + 1} of {company_payor_partnerships_count}]')

			payor = cast(
				models.Company,
				session.query(models.Company).get(company_payor_partnership.payor_id)
			)

			if payor.is_payor is not True:
				print(f'[{index + 1} of {company_payor_partnerships_count}] Found payor company with is_payor flag set to False, setting to True...')
				payor.is_payor = True

		print('Finished')

if __name__ == "__main__":
	main()
