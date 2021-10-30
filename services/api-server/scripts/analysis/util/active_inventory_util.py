import datetime
import glob
import math
import numpy
import pandas
import pytz
import xlwt

from pathlib import Path
from typing import Any, Dict, List, Tuple, Union, Set, cast
from dateutil import parser
from collections import OrderedDict
from mypy_extensions import TypedDict

from bespoke.db.db_constants import DeliveryType
from bespoke.excel import excel_writer

DEFAULT_SOLD_THRESHOLD = 0.95

AnalysisParamsDict = TypedDict('AnalysisParamsDict', {
	'sold_threshold': float
})

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

class Download(object):
		
	def __init__(self) -> None:
		self.incoming_records: List[Dict] = None
		self.outgoing_records: List[Dict] = None
		self.sales_tx_records: List[Dict] = None

	def download_dataframes(
		self,
		incoming_transfer_packages_dataframe: Any,
		outgoing_transfer_packages_dataframe: Any,
		sales_transactions_dataframe: Any
	) -> None:
		self.incoming_records = incoming_transfer_packages_dataframe.to_dict('records')
		self.outgoing_records = outgoing_transfer_packages_dataframe.to_dict('records')
		self.sales_tx_records = sales_transactions_dataframe.to_dict('records')
		for sales_tx_record in self.sales_tx_records:
			sales_tx_record['sales_datetime'] = sales_tx_record['sales_datetime'].to_pydatetime()
			sales_tx_record['sales_date'] = parse_to_date(sales_tx_record['sales_datetime'])

		for incoming_r in self.incoming_records:
			incoming_r['received_datetime'] = parse_to_datetime(incoming_r['received_datetime'])
			incoming_r['received_date'] = parse_to_date(incoming_r['received_datetime'])
			incoming_r['created_date'] = parse_to_date(incoming_r['created_date'])

		for outgoing_r in self.outgoing_records:
			outgoing_r['received_datetime'] = parse_to_datetime(outgoing_r['received_datetime'])
			outgoing_r['received_date'] = parse_to_date(outgoing_r['received_datetime'])
			outgoing_r['created_date'] = parse_to_date(outgoing_r['created_date'])

	def download_files(
		self,
		incoming_files: List[str],
		outgoing_files: List[str],
		sales_transactions_files: List[str],
	) -> None:
		self.incoming_records = self._file_as_dict_records(incoming_files)
		self.outgoing_records = self._file_as_dict_records(outgoing_files)
		self.sales_tx_records = self._file_as_dict_records(sales_transactions_files)

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

class Query(object):

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

class ExcludeReason(object):
	MISSING_INCOMING = 'MISSING_INCOMING'
	MISSING_TIMESTAMP = 'MISSING_TIMESTAMP'
	OUT_OF_ORDER_DATES = 'OUT_OF_ORDER_DATES'

def _date_to_datetime(date: datetime.date) -> datetime.datetime:
	return datetime.datetime.combine(date.today(), datetime.datetime.min.time()).replace(tzinfo=pytz.UTC)

