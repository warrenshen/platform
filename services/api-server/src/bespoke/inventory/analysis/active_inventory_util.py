import datetime
import logging
import math
import time
import pandas
import xlwt

from pathlib import Path
from typing import Dict, List, Tuple, Set, cast
from collections import OrderedDict
from mypy_extensions import TypedDict

from bespoke.date import date_util
from bespoke.db.db_constants import DeliveryType
from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue

from bespoke.inventory.analysis.shared.package_history import PackageHistory
from bespoke.inventory.analysis.shared import parent_or_price_matching as parent_util
from bespoke.inventory.analysis.shared.download_util import Download
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date, date_to_str, is_number, is_not_number, val_if_not_num
)
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisContext,
	Printer,
	Query,
	PrintCountsDict,
	ComputeInventoryDict,
	CountsAnalysisDict,
	CompareInventoryResultsDict,
	InventoryPackageDict,
	TransferPackageDict,
	AnalysisParamsDict,
	PricingDataConfigDict
)
from bespoke.inventory.analysis import stale_inventory_util
from bespoke.inventory.analysis import inventory_valuations_util as valuations_util

CompareOptionsDict = TypedDict('CompareOptionsDict', {
	'num_errors_to_show': int,
	'accept_computed_when_sold_out': bool
})

def get_inventory_column_names() -> List[str]:
	return [
		'package_id',
		'license_number',
		'arrived_date',
		'incoming_cost',
		'incoming_quantity',
		'uses_parenting_logic',
		'are_prices_inferred',

		'product_category_name',
		'product_name',

		'quantity',
		'unit_of_measure',
		'current_value',
		'sold_date',
		
		'is_in_inventory' # NOTE: this column must come last
	]

def _get_incoming_pkg_for_date(incomings: List[TransferPackageDict], inventory_date: datetime.date) -> TransferPackageDict:
	if not incomings:
		return None

	incomings.sort(key=lambda x: x['received_datetime'])

	for incoming_pkg in incomings:
		if incoming_pkg['shipment_package_state'] == 'Returned':
			continue

		if not incoming_pkg['received_date']:
			continue

		if incoming_pkg['received_date'] >= inventory_date:
			# Find the first incoming package that was received after this inventory date
			return incoming_pkg

	return None

def _get_inventory_output_row(history: 'PackageHistory', inventory_date: datetime.date, is_in_inventory: bool) -> List[CellValue]:
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

	current_value = 0.0
	if incoming_pkg['quantity']:
		current_value = incoming_pkg['price'] / incoming_pkg['quantity'] * cur_quantity 

	return [
		history.package_id,
		incoming_pkg['license_number'],
		date_to_str(incoming_pkg['received_date']),
		round(incoming_pkg['price'], 2),
		round(incoming_pkg['quantity'], 2),
		'{}'.format(history.uses_parenting_logic),
		'{}'.format(history.are_prices_inferred),

		incoming_pkg['product_category_name'],
		incoming_pkg['product_name'],

		cur_quantity if cur_quantity != -1 else 0,
		incoming_pkg['unit_of_measure'] or '',
		round(current_value, 2),
		date_to_str(sold_date) if sold_date else '',
		'true' if is_in_inventory else ''
	]

def _get_inventory_output_row_for_actual_inventory(
	history: 'PackageHistory', 
	inventory_date: datetime.date,
	inventory_pkg: InventoryPackageDict) -> List[CellValue]:
	incoming_pkg = _get_incoming_pkg_for_date(history.incomings, inventory_date)
	sold_date = history.computed_info.get('sold', {}).get('date')
	
	if not incoming_pkg and history.incomings:
		# If we dont have an incoming package, use the latest one just so
		# we can show the caller some details about this package.
		#
		# The inventory will end up being 0
		incoming_pkg = history.incomings[-1]	

	cur_quantity = inventory_pkg['quantity']
	current_value = 0.0
	if incoming_pkg and is_number(incoming_pkg['quantity']) and incoming_pkg['quantity'] > 0 and is_number(incoming_pkg['price']):
		current_value = incoming_pkg['price'] / incoming_pkg['quantity'] * cur_quantity

	pkg = inventory_pkg
	
	return [
		history.package_id,
		incoming_pkg['license_number'] if incoming_pkg else pkg['license_number'],
		date_to_str(incoming_pkg['received_date']) if incoming_pkg else date_to_str(
			parse_to_date(pkg['packaged_date'])),
		round(val_if_not_num(incoming_pkg['price'], 0.0), 2) if incoming_pkg else 0.0,
		round(val_if_not_num(incoming_pkg['quantity'], 0.0), 2) if incoming_pkg else 0.0,
		'{}'.format(history.uses_parenting_logic),
		'{}'.format(history.are_prices_inferred),

		incoming_pkg['product_category_name'] if incoming_pkg else pkg['product_category_name'],
		incoming_pkg['product_name'] if incoming_pkg else pkg['product_name'],

		cur_quantity if cur_quantity != -1 else 0,
		incoming_pkg['unit_of_measure'] or '' if incoming_pkg else pkg['unit_of_measure'],
		round(current_value, 2),
		date_to_str(sold_date) if sold_date else '',
		'true'
	]

