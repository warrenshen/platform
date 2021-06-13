"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		company_agreements = cast(
			List[models.CompanyAgreement],
			session.query(models.CompanyAgreement).all())

		company_agreements_count = len(company_agreements)

		for index, company_agreement in enumerate(company_agreements):
			print(f'[{index + 1} of {company_agreements_count}]')
			file = cast(
				models.File,
				session.query(models.File).get(company_agreement.file_id))

			# If there is no file, then the company agreement is not valid.
			if not file:
				# If the company agreement is related to a company vendor partnership,
				# clear that association before the delete company agreement action.
				company_vendor_partnerships = cast(
					models.CompanyVendorPartnership,
					session.query(models.CompanyVendorPartnership).filter_by(
						vendor_agreement_id=company_agreement.id
					))

				for company_vendor_partnership in company_vendor_partnerships:
					print(f'[{index + 1} of {company_agreements_count}] Company agreement is not valid and is associated with company vendor partnership, clearing out the association...')
					company_vendor_partnership.vendor_agreement_id = None

				print(f'[{index + 1} of {company_agreements_count}] Company agreement does not have a valid file, deleting company agreement...')
				session.delete(company_agreement)

if __name__ == "__main__":
	main()
