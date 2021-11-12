import copy
import datetime
import logging
import math
import pytz

from typing import Any, Dict, List, Sequence, Tuple, Union, Iterable, Set, cast
from dateutil import parser
from datetime import timedelta
from collections import OrderedDict
from mypy_extensions import TypedDict

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis.shared.package_history import PackageHistory
from bespoke.inventory.analysis.shared import inventory_common_util
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

DataframesForMatchingDict = TypedDict('DataframesForMatchingDict', {
	'parent_packages_records': List[InventoryPackageDict],
	'missing_incoming_pkg_package_records': List[InventoryPackageDict],
	'child_to_parent_package_id_override': Dict[str, str]
})

def _create_new_with_average_price(incoming_pkgs: List[TransferPackageDict]) -> TransferPackageDict:
	
	new_incoming_pkg = copy.deepcopy(incoming_pkgs[-1])
	total_cost = 0.0
	total_quantity = 0.0

	for incoming_pkg in incoming_pkgs:

		if math.isclose(incoming_pkg['price'], 0.01):
			continue

		# NOTE: Assume same units for now
		total_cost += incoming_pkg['price']
		total_quantity += incoming_pkg['quantity']

	new_incoming_pkg['price'] = total_cost
	new_incoming_pkg['quantity'] = total_quantity

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

def _find_parents_by_productionbatch_and_harvest(
	d: DataframesForMatchingDict, package_id_to_history: Dict[str, PackageHistory],
	resp: MatchingParentRespDict, debug_package_id: str) -> None:

	child_to_parent_details = resp['child_to_parent_details']
	productionbatchnum_to_package_id = {}
	
	for parent_record in d['parent_packages_records']:
		production_batch_num = parent_record['production_batch_number']
		package_id = parent_record['package_id']
		if debug_package_id:
				logging.debug(f'Parent package {package_id} is missing a productionbatchnumber')
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
			logging.info(f'WARN: Parent package {parent_history.package_id} has no incoming package, so the child wont have any incoming history either')
			return None

		return copy.deepcopy(parent_history.incomings[-1])

	orphan_child_package_ids = []
	children_with_source_missing_parents = []

	for pkg in d['missing_incoming_pkg_package_records']:
		# These are packages with a missing incoming package, so we need to find their parent

		child_package_id = pkg['package_id']

		# Allow the user to specifically provide child and parent relationships
		# if we needed to manually compute them.
		parent_package_id_override = d['child_to_parent_package_id_override'].get(child_package_id)
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
		print_if(f'Child has source harvest names {cur_harvestnames}', is_matching_debug_pkg)

		parent_package_ids = []

		if cur_harvestnames in sourceharvestnum_to_package_ids:
			for possible_parent_pkg_id in sourceharvestnum_to_package_ids[cur_harvestnames]:
				print_if(f'Possible parent based on source harvest names {possible_parent_pkg_id}', is_matching_debug_pkg)
				#possible_parent_history = package_id_to_history[possible_parent_pkg_id]
				#print_if(possible_parent_history.incomings[-1], is_matching_debug_pkg)
				#print_if(possible_parent_history.active_inventory_pkg, is_matching_debug_pkg)

			if len(sourceharvestnum_to_package_ids[cur_harvestnames]) == 1:
				# Here we've found one unique incoming parent package, so we can assume
				# its the parent of this child.
				parent_package_id = sourceharvestnum_to_package_ids[cur_harvestnames][0]
				child_to_parent_details[child_package_id] = {
					'incoming_pkg': _get_incoming_pkg(parent_package_id),
					'parent_package_id': parent_package_id,
					'is_synthetic': False
				}
				print_if('Found parent based on single parent matching harvest name', is_matching_debug_pkg)
				continue
			else:
				parent_package_ids = sourceharvestnum_to_package_ids[cur_harvestnames]
				match_resp = _determine_match_based_on_harvest(
					pkg, parent_package_ids, package_id_to_history
				)
				if match_resp['has_match']:
					print_if('Found parent based on inference logic using harvest name', is_matching_debug_pkg)
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

			resp['num_orphans'] += 1
			continue
		
		if batch_no:
			print_if(f'Has a source production batch number no parent found with that batch number', is_matching_debug_pkg)

		if batch_no not in productionbatchnum_to_package_id:
			resp['has_number_but_no_parent'] += 1
			children_with_source_missing_parents.append(child_package_id)
			continue
		
		print_if('Found parent based on production batch num', is_matching_debug_pkg)
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


