import datetime
import copy
import glob
import math
import numpy
import pandas
import pytz
import xlwt

from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple, Union, Iterable, Set, cast
from dateutil import parser
from collections import OrderedDict
from mypy_extensions import TypedDict

from bespoke.db.db_constants import DeliveryType
from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue
from bespoke.finance.types import finance_types

from bespoke.inventory.analysis.shared import create_queries
from bespoke.inventory.analysis.shared.inventory_types import Query

DEFAULT_SOLD_THRESHOLD = 0.95

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
	'sold_threshold': float
})

CompareOptionsDict = TypedDict('CompareOptionsDict', {
	'num_errors_to_show': int,
	'accept_computed_when_sold_out': bool
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

def _print_if(s: str, predicate: bool) -> None:
	if predicate:
		print(s)

def _is_time_null(cur_time: Any) -> bool:
	if not cur_time:
		return None

	cur_time_str = str(cur_time)
	return cur_time_str == 'NaT' or cur_time_str == 'NaTType'

def date_to_str(dt: Union[datetime.datetime, datetime.date]) -> str:
	if not dt:
		return ''
	return dt.strftime('%m/%d/%Y')

def parse_to_datetime(cur_datetime: Any) -> datetime.datetime:
	if not cur_datetime:
		return None

	cur_type = type(cur_datetime)

	if cur_type == str:
		return parser.parse(cast(str, cur_datetime))
	elif str(cur_type) == "<class 'pandas._libs.tslibs.timestamps.Timestamp'>":
		return cur_datetime.to_pydatetime()
	elif _is_time_null(cur_datetime):
		return None

	return cast(datetime.datetime, cur_datetime)

def parse_to_date(cur_date: Any) -> datetime.date:
	if not cur_date:
		return None

	cur_type = type(cur_date)

	if cur_type == str:
		return parser.parse(cast(str, cur_date)).date()
	elif cur_type == datetime.datetime:
		cur_date = cast(datetime.datetime, cur_date).date()
	elif str(cur_type) == "<class 'pandas._libs.tslibs.timestamps.Timestamp'>":
		cur_date = cur_date.date()
	elif _is_time_null(cur_date):
		return None

	return cast(datetime.date, cur_date)

def _find_matching_package_by_date(
	all_transfer_pkgs: List[TransferPackageDict],
	cur_date: datetime.date,
	include_outgoing: bool) -> TransferPackageDict:
	
	for i in range(len(all_transfer_pkgs)):
		cur_transfer_pkg = all_transfer_pkgs[i]
		cur_transfer_date = cur_transfer_pkg['received_date']

		if (i + 1) >= len(all_transfer_pkgs):
			# We reached the end of the array, so just put some enormously
			# large date
			next_transfer_date = datetime.date(3000, 1, 1)
		else:
			next_transfer_date = all_transfer_pkgs[i+1]['received_date']

		if _is_outgoing(cur_transfer_pkg) and include_outgoing:
			return cur_transfer_pkg

		elif _is_outgoing(cur_transfer_pkg):
			# Dont insert a transaction associated with an outgoing transaction
			# if were not supposed to include it
			continue

		if cur_date >= cur_transfer_date and cur_date <= next_transfer_date:
			return cur_transfer_pkg

	return None

def get_inventory_column_names() -> List[str]:
	return [
		'package_id',
		'license_number',
		'arrived_date',
		'incoming_cost',
		'incoming_quantity',
		'is_child_package',
		'are_prices_inferred',

		'product_category_name',
		'product_name',

		'quantity',
		'unit_of_measure',
		'sold_date',
		
		'is_in_inventory'
	]

def _get_incoming_pkg_for_date(incomings: List[TransferPackageDict], inventory_date: datetime.date) -> TransferPackageDict:
	if not incomings:
		return None

	incomings.sort(key=lambda x: x['received_datetime'])

	for incoming_pkg in incomings:
		if incoming_pkg['shipment_package_state'] == 'Returned':
			continue

		if incoming_pkg['received_datetime'].date() >= inventory_date:
			# Find the first incoming package that was received after this inventory date
			return incoming_pkg

	return None

def _get_inventory_output_row(history: 'PackageHistory', inventory_date: datetime.date, is_in_inventory: bool) -> List[str]:
	incoming_pkg = _get_incoming_pkg_for_date(history.incomings, inventory_date)
	sold_date = history.computed_info.get('sold', {}).get('date')
	
	if not incoming_pkg:
		# If we dont have an incoming package, use the latest one just so
		# we can show the caller some details about this package.
		#
		# The inventory will end up being 0
		incoming_pkg = history.incomings[-1]

	cur_quantity = 0.0
	if is_in_inventory:
		cur_quantity = history._get_current_quantity(inventory_date)

	return [
		history.package_id,
		incoming_pkg['license_number'],
		date_to_str(incoming_pkg['received_datetime'].date()),
		'{:.2f}'.format(float(incoming_pkg['shipper_wholesale_price'])),
		'{:.2f}'.format(float(incoming_pkg['shipped_quantity'])),
		'{}'.format(history.is_child_of_parent),
		'{}'.format(history.are_prices_inferred),

		incoming_pkg['product_category_name'],
		incoming_pkg['product_name'],

		'{}'.format(cur_quantity) if cur_quantity != -1 else '',
		incoming_pkg['received_unit_of_measure'] or '',
		date_to_str(sold_date) if sold_date else '',
	]

class SQLHelper(object):

	def get_packages(self, package_ids: Iterable[str]) -> pandas.DataFrame:
		pass

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pandas.DataFrame:
		pass

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pandas.DataFrame:
		pass

class BigQuerySQLHelper(object):

	def __init__(self, engine: Any) -> None:
		self.engine = engine

	def get_packages(self, package_ids: Iterable[str]) -> pandas.DataFrame:
		return pandas.read_sql_query(
				create_queries.create_packages_by_package_ids_query(package_ids),
				self.engine
			)

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pandas.DataFrame:
		return pandas.read_sql_query(
				create_queries.are_packages_inactive_query(package_ids),
				self.engine
		)

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pandas.DataFrame:
		return pandas.read_sql_query(
				create_queries.create_packages_by_production_batch_numbers_query(production_batch_numbers),
				self.engine
			)

class Download(object):
		
	def __init__(self) -> None:
		self.incoming_records: List[TransferPackageDict] = None
		self.outgoing_records: List[TransferPackageDict] = None
		self.sales_tx_records: List[SalesTransactionDict] = None
		self.sales_receipts_dataframe: Any = None

		self.inventory_packages_records: List[InventoryPackageDict] = None
		self.inactive_packages_records: List[InventoryPackageDict] = None
		self.missing_incoming_pkg_package_records: List[InventoryPackageDict] = None
		self.parent_packages_records: List[InventoryPackageDict] = None
		self.child_to_parent_package_id_override: Dict[str, str] = {}

	def download_dataframes(
		self,
		incoming_transfer_packages_dataframe: Any,
		outgoing_transfer_packages_dataframe: Any,
		sales_transactions_dataframe: Any,
		sales_receipts_dataframe: Any,
		inventory_packages_dataframe: Any,
		sql_helper: SQLHelper,
	) -> None:
		self.incoming_records = incoming_transfer_packages_dataframe.to_dict('records')
		self.outgoing_records = outgoing_transfer_packages_dataframe.to_dict('records')
		self.sales_tx_records = sales_transactions_dataframe.to_dict('records')
		self.sales_receipts_dataframe = sales_receipts_dataframe
		self.inventory_packages_records = inventory_packages_dataframe.to_dict('records')

		all_package_ids = set([])
		missing_incoming_pkg_package_ids = set([])

		for inv_pkg in self.inventory_packages_records:
			missing_incoming_pkg_package_ids.add(inv_pkg['package_id'])

		for sales_tx_record in self.sales_tx_records:
			sales_tx_record['sales_datetime'] = cast(Any, sales_tx_record['sales_datetime']).to_pydatetime()
			sales_tx_record['sales_date'] = parse_to_date(sales_tx_record['sales_datetime'])
			all_package_ids.add(sales_tx_record['tx_package_id'])
			missing_incoming_pkg_package_ids.add(sales_tx_record['tx_package_id'])

		for incoming_r in self.incoming_records:
			incoming_r['received_datetime'] = parse_to_datetime(incoming_r['received_datetime'])
			incoming_r['received_date'] = parse_to_date(incoming_r['received_datetime'])
			incoming_r['created_date'] = parse_to_date(incoming_r['created_date'])
			all_package_ids.add(incoming_r['package_id'])
			if incoming_r['package_id'] in missing_incoming_pkg_package_ids:
				missing_incoming_pkg_package_ids.remove(incoming_r['package_id'])

		for outgoing_r in self.outgoing_records:
			outgoing_r['received_datetime'] = parse_to_datetime(outgoing_r['received_datetime'])
			outgoing_r['received_date'] = parse_to_date(outgoing_r['received_datetime'])
			outgoing_r['created_date'] = parse_to_date(outgoing_r['created_date'])
			all_package_ids.add(outgoing_r['package_id'])

		all_inactive_packages_df = sql_helper.get_inactive_packages(all_package_ids)
		self.inactive_packages_records = cast(
			List[InventoryPackageDict], all_inactive_packages_df.to_dict('records'))

		# For packages missing an incoming_pkg, we query the metrc_packages table to
		# see if there is a parent-child relationship between the original incoming_pkg
		# and this current package.
		if missing_incoming_pkg_package_ids:
			missing_incoming_pkg_packages_df = sql_helper.get_packages(missing_incoming_pkg_package_ids)
			self.missing_incoming_pkg_package_records = cast(
				List[InventoryPackageDict], missing_incoming_pkg_packages_df.to_dict('records'))
		else:
			self.missing_incoming_pkg_package_records = []

		# Find the original packages with these production batch numbers.
		production_batch_numbers = set([])
		for pkg in self.missing_incoming_pkg_package_records:
			source_no = pkg['source_production_batch_numbers']
			if not source_no:
				# print(f"WARN: package {pkg['package_id']} is missing a sourceproductionbatchnumber and an incoming pkg")
				continue

			production_batch_numbers.add(source_no)

		# For packages missing an incoming_pkg, we query the metrc_packages table to
		# see if there is a parent-child relationship between the original incoming_pkg
		# and this current package.
		if production_batch_numbers:
			parent_packages_df = sql_helper.get_packages_by_production_batch_numbers(production_batch_numbers)
			self.parent_packages_records = cast(
				List[InventoryPackageDict], parent_packages_df.to_dict('records'))
		else:
			self.parent_packages_records = []

	def download_files(
		self,
		incoming_files: List[str],
		outgoing_files: List[str],
		sales_transactions_files: List[str],
	) -> None:
		self.incoming_records = cast(List[TransferPackageDict], self._file_as_dict_records(incoming_files))
		self.outgoing_records = cast(List[TransferPackageDict], self._file_as_dict_records(outgoing_files))
		self.sales_tx_records = cast(List[SalesTransactionDict], self._file_as_dict_records(sales_transactions_files))

	def _file_as_dict_records(self, filepaths: List[str]) -> List[Dict]:
		all_records = []

		expanded_filepaths = []
		for filepath in filepaths:
			# Expand any wildcards, e.g., if the filepath is "incoming_transfers*.ipynb"
			expanded_filepaths.extend(list(glob.iglob(filepath)))

		for filepath in expanded_filepaths:
			df = pandas.read_excel(filepath, converters={
				'package_id': str,
				'tx_package_id': str
			})
			df_records = df.to_dict('records')
			print(f'Opened file {filepath} with {len(df.columns)} columns and {len(df_records)} rows')
			print(f'Dataframe columns:\n{df.columns}')
			all_records.extend(df_records)

		return all_records

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

class ExcludeReason(object):
	MISSING_INCOMING = 'MISSING_INCOMING'
	CHILD_MISSING_INVENTORY_PACKAGE = 'CHILD_MISSING_INVENTORY_PACKAGE'
	PARENT_HAS_ZERO_QUANTITY = 'PARENT_HAS_ZERO_QUANTITY'
	INCOMING_MISSING_QUANTITY = 'INCOMING_MISSING_QUANTITY'
	OUTGOING_MISSING_QUANTITY = 'OUTGOING_MISSING_QUANTITY'
	MISSING_TIMESTAMP = 'MISSING_TIMESTAMP'
	OUT_OF_ORDER_DATES = 'OUT_OF_ORDER_DATES'

def _date_to_datetime(date: datetime.date) -> datetime.datetime:
	return datetime.datetime.combine(date.today(), datetime.datetime.min.time()).replace(tzinfo=pytz.UTC)

def _is_internal_transfer(transfer_pkg: TransferPackageDict) -> bool:
	return transfer_pkg['delivery_type'] in set([
		DeliveryType.INCOMING_INTERNAL,
		DeliveryType.OUTGOING_INTERNAL
	])

def _is_incoming(transfer_pkg: TransferPackageDict) -> bool:
	# For the purposes of this inventory exercise, incoming means its
	# still in the posession of the company

	return transfer_pkg['delivery_type'] in set([
		DeliveryType.INTERNAL, 
		DeliveryType.INCOMING_INTERNAL, 
		DeliveryType.OUTGOING_INTERNAL,
		DeliveryType.INCOMING_FROM_VENDOR,
		DeliveryType.INCOMING_UNKNOWN
	])

def _is_outgoing(transfer_pkg: TransferPackageDict) -> bool:
	# For the purposes of this inventory exercise, outgoing means its
	# no onger in the posession of the company
	return transfer_pkg['delivery_type'] in set([
		DeliveryType.OUTGOING_TO_PAYOR,
		DeliveryType.OUTGOING_UNKNOWN
	])

class PackageHistory(object):
	"""
		Grab all the information we know about this package, and then compute multiple fields on it
	"""

	def __init__(self, package_id: str) -> None:
		self.incomings: List[TransferPackageDict] = []
		self.outgoings: List[TransferPackageDict] = []
		self.all_transfer_pkgs: List[TransferPackageDict] = [] # Sorted when computing information about history
		self.sales_txs: List[SalesTransactionDict] = []
		self.package_id = package_id
		self.inactive_pkg: InventoryPackageDict = None
		# We need the active package pulled directly from metrc_packages for
		# the child package quantity computations 
		self.active_inventory_pkg: InventoryPackageDict = None 
		
		self.computed_info: ComputedInfoDict = {}
		self.is_parent = False # Whether this package is a parent of spawned child packages
		self.is_child_of_parent = False # Whether this package is a child spawned from a parent package
		self.are_prices_inferred = False # When we have to make a guess about the cost of the child by inferring what the parent was
		self.should_exclude = False
		self.exclude_reason = ''
				
	def in_inventory_at_date(self, cur_date: datetime.date) -> bool:
		# Was this package in the company's possession at this date?
		matching_transfer_pkg = _find_matching_package_by_date(
				self.all_transfer_pkgs, cur_date=cur_date, include_outgoing=True)

		if not matching_transfer_pkg:
			# There will be many cases when we are looking at a date where the package
			# hasn't come in yet.
			return False

		if _is_incoming(matching_transfer_pkg):
			incoming_pkg = matching_transfer_pkg
			arrived_date = incoming_pkg['received_date']

			if arrived_date and cur_date < arrived_date:
				return False

		if _is_outgoing(matching_transfer_pkg):
			return False

		finished_date = self.computed_info.get('finished', {}).get('date')
		if finished_date and cur_date > finished_date:
			# Its no longer in your possession the day after it's finished
			return False

		sold_date = self.computed_info.get('sold', {}).get('date')
		if sold_date and cur_date > sold_date:
			# We know it's not in your possession after the sales date
			return False

		cur_quantity = self._get_current_quantity(cur_date)
		if cur_quantity <= 0.0:
			# No quantity left even if it wasn't fully sold
			return False
		
		# Knowing nothing else, assume you have the package at this date
		return True
	
	def _get_current_quantity(self, inventory_date: datetime.date) -> float:
		if 'date_to_quantity' not in self.computed_info:
			return -1

		dates = list(self.computed_info['date_to_quantity'].keys())
		dates.sort()
		cur_quantity = 0.0

		for cur_date in dates:
			if cur_date <= inventory_date:
				# Keep updating what the quantity is until we reach the inventory date
				cur_quantity = self.computed_info['date_to_quantity'][cur_date]
			else:
				# We've reached a date that is beyond the inventory date
				break

		return cur_quantity

	def get_inventory_output_row(self, inventory_date: datetime.date, is_in_inventory: bool) -> List[str]:
		return _get_inventory_output_row(self, inventory_date, is_in_inventory)
				
	def filter_out_unhandled_packages(self, p: Printer) -> None:    
		if not self.incomings:
			p.info(f'Excluding package {self.package_id} because it doesnt have an incoming package')
			self.should_exclude = True
			self.exclude_reason = ExcludeReason.MISSING_INCOMING
			return
	
	def when_it_finished(self, p: Printer) -> bool:
		if self.inactive_pkg:
			reason = ''
			finished_date = None

			if self.inactive_pkg['finished_date']:
				reason = 'finished'
				finished_date = parse_to_date(self.inactive_pkg['finished_date'])
			elif self.inactive_pkg['archived_date']:
				reason = 'archived'
				finished_date = parse_to_date(self.inactive_pkg['archived_date'])

			if not reason:
				return False

			self.computed_info['finished'] = {
				'reason': reason,
				'date': finished_date
			}
			return True
		else:
			return False

	def run_is_sold_logic(self, p: Printer, sold_threshold: float, skip_over_errors: bool) -> bool:
		# Fills in the 'sold' value for self.computed_info
		#
		# Tells us when a package was sold
		
		# It's only considered sold if it was an incoming package
		# and we see there are sales transactions.

		in_debug_mode = skip_over_errors
		
		if not self.incomings:
			return False

		# Insert transactions based on the corresponding incoming transfer they
		# are associated with
		for transfer_pkg in self.incomings:
			transfer_pkg['date_to_txs'] = OrderedDict()

		for transfer_pkg in self.outgoings:
			transfer_pkg['date_to_txs'] = OrderedDict()

		# Organize things by their incoming, outgoing order
		incoming_pkgs = []
		for incoming_pkg in self.incomings:
			# Make sure we cleared out any previous transactions associated with these packages
			assert len(incoming_pkg['date_to_txs'].keys()) == 0
			if in_debug_mode:
				print('INCOMING')
				print(incoming_pkg)
				print('')

			if _is_time_null(incoming_pkg['received_datetime']):
				#p.warn('seeing an incoming package for #{} with no received_datetime'.format(self.package_id))
				incoming_pkg['received_datetime'] = _date_to_datetime(incoming_pkg['created_date'])
				continue
			elif type(incoming_pkg['received_datetime']) == datetime.datetime:
				incoming_pkg['received_datetime'] = incoming_pkg['received_datetime'].replace(tzinfo=pytz.UTC)

			if not incoming_pkg['received_datetime']:
				continue

			incoming_pkgs.append(incoming_pkg)

		outgoing_pkgs = []
		for outgoing_pkg in self.outgoings:
			# Make sure we cleared out any previous transactions associated with these packages
			assert len(outgoing_pkg['date_to_txs'].keys()) == 0

			if in_debug_mode:
				print('OUTGOING')
				print(outgoing_pkg)
				print('')

			if _is_time_null(outgoing_pkg['received_datetime']):
				#p.warn('seeing an outgoing package for #{} with no received_datetime'.format(self.package_id))
				outgoing_pkg['received_datetime'] = _date_to_datetime(outgoing_pkg['created_date'])
				continue
			elif type(outgoing_pkg['received_datetime']) == datetime.datetime:
				# If it's already a datetime.datetime, we need to make it timezone aware
				outgoing_pkg['received_datetime'] = outgoing_pkg['received_datetime'].replace(tzinfo=pytz.UTC)

			if not outgoing_pkg['received_datetime']:
				continue

			outgoing_pkgs.append(outgoing_pkg)

		if not incoming_pkgs:
			return False

		self.all_transfer_pkgs = incoming_pkgs + outgoing_pkgs
		self.all_transfer_pkgs.sort(key=lambda x: x['received_datetime'])
		all_transfer_pkgs = self.all_transfer_pkgs

		def _find_insertion(sales_datetime: datetime.datetime) -> TransferPackageDict:
			# Find the transfer pkog to associate these transactions with, e.g.,
			#
			# INCOMING #1
			#    date_to_txs: {}
			#
			# this will tell us all the transactions that occurred after
			# our incoming transfer, and presumably before an outgoing transfer
			# occurred.
			for i in range(len(all_transfer_pkgs)):
				cur_transfer_pkg = all_transfer_pkgs[i]
				cur_transfer_datetime = cur_transfer_pkg['received_datetime']

				if (i + 1) >= len(all_transfer_pkgs):
					# We reached the end of the array, so just put some enormously
					# large date
					next_transfer_datetime = datetime.datetime(3000, 1, 1).replace(tzinfo=pytz.UTC)
				else:
					next_transfer_datetime = all_transfer_pkgs[i+1]['received_datetime']

				if _is_outgoing(cur_transfer_pkg):
					# Dont insert a transaction associated with an outgoint transaction
					continue

				if sales_datetime >= cur_transfer_datetime and sales_datetime <= next_transfer_datetime:
					return cur_transfer_pkg

			# If no package was still found to match to, assume that a transaction which
			# occurred in the same day as an incoming package is still OK, even if it
			# technically happened minutes or hours before arriving according to metrc
			sales_date = sales_datetime.date()

			matching_transfer_pkg = _find_matching_package_by_date(
				all_transfer_pkgs, cur_date=sales_date, include_outgoing=False)
			if matching_transfer_pkg:
				return matching_transfer_pkg

			if skip_over_errors:
				# If we are just using this for debugging, insert this transaction into
				# the last transfer package we see
				return all_transfer_pkgs[-1]
			else:
				return None

		self.sales_txs.sort(key = lambda x: x['sales_datetime'])

		if self.is_child_of_parent and not self.active_inventory_pkg and not self.inactive_pkg:
			if in_debug_mode:
				print(f'We should always have the actual inventory or inactive package for a child package. Package ID {self.package_id}')
			
			self.should_exclude = True
			self.exclude_reason = ExcludeReason.CHILD_MISSING_INVENTORY_PACKAGE
			return False

		# Estimate the original quantity of a package by taking how much of it we have in
		# metrc_packages
		estimated_original_quantity = 0.0
		if self.active_inventory_pkg:
			estimated_original_quantity = float(self.active_inventory_pkg['quantity'])
		elif self.inactive_pkg:
			estimated_original_quantity = float(self.inactive_pkg['quantity'])

		for tx in self.sales_txs:
			cur_date = tx['sales_date']
			cur_transfer_pkg = _find_insertion(tx['sales_datetime'])

			if not cur_transfer_pkg:
				self.should_exclude = True
				self.exclude_reason = ExcludeReason.OUT_OF_ORDER_DATES
				p.info('Excluding package {}, could not find a transfer to insert a tx with date {}'.format(
					self.package_id, tx['sales_datetime']))
				return False

			cur_txs = cur_transfer_pkg['date_to_txs'].get(cur_date, [])
			cur_txs.append(tx)
			cur_transfer_pkg['date_to_txs'][cur_date] = cur_txs

			estimated_original_quantity += tx['tx_quantity_sold']

		if self.is_child_of_parent:
			assert len(self.incomings) == 1
			for incoming_pkg in self.incomings:
				# We copied the parent's incoming_pkg into the child's incoming_pkg, and
				# we take the chance here to modify it according to the percentage
				# that this child contributed to the overall parent,
				# e.g.,
				#
				# parent may have been shipped_quantity 100, price $1000
				#
				# child now has a quantity of 2, and it was sold 8 times, therefore
				# we believe the child started off with quantity 10, and its "cost"
				# is $1000 / 10, and its shipped_quantity is 10

				parent_original_quantity = float(incoming_pkg['shipped_quantity'])
				parent_wholesale_price = float(incoming_pkg['shipper_wholesale_price'])
				child_original_quantity = estimated_original_quantity
				incoming_pkg['shipped_quantity'] = child_original_quantity
				if math.isclose(parent_original_quantity, 0.0):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.PARENT_HAS_ZERO_QUANTITY
					p.info('Excluding package {} because parent has 0 original quantity and cant divide by zero'.format(
						self.package_id))
					return False

				per_unit_price = parent_wholesale_price / parent_original_quantity
				incoming_pkg['shipper_wholesale_price'] = per_unit_price * child_original_quantity
				pass

		# TODO(dlluncor):
		# Use received_quantity, if not there, then back off to shipped_quantity

		lines = []
		verbose = p.verbose
		
		amount_sold = 0.0
		is_sold = False
		shipped_quantity = 0.0
		revenue_from_pkg = 0.0
		remaining_quantity = 0.0
		seen_receipt_numbers = {}
		seen_sales_datetimes = {}
		date_to_quantity: Dict[datetime.date, float] = {}
		
		for transfer_pkg in all_transfer_pkgs:
			
			if _is_incoming(transfer_pkg):
				incoming_pkg = transfer_pkg

				arrived_date = incoming_pkg['received_date']
				if not incoming_pkg['shipped_quantity'] or numpy.isnan(incoming_pkg['shipped_quantity']):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.INCOMING_MISSING_QUANTITY
					p.warn(f'incoming package #{self.package_id} does not have a shipped quantity', package_id=self.package_id)
					return False

				shipped_quantity = float(incoming_pkg['shipped_quantity'])
				price_of_pkg = incoming_pkg['shipper_wholesale_price']
				shipment_package_state = incoming_pkg['shipment_package_state']

				initial_quantity = shipped_quantity
				if shipment_package_state == 'Returned':
					initial_quantity = 0.0

				date_to_quantity[arrived_date] = initial_quantity
				remaining_quantity = initial_quantity

				if verbose:
					lines.append('')
					lines.append(f'Package {self.package_id} arrived on {date_to_str(arrived_date)} with quantity {shipped_quantity} and price ${price_of_pkg}.')

			elif _is_outgoing(transfer_pkg):
				outgoing_pkg = transfer_pkg
				outgoing_date = outgoing_pkg['received_date']

				# TODO(dlluncor): Do we set the quantity to 0 on the day it's sent
				# or the day after?
				date_to_quantity[outgoing_date] = 0
				remaining_quantity = 0

				if not skip_over_errors and len(transfer_pkg['date_to_txs'].keys()) > 0:
					raise Exception(f'There should be no transactions associated with an outgoing transfer. Package ID: {self.package_id}, outgoing transfer package on {outgoing_date}')

				if not outgoing_pkg['shipped_quantity'] or numpy.isnan(outgoing_pkg['shipped_quantity']):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.OUTGOING_MISSING_QUANTITY
					p.warn(f'outgoing package #{self.package_id} does not have a outgoing shipped quantity', package_id=self.package_id)
					return False

				shipped_quantity = float(incoming_pkg['shipped_quantity'])

				if verbose:
					lines.append('')
					lines.append(f'Package {self.package_id} is outgoing on {date_to_str(outgoing_date)} with quantity {shipped_quantity}')

			else:
				raise Exception('Seeing a transfer with unhandled deliver type {}'.format(transfer_pkg))

			dates = list(transfer_pkg['date_to_txs'].keys())
			dates.sort()

			for cur_date in dates:
				txs = transfer_pkg['date_to_txs'][cur_date]
				# There may be duplicate transactions, so we need to make sure
				# we only see 1 receipt number per package_id

				for tx in txs:
					if tx['receipt_number'] in seen_receipt_numbers:
						if verbose:
							#lines.append(f"WARN: Got duplicate transaction for package {self.package_id} receipt number {tx['receipt_number']}")
							#lines.append(f"Delta in txs sold is {tx['tx_is_deleted']}, {seen_receipt_numbers[tx['receipt_number']]['tx_is_deleted']}")
							pass

						continue

					if tx['sales_datetime'] in seen_sales_datetimes:
						continue

					seen_receipt_numbers[tx['receipt_number']] = tx
					seen_sales_datetimes[tx['sales_datetime']] = True

					if verbose:
						lines.append(f"Package {self.package_id} sold on {date_to_str(tx['sales_datetime'])} {tx['tx_quantity_sold']} ({tx['tx_unit_of_measure']}) for ${tx['tx_total_price']}")
						if math.isclose(tx['tx_total_price'], 0.0):
							lines.append('WARN: tx has no total_price')

					amount_sold += tx['tx_quantity_sold']
					remaining_quantity -= tx['tx_quantity_sold']
					revenue_from_pkg += tx['tx_total_price']

					if not is_sold and (amount_sold / shipped_quantity) >= sold_threshold:
						if verbose:
							lines.append(f'Package {self.package_id} marked as SOLD since it is more than {sold_threshold * 100}% sold')

						is_sold = True
						is_sold_date = tx['sales_date']

					if not math.isclose(revenue_from_pkg, 0.0):
						profit_margin = '{:.2f}'.format((revenue_from_pkg - price_of_pkg) / revenue_from_pkg * 100)
					else:
						profit_margin = '0'
							
					if is_sold:
						days_delta = (is_sold_date - arrived_date).days
						
						# (Revenue - Expenses) / Revenue
						#print(f'Revenue {revenue_from_pkg}')
						#print(f'Price {price_of_pkg}')
						lines.append(f'Package {self.package_id} took {days_delta} days to sell with profit margin {profit_margin}%')
						self.computed_info['sold'] = {
							'date': is_sold_date,
							'reason': 'sold'
						}

				date_to_quantity[parse_to_date(cur_date)] = remaining_quantity

		if verbose:
			lines.append(f'Package {self.package_id} has a remaining quantity of {remaining_quantity}')

		p.info('\n'.join(lines))

		self.computed_info['date_to_quantity'] = date_to_quantity
		return is_sold
		
	def compute_additional_fields(self, p: Printer, params: AnalysisParamsDict, run_filter: bool, skip_over_errors: bool) -> None:
		if run_filter:
			self.filter_out_unhandled_packages(p)
					
		if self.should_exclude:
			return

		self.when_it_finished(p)
		self.run_is_sold_logic(
			p, 
			sold_threshold=params.get('sold_threshold', DEFAULT_SOLD_THRESHOLD),
			skip_over_errors=skip_over_errors)

ParentDetailsDict = TypedDict('ParentDetailsDict', {
	'incoming_pkg': TransferPackageDict,
	'parent_package_id': str,
	'is_synthetic': bool
})

MatchingParentRespDict = TypedDict('MatchingParentRespDict', {
	'num_orphans': int,
	'has_number_but_no_parent': int,
	'child_to_parent_details': Dict[str, ParentDetailsDict]
})

HarvestMatchRespDict = TypedDict('HarvestMatchRespDict', {
	'has_match': bool,
	'incoming_pkg': TransferPackageDict
})

def _create_new_with_average_price(incoming_pkgs: List[TransferPackageDict]) -> TransferPackageDict:
	
	new_incoming_pkg = copy.deepcopy(incoming_pkgs[-1])
	total_cost = 0.0
	total_quantity = 0.0

	for incoming_pkg in incoming_pkgs:

		if math.isclose(incoming_pkg['shipper_wholesale_price'], 0.01):
			continue

		# NOTE: Assume same units for now
		total_cost += float(incoming_pkg['shipper_wholesale_price'])
		total_quantity += float(incoming_pkg['shipped_quantity'])

	new_incoming_pkg['shipper_wholesale_price'] = total_cost
	new_incoming_pkg['shipped_quantity'] = total_quantity

	return new_incoming_pkg

def _determine_match_based_on_harvest(
	pkg: InventoryPackageDict, parent_package_ids: List[str], package_id_to_history: Dict[str, PackageHistory]) -> HarvestMatchRespDict:

	item_id_to_count = {}
	parent_incoming_pkgs = []

	child_product_category_type = pkg['item_product_category_type']
	matching_parent_incoming_pkgs = []

	for parent_package_id in parent_package_ids:
		cur_parent_history = package_id_to_history[parent_package_id]
		
		if cur_parent_history.incomings: 
			parent_incoming_pkgs.append(cur_parent_history.incomings[-1])

		item_id = ''
		parent_product_category_type = ''

		cur_parent_pkg = cur_parent_history.active_inventory_pkg
		if cur_parent_pkg:
			item_id = cur_parent_pkg['item_id']
			parent_product_category_type = cur_parent_pkg['item_product_category_type']

		if cur_parent_history.inactive_pkg:
			item_id = cur_parent_history.inactive_pkg['item_id']
			parent_product_category_type = cur_parent_history.inactive_pkg['item_product_category_type']

		if not item_id:
			# We need the current inventory package to make determinations about whether its
			# the parent of this child.
			#
			# Unfortunately the transfer package doesnt 
			return HarvestMatchRespDict(
				has_match=False,
				incoming_pkg=None
			)

		if parent_product_category_type == child_product_category_type:
			# Also try to match the parent based on the product category type
			matching_parent_incoming_pkgs.append(cur_parent_history.incomings[-1])

		if item_id not in item_id_to_count:
			item_id_to_count[item_id] = 0

		item_id_to_count[item_id] += 1

	child_package_id = pkg['package_id']

	if len(list(item_id_to_count.keys())) == 1:
		final_incoming_pkg = _create_new_with_average_price(parent_incoming_pkgs)
		return HarvestMatchRespDict(
			has_match=True,
			incoming_pkg=final_incoming_pkg
		)

	if matching_parent_incoming_pkgs:
		#print('FOUND MATCHING PARENTS {} for type {}'.format(
		#	len(matching_parent_incoming_pkgs), child_product_category_type))
		final_incoming_pkg = _create_new_with_average_price(matching_parent_incoming_pkgs)
		return HarvestMatchRespDict(
			has_match=True,
			incoming_pkg=final_incoming_pkg
		)

	return HarvestMatchRespDict(
		has_match=False,
		incoming_pkg=None
	)

def _match_child_packages_to_parents(
	d: Download, 
	package_id_to_history: Dict[str, PackageHistory],
	debug_package_id: str = None) -> MatchingParentRespDict:
	
	productionbatchnum_to_package_id = {}
	
	for parent_record in d.parent_packages_records:
		production_batch_num = parent_record['production_batch_number']
		package_id = parent_record['package_id']
		if not production_batch_num:
				print(f'Parent package {package_id} is missing a productionbatchnumber')
				continue
		productionbatchnum_to_package_id[parent_record['production_batch_number']] = package_id

	# For those packages which are incoming only, those are also candidates
	# to be parents to those transactions which were spawned from those packages
	# (they are linked to their children via the harvest number)
	sourceharvestnum_to_package_ids: Dict[str, List[str]] = {}

	for package_id, history in package_id_to_history.items():
		if history.incomings and not history.outgoings and not history.sales_txs:
			# INCOMING_ONLY package
			sourceharvetname = history.incomings[0]['source_harvest_names']
			if sourceharvetname not in sourceharvestnum_to_package_ids:
				sourceharvestnum_to_package_ids[sourceharvetname] = []

			sourceharvestnum_to_package_ids[sourceharvetname].append(package_id)

	for sourceharvestnum, package_ids in sourceharvestnum_to_package_ids.items():	
		if len(package_ids) > 1:
			#print(sourceharvestnum)
			pass

	def _get_incoming_pkg(package_id: str) -> TransferPackageDict:
		if package_id not in package_id_to_history:
			raise Exception('Trying to get an incoming package ID for parent package_id={} which has no incoming transfer'.format(package_id))

		parent_history = package_id_to_history[package_id]
		if not parent_history.incomings:
			print(f'WARN: Parent package {parent_history.package_id} has no incoming package, so the child wont have any incoming history either')
			return None

		return copy.deepcopy(parent_history.incomings[-1])

	child_to_parent_details: Dict[str, ParentDetailsDict] = {}
	num_orphans = 0
	has_number_but_no_parent = 0
	orphan_child_package_ids = []
	children_with_source_missing_parents = []

	for pkg in d.missing_incoming_pkg_package_records:
		# These are packages with a missing incoming package, so we need to find their parent

		child_package_id = pkg['package_id']

		# Allow the user to specifically provide child and parent relationships
		# if we needed to manually compute them.
		parent_package_id_override = d.child_to_parent_package_id_override.get(child_package_id)
		if parent_package_id_override:
			child_to_parent_details[child_package_id] = {
				'incoming_pkg': _get_incoming_pkg(parent_package_id_override),
				'parent_package_id': parent_package_id_override,
				'is_synthetic': False
			}
			continue

		# Try to match on harvest number
		cur_harvestnames = pkg['source_harvest_names']
		is_matching_debug_pkg = debug_package_id == pkg['package_id']
		_print_if(f'Child has source harvest names {cur_harvestnames}', is_matching_debug_pkg)

		parent_package_ids = []

		if cur_harvestnames in sourceharvestnum_to_package_ids:
			for possible_parent_pkg_id in sourceharvestnum_to_package_ids[cur_harvestnames]:
				_print_if(f'Possible parent based on source harvest names {possible_parent_pkg_id}', is_matching_debug_pkg)
				#possible_parent_history = package_id_to_history[possible_parent_pkg_id]
				#_print_if(possible_parent_history.incomings[-1], is_matching_debug_pkg)
				#_print_if(possible_parent_history.active_inventory_pkg, is_matching_debug_pkg)

			if len(sourceharvestnum_to_package_ids[cur_harvestnames]) == 1:
				# Here we've found one unique incoming parent package, so we can assume
				# its the parent of this child.
				parent_package_id = sourceharvestnum_to_package_ids[cur_harvestnames][0]
				child_to_parent_details[child_package_id] = {
					'incoming_pkg': _get_incoming_pkg(parent_package_id),
					'parent_package_id': parent_package_id,
					'is_synthetic': False
				}
				_print_if('Found parent based on single parent matching harvest name', is_matching_debug_pkg)
				continue
			else:
				parent_package_ids = sourceharvestnum_to_package_ids[cur_harvestnames]
				match_resp = _determine_match_based_on_harvest(
					pkg, parent_package_ids, package_id_to_history
				)
				if match_resp['has_match']:
					_print_if('Found parent based on inference logic using harvest name', is_matching_debug_pkg)
					child_to_parent_details[child_package_id] = {
						'incoming_pkg': match_resp['incoming_pkg'],
						'parent_package_id': None,
						'is_synthetic': True
					}
					continue

		batch_no = pkg['source_production_batch_numbers']
		if not batch_no:
			orphan_child_package_ids.append(child_package_id)
			#print(parent_package_ids)
			#print(pkg['package_id'])
			
			#harvest_names = pkg['package_payload']['sourceharvestnames']
			#if harvest_names:
			#	print(pkg['package_payload']['sourceharvestnames'])
			#else:
			#	print('<empty>')

			num_orphans += 1
			continue
		
		if batch_no:
			_print_if(f'Has a source production batch number no parent found with that batch number', is_matching_debug_pkg)

		if batch_no not in productionbatchnum_to_package_id:
			has_number_but_no_parent += 1
			children_with_source_missing_parents.append(child_package_id)
			continue
		
		_print_if('Found parent based on production batch num', is_matching_debug_pkg)
		parent_package_id = productionbatchnum_to_package_id[batch_no]
		child_to_parent_details[child_package_id] = {
			'incoming_pkg': _get_incoming_pkg(parent_package_id),
			'parent_package_id': parent_package_id,
			'is_synthetic': False
		}

	#print('Children missing source batch number: {}'.format(orphan_child_package_ids))
	#print('')
	#print('Children with source missing parent: {}'.format(children_with_source_missing_parents))
	#print('')
	#print('Product batch num to parent id {}'.format(productionbatchnum_to_package_id))

	return MatchingParentRespDict(
		child_to_parent_details=child_to_parent_details,
		has_number_but_no_parent=has_number_but_no_parent,
		num_orphans=num_orphans
	)

def get_histories(d: Download) -> Dict[str, PackageHistory]:
	package_id_to_history = {}
	
	for in_r in d.incoming_records:
		package_id = in_r['package_id']
		if package_id not in package_id_to_history:
			package_id_to_history[package_id] = PackageHistory(package_id)

		history = package_id_to_history[package_id]
		history.incomings.append(in_r)

	for out_r in d.outgoing_records:
		package_id = out_r['package_id']
		if package_id not in package_id_to_history:
			package_id_to_history[package_id] = PackageHistory(package_id)

		history = package_id_to_history[package_id]
		history.outgoings.append(out_r)

	for tx_r in d.sales_tx_records:
		package_id = tx_r['tx_package_id']
		if package_id not in package_id_to_history:
			package_id_to_history[package_id] = PackageHistory(package_id)

		history = package_id_to_history[package_id]
		history.sales_txs.append(tx_r)

	for inactive_pkg in d.inactive_packages_records:
		package_id = inactive_pkg['package_id']
		if package_id not in package_id_to_history:
			package_id_to_history[package_id] = PackageHistory(package_id)

		history = package_id_to_history[package_id]
		history.inactive_pkg = cast(InventoryPackageDict, inactive_pkg)

	for inventory_pkg in d.inventory_packages_records:
		package_id = inventory_pkg['package_id']
		if package_id not in package_id_to_history:
			package_id_to_history[package_id] = PackageHistory(package_id)

		history = package_id_to_history[package_id]
		history.active_inventory_pkg = inventory_pkg

	# Perform parent-child relationship pairing. 
	# Children are packages with no incoming packages
	parent_resp = _match_child_packages_to_parents(d, package_id_to_history)

	for child_package_id, parent_info in parent_resp['child_to_parent_details'].items():
		if child_package_id not in package_id_to_history:
			continue

		if parent_info['is_synthetic']:
			parent_history = None
		else:
			parent_package_id = parent_info['parent_package_id']
			if parent_package_id not in package_id_to_history:
				continue

			parent_history = package_id_to_history[parent_package_id] 
		
		if parent_history:
			parent_history.is_parent = True

		child_history = package_id_to_history[child_package_id]
		child_history.incomings.append(parent_info['incoming_pkg'])
		child_history.is_child_of_parent = True
		child_history.are_prices_inferred = parent_info['is_synthetic']

	return package_id_to_history

##### DEBUG ######

def run_orphan_analysis(d: Download, package_id_to_history: Dict[str, PackageHistory]) -> None:
	# Child to parent package_id
	resp = _match_child_packages_to_parents(d, package_id_to_history)

	print('{} - Number of parent packages'.format(len(d.parent_packages_records)))
	print('')
	print('{} - Child packages with parents'.format(len(resp['child_to_parent_details'].keys())))
	print('{} - orphans; child packages with (no source product batch num)'.format(resp['num_orphans']))
	print('{} - no matching parent; child packages that have a source batch number, but no parent'.format(resp['has_number_but_no_parent']))

def analyze_specific_package_histories(
	d: Download,
	package_id_to_actual_row: Dict[str, Dict],
	package_ids: List[str],
	params: AnalysisParamsDict) -> None:

	package_id_to_history = get_histories(d)
	package_ids_set = set(package_ids)
	p = Printer(verbose=True, show_info=True) 

	for package_id in package_ids:
		print(f'DEBUGGING PACKAGE_ID={package_id}')
		if package_id in package_id_to_actual_row:
			print('Matching metrc_package:')
			print(package_id_to_actual_row[package_id])
			print('')
		else:
			print('! Missing in metrc_packages')

		if package_id not in package_id_to_history:
			print(f'! Package ID {package_id} not in computed')
		else:
			history = package_id_to_history[package_id]
			history.compute_additional_fields(
				p=p, params=params, run_filter=True, skip_over_errors=True)

			if not history.incomings:
				print('CHILD TO PARENT MATCHING ANALYSIS')
				# Lets see why we cant find the parent of this package
				_match_child_packages_to_parents(
					d, package_id_to_history, debug_package_id=history.package_id)

		print('')



PrintCountsDict = TypedDict('PrintCountsDict', {
	'only_incoming': int,
	'only_outgoing': int,
	'only_sold': int,
	'outgoing_and_incoming': int,
	'in_and_sold_at_least_once': int,
	'in_and_sold_many_times': int,
	'num_parent_packages': int,
	'num_child_packages': int,
	'total_seen': int
})

def print_counts(id_to_history: Dict[str, PackageHistory], should_print: bool = True) -> PrintCountsDict:
	only_incoming = 0 # Only incoming transfer package(s)
	only_outgoing = 0 # Only outgoing transfer package(s)
	outgoing_and_incoming = 0 # Both incoming and outgoing transfer package(s)
	in_and_sold_at_least_once = 0
	in_and_sold_many_times = 0
	only_sold = 0 # No incoming transfer package(s) but yes sales transaction(s)
	current_inventory = 0
	inventory_with_no_transfers = 0
	total_seen = 0
	num_parent_packages = 0
	num_child_packages = 0

	for package_id, history in id_to_history.items():
		if history.outgoings and not history.incomings:
			only_outgoing += 1

		if history.incomings and not history.outgoings and not history.sales_txs:
			only_incoming += 1
			#print(history.incomings[0]['source_harvest_names'])

		if not history.incomings and history.sales_txs:
			only_sold += 1

		if history.incomings and history.sales_txs:
			in_and_sold_at_least_once += 1

		if history.incomings and len(history.sales_txs) > 1:
			in_and_sold_many_times += 1

		if history.outgoings and history.incomings:
			outgoing_and_incoming += 1

		if history.is_parent:
			num_parent_packages += 1

		if history.is_child_of_parent:
			num_child_packages += 1

		total_seen += 1

	if should_print:
		print(f'Only outgoing: {only_outgoing}')
		print(f'Only incoming: {only_incoming}')	
		print('Sold packages missing pricing information: {} ({:.2f}% of packages)'.format(
					only_sold, only_sold / total_seen * 100))
		print(f'In and out: {outgoing_and_incoming}')
		print(f'In and sold at least once {in_and_sold_at_least_once}')
		print(f'In and sold many times {in_and_sold_many_times}')
		print('')
		print(f' Num parent packages: {num_parent_packages}')
		print(f' num matched child packages: {num_child_packages}')

		print(f'Total pkgs: {total_seen}')

	return PrintCountsDict(
		only_outgoing=only_outgoing,
		only_incoming=only_incoming,
		only_sold=only_sold,
		outgoing_and_incoming=outgoing_and_incoming,
		in_and_sold_at_least_once=in_and_sold_at_least_once,
		in_and_sold_many_times=in_and_sold_many_times,
		num_parent_packages=num_parent_packages,
		num_child_packages=num_child_packages,
		total_seen=total_seen
	)

CogsSummaryDict = TypedDict('CogsSummaryDict', {
	'cogs': float,
	'revenue': float,
	'incoming_pkg_ids_seen': Set[str],
	'sold_pkg_ids_seen': Set[str]
})

def _to_cogs_summary_rows(year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict]) -> List[List[CellValue]]:
	keys = list(year_month_to_summary.keys())
	keys.sort(key=lambda x: datetime.date(year=x.year, month=x.month, day=1))

	rows: List[List[CellValue]] = []
	rows.append(['year_month', 'revenue', 'cogs', 'margin_$', 'margin_%',
		 'total_count_incoming', 'total_count', 'coverage'])
	for key in keys:
		summary = year_month_to_summary[key]

		margin_pct = 0.0
		if not math.isclose(summary['revenue'], 0.0):
			margin_pct = (summary['revenue'] - summary['cogs']) / summary['revenue']

		total_count_incoming = len(summary['incoming_pkg_ids_seen'])
		total_count = len(summary['sold_pkg_ids_seen'])
		coverage = 0.0
		if not math.isclose(total_count, 0.0):
			coverage = total_count_incoming / total_count

		row: List[CellValue] = [
			'{}-{}'.format(key.year, str(key.month).zfill(2)),
			round(summary['revenue'], 2),
			round(summary['cogs'], 2),
			round(summary['revenue'] - summary['cogs'], 2),
			round(margin_pct, 2),
			total_count_incoming,
			total_count,
			round(coverage, 2),
		]
		rows.append(row)

	return rows

def create_cogs_summary_for_all_dates(
	package_id_to_history: Dict[str, PackageHistory],
	params: AnalysisParamsDict
) -> List[List[CellValue]]:

	year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict] = {}

	def _get_summary(cur_date: datetime.date) -> CogsSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = CogsSummaryDict(
				cogs=0.0,
				revenue=0.0,
				incoming_pkg_ids_seen=set(),
				sold_pkg_ids_seen=set(),
			)

		return year_month_to_summary[month]

	for package_id, history in package_id_to_history.items():

		if history.incomings and history.sales_txs:
			# Needs at least 1 sales tx to be considered part of COGS
			incoming_pkg = history.incomings[-1]
			summary = _get_summary(incoming_pkg['received_date'])
			summary['cogs'] += incoming_pkg['shipper_wholesale_price']
			summary['incoming_pkg_ids_seen'].add(incoming_pkg['package_id'])

		for sales_tx in history.sales_txs:
			summary = _get_summary(sales_tx['sales_date'])
			summary['revenue'] += sales_tx['tx_total_price']
			summary['sold_pkg_ids_seen'].add(sales_tx['tx_package_id'])

	return _to_cogs_summary_rows(year_month_to_summary)

