"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

def main(is_test_run: bool) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		deleted_company_licenses = cast(
			List[models.CompanyLicense],
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.is_deleted.is_(True)
			).all())

		print(f'Found {len(deleted_company_licenses)} company licenses to delete')

		for deleted_company_license in deleted_company_licenses:
			print(f'Deleting company license {deleted_company_license.license_number}...')

			metrc_transfers = cast(
				List[models.MetrcTransfer],
				session.query(models.MetrcTransfer).filter(
					models.MetrcTransfer.license_id == deleted_company_license.id
				).all())

			print(f'Company license {deleted_company_license.license_number} is related to {len(metrc_transfers)} transfers...')

			for metrc_transfer in metrc_transfers:
				if not is_test_run:
					metrc_transfer.license_id = None

			if not deleted_company_license.is_deleted:
				print(f'[ERROR] Company license is not deleted')
				print(f'EXITING EARLY')
				return

			if not is_test_run:
				session.delete(deleted_company_license)

if __name__ == "__main__":
	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script DELETES information in the database")
		print("You must set 'CONFIRM' in the environment to actually perform deletes in this script")
	else:
		is_test_run = False

	main(is_test_run)
