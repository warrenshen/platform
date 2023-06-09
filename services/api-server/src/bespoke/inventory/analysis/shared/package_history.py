import datetime
import logging
import math
import pytz

from typing import Dict, List
from collections import OrderedDict

from bespoke.inventory.analysis.shared.inventory_types import (
	Printer,
	InventoryPackageDict,
	TransferPackageDict,
	AnalysisParamsDict,
	SalesTransactionDict,
	ComputedInfoDict
)
from bespoke.inventory.analysis.shared.inventory_common_util import (
	parse_to_date, date_to_str, is_outgoing, is_incoming, safe_isnan
)

DEFAULT_SOLD_THRESHOLD = 0.95

class ExcludeReason(object):
	MISSING_INCOMING = 'MISSING_INCOMING'
	CHILD_MISSING_INVENTORY_PACKAGE = 'CHILD_MISSING_INVENTORY_PACKAGE'
	PARENT_HAS_ZERO_QUANTITY = 'PARENT_HAS_ZERO_QUANTITY'
	INCOMING_MISSING_QUANTITY = 'INCOMING_MISSING_QUANTITY'
	OUTGOING_MISSING_QUANTITY = 'OUTGOING_MISSING_QUANTITY'
	INCOMING_MISSING_PRICE = 'INCOMING_MISSING_PRICE'
	MISSING_TIMESTAMP = 'MISSING_TIMESTAMP'
	OUT_OF_ORDER_DATES = 'OUT_OF_ORDER_DATES'

def _find_matching_package_by_date(
	all_transfer_pkgs: List[TransferPackageDict],
	cur_date: datetime.date,
	include_outgoing: bool) -> TransferPackageDict:
	
	for i in range(len(all_transfer_pkgs)):
		cur_transfer_pkg = all_transfer_pkgs[i]
		cur_transfer_date = cur_transfer_pkg['received_date']

		if (i + 1) >= len(all_transfer_pkgs):
			# We reached the end of the array, so just put some enormously
			# large date
			next_transfer_date = datetime.date(3000, 1, 1)
		else:
			next_transfer_date = all_transfer_pkgs[i+1]['received_date']

		if is_outgoing(cur_transfer_pkg) and include_outgoing:
			return cur_transfer_pkg

		elif is_outgoing(cur_transfer_pkg):
			# Dont insert a transaction associated with an outgoing transaction
			# if were not supposed to include it
			continue

		if cur_date >= cur_transfer_date and cur_date <= next_transfer_date:
			return cur_transfer_pkg

	return None

def estimate_price_of_package_using_margin(
	original_quantity: float,
	margin_estimate: float,
	history: 'PackageHistory'
) -> float:
	revenue_from_pkg = 0.0
	quantity_sold = 0.0
	for sales_tx in history.sales_txs:
		revenue_from_pkg += sales_tx['tx_total_price']
		quantity_sold += sales_tx['tx_quantity_sold']

	price = 0.0
	if quantity_sold > 0:
		unit_revenue = revenue_from_pkg / quantity_sold
		unit_cogs = unit_revenue * (1 - margin_estimate)
		price = unit_cogs * original_quantity

	return price

