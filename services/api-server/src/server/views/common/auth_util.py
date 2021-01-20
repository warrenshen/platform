from mypy_extensions import TypedDict
from bespoke.db import models
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

	def is_bank_admin(self) -> bool:
		return 'bank_admin' in self.payload['X-Hasura-Allowed-Roles']