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
from os import path
from datetime import timedelta
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from server.config import get_config, get_email_client

from bespoke.date import date_util
from bespoke.db import models
from bespoke.email import sendgrid_util
from bespoke.metrc import metrc_util

REQUIRED_ENV_VARS = [
	'DATABASE_URL',
	'URL_SECRET_KEY',
	'URL_SALT',
	'PASSWORD_SALT',
	'METRC_VENDOR_KEY_CA',
	'METRC_VENDOR_KEY_OR',
	'METRC_USER_KEY',
]

def main(company_identifier, start_date, end_date) -> None:
	for env_var in REQUIRED_ENV_VARS:
		if not os.environ.get(env_var):
			print(f'You must set "{env_var}" in the environment to use this script')
			exit(1)

	logging.basicConfig(level=logging.INFO)

	config = get_config()
	config.SERVER_TYPE = "batch-scripts"

	# For batch job, set SQL statement timeout to 10 seconds.
	engine = models.create_engine(statement_timeout=10000)
	session_maker = models.new_sessionmaker(engine)

	email_client = get_email_client(config)
	sendgrid_client = sendgrid_util.Client(
		email_client,
		session_maker,
		config.get_security_config(),
	)

	company_id = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		company_id = str(company.id)

	parsed_start_date = date_util.load_date_str(start_date)
	parsed_end_date = date_util.load_date_str(end_date)

	cur_date = parsed_end_date
	while cur_date >= parsed_start_date:
		resp, fatal_err = metrc_util.download_data_for_one_customer(
			company_id=company_id,
			auth_provider=config.get_metrc_auth_provider(),
			security_cfg=config.get_security_config(),
			sendgrid_client=sendgrid_client,
			cur_date=cur_date,
			session_maker=session_maker
		)

		if fatal_err:
			print('ERROR!')
			print(fatal_err)
			return

		cur_date = cur_date - timedelta(days=1)

	print('SUCCESS!')

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to sync metrc data for')
parser.add_argument('start_date', help='Start date to sync metrc data for')
parser.add_argument('end_date', help='End date to sync metrc data for')

if __name__ == '__main__':
	args = parser.parse_args()
	main(
		company_identifier=args.company_identifier,
		start_date=args.start_date,
		end_date=args.end_date,
	)
