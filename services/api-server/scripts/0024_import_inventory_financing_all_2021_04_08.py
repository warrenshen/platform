import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models

from lib import advances, companies, loans, purchase_orders, repayments


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	payor_vendors_path = 'scripts/data/payor_vendors_2021_04_09.xlsx'
	with models.session_scope(session_maker) as session:
		companies.load_into_db_from_excel(session, payor_vendors_path)

	purchase_orders_path = 'scripts/data/inventory_financing_purchase_orders_2021_04_08.xlsx'
	with models.session_scope(session_maker) as session:
		purchase_orders.load_into_db_from_excel(session, purchase_orders_path)

	loans_path = 'scripts/data/inventory_financing_loans_2021_04_08.xlsx'
	with models.session_scope(session_maker) as session:
		loans.load_into_db_from_excel(session, loans_path)

	advances_path = 'scripts/data/inventory_financing_advances_2021_04_08.xlsx'
	with models.session_scope(session_maker) as session:
		advances.load_into_db_from_excel(session, advances_path)

	repayments_path = 'scripts/data/inventory_financing_repayments_2021_04_08.xlsx'
	with models.session_scope(session_maker) as session:
		repayments.load_into_db_from_excel(session, repayments_path)

if __name__ == "__main__":
	main()
