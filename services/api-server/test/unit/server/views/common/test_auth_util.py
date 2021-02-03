import unittest
from typing import List, Dict

from server.views.common import auth_util

def _get_user(user_id: str, roles: List[str], company_id: str) -> auth_util.UserPayloadDict:
	return {
		'X-Hasura-User-Id': user_id,
		'X-Hasura-Default-Role': roles[0] if roles else '',
		'X-Hasura-Allowed-Roles': roles,
		'X-Hasura-Company-Id': company_id
	}

def _get_bank_user(company_id: str) -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='bank-user1',
		roles=['bank_admin'],
		company_id=company_id
	))

def _get_company_admin_user(company_id: str) -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='company-admin1',
		roles=['company_admin'],
		company_id=company_id
	))

def _get_guest_user() -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='guest',
		roles=[],
		company_id=''
	))

class TestUserSession(unittest.TestCase):

	def test_is_bank_or_this_company_admin(self) -> None:

		tests: List[Dict] = [
			dict(expected=True, user_session=_get_bank_user('id1234'), company_id=None),
			dict(expected=True, user_session=_get_company_admin_user('id1234'), company_id='id1234'),
			dict(expected=False, user_session=_get_company_admin_user('id1234'), company_id='id987'),
			dict(expected=False, user_session=_get_guest_user(), company_id='1234')
		]
		for t in tests:
			self.assertEqual(t['expected'], t['user_session'].is_bank_or_this_company_admin(
				t['company_id']))
