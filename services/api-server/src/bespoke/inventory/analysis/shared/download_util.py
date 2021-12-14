import calendar
import concurrent
import datetime
import numpy
import logging
import glob
import os
import time
import pandas as pd
import pytz
import pyarrow

from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import create_engine
from typing import Dict, List, Optional, Iterable, Any, cast
from mypy_extensions import TypedDict

from bespoke.inventory.analysis.shared import create_queries, prepare_data
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date, parse_to_datetime, is_time_null, safe_isnan
)
from bespoke.db.models_util import chunker
from bespoke.inventory.analysis.shared.inventory_types import (
	Printer,
	Query,
	AnalysisContext,
	DataframeDownloadContext,
	InventoryPackageDict,
	TransferPackageDict,
	SalesTransactionDict,
)

DataFrameQueryParams = TypedDict('DataFrameQueryParams', {
	'company_identifier': str,
	'transfer_packages_start_date': str,
	'sales_transactions_start_date': str,
	'license_numbers': List[str]
})

def _get_float_or_none(val: Any) -> Optional[float]:
	if not val:
		return None

	if safe_isnan(val):
		return None

	return float(val)

class SQLHelper(object):

	def get_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		pass

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		pass

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pd.DataFrame:
		pass

class BigQuerySQLHelper(SQLHelper):

	def __init__(self, ctx: DataframeDownloadContext, engine: Any) -> None:
		self.ctx = ctx
		self.engine = engine

	def get_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		df_path = self.ctx.get_output_path('download/get_packages.pickle')
		if self.ctx.read_params['use_cached_dataframes'] and os.path.exists(df_path):
			df = pd.read_pickle(df_path)
		else:
			package_ids_list = chunker(list(package_ids), size=50000)

			dfs = []
			for cur_package_ids in package_ids_list:
				cur_df = pd.read_sql_query(
						create_queries.create_packages_by_package_ids_query(cur_package_ids),
						self.engine
				)
				if len(cur_df.index) > 0:
					dfs.append(cur_df)

			if dfs:
				df = pd.concat(dfs, axis=0)
			else:
				df = pd.DataFrame()

		if self.ctx.write_params['save_download_dataframes']:
			df.to_pickle(df_path)

		return df 

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		df_path = self.ctx.get_output_path('download/get_inactive_packages.pickle')

		if self.ctx.read_params['use_cached_dataframes'] and os.path.exists(df_path):
			df = pd.read_pickle(df_path)
		else:
			package_ids_list = chunker(list(package_ids), size=50000)
			dfs = []
			for cur_package_ids in package_ids_list:
				cur_df = pd.read_sql_query(
					create_queries.are_packages_inactive_query(cur_package_ids),
					self.engine
				)
				if len(cur_df.index) > 0:
					dfs.append(cur_df)

			if dfs:
				df = pd.concat(dfs, axis=0)
			else:
				df = pd.DataFrame()

		if self.ctx.write_params['save_download_dataframes']:
			df.to_pickle(df_path)

		return df

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pd.DataFrame:
		df_path = self.ctx.get_output_path('download/get_packages_by_production_batch_numbers.pickle')
		if self.ctx.read_params['use_cached_dataframes'] and os.path.exists(df_path):
			df = pd.read_pickle(df_path)
		else:
			batch_numbers_list = chunker(list(production_batch_numbers), size=50000)

			dfs = []
			for cur_batch_numbers in batch_numbers_list:
				cur_df = pd.read_sql_query(
					create_queries.create_packages_by_production_batch_numbers_query(cur_batch_numbers),
					self.engine
				)
				if len(cur_df.index) > 0:
					dfs.append(cur_df)

			# Combine all the rows together into one DF
			if dfs:
				df = pd.concat(dfs, axis=0)
			else:
				df = pd.DataFrame()

		if self.ctx.write_params['save_download_dataframes']:
			df.to_pickle(df_path)

		return df

def _date_to_datetime(date: datetime.date) -> datetime.datetime:
	return datetime.datetime.combine(date.today(), datetime.datetime.min.time()).replace(tzinfo=pytz.UTC)

def _fix_received_date_and_timezone(pkg: TransferPackageDict) -> None:
	if is_time_null(pkg['received_datetime']):
		#p.warn('seeing an incoming package for #{} with no received_datetime'.format(self.package_id))
		pkg['received_datetime'] = _date_to_datetime(pkg['created_date'])	
	elif type(pkg['received_datetime']) == datetime.datetime:
		pkg['received_datetime'] = pkg['received_datetime'].replace(tzinfo=pytz.UTC)

