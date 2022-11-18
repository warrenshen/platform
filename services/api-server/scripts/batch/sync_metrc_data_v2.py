"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script syncs metrc data.

Why:
You can run this script to backfill historical metrc data for a company new to Bespoke Financial.

Example:
- Syncs metrc data for HPCC from 12/01/20 - 12/31/20
```
python scripts/batch/sync_metrc_data.py HPCC 12/01/20 12/31/20
```
"""

import argparse
import logging
import os
import sys

from datetime import timedelta
from os import path
from typing import cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from dotenv import load_dotenv
from server.config import get_config, is_development_env

from bespoke.config.config_util import MetrcWorkerConfig
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc import metrc_download_util
from bespoke.metrc.common import metrc_common_util

REQUIRED_ENV_VARS = [
	'DATABASE_URL',
	'URL_SECRET_KEY',
	'URL_SALT',
	'PASSWORD_SALT',
	'METRC_USER_KEY',
]

def main(
	company_identifier: str,
	start_date_str: str,
	end_date_str: str,
	is_sales_disabled: bool,
	is_transfers_disabled: bool,
	is_packages_disabled: bool,
	is_lab_tests_disabled: bool,
	is_plants_disabled: bool,
	force_fetch_missing_sales_transactions: bool,
	num_parallel_licenses: int,
	num_parallel_sales_transactions: int,
) -> None:
	logging.basicConfig(level=logging.INFO)

	if is_development_env(os.environ.get('FLASK_ENV')):
		load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	config = get_config()
	config.SERVER_TYPE = "batch-scripts"

	for env_var in REQUIRED_ENV_VARS:
		if not os.environ.get(env_var):
			print(f'You must set "{env_var}" in the environment to use this script')
			exit(1)

	# For batch job, set SQL statement timeout to 10 seconds.
	engine = models.create_engine(statement_timeout=10000)
	session_maker = models.new_sessionmaker(engine)

	company_id = None

	with session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		company_id = str(company.id)

	metrc_api_key_id = None
	license_numbers = []

	with session_scope(session_maker) as session:
		metrc_api_key = cast(
			models.Company,
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.is_deleted == False
			).filter(
				models.MetrcApiKey.company_id == company_id
			).first())

		if not metrc_api_key:
			print(f'Given company does not have a Metrc API key set up yet')
			exit(1)

		if not metrc_api_key.permissions_refreshed_at:
			print(f'Given Metrc API key does not have permissions refreshed yet')
			exit(1)

		if not metrc_api_key.is_functioning:
			print(f'Given Metrc API key is not functioning')
			exit(1)

		metrc_api_key_id = str(metrc_api_key.id)
		license_numbers = [license_permissions['license_number'] for license_permissions in metrc_api_key.permissions_payload]

	parsed_start_date = date_util.load_date_str(start_date_str)
	# Default end date to today if end date not specified.
	parsed_end_date = date_util.load_date_str(end_date_str) if end_date_str else (date_util.now_as_date() - timedelta(days=1))

	apis_to_use = metrc_common_util.ApisToUseDict(
		sales_receipts=not is_sales_disabled,
		sales_transactions=not is_sales_disabled,
		incoming_transfers=not is_transfers_disabled,
		outgoing_transfers=not is_transfers_disabled,
		rejected_transfers=False,
		packages=not is_packages_disabled,
		lab_tests=not is_lab_tests_disabled,
		harvests=not is_plants_disabled,
		plants=not is_plants_disabled,
		plant_batches=not is_plants_disabled,
	)

	print('')
	print('STARTING!')
	print('Running sync metrc data with args...')
	print(f'Start date: {date_util.date_to_str(parsed_start_date)}')
	print(f'End date: {date_util.date_to_str(parsed_end_date)}')
	print(f'Number of parallel licenses: {num_parallel_licenses}')
	print(f'Number of parallel sales transactions: {num_parallel_sales_transactions}')
	print(f'Force fetch missing sales transactions? {force_fetch_missing_sales_transactions}')
	print(f'APIs to fetch data from: {apis_to_use}')
	print('')
	print('LOGS...')

	# Set apis_to_use to None if it's equal to the default.
	# This allows this script to simulate a Metrc download with the default whitelist of APIs.
	if apis_to_use == metrc_common_util.get_default_apis_to_use():
		apis_to_use = None

	for license_number in license_numbers:
		with session_scope(session_maker) as session:
			resp, fatal_err = metrc_download_util.download_data_for_metrc_api_key_license_in_date_range(
				session=session,
				worker_cfg=MetrcWorkerConfig(
					force_fetch_missing_sales_transactions=force_fetch_missing_sales_transactions,
					num_parallel_licenses=num_parallel_licenses,
					num_parallel_sales_transactions=num_parallel_sales_transactions,
				),
				security_cfg=config.get_security_config(),
				apis_to_use=apis_to_use,
				metrc_api_key_id=metrc_api_key_id,
				license_number=license_number,
				start_date=parsed_start_date,
				end_date=parsed_end_date,
			)

	if fatal_err:
		print('')
		print('ERROR!')
		print(fatal_err)
		return

	print('')
	print('SUCCESS!')

parser = argparse.ArgumentParser()
parser.add_argument(
	'company_identifier',
	help='Identifier of company to sync metrc data for',
)
parser.add_argument(
	'start_date',
	help='Start date to sync metrc data for',
)
parser.add_argument(
	'--end_date',
	help='End date to sync metrc data for (defaults to today)',
)
parser.add_argument(
	'--is_sales_disabled',
	help='If true, do not fetch data from sales related endpoints',
	action='store_true',
)
parser.add_argument(
	'--is_transfers_disabled',
	help='If true, do not fetch data from transfers related endpoints',
	action='store_true',
)
parser.add_argument(
	'--is_packages_disabled',
	help='If true, do not fetch data from packages related endpoints',
	action='store_true',
)
parser.add_argument(
	'--is_plants_disabled',
	help='If true, do not fetch data from plants related endpoints',
	action='store_true',
)
parser.add_argument(
	'--is_lab_tests_disabled',
	help='If true, do not fetch data from lab tests related endpoints',
	action='store_true',
)
parser.add_argument(
	'--force_fetch_missing_sales_transactions',
	dest='force_fetch_missing_sales_transactions',
	action='store_true',
)
parser.add_argument(
	'--num_parallel_licenses',
	help='Number of parallel threads to run at license level',
	type=int,
	default=5,
)
parser.add_argument(
	'--num_parallel_sales_transactions',
	help='Number of parallel threads to run at sales transactions level',
	type=int,
	default=6,
)

if __name__ == '__main__':
	args = parser.parse_args()
	main(
		company_identifier=args.company_identifier,
		start_date_str=args.start_date,
		end_date_str=args.end_date,
		is_sales_disabled=args.is_sales_disabled,
		is_transfers_disabled=args.is_transfers_disabled,
		is_packages_disabled=args.is_packages_disabled,
		is_lab_tests_disabled=args.is_lab_tests_disabled,
		is_plants_disabled=args.is_plants_disabled,
		force_fetch_missing_sales_transactions=args.force_fetch_missing_sales_transactions or False,
		num_parallel_licenses=args.num_parallel_licenses,
		num_parallel_sales_transactions=args.num_parallel_sales_transactions,
	)
