"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from lib import dedupe_companies

EXTRACT_TUPLE = (
	'RER',
	'Oogie LLC',
	'Scattered',
	'Aureum Labs',
	'kevin@trustthespread.com',
	['00001', '2', '3', '4'],
)

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		dedupe_companies.extract_vendor_from_company(
			session,
			EXTRACT_TUPLE,
			is_test_run=False,
		)

if __name__ == "__main__":
	main()
