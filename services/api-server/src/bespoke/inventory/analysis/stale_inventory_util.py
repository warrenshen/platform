import datetime
import pandas
import logging

from datetime import date
from typing import List, Dict
from bespoke.inventory.analysis.shared.metrc_constants import PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY
from bespoke.inventory.analysis.shared.download_util import Download
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisContext,
	AnalysisParamsDict,
	InventoryPackageDict
)
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date
)

DEFAULT_MASTER_PRODUCT_CATEGORY_TO_SHELF_LIFE = {
	"Flower": 6,
	"Trim": 6,
	"Fresh Frozen": 0,
	"Edibles": 6,
	"Wax": 12,
	"Resin": 12,
	"Tinctures": 12,
	"Vapes": 12,
	"Shatter": 12,
	"Concentrates": 12,
	"Rosin": 12,
	"Beverages": None,
	"unknown": 12
}

def get_master_product_category(metrc_product_category_name: str) -> str:
	return PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY.get(metrc_product_category_name, "unknown")

def _get_product_category_to_shelf_life(params: AnalysisParamsDict) -> Dict[str, int]:
	if not params.get('stale_inventory_params'):
		return DEFAULT_MASTER_PRODUCT_CATEGORY_TO_SHELF_LIFE

	if not params['stale_inventory_params'].get('product_category_to_shelf_life'):
		return DEFAULT_MASTER_PRODUCT_CATEGORY_TO_SHELF_LIFE

	return params['stale_inventory_params']['product_category_to_shelf_life']

def get_shelf_life_in_months(metrc_product_category_name: str, params: AnalysisParamsDict) -> int:
	master_product_category = PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY.get(metrc_product_category_name)
	if not master_product_category:
			logging.info('Unknown shelf life for product category {}'.format(metrc_product_category_name))
			return None

	master_product_category_to_shelf_life = _get_product_category_to_shelf_life(params)

	return master_product_category_to_shelf_life[
			master_product_category
	]

def is_packaged_date_stale(packaged_date: datetime.date, shelf_life_in_months: int) -> bool:
	if shelf_life_in_months == 0:
		return False
	
	if shelf_life_in_months == None:
		return None
	
	today = pandas.Timestamp.today()
	months_difference = (today.year - packaged_date.year) * 12 + (today.month - packaged_date.month)
	return shelf_life_in_months < months_difference

def is_package_stale(active_inventory_package_record: InventoryPackageDict, params: AnalysisParamsDict) -> bool:
	product_category_name = active_inventory_package_record['product_category_name']
	packaged_date = active_inventory_package_record['packaged_date']

	master_product_category = get_master_product_category(product_category_name)
	shelf_life_in_months = get_shelf_life_in_months(product_category_name, params)
	return is_packaged_date_stale(parse_to_date(packaged_date), shelf_life_in_months)
		
def _write_products_by_profit(d: Download, ctx: AnalysisContext) -> None:

	lines = []

	# Note: we filter OUT incoming transfers if any of the following are true:
	# 1. Package shipment package state is NOT Accepted.
	# 2. Product name contains "Trade" or "Sample" in it. NOT IMPLEMENTED YET
	# 3. Package wholesale shipper price is $0.01 AND shipped quantity is 1.
	incoming_transfer_packages_dataframe = d.incoming_transfer_packages_dataframe[
			d.incoming_transfer_packages_dataframe['shipment_package_state'] == 'Accepted'
	][
			(d.incoming_transfer_packages_dataframe['shipper_wholesale_price'] != 0.01) | (d.incoming_transfer_packages_dataframe['shipped_quantity'] != 1)
	]
	lines.append(f'# filtered incoming transfer packages: {len(incoming_transfer_packages_dataframe)}')

	# Note: we filter OUT sales transactions if any of the following are true:
	# 1. Sales price is $0.01.
	sales_transactions_dataframe = d.sales_transactions_dataframe[
			d.sales_transactions_dataframe['tx_total_price'] != 0.01
	]
	#if filter_by_sales_year is not None:
	#		sales_transactions_dataframe = sales_transactions_dataframe[
	#				filter_by_sales_year
	#		]
	lines.append(f'# filtered sales transactions: {len(sales_transactions_dataframe)}')

	sales_transaction_with_incoming_transfer_packages_dataframe = sales_transactions_dataframe.join(
		incoming_transfer_packages_dataframe.set_index('package_id'), 
		how='inner', lsuffix='_l', rsuffix='_r')
	lines.append(f'# sales transactions with associated incoming transfer package: {len(sales_transaction_with_incoming_transfer_packages_dataframe.index)} ({len(sales_transaction_with_incoming_transfer_packages_dataframe.index) / len(sales_transactions_dataframe.index) * 100}%)')

	# Graph 1
	sales_transaction_with_incoming_transfer_packages_dataframe = sales_transaction_with_incoming_transfer_packages_dataframe[[
	#     'manifest_number',
			'package_id',
			'package_label',
			'created_month',
			'created_date',
			#'shipper_facility',
			'shipper_facility_license_number',
			'shipper_facility_name',
			'shipper_wholesale_price',
			'shipped_quantity',
			#'sales_month',
			#'sales_date',
			'sales_datetime',
			'tx_product_name',
			'tx_product_category_name',
			'tx_unit_of_measure',
			'tx_quantity_sold',
			'tx_total_price',
	]]

	top_50_products_by_gmv_dataframe = sales_transactions_dataframe.groupby(['tx_product_category_name', 'tx_product_name'])['tx_total_price'].sum().sort_values(ascending=False).head(50)
	#top_50_products_by_gmv_dataframe.plot(figsize=(16, 8), kind='bar')

	xlsx_file_name = ctx.get_output_path('reports/top_50_products_by_gmv.xlsx')
	top_50_products_by_gmv_dataframe.to_excel(xlsx_file_name)

	# Graph 2

	sales_transaction_with_incoming_transfer_package_records = sales_transaction_with_incoming_transfer_packages_dataframe.to_dict('records')

	sales_transaction_with_margins = []

	for sales_transaction_with_incoming_transfer_package_record in sales_transaction_with_incoming_transfer_package_records:
		product_category_name = sales_transaction_with_incoming_transfer_package_record['tx_product_category_name']
		product_name = sales_transaction_with_incoming_transfer_package_record['tx_product_name']
		
		shipped_quantity = sales_transaction_with_incoming_transfer_package_record['shipped_quantity']
		shipper_wholesale_price = sales_transaction_with_incoming_transfer_package_record['shipper_wholesale_price']
		per_unit_cost = shipper_wholesale_price / shipped_quantity
		
		sold_quantity = sales_transaction_with_incoming_transfer_package_record['tx_quantity_sold']
		sold_price = sales_transaction_with_incoming_transfer_package_record['tx_total_price']
		per_unit_price = sold_price / sold_quantity

		per_unit_margin = (per_unit_price - per_unit_cost)
		sales_transaction_profit = per_unit_margin * sold_quantity

		sales_transaction_with_margins += [(
				product_category_name,
				product_name,
				sales_transaction_profit
		)]

	sales_transaction_with_margins_dataframe = pandas.DataFrame(
			sales_transaction_with_margins,
			columns=[
					'product_category_name',
					'product_name',
					'sales_transaction_profit',
			],
	)

	top_50_products_by_profit_dataframe = sales_transaction_with_margins_dataframe.groupby(
		['product_category_name', 'product_name']
	)['sales_transaction_profit'].sum().sort_values(ascending=False).head(50)
	#top_50_products_by_profit_dataframe.plot(figsize=(16, 8), kind='bar')

	xlsx_file_name = ctx.get_output_path('reports/top_50_products_by_profit.xlsx')
	top_50_products_by_profit_dataframe.reset_index().to_excel(xlsx_file_name)

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))

	print('\n'.join(lines))


