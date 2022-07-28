"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Dict, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from bespoke.finance import contract_util

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date: datetime.date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] updating vendor users to be contacted')

			try:
				partnerships = cast(
					List[models.CompanyVendorPartnership],
					session.query(models.CompanyVendorPartnership).order_by(
						models.CompanyVendorPartnership.created_at.asc()
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())

				if len(partnerships) <= 0:
					is_done = True
					continue

				partnership_lookup:Dict[String, models.CompanyVendorPartnership] = {}
				for partnership in partnerships:
					partnership_lookup[str(partnership.id)] = partnership

				all_partnerships = partnership_lookup.keys()
				partnerships_with_all_contacts = []
				for existing_partnership in all_partnerships:
					partnership_has_contacts = cast(
						models.CompanyVendorContact,
						session.query(models.CompanyVendorContact).filter(
							models.CompanyVendorContact.partnership_id == existing_partnership
						).count()) > 0

					if not partnership_has_contacts:
						partnerships_with_all_contacts.append(existing_partnership)

				for partnership in partnerships_with_all_contacts:
					users = cast(
						List[models.User],
						session.query(models.User).filter(
							models.User.company_id == partnership_lookup[partnership].vendor_id
						).filter(
							models.User.is_deleted != True
						).all())

					for user in users:
						new_company_vendor_contact = models.CompanyVendorContact( # type: ignore
							partnership_id=partnership,
							vendor_user_id=user.id,
						)

						session.add(new_company_vendor_contact)
						print(f"added {user.id} to vendor contacts for {partnership}")

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

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
