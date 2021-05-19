import contextlib
import logging
import os
from typing import Any, Callable, cast

import sqlalchemy
from bespoke.companies import create_company_util, create_user_util
from bespoke.db import models
from bespoke.db.db_constants import ALL_USER_ROLES, UserRoles
from bespoke.db.models import session_scope
from server.config import is_test_env
from server.views.common import auth_util
from sqlalchemy.orm import sessionmaker

SEED_USER_PASSWORD = 'password123'

SEED_CUSTOMER_TUPLES = [
	('Inventory Financing Customer', 'C1-IF', 'INVENTORY FINANCING, INC.'),
	('Line of Credit Customer', 'C2-LOC', 'LINE OF CREDIT, INC.'),
]

# Users
# company_identifier
# role
# email
# password
SEED_USER_TUPLES = [
	(None, UserRoles.BANK_ADMIN, 'admin@bank.com', SEED_USER_PASSWORD),
	('C1-IF', UserRoles.COMPANY_ADMIN, 'inventoryfinancing@customer.com', SEED_USER_PASSWORD),
	('C2-LOC', UserRoles.COMPANY_ADMIN, 'lineofcredit@customer.com', SEED_USER_PASSWORD),
]

def setup_db_test(app: Any) -> None:
	if not is_test_env(os.environ.get('FLASK_ENV')):
		logging.warning(f'Reset database not allowed in {os.environ.get("FLASK_ENV")} env...')
		return

	db_url = models.get_db_url()

	engine = sqlalchemy.create_engine(db_url)
	models.Base.metadata.create_all(engine)
	session_maker = sessionmaker(engine)

	with session_scope(session_maker) as session:
		companies = session.query(models.Company).all()
		for company in companies:
			company.company_settings_id = None
			company.contract_id = None
		session.flush()

	# Delete all rows in all tables, but do NOT drop the tables.
	with contextlib.closing(engine.connect()) as con:
		trans = con.begin()
		for table in reversed(models.Base.metadata.sorted_tables):
			cast(Callable, con.execute)(table.delete())
		cast(Callable, trans.commit)()

	# Populate rows of tables.
	with app.app_context():
		with session_scope(session_maker) as session:
			for user_role in ALL_USER_ROLES:
				new_user_role = models.UserRole(
					value=user_role,
					display_name=user_role,
				)
				session.add(new_user_role)

			session.flush()

			for seed_customer_tuple in SEED_CUSTOMER_TUPLES:
				name, identifier, contract_name = seed_customer_tuple

				existing_customer = session.query(models.Company).filter_by(
					is_customer=True,
					identifier=identifier,
				).first()

				if not existing_customer:
					customer = create_company_util.create_customer_company(
						name=name,
						identifier=identifier,
						contract_name=contract_name,
						dba_name='',
						session=session,
					)

		with session_scope(session_maker) as session:
			for seed_user_tuple in SEED_USER_TUPLES:
				company_identifier, role, email, password = seed_user_tuple

				if company_identifier is not None:
					existing_company = session.query(models.Company).filter_by(
						identifier=company_identifier,
					).first()
					company_id = str(existing_company.id)
				else:
					company_id = None

				existing_user = session.query(models.User).filter_by(
					email=email,
				).first()

				if not existing_user:
					user_id, err = create_user_util.create_bank_or_customer_user(
						req=create_user_util.CreateBankCustomerInputDict(
							company_id=company_id,
							user=create_user_util.UserInsertInputDict(
								role=role,
								first_name='Wiz',
								last_name='Khalifa',
								email=email,
								phone_number='+14204204200'
							),
						),
						session_maker=session_maker,
					)
					user = session.query(models.User).get(user_id)
					auth_util.create_login_for_user(user, password)

					if err:
						print(err)