def compute_stale_inventory(
	d: Download,
	ctx: AnalysisContext,
	params: AnalysisParamsDict) -> None:
	stale_count = 0
	unknown_count = 0
	total_count = 0

	stale_quantity = 0.0
	unknown_quantity = 0.0
	total_quantity = 0.0

	categorized_active_inventory_package_records = []
	active_inventory_package_records = d.inventory_packages_records
	LOG_EVERY = 10
	n_every = 0

	for active_inventory_package_record in active_inventory_package_records:
		package_type = active_inventory_package_record['package_type']
		product_category_name = active_inventory_package_record['product_category_name']
		packaged_date = active_inventory_package_record['packaged_date']
		quantity = active_inventory_package_record['quantity']
		
		if package_type != 'Product':
			print('Got an unexpected package type', package_type, product_category_name, quantity)
			continue
		elif quantity < 0 and (n_every % 10) == 0:
			n_every += 1
			print('Got an invalid quantity', package_type, product_category_name, quantity)
			continue

		is_stale = is_package_stale(active_inventory_package_record, params)

		if is_stale:
			stale_count += 1
			stale_quantity += quantity
			active_inventory_package_record['category'] = 'stale'
		elif is_stale == None:
			unknown_count += 1
			unknown_quantity += quantity
			active_inventory_package_record['category'] = 'unknown'
		else:
			active_inventory_package_record['category'] = 'fresh'

		total_count += 1
		total_quantity += quantity
		
		master_product_category = get_master_product_category(product_category_name)
		active_inventory_package_record['master_product_category'] = master_product_category
		active_inventory_package_record['last_modified_at_notz'] = active_inventory_package_record['last_modified_at'].replace(tzinfo=None)
		categorized_active_inventory_package_records += [active_inventory_package_record]

	fresh_count = total_count - stale_count - unknown_count
	fresh_quantity = total_quantity - stale_quantity - unknown_quantity

	categorized_active_inventory_packages_dataframe = pandas.DataFrame(
		categorized_active_inventory_package_records,
		columns=[
			'identifier',
			'license_number',
			'last_modified_at_notz',
			'package_id',
			'package_label',
			'type',
			'packaged_date',
			'package_type',
			'product_name',
			'product_category_name',
			'quantity',
			'unit_of_measure',
			'category',
			'master_product_category',
		],
	)

	xlsx_file_name = ctx.get_output_path('reports/stale_categorized_active_inventory_packages.xlsx')
	categorized_active_inventory_packages_dataframe.to_excel(xlsx_file_name)

	lines = []
	lines.append(f'')
	lines.append(f'# packages stale: {round(stale_count, 2)} ({round(stale_count / total_count * 100, 2)}%)')
	lines.append(f'# packages unknown: {round(unknown_count, 2)} ({round(unknown_count / total_count * 100, 2)}%)')
	lines.append(f'# packages fresh: {round(fresh_count, 2)} ({round(fresh_count / total_count * 100, 2)}%)')
	lines.append(f'# packages total: {round(total_count, 2)}')
	lines.append(f'')
	lines.append(f'# units stale: {round(stale_quantity, 2)} ({round(stale_quantity / total_quantity * 100, 2)}%)')
	lines.append(f'# units unknown: {round(unknown_quantity, 2)} ({round(unknown_quantity / total_quantity * 100, 2)}%)')
	lines.append(f'# units fresh: {round(fresh_quantity, 2)} ({round(fresh_quantity / total_quantity * 100, 2)}%)')
	lines.append(f'# units total: {round(total_quantity, 2)}')

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))

	print('\n'.join(lines))

	_write_products_by_profit(d, ctx)