class PackageHistory(object):
	"""
		Grab all the information we know about this package, and then compute multiple fields on it
	"""

	def __init__(self, package_id: str) -> None:
		self.incomings: List[TransferPackageDict] = []
		self.outgoings: List[TransferPackageDict] = []
		self.all_transfer_pkgs: List[TransferPackageDict] = [] # Sorted when computing information about history
		self.sales_txs: List[SalesTransactionDict] = []
		self.package_id = package_id
		self.inactive_pkg: InventoryPackageDict = None
		# We need the active package pulled directly from metrc_packages for
		# the child package quantity computations 
		self.active_inventory_pkg: InventoryPackageDict = None 
		
		self.computed_info: ComputedInfoDict = {}
		self.is_parent = False # Whether this package is a parent of spawned child packages
		self.uses_parenting_logic = False # Whether this package is a child spawned from a parent package
		self.are_prices_inferred = False # When we have to make a guess about the cost of the child by inferring what the parent was
		self.should_exclude = False
		self.exclude_reason = ''
				
	def in_inventory_at_date(self, cur_date: datetime.date) -> bool:
		# Was this package in the company's possession at this date?
		matching_transfer_pkg = _find_matching_package_by_date(
				self.all_transfer_pkgs, cur_date=cur_date, include_outgoing=True)

		if not matching_transfer_pkg:
			# There will be many cases when we are looking at a date where the package
			# hasn't come in yet.
			return False

		if is_incoming(matching_transfer_pkg):
			incoming_pkg = matching_transfer_pkg
			arrived_date = incoming_pkg['received_date']

			if arrived_date and cur_date < arrived_date:
				return False

		if is_outgoing(matching_transfer_pkg):
			return False

		finished_date = self.computed_info.get('finished', {}).get('date')
		if finished_date and cur_date > finished_date:
			# Its no longer in your possession the day after it's finished
			return False

		sold_date = self.computed_info.get('sold', {}).get('date')
		if sold_date and cur_date > sold_date:
			# We know it's not in your possession after the sales date
			return False

		cur_quantity = self._get_current_quantity(cur_date)
		if cur_quantity <= 0.0:
			# No quantity left even if it wasn't fully sold
			return False
		
		# Knowing nothing else, assume you have the package at this date
		return True
	
	def _get_current_quantity(self, inventory_date: datetime.date) -> float:
		if 'date_to_quantity' not in self.computed_info:
			return -1

		dates = list(self.computed_info['date_to_quantity'].keys())
		dates.sort()
		cur_quantity = 0.0

		for cur_date in dates:
			if cur_date <= inventory_date:
				# Keep updating what the quantity is until we reach the inventory date
				cur_quantity = self.computed_info['date_to_quantity'][cur_date]
			else:
				# We've reached a date that is beyond the inventory date
				break

		return cur_quantity
				
	def filter_out_unhandled_packages(self, p: Printer) -> None:    
		if not self.incomings:
			p.info(f'Excluding package {self.package_id} because it doesnt have an incoming package')
			self.should_exclude = True
			self.exclude_reason = ExcludeReason.MISSING_INCOMING
			return
	
	def when_it_finished(self, p: Printer) -> bool:
		if self.inactive_pkg:
			reason = ''
			finished_date = None

			if self.inactive_pkg['finished_date']:
				reason = 'finished'
				finished_date = parse_to_date(self.inactive_pkg['finished_date'])
			elif self.inactive_pkg['archived_date']:
				reason = 'archived'
				finished_date = parse_to_date(self.inactive_pkg['archived_date'])

			if not reason:
				return False

			self.computed_info['finished'] = {
				'reason': reason,
				'date': finished_date
			}
			return True
		else:
			return False

	def run_is_sold_logic(self, p: Printer, params: AnalysisParamsDict, skip_over_errors: bool) -> bool:
		# Fills in the 'sold' value for self.computed_info
		#
		# Tells us when a package was sold
		
		# It's only considered sold if it was an incoming package
		# and we see there are sales transactions.
		sold_threshold = params.get('sold_threshold', DEFAULT_SOLD_THRESHOLD)

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
				print('INCOMING')
				print(incoming_pkg)
				print('')

			if not incoming_pkg['received_datetime']:
				continue

			incoming_pkgs.append(incoming_pkg)

		outgoing_pkgs = []
		for outgoing_pkg in self.outgoings:
			# Make sure we cleared out any previous transactions associated with these packages
			assert len(outgoing_pkg['date_to_txs'].keys()) == 0

			if in_debug_mode:
				print('OUTGOING')
				print(outgoing_pkg)
				print('')

			if not outgoing_pkg['received_datetime']:
				continue

			outgoing_pkgs.append(outgoing_pkg)

		if not incoming_pkgs:
			return False

		self.all_transfer_pkgs = incoming_pkgs + outgoing_pkgs
		self.all_transfer_pkgs.sort(key=lambda x: x['received_datetime'])
		all_transfer_pkgs = self.all_transfer_pkgs

		def _find_insertion(sales_datetime: datetime.datetime) -> TransferPackageDict:
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

				if is_outgoing(cur_transfer_pkg):
					# Dont insert a transaction associated with an outgoint transaction
					continue

				if sales_datetime >= cur_transfer_datetime and sales_datetime <= next_transfer_datetime:
					return cur_transfer_pkg

			# If no package was still found to match to, assume that a transaction which
			# occurred in the same day as an incoming package is still OK, even if it
			# technically happened minutes or hours before arriving according to metrc
			sales_date = sales_datetime.date()

			matching_transfer_pkg = _find_matching_package_by_date(
				all_transfer_pkgs, cur_date=sales_date, include_outgoing=False)
			if matching_transfer_pkg:
				return matching_transfer_pkg

			if skip_over_errors:
				# If we are just using this for debugging, insert this transaction into
				# the last transfer package we see
				return all_transfer_pkgs[-1]
			else:
				return None

		self.sales_txs.sort(key = lambda x: x['sales_datetime'])

		if self.uses_parenting_logic and not self.active_inventory_pkg and not self.inactive_pkg:
			if in_debug_mode:
				logging.info(f'We should always have the actual inventory or inactive package for a child package. Package ID {self.package_id}')
			
			self.should_exclude = True
			self.exclude_reason = ExcludeReason.CHILD_MISSING_INVENTORY_PACKAGE
			return False

		revenue_from_pkg = 0.0
		estimated_original_quantity = 0.0
		if self.active_inventory_pkg:
			estimated_original_quantity = float(self.active_inventory_pkg['quantity'])
		elif self.inactive_pkg:
			estimated_original_quantity = float(self.inactive_pkg['quantity'])

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
			revenue_from_pkg += tx['tx_total_price']
			estimated_original_quantity += tx['tx_quantity_sold']

		lines = []
		verbose = p.verbose
		
		amount_sold = 0.0
		is_sold = False
		shipped_quantity = 0.0
		revenue_from_pkg = 0.0
		remaining_quantity = 0.0
		date_to_quantity: Dict[datetime.date, float] = {}
		
		for transfer_pkg in all_transfer_pkgs:
			
			if is_incoming(transfer_pkg):
				incoming_pkg = transfer_pkg

				arrived_date = incoming_pkg['received_date']
				if not incoming_pkg['quantity'] or safe_isnan(incoming_pkg['quantity']):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.INCOMING_MISSING_QUANTITY
					if in_debug_mode:
						logging.info(f'WARN: incoming package #{self.package_id} does not have a quantity', package_id=self.package_id) # type:ignore
					return False

				shipped_quantity = incoming_pkg['quantity']
				price_of_pkg = incoming_pkg['price']

				if not price_of_pkg or safe_isnan(price_of_pkg):
					# Try to find the price if there is margin estimate provided
					if params.get('use_margin_estimate_config', False) and shipped_quantity:

						margin_estimate = params['margin_estimate_config']['category_to_margin_estimate'].get(
							incoming_pkg['product_category_name']
						)
						if margin_estimate is not None:
							price_of_pkg = estimate_price_of_package_using_margin(
								original_quantity=estimated_original_quantity,
								margin_estimate=margin_estimate,
								history=self
							)
							incoming_pkg['price'] = price_of_pkg
							self.are_prices_inferred = True

				if not price_of_pkg or safe_isnan(price_of_pkg):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.INCOMING_MISSING_PRICE
					if in_debug_mode:
						logging.info(f'WARN: incoming package #{self.package_id} does not have a price', package_id=self.package_id) # type:ignore
					return False

				shipment_package_state = incoming_pkg['shipment_package_state']

				initial_quantity = shipped_quantity
				if shipment_package_state == 'Returned':
					initial_quantity = 0.0

				date_to_quantity[arrived_date] = initial_quantity
				remaining_quantity = initial_quantity

				if verbose:
					lines.append('')
					lines.append(f'Package {self.package_id} arrived on {date_to_str(arrived_date)} with quantity {shipped_quantity} and price ${price_of_pkg}.')

			elif is_outgoing(transfer_pkg):
				outgoing_pkg = transfer_pkg
				outgoing_date = outgoing_pkg['received_date']

				date_to_quantity[outgoing_date] = 0
				remaining_quantity = 0

				if not skip_over_errors and len(transfer_pkg['date_to_txs'].keys()) > 0:
					raise Exception(f'There should be no transactions associated with an outgoing transfer. Package ID: {self.package_id}, outgoing transfer package on {outgoing_date}')

				if not outgoing_pkg['quantity'] or safe_isnan(outgoing_pkg['quantity']):
					self.should_exclude = True
					self.exclude_reason = ExcludeReason.OUTGOING_MISSING_QUANTITY
					if in_debug_mode:
						logging.info(f'WARN: outgoing package #{self.package_id} does not have a outgoing shipped quantity', package_id=self.package_id)  # type:ignore
					return False

				shipped_quantity = float(incoming_pkg['quantity'])

				if verbose:
					lines.append('')
					lines.append(f'Package {self.package_id} is outgoing on {date_to_str(outgoing_date)} with quantity {shipped_quantity}')

			else:
				raise Exception('Seeing a transfer with unhandled deliver type {}'.format(transfer_pkg))

			dates = list(transfer_pkg['date_to_txs'].keys())
			dates.sort()

			for cur_date in dates:
				txs = transfer_pkg['date_to_txs'][cur_date]

				for tx in txs:

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

					if not math.isclose(revenue_from_pkg, 0.0):
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
							'date': is_sold_date,
							'reason': 'sold'
						}

				date_to_quantity[parse_to_date(cur_date)] = remaining_quantity

		if verbose:
			lines.append(f'Package {self.package_id} has a remaining quantity of {remaining_quantity}')

		p.info('\n'.join(lines))

		self.computed_info['date_to_quantity'] = date_to_quantity
		return is_sold
		
	def compute_additional_fields(self, p: Printer, params: AnalysisParamsDict, run_filter: bool, skip_over_errors: bool) -> None:
		if self.computed_info:
			# If we've already computed information for this history, no need to compute it again
			return

		if run_filter:
			self.filter_out_unhandled_packages(p)
					
		if self.should_exclude:
			return

		self.when_it_finished(p)
		self.run_is_sold_logic(
			p, 
			params=params,
			skip_over_errors=skip_over_errors)
