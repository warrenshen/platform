"""
	A file for functions to creating objects that are helpful when using the database.
"""
import logging
import traceback
import unittest
from typing import Any, Callable, Dict, List

from bespoke.db import models
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict


def assertIsCurrencyRounded(
	test_case: unittest.TestCase, expected: float) -> None:
	test_case.assertEqual(round(expected, 2), expected)

def assertDeepAlmostEqual(
	test_case: unittest.TestCase, expected: Dict, actual: Dict, *args: Any, **kwargs: Any) -> None:
	"""
	Assert that two complex structures have almost equal contents.

	Compares lists, dicts and tuples recursively. Checks numeric values
	using test_case's :py:meth:`unittest.TestCase.assertAlmostEqual` and
	checks all other values with :py:meth:`unittest.TestCase.assertEqual`.
	Accepts additional positional and keyword arguments and pass those
	intact to assertAlmostEqual() (that's how you specify comparison
	precision).

	:param test_case: TestCase object on which we can call all of the basic
	'assert' methods.
	:type test_case: :py:class:`unittest.TestCase` object
	"""
	is_root = not '__trace' in kwargs
	trace = kwargs.pop('__trace', 'ROOT')
	key = None
	try:
		if isinstance(expected, (int, float)):
			test_case.assertAlmostEqual(expected, actual, *args, **kwargs)
		elif isinstance(expected, (list, tuple)):
			test_case.assertEqual(len(expected), len(actual))
			for index in range(len(expected)):
				v1, v2 = expected[index], actual[index]
				assertDeepAlmostEqual(test_case, v1, v2, __trace=repr(index), *args, **kwargs)
		elif isinstance(expected, dict):
			test_case.assertEqual(set(expected), set(actual))
			for key in expected:
				assertDeepAlmostEqual(test_case, expected[key], actual[key], __trace=repr(key), *args, **kwargs)
		else:
				test_case.assertEqual(expected, actual)
	except AssertionError as exc:
		exc.__dict__.setdefault('traces', []).append(trace)
		if is_root:
			#trace = ' -> '.join(traceback.format_stack())
			exc = AssertionError("%s. Key=%s" % (exc, key))
		raise exc

TestUser = TypedDict('TestUser', {
	'user_id': str,
	'company_id': str
})

TestAccountInfo = TypedDict('TestAccountInfo', {
	'user': TestUser
})

BasicSeedData = TypedDict('BasicSeedData', {
	'bank_admins': List[TestAccountInfo], # this is the bank admin
	'company_admins': List[TestAccountInfo] # this is the distributor
})

class BasicSeed(object):
	"""
	  A basic seed setup that includes bank admins and company_admins at different companies
	"""

	def __init__(self, session_maker: Callable, test_self: Any, private: bool) -> None:
		self.session_maker = session_maker
		self.data = BasicSeedData(
			bank_admins=[],
			company_admins=[]
		)
		self.test_self = test_self

	def _setup_bank_users(self, session: Any) -> None:
		num_bank_admins = 2

		company_settings = models.CompanySettings()
		session.add(company_settings)
		session.flush()

		bank_company = models.Company(
				name='Bespoke Financial',
				company_settings_id=str(company_settings.id)
			)
		session.add(bank_company)
		session.flush()

		for i in range(num_bank_admins):

			bank_user = models.User(
				company_id=str(bank_company.id),
				email='bankadmin+user{}@gmail.com'.format(i),
				password='somepass{}'.format(i),
				role='bank_admin',
				first_name='Bank Admin',
				last_name='User',
			)
			session.add(bank_user)
			session.flush()
			bank_admin = TestAccountInfo(
				user=TestUser(
			  	user_id=bank_user.id,
			  	company_id=bank_company.id
		  	)
			)
			self.data['bank_admins'].append(bank_admin)

		test_self = self.test_self
		for i in range(num_bank_admins):
			test_self.assertIsNotNone(self.data['bank_admins'][i]['user']['user_id'])
			test_self.assertIsNotNone(self.data['bank_admins'][i]['user']['company_id'])

	def _setup_company_users(self, session: Any) -> None:
			# Setup the company admin (for the distributor account)

		num_companies = 3
		for i in range(num_companies):
			company_settings = models.CompanySettings()
			session.add(company_settings)
			session.flush()
			company_settings_id = str(company_settings.id)

			customer_company = models.Company(
				name='Distributor_{}'.format(i),
				company_settings_id=company_settings_id
			)
			session.add(customer_company)
			session.flush()
			company_id = customer_company.id
			company_settings.company_id = company_id

			company_user = models.User(
				company_id=company_id,
				email='companyadmin+user{}@gmail.com'.format(i),
				password='somepass_c{}'.format(i),
				role='company_admin',
				first_name='Company Admin',
				last_name='User',
			)
			session.add(company_user)
			session.flush()
			company_admin = TestAccountInfo(
				user=TestUser(
			  	user_id=company_user.id,
			  	company_id=company_id
		  	)
			)
			self.data['company_admins'].append(company_admin)


		# Assert things got setup properly
		test_self = self.test_self
		for i in range(num_companies):
			test_self.assertIsNotNone(self.data['company_admins'][i]['user']['user_id'])
			test_self.assertIsNotNone(self.data['company_admins'][i]['user']['company_id'])

		company0 = self.data['company_admins'][0]
		company1 = self.data['company_admins'][1]
		company2 = self.data['company_admins'][2]
		test_self.assertNotEqual(company0['user']['company_id'], company1['user']['company_id'])
		test_self.assertNotEqual(company1['user']['company_id'], company2['user']['company_id'])

	def initialize(self) -> None:

		with session_scope(self.session_maker) as session:
			self._setup_bank_users(session)
			self._setup_company_users(session)

	def get_company_id(self, account_role: str, index: int = 0) -> str:
		"""
			When account_role='bank_admin' and index = 0, this will get the company ID for
			first bank_admin setup in the system, and so on and so forth.
		"""
		if account_role == 'bank_admin':
			return str(self.data['bank_admins'][index]['user']['company_id'])
		elif account_role == 'company_admin':
			return str(self.data['company_admins'][index]['user']['company_id'])

		raise Exception('Unsupported account_role for get_company_id')

	def get_user_id(self, account_role: str, index: int = 0) -> str:
		"""
			When account_role='company_admin' and index = 1, this will get the company ID for
			second bank_admin setup in the system, and so on and so forth.
		"""
		if account_role == 'bank_admin':
			return str(self.data['bank_admins'][index]['user']['user_id'])
		elif account_role == 'company_admin':
			return str(self.data['company_admins'][index]['user']['user_id'])

		raise Exception('Unsupported account_role for get_user_id')

	@staticmethod
	def create(session_maker: Callable, test_self: Any) -> 'BasicSeed':
		return BasicSeed(session_maker, test_self, private=True)

