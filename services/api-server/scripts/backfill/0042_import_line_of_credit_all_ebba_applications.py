import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models

from lib import ebba_applications


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	path = 'scripts/data/line_of_credit_all_ebba_applications_04_29_21.xlsx'
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		ebba_applications.load_into_db_from_excel(session, path)

if __name__ == "__main__":
	main()
