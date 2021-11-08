import datetime
from mypy_extensions import TypedDict
from typing import Union, List, Dict, Set

# Types coming from the BigQuery pull
InventoryPackageDict = TypedDict('InventoryPackageDict', {
	'package_id': str,
	'quantity': float,
	'product_category_name': str,
	'item_product_category_type': str,
	'item_id': str,
	'source_production_batch_numbers': str,
	'production_batch_number': str,
	'source_harvest_names': str,
	'archived_date': str,
	'finished_date': str
})

SalesTransactionDict = TypedDict('SalesTransactionDict', {
	'sales_datetime': datetime.datetime,
	'sales_date': datetime.date, # added by us
	'tx_package_id': str,
	'receipt_number': str,
	'tx_quantity_sold': int,
	'tx_total_price': float,
	'tx_unit_of_measure': str
})

TransferPackageDict = TypedDict('TransferPackageDict', {
	'package_id': str,
	'license_number': str,
	'product_category_name': str,
	'product_name': str,
	'received_unit_of_measure': str,
	'shipped_quantity': Union[float, str],
	'shipper_wholesale_price': float,
	'shipment_package_state': str,
	'delivery_type': str,
	'created_date': datetime.date,
	'received_datetime': datetime.datetime,
	'source_harvest_names': str,
	'received_date': datetime.date, # added by us
	'date_to_txs': Dict[datetime.date, List[SalesTransactionDict]] # added by us
})

# Types used for analysis

AnalysisParamsDict = TypedDict('AnalysisParamsDict', {
	'sold_threshold': float,
	'find_parent_child_relationships': bool
})

NotableEventDict = TypedDict('NotableEventDict', {
	'date': datetime.date,
	'reason': str
})

ComputedInfoDict = TypedDict('ComputedInfoDict', {
	'sold': NotableEventDict,
	'finished': NotableEventDict,
	'date_to_quantity': Dict[datetime.date, float]
}, total=False)

class Query(object):
	"""Describes the date ranges and company we are doing the analysis for"""

	def __init__(self) -> None:
		self.inventory_dates: List[str] = []
		self.company_name = ''

class Printer(object):

	def __init__(self, verbose: bool, show_info: bool) -> None:
		self.verbose = verbose
		self.show_info = show_info
		self.packages_with_warnings: Set[str] = set([])
			
	def warn(self, msg: str, package_id: str = None) -> None:
		print('WARN: {}'.format(msg))
		if package_id:
				self.packages_with_warnings.add(package_id)
			
	def debug(self, msg: str) -> None:
		if self.verbose:
			print(msg)
					
	def info(self, msg: str) -> None:
		if self.show_info:
			print(msg)
