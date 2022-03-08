"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Any,  Callable, Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Checking emails for whitespaces...')

			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).order_by(
						models.Company.id.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(companies) <= 0:
					is_done = True
					continue

				for company in companies:
					company_users = cast(
						List[models.User],
						session.query(models.User).filter(
							models.User.company_id == str(company.id)
						).all())

					for user in company_users:
						has_whitespace = False
						for c in user.email:
							if c.isspace():
								has_whitespace = True
								break
						
						# if the user has no whitespace in their email, then there is nothing to fix
						if has_whitespace is True:
							found_matching_email = False
							stripped_email = user.email.strip()
							for comparison_user in company_users:
								comparison_email = comparison_user.email.strip()
								if comparison_user.is_deleted is not True and \
									user.id != comparison_user.id and stripped_email == comparison_email:
									found_matching_email = True

							if found_matching_email:
								user.is_deleted = True
							else:
								user.email = user.email.strip()


			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			current_page += 1

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
