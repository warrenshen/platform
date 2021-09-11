import datetime
import numpy
import xlwt

from typing import Dict, List, Tuple, Union, Set, cast
from dateutil import parser

from bespoke.excel import excel_writer

class Query(object):

	def __init__(self) -> None:
		self.inventory_dates: List[str] = []
		self.company_name = ''

class Download(object):
		
	def __init__(self) -> None:
		self.incoming_records: List[Dict] = []
		self.outgoing_records: List[Dict] = []
		self.packages_records: List[Dict] = []
		self.sales_tx_records: List[Dict] = []
		
def date_to_str(dt: datetime.datetime) -> str:
		return dt.strftime('%m/%d/%Y')

def parse_to_date(cur_date: Union[str, datetime.datetime]) -> datetime.datetime:
		if not cur_date:
				return None
		
		if type(cur_date) == str:
				return parser.parse(cast(str, cur_date))
		
		return cast(datetime.datetime, cur_date)
				
class Printer(object):
		 
		def __init__(self, verbose: bool, show_info: bool) -> None:
				self.verbose = verbose
				self.show_info = show_info
				self.packages_with_warnings: Set[str] = set([])
				
		def warn(self, msg: str, package_id: str = None) -> None:
				print('WARN: {}'.format(msg))
				if package_id:
						self.packages_with_warnings.add(package_id)
				
		def debug(self, msg: str) -> None:
				if self.verbose:
						print(msg)
						
		def info(self, msg: str) -> None:
				if self.show_info:
						print(msg)
						
class PackageHistory(object):
		"""
				Grab all the information we know about this package, and then compute multiple fields on it
		"""
		
		def __init__(self, package_id: str) -> None:
				self.incomings: List[Dict] = []
				self.outgoings: List[Dict] = []
				self.sales_txs: List[Dict] = []
				self.pkg: Dict = None
				self.package_id = package_id
				self.computed_info: Dict = {}
				self.should_exclude = False
				
		def in_inventory_at_date(self, cur_date_str: str) -> bool:
				# Was this package in the company's possession at this date?
				cur_date = parse_to_date(cur_date_str)    
				arrived_date = parse_to_date(self.computed_info['arrived']['date'])
				if cur_date < arrived_date:
						return False
				
				sold_date = parse_to_date(self.computed_info.get('sold', {}).get('date'))
				if sold_date and cur_date > sold_date:
						# We know it's not in your possession after the sales date
						return False
				
				# Knowing nothing else, assume you have the package at this date
				return True
				
		def get_inventory_column_names(self) -> List[str]:
				return [
						'Package ID',
						'Arrived Date',
						'Sold Date',
				]
				
		def get_inventory_output_row(self) -> List[str]:
				incoming_pkg = self.incomings[-1] if self.incomings else None 
				sold_date = parse_to_date(self.computed_info.get('sold', {}).get('date'))
				
				if incoming_pkg:
						return [
								self.package_id,
								date_to_str(self.computed_info['arrived']['date']),
								date_to_str(sold_date) if sold_date else '',
						]
				else:
						return [
								self.package_id,
								date_to_str(self.computed_info['arrived']['date']),
								date_to_str(sold_date) if sold_date else '',
						]
				
		def filter_out_unhandled_packages(self, p: Printer) -> None:
				if len(self.incomings) > 1:
						p.info(f'Excluding package {self.package_id} because it has multiple incoming packages')
						self.should_exclude = True
						return
				
				if not self.incomings and not self.pkg:
						p.info(f'Excluding package {self.package_id} because it doesnt have an incoming or regular MetrcPackage')
						self.should_exclude = True
						return
				
		def when_it_arrived(self, p: Printer) -> bool:
				# Fills in the 'arrived' value for self.computed_info
				if self.incomings:
						incoming_pkg = self.incomings[-1]
						arrived_date = incoming_pkg['created_date']
						self.computed_info['arrived'] = {
								'reason': 'incoming',
								'date': arrived_date
						}
						return True
				
				if not self.pkg:
						p.warn(f'package {self.package_id} neither has an incoming package nor a regular "inventory" package')
						return False
				
				self.computed_info['arrived'] = {
						'reason': 'ownership',
						'date': self.pkg['packaged_date']
				}
				return True 
				
		def run_is_sold_logic(self, p: Printer) -> bool:
				# Fills in the 'sold' value for self.computed_info
				#
				# Tells us when a package was sold
				sold_threshold = 0.9
				
				# It's only considered sold if it was an incoming package
				# and we see there are sales transactions.
				
				if not self.incomings:
						return False
				
				if not self.sales_txs:
						return False
				
				if len(self.incomings) > 1:
						p.warn(f'package #{self.package_id} has multiple incoming transfers', package_id=self.package_id)
						
				incoming_pkg = self.incomings[-1]
				arrived_date = incoming_pkg['created_date']
				if not incoming_pkg['shipped_quantity'] or numpy.isnan(incoming_pkg['shipped_quantity']):
						p.warn(f'package #{self.package_id} does not have a shipped quantity', package_id=self.package_id)
						return False
						
				shipped_quantity = int(incoming_pkg['shipped_quantity'])
				price_of_pkg = incoming_pkg['shipper_wholesale_price']
				
				lines = []
				verbose = p.verbose
				
				if verbose:
						lines.append(f'Arrived {date_to_str(arrived_date)} with quantity {shipped_quantity}')
				
				self.sales_txs.sort(key = lambda x: x['sales_datetime'])
				amount_sold = 0
				is_sold = False
				is_sold_datetime = None
				revenue_from_pkg = 0
				
				for tx in self.sales_txs:
						if verbose:
								lines.append(f"On {date_to_str(tx['sales_datetime'])} sold {tx['tx_quantity_sold']} ({tx['tx_unit_of_measure']}) for ${tx['total_price']}")
						amount_sold += tx['tx_quantity_sold']
						revenue_from_pkg += tx['total_price']
						
						if not is_sold and (amount_sold / shipped_quantity) > sold_threshold:
								if verbose:
										lines.append(f'More than {sold_threshold * 100}% was sold, therefore we consider it sold')
								is_sold = True
								is_sold_date = tx['sales_datetime']
				
				profit_margin = '{:.2f}'.format((revenue_from_pkg - price_of_pkg) / revenue_from_pkg * 100)
						
				if is_sold:
						days_delta = (is_sold_date - arrived_date).days
						
						# (Revenue - Expenses) / Revenue
						#print(f'Revenue {revenue_from_pkg}')
						#print(f'Price {price_of_pkg}')
						lines.insert(0, f'Package #{self.package_id} took {days_delta} days to sell with profit margin {profit_margin}%')
						self.computed_info['sold'] = {
								'date': is_sold_date
						}
				else:
						lines.insert(0, f'Package #{self.package_id} has current profit margin {profit_margin}%')
				
				p.info('\n'.join(lines))
						
				return is_sold
		
		def compute_additional_fields(self, run_filter: bool, p: Printer) -> None:
				if run_filter:
						self.filter_out_unhandled_packages(p)
						
				if self.should_exclude:
						return
				
				self.when_it_arrived(p)
				self.run_is_sold_logic(p)
				
		
