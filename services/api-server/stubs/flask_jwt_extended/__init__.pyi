from flask import Response
from typing import Union, Callable, Any, Dict


def create_access_token(identity: Union[str, Dict]) -> str:
	pass

def create_refresh_token(identity: Union[str, Dict]) -> str:
	pass

def get_jwt_identity() -> Dict:
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