
from typing import Any, Callable, Dict, Tuple, TypeVar

T = TypeVar('T')

class Error(Exception):

	def __init__(self, msg: str, details: Dict = None) -> None:
		self.msg = msg
		self.details = details

	def __str__(self) -> str:
		if self.details:
			return '{}; Details: {}'.format(self.msg, self.details)

		return '{}'.format(self.msg)

	def __repr__(self) -> str:
		return str(self)

def return_error_tuple(f: Callable[..., T]) -> Callable[..., Tuple[T, Error]]:

	def inner_func(*args: Any, **kwargs: Any) -> Tuple[T, Error]:
		try:
			return f(*args, **kwargs), None
		except Error as e:
			return None, e
		except Exception as e:
			return None, Error('{}'.format(e))

	return inner_func

def return_error(f: Callable[..., T]) -> Callable[..., Error]:

	def inner_func(*args: Any, **kwargs: Any) -> Error:
		try:
			f(*args, **kwargs)
			return None
		except Error as e:
			return e
		except Exception as e:
			return Error('{}'.format(e))

	return inner_func
