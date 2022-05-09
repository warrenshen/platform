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

from bespoke.db import db_constants, models

def main(is_test_run: bool) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		print(f'Setting bank users login method to 2FA...')

		bank_users = cast(
			List[models.User],
			session.query(models.User).filter(
				models.User.role.in_([db_constants.UserRoles.BANK_ADMIN, db_constants.UserRoles.BANK_READ_ONLY])
			).order_by(
				models.User.id
			).all())

		for bank_user in bank_users:
			print(f'Setting bank user {bank_user.email} login method to 2FA...')
			if not is_test_run:
				bank_user.login_method = db_constants.LoginMethod.TWO_FA

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
