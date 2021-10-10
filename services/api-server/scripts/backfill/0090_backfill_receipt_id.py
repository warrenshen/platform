"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import db_constants, models

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Populating metrc_sales_receipts.receipt_id...')

			try:
				metrc_sales_receipts_batch = cast(
					List[models.MetrcSalesReceipt],
					session.query(models.MetrcSalesReceipt).order_by(
						models.MetrcSalesReceipt.id.asc() # Order by is necessary for batch-based iteration to work.
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())
			except Exception:
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_sales_receipts_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_sales_receipt in metrc_sales_receipts_batch:
					cur_id = str(metrc_sales_receipt.id)
					if not metrc_sales_receipt.payload:
						print('WARNING: metrc sales receipt {} is missing a payload'.format(cur_id))
						continue

					metrc_sales_receipt.receipt_id = '{}'.format(metrc_sales_receipt.payload['Id'])

				current_page += 1

if __name__ == "__main__":
	main()
