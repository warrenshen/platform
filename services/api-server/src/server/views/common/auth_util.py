from functools import wraps
from typing import Any, Callable, List

from bespoke import errors
from bespoke.db import db_constants, models
from flask import Response, abort, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from mypy_extensions import TypedDict
from server.views.common import handler_util

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



def bank_admin_required(f: Callable[..., Response]) -> Response:

	@jwt_required
	def inner_func(*args: Any, **kwargs: Any) -> Response:
		user_session = UserSession.from_session()
		if not user_session.is_bank_admin():
			return handler_util.make_error_response(errors.Error('Access Denied'))

		return f(*args, **kwargs)

	return inner_func

def login_required(f: Callable[..., Response]) -> Response:

	@jwt_required
	def inner_func(*args: Any, **kwargs: Any) -> Response:
		return f(*args, **kwargs)

	return inner_func

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


def requires_async_magic_header(f: Callable) -> Callable:
	@wraps(f)
	def wrapped(*args: Any, **kwargs: Any) -> Response:
		value = request.headers.get('x-api-key', '').strip()
		desired_key = current_app.config.get('ASYNC_SERVER_API_KEY')
		if not value or not desired_key or value != desired_key:
			abort(401)
		return f(*args, **kwargs)
	return wrapped