def _to_dataframes_for_matching(d: Download) -> parent_util.DataframesForMatchingDict:
	return parent_util.DataframesForMatchingDict(
		parent_packages_records=d.parent_packages_records,
		missing_incoming_pkg_package_records=d.missing_incoming_pkg_package_records,
		child_to_parent_package_id_override=d.child_to_parent_package_id_override
	)

def _is_internal_transfer(transfer_pkg: TransferPackageDict) -> bool:
	return transfer_pkg['delivery_type'] in set([
		DeliveryType.INCOMING_INTERNAL,
		DeliveryType.OUTGOING_INTERNAL
	])

def get_histories(d: Download, params: AnalysisParamsDict) -> Dict[str, PackageHistory]:
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
	parent_resp = parent_util.match_child_packages_to_parents(
		_to_dataframes_for_matching(d), package_id_to_history, params)

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
		child_history.uses_parenting_logic = parent_info['uses_parenting_logic']
		child_history.are_prices_inferred = parent_info['is_synthetic']

	return package_id_to_history

def run_orphan_analysis(d: Download, ctx: AnalysisContext, package_id_to_history: Dict[str, PackageHistory], params: AnalysisParamsDict) -> None:
	# Child to parent package_id
	resp = parent_util.match_child_packages_to_parents(_to_dataframes_for_matching(d), package_id_to_history, params)

	lines = []
	lines.append('{} - Number of parent packages'.format(len(d.parent_packages_records)))
	lines.append('')
	lines.append('{} - Child packages with parents'.format(len(resp['child_to_parent_details'].keys())))
	lines.append('{} - orphans; child packages with (no source product batch num)'.format(resp['num_orphans']))
	lines.append('{} - no matching parent; child packages that have a source batch number, but no parent'.format(resp['has_number_but_no_parent']))

	print('\n'.join(lines))

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))

def analyze_specific_package_histories(
	d: Download,
	package_ids: List[str],
	params: AnalysisParamsDict) -> None:

	package_id_to_history = get_histories(d, params)
	package_ids_set = set(package_ids)
	p = Printer(verbose=True, show_info=True) 

	for package_id in package_ids:
		print(f'DEBUGGING PACKAGE_ID={package_id}')
		history = package_id_to_history.get(package_id)
		if not history:
			print('No PackageHistory for {}'.format(package_id))
			return

		if history.active_inventory_pkg:
			print('Matching active metrc_package:')
			print(history.active_inventory_pkg)
			print('')
		elif history.inactive_pkg:
			print('Matching inactive metrc_package:')
			print(history.inactive_pkg)
			print('')
		else:
			print('! Missing in metrc_packages, both inactive and active')

		if package_id not in package_id_to_history:
			print(f'! Package ID {package_id} not in computed')
		else:
			history = package_id_to_history[package_id]
			history.compute_additional_fields(
				p=p, params=params, run_filter=True, skip_over_errors=True)

			if not history.incomings:
				print('CHILD TO PARENT MATCHING ANALYSIS')
				# Lets see why we cant find the parent of this package
				parent_util.match_child_packages_to_parents(
					_to_dataframes_for_matching(d), package_id_to_history, params, debug_package_id=history.package_id)

		print('')