def _set_quantity_and_unit_when_measurement_matches(pkg: TransferPackageDict) -> None:
	if pkg['received_quantity'] and not safe_isnan(pkg['received_quantity']):
		pkg['quantity'] = float(pkg['received_quantity'])
		pkg['unit_of_measure'] = pkg['received_unit_of_measure']
	elif pkg['shipped_quantity'] and not safe_isnan(pkg['shipped_quantity']):
		# Fall back to shipped quantity if needed
		pkg['quantity'] = float(pkg['shipped_quantity'])
		pkg['unit_of_measure'] = pkg['shipped_unit_of_measure']
	else:
		pkg['quantity'] = 0.0
		pkg['unit_of_measure'] = 'unknown'

	if pkg['receiver_wholesale_price'] and not safe_isnan(pkg['receiver_wholesale_price']):
		pkg['price'] = float(pkg['receiver_wholesale_price'])
	elif pkg['shipper_wholesale_price'] and not safe_isnan(pkg['shipper_wholesale_price']):
		# Fall back to shipper wholesale price if needed
		pkg['price'] = float(pkg['shipper_wholesale_price'])
	else:
		pkg['price'] = 0.0

def _set_quantity_and_unit_when_measurement_differs(pkg: TransferPackageDict) -> None:
	# When the measurement differs, we don't allow mix and matching of the price
	# based on which is filled in

	if pkg['received_quantity'] and not safe_isnan(pkg['received_quantity']):
		pkg['quantity'] = _get_float_or_none(pkg['received_quantity'])
		pkg['unit_of_measure'] = pkg['received_unit_of_measure']
		pkg['price'] = _get_float_or_none(pkg['receiver_wholesale_price'])
	elif pkg['shipped_quantity'] and not safe_isnan(pkg['shipped_quantity']):
		# Fall back to shipped quantity if needed
		pkg['quantity'] = _get_float_or_none(pkg['shipped_quantity'])
		pkg['unit_of_measure'] = pkg['shipped_unit_of_measure']
		pkg['price'] = _get_float_or_none(pkg['shipper_wholesale_price'])
	else:
		pkg['price'] = 0.0
		pkg['quantity'] = 0.0
		pkg['unit_of_measure'] = 'unknown'

def _set_quantity_and_unit(pkg: TransferPackageDict) -> None:
	if not pkg['received_unit_of_measure'] and not pkg['shipped_unit_of_measure']:
		logging.error('Both received and shipped unit of measure are empty for package_id {}'.format(pkg['package_id']))
		pkg['price'] = 0.0
		pkg['quantity'] = 0.0
		pkg['unit_of_measure'] = 'unknown'
		return

	if pkg['received_unit_of_measure'] and pkg['shipped_unit_of_measure'] \
			and pkg['received_unit_of_measure'].lower() == pkg['shipped_unit_of_measure'].lower():
		_set_quantity_and_unit_when_measurement_matches(pkg)
	else:
		_set_quantity_and_unit_when_measurement_differs(pkg)

AllDataframesDict = TypedDict('AllDataframesDict', {
	'incoming_transfer_packages_dataframe': pd.DataFrame,
	'outgoing_transfer_packages_dataframe': pd.DataFrame,
	'sales_receipts_dataframe': pd.DataFrame,
	'sales_transactions_dataframe': pd.DataFrame,
	'inventory_packages_dataframe': pd.DataFrame,
	# Extra ones we query for once weve gotten the original bunch
	'inactive_packages_dataframe': pd.DataFrame,
	'missing_incoming_pkg_packages_dataframe': pd.DataFrame,
	'parent_packages_dataframe': pd.DataFrame
})

