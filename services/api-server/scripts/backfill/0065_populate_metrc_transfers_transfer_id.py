"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
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
			print(f'[Page {current_page + 1}] Populating metrc transfers transfer_id...')

			metrc_transfers_batch = cast(
				List[models.MetrcTransfer],
				session.query(models.MetrcTransfer).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all())

			if len(metrc_transfers_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_transfer in metrc_transfers_batch:
					transfer_payload = metrc_transfer.transfer_payload
					transfer_id = transfer_payload["Id"]

					if not metrc_transfer.transfer_id:
						metrc_transfer.transfer_id = transfer_id

			current_page += 1

if __name__ == "__main__":
	main()
