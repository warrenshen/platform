from flask_jwt_extended import get_jwt_identity
from mypy_extensions import TypedDict
from typing import List

from bespoke.db import db_constants

UserPayloadDict = TypedDict('UserPayloadDict', {
	'X-Hasura-User-Id': str,
	'X-Hasura-Default-Role': str,
	'X-Hasura-Allowed-Roles': List[str],
	'X-Hasura-Parent-Company-Id': str,
	'X-Hasura-Company-Id': str,
})

class UserSession(object):

	def __init__(self, payload: UserPayloadDict) -> None:
		self.payload = payload

	def _user_roles(self) -> List[str]:
		if not self.payload:
			return []
		return self.payload['X-Hasura-Allowed-Roles']

	def get_company_id(self) -> str:
		if not self.payload:
			return None

		company_id = self.payload['X-Hasura-Company-Id']
		if company_id and company_id == 'None':
			return None

		return company_id

	def get_user_id(self) -> str:
		if not self.payload:
			return None

		return self.payload['X-Hasura-User-Id']

	def has_bank_reader_permission(self) -> bool:
		return db_constants.is_bank_user(self._user_roles())

	def is_company_admin(self) -> bool:
		return 'company_admin' in self._user_roles()

	def is_bank_admin(self) -> bool:
		return 'bank_admin' in self._user_roles()

	def is_company_admin_of_this_company(self, company_id: str) -> bool:
		return self.get_company_id() == company_id

	def is_bank_or_this_company_admin(self, company_id: str) -> bool:
		"""
			Returns true if you are a bank admin or if you are this company's company admin.
			Many operations require this check, because most operations can only be done
			by a company admin of their own company, or a bank admin.
		"""
		return self.is_bank_admin() or self.is_company_admin_of_this_company(company_id)

	@staticmethod
	def from_session() -> 'UserSession':
		return UserSession(get_jwt_identity())
