"""
This script demonstrates how to access the database outside of application context.
It demands the 'DATABASE_URL' environment be set to connect to the database.
For example:

DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/0000_example.py
"""

import os
import sys
from os import path
from typing import List, Dict, Any, cast
from sqlalchemy.orm.session import Session
# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models
from util import active_inventory_util as util

	
def main() -> None:

	company_name = 'Royal_Apothecary'
	base_path = '../../notebooks/data/royal'

	INCOMING_TRANSFERS_FILE = base_path + '/royal_apothecary_incoming_transfer_packages_20210101_20210905.xlsx'
	OUTGOING_TRANSFERS_FILE = base_path + '/royal_apothecary_outgoing_transfer_packages_20210101_20210905.xlsx'
	PACKAGES_FILE = base_path + '/royal_apothecary_active_inventory_20210906.xlsx'
	SALES_TRANSACTIONS_FILE = base_path + '/royal_apothecary_sales_transactions_20210101_20210905.xlsx'

	inventory_dates = [
			'05/31/2021',
			'06/30/2021',
			'07/31/2021',
			'08/31/2021',
	]
	q = util.Query()
	q.inventory_dates = inventory_dates
	q.company_name = 'Royal_Apothecary'

	d = util.Download()
	d.download_files(
		incoming_files=[INCOMING_TRANSFERS_FILE],
		outgoing_files=[OUTGOING_TRANSFERS_FILE],
		sales_transactions_files=[SALES_TRANSACTIONS_FILE],
	)
	id_to_history = util.get_histories(cast(Any, d))
	util.create_inventory_xlsx(id_to_history, q)


if __name__ == "__main__":
	main()