def create_top_down_cogs_summary_for_all_dates(
	d: Download,
	params: AnalysisParamsDict
) -> List[List[CellValue]]:

	year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict] = {}

	def _get_summary(cur_date: datetime.date) -> CogsSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = CogsSummaryDict(
				cogs=0.0,
				revenue=0.0,
				incoming_pkg_ids_seen=set(),
				sold_pkg_ids_seen=set(),
			)

		return year_month_to_summary[month]

	for sales_tx in d.sales_tx_records:
		summary = _get_summary(sales_tx['sales_date'])
		summary['revenue'] += sales_tx['tx_total_price']
		summary['sold_pkg_ids_seen'].add(sales_tx['tx_package_id'])


	for incoming_pkg in d.incoming_records:
		if incoming_pkg['shipment_package_state'] == 'Returned':
			continue

		if _is_internal_transfer(incoming_pkg):
			continue

		summary = _get_summary(incoming_pkg['received_date'])
		summary['cogs'] += incoming_pkg['shipper_wholesale_price']
		summary['incoming_pkg_ids_seen'].add(incoming_pkg['package_id'])

	return _to_cogs_summary_rows(year_month_to_summary)

def write_cogs_xlsx(
	topdown_cogs_rows: List[List[CellValue]],
	bottoms_up_cogs_rows: List[List[CellValue]],
	company_name: str) -> None:

	assert len(bottoms_up_cogs_rows) == len(topdown_cogs_rows)
	wb = excel_writer.WorkbookWriter(xlwt.Workbook())

	sheet = wb.add_sheet('Topdown')
	for row in topdown_cogs_rows:
		sheet.add_row(row)

	sheet = wb.add_sheet('Bottomsup')
	for row in bottoms_up_cogs_rows:
		sheet.add_row(row)

	sheet = wb.add_sheet('Delta')
	for i in range(len(bottoms_up_cogs_rows)):
		if i == 0:
			# Header row
			sheet.add_row(bottoms_up_cogs_rows[0])
			continue

		topdown = topdown_cogs_rows[i]
		bottomsup = bottoms_up_cogs_rows[i]

		delta_row = [topdown[0]]

		for j in range(len(topdown)):
			if j == 0:
				continue

			delta_row.append(cast(float, topdown[j]) - cast(float, bottomsup[j]))

		sheet.add_row(delta_row)

	Path('out').mkdir(parents=True, exist_ok=True)

	filepath = f'out/{company_name}_cogs_summary.xls'
	with open(filepath, 'wb') as f:
		wb.save(f)
		print('Wrote result to {}'.format(filepath))

