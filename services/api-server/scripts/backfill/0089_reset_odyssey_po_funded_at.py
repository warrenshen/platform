"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
import time
from os import path
from typing import List, cast
from string import Template

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models
from bespoke.finance.loans import sibling_util
from bespoke.finance import number_util

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	is_done = False
	
	while not is_done:
		with models.session_scope(session_maker) as session:
			try:
				companies = cast(
					List[models.Company],
					session.query(models.Company).order_by(
						models.Company.id
					).all())

			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue
			
			for c in companies:

				try:
					purchase_order_batch = cast(
						List[models.PurchaseOrder],
						session.query(models.PurchaseOrder).filter(
							models.PurchaseOrder.company_id == c.id
						).order_by(
							models.PurchaseOrder.id
						).all())

				except Exception as e:
					print(e)
					print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
					time.sleep(5)
					continue

				for po in purchase_order_batch:
					if po.funded_at is None:
						funded_amount = sibling_util.get_funded_loan_sum_on_artifact(session, po.id)

						if number_util.float_eq( funded_amount, po.max_loan_amount() ):
							# Now that we know that the PO *should* be updated. Grab the loans associated
							# with the PO so that we can pull the funded_at date of the most recent loan
							try:
								loans = cast(
									List[models.Loan],
									session.query(models.Loan).filter(
										models.Loan.artifact_id == po.id
									).order_by(
										models.Loan.funded_at.desc()
									).all())

							except Exception as e:
								print(e)
								print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
								time.sleep(5)
								continue

							most_recent_loan = loans[0]

							if not is_test_run:
								try:
									session.query(models.PurchaseOrder). \
									   filter(models.PurchaseOrder.id == po.id). \
									   update({"funded_at": most_recent_loan.funded_at})
									t = Template("[SUCCESS]: Purchase order $po for company $c now see funded_at field to $fa.")
									s = t.substitute(po=po.id, c=c.name, fa=most_recent_loan.funded_at)
									print(s)

								except Exception as e:
									print(e)
									print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
									time.sleep(5)
									continue
						else:
							t = Template("[INFO]: Purchase order $po for company $c does not meet max loan amount of $max_amount. Current loan amount is $current_amount. No updates required.")
							s = t.substitute(po=po.id, c=c.name, max_amount=po.max_loan_amount(), current_amount=po.amount_funded)
							print(s)

			is_done = True

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
