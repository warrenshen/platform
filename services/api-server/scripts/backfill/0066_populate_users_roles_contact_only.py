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

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Populating users role...')

			users_batch = cast(
				List[models.User],
				session.query(models.User).order_by(
					models.User.created_at.asc() # Order by is necessary for batch-based iteration to work.
				).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all())

			if len(users_batch) <= 0:
				is_done = True
				continue
			else:
				for user in users_batch:
					if user.company_id and not user.role:
						user.role = db_constants.UserRoles.COMPANY_CONTACT_ONLY

			current_page += 1

if __name__ == "__main__":
	main()
