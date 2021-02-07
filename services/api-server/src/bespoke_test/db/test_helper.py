"""
	A file for functions to creating objects that are helpful when using the database.
"""
import logging
from mypy_extensions import TypedDict
from typing import Callable, Any

from bespoke.db import models
from bespoke.db.models import session_scope

"""
def create_user(prefix: str) -> models.User:
	return models.User(
		name=prefix + '-name',
		phone='310-888-8888',
		email=prefix + '@gmail.com'
	)

def create_company(name: str) -> models.Company:
	return models.Company(
		name=name
	)
"""

TestUser = TypedDict('TestUser', {
	'user_id': str,
	'company_id': str 
})

TestAccountInfo = TypedDict('TestAccountInfo', {
	'user': TestUser
})

BasicSeedData = TypedDict('BasicSeedData', {
	'bank_admin': TestAccountInfo, # this is the bank admin
	'company_admin': TestAccountInfo # this is the distributor
})

class BasicSeed(object):
	"""
	  A basic seed setup that includes a bank admin at a company
	"""

	def __init__(self, session_maker: Callable, test_self: Any, private: bool) -> None:
		self.session_maker = session_maker
		self.data = BasicSeedData(
			bank_admin=TestAccountInfo(
				user=TestUser(
				  user_id=None,
				  company_id=None
			  )
			),
			company_admin=TestAccountInfo(
				user=TestUser(
					user_id=None,
					company_id=None
			  )
			)
		)
		self.test_self = test_self

	def initialize(self) -> None:
		with session_scope(self.session_maker) as session:
			# Setup the bank
			bank_company = models.Company(
				name='Bespoke Financial'
			)
			session.add(bank_company)
			session.flush()

			bank_user = models.User(
				company_id=str(bank_company.id),
				email='bankadmin+user1@gmail.com',
				password='somepass',
				role='bank_admin'
			)
			session.add(bank_user)
			session.flush()
			self.data['bank_admin']['user']['user_id'] = bank_user.id
			self.data['bank_admin']['user']['company_id'] = bank_company.id

			# Setup the company admin (for the distributor account)
			customer_company = models.Company(
				name='Distributor_1'
			)
			session.add(customer_company)
			session.flush()
			customer_user = models.User(
				company_id=str(customer_company.id),
				email='companyadmin+user1@gmail.com',
				password='somepass2',
				role='company_admin'
			)
			session.add(customer_user)
			session.flush()
			self.data['company_admin']['user']['user_id'] = customer_user.id
			self.data['company_admin']['user']['company_id'] = customer_company.id

		# Assert things got setup properly
		test_self = self.test_self
		test_self.assertIsNotNone(self.data['bank_admin']['user']['user_id'])
		test_self.assertIsNotNone(self.data['bank_admin']['user']['company_id'])
		test_self.assertIsNotNone(self.data['company_admin']['user']['user_id'])
		test_self.assertIsNotNone(self.data['company_admin']['user']['company_id'])

	def get_company_id(self, account_role: str) -> str:
		if account_role == 'bank_admin':
			return self.data['bank_admin']['user']['company_id']
		elif account_role == 'company_admin':
			return self.data['company_admin']['user']['company_id']

		raise Exception('Unsupported account_role for get_company_id')

	def get_user_id(self, account_role: str) -> str:
		if account_role == 'bank_admin':
			return self.data['bank_admin']['user']['user_id']
		elif account_role == 'company_admin':
			return self.data['company_admin']['user']['user_id']

		raise Exception('Unsupported account_role for get_user_id')

	@staticmethod
	def create(session_maker: Callable, test_self: Any) -> 'BasicSeed':
		return BasicSeed(session_maker, test_self, private=True)

