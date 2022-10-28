"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import argparse
import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from lib import dedupe_companies

def main(
	is_test_run: bool,
	destination_company_id: str,
	source_company_id: str,
) -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		dedupe_companies.dedupe_tuples(
			session,
			[(destination_company_id, source_company_id, 'vendor')],
		)

parser = argparse.ArgumentParser()
parser.add_argument('destination_company_id', help='ID of company to remain after dedupe')
parser.add_argument('source_company_id', help='ID of company to delete during dedupe')

if __name__ == "__main__":
	args = parser.parse_args()

	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(
		is_test_run=is_test_run,
		destination_company_id=args.destination_company_id,
		source_company_id=args.source_company_id,
	)
