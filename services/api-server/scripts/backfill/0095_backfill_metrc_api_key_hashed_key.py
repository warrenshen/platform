"""
URL_SECRET_KEY= URL_SALT= DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.db import models
from bespoke.security import security_util

def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	if not os.environ.get('URL_SECRET_KEY'):
		raise Exception('Need to set URL_SECRET_KEY')

	if not os.environ.get('URL_SALT'):
		raise Exception('Need to set URL_SALT')

	with models.session_scope(session_maker) as session:
		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).all())

		security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY=os.environ.get('URL_SECRET_KEY'),
			URL_SALT=os.environ.get('URL_SALT'),
			BESPOKE_DOMAIN=''
		)

		num_keys = len(metrc_api_keys)
		for index, metrc_api_key in enumerate(metrc_api_keys):
			print(f'Processing {index + 1} of {num_keys} metrc_api_keys')
			api_key = security_util.decode_secret_string(
				security_cfg, metrc_api_key.encrypted_api_key
			)
			metrc_api_key.hashed_key = security_util.encode_secret_string(
				security_cfg, api_key, serializer_type=security_util.SerializerType.SERIALIZER
			)

	with models.session_scope(session_maker) as session:
		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).all())

		hashed_key_to_company_ids = {}

		for metrc_api_key in metrc_api_keys:
			if metrc_api_key.hashed_key not in hashed_key_to_company_ids:
				hashed_key_to_company_ids[metrc_api_key.hashed_key] = []

			hashed_key_to_company_ids[metrc_api_key.hashed_key].append(str(metrc_api_key.company_id))

		for hashed_key, company_ids in hashed_key_to_company_ids.items():
			if len(company_ids) == 1:
				continue

			print('WARNING companies {} share the same metrc api key'.format(
				company_ids
			))

if __name__ == "__main__":
	main()
