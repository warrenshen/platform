
from typing import cast, Any, Callable, Dict, Tuple, TypeVar

class Error(Exception):

	def __init__(self, msg: str, details: Dict = None, http_code: int = None) -> None:
		self.msg = msg
		self.details = details
		self.http_code = http_code

	def __str__(self) -> str:
		if self.details:
			return '{}; Details: {}'.format(self.msg, self.details)

		return '{}'.format(self.msg)

	def __repr__(self) -> str:
		return str(self)

# This machinery is needed to preserve the type of the function we are wrapping
FError = TypeVar('FError', bound=Callable[..., Any])

def return_error_tuple(f: FError) -> FError:

	def inner_func(*args: Any, **kwargs: Any) -> Tuple[Any, Error]:
		try:
			return f(*args, **kwargs)
		except Error as e:
			return None, e
		except Exception as e:
			return None, Error('{}'.format(e))

	return cast(FError, inner_func)
