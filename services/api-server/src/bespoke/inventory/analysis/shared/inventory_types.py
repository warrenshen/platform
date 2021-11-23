import datetime
import logging
import os
from pathlib import Path
from mypy_extensions import TypedDict
from typing import Union, List, Dict, Set

from bespoke.excel.excel_writer import CellValue

# Types coming from the BigQuery pull
InventoryPackageDict = TypedDict('InventoryPackageDict', {
	'package_id': str,
	'license_number': str,
	'quantity': float,
	'package_type': str,
	'product_category_name': str,
	'product_name': str,
	'unit_of_measure': str,
	'item_product_category_type': str,
	'item_id': str,
	'source_production_batch_numbers': str,
	'production_batch_number': str,
	'source_harvest_names': str,
	'packaged_date': str,
	'archived_date': str,
	'finished_date': str,

	'category': str, # added by us in stale inventory util
	'master_product_category': str # added by us in stale inventory util
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
	'received_quantity': Union[float, str],
	'receiver_wholesale_price': float,
	'shipped_unit_of_measure': str,
	'shipped_quantity': Union[float, str],
	'shipper_wholesale_price': float,
	'shipment_package_state': str,
	'delivery_type': str,
	'created_date': datetime.date,
	'received_datetime': datetime.datetime,
	'source_harvest_names': str,
	'price': float, # added by us
	'quantity': float, # added by us
	'unit_of_measure': str, # added by us
	'received_date': datetime.date, # added by us
	'date_to_txs': Dict[datetime.date, List[SalesTransactionDict]] # added by us
})

# Types used for analysis

# So we can assume prices
PricingDataConfigDict = TypedDict('PricingDataConfigDict', {
	'category_to_fixed_prices': Dict[str, Dict[str, float]]
})

MarginEstimateConfigDict = TypedDict('MarginEstimateConfigDict', {
	'category_to_margin_estimate': Dict[str, float]
})

CogsAnalysisParamsDict = TypedDict('CogsAnalysisParamsDict', {
	# Anything above this threshold is assumed to be unreliable
	'readjust_profit_threshold': float,
	# So using the readjust_type, we either assume this item was priced
	# on a per-unit basis (so we need to multiply the cost by the number of items purchased)
	# or, we just ignore certain packages that have profits above a certain threshold
	'readjust_type': str
})

AnalysisParamsDict = TypedDict('AnalysisParamsDict', {
	'sold_threshold': float,
	'find_parent_child_relationships': bool,
	'use_prices_to_fill_missing_incoming': bool,
	'external_pricing_data_config': PricingDataConfigDict,
	'use_margin_estimate_config': bool,
	'margin_estimate_config': MarginEstimateConfigDict,
	'cogs_analysis_params': CogsAnalysisParamsDict
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

CountsAnalysisDict = TypedDict('CountsAnalysisDict', {
	'pct_excluded': float
})

PrintCountsDict = TypedDict('PrintCountsDict', {
	'only_incoming': int,
	'only_outgoing': int,
	'only_sold': int,
	'incoming_missing_prices': int,
	'outgoing_and_incoming': int,
	'in_and_sold_at_least_once': int,
	'in_and_sold_many_times': int,
	'num_parent_packages': int,
	'num_child_packages': int,
	'total_seen': int
})

CompareInventoryResultsDict = TypedDict('CompareInventoryResultsDict', {
	'computed_extra_package_ids': List[str],
	'computed_missing_actual_package_ids': List[str],
	'pct_inventory_matching': float,
	'pct_accuracy_of_quantity': float,
	'pct_inventory_overestimate': float,
	'pct_quantity_overestimated': float,
	'current_inventory_value': float
})

CogsSummaryDict = TypedDict('CogsSummaryDict', {
	'topdown_cogs_rows': List[List[CellValue]],
	'bottomsup_cogs_rows': List[List[CellValue]],
	'avg_monthly_cogs': float,
	'avg_monthly_revenue': float,
	'pct_transactions_with_cost': float,
	'bottomsup_total_cogs': float,
	'topdown_total_cogs': float
})

# Summary of information that we get about the entire inventory summary
# for a customer
AnalysisSummaryDict = TypedDict('AnalysisSummaryDict', {
	'company_name': str,
	'company_identifier': str,
	'analysis_params': AnalysisParamsDict,
	'counts_analysis': CountsAnalysisDict,
	'compare_inventory_results': CompareInventoryResultsDict,
	'cogs_summary': CogsSummaryDict
})

ReadParams = TypedDict('ReadParams', {
	'use_cached_dataframes': bool
})

WriteOutputParams = TypedDict('WriteOutputParams', {
	'save_download_dataframes': bool
})

class AnalysisContext(object):
	"""Object for passing around bunch of information about the inventory analysis being run"""

	def __init__(self, output_root_dir: str, read_params: ReadParams, write_params: WriteOutputParams) -> None:
		self.output_root_dir = output_root_dir
		self.read_params = read_params
		self.write_params = write_params

	def mkdir(self, rel_path: str) -> None:
		Path(os.path.join(self.output_root_dir, rel_path)).mkdir(parents=True, exist_ok=True)

	def get_output_path(self, rel_path: str) -> str:
		return os.path.join(self.output_root_dir, rel_path)

class Query(object):
	"""Describes the date ranges and company we are doing the analysis for"""

	def __init__(self, 
		inventory_dates: List[str],
		transfer_packages_start_date: str,
		sales_transactions_start_date: str,
		company_identifier: str,
		company_name: str,
		license_numbers: List[str]
	) -> None:
		self.inventory_dates = inventory_dates
		self.transfer_packages_start_date = transfer_packages_start_date
		self.sales_transactions_start_date = sales_transactions_start_date
		self.company_identifier = company_identifier
		self.company_name = company_name
		self.license_numbers = license_numbers

class Printer(object):

	def __init__(self, verbose: bool, show_info: bool) -> None:
		self.verbose = verbose
		self.show_info = show_info
					
	def info(self, msg: str) -> None:
		if self.show_info:
			logging.info(msg)
