import datetime
import pytz
import pandas as pd
from typing import List, Any, Dict, Iterable

from bespoke.inventory.analysis.shared import download_util 
from bespoke.inventory.analysis import active_inventory_util as util


TRANSFER_PACKAGE_COLS = [
	'package_id', 
	'license_number', 
	'product_name',
	'product_category_name',
	'received_unit_of_measure',
	'receiver_wholesale_price',
	'received_quantity',
	'shipped_quantity', 
	'shipped_unit_of_measure',
	'shipper_wholesale_price',
	'shipment_package_state',
	'delivery_type', 
	'created_date',
	'received_datetime', 
	'source_harvest_names'
]

SALES_TX_COLS = [
	'sales_datetime',
	'tx_package_id',
	'receipt_number',
	'tx_quantity_sold',
	'tx_total_price',
	'tx_unit_of_measure'
]

SALES_RECEIPTS_COLS = [
	'package_id'
]

PACKAGE_COLS = [
	'package_id',
	'license_number',
	'type',
	'quantity',
	'item_product_category_type',
	'item_id',
	'source_production_batch_numbers',
	'product_name',
	'product_category_name',
	'unit_of_measure',
	'production_batch_number',
	'source_harvest_names',
	'archived_date',
	'finished_date'
]

def inventory_pkg(
	id: int,
	package_type: str,
	quantity: float,
	product_name: str = '',
	product_category_name: str = '',
	unit_of_measure: str = '',
	finished_date: str = '',
	source_production_batch_numbers: str = '',
	production_batch_number: str = '',
	source_harvest_names: str = '',
	item_id: str = None,
	item_product_category_type: str = None
) -> Dict:

	if not item_id:
		item_id = f'item-{id}'

	if not item_product_category_type:
		item_product_category_type = f'item-product-category-{id}'

	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'type': package_type,
		'quantity': quantity,
		'item_product_category_type': item_product_category_type,
		'item_id': item_id,
		'product_name': product_name,
		'product_category_name': product_category_name,
		'unit_of_measure': unit_of_measure,
		'source_production_batch_numbers': source_production_batch_numbers,
		'production_batch_number': production_batch_number,
		'source_harvest_names': source_harvest_names,
		'archived_date': '',
		'finished_date': finished_date
	}

def transfer_pkg(
		id: int,
		delivery_type: str,
		received_datetime: datetime.datetime,
		quantity: float = 0.0,
		wholesale_price: float = 0.0,
		product_category_name: str = '',
		received_unit_of_measure: str = 'grams',
		source_harvest_names: str = ''
	) -> Dict:

	if not product_category_name:
		product_category_name = f'categoryname-{id}'

	return {
		'package_id': f'p{id}',
		'license_number': 'abcd',
		'product_category_name': product_category_name,
		'product_name': f'productname-{id}',
		'received_unit_of_measure': received_unit_of_measure,
		'shipped_unit_of_measure': received_unit_of_measure,
		'received_quantity': quantity,
		'receiver_wholesale_price': wholesale_price,
		'shipped_quantity': 0.0,
		'shipper_wholesale_price': 0.0,
		'shipment_package_state': 'Accepted',
		'delivery_type': delivery_type,
		'created_date': received_datetime.date(),
		'received_datetime': received_datetime,
		'source_harvest_names': source_harvest_names
	}

def get_default_params() -> util.AnalysisParamsDict:
	return util.AnalysisParamsDict(
		sold_threshold=1.0,
		find_parent_child_relationships=True,
		use_prices_to_fill_missing_incoming=False,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None,
		stale_inventory_params=None
	)

def dict_to_array(input_dict: Dict[str, Any], columns: List[str]) -> List:
	array_row = []
	for col in columns:
		array_row.append(input_dict[col])
	return array_row

def get_dataframe(input_dict_rows: List[Dict], columns: List[str]) -> pd.DataFrame:
	array_rows = []

	for input_dict_row in input_dict_rows:
		array_rows.append(dict_to_array(input_dict_row, columns))

	return pd.DataFrame(array_rows, columns=columns)

class FakeSQLHelper(download_util.SQLHelper):

	def __init__(self, packages_df: pd.DataFrame) -> None:
		self._packages_df = packages_df

	def get_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		new_df_rows = []
		for index, row in self._packages_df.iterrows():
			if row['package_id'] in package_ids:
				new_df_rows.append(row)

		return pd.DataFrame(new_df_rows, columns=PACKAGE_COLS)

	def _get_active_packages(self) -> pd.DataFrame:
		return self._packages_df[self._packages_df['type'] != 'inactive']

	def get_inactive_packages(self, package_ids: Iterable[str]) -> pd.DataFrame:
		all_matching_packages_df = self.get_packages(package_ids)
		return all_matching_packages_df[all_matching_packages_df['type'] == 'inactive']

	def get_packages_by_production_batch_numbers(self, production_batch_numbers: Iterable[str]) -> pd.DataFrame:
		new_df_rows = []
		for index, row in self._packages_df.iterrows():
			if row['production_batch_number'] in production_batch_numbers:
				new_df_rows.append(row)

		return pd.DataFrame(new_df_rows, columns=PACKAGE_COLS)

def create_download(test: Dict) -> util.Download:
	dl = util.Download()

	for tx in test['sales_transactions']:
		tx['sales_datetime'] = tx['sales_datetime'].replace(tzinfo=pytz.UTC)

	inventory_df = get_dataframe(test['inventory_packages'], columns=PACKAGE_COLS)
	sql_helper = FakeSQLHelper(inventory_df)

	all_dataframes_dict = download_util.AllDataframesDict(
		incoming_transfer_packages_dataframe=get_dataframe(
			test['incoming_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		outgoing_transfer_packages_dataframe=get_dataframe(
			test['outgoing_transfer_packages'], columns=TRANSFER_PACKAGE_COLS),
		sales_receipts_dataframe=get_dataframe(
			test['sales_receipts'], columns=SALES_RECEIPTS_COLS),
		sales_transactions_dataframe=get_dataframe(
			test['sales_transactions'], columns=SALES_TX_COLS),
		inventory_packages_dataframe=sql_helper._get_active_packages(),
		inactive_packages_dataframe=None,
		missing_incoming_pkg_packages_dataframe=None,
		parent_packages_dataframe=None
	)

	download_util._fetch_inactive_and_package_info_for_dataframes(all_dataframes_dict, sql_helper)

	dl.process_dataframes(
		all_dataframes_dict=all_dataframes_dict,
		ctx=test['ctx']
	)
	return dl
