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

from bespoke.db import models
from bespoke.metrc.common.package_common_util import UNKNOWN_LAB_STATUS
from bespoke.metrc.transfers_util import get_final_lab_status

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	TRANSFER_BATCH_SIZE = 10
	is_done = False
	metrc_transfer_index = 0

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Resetting metrc transfers...')

			try:
				metrc_transfers_batch = cast(
					List[models.MetrcTransfer],
					session.query(models.MetrcTransfer).order_by(
						models.MetrcTransfer.id
					).offset(
						current_page * TRANSFER_BATCH_SIZE
					).limit(TRANSFER_BATCH_SIZE).all())

				transfer_row_ids = [str(metrc_transfer.id) for metrc_transfer in metrc_transfers_batch]

				metrc_transfer_packages_batch = cast(
					List[models.MetrcTransferPackage],
					session.query(models.MetrcTransferPackage).filter(
						models.MetrcTransferPackage.transfer_row_id.in_(transfer_row_ids)
					).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_transfers_batch) <= 0:
				is_done = True
				continue
			else:
				transfer_row_id_to_transfer_packages = {}
				for metrc_transfer_package in metrc_transfer_packages_batch:
					transfer_row_id = str(metrc_transfer_package.transfer_row_id)
					if transfer_row_id not in transfer_row_id_to_transfer_packages:
						transfer_row_id_to_transfer_packages[transfer_row_id] = [metrc_transfer_package]
					else:
						transfer_row_id_to_transfer_packages[transfer_row_id] += [metrc_transfer_package]

				for metrc_transfer in metrc_transfers_batch:
					metrc_transfer_index += 1
					transfer_row_id = str(metrc_transfer.id)

					if transfer_row_id not in transfer_row_id_to_transfer_packages:
						transfer_packages = []
					else:
						transfer_packages = transfer_row_id_to_transfer_packages[transfer_row_id]

					metrc_transfer_package_index = 0
					for transfer_package in transfer_packages:
						metrc_transfer_package_index += 1
						transfer_package_payload = transfer_package.package_payload
						lab_testing_state = transfer_package_payload['LabTestingState']

						if not lab_testing_state:
							transfer_package_lab_results_status = UNKNOWN_LAB_STATUS
						elif lab_testing_state == 'TestPassed':
							transfer_package_lab_results_status = 'passed'
						else:
							transfer_package_lab_results_status = 'failed'

						if transfer_package.lab_results_status != transfer_package_lab_results_status:
							print(f'[{metrc_transfer_package_index}] Updating metrc transfer package lab results status from {transfer_package.lab_results_status} to {transfer_package_lab_results_status}...')
							if not is_test_run:
								transfer_package.lab_results_status = transfer_package_lab_results_status

					lab_results = list(map(
						lambda transfer_package: transfer_package.lab_results_status,
						transfer_packages
					))
					transfer_lab_results_status = get_final_lab_status(lab_results)

					if metrc_transfer.lab_results_status != transfer_lab_results_status:
						print(f'[{metrc_transfer_index}] Updating metrc transfer ({str(metrc_transfer.id)}) lab results status from {metrc_transfer.lab_results_status} to {transfer_lab_results_status}...')
						if not is_test_run:
							metrc_transfer.lab_results_status = transfer_lab_results_status

				current_page += 1

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
