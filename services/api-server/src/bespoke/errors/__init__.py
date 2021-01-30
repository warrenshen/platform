
from typing import Dict

class Error(object):

	def __init__(self, msg: str, details: Dict = None) -> None:
		self.msg = msg
		self.details = details

	def __str__(self) -> str:
		if self.details:
			return '{}; Details: {}'.format(self.msg, self.details)

		return '{}'.format(self.msg)