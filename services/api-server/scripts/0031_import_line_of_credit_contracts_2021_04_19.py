import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models

from lib import contracts


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	contracts_path = 'scripts/data/line_of_credit_contracts_2021_04_19.xlsx'
	with models.session_scope(session_maker) as session:
		contracts.load_into_db_from_excel(session, contracts_path)

if __name__ == "__main__":
	main()
