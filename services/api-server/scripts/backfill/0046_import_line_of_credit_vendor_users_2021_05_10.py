"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models

from lib import users


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	payor_vendor_users_path = 'scripts/data/payor_vendor_users_2021_05_10.xlsx'
	with models.session_scope(session_maker) as session:
		users.load_into_db_from_excel(session, payor_vendor_users_path)

if __name__ == "__main__":
	main()
