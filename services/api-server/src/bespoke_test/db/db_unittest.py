"""
	A class that helps you setup tests against a test SQLLite database
"""
import datetime
import unittest
from pathlib import Path
from typing import Callable

import sqlalchemy
from bespoke.db import models
from bespoke_test.db import test_helper
from manage import app
from manage_async import app as async_app
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils.functions import database_exists


def get_db_url() -> str:
	return 'sqlite:///tmp/test.db'


def _delete_db(db_url: str) -> None:
	if not db_url.startswith('sqlite'):
		raise Exception('Cannot delete not sqlite databases')

	if not database_exists(db_url):
		return

	print('Deleting all tables with engine url: {}'.format(db_url))
	engine = sqlalchemy.create_engine(db_url)

	models.Base.metadata.drop_all(engine)

class TestCase(unittest.TestCase):

	def reset(self) -> None:
		db_url = get_db_url()
		Path('tmp').mkdir(parents=True, exist_ok=True)
		_delete_db(db_url)
		engine = sqlalchemy.create_engine(db_url)
		models.Base.metadata.create_all(engine)
		self.session_maker = sessionmaker(engine)
		app.session_maker = self.session_maker
		async_app.session_maker = self.session_maker

	def setUp(self) -> None:
		self.reset()

	def seed_database(self) -> test_helper.BasicSeed:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()
		return seed
