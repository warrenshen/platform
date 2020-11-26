import sqlalchemy

from contextlib import contextmanager
from sqlalchemy import Column, Boolean, Float, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
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

class Customer(Base):
	"""
	   Bespoke gives money to a customer
	"""
	__tablename__ = 'customer'

	if False:
		pass
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

	if False:
		pass
	else:
		id = Column(Integer, primary_key=True)
		number = Column(String)
		total_requested = Column(Float)
		confirmed = Column(Boolean)
