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
	('e79fda63-42dd-493d-b180-f16923db4bdb', 'd48e15d2-d1ee-47f2-a8d7-f4b4382de69e', 'vendor'),
	('48d3cfc7-7369-4418-9943-7c88572b8d31', '23415630-461f-4120-9838-39ef724eca8d', 'vendor'),
	('ddc07d90-aac6-4af0-ae2e-c7b9d0ad9c59', '5e313b1a-4e74-420d-a192-cc3618e73570', 'vendor'),
	('dceb4c89-3edd-42cf-af0e-21ddac456e56', 'f045aa20-7e42-4656-b50e-88740bec6ab4', 'vendor'),
	('d8b7263f-bb72-4bfa-8ae2-bbc0f8abf6d8', '205c926c-ba52-4ee2-84fd-b372f2a6ae1e', 'vendor'),
	('3ff4d8d3-ff26-4bea-bf04-54afecd86331', '8530c8cb-589a-4d3c-9478-c2d4fe9292fa', 'vendor'),
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
