import xlwt

from typing import Dict, List, Sequence, Union, BinaryIO
from xlwt.Worksheet import Worksheet as xlwt_Worksheet

CellValue = Union[float, int, str]

class Worksheet(object):
	"""A single sheet inside a spreadsheet."""

	MAX_ALLOWED_XL_CELL_CHARS = 32767
	TRUNCATION_MSG = '[truncated]'
	TRUNCATION_MSG_LEN = len(TRUNCATION_MSG)
	ALLOWED_VALUE_LEN = MAX_ALLOWED_XL_CELL_CHARS - TRUNCATION_MSG_LEN

	def __init__(self, ws: xlwt_Worksheet) -> None:
		self._ws = ws
		self._rowx = 0

	def add_row(self, values: Sequence[CellValue]) -> None:
		for colx, value in enumerate(values):
			# Excel cell doesn't support more than 32767 characters.
			if value is None:
				self._ws.write(self._rowx, colx, '')
			else:
				self._ws.write(self._rowx, colx, value)

		self._rowx += 1

class WorkbookWriter(object):
	"""A wrapper around a xlwt Workbook"""

	def __init__(self, wb: xlwt.Workbook) -> None:
		self._wb = wb
		self._sheet_map: Dict[str, Worksheet] = {}

	def add_sheet(self, sheet_name: str) -> Worksheet:
		orig_ws = self._wb.add_sheet(sheet_name)
		ws = Worksheet(orig_ws)
		self._sheet_map[sheet_name] = ws
		return ws

	def write_records(self, sheet_name: str, records: List[CellValue]) -> None:
		ws = self._sheet_map[sheet_name]
		ws.add_row(records)

	def save(self, f: BinaryIO) -> None:
		self._wb.save(f)