def create_inventory_dataframe_by_date(
	package_id_to_history: Dict[str, PackageHistory],
	date_str: str,
	params: AnalysisParamsDict
) -> List[List[str]]:
	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1

	p = Printer(verbose=False, show_info=False)
	exclude_reason_to_count: Dict[str, int] = OrderedDict()

	for package_id, history in package_id_to_history.items():
		history.compute_additional_fields(p=p, params=params, run_filter=True, skip_over_errors=False)
		num_total += 1
		if history.should_exclude:
			num_excluded += 1
			reason_count = exclude_reason_to_count.get(history.exclude_reason, 0)
			exclude_reason_to_count[history.exclude_reason] = reason_count + 1

		if max_to_see > 0 and i >= max_to_see:
			# NOTE: remove this break, using this so I can debug 1 package
			# at a time
			break

		i += 1

	package_records = []
	inventory_date = parse_to_date(date_str)

	for package_id, history in package_id_to_history.items():
		if history.should_exclude:
			continue

		is_in_inventory = history.in_inventory_at_date(inventory_date)
		is_in_inventory_str = 'true' if is_in_inventory else ''

		package_record = history.get_inventory_output_row(inventory_date, is_in_inventory)
		package_record.append(is_in_inventory_str)
		package_records += [package_record]

	return package_records

