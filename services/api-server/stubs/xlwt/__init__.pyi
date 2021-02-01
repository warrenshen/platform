from typing import BinaryIO
from xlwt.Worksheet import Worksheet

class Workbook(object):

	def add_sheet(self, sheet_name: str) -> Worksheet:
		pass

	def save(self, f: BinaryIO) -> None:
		pass