def print_counts(ctx: AnalysisContext, id_to_history: Dict[str, PackageHistory], should_print: bool = True) -> PrintCountsDict:
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
	num_incoming_missing_price = 0
	num_incoming_pkgs = 0

	for package_id, history in id_to_history.items():

		if history.outgoings and not history.incomings:
			only_outgoing += 1

		if history.incomings and not history.outgoings and not history.sales_txs:
			only_incoming += 1

		if history.incomings:
			num_incoming_pkgs += 1
			if is_not_number(history.incomings[-1]['price']) or math.isclose(history.incomings[-1]['price'], 0.0):
				num_incoming_missing_price += 1

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

		if history.uses_parenting_logic:
			num_child_packages += 1

		total_seen += 1

	lines = []
	lines.append(f'Only outgoing: {only_outgoing}')
	lines.append(f'Only incoming: {only_incoming}')	
	lines.append('Sold packages missing incoming_pkg: {} ({:.2f}% of packages)'.format(
				only_sold, only_sold / total_seen * 100))
	lines.append('Incoming packages missing price {} ({:.2f}% of incoming packages)'.format(
				num_incoming_missing_price, num_incoming_missing_price / num_incoming_pkgs * 100
	))
	lines.append(f'In and out: {outgoing_and_incoming}')
	lines.append(f'In and sold at least once {in_and_sold_at_least_once}')
	lines.append(f'In and sold many times {in_and_sold_many_times}')
	lines.append('')
	lines.append(f' Num parent packages: {num_parent_packages}')
	lines.append(f' num matched child packages: {num_child_packages}')

	lines.append(f'Total pkgs: {total_seen}')

	if should_print:
		print('\n'.join(lines))

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))

	return PrintCountsDict(
		only_outgoing=only_outgoing,
		only_incoming=only_incoming,
		only_sold=only_sold,
		outgoing_and_incoming=outgoing_and_incoming,
		incoming_missing_prices=num_incoming_missing_price,
		in_and_sold_at_least_once=in_and_sold_at_least_once,
		in_and_sold_many_times=in_and_sold_many_times,
		num_parent_packages=num_parent_packages,
		num_child_packages=num_child_packages,
		total_seen=total_seen
	)



### CREATE AND COMPARE INVENTORY

