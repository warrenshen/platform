import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models

from lib import purchase_orders


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	path = 'scripts/data/leune_purchase_orders_2021_03_24.xlsx'
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		purchase_orders.load_into_db_from_excel(session, path)

if __name__ == "__main__":
	main()
