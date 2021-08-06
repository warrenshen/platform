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
	('e08cc3a3-fee4-45d9-909b-7df06249310a', 'ad608d77-e23f-4021-b21a-e2d97b48d734', 'payor'),
	('e08cc3a3-fee4-45d9-909b-7df06249310a', '958b0491-0104-4bd4-a4e7-5b814c11be9f', 'payor'),
	('65754767-b500-4cfa-bf35-8e142d83dcbb', 'c0a4d49a-f4f5-46eb-aa30-05c4e9034b13', 'vendor'),
	('56b1dc1b-32f4-469d-baa3-8c08c3f298b7', '30e6ea1b-5dea-4ffe-8abd-6c2abda18b69', 'vendor'),
	('b2f5fb35-77b7-471d-9391-25c128396a14', 'b0c04076-be26-4c31-bee7-7f5372fe3db8', 'vendor'),
	('bfd3e6e7-d697-4c9d-8770-ec6ef63e34fd', '1959349d-8927-42db-8050-90a0054431c4', 'vendor'),
	('207fd7ea-ff77-4612-afba-69c4e7520b99', 'fe12da29-076e-4bee-a3a4-bc85e62bdf8c', 'vendor'),
	('dceb4c89-3edd-42cf-af0e-21ddac456e56', '207fd7ea-ff77-4612-afba-69c4e7520b99', 'vendor'),
	('e83d94fa-18a7-4186-ba83-23bd0540aab1', '42ed7c0b-0dda-4577-ac4c-f642b922e300', 'payor'),
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
