"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script sync metrc data.

Why:
You can run this script to backfill historical metrc data for a company new to Bespoke Financial.
"""

import logging
import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from server.config import get_config

from bespoke.date import date_util
from bespoke.db import models
from bespoke.metrc import metrc_util

REQUIRED_ENV_VARS = [
	'DATABASE_URL',
	'URL_SECRET_KEY',
	'URL_SALT',
	'PASSWORD_SALT',
	'METRC_VENDOR_KEY_CA',
	'METRC_USER_KEY',
]

def main() -> None:
	for env_var in REQUIRED_ENV_VARS:
		if not os.environ.get(env_var):
			print(f'You must set "{env_var}" in the environment to use this script')
			exit(1)

	logging.basicConfig(level=logging.INFO)

	config = get_config()
	config.SERVER_TYPE = "async-triggers"

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_id = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == 'DF'
			).first())

		company_id = str(company.id)

	resp, fatal_err = metrc_util.download_data_for_one_customer(
		company_id=company_id,
		auth_provider=config.get_metrc_auth_provider(),
		security_cfg=config.get_security_config(),
		start_date=date_util.load_date_str('06/10/2020'),
		end_date=date_util.load_date_str('12/31/2020'),
		session_maker=session_maker
	)

	if fatal_err:
		print('ERROR!')
		print(fatal_err)
	else:
		print('SUCCESS!')

if __name__ == "__main__":
	main()
