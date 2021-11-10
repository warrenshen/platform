import datetime
import numpy
import glob
import pandas
import pytz

from typing import Dict, List, Iterable, Any, cast
from bespoke.inventory.analysis.shared import create_queries, prepare_data

from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date, parse_to_datetime, is_time_null
)
from bespoke.inventory.analysis.shared.inventory_types import (
	Printer,
	Query,
	InventoryPackageDict,
	TransferPackageDict,
	SalesTransactionDict,
)

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

def _date_to_datetime(date: datetime.date) -> datetime.datetime:
	return datetime.datetime.combine(date.today(), datetime.datetime.min.time()).replace(tzinfo=pytz.UTC)

def _fix_received_date_and_timezone(pkg: TransferPackageDict) -> None:
	if is_time_null(pkg['received_datetime']):
		#p.warn('seeing an incoming package for #{} with no received_datetime'.format(self.package_id))
		pkg['received_datetime'] = _date_to_datetime(pkg['created_date'])	
	elif type(pkg['received_datetime']) == datetime.datetime:
		pkg['received_datetime'] = pkg['received_datetime'].replace(tzinfo=pytz.UTC)

def _set_quantity_and_unit(pkg: TransferPackageDict) -> None:

	if pkg['received_quantity'] and not numpy.isnan(pkg['received_quantity']):
		pkg['quantity'] = float(pkg['received_quantity'])
		pkg['unit_of_measure'] = pkg['received_unit_of_measure']
		pkg['price'] = float(pkg['receiver_wholesale_price'])
	elif pkg['shipped_quantity'] and not numpy.isnan(pkg['shipped_quantity']):
		# Fall back to shipped quantity if needed
		pkg['quantity'] = float(pkg['shipped_quantity'])
		pkg['unit_of_measure'] = pkg['shipped_unit_of_measure']
		pkg['price'] = float(pkg['shipper_wholesale_price'])
	else:
		pkg['quantity'] = 0.0
		pkg['unit_of_measure'] = 'unknown'
		pkg['price'] = 0.0

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
		self.sales_tx_records = cast(List[SalesTransactionDict], prepare_data.dedupe_sales_transactions(
			sales_transactions_dataframe).to_dict('records'))
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
			_fix_received_date_and_timezone(incoming_r)
			incoming_r['received_date'] = parse_to_date(incoming_r['received_datetime'])
			incoming_r['created_date'] = parse_to_date(incoming_r['created_date'])
			all_package_ids.add(incoming_r['package_id'])
			_set_quantity_and_unit(incoming_r)

			if incoming_r['package_id'] in missing_incoming_pkg_package_ids:
				missing_incoming_pkg_package_ids.remove(incoming_r['package_id'])

		for outgoing_r in self.outgoing_records:
			outgoing_r['received_datetime'] = parse_to_datetime(outgoing_r['received_datetime'])
			_fix_received_date_and_timezone(outgoing_r)
			outgoing_r['received_date'] = parse_to_date(outgoing_r['received_datetime'])
			outgoing_r['created_date'] = parse_to_date(outgoing_r['created_date'])
			_set_quantity_and_unit(outgoing_r)
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
