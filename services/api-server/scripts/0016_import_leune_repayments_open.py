import os
import sys
from os import path
# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models
from lib import repayments

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	path = 'tmp/open_loans/leune_repayments_open_03_24.xlsx'
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		repayments.load_into_db_from_excel(session, path)

if __name__ == "__main__":
	main()