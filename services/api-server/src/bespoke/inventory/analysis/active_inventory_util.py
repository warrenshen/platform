import datetime
import copy
import math
import numpy
import pandas
import pytz
import xlwt

from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple, Union, Iterable, Set, cast
from dateutil import parser
from datetime import timedelta
from collections import OrderedDict
from mypy_extensions import TypedDict

from bespoke.db.db_constants import DeliveryType
from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue

from bespoke.inventory.analysis.shared.package_history import PackageHistory
from bespoke.inventory.analysis.shared import inventory_common_util
from bespoke.inventory.analysis.shared import parent_or_price_matching as parent_util
from bespoke.inventory.analysis.shared.download_util import Download, BigQuerySQLHelper
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date, parse_to_datetime, date_to_str, print_if,
	is_outgoing, is_time_null
)
from bespoke.inventory.analysis.shared.inventory_types import (
	Printer,
	Query,
	InventoryPackageDict,
	TransferPackageDict,
	AnalysisParamsDict,
	SalesTransactionDict,
	PricingDataConfigDict
)
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
		'is_child_package',
		'are_prices_inferred',

		'product_category_name',
		'product_name',

		'quantity',
		'unit_of_measure',
		'current_value',
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
		'{}'.format(history.is_child_of_parent),
		'{}'.format(history.are_prices_inferred),

		incoming_pkg['product_category_name'],
		incoming_pkg['product_name'],

		cur_quantity if cur_quantity != -1 else 0,
		incoming_pkg['unit_of_measure'] or '',
		round(current_value, 2),
		date_to_str(sold_date) if sold_date else '',
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
		child_history.is_child_of_parent = True
		child_history.are_prices_inferred = parent_info['is_synthetic']

	return package_id_to_history

def run_orphan_analysis(d: Download, package_id_to_history: Dict[str, PackageHistory], params: AnalysisParamsDict) -> None:
	# Child to parent package_id
	resp = parent_util.match_child_packages_to_parents(_to_dataframes_for_matching(d), package_id_to_history, params)

	print('{} - Number of parent packages'.format(len(d.parent_packages_records)))
	print('')
	print('{} - Child packages with parents'.format(len(resp['child_to_parent_details'].keys())))
	print('{} - orphans; child packages with (no source product batch num)'.format(resp['num_orphans']))
	print('{} - no matching parent; child packages that have a source batch number, but no parent'.format(resp['has_number_but_no_parent']))

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
	num_incoming_missing_price = 0
	num_incoming_pkgs = 0

	for package_id, history in id_to_history.items():

		if history.outgoings and not history.incomings:
			only_outgoing += 1

		if history.incomings and not history.outgoings and not history.sales_txs:
			only_incoming += 1
			#print(history.incomings[0]['source_harvest_names'])

		if history.incomings:
			num_incoming_pkgs += 1
			if not history.incomings[-1]['price'] or numpy.isnan(history.incomings[-1]['price']):
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

		if history.is_child_of_parent:
			num_child_packages += 1

		total_seen += 1

	if should_print:
		print(f'Only outgoing: {only_outgoing}')
		print(f'Only incoming: {only_incoming}')	
		print('Sold packages missing incoming_pkg: {} ({:.2f}% of packages)'.format(
					only_sold, only_sold / total_seen * 100))
		print('Incoming packages missing price {} ({:.2f}% of incoming packages)'.format(
					num_incoming_missing_price, num_incoming_missing_price / num_incoming_pkgs * 100
		))
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
		incoming_missing_prices=num_incoming_missing_price,
		in_and_sold_at_least_once=in_and_sold_at_least_once,
		in_and_sold_many_times=in_and_sold_many_times,
		num_parent_packages=num_parent_packages,
		num_child_packages=num_child_packages,
		total_seen=total_seen
	)



### CREATE AND COMPARE INVENTORY

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
		is_in_inventory_str = 'true' if is_in_inventory else ''

		package_record = _get_inventory_output_row(history, inventory_date, is_in_inventory)
		package_record.append(is_in_inventory_str)
		package_records += [package_record]

	return package_records

