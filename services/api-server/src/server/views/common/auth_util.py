from mypy_extensions import TypedDict
from bespoke.db import models, db_constants
from typing import List

UserPayloadDict = TypedDict('UserPayloadDict', {
	'X-Hasura-User-Id': str,
	'X-Hasura-Default-Role': str,
	'X-Hasura-Allowed-Roles': List[str],
	'X-Hasura-Company-Id': str
})

def get_claims_payload(user: models.User) -> UserPayloadDict:
	claims_payload: UserPayloadDict = {
		'X-Hasura-User-Id': str(user.id),
		'X-Hasura-Default-Role': user.role,
		'X-Hasura-Allowed-Roles': [user.role],
		'X-Hasura-Company-Id': str(user.company_id),
	}
	return claims_payload

class UserSession(object):

	def __init__(self, payload: UserPayloadDict) -> None:
		self.payload = payload

	def _user_roles(self) -> List[str]:
		return self.payload['X-Hasura-Allowed-Roles']

	def get_company_id(self) -> str:
		return self.payload['X-Hasura-Company-Id']

	def get_user_id(self) -> str:
		return self.payload['X-Hasura-User-Id']

	def is_bank_user(self) -> bool:
		for user_role in self._user_roles():
			return user_role in db_constants.BANK_ROLES
		return False

	def is_company_admin(self) -> bool:
		return 'company_admin' in self._user_roles()

	def is_bank_admin(self) -> bool:
		return 'bank_admin' in self._user_roles()