class Download(object):
		
	def __init__(self) -> None:
		self.incoming_records: List[TransferPackageDict] = None
		self.outgoing_records: List[TransferPackageDict] = None
		self.sales_tx_records: List[SalesTransactionDict] = None
		self.sales_receipts_dataframe: pd.DataFrame = None
		self.sales_transactions_dataframe: pd.DataFrame = None
		self.inventory_packages_dataframe: pd.DataFrame = None
		self.incoming_transfer_packages_dataframe: pd.DataFrame = None

		self.inventory_packages_records: List[InventoryPackageDict] = None
		self.inactive_packages_records: List[InventoryPackageDict] = None
		self.missing_incoming_pkg_package_records: List[InventoryPackageDict] = None
		self.parent_packages_records: List[InventoryPackageDict] = None
		self.child_to_parent_package_id_override: Dict[str, str] = {}

	def process_dataframes(
		self,
		all_dataframes_dict: AllDataframesDict,
		ctx: AnalysisContext
	) -> None:
		before = time.time()
		incoming_transfer_packages_dataframe = all_dataframes_dict['incoming_transfer_packages_dataframe']
		outgoing_transfer_packages_dataframe = all_dataframes_dict['outgoing_transfer_packages_dataframe']
		sales_transactions_dataframe = all_dataframes_dict['sales_transactions_dataframe']
		sales_receipts_dataframe = all_dataframes_dict['sales_receipts_dataframe']
		inventory_packages_dataframe = all_dataframes_dict['inventory_packages_dataframe']

		ctx.log('Processing {} incoming transfer packages'.format(len(incoming_transfer_packages_dataframe.index)))
		ctx.log('Processing {} outgoing transfer packages'.format(len(outgoing_transfer_packages_dataframe.index)))
		ctx.log('Processing {} inventory packages'.format(len(inventory_packages_dataframe.index)))
		ctx.log('Processing {} sales receipts'.format(len(sales_receipts_dataframe.index)))
		ctx.log('Processing {} sales transactions'.format(len(sales_transactions_dataframe.index)))

		self.incoming_records = cast(List[TransferPackageDict], incoming_transfer_packages_dataframe.to_dict('records'))
		self.outgoing_records = cast(List[TransferPackageDict], outgoing_transfer_packages_dataframe.to_dict('records'))
		self.sales_tx_records = cast(List[SalesTransactionDict], prepare_data.dedupe_sales_transactions(
			sales_transactions_dataframe).to_dict('records'))
		self.sales_receipts_dataframe = sales_receipts_dataframe
		self.inventory_packages_dataframe = inventory_packages_dataframe
		self.incoming_transfer_packages_dataframe = incoming_transfer_packages_dataframe
		self.sales_transactions_dataframe = sales_transactions_dataframe
		self.inventory_packages_records = cast(
			List[InventoryPackageDict], inventory_packages_dataframe.to_dict('records'))

		after = time.time()
		ctx.log_timing(f'  Took {round(after - before, 2)} seconds for converting to records')

		before = time.time()

		for sales_tx_record in self.sales_tx_records:
			sales_tx_record['sales_datetime'] = cast(Any, sales_tx_record['sales_datetime']).to_pydatetime()
			sales_tx_record['sales_date'] = parse_to_date(sales_tx_record['sales_datetime'])

		after = time.time()
		ctx.log_timing(f'  Took {round(after - before, 2)} seconds to iterate through sales txs')

		before = time.time()

		for incoming_r in self.incoming_records:
			incoming_r['received_datetime'] = parse_to_datetime(incoming_r['received_datetime'])
			_fix_received_date_and_timezone(incoming_r)
			incoming_r['received_date'] = parse_to_date(incoming_r['received_datetime'])
			incoming_r['created_date'] = parse_to_date(incoming_r['created_date'])
			_set_quantity_and_unit(incoming_r)

		after = time.time()
		ctx.log_timing(f'  Took {round(after - before, 2)} seconds to iterate through incoming records')

		before = time.time()
		for outgoing_r in self.outgoing_records:
			outgoing_r['received_datetime'] = parse_to_datetime(outgoing_r['received_datetime'])
			_fix_received_date_and_timezone(outgoing_r)
			outgoing_r['received_date'] = parse_to_date(outgoing_r['received_datetime'])
			outgoing_r['created_date'] = parse_to_date(outgoing_r['created_date'])
			_set_quantity_and_unit(outgoing_r)

		after = time.time()
		ctx.log_timing(f'  Took {round(after - before, 2)} seconds to iterate through outgoing records')

		before = time.time()

		self.inactive_packages_records = cast(
			List[InventoryPackageDict], all_dataframes_dict['inactive_packages_dataframe'].to_dict('records'))

		missing_incoming_pkg_packages_df = all_dataframes_dict['missing_incoming_pkg_packages_dataframe']
		if len(missing_incoming_pkg_packages_df.index) > 0:
			self.missing_incoming_pkg_package_records = cast(
				List[InventoryPackageDict], missing_incoming_pkg_packages_df.to_dict('records'))
		else:
			self.missing_incoming_pkg_package_records = []

		parent_packages_df = all_dataframes_dict['parent_packages_dataframe']
		if len(parent_packages_df.index) > 0:
			self.parent_packages_records = cast(
				List[InventoryPackageDict], parent_packages_df.to_dict('records'))
		else:
			self.parent_packages_records = []

		after = time.time()
		ctx.log_timing(f'  Took {round(after - before, 2)} seconds to iterate through rest of records')