def compare_inventory_dataframes(
	ctx: AnalysisContext, 
	computed: pandas.DataFrame, 
	actual: pandas.DataFrame, 
	params: AnalysisParamsDict,
	options: CompareOptionsDict,
	today: datetime.date) -> CompareInventoryResultsDict:
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
	quantities = [] # Only includes quantities for matching packages
	total_quantity_all_inventory_packages = 0.0
	delta_quantities = []
	delta_tuples = []
	num_matching_packages = 0
	num_packages = 0
	current_inventory_value = 0.0
	current_nonstale_inventory_value = 0.0
	num_stale_packages = 0

	for index, row in actual.iterrows():
		all_actual_package_ids_even_seen.add(row['package_id'])

		if float(row['quantity']) < 0.0 or math.isclose(float(row['quantity']), 0.0):
			# Packages with no quantity do not need to be considered, since they
			# should be filtered in the computed packages
			continue

		num_packages += 1
		package_id_to_actual_row[row['package_id']] = row
		total_quantity_all_inventory_packages += row['quantity']

		if row['package_id'] not in package_id_to_computed_row:
			if options['accept_computed_when_sold_out'] and row['package_id'] in all_computed_package_ids_ever_seen:
				if row['package_id'] in unseen_package_ids:
					unseen_package_ids.remove(row['package_id'])

				# When this flag is turned on, we trust that the computed calculation, because
				# we have seen the package before, we just saw that it sold out due to
				# sales transactions.
				num_matching_packages += 1
				delta_quantities.append(0.0)
				delta_tuples.append((row['package_id'], 0.0))
				quantities.append(0)
			else:
				# We completely missed the package
				computed_missing_package_ids.add(row['package_id'])
				# Was this ever computed but just not in the current inventory though?
				if row['package_id'] in all_computed_package_ids_ever_seen:
					computed_missing_package_ids_but_seen_before.add(row['package_id'])
		else:
			computed_row = package_id_to_computed_row[row['package_id']]
			unseen_package_ids.remove(row['package_id'])
			num_matching_packages += 1
			
			is_stale = stale_inventory_util.is_package_stale(row, params, today)

			# Only the computed row as the current value associated with the actual package
			# by using pricing data associated with the computed row 
			if computed_row['incoming_quantity'] > 0.0 and computed_row['incoming_cost'] > 0.0:
				cur_pkg_value = computed_row['incoming_cost'] / computed_row['incoming_quantity'] * row['quantity']
				current_inventory_value += cur_pkg_value
				if is_stale:
					num_stale_packages += 1
				else:
					current_nonstale_inventory_value += cur_pkg_value

			if options['accept_computed_when_sold_out'] and math.isclose(computed_row['quantity'], 0.0):
				# When this flag is turned on, we trust that the computed calculation, because
				# we have seen the package before, we just saw that it sold out due to
				# sales transactions.
				delta_quantities.append(0.0)
				delta_tuples.append((row['package_id'], 0.0))
				quantities.append(0)
			else:
				abs_delta = abs(float(row['quantity']) - float(computed_row['quantity']))
				delta_quantities.append(abs_delta)
				delta_tuples.append((row['package_id'], abs_delta))
				quantities.append(row['quantity'])

	extra_quantity = 0.0
	unseen_package_ids_in_inventory_at_some_point = set([])

	for package_id in unseen_package_ids:
		extra_quantity += float(package_id_to_computed_row[package_id]['quantity'])
		if package_id in all_actual_package_ids_even_seen:
			unseen_package_ids_in_inventory_at_some_point.add(package_id)

	matching_quantity_delta = sum(delta_quantities) / len(delta_quantities)
	matching_quantity_avg = sum(quantities) / len(quantities)

	quantities_not_in_computed = []
	for package_id in computed_missing_package_ids_but_seen_before:
		quantities_not_in_computed.append(float(package_id_to_actual_row[package_id]['quantity']))

	if quantities_not_in_computed:
		quantity_not_computed_avg = sum(quantities_not_in_computed) / len(quantities_not_in_computed)
	else:
		quantity_not_computed_avg = 0.0

	pct_inventory_matching = num_matching_packages / num_packages * 100

	lines = []
	lines.append('')
	lines.append('')
	lines.append('Pct of # inventory matching: {:.2f}% ({} / {})'.format(
		pct_inventory_matching,
		num_matching_packages,
		num_packages
	))

	pct_accuracy_of_quantity = (matching_quantity_avg - matching_quantity_delta) / matching_quantity_avg * 100
	lines.append('Accuracy of quantities for matching packages: {:.2f}%'.format(pct_accuracy_of_quantity))
	
	pct_inventory_overestimate = len(unseen_package_ids) / num_packages * 100
	lines.append('Pct of # inventory packages over-estimated: {:.2f}%'.format(pct_inventory_overestimate))
	
	pct_quantity_overestimated = extra_quantity / total_quantity_all_inventory_packages
	lines.append('Pct of # quantity over-estimated: {:.2f}%'.format(pct_quantity_overestimated))
	lines.append('Avg quantity delta of matching packages: {:.2f}'.format(matching_quantity_delta))
	lines.append('Avg quantity of matching packages: {:.2f}'.format(matching_quantity_avg))
	lines.append('')
	lines.append('Num matching packages: {}'.format(num_matching_packages))

	computed_missing_but_seen_before_pct = 0.0
	if len(computed_missing_package_ids) != 0:
		computed_missing_but_seen_before_pct = len(computed_missing_package_ids_but_seen_before) / len(computed_missing_package_ids) * 100

	lines.append('Num actual packages not computed: {}'.format(len(computed_missing_package_ids)))
	lines.append('  but computed at some point: {}, e.g., {:.2f}% of non-computed packages'.format(
		len(computed_missing_package_ids_but_seen_before), computed_missing_but_seen_before_pct))
	lines.append('  avg quantity from actual packages {:.2f}'.format(quantity_not_computed_avg))

	lines.append('Num computed packages not in actual: {}'.format(len(unseen_package_ids)))
	lines.append('  but in actual inventory at some point: {}'.format(
		len(unseen_package_ids_in_inventory_at_some_point)))

	num_errors_to_show = options['num_errors_to_show']
	lines.append('')
	lines.append(f'Computed has these extra package IDs; first {num_errors_to_show}')
	i = 0
	unseen_quantity_tuples = []

	for package_id in unseen_package_ids:
		cur_row = package_id_to_computed_row[package_id]
		unseen_quantity_tuples.append((package_id, float(cur_row['quantity']), cur_row['unit_of_measure']))

	unseen_quantity_tuples.sort(key=lambda x: x[1], reverse=True) # sort quantity, largest to smallest

	for (package_id, quantity, unit_of_measure) in unseen_quantity_tuples:
		if i > num_errors_to_show:
			break

		lines.append(f'{package_id}: computed quantity {quantity} ({unit_of_measure})')

		i += 1

	lines.append('')
	lines.append(f'Computed is missing these package IDs; first {num_errors_to_show}')
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

		lines.append(f'{package_id}: actual quantity {quantity} ({unit_of_measure}) of {product_category_name}')
		computed_missing_actual_package_ids.append(package_id)
		i += 1

	lines.append('')
	lines.append(f'Largest delta in quantities; first {num_errors_to_show}')
	delta_tuples.sort(key=lambda x: x[1], reverse=True)

	i = 0
	for (package_id, delta) in delta_tuples:
		if i > num_errors_to_show:
			break

		lines.append('Delta {:.2f} for package_id {}'.format(delta, package_id))
		i += 1

	print('\n'.join(lines))

	with open(ctx.get_output_path('log.txt'), 'a+') as f:
		f.write('\n'.join(lines))

	return CompareInventoryResultsDict(
		computed_extra_package_ids=list(unseen_package_ids),
		computed_missing_actual_package_ids=computed_missing_actual_package_ids,
		pct_inventory_matching=round(pct_inventory_matching, 2),
		pct_accuracy_of_quantity=round(pct_accuracy_of_quantity, 2),
		pct_inventory_overestimate=round(pct_inventory_overestimate, 2),
		pct_quantity_overestimated=round(pct_quantity_overestimated, 2),
		current_inventory_value=round(current_inventory_value, 2),
		current_nonstale_inventory_value=round(current_nonstale_inventory_value, 2),
		pct_stale_packages=round(num_stale_packages / num_packages * 100, 2),
	)

