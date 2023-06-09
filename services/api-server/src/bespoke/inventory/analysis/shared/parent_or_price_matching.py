import copy
import datetime
import logging
import math
import pytz

from typing import Dict, List, Tuple
from datetime import timedelta
from mypy_extensions import TypedDict

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis.shared.package_history import (
	PackageHistory,
	estimate_price_of_package_using_margin
)
from bespoke.inventory.analysis.shared import inventory_common_util
from bespoke.inventory.analysis.shared.inventory_common_util import (
	print_if
)
from bespoke.inventory.analysis.shared.inventory_types import (
	InventoryPackageDict,
	TransferPackageDict,
	AnalysisParamsDict,
	PricingDataConfigDict,
	MarginEstimateConfigDict
)

ParentDetailsDict = TypedDict('ParentDetailsDict', {
	'incoming_pkg': TransferPackageDict,
	'parent_package_id': str,
	'is_synthetic': bool,
	'uses_parenting_logic': bool
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

	def _get_copy_of_incoming_pkg(package_id: str) -> TransferPackageDict:
		if package_id not in package_id_to_history:
			raise Exception('Trying to get an incoming package ID for parent package_id={} which has no incoming transfer'.format(package_id))

		parent_history = package_id_to_history[package_id]
		if not parent_history.incomings:
			logging.info(f'WARN: Parent package {parent_history.package_id} has no incoming package, so the child wont have any incoming history either')
			return None

		return copy.deepcopy(parent_history.incomings[-1])

	def _create_incoming_pkg_for_child(
		child_package_id: str, parent_package_id: str) -> TransferPackageDict:
		
		parent_incoming_pkg = _get_copy_of_incoming_pkg(parent_package_id)
		child_incoming_pkg = parent_incoming_pkg
		child_history = package_id_to_history[child_package_id]

		# The child is a copy of the parent package with a few modifications
		# mostly to the quantity and price estimate.
		original_quantity, err = _get_original_quantity(child_history)
		if err:
			logging.error(err)
			return None

		parent_original_quantity = parent_incoming_pkg['quantity']
		parent_wholesale_price = parent_incoming_pkg['price']
		
		child_incoming_pkg['quantity'] = original_quantity

		if math.isclose(parent_original_quantity, 0.0):
			per_unit_price = 0.0
		else:
			per_unit_price = parent_wholesale_price / parent_original_quantity
		
		child_incoming_pkg['price'] = per_unit_price * original_quantity

		return child_incoming_pkg


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
				'incoming_pkg': _create_incoming_pkg_for_child(
					child_package_id, parent_package_id_override),
				'parent_package_id': parent_package_id_override,
				'is_synthetic': False,
				'uses_parenting_logic': True
			}
			continue

		# Try to match on harvest number
		cur_harvestnames = pkg['source_harvest_names']
		is_matching_debug_pkg = debug_package_id == pkg['package_id']
		print_if(f'Child has source harvest names {cur_harvestnames}', is_matching_debug_pkg)

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
					'incoming_pkg': _create_incoming_pkg_for_child(
						child_package_id, parent_package_id),
					'parent_package_id': parent_package_id,
					'is_synthetic': False,
					'uses_parenting_logic': True
				}
				print_if('Found parent based on single parent matching harvest name', is_matching_debug_pkg)
				continue
			else:
				# Dont infer when things are ambiguous
				pass

		batch_no = pkg['source_production_batch_numbers']
		if not batch_no:
			orphan_child_package_ids.append(child_package_id)
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
			'incoming_pkg': _create_incoming_pkg_for_child(
				child_package_id, parent_package_id),
			'parent_package_id': parent_package_id,
			'is_synthetic': False,
			'uses_parenting_logic': True
		}

	#print('Children missing source batch number: {}'.format(orphan_child_package_ids))
	#print('')
	#print('Children with source missing parent: {}'.format(children_with_source_missing_parents))
	#print('')
	#print('Product batch num to parent id {}'.format(productionbatchnum_to_package_id))