def create_inventory_dataframes(
	package_id_to_history: Dict[str, PackageHistory],
	q: Query,
	params: AnalysisParamsDict
) -> Dict[str, List[List[str]]]:
	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1

	p = Printer(verbose=False, show_info=False)
	exclude_reason_to_count: Dict[str, int] = OrderedDict()

	computed_package_ids = list(package_id_to_history.keys())

	for package_id, history in package_id_to_history.items():
		history.compute_additional_fields(p=p, params=params, run_filter=True, skip_over_errors=False)
		num_total += 1
		if history.should_exclude:
			num_excluded += 1
			reason_count = exclude_reason_to_count.get(history.exclude_reason, 0)
			exclude_reason_to_count[history.exclude_reason] = reason_count + 1

		if max_to_see > 0 and i >= max_to_see:
			# NOTE: remove this break, using this so I can debug 1 package
			# at a time
			break

		i += 1

	date_to_inventory_records = {}

	for inventory_date_str in q.inventory_dates:
		package_records = []
		inventory_date = parse_to_date(inventory_date_str)

		for package_id, history in package_id_to_history.items():
			if history.should_exclude:
				continue

			if not history.in_inventory_at_date(inventory_date):
				continue

			package_record = history.get_inventory_output_row(inventory_date, is_in_inventory=True)
			package_records += [package_record]

		date_to_inventory_records[inventory_date_str] = package_records

	return date_to_inventory_records