def compare_computed_vs_actual_inventory(
	ctx: AnalysisContext,
	computed: pandas.DataFrame,
	actual: pandas.DataFrame,
	params: AnalysisParamsDict,
	compare_options: CompareOptionsDict,
	today: datetime.date) -> CompareInventoryResultsDict:
	from_packages_inventory_dataframe = actual[[
			'package_id',
			'packaged_date',
			'unit_of_measure',
			'product_category_name',
			'product_name',
			'quantity'
	]].sort_values('package_id')

	res = compare_inventory_dataframes(
			ctx=ctx,
			computed=computed,
			actual=from_packages_inventory_dataframe,
			params=params,
			options=compare_options,
			today=today
	)
	return res

def _write_current_inventory(
	q: Query,
	ctx: AnalysisContext,
	inventory_packages_records: List[InventoryPackageDict],
	id_to_history: Dict[str, PackageHistory]) -> None:

	# Write the current inventory in the same format we do the computed packages
	wb = excel_writer.WorkbookWriter(xlwt.Workbook())
	sheet = wb.add_sheet('Current inventory')
	first = True

	for inventory_pkg in inventory_packages_records:
		history = id_to_history.get(inventory_pkg['package_id'])
		if not history:
			logging.info(f'WARN: {inventory_pkg["package_id"]} does not have a history but is in the current inventory')
			continue

		if first:
			sheet.add_row(get_inventory_column_names())
			first = False

		row = _get_inventory_output_row_for_actual_inventory(
			history=history,
			inventory_date=parse_to_date(q.inventory_dates[-1]),
			inventory_pkg=inventory_pkg
		)
		sheet.add_row(row)

	filepath = ctx.get_output_path(f'reports/{q.company_name}_current_inventory.xls')
	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))


def create_inventory_dataframe_by_date(
	package_id_to_history: Dict[str, PackageHistory],
	date_str: str,
	params: AnalysisParamsDict
) -> List[List[CellValue]]:
	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1

	p = Printer(verbose=False, show_info=False)
	exclude_reason_to_package_ids: Dict[str, Set[str]] = OrderedDict()

	for package_id, history in package_id_to_history.items():
		history.compute_additional_fields(p=p, params=params, run_filter=True, skip_over_errors=False)
		num_total += 1
		if history.should_exclude:
			num_excluded += 1
			if history.exclude_reason not in exclude_reason_to_package_ids:
				exclude_reason_to_package_ids[history.exclude_reason] = set([])

			exclude_reason_to_package_ids[history.exclude_reason].add(history.package_id)

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
		package_record = _get_inventory_output_row(history, inventory_date, is_in_inventory)
		package_records += [package_record]

	return package_records

