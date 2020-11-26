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

	models.Customer.__table__.drop(engine)

class TestWorkflows(unittest.TestCase):

	def test_po_actions(self) -> None:
		db_url = get_db_url()
		Path('tmp').mkdir(parents=True, exist_ok=True)
		_delete_db(db_url)
		engine = sqlalchemy.create_engine(db_url)
		models.Base.metadata.create_all(engine)

		session_maker = sessionmaker(engine)
		customer1 = make_customer('customer1')
		customer_name = customer1.name
		with session_scope(session_maker) as session:
			session.add(customer1)

		with session_scope(session_maker) as session:
			query_customer1 = session.query(models.Customer).first()
			self.assertEqual(customer_name, query_customer1.name)

		self.assertTrue(True)