def get_bigquery_engine(engine_url: str) -> Any:
	BIGQUERY_CREDENTIALS_PATH = os.environ.get('BIGQUERY_CREDENTIALS_PATH')
	engine = create_engine(engine_url, credentials_path=os.path.expanduser(BIGQUERY_CREDENTIALS_PATH))
	return engine

def _fetch_inactive_and_package_info_for_dataframes(
	dataframes_dict: AllDataframesDict, sql_helper: SQLHelper) -> None:
	# Step 2: download dataframes that are dependent on the first set of queries
	# we made.
	sales_tx_package_ids = dataframes_dict['sales_transactions_dataframe']['tx_package_id'].tolist()
	incoming_package_ids = dataframes_dict['incoming_transfer_packages_dataframe']['package_id'].tolist()

	# Query for potentially inactive packages
	possibly_inactive_package_ids = set([])
	possibly_inactive_package_ids.update(sales_tx_package_ids)
	possibly_inactive_package_ids.update(incoming_package_ids)
	possibly_inactive_package_ids.update(dataframes_dict['outgoing_transfer_packages_dataframe']['package_id'].tolist())
	all_inactive_packages_df = sql_helper.get_inactive_packages(possibly_inactive_package_ids)

	# For packages missing an incoming_pkg, we query the metrc_packages table to
	# see if there is a parent-child relationship between the original incoming_pkg
	# and this current package.
	sold_package_ids_set = set(sales_tx_package_ids)
	incoming_package_ids_set = set(incoming_package_ids)
	missing_incoming_pkg_package_ids = sold_package_ids_set - incoming_package_ids_set

	if missing_incoming_pkg_package_ids:
		missing_incoming_pkg_packages_df = sql_helper.get_packages(missing_incoming_pkg_package_ids)
	else:
		missing_incoming_pkg_packages_df = pd.DataFrame()

	# For packages missing an incoming_pkg, we query the metrc_packages table to
	# see if there is a parent-child relationship between the original incoming_pkg
	# and this current package.
	# Find the original packages with these production batch numbers.
	production_batch_numbers = set([])
	source_batch_numbers = []
	if len(missing_incoming_pkg_packages_df.index) > 0:
		source_batch_numbers = missing_incoming_pkg_packages_df['source_production_batch_numbers'].tolist()
	
	for source_no in source_batch_numbers:
		if not source_no:
			# print(f"WARN: package {pkg['package_id']} is missing a sourceproductionbatchnumber and an incoming pkg")
			continue
		production_batch_numbers.add(source_no)
	if production_batch_numbers:
		parent_packages_df = sql_helper.get_packages_by_production_batch_numbers(production_batch_numbers)
	else:
		parent_packages_df = pd.DataFrame()

	dataframes_dict['inactive_packages_dataframe'] = all_inactive_packages_df
	dataframes_dict['missing_incoming_pkg_packages_dataframe'] = missing_incoming_pkg_packages_df
	dataframes_dict['parent_packages_dataframe'] = parent_packages_df