def create_inventory_xlsx(
	d: Download,
	ctx: AnalysisContext,
	id_to_history: Dict[str, PackageHistory], 
	q: Query, 
	params: AnalysisParamsDict,
	show_debug_package_ids: bool = False,
	using_nb: bool = False,
) -> ComputeInventoryDict:

	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1
	p = Printer(verbose=False, show_info=False)

	exclude_reason_to_package_ids: Dict[str, Set[str]] = OrderedDict()
	date_to_inventory_packages_dataframe = {}

	before = time.time()
	len_package_id_to_history = len(id_to_history)
	num_loops = len_package_id_to_history

	for package_id, history in id_to_history.items():
		history.compute_additional_fields(p=p, params=params, run_filter=True, skip_over_errors=False)
		num_total += 1
		if history.should_exclude:
			num_excluded += 1
			
			if history.exclude_reason not in exclude_reason_to_package_ids:
				exclude_reason_to_package_ids[history.exclude_reason] = set([])

			exclude_reason_to_package_ids[history.exclude_reason].add(history.package_id)

		if max_to_see > 0 and i >= max_to_see:
			# NOTE: remove this break, using this so I can debug 1 package
			# at a time
			break
				
		i += 1

	after = time.time()
	ctx.log_timing(f'  Took {round(after - before, 2)} seconds for computing additional fields. num_loops={num_loops}')

	before = time.time()

	wb = excel_writer.WorkbookWriter(xlwt.Workbook())
	num_loops = 0
	inventory_valuations = []
	fresh_inventory_valuations = []

	for inventory_date_str in q.inventory_dates:
		num_loops += len_package_id_to_history
		# Compute the packages which are in the inventory at this particular date
		computed_inventory_package_records = create_inventory_dataframe_by_date(
				id_to_history, inventory_date_str, params=params)    
		computed_inventory_packages_dataframe = pandas.DataFrame(
				computed_inventory_package_records,
				columns=get_inventory_column_names()
		)
		date_to_inventory_packages_dataframe[inventory_date_str] = computed_inventory_packages_dataframe
		valuation_res = valuations_util.get_total_valuation_for_date(
				computed_inventory_packages_dataframe=computed_inventory_packages_dataframe,
				company_incoming_transfer_packages_dataframe=d.incoming_transfer_packages_dataframe,
				inventory_date=inventory_date_str,
				params=params,
				today=date_util.load_date_str(inventory_date_str),
				using_nb=using_nb
		)
		inventory_valuations.append(valuation_res['total_valuation'])
		fresh_inventory_valuations.append(valuation_res['total_fresh_valuation'])

		inventory_date = parse_to_date(inventory_date_str)
		sheet_name = inventory_date_str.replace('/', '-')
		sheet = wb.add_sheet(sheet_name)
		
		# Determine whether this package belongs in the inventory for this date
		first = True

		for row in computed_inventory_package_records:

			if first:
				sheet.add_row(get_inventory_column_names())
				first = False

			is_in_inventory = row[-1] == 'true'
			if not is_in_inventory:
				continue

			sheet.add_row(row)

		if first:
			# To handle when no rows were written for this date
			sheet.add_row(get_inventory_column_names())
	
	after = time.time()
	ctx.log_timing(f'  Took {round(after - before, 2)} seconds checking if its in the inventory. num_loops={num_loops}')

	Path('out').mkdir(parents=True, exist_ok=True)

	filepath = ctx.get_output_path(f'reports/{q.company_name}_computed_inventory_by_month.xls')
	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))

	before = time.time()			
	_write_current_inventory(
		q=q,
		ctx=ctx,
		inventory_packages_records=d.inventory_packages_records,
		id_to_history=id_to_history
	)

	after = time.time()
	ctx.log_timing(f'  Took {round(after - before, 2)} seconds to write current inventory')

	pct_excluded = num_excluded / num_total * 100
	pct_excluded_str = '{:.2f}'.format(pct_excluded)

	lines = []
	lines.append('')
	lines.append('')
	lines.append(f'Excluded {num_excluded} / {num_total} packages from consideration ({pct_excluded_str}%)')
	for reason, package_ids in exclude_reason_to_package_ids.items():
		count = len(package_ids)
		lines.append(f'  {reason}: {count} times')
		if show_debug_package_ids:
			lines.append('{}'.format(package_ids))

	print('\n'.join(lines))

	with open(ctx.get_output_path('log.txt'), 'a+') as fw:
		fw.write('\n'.join(lines))

	return ComputeInventoryDict(
		counts_analysis=CountsAnalysisDict(
			pct_excluded=round(pct_excluded, 2),
		),
		inventory_valuations=inventory_valuations,
		fresh_inventory_valuations=fresh_inventory_valuations,
		date_to_computed_inventory_dataframe=date_to_inventory_packages_dataframe
	)