def create_inventory_dataframes(
	package_id_to_history: Dict[str, PackageHistory],
	q: Query,
	params: AnalysisParamsDict
) -> Dict[str, List[List[CellValue]]]:
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

			package_record = _get_inventory_output_row(history, inventory_date, is_in_inventory=True)
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
	delta_tuples = []
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
	print('Accuracy of quantities for matching packages: {:.2f}%'.format((quantity_avg - quantity_delta) / quantity_avg * 100))
	print('Pct of # inventory packages over-estimated: {:.2f}%'.format(len(unseen_package_ids) / num_packages * 100))
	print('Pct of # quantity over-estimated: {:.2f}%'.format(extra_quantity / total_quantity))
	print('Avg quantity delta: {:.2f}'.format(quantity_delta))
	print('Avg quantity: {:.2f}'.format(quantity_avg))
	print('')
	print('Num matching packages: {}'.format(num_matching_packages))

	computed_missing_but_seen_before_pct = 0.0
	if len(computed_missing_package_ids) != 0:
		computed_missing_but_seen_before_pct = len(computed_missing_package_ids_but_seen_before) / len(computed_missing_package_ids) * 100

	print('Num actual packages not computed: {}'.format(len(computed_missing_package_ids)))
	print('  but computed at some point: {}, e.g., {:.2f}% of non-computed packages'.format(
		len(computed_missing_package_ids_but_seen_before), computed_missing_but_seen_before_pct))
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

	print('')
	print(f'Largest delta in quantities; first {num_errors_to_show}')
	delta_tuples.sort(key=lambda x: x[1], reverse=True)

	i = 0
	for (package_id, delta) in delta_tuples:
		if i > num_errors_to_show:
			break

		print('Delta {:.2f} for package_id {}'.format(delta, package_id))
		i += 1

	return {
		'computed_extra_package_ids': unseen_package_ids,
		'computed_missing_actual_package_ids': computed_missing_actual_package_ids
	}

def compute_inventory_across_dates(
	d: Download,
	inventory_dates: List[str],
	params: AnalysisParamsDict
) -> Dict:
	date_to_inventory_packages_dataframe = {}

	id_to_history = get_histories(d, params)
	inventory_valuations = []

	for inventory_date in inventory_dates:
		computed_inventory_package_records = create_inventory_dataframe_by_date(
				id_to_history, inventory_date, params=params)    
		computed_inventory_packages_dataframe = pandas.DataFrame(
				computed_inventory_package_records,
				columns=get_inventory_column_names()
		)
		date_to_inventory_packages_dataframe[inventory_date] = computed_inventory_packages_dataframe
		inventory_valuations.append(valuations_util.get_total_valuation_for_date(
				computed_inventory_packages_dataframe=computed_inventory_packages_dataframe,
				company_incoming_transfer_packages_dataframe=d.incoming_transfer_packages_dataframe,
				inventory_date=inventory_date
		))
			
	return {
		'inventory_valuations': inventory_valuations,
		'date_to_computed_inventory_dataframe': date_to_inventory_packages_dataframe
	}

def compare_computed_vs_actual_inventory(
	computed: pandas.DataFrame,
	actual: pandas.DataFrame, 
	compare_options: CompareOptionsDict) -> None:
	from_packages_inventory_dataframe = actual[[
			'package_id',
			'packaged_date',
			'unit_of_measure',
			'product_category_name',
			'product_name',
			'quantity',
	]].sort_values('package_id')

	res = compare_inventory_dataframes(
			computed=computed,
			actual=from_packages_inventory_dataframe,
			options=compare_options
	)

def create_inventory_xlsx(
	id_to_history: Dict[str, PackageHistory], q: Query, params: AnalysisParamsDict,
	show_debug_package_ids: bool = False) -> None:
		
	i = 0
	num_excluded = 0
	num_total = 0
	max_to_see = -1

	p = Printer(verbose=False, show_info=False)

	exclude_reason_to_package_ids: Dict[str, Set[str]] = OrderedDict()

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
			
			row = _get_inventory_output_row(history, inventory_date, is_in_inventory=True)
			sheet.add_row(row)
	
	Path('out').mkdir(parents=True, exist_ok=True)

	filepath = f'out/{q.company_name}_inventory_by_month.xls'
	with open(filepath, 'wb') as f:
		wb.save(f)
		print('Wrote result to {}'.format(filepath))
			
	pct_excluded = '{:.2f}'.format(num_excluded / num_total * 100)
	print(f'Excluded {num_excluded} / {num_total} packages from consideration ({pct_excluded}%)')
	for reason, package_ids in exclude_reason_to_package_ids.items():
		count = len(package_ids)
		print(f'  {reason}: {count} times')
		if show_debug_package_ids:
			print(package_ids)

