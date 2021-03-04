"""
This script demonstrates how to access the database outside of application context.
It demands the 'DATABASE_URL' environment be set to connect to the database.
For example:

DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/example.py
"""

import os
import sys
from os import path

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.db import models


def print_companies(session: Session) -> None:
	print("Companies -----")
	for company in session.query(models.Company).all():
		print(f"""Name: "{company.name}""""")


def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		print_companies(session)


if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()