"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/

What:
This script removes PII information from metrc_sales_receipts. This script should be run multiple times
until it does not make any updates to the database.

Why:
There was a bug in our code where we mistakenly stored PII information in the metrc_sales_receipts table.
"""

import os
import sys
from os import path
from sqlalchemy.orm.attributes import flag_modified

from typing import List, cast

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))


from bespoke.db import models
from bespoke.metrc.sales_util import METRC_SALES_RECEIPT_SPECIAL_PII_KEYS


def main(is_test_run: bool) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_ids = []
	with models.session_scope(session_maker) as session:
		companies = cast(
			List[models.Company],
			session.query(models.Company).order_by(
				models.Company.id
			).all())
		company_ids = [str(company.id) for company in companies]

	for company_id in company_ids:
		BATCH_SIZE = 50
		current_page = 0
		is_done = False

		while not is_done:
			with models.session_scope(session_maker) as session:
				metrc_sales_receipts_batch = cast(
					List[models.MetrcSalesReceipt],
					session.query(models.MetrcSalesReceipt).filter(
						models.MetrcSalesReceipt.company_id == company_id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(metrc_sales_receipts_batch) <= 0:
					is_done = True
				else:
					for metrc_sales_receipt in metrc_sales_receipts_batch:
						new_payload = metrc_sales_receipt.payload.copy()
						is_payload_changed = False

						for special_pii_key in METRC_SALES_RECEIPT_SPECIAL_PII_KEYS:
							if special_pii_key in new_payload:
								new_payload.pop(special_pii_key)
								is_payload_changed = True

						if is_payload_changed:
							print(f'[Company {company_id}] Updating sales receipt {metrc_sales_receipt.id} payload...')
							if not is_test_run:
								metrc_sales_receipt.payload = new_payload
								flag_modified(metrc_sales_receipt, 'payload')

					current_page += 1

	print('SUCCESS!')

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main(is_test_run=is_test_run)