def get_dataframes_for_analysis(
	q_params: DataFrameQueryParams, ctx: DataframeDownloadContext, sql_helper: BigQuerySQLHelper, 
	dry_run: bool, num_threads: int, use_incremental_querying: bool) -> AllDataframesDict:
	# Download packages, sales transactions, incoming / outgoing tranfers
	limit = 50 if dry_run else None

	# TODO(dlluncor): For incremental querying
	# 1. Pull from cached dataframe
	# 2. Determine the latest updated_at value
	# 3. Query for updated_at values after that in the DB
	# 4. Join by the unique column in each dataframe to create the final dataframe
	#    to then save.

	company_incoming_transfer_packages_query = create_queries.create_company_incoming_transfer_packages_query(
		q_params['company_identifier'], q_params['transfer_packages_start_date'], 
		license_numbers=q_params['license_numbers'], limit=limit)
	company_outgoing_transfer_packages_query = create_queries.create_company_outgoing_transfer_packages_query(
		q_params['company_identifier'], q_params['transfer_packages_start_date'], 
		license_numbers=q_params['license_numbers'], limit=limit)
	company_sales_receipts_query = create_queries.create_company_sales_receipts_query(
		q_params['company_identifier'], q_params['sales_transactions_start_date'], 
		license_numbers=q_params['license_numbers'],
		limit=limit)
	company_sales_transactions_query = create_queries.create_company_sales_transactions_query(
		q_params['company_identifier'], q_params['sales_transactions_start_date'], 
		license_numbers=q_params['license_numbers'],
		limit=limit)
	company_inventory_packages_query = create_queries.create_company_inventory_packages_query(
			q_params['company_identifier'],
			include_quantity_zero=True,
			license_numbers=q_params['license_numbers'],
			limit=limit
	)

	if ctx.read_params['use_cached_dataframes'] and os.path.exists(ctx.get_output_path(
			'download/incoming_transfers.pickle'
	)):
		# Make sure one of the dataframes was at least written once if we're reading 
		# from the cached dataframes
		company_incoming_transfer_packages_dataframe = pd.read_pickle(ctx.get_output_path(
			'download/incoming_transfers.pickle'
		))
		company_outgoing_transfer_packages_dataframe = pd.read_pickle(ctx.get_output_path(
			'download/outgoing_transfers.pickle'
		))
		company_sales_receipts_dataframe = pd.read_pickle(ctx.get_output_path(
			'download/sales_receipts.pickle'
		))
		company_sales_transactions_dataframe = pd.read_pickle(ctx.get_output_path(
			'download/sales_transactions.pickle'
		))
		company_inventory_packages_dataframe = pd.read_pickle(ctx.get_output_path(
			'download/inventory_packages.pickle'
		))
	else:
		engine = sql_helper.engine
		if num_threads > 1:
			with ThreadPoolExecutor(max_workers=num_threads) as executor:
				dataframe_args_list = [
					('incoming_transfer_packages', company_incoming_transfer_packages_query),
					('outgoing_transfer_packages', company_outgoing_transfer_packages_query),
					('sales_receipts', company_sales_receipts_query),
					('sales_transactions', company_sales_transactions_query),
					('inventory_packages', company_inventory_packages_query)
				]
				future_to_name = {}
				for i in range(len(dataframe_args_list)):
					(dataframe_name, query_str) = dataframe_args_list[i]

					future_to_name[executor.submit(
						pd.read_sql_query,
						query_str,
						engine
						)] = dataframe_name

				for future in concurrent.futures.as_completed(future_to_name):
					dataframe = future.result()
					df_name = future_to_name[future]
					if df_name == 'incoming_transfer_packages':
						company_incoming_transfer_packages_dataframe = dataframe
					elif df_name == 'outgoing_transfer_packages':
						company_outgoing_transfer_packages_dataframe = dataframe
					elif df_name == 'sales_receipts':
						company_sales_receipts_dataframe = dataframe
					elif df_name == 'sales_transactions':
						company_sales_transactions_dataframe = dataframe
					elif df_name == 'inventory_packages':
						company_inventory_packages_dataframe = dataframe
		else:
			company_incoming_transfer_packages_dataframe = pd.read_sql_query(company_incoming_transfer_packages_query, engine)
			company_outgoing_transfer_packages_dataframe = pd.read_sql_query(company_outgoing_transfer_packages_query, engine)
			company_sales_receipts_dataframe = pd.read_sql_query(company_sales_receipts_query, engine)
			company_sales_transactions_dataframe = pd.read_sql_query(company_sales_transactions_query, engine)
			company_inventory_packages_dataframe = pd.read_sql_query(company_inventory_packages_query, engine)

	if ctx.write_params['save_download_dataframes']:
		ctx.mkdir('download')
		company_incoming_transfer_packages_dataframe.to_pickle(ctx.get_output_path(
			'download/incoming_transfers.pickle'
		))
		company_outgoing_transfer_packages_dataframe.to_pickle(ctx.get_output_path(
			'download/outgoing_transfers.pickle'
		))
		company_sales_receipts_dataframe.to_pickle(ctx.get_output_path(
			'download/sales_receipts.pickle'
		))
		company_sales_transactions_dataframe.to_pickle(ctx.get_output_path(
			'download/sales_transactions.pickle'
		))
		company_inventory_packages_dataframe.to_pickle(ctx.get_output_path(
			'download/inventory_packages.pickle'
		))

	dataframes_dict = AllDataframesDict(
		incoming_transfer_packages_dataframe=company_incoming_transfer_packages_dataframe,
		outgoing_transfer_packages_dataframe=company_outgoing_transfer_packages_dataframe,
		sales_receipts_dataframe=company_sales_receipts_dataframe,
		sales_transactions_dataframe=company_sales_transactions_dataframe,
		inventory_packages_dataframe=company_inventory_packages_dataframe,
		inactive_packages_dataframe=None,
		missing_incoming_pkg_packages_dataframe=None,
		parent_packages_dataframe=None
	)

	_fetch_inactive_and_package_info_for_dataframes(dataframes_dict, sql_helper)
	return dataframes_dict

