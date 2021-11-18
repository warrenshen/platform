import datetime
from typing import Union

class Worksheet(object):
	
	def write(self, row: int, col: int, value: Union[float, int, str, datetime.datetime, datetime.date]) -> None:
		pass

