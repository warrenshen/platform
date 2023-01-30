from functools import wraps
from typing import Any, Callable, Optional, cast

from bespoke import errors
from bespoke.db import models, db_constants
from bespoke.security import security_util
from flask import Response, abort, current_app, request
from flask_jwt_extended import jwt_required
from server.config import Config
from server.views.common import handler_util
from server.views.common.session_util import UserSession, UserPayloadDict, UserImpersonatorPayloadDict


"""
Company ID and Role-related headers do not come from the
User model to support cases where these headers are overriden.
"""
def get_claims_payload(
	user: models.User,
	role: str,
	company_id: Optional[str],
) -> UserPayloadDict:
	user_id = str(user.id) if user.id else ''
	parent_company_id = str(user.parent_company_id) if user.parent_company_id else ''
	company_id = company_id if company_id else ''
	allowed_roles = db_constants.INHERITED_ROLES_TO_BASE_ROLES.get(role, [])

	claims_payload: UserPayloadDict = {
		'X-Hasura-User-Id': user_id,
		'X-Hasura-Default-Role': role,
		'X-Hasura-Allowed-Roles': [role, *allowed_roles],
		'X-Hasura-Parent-Company-Id': parent_company_id,
		'X-Hasura-Company-Id': company_id,
	}
	return claims_payload

"""
Company ID and Role-related headers do not come from the
User model to support cases where these headers are overriden.
"""
def get_impersonator_claims_payload(
	user: models.User,
	role: str,
	impersonator_user_id: str,
	company_id: Optional[str],
) -> UserImpersonatorPayloadDict:
	user_id = str(user.id) if user.id else ''
	parent_company_id = str(user.parent_company_id) if user.parent_company_id else ''
	company_id = company_id if company_id else ''
	impersonator_user_id = str(impersonator_user_id) if impersonator_user_id else ''
	allowed_roles = db_constants.INHERITED_ROLES_TO_BASE_ROLES.get(role, [])

	claims_payload: UserImpersonatorPayloadDict = {
		'X-Hasura-User-Id': user_id,
		'X-Hasura-Default-Role': role,
		'X-Hasura-Allowed-Roles': [role, *allowed_roles],
		'X-Hasura-Parent-Company-Id': parent_company_id,
		'X-Hasura-Company-Id': company_id,
		'X-Hasura-Impersonator-User-Id': impersonator_user_id,
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

def bank_admin_or_bespoke_catalog_data_entry_required(f: Callable[..., Response]) -> Response:

	@jwt_required
	def inner_func(*args: Any, **kwargs: Any) -> Response:
		user_session = UserSession.from_session()
		if not user_session.is_bank_admin() and not user_session.is_bespoke_catalog_data_entry():
			return handler_util.make_error_response(errors.Error('Access Denied'))

		return f(*args, **kwargs)

	return inner_func

def login_required(f: Callable[..., Response]) -> Response:

	@jwt_required
	def inner_func(*args: Any, **kwargs: Any) -> Response:
		return f(*args, **kwargs)

	return inner_func

def requires_async_header_or_bank_admin(f: Callable) -> Callable:
	@wraps(f)
	def wrapped(*args: Any, **kwargs: Any) -> Response:
		# Check for bank admin
		user_session = UserSession.from_session()
		not_bank_admin = not user_session.is_bank_admin()

		# Check for async header
		value = request.headers.get('x-api-key', '').strip()
		desired_key = current_app.config.get('ASYNC_SERVER_API_KEY')
		async_not_valid = not value or not desired_key or value != desired_key

		# If *both* are invalid, then we should abort
		if not_bank_admin and async_not_valid:
			abort(401)
		return f(*args, **kwargs)
	return wrapped

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
