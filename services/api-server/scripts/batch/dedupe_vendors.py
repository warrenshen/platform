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

DEDUPE_TUPLES = [
	('e79fda63-42dd-493d-b180-f16923db4bdb', '970d612a-e068-4a0a-8f58-a10d6050fa4f', 'vendor'),
]

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		dedupe_companies.dedupe_tuples(session, DEDUPE_TUPLES)

if __name__ == "__main__":
	main()