class PackageHistory(object):
	"""
		Grab all the information we know about this package, and then compute multiple fields on it
	"""

	def __init__(self, package_id: str) -> None:
		self.incomings: List[Dict] = []
		self.outgoings: List[Dict] = []
		self.sales_txs: List[Dict] = []
		self.package_id = package_id
		self.computed_info: Dict = {}
		self.should_exclude = False
		self.exclude_reason = ''
				
	def in_inventory_at_date(self, cur_date_str: str) -> bool:
		# Was this package in the company's possession at this date?
		cur_date = parse_to_date(cur_date_str)    
		arrived_date = self.computed_info['arrived']['date']
		if cur_date < arrived_date:
			return False
		
		sold_date = self.computed_info.get('sold', {}).get('date')
		if sold_date and cur_date > sold_date:
			# We know it's not in your possession after the sales date
			return False

		cur_quantity = self._get_current_quantity(cur_date_str)
		if cur_quantity <= 0:
			# No quantity left even if it wasn't fully sold
			return False
		
		# Knowing nothing else, assume you have the package at this date
		return True
	
	def _get_current_quantity(self, inventory_date_str: str) -> int:
		if 'date_to_quantity' not in self.computed_info:
			return -1

		dates = list(self.computed_info['date_to_quantity'].keys())
		dates.sort()
		inventory_date = parse_to_date(inventory_date_str)
		cur_quantity = 0

		for cur_date in dates:
			if parse_to_date(cur_date) < inventory_date:
				# Keep updating what the quantity is until we reach the inventory date
				cur_quantity = self.computed_info['date_to_quantity'][cur_date]

		return int(cur_quantity)

	def get_inventory_column_names(self) -> List[str]:
		return [
			'package_id',
			'arrived_date',
			'product_category_name',
			'product_name',
			'quantity',
			'sold_date',
		]

	def get_inventory_output_row(self, inventory_date_str: str) -> List[str]:
		incoming_pkg = self.incomings[-1] if self.incomings else None 
		sold_date = self.computed_info.get('sold', {}).get('date')
		
		if not incoming_pkg:
			return []

		cur_quantity = self._get_current_quantity(inventory_date_str)

		return [
			self.package_id,
			incoming_pkg['license_number'],
			date_to_str(self.computed_info['arrived']['date']),
			incoming_pkg['product_category_name'],
			incoming_pkg['product_name'],
			'{}'.format(cur_quantity) if cur_quantity != -1 else '',
			date_to_str(sold_date) if sold_date else '',
		]
				
	def filter_out_unhandled_packages(self, p: Printer) -> None:    
		if not self.incomings:
			p.info(f'Excluding package {self.package_id} because it doesnt have an incoming package')
			self.should_exclude = True
			self.exclude_reason = ExcludeReason.MISSING_INCOMING
			return
				
	def when_it_arrived(self, p: Printer) -> bool:
		# Fills in the 'arrived' value for self.computed_info
		if self.incomings:
			incoming_pkg = self.incomings[-1]
			arrived_date = incoming_pkg['received_datetime']
			self.computed_info['arrived'] = {
				'reason': 'incoming',
				'date': arrived_date
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
				print(incoming_pkg)

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

		all_transfer_pkgs = incoming_pkgs + outgoing_pkgs
		all_transfer_pkgs.sort(key=lambda x: x['received_datetime'])

		def _find_insertion(sales_datetime: datetime.datetime) -> Dict:
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

				if sales_datetime >= cur_transfer_datetime and sales_datetime <= next_transfer_datetime:
					return cur_transfer_pkg

			# If no package was still found to match to, assume that a transaction which
			# occurred in the same day as an incoming package is still OK, even if it
			# technically happened minutes or hours before arriving according to metrc
			sales_date = sales_datetime.date()

			for i in range(len(all_transfer_pkgs)):
				cur_transfer_pkg = all_transfer_pkgs[i]
				cur_transfer_date = cur_transfer_pkg['received_date']

				if (i + 1) >= len(all_transfer_pkgs):
					# We reached the end of the array, so just put some enormously
					# large date
					next_transfer_date = datetime.date(3000, 1, 1)
				else:
					next_transfer_date = all_transfer_pkgs[i+1]['received_date']

				if sales_date >= cur_transfer_date and sales_date <= next_transfer_date:
					return cur_transfer_pkg

			if skip_over_errors:
				# If we are just using this for debugging, insert this transaction into
				# the last transfer package we see
				return cur_transfer_pkg
			else:
				return None

		self.sales_txs.sort(key = lambda x: x['sales_datetime'])

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

		lines = []
		verbose = p.verbose
		
		amount_sold = 0
		is_sold = False
		revenue_from_pkg = 0
		remaining_quantity = 0
		seen_receipt_numbers = {}
		seen_sales_datetimes = {}
		date_to_quantity: Dict[datetime.date, int] = {}

		def _is_incoming(transfer_pkg: Dict) -> bool:
			# For the purposes of this inventory exercise, incoming means its
			# still in the posession of the company

			return transfer_pkg['delivery_type'] in set([
				DeliveryType.INTERNAL, 
				DeliveryType.INCOMING_INTERNAL, 
				DeliveryType.OUTGOING_INTERNAL,
				DeliveryType.INCOMING_FROM_VENDOR,
				DeliveryType.INCOMING_UNKNOWN
			])

		def _is_outgoing(transfer_pkg: Dict) -> bool:
			# For the purposes of this inventory exercise, outgoing means its
			# no onger in the posession of the company
			return transfer_pkg['delivery_type'] in set([
				DeliveryType.OUTGOING_TO_PAYOR,
				DeliveryType.OUTGOING_UNKNOWN
			])
		
		for transfer_pkg in all_transfer_pkgs:
			
			if _is_incoming(transfer_pkg):
				incoming_pkg = transfer_pkg

				arrived_date = incoming_pkg['received_date']
				if not incoming_pkg['shipped_quantity'] or numpy.isnan(incoming_pkg['shipped_quantity']):
					p.warn(f'package #{self.package_id} does not have a shipped quantity', package_id=self.package_id)
					return False

				shipped_quantity = int(incoming_pkg['shipped_quantity'])
				price_of_pkg = incoming_pkg['shipper_wholesale_price']
				shipment_package_state = incoming_pkg['shipment_package_state']

				initial_quantity = shipped_quantity
				if shipment_package_state == 'Returned':
					initial_quantity = 0

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
					p.warn(f'package #{self.package_id} does not have a outgoing shipped quantity', package_id=self.package_id)
					return False

				shipped_quantity = int(incoming_pkg['shipped_quantity'])

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

					if revenue_from_pkg != 0:
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
							'date': is_sold_date
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
			
		self.when_it_arrived(p)
		self.run_is_sold_logic(
			p, 
			sold_threshold=params.get('sold_threshold', DEFAULT_SOLD_THRESHOLD),
			skip_over_errors=skip_over_errors)
				
		
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

	return package_id_to_history

##### DEBUG ######

def analyze_specific_package_histories(
	d: Download,
	package_id_to_actual_row: Dict[str, Dict],
	package_ids: List[str],
	params: AnalysisParamsDict) -> None:

	package_id_to_history = get_histories(d)
	package_ids_set = set(package_ids)
	p = Printer(verbose=True, show_info=True) 

	for package_id in package_ids:
			if package_id in package_id_to_actual_row:
				print('Matching metrc_package')
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


def print_counts(id_to_history: Dict[str, PackageHistory]) -> None:
	only_incoming = 0 # Only incoming transfer package(s)
	only_outgoing = 0 # Only outgoing transfer package(s)
	outgoing_and_incoming = 0 # Both incoming and outgoing transfer package(s)
	in_and_sold_at_least_once = 0
	in_and_sold_many_times = 0
	only_sold = 0 # No incoming transfer package(s) but yes sales transaction(s)
	current_inventory = 0
	inventory_with_no_transfers = 0
	total_seen = 0

	for package_id, history in id_to_history.items():
		if history.outgoings and not history.incomings:
			only_outgoing += 1

		if history.incomings and not history.outgoings and not history.sales_txs:
			only_incoming += 1

		if not history.incomings and history.sales_txs:
			only_sold += 1

		if history.incomings and history.sales_txs:
			in_and_sold_at_least_once += 1

		if history.incomings and len(history.sales_txs) > 1:
			in_and_sold_many_times += 1

		if history.outgoings and history.incomings:
			outgoing_and_incoming += 1

		total_seen += 1

	print(f'Only outgoing: {only_outgoing}')
	print(f'Only incoming: {only_incoming}')
	print(f'Only sold: {only_sold}')
	print(f'In and out: {outgoing_and_incoming}')
	print(f'In and sold at least once {in_and_sold_at_least_once}')
	print(f'In and sold many times {in_and_sold_many_times}')
	print(f'Total pkgs: {total_seen}')

def create_inventory_dataframe_by_date(
	package_id_to_history: Dict[str, PackageHistory],
	date: str,
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

	for package_id, history in package_id_to_history.items():
		if history.should_exclude:
			continue

		is_in_inventory = history.in_inventory_at_date(date)
		is_in_inventory_str = 'true' if is_in_inventory else ''

		package_record = history.get_inventory_output_row(date)
		package_record.append(is_in_inventory_str)
		package_records += [package_record]

	return package_records

def create_inventory_dataframes(
	package_id_to_history: Dict[str, PackageHistory],
	q: Query,
	params: AnalysisParamsDict,
) -> Dict[str, List[List[str]]]:
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

	date_to_inventory_records = {}

	for inventory_date in q.inventory_dates:
		package_records = []

		for package_id, history in package_id_to_history.items():
			if history.should_exclude:
				continue

			if not history.in_inventory_at_date(inventory_date):
				continue

			package_record = history.get_inventory_output_row(inventory_date)
			package_records += [package_record]

		date_to_inventory_records[inventory_date] = package_records

	return date_to_inventory_records

def are_packages_inactive_query(package_ids: List[str]) -> str:
	package_ids_str = ','.join([f"'{package_id}'" for package_id in list(package_ids)])

	return f"""
			select
					companies.identifier,
					metrc_packages.license_number,
					metrc_packages.type,
					metrc_packages.package_id,
					metrc_packages.package_label,
					metrc_packages.product_category_name,
					metrc_packages.product_name,
					metrc_packages.package_payload.archiveddate,
					metrc_packages.package_payload.finisheddate,
					metrc_packages.quantity
			from
					metrc_packages
					inner join companies on metrc_packages.company_id = companies.id
			where
					True
					and metrc_packages.package_id in ({package_ids_str})
					and metrc_packages.type = 'inactive'
	"""

CompareOptionsDict = TypedDict('CompareOptionsDict', {
	'num_errors_to_show': int,
	'accept_computed_when_sold_out': bool
})

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
		unseen_quantity_tuples.append((package_id, int(cur_row['quantity'])))

	unseen_quantity_tuples.sort(key=lambda x: x[1], reverse=True) # sort quantity, largest to smallest

	for (package_id, quantity) in unseen_quantity_tuples:
		if i > num_errors_to_show:
			break

		print('{}; computed quantity {}'.format(package_id, quantity))

		i += 1

	print('')
	print(f'Computed is missing these package IDs; first {num_errors_to_show}')
	computed_missing_tuples = []

	i = 0
	for package_id in computed_missing_package_ids:
		cur_row = package_id_to_actual_row[package_id]
		computed_missing_tuples.append((package_id, cur_row['quantity']))

	computed_missing_tuples.sort(key=lambda x: x[1], reverse=True) # sort quantity, largest to smallest

	for (package_id, quantity) in computed_missing_tuples:
		if i > num_errors_to_show:
			break

		print('{}; quantity: {}'.format(package_id, quantity))
		i += 1

	return {
		'computed_extra_package_ids': unseen_package_ids
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
	
	for inventory_date in q.inventory_dates:
		sheet_name = inventory_date.replace('/', '-')
		sheet = wb.add_sheet(sheet_name)
		
		# Determine whether this package belongs in the inventory for this date
		first = True
		
		for package_id, history in id_to_history.items():
			if history.should_exclude:
				continue

			if not history.in_inventory_at_date(inventory_date):
				continue

			if first:
				sheet.add_row(history.get_inventory_column_names())
				first = False
			
			row = history.get_inventory_output_row(inventory_date)
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
