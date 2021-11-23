import datetime
import pandas
import logging

from datetime import date
from typing import List
from bespoke.inventory.analysis.shared.metrc_constants import PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY

from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisContext,
	InventoryPackageDict
)
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date
)

master_product_category_to_shelf_life = {
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
}

def get_master_product_category(metrc_product_category_name: str) -> str:
	return PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY.get(metrc_product_category_name, "unknown")

def get_shelf_life_in_months(metrc_product_category_name: str) -> int:
	master_product_category = PRODUCT_CATEGORY_NAME_TO_PRODUCT_CATEGORY.get(metrc_product_category_name)
	if not master_product_category:
			logging.info('Unknown shelf life for product category {}'.format(metrc_product_category_name))
			return None

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
		
def compute_stale_inventory(
	ctx: AnalysisContext,
	active_inventory_package_records: List[InventoryPackageDict]) -> None:
	stale_count = 0
	unknown_count = 0
	total_count = 0

	stale_quantity = 0.0
	unknown_quantity = 0.0
	total_quantity = 0.0

	categorized_active_inventory_package_records = []

	for active_inventory_package_record in active_inventory_package_records:
		package_type = active_inventory_package_record['package_type']
		product_category_name = active_inventory_package_record['product_category_name']
		packaged_date = active_inventory_package_record['packaged_date']
		quantity = active_inventory_package_record['quantity']
		
		if package_type != 'Product':
			print('Got an unexpected package type', package_type, product_category_name, quantity)
			continue
		elif quantity <= 0:
			print('Got an invalid quantity', package_type, product_category_name, quantity)
			continue

		master_product_category = get_master_product_category(product_category_name)
		shelf_life_in_months = get_shelf_life_in_months(product_category_name)
		is_stale = is_packaged_date_stale(parse_to_date(packaged_date), shelf_life_in_months)
		
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
		
		active_inventory_package_record['master_product_category'] = master_product_category
		categorized_active_inventory_package_records += [active_inventory_package_record]

	fresh_count = total_count - stale_count - unknown_count
	fresh_quantity = total_quantity - stale_quantity - unknown_quantity

	categorized_active_inventory_packages_dataframe = pandas.DataFrame(
		categorized_active_inventory_package_records,
		columns=[
			'identifier',
			'license_number',
			'last_modified_at',
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

	lines = []
	lines.append(f'')
	lines.append(f'# packages stale: {stale_count} ({stale_count / total_count * 100}%)')
	lines.append(f'# packages unknown: {unknown_count} ({unknown_count / total_count * 100}%)')
	lines.append(f'# packages fresh: {fresh_count} ({fresh_count / total_count * 100}%)')
	lines.append(f'# packages total: {total_count}')
	lines.append(f'')
	lines.append(f'# units stale: {stale_quantity} ({stale_quantity / total_quantity * 100}%)')
	lines.append(f'# units unknown: {unknown_quantity} ({unknown_quantity / total_quantity * 100}%)')
	lines.append(f'# units fresh: {fresh_quantity} ({fresh_quantity / total_quantity * 100}%)')
	lines.append(f'# units total: {total_quantity}')

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))
