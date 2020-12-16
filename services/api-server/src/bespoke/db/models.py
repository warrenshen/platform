import os
import logging
import sqlalchemy
import time

from contextlib import contextmanager
from sqlalchemy import Column, Boolean, Float, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError, StatementError, TimeoutError
from sqlalchemy.orm.query import Query as _Query
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from typing import TYPE_CHECKING, Any, Callable, Generator

if TYPE_CHECKING:
	class Base(object):
		metadata = None # type: Any

Base = declarative_base() # type: ignore

@contextmanager
def session_scope(session_maker: Callable) -> Generator:
	"""Provide a transactional scope around a series of operations."""
	session = session_maker()
	try:
		yield session
		session.commit()
	except:
		session.rollback()
		raise
	finally:
		session.close()

class User(Base):

    __tablename__ = 'users'

    if TYPE_CHECKING:
    	def __init__(self, username: str, password: str) -> None:
    		self.username: str = None
    		self.__table__: Any = None
    else:
	    id = Column(Integer, primary_key=True)
	    username = Column(String(120), unique=True, nullable=False)
	    password = Column(String(120), nullable=False)

class Customer(Base):
	"""
	   Bespoke gives money to a customer
	"""
	__tablename__ = 'customer'

	if TYPE_CHECKING:
		def __init__(self, name: str, phone: str, email: str) -> None:
			self.__table__: Any = None
	else:
		id = Column(Integer, primary_key=True)
		name = Column(String)
		phone = Column(String)
		email = Column(String)

class PurchaseOrder(Base):
	"""
	   Purchase orders created by customers for financing
	"""
	__tablename__ = 'purchase_orders'

	if TYPE_CHECKING:
		def __init__(self, number: str, total_requested: float, confirmed: bool) -> None:
			self.__table__: Any = None
	else:
		id = Column(Integer, primary_key=True)
		number = Column(String)
		total_requested = Column(Float)
		confirmed = Column(Boolean)

def get_db_url() -> str:
	return os.environ.get('DB_URL')

def create_engine() -> object:
	return sqlalchemy.create_engine(
		get_db_url(),
		connect_args={'connect_timeout': 100, "options": "-c statement_timeout=3000"},
		pool_pre_ping=True,  # to prevent disconnect errors from causing runtime errors
		pool_recycle=3600, # dont let connections last for longer than 1 hr
		pool_use_lifo=True, # we want old connections to be recycled and thrown out, so only use the most recent connections
		pool_size=3, # Only allow 3 connections at most at once
		poolclass=QueuePool # We dont want to keep connections in memory, currently we only have about 100 max connections
	)

class RetryingQuery(_Query):
	__retry_count__ = 4

	def __init__(self, *args: Any, **kwargs: Any) -> None:
		super().__init__(*args, **kwargs)

	def _log_and_sleep(self, attempts: int, ex: Exception) -> None:
		sleep_for = 2 ** (attempts - 1)
		logging.error(
			"Database connection error: {} - sleeping for {}s"
			" and will retry (attempt #{} of {})".format(
				ex, sleep_for, attempts, self.__retry_count__
			)
		)
		time.sleep(sleep_for)

	def __iter__(self) -> Any:
		attempts = 0
		while True:
			attempts += 1
			try:
				return super().__iter__()
			except TimeoutError as ex:
				if attempts < self.__retry_count__:
					self._log_and_sleep(attempts, ex)
					continue
				else:
					raise
			except OperationalError as ex:
				if attempts < self.__retry_count__:
					self._log_and_sleep(attempts, ex)
					continue
				else:
					raise
			except StatementError as ex:
				if "reconnect until invalid transaction is rolled back" not in str(ex):
					raise
				self.session.rollback()
			except Exception as e:
				logging.error('Got exception type({})'.format(type(e)))
				raise

def new_sessionmaker(engine: object) -> Callable:
	return sessionmaker(engine, query_cls=RetryingQuery)
