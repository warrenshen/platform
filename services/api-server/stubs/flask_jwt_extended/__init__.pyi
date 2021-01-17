from flask import Response
from typing import Union, Callable, Any, Dict
from server.views.common import auth_util

def create_access_token(identity: auth_util.UserPayloadDict) -> str:
	pass

def create_refresh_token(identity: auth_util.UserPayloadDict) -> str:
	pass

def get_jwt_identity() -> auth_util.UserPayloadDict:
	pass

def get_raw_jwt() -> Dict:
	pass

def jwt_refresh_token_required(callable: Callable[[Any], Response]) -> Response:
	pass

def jwt_required(callable: Callable[[Any], Response]) -> Response:
	pass

class JWTManager(object):

	def __init__(self, app: Any) -> None:
		self.token_in_blacklist_loader: Callable[[Any], Response] = None