def compare_inventory_dataframes(computed: Any, actual: Any, options: CompareOptionsDict) -> Dict:
	package_id_to_computed_row = {}
	unseen_package_ids = set([])
	all_computed_package_ids_ever_seen = set([])

	for index, row in computed.iterrows():
		if not row['is_in_inventory']:
			# Even though the row is not in the inventory, we've at least seen it
			# historically, which helps us with keeping track of different types of 
			# miscalculations.
			all_computed_package_ids_ever_seen.add(row['package_id'])
			continue

		package_id_to_computed_row[row['package_id']] = row
		unseen_package_ids.add(row['package_id'])

	# How many package IDs are common
	# Of those package IDs that are common, what is the average quantity
	# delta that this is off by
	computed_missing_package_ids = set([])
	computed_missing_package_ids_but_seen_before = set([])
	all_actual_package_ids_even_seen = set([])
	package_id_to_actual_row = {}
	quantities = []
	delta_quantities = []
	num_matching_packages = 0
	num_packages = 0

	for index, row in actual.iterrows():
		all_actual_package_ids_even_seen.add(row['package_id'])

		if float(row['quantity']) < 0.0 or math.isclose(float(row['quantity']), 0.0):
			# Packages with no quantity do not need to be considered, since they
			# should be filtered in the computed packages
			continue

		num_packages += 1
		package_id_to_actual_row[row['package_id']] = row

		if row['package_id'] not in package_id_to_computed_row:
			if options['accept_computed_when_sold_out'] and row['package_id'] in all_computed_package_ids_ever_seen:
				# When this flag is turned on, we trust that the computed calculation, because
				# we have seen the package before, we just saw that it sold out due to
				# sales transactions.
				num_matching_packages += 1
				delta_quantities.append(0.0)
				quantities.append(0)
			else:
				computed_missing_package_ids.add(row['package_id'])
				# Was this ever computed but just not in the current inventory though?
				if row['package_id'] in all_computed_package_ids_ever_seen:
					computed_missing_package_ids_but_seen_before.add(row['package_id'])

		else:
			computed_row = package_id_to_computed_row[row['package_id']]
			
			unseen_package_ids.remove(row['package_id'])
			num_matching_packages += 1
			delta_quantities.append(abs(float(row['quantity']) - float(computed_row['quantity'])))
			quantities.append(row['quantity'])

	extra_quantity = 0.0
	unseen_package_ids_in_inventory_at_some_point = set([])

	for package_id in unseen_package_ids:
		extra_quantity += float(package_id_to_computed_row[package_id]['quantity'])
		if package_id in all_actual_package_ids_even_seen:
			unseen_package_ids_in_inventory_at_some_point.add(package_id)

	quantity_delta = sum(delta_quantities) / len(delta_quantities)
	total_quantity = sum(quantities)
	quantity_avg = total_quantity / len(quantities)

	quantities_not_in_computed = []
	for package_id in computed_missing_package_ids_but_seen_before:
		quantities_not_in_computed.append(float(package_id_to_actual_row[package_id]['quantity']))

	if quantities_not_in_computed:
		quantity_not_computed_avg = sum(quantities_not_in_computed) / len(quantities_not_in_computed)
	else:
		quantity_not_computed_avg = 0.0

	print('Pct of # inventory matching: {:.2f}% ({} / {})'.format(
		num_matching_packages / num_packages * 100,
		num_matching_packages,
		num_packages
	))
	print('Accuracy of quantities: {:.2f}%'.format((quantity_avg - quantity_delta) / quantity_avg * 100))
	print('Pct of # inventory packages over-estimated: {:.2f}%'.format(len(unseen_package_ids) / num_packages * 100))
	print('Pct of # quantity over-estimated: {:.2f}%'.format(extra_quantity / total_quantity))
	print('Avg quantity delta: {:.2f}'.format(quantity_delta))
	print('Avg quantity: {:.2f}'.format(quantity_avg))
	print('')
	print('Num matching packages: {}'.format(num_matching_packages))

	print('Num actual packages not computed: {}'.format(len(computed_missing_package_ids)))
	print('  but computed at some point: {}, e.g., {:.2f}% of non-computed packages'.format(
		len(computed_missing_package_ids_but_seen_before), len(computed_missing_package_ids_but_seen_before) / len(computed_missing_package_ids) * 100))
	print('  avg quantity from actual packages {:.2f}'.format(quantity_not_computed_avg))

	print('Num computed packages not in actual: {}'.format(len(unseen_package_ids)))
	print('  but in actual inventory at some point: {}'.format(
		len(unseen_package_ids_in_inventory_at_some_point)))

	num_errors_to_show = options['num_errors_to_show']
	print('')
	print(f'Computed has these extra package IDs; first {num_errors_to_show}')
	i = 0
	unseen_quantity_tuples = []

	for package_id in unseen_package_ids:
		cur_row = package_id_to_computed_row[package_id]
		unseen_quantity_tuples.append((package_id, float(cur_row['quantity']), cur_row['unit_of_measure']))

	unseen_quantity_tuples.sort(key=lambda x: x[1], reverse=True) # sort quantity, largest to smallest

	for (package_id, quantity, unit_of_measure) in unseen_quantity_tuples:
		if i > num_errors_to_show:
			break

		print(f'{package_id}: computed quantity {quantity} ({unit_of_measure})')

		i += 1

	print('')
	print(f'Computed is missing these package IDs; first {num_errors_to_show}')
	computed_missing_tuples: List[Tuple[str, InventoryPackageDict]] = []

	i = 0
	for package_id in computed_missing_package_ids:
		cur_row = package_id_to_actual_row[package_id]
		computed_missing_tuples.append((package_id, cur_row))

	computed_missing_tuples.sort(key=lambda x: x[1]['quantity'], reverse=True) # sort quantity, largest to smallest

	computed_missing_actual_package_ids = []
	for (package_id, cur_row) in computed_missing_tuples:
		if i > num_errors_to_show:
			break

		quantity = cur_row['quantity']
		unit_of_measure = cur_row['unit_of_measure']
		product_category_name = cur_row['product_category_name']

		print(f'{package_id}: actual quantity {quantity} ({unit_of_measure}) of {product_category_name}')
		computed_missing_actual_package_ids.append(package_id)
		i += 1

	return {
		'computed_extra_package_ids': unseen_package_ids,
		'computed_missing_actual_package_ids': computed_missing_actual_package_ids
	}

