"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import csv
import os
import sys
import time
from os import path
from typing import Dict, List, Iterable, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models, queries
from bespoke.db.db_constants import CustomerRoles
from bespoke.finance import contract_util
from bespoke.metrc.common.metrc_common_util import chunker

class RoleImport():
	email: str
	financials: bool
	po_edits: bool
	repayments: bool
	executive: bool
	sales_rep: bool
	other: str = "" # this wasn't filled out in the import doc, just leaving for completeness

def main(is_test_run: bool = True) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	
	roles_to_import: List[RoleImport] = []
	with open('scripts/data/bespoke_customer_user_roles.csv', newline='', encoding='utf-8-sig') as csvfile:
		reader = csv.DictReader(csvfile, delimiter=',')

		for row in reader:
			# Col 0: company name
			# Col 1: full_name
			# Col 2: email
			# Col 3: phone_number
			# Col 4: financials
			# Col 5: po_edits
			# Col 6: repayments
			# Col 7: executive
			# Col 8: sales_rep
			# Col 9: other
			role = RoleImport()
			
			role.email = row['email']
			role.financials = True if row['financials'] == "Y" else False
			role.po_edits = True if row['po_edits'] == "Y" else False
			role.repayments = True if row['repayments'] == "Y" else False
			role.executive = True if row['executive'] == "Y" else False
			role.sales_rep = True if row['sales_rep'] == "Y" else False

			roles_to_import.append(role)

	with models.session_scope(session_maker) as session:
		for role_chunk in cast(Iterable[List[RoleImport]], chunker(roles_to_import, 50)):
			print(f'[Page {current_page + 1}] importing customer user roles from a csv')

			role_emails: List[str] = []
			role_dict: Dict[str, RoleImport] = {}
			for role in role_chunk:
				role_emails.append(role.email)
				role_dict[role.email] = role

			users = cast(
				List[models.User],
				session.query(models.User).filter(
					models.User.email.in_(role_emails)
				).all())

			if not is_test_run:
				for user in users:
					user.company_role_new = {}
					
					user.company_role_new[CustomerRoles.FINANCIALS] = role_dict[user.email].financials
					user.company_role_new[CustomerRoles.PURCHASE_ORDER_EDITS] = role_dict[user.email].po_edits
					user.company_role_new[CustomerRoles.REPAYMENTS] = role_dict[user.email].repayments
					user.company_role_new[CustomerRoles.EXECUTIVE] = role_dict[user.email].executive
					user.company_role_new[CustomerRoles.SALES_REP] = role_dict[user.email].sales_rep
					user.company_role_new[CustomerRoles.OTHER] = role_dict[user.email].other

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