def get_histories(d: Download) -> Dict[str, PackageHistory]:
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
				
		
		for pkg_r in d.packages_records:
				package_id = pkg_r['package_id']
				if package_id not in package_id_to_history:
						package_id_to_history[package_id] = PackageHistory(package_id)
						
				history = package_id_to_history[package_id]
				history.pkg = pkg_r
				
		for tx_r in d.sales_tx_records:
				package_id = tx_r['tx_package_id']
				if package_id not in package_id_to_history:
						package_id_to_history[package_id] = PackageHistory(package_id)
						
				history = package_id_to_history[package_id]
				history.sales_txs.append(tx_r)
				
		return package_id_to_history

##### DEBUG ######

def print_counts(id_to_history: Dict[str, PackageHistory]) -> None:
		only_incoming = 0
		only_outgoing = 0
		outgoing_and_incoming = 0
		in_and_sold_at_least_once = 0
		in_and_sold_many_times = 0
		current_inventory = 0
		inventory_with_no_transfers = 0
		total_seen = 0

		for package_id, history in id_to_history.items():
				if history.outgoings and not history.incomings:
						only_outgoing += 1

				if history.incomings and not history.outgoings and not history.sales_txs:
						only_incoming += 1

				if history.pkg:
						current_inventory += 1
						
				if history.incomings and history.sales_txs:
						in_and_sold_at_least_once += 1
						
				if history.incomings and len(history.sales_txs) > 1:
						#print(f'Package ID {package_id} was sold multiple times')
						in_and_sold_many_times += 1
						
				if history.outgoings and history.incomings:
						outgoing_and_incoming += 1
						
				if history.pkg and not history.outgoings and not history.incomings:
						inventory_with_no_transfers += 1

				total_seen += 1

		print(f'Only outgoing: {only_outgoing}')
		print(f'Only incoming: {only_incoming}')
		print(f'In and out: {outgoing_and_incoming}')
		print(f'In and sold at least once {in_and_sold_at_least_once}')
		print(f'In and sold many times {in_and_sold_many_times}')
		print(f'Inventory no transfers: {inventory_with_no_transfers}')
		print(f'Cur inventory: {current_inventory}')
		print(f'Total pkgs: {total_seen}')

def create_inventory_xlsx(
	id_to_history: Dict[str, PackageHistory], q: Query) -> None:
		
		i = 0
		num_excluded = 0
		num_total = 0
		max_to_see = -1
		p = Printer(verbose=False, show_info=False)
		
		for package_id, history in id_to_history.items():
				history.compute_additional_fields(run_filter=True, p=p)
				num_total += 1
				if history.should_exclude:
						num_excluded += 1
						
				if max_to_see > 0 and i >= max_to_see:
						# NOTE: remove this break, using this so I can debug 1 package
						# at a time
						break
						
				i += 1

		wb = excel_writer.WorkbookWriter(xlwt.Workbook())
		
		for inventory_date in q.inventory_dates:
				sheet_name = inventory_date.replace('/', '-')
				sheet = wb.add_sheet(sheet_name)
				
				# Determine whether this package belongs in the inventory for this date
				first = True
				
				for package_id, history in id_to_history.items():
						if history.should_exclude:
								continue
								
						if not history.in_inventory_at_date(inventory_date):
								continue
								
						if first:
								sheet.add_row(history.get_inventory_column_names())
								first = False
						
						row = history.get_inventory_output_row()
						sheet.add_row(row)
		 
		filepath = f'{q.company_name}_inventory_by_month.xls'
		with open(filepath, 'wb') as f:
				wb.save(f)
				print('Wrote result to {}'.format(filepath))
				
		pct_excluded = '{:.2f}'.format(num_excluded / num_total * 100)
		print(f'Excluded {num_excluded} / {num_total} packages from consideration ({pct_excluded}%)')
