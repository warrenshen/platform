"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Callable, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

class Filter(object):

	def __init__(self, company_id: str, us_state: str) -> None:
		self.company_id = company_id
		self.us_state = us_state

def _delete_transfers_items(session_maker: Callable, filter_: Filter, is_test_run: bool) -> None:
	current_page = 0
	BATCH_SIZE = 100
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Trying to delete incorrect metrc rows...')

			try:
				metrc_transfers = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).filter(
						models.MetrcTransfer.company_id == filter_.company_id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(metrc_transfers) <= 0:
					is_done = True
					continue

				filtered_metrc_transfers = []
				for metrc_transfer in metrc_transfers:
					if metrc_transfer.us_state == filter_.us_state:
						filtered_metrc_transfers.append(metrc_transfer)

				transfer_row_ids = [str(metrc_transfer.id) for metrc_transfer in filtered_metrc_transfers]

				metrc_transfer_packages = cast(
					List[models.MetrcTransferPackage],
					session.query(models.MetrcTransferPackage).filter(
						models.MetrcTransferPackage.transfer_row_id.in_(transfer_row_ids)
					).all())

				for metrc_transfer_package in metrc_transfer_packages:
					print(f'Deleting metrc transfer package ({str(metrc_transfer_package.id)})...')
					if not is_test_run:
						cast(Callable, session.delete)(metrc_transfer_package)

				session.flush()

				company_deliveries = cast(
					List[models.CompanyDelivery],
					session.query(models.CompanyDelivery).filter(
						models.CompanyDelivery.transfer_row_id.in_(transfer_row_ids)
					).all())

				for company_delivery in company_deliveries:
					print(f'Deleting company delivery ({str(company_delivery.id)})...')
					if not is_test_run:
						cast(Callable, session.delete)(company_delivery)

				session.flush()

				metrc_deliveries = cast(
					List[models.MetrcDelivery],
					session.query(models.MetrcDelivery).filter(
						models.MetrcDelivery.transfer_row_id.in_(transfer_row_ids)
					).all())

				for metrc_delivery in metrc_deliveries:
					print(f'Deleting metrc delivery ({str(metrc_delivery.id)})...')
					if not is_test_run:
						cast(Callable, session.delete)(metrc_delivery)

				session.flush()

				for metrc_transfer in filtered_metrc_transfers:
					print(f'Deleting metrc transfer ({str(metrc_transfer.id)})...')
					if not is_test_run:
						cast(Callable, session.delete)(metrc_transfer)

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			current_page += 1

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	# Delete Metrc items according to the filter details specified
	filter_ = Filter(
		company_id = '91432f0e-a980-4a0a-a202-b435752d97d4',
		us_state = 'CA'
	)

	_delete_transfers_items(session_maker, filter_, is_test_run)

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