def _filter_by_licenses(df: pd.DataFrame, license_numbers: List[str]) -> pd.DataFrame:
	if len(df.index) > 0:
		return df[cast(Any, df).license_number.isin(license_numbers)].copy()
	else:
		# Nothing to filter so just return an empty data array
		return pd.DataFrame()

def restrict_dataframe_to_licenses(all_dfs_dict: AllDataframesDict, facility_name: str, license_numbers: List[str]) -> AllDataframesDict:
	new_df_dict = AllDataframesDict(
		incoming_transfer_packages_dataframe=None,
		outgoing_transfer_packages_dataframe=None,
		sales_receipts_dataframe=None,
		sales_transactions_dataframe=None,
		inventory_packages_dataframe=None,
		inactive_packages_dataframe=None,
		missing_incoming_pkg_packages_dataframe=None,
		parent_packages_dataframe=None		
	)

	new_df_dict['incoming_transfer_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['incoming_transfer_packages_dataframe'], license_numbers)

	new_df_dict['outgoing_transfer_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['outgoing_transfer_packages_dataframe'], license_numbers)

	new_df_dict['sales_receipts_dataframe'] = _filter_by_licenses(
		all_dfs_dict['sales_receipts_dataframe'], license_numbers)

	new_df_dict['sales_transactions_dataframe'] = _filter_by_licenses(
		all_dfs_dict['sales_transactions_dataframe'], license_numbers)

	new_df_dict['inventory_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['inventory_packages_dataframe'], license_numbers)

	new_df_dict['inactive_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['inactive_packages_dataframe'], license_numbers)

	new_df_dict['missing_incoming_pkg_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['missing_incoming_pkg_packages_dataframe'], license_numbers)

	new_df_dict['parent_packages_dataframe'] = _filter_by_licenses(
		all_dfs_dict['parent_packages_dataframe'], license_numbers)

	return new_df_dict

def get_inventory_dates(all_df_dict: AllDataframesDict, today_date: datetime.date) -> List[str]:
	TODAY_DATE = today_date.strftime('%Y-%m-%d')

	company_incoming_transfer_packages_dataframe = all_df_dict['incoming_transfer_packages_dataframe']
	company_sales_receipts_dataframe = all_df_dict['sales_receipts_dataframe']

	company_incoming_transfer_packages_dataframe['created_month'] = pd.to_datetime(company_incoming_transfer_packages_dataframe['created_date']).dt.strftime('%Y-%m')
	unique_incoming_transfer_package_months = company_incoming_transfer_packages_dataframe['created_month'].unique()
	company_sales_receipts_dataframe['sales_month'] = pd.to_datetime(company_sales_receipts_dataframe['sales_datetime']).dt.strftime('%Y-%m')
	unique_company_sales_receipt_months = company_sales_receipts_dataframe['sales_month'].unique()
	aggregate_unique_months = []
	for month in unique_incoming_transfer_package_months:
			if month not in aggregate_unique_months:
					aggregate_unique_months.append(month)
	for month in unique_company_sales_receipt_months:
			if month not in aggregate_unique_months:
					aggregate_unique_months.append(month)
	aggregate_unique_months.sort()

	unique_inventory_dates = []
	for month in aggregate_unique_months:
			date_object = datetime.datetime.strptime(month, '%Y-%m')
			date_object = date_object.replace(day = calendar.monthrange(date_object.year, date_object.month)[1])
			eom_date_str = datetime.datetime.strftime(date_object, '%Y-%m-%d')
			if eom_date_str < TODAY_DATE:
					unique_inventory_dates.append(eom_date_str)

	unique_inventory_dates.append(TODAY_DATE)
	unique_inventory_dates = [datetime.datetime.strftime(datetime.datetime.strptime(unique_inventory_date, '%Y-%m-%d'), '%m/%d/%Y') for unique_inventory_date in unique_inventory_dates]

	return unique_inventory_dates
