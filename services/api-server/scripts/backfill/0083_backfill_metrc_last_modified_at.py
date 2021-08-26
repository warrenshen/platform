"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from dateutil import parser
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import db_constants, metrc_models_util, models

def _metrc_transfers(session_maker):
	current_page = 0
	BATCH_SIZE = 10
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc transfers fields...')
			try:
				metrc_transfers_batch = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).order_by(
						models.MetrcTransfer.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_transfers_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_transfer in metrc_transfers_batch:
					metrc_transfer.last_modified_at = parser.parse(metrc_transfer.transfer_payload['LastModified'])
	
					metrc_transfer_packages = cast(
						List[models.MetrcTransferPackage],
						session.query(models.MetrcTransferPackage).filter(
							models.MetrcTransferPackage.transfer_row_id == metrc_transfer.id 
						).all())

					for pkg in metrc_transfer_packages:
						pkg.last_modified_at = metrc_transfer.last_modified_at	

		current_page += 1

def _metrc_packages(session_maker):
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc packages fields...')
			try:
				metrc_packages_batch = cast(
					List[models.MetrcPackage],
					session.query(models.MetrcPackage).order_by(
						models.MetrcPackage.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_packages_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_package in metrc_packages_batch:
					metrc_package.last_modified_at = parser.parse(metrc_package.package_payload['LastModified'])

		current_page += 1

def _metrc_plants(session_maker):
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc plants fields...')
			try:
				metrc_plants_batch = cast(
					List[models.MetrcPlant],
					session.query(models.MetrcPlant).order_by(
						models.MetrcPlant.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_plants_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_plant in metrc_plants_batch:
					metrc_plant.last_modified_at = parser.parse(metrc_plant.payload['LastModified'])

		current_page += 1

def _metrc_plant_batches(session_maker):
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc plant batches fields...')
			try:
				metrc_plant_batches_batch = cast(
					List[models.MetrcPlantBatch],
					session.query(models.MetrcPlantBatch).order_by(
						models.MetrcPlantBatch.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_plant_batches_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_plant_batch in metrc_plant_batches_batch:
					metrc_plant_batch.last_modified_at = parser.parse(metrc_plant_batch.payload['LastModified'])

		current_page += 1

def _metrc_harvests(session_maker):
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Filling in metrc plant harvest fields...')
			try:
				metrc_plant_harvest_batch = cast(
					List[models.MetrcHarvest],
					session.query(models.MetrcHarvest).order_by(
						models.MetrcHarvest.id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_plant_harvest_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_harvest in metrc_plant_harvest_batch:
					metrc_harvest.last_modified_at = parser.parse(metrc_harvest.payload['LastModified'])

		current_page += 1

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	_metrc_packages(session_maker)
	_metrc_plants(session_maker)
	_metrc_plant_batches(session_maker)
	_metrc_harvests(session_maker)
	_metrc_transfers(session_maker)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	main()
