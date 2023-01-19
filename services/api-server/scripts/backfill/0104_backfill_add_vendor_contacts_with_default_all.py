"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import Callable, Dict, List, cast

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

				for partnership in partnerships:
					partnership_contacts = cast(
						List[models.CompanyVendorContact],
						session.query(models.CompanyVendorContact).filter(
							models.CompanyVendorContact.partnership_id == partnership.id
						).all())

					active_contact_user_ids: List[str] = []
					inactive_contact_user_ids: List[str] = []
					for contact in partnership_contacts:
						if contact.is_active is None or contact.is_active is True:
							contact.is_active = True
							active_contact_user_ids.append(str(contact.vendor_user_id))
						else:
							inactive_contact_user_ids.append(str(contact.vendor_user_id))

					inactive_vendor_users = cast(
						List[models.User],
						session.query(models.User).filter(
							~models.User.id.in_(active_contact_user_ids)
						).filter(
							cast(Callable, models.User.is_deleted.isnot)(True)
						).filter(
							models.User.company_id == partnership.vendor_id
						).all())

					for user in inactive_vendor_users:
						if not is_test_run and str(user.id) not in inactive_contact_user_ids:
							session.add(models.CompanyVendorContact( # type: ignore
								partnership_id = str(partnership.id),
								vendor_user_id = str(user.id),
								is_active = False,
							))

							print(f"added {user.id} to vendor contacts for {partnership.id}")

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

	main(is_test_run=is_test_run)
