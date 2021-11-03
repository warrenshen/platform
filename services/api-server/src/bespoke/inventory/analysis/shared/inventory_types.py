from typing import List

class Query(object):
	"""Describes the date ranges and company we are doing the analysis for"""

	def __init__(self) -> None:
		self.inventory_dates: List[str] = []
		self.company_name = ''
