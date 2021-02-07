"""
	A class that helps you setup tests against a test SQLLite database
"""
import datetime
import sqlalchemy
import unittest

from pathlib import Path
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils.functions import database_exists
from typing import Callable

from bespoke.db import models

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

	#session_maker: Callable = None

	def setUp(self) -> None:
		db_url = get_db_url()
		Path('tmp').mkdir(parents=True, exist_ok=True)
		_delete_db(db_url)
		engine = sqlalchemy.create_engine(db_url)
		models.Base.metadata.create_all(engine)
		self.session_maker = sessionmaker(engine)



