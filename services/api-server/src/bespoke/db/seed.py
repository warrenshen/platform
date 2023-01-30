import contextlib
import logging
import os
from typing import Any, Callable, cast

import sqlalchemy
from bespoke.companies import create_company_util, create_user_util
from bespoke.db import models
from bespoke.db.db_constants import ALL_USER_BASE_ROLES, UserRoles
from bespoke.db.models import session_scope
from bespoke.db.seed_util import create_partnership_req, create_company_settings_and_company, create_user_inside_a_company, create_company_license, create_company_vendor_partnership
from server.config import is_test_env
from server.views.common import auth_util
from sqlalchemy.orm import sessionmaker

SEED_USER_PASSWORD = 'password123'

SEED_CUSTOMER_TUPLES = [
	('Inventory Financing Customer', 'C1-IF', 'INVENTORY FINANCING, INC.'),
	('Line of Credit Customer', 'C2-LOC', 'LINE OF CREDIT, INC.'),
	('Multilocation Customer', 'C3-MULTI-LOC', 'LINE OF CREDIT, INC.'),
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
	('C3-MULTI-LOC', UserRoles.COMPANY_ADMIN, 'multilocation@customer.com', SEED_USER_PASSWORD),
]

CUSTOMER_IDENTIFIER_INVENTORY_FINANCING = 'C1-IF'

USER_EMAIL_INVENTORY_FINANCING = 'inventoryfinancing@customer.com'

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
			company.parent_company_id = None
			company.company_settings_id = None
			company.contract_id = None
			company.parent_company_id = None
		session.flush()
	
	# Delete rows from table that require special handling to prevent foreign key constraint issues.
	with session_scope(session_maker) as session:
		company_partnerships = session.query(models.CompanyPartnershipRequest).all()
		for company_partnership in company_partnerships:
			cast(Callable, session.delete)(company_partnership)
		session.flush()

		ebba_application_files = session.query(models.EbbaApplicationFile).all()
		for ebba_application_file in ebba_application_files:
			cast(Callable, session.delete)(ebba_application_file)
		session.flush()

		po_files = session.query(models.PurchaseOrderFile).all()
		for po_file in po_files:
			cast(Callable, session.delete)(po_file)
		session.flush()

		transactions = session.query(models.Transaction).all()
		for transaction in transactions:
			cast(Callable, session.delete)(transaction)
		session.flush()

		payments = session.query(models.Payment).all()
		for payment in payments:
			cast(Callable, session.delete)(payment)
		session.flush()

		files = session.query(models.File).all()
		for file in files:
			cast(Callable, session.delete)(file)

	# Delete all rows in all tables, but do NOT drop the tables.
	with contextlib.closing(engine.connect()) as con:
		trans = con.begin()
		for table in reversed(models.Base.metadata.sorted_tables):
			cast(Callable, con.execute)(table.delete())
		cast(Callable, trans.commit)()

	# Populate rows of tables.
	with app.app_context():
		with session_scope(session_maker) as session:
			for user_role in ALL_USER_BASE_ROLES:
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
						session=session,
						name=name,
						identifier=identifier,
						contract_name=contract_name,
						dba_name='',
					)

					# For the multilocation company, set the first company as the parent company
					if identifier == "C3-MULTI-LOC":
						customer.parent_company_id = session.query(models.Company).first().parent_company_id

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
						req=create_user_util.CreateBankOrCustomerUserInputDict(
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
						created_by_user_id=None,
					)
					user = session.query(models.User).get(user_id)
					auth_util.create_login_for_user(user, password)

					if err:
						print(err)
		
		# Create an approved vendor for a company
		with session_scope(session_maker) as session:
			requesting_company = session.query(models.Company).filter_by(
				identifier=CUSTOMER_IDENTIFIER_INVENTORY_FINANCING,
			).first()
			user = session.query(models.User).filter_by(
				email=USER_EMAIL_INVENTORY_FINANCING,
			).first()

			create_partnership_req(
				requesting_company_id=requesting_company.id,
				requested_by_user_id=user.id,
				session=session,
			)

			company = create_company_settings_and_company(session=session)

			create_user_inside_a_company(
				parent_company_id=str(company.parent_company_id),
				company_id=company.id,
				session=session,
			)

			create_company_license(
				company_id=company.id,
				session=session,
			)

			create_company_vendor_partnership(
				company_id=requesting_company.id,
				vendor_id=company.id,
				session=session,
			)
