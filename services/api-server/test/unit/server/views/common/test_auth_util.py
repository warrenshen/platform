import unittest
from typing import Dict, List, Optional

from server.views.common import auth_util

def _get_user(
	user_id: str,
	roles: List[str],
	parent_company_id: Optional[str],
	company_id: Optional[str],
) -> auth_util.UserPayloadDict:
	return {
		'X-Hasura-User-Id': user_id,
		'X-Hasura-Default-Role': roles[0] if roles else '',
		'X-Hasura-Allowed-Roles': roles,
		'X-Hasura-Parent-Company-Id': parent_company_id,
		'X-Hasura-Company-Id': company_id,
	}

def _get_bank_user(parent_company_id: str, company_id: Optional[str]) -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='bank-user1',
		roles=['bank_admin'],
		parent_company_id=parent_company_id,
		company_id=company_id,
	))

def _get_company_admin_user(parent_company_id: str, company_id: Optional[str]) -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='company-admin1',
		roles=['company_admin'],
		parent_company_id=parent_company_id,
		company_id=company_id,
	))

def _get_guest_user() -> auth_util.UserSession:
	return auth_util.UserSession(_get_user(
		user_id='guest',
		roles=[],
		parent_company_id=None,
		company_id=None,
	))

class TestUserSession(unittest.TestCase):

	def test_is_bank_or_this_company_admin(self) -> None:
		tests: List[Dict] = [
			dict(expected=True, user_session=_get_bank_user(parent_company_id=None, company_id=None), company_id=None),
			dict(expected=True, user_session=_get_company_admin_user(parent_company_id='id1234', company_id='id1234'), company_id='id1234'),
			dict(expected=False, user_session=_get_company_admin_user(parent_company_id='id987', company_id='id987'), company_id='id1234'),
			dict(expected=False, user_session=_get_guest_user(), company_id='id1234'),
		]
		for t in tests:
			self.assertEqual(
				t['expected'],
				t['user_session'].is_bank_or_this_company_admin(t['company_id']))
