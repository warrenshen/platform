from functools import wraps
from typing import Any, Callable, List, Optional, cast

from bespoke import errors
from bespoke.db import db_constants, models
from bespoke.security import security_util
from flask import Response, abort, current_app, request
from flask_jwt_extended import jwt_required
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import handler_util
from server.views.common.session_util import UserSession, UserPayloadDict


def get_claims_payload(
	user: models.User,
	company_id: Optional[str],
) -> UserPayloadDict:
	user_id = str(user.id) if user.id else ''
	parent_company_id = str(user.parent_company_id) if user.parent_company_id else ''
	company_id = company_id if company_id else ''

	claims_payload: UserPayloadDict = {
		'X-Hasura-User-Id': user_id,
		'X-Hasura-Default-Role': user.role,
		'X-Hasura-Allowed-Roles': [user.role],
		'X-Hasura-Parent-Company-Id': parent_company_id,
		'X-Hasura-Company-Id': company_id,
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


def requires_async_magic_header(f: Callable) -> Callable:
	@wraps(f)
	def wrapped(*args: Any, **kwargs: Any) -> Response:
		value = request.headers.get('x-api-key', '').strip()
		desired_key = current_app.config.get('ASYNC_SERVER_API_KEY')
		if not value or not desired_key or value != desired_key:
			abort(401)
		return f(*args, **kwargs)
	return wrapped


def create_login_for_user(user: models.User, password: str) -> None:
	cfg = cast(Config, current_app.app_config)
	user.password = security_util.hash_password(cfg.PASSWORD_SALT, password)
