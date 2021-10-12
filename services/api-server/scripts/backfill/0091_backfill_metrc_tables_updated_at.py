"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Any, Callable, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

def backfill_table(
	table_name: str,
	model: Any,
	session_maker: Callable,
	is_test_run: bool,
) -> None:
	current_page = 0
	BATCH_SIZE = 100
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Backfilling {table_name} updated_at...')

			try:
				metrc_table_rows_batch = cast(
					List[model],
					session.query(model).filter(
						model.updated_at == None
					).limit(BATCH_SIZE).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_table_rows_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_table_row in metrc_table_rows_batch:
					if not metrc_table_row.created_at:
						print(f'[WARNING] Found row {str(metrc_table_row.id)} in {table_name} without created_at {metrc_table_row.created_at}...')
						continue

					if not metrc_table_row.updated_at:
						print(f'Updating row {str(metrc_table_row.id)} in {table_name} updated_at...')
						if not is_test_run:
							metrc_table_row.updated_at = metrc_table_row.created_at

				current_page += 1

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	table_tuples = [
		('metrc_api_keys', models.MetrcApiKey),
		('company_deliveries', models.CompanyDelivery),
		('metrc_deliveries', models.MetrcDelivery),
		('metrc_harvests', models.MetrcHarvest),
		('metrc_packages', models.MetrcPackage),
		('metrc_plant_batches', models.MetrcPlantBatch),
		('metrc_plants', models.MetrcPlant),
		('metrc_sales_receipts', models.MetrcSalesReceipt),
		('metrc_sales_transactions', models.MetrcSalesTransaction),
		('metrc_transfer_packages', models.MetrcTransferPackage),
		('metrc_transfers', models.MetrcTransfer),
	]

	for table_name, model in table_tuples:
		print(f'Backfilling {table_name} updated_at...')
		backfill_table(table_name, model, session_maker, is_test_run)

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

	main(is_test_run)