def _create_incoming_pkg_using_external_pricing(
	pkg: InventoryPackageDict, 
	history: PackageHistory, 
	external_pricing_data_config: PricingDataConfigDict,
	debug_package_id: str) -> TransferPackageDict:

	price, err = inventory_common_util.get_estimated_price_per_unit_of_measure(
		product_category_name=pkg['product_category_name'],
		unit_of_measure=pkg['unit_of_measure'],
		external_pricing_data_config=external_pricing_data_config
	)
	if err:
		if debug_package_id:
			logging.info(err)
		return None

	unit_of_measure = pkg['unit_of_measure']
	quantity = 1.0

	history.sales_txs.sort(key=lambda x: x['sales_datetime'])

	# if we dont have any sales transactions, then assume weve had this
	# package for an arbitrary number of days in the past.
	# otherwise
	# say we had the package 1 day before the first time it was sold
	received_datetime = datetime.datetime.now() - timedelta(days=90)
	if history.sales_txs:
		received_datetime = history.sales_txs[0]['sales_datetime'] - timedelta(days=1)

	if not received_datetime.tzinfo:
		received_datetime = received_datetime.replace(tzinfo=pytz.UTC)

	new_incoming_pkg = TransferPackageDict(
		package_id=pkg['package_id'],
		license_number=pkg['license_number'],
		product_category_name=pkg['product_category_name'],
		product_name=pkg['product_name'],
		received_unit_of_measure=unit_of_measure,
		received_quantity=quantity,
		receiver_wholesale_price=price,
		shipped_unit_of_measure=unit_of_measure,
		shipped_quantity=quantity,
		shipper_wholesale_price=price,
		shipment_package_state='Accepted',
		delivery_type=DeliveryType.INCOMING_FROM_VENDOR,
		created_date=received_datetime.date(),
		received_datetime=received_datetime,
		source_harvest_names='',
		price=price,
		quantity=quantity,
		unit_of_measure=unit_of_measure,
		received_date=received_datetime.date(),
		date_to_txs=dict()
	)
	return new_incoming_pkg

def match_child_packages_to_parents(
	d: DataframesForMatchingDict, 
	package_id_to_history: Dict[str, PackageHistory],
	params: AnalysisParamsDict,
	debug_package_id: str = None) -> MatchingParentRespDict:

	resp = MatchingParentRespDict(
		child_to_parent_details={},
		has_number_but_no_parent=0,
		num_orphans=0
	)

	if params.get('find_parent_child_relationships', False):
		_find_parents_by_productionbatch_and_harvest(
			d, package_id_to_history, resp, debug_package_id)

	if params.get('use_prices_to_fill_missing_incoming', False):
		if not params['external_pricing_data_config']:
			raise Exception('external_pricing_data_config must be filled in when the use_prices_to_fill_missing_incoming is set')

		category_to_fixed_prices = params['external_pricing_data_config']['category_to_fixed_prices']
		toplevel_keys = list(category_to_fixed_prices.keys())
		for k in toplevel_keys:
			# lowercase all the category names for easier matching
			v = category_to_fixed_prices[k]
			category_to_fixed_prices[k.lower()] = v

			secondlevel_keys = list(v.keys())
			for sub_key in secondlevel_keys:
				# lowercase the unit of measure for easier matching
				v[sub_key.lower()] = v[sub_key]

		for pkg in d['missing_incoming_pkg_package_records']:
			if pkg['package_id'] in resp['child_to_parent_details']:
				# Already has a matching parent
				continue

			child_history = package_id_to_history.get(pkg['package_id'])
			if not child_history:
				continue

			new_incoming_pkg = _create_incoming_pkg_using_external_pricing(
					pkg, child_history, params['external_pricing_data_config'], debug_package_id)
			if new_incoming_pkg:	
				resp['child_to_parent_details'][pkg['package_id']] = {
					'incoming_pkg': new_incoming_pkg,
					'parent_package_id': None,
					'is_synthetic': True
				}

	return resp