def _create_transfer_pkg(
	pkg: InventoryPackageDict,
	unit_of_measure: str,
	quantity: float,
	price: float,
	received_datetime: datetime.datetime,
) -> TransferPackageDict:
	return TransferPackageDict(
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

def _get_one_day_before_first_sale(history: PackageHistory) -> datetime.datetime:
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

	return received_datetime

def _get_original_quantity(history: PackageHistory) -> Tuple[float, str]:

	estimated_original_quantity = 0.0
	if history.active_inventory_pkg:
		estimated_original_quantity = float(history.active_inventory_pkg['quantity'])
	elif history.inactive_pkg:
		estimated_original_quantity = float(history.inactive_pkg['quantity'])
	else:
		return None, 'No active or inactive package found to estimate the original quantity'

	for sales_tx in history.sales_txs:
		estimated_original_quantity += sales_tx['tx_quantity_sold']

	return estimated_original_quantity, None

def _create_incoming_pkg_using_external_pricing(
	pkg: InventoryPackageDict, 
	history: PackageHistory, 
	external_pricing_data_config: PricingDataConfigDict,
	debug_package_id: str) -> TransferPackageDict:

	price_per_unit, err = inventory_common_util.get_estimated_price_per_unit_of_measure(
		product_category_name=pkg['product_category_name'],
		unit_of_measure=pkg['unit_of_measure'],
		external_pricing_data_config=external_pricing_data_config
	)
	if err:
		if debug_package_id:
			logging.info(err)
		return None

	unit_of_measure = pkg['unit_of_measure']
	quantity, err = _get_original_quantity(history)
	if err:
		logging.info('Could not determine original quantity of package_id: {}. Err: {}'.format(
			history.package_id, err))
		return None

	price = quantity * price_per_unit
	received_datetime = _get_one_day_before_first_sale(history)

	new_incoming_pkg = _create_transfer_pkg(
		pkg=pkg,
		unit_of_measure=unit_of_measure,
		quantity=quantity,
		price=price,
		received_datetime=received_datetime
	)
	return new_incoming_pkg

def _create_incoming_pkg_using_margin_estimate(
	pkg: InventoryPackageDict, 
	history: PackageHistory, 
	margin_estimate_config: MarginEstimateConfigDict,
	debug_package_id: str) -> TransferPackageDict:

	margin_estimate = margin_estimate_config['category_to_margin_estimate'].get(
		pkg['product_category_name'].lower()
	)
	if margin_estimate is None:
		#if debug_package_id:
		logging.info('Could not find a margin estimate for product category {}'.format(pkg['product_category_name']))
		return None

	# total_cost == price

	# (1 - profit_margin) = total_cost / total_revenue
	# total_cost = (1 - profit_margin) * total_revenue
	quantity, err = _get_original_quantity(history)
	if err:
		logging.info('Could not determine original quantity of package_id: {}. Err: {}'.format(
			history.package_id, err))
		return None

	price = estimate_price_of_package_using_margin(
		original_quantity=quantity,
		margin_estimate=margin_estimate,
		history=history
	)

	received_datetime = _get_one_day_before_first_sale(history)

	new_incoming_pkg = _create_transfer_pkg(
		pkg=pkg,
		unit_of_measure=pkg['unit_of_measure'],
		quantity=quantity,
		price=price,
		received_datetime=received_datetime
	)
	return new_incoming_pkg

def _lowercase_keys(d: Dict, level: int) -> None:
	toplevel_keys = list(d.keys())

	for k in toplevel_keys:
		# lowercase all the category names for easier matching
		v = d[k]
		d[k.lower()] = v

		if level == 2:
			secondlevel_keys = list(v.keys())
			for sub_key in secondlevel_keys:
				# lowercase the unit of measure for easier matching
				v[sub_key.lower()] = v[sub_key]

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

	if params.get('use_prices_to_fill_missing_incoming') and params.get('use_margin_estimate_config'):
		raise Exception('Cannot use use_prices_to_fill_missing_incoming and use_margin_estimate_config. Must be one or the other')

	if params.get('use_margin_estimate_config', False):
		if not params.get('margin_estimate_config'):
			raise Exception('margin_estimate_config must be filled in when use_margin_estimate_config is True')

		margin_estimate_config = params['margin_estimate_config']
		_lowercase_keys(margin_estimate_config['category_to_margin_estimate'], level=1)

		for pkg in d['missing_incoming_pkg_package_records']:
			if pkg['package_id'] in resp['child_to_parent_details']:
				# Already has a matching parent
				continue

			child_history = package_id_to_history.get(pkg['package_id'])
			if not child_history:
				continue

			new_incoming_pkg = _create_incoming_pkg_using_margin_estimate(
					pkg, child_history, params['margin_estimate_config'], debug_package_id)
			if new_incoming_pkg:	
				resp['child_to_parent_details'][pkg['package_id']] = {
					'incoming_pkg': new_incoming_pkg,
					'parent_package_id': None,
					'is_synthetic': True,
					'uses_parenting_logic': False
				}
			else:
				print('Incoming margin estimate yielded nothing {}'.format(pkg['package_id']))	

	if params.get('use_prices_to_fill_missing_incoming', False):
		if not params['external_pricing_data_config']:
			raise Exception('external_pricing_data_config must be filled in when the use_prices_to_fill_missing_incoming is set')

		category_to_fixed_prices = params['external_pricing_data_config']['category_to_fixed_prices']
		_lowercase_keys(category_to_fixed_prices, level=2)

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
					'is_synthetic': True,
					'uses_parenting_logic': False
				}

	return resp