def create_inventory_xlsx(
	id_to_history: Dict[str, PackageHistory], q: Query, params: AnalysisParamsDict) -> None:
		
	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1

	p = Printer(verbose=False, show_info=False)
	exclude_reason_to_count: Dict[str, int] = OrderedDict()

	for package_id, history in id_to_history.items():
		history.compute_additional_fields(p=p, params=params, run_filter=True, skip_over_errors=False)
		num_total += 1
		if history.should_exclude:
			num_excluded += 1
			reason_count = exclude_reason_to_count.get(history.exclude_reason, 0)
			exclude_reason_to_count[history.exclude_reason] = reason_count + 1

		if max_to_see > 0 and i >= max_to_see:
			# NOTE: remove this break, using this so I can debug 1 package
			# at a time
			break
				
		i += 1

	wb = excel_writer.WorkbookWriter(xlwt.Workbook())
	
	for inventory_date_str in q.inventory_dates:
		inventory_date = parse_to_date(inventory_date_str)
		sheet_name = inventory_date_str.replace('/', '-')
		sheet = wb.add_sheet(sheet_name)
		
		# Determine whether this package belongs in the inventory for this date
		first = True
		
		for package_id, history in id_to_history.items():
			if history.should_exclude:
				continue

			if not history.in_inventory_at_date(inventory_date):
				continue

			if first:
				sheet.add_row(get_inventory_column_names())
				first = False
			
			row = history.get_inventory_output_row(inventory_date, is_in_inventory=True)
			sheet.add_row(row)
	
	Path('out').mkdir(parents=True, exist_ok=True)

	filepath = f'out/{q.company_name}_inventory_by_month.xls'
	with open(filepath, 'wb') as f:
		wb.save(f)
		print('Wrote result to {}'.format(filepath))
			
	pct_excluded = '{:.2f}'.format(num_excluded / num_total * 100)
	print(f'Excluded {num_excluded} / {num_total} packages from consideration ({pct_excluded}%)')
	for reason, count in exclude_reason_to_count.items():
		print(f'  {reason}: {count} times')
