"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path
from typing import Any, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke import errors
from bespoke.db import models

DEDUPE_TUPLES = [
	# Old parent company is merged INTO new parent company.
	# (new_parent_company_id, old_parent_company_id)
]

def main(is_test_run: bool = True) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	rows_count = len(DEDUPE_TUPLES)

	for index, row in enumerate(DEDUPE_TUPLES):
		print(f'[{index + 1} of {rows_count}]')

		new_parent_company_id = row[0]
		old_parent_company_id = row[1]

		print(f'[{index + 1} of {rows_count}] Begin process to merge old parent company {old_parent_company_id} into new parent company {new_parent_company_id}')

		with models.session_scope(session_maker) as session:
			new_parent_company = cast(
				models.ParentCompany,
				session.query(models.ParentCompany).filter(
					models.ParentCompany.id == new_parent_company_id
				).first())

			if not new_parent_company:
				raise errors.Error(f'No parent company found with ID {new_parent_company_id} (new_parent_company_id)')

			old_parent_company = cast(
				models.ParentCompany,
				session.query(models.ParentCompany).filter(
					models.ParentCompany.id == old_parent_company_id
				).first())

			if not old_parent_company:
				raise errors.Error(f'No parent company found with ID {old_parent_company_id} (old_parent_company_id)')

			print(f'[{index + 1} of {rows_count}] Ready to merge... found old parent company {old_parent_company.name} ({old_parent_company_id}) and new parent company {new_parent_company.name} ({new_parent_company_id})')

			if not is_test_run:
				print(f'[{index + 1} of {rows_count}] Merging old parent company {old_parent_company.name} ({old_parent_company_id}) into new parent company {new_parent_company.name} ({new_parent_company_id})...')

				old_companies = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.parent_company_id == old_parent_company_id
					))

				old_users = cast(
					models.User,
					session.query(models.User).filter(
						models.User.parent_company_id == old_parent_company_id
					))

				for old_company in old_companies:
					old_company.parent_company_id = new_parent_company_id

				for old_user in old_users:
					old_user.parent_company_id = new_parent_company_id

				session.delete(old_parent_company)

				print(f'[{index + 1} of {rows_count}] Successful merge!')

if __name__ == "__main__":
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
