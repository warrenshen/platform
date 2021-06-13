"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path
from typing import cast, List

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
		companies = cast(
			List[models.Company],
			session.query(models.Company).all())

		for company in companies:
			if company.company_type == 'customer':
				company.is_customer = True
			elif company.company_type == 'payor':
				company.is_payor = True
			elif company.company_type == 'vendor':
				company.is_vendor = True
			else:
				raise Exception('Company {} has an unrecognized company_type'.format(company.id))


if __name__ == "__main__":
	main()
