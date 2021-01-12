import logging
import os
import time
import uuid
from contextlib import contextmanager
from typing import TYPE_CHECKING, Any, Callable, Generator

import sqlalchemy
from sqlalchemy import JSON, Boolean, Column, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.exc import OperationalError, StatementError, TimeoutError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.query import Query as _Query
from sqlalchemy.pool import QueuePool

if TYPE_CHECKING:
    class Base(object):
        metadata = None  # type: Any

Base = declarative_base()  # type: ignore


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
        def __init__(self, email: str, password: str, company_id: str = None) -> None:
            self.company_id: str = None
            self.password: str = None
            self.email: str = None
            self.__table__: Any = None
    else:
        id = Column(UUID(as_uuid=True), primary_key=True)
        company_id = Column(UUID(as_uuid=True), nullable=True)
        email = Column(String(120), unique=True, nullable=False)
        password = Column(String(120), nullable=False)
        role = Column(String(120), nullable=False)


class Customer(Base):
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
    return os.environ.get('DATABASE_URL')


def create_engine() -> object:
    return sqlalchemy.create_engine(
        get_db_url(),
        connect_args={'connect_timeout': 100,
                      "options": "-c statement_timeout=3000"},
        pool_pre_ping=True,  # to prevent disconnect errors from causing runtime errors
        pool_recycle=3600,  # dont let connections last for longer than 1 hr
        # we want old connections to be recycled and thrown out, so only use the most recent connections
        pool_use_lifo=True,
        pool_size=3,  # Only allow 3 connections at most at once
        # We dont want to keep connections in memory, currently we only have about 100 max connections
        poolclass=QueuePool
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


class RevokedTokenModel(Base):
	__tablename__ = 'revoked_tokens'
	if TYPE_CHECKING:
		def __init__(self, jti: str, user_id:str) -> None:
			self.jti: str = None
			self.user_id: str = None
			self.__table__: Any = None
	else:
		id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
		user_id = Column(UUID(as_uuid=True), nullable=False)
		jti = Column(String(120), nullable=False)

    # def add(self):
    #     db.session.add(self)
    #     db.session.commit()

    # @classmethod
    # def is_jti_blacklisted(cls, jti):
    #     query = cls.query.filter_by(jti=jti).first()
    #     return bool(query)
