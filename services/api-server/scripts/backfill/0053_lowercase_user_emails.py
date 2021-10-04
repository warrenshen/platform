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
		users = cast(
			List[models.User],
			session.query(models.User).all())

		users_count = len(users)

		for index, user in enumerate(users):
			print(f'[{index + 1} of {users_count}]')

			current_email = user.email
			new_email = user.email.lower()

			if current_email == new_email:
				continue

			existing_users = cast(
				List[models.User],
				session.query(models.User).filter_by(email=new_email).all())

			if len(existing_users) > 0:
				print(f'[{index + 1} of {users_count}] Error: user(s) with the new email {new_email} already exist, skipping...')
				continue

			print(f'[{index + 1} of {users_count}] Changing email of user from {current_email} to {new_email}...')
			user.email = new_email

if __name__ == "__main__":
	main()
