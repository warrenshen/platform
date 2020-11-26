import sqlalchemy
import unittest

from pathlib import Path
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils.functions import database_exists

from bespoke.db import models
from bespoke.db.models import session_scope

def make_customer(prefix: str) -> models.Customer:
	return models.Customer(
		name=prefix + '-name',
		phone='310-888-8888',
		email=prefix + '@gmail.com'
	)

def get_db_url() -> str:
	return 'sqlite:///tmp/test.db'

def _delete_db(db_url: str) -> None:
	if not db_url.startswith('sqlite'):
		raise Exception('Cannot delete not sqlite databases')

	if not database_exists(db_url):
		return

	print('Deleting all tables with engine url: {}'.format(db_url))
	engine = sqlalchemy.create_engine(db_url)

	table_classes = [
		('customers', models.Customer), 
		('purchase_orders', models.PurchaseOrder)
	]
	for (table_name, table_class) in table_classes:
		if not engine.dialect.has_table(engine, table_name):
			continue
		table_class.__table__.drop(engine)

class TestWorkflows(unittest.TestCase):

	def test_po_actions(self) -> None:
		db_url = get_db_url()
		Path('tmp').mkdir(parents=True, exist_ok=True)
		_delete_db(db_url)
		engine = sqlalchemy.create_engine(db_url)
		models.Base.metadata.create_all(engine)
		session_maker = sessionmaker(engine)

		# Create the customer
		customer1 = make_customer('customer1')
		customer_name = customer1.name
		with session_scope(session_maker) as session:
			session.add(customer1)

		# Customer creates the purchase order
		po_number = 'po_12345678'
		with session_scope(session_maker) as session:
			session.add(models.PurchaseOrder(
				number=po_number,
				total_requested=3000.02,
				confirmed=False
			))

		# Checks based on first couple DB queries
		with session_scope(session_maker) as session:
			query_customer1 = session.query(models.Customer).first()
			self.assertEqual(customer_name, query_customer1.name)

			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.number == po_number).first()
			self.assertFalse(po.confirmed)

		# Anchor confirms the purchase order
		with session_scope(session_maker) as session:
			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.number == po_number).first()
			po.confirmed = True

		# Checks

		with session_scope(session_maker) as session:
			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.number == po_number).first()
			self.assertTrue(po.confirmed)
