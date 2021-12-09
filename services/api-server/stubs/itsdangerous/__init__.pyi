from typing import Any, Union, Dict

class URLSafeTimedSerializer(object):

	def __init__(self, secret_key: str, salt: str, signer_kwargs: Any) -> None:
		pass

	def loads(self, s: str, max_age: int = None) -> str:
		pass

	def dumps(self, s: Union[str, Dict]) -> str:
		pass