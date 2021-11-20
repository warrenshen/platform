import datetime
import logging
import math
import numpy
import xlwt

from typing import Any, Dict, List, Sequence, Tuple, Union, Iterable, Set, cast
from mypy_extensions import TypedDict
from pathlib import Path

from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue
from bespoke.finance.types import finance_types
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisContext,
	AnalysisParamsDict,
	CogsSummaryDict
)
from bespoke.inventory.analysis.shared.inventory_common_util import (
	safe_isnan, is_not_number
)
from bespoke.inventory.analysis.shared.download_util import Download
from bespoke.inventory.analysis.shared.package_history import PackageHistory

MonthSummaryDict = TypedDict('MonthSummaryDict', {
	'cogs': float,
	'revenue': float,
	'num_transactions_with_price_info': int,
	'num_transactions_total': int,
})

def get_cogs_summary_columns() -> List[str]:
	return [
		'year_month', 'revenue', 'cogs', 'margin_$', 'margin_%',
		'txs_with_incoming', 'num_txs', 'coverage'
	]

def _to_cogs_summary_rows(year_month_to_summary: Dict[finance_types.Month, MonthSummaryDict]) -> List[List[CellValue]]:
	keys = list(year_month_to_summary.keys())
	keys.sort(key=lambda x: datetime.date(year=x.year, month=x.month, day=1))

	rows: List[List[CellValue]] = []
	rows.append(cast(List[CellValue], get_cogs_summary_columns()))
	for key in keys:
		summary = year_month_to_summary[key]

		margin_pct = 0.0
		if not math.isclose(summary['revenue'], 0.0):
			margin_pct = (summary['revenue'] - summary['cogs']) / summary['revenue']

		txs_with_incoming = summary['num_transactions_with_price_info']
		num_txs = summary['num_transactions_total']
		coverage = 0.0
		if not math.isclose(num_txs, 0.0):
			coverage = txs_with_incoming / num_txs

		row: List[CellValue] = [
			'{}-{}'.format(key.year, str(key.month).zfill(2)),
			round(summary['revenue'], 2),
			round(summary['cogs'], 2),
			round(summary['revenue'] - summary['cogs'], 2),
			round(margin_pct, 2),

			txs_with_incoming,
			num_txs,
			round(coverage, 2)
		]
		rows.append(row)

	return rows

def _get_empty_cogs_row(date_str: str) -> List[CellValue]:
	return [
		date_str,
		0.0,
		0.0,
		0.0,
		0.0,

		0.0,
		0.0,
		0.0
	]

BottomsupDetailsDict = TypedDict('BottomsupDetailsDict', {
	'bottomsup_cogs_rows': List[List[CellValue]],
	'bottomsup_total_cogs': float,
	'pct_transactions_with_cost': float,
	'avg_monthly_cogs': float,
	'avg_monthly_revenue': float
})

def _create_cogs_summary_for_all_dates(
	package_id_to_history: Dict[str, PackageHistory],
	params: AnalysisParamsDict,
	debug_package_id: str,
	debug_profit_threshold: float
) -> BottomsupDetailsDict:

	year_month_to_summary: Dict[finance_types.Month, MonthSummaryDict] = {}

	def _get_dummy_summary() -> MonthSummaryDict:
		return MonthSummaryDict(
				cogs=0.0,
				revenue=0.0,
				num_transactions_with_price_info=0,
				num_transactions_total=0
		)

	def _get_summary(cur_date: datetime.date) -> MonthSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = MonthSummaryDict(
				cogs=0.0,
				revenue=0.0,
				num_transactions_with_price_info=0,
				num_transactions_total=0
			)

		return year_month_to_summary[month]

	def _calculate_cogs_for_package(
		history: PackageHistory, add_to_summary: bool, increase_cost_by_quantity: bool = False) -> float:
		has_price_info = len(history.incomings) > 0
		per_unit_cost = 0.0
		if has_price_info:
			incoming_pkg = history.incomings[-1]
			if is_not_number(incoming_pkg['price']) or is_not_number(incoming_pkg['quantity']):
				per_unit_cost = 0.0
			elif increase_cost_by_quantity:
				per_unit_cost = incoming_pkg['price'] # The price is the price for one quantity when using this flag
			elif incoming_pkg['quantity'] > 0:
				per_unit_cost = incoming_pkg['price'] / incoming_pkg['quantity']

		pkg_revenue = 0.0
		pkg_cogs = 0.0

		for sales_tx in history.sales_txs:
			summary = _get_summary(sales_tx['sales_date']) if add_to_summary else _get_dummy_summary()

			cur_revenue = 0.0
			if not safe_isnan(sales_tx['tx_total_price']):
				summary['revenue'] += sales_tx['tx_total_price']
				cur_revenue = sales_tx['tx_total_price']
				pkg_revenue += cur_revenue

			summary['num_transactions_total'] += 1
			if has_price_info:
				cur_cogs = sales_tx['tx_quantity_sold'] * per_unit_cost 
				summary['cogs'] += cur_cogs
				summary['num_transactions_with_price_info'] += 1
				pkg_cogs += cur_cogs

		if pkg_revenue:
			pkg_profit_margin = round(1 - (pkg_cogs / pkg_revenue), 2)
		else:
			pkg_profit_margin = 0.0

		if debug_package_id or (debug_profit_threshold and pkg_profit_margin > debug_profit_threshold):
			inferred_str = ' INFERRED' if history.are_prices_inferred else ''
			print('PKG PROFIT MARGIN{} {}. ID={}, incoming as {}'.format(
				inferred_str, pkg_profit_margin, history.package_id,
				history.incomings[-1]['unit_of_measure']))

		return pkg_profit_margin


	cogs_analysis_params = params.get('cogs_analysis_params')
	if not cogs_analysis_params:
		cogs_analysis_params = {
			'readjust_profit_threshold': None,
			'readjust_type': ''
		}

	readjust_profit_threshold = cogs_analysis_params.get('readjust_profit_threshold')
	readjust_type = cogs_analysis_params.get('readjust_type', '')
	total_packages = 0
	total_packages_filtered = 0

	if debug_package_id:
		_calculate_cogs_for_package(package_id_to_history[debug_package_id], add_to_summary=True)
	else:
		for package_id, history in package_id_to_history.items():
			total_packages += 1
			# This first call is to just calculate the profit margin before we make
			# any updates to the COGs summary
			pkg_profit_margin = _calculate_cogs_for_package(history, add_to_summary=False)			
			#print('Profit of {} on {}'.format(pkg_profit_margin, package_id))
			above_profit_threshold = pkg_profit_margin > readjust_profit_threshold if readjust_profit_threshold else False
			should_skip = False
			increase_cost_by_quantity = False

			if readjust_type == 'remove':
				should_skip = bool(readjust_profit_threshold) and above_profit_threshold
			elif readjust_type == 'adjust':
				# If the profit threshold is very high (say above 90 to 95%) its likely
				# that this number is misreported in Metrc, and that the cost is really
				# a per unit cost, not the cost of the entire package.	
				increase_cost_by_quantity = bool(readjust_profit_threshold) and above_profit_threshold
			elif readjust_type == '':
				pass
			else:
				raise Exception('Invalid readjust_type provided in the cogs_analysis_params. Got {}. Valid options are "remove" or "adjust"'.format(
					readjust_type))

			if not should_skip:
				_calculate_cogs_for_package(
					history, 
					add_to_summary=True, 
					increase_cost_by_quantity=increase_cost_by_quantity
				)
			else:
				total_packages_filtered += 1

	if readjust_type == 'remove':
		logging.info('{}% packages filtered from COGS analysis ({} / {}) due to having a profit margin above {}'.format(
			round(total_packages_filtered / total_packages * 100, 2),
			total_packages_filtered, 
			total_packages, 
			readjust_profit_threshold
		))

	bottomsup_total_cogs = 0.0
	num_transactions_total = 0
	num_transactions_with_price_info = 0

	month_keys = list(year_month_to_summary.keys())
	month_keys.sort(key=lambda x: datetime.date(year=x.year, month=x.month, day=1))

	for month in month_keys:
		summary = year_month_to_summary[month]
		bottomsup_total_cogs += summary['cogs']
		num_transactions_total += summary['num_transactions_total']
		num_transactions_with_price_info += summary['num_transactions_with_price_info']

	trailing_twelve_month_keys = month_keys[-12:]
	sum_monthly_cogs = []
	sum_monthly_revenue = []
	for month in trailing_twelve_month_keys:
		sum_monthly_cogs.append(year_month_to_summary[month]['cogs'])
		sum_monthly_revenue.append(year_month_to_summary[month]['revenue'])

	avg_monthly_cogs = sum(sum_monthly_cogs) / len(sum_monthly_cogs)
	avg_monthly_revenue = sum(sum_monthly_revenue) / len(sum_monthly_revenue)

	pct_txs_with_cost = 0.0
	if num_transactions_total > 0.0:
		pct_txs_with_cost = round(num_transactions_with_price_info / num_transactions_total * 100, 2)

	return BottomsupDetailsDict(
		bottomsup_cogs_rows=_to_cogs_summary_rows(year_month_to_summary),
		bottomsup_total_cogs=bottomsup_total_cogs,
		avg_monthly_cogs=avg_monthly_cogs,
		avg_monthly_revenue=avg_monthly_revenue,
		pct_transactions_with_cost=pct_txs_with_cost
	)

TopdownDetailsDict = TypedDict('TopdownDetailsDict', {
	'topdown_cogs_rows': List[List[CellValue]],
	'topdown_total_cogs': float
})

def _create_top_down_cogs_summary_for_all_dates(
	d: Download,
	params: AnalysisParamsDict
) -> TopdownDetailsDict:

	year_month_to_summary: Dict[finance_types.Month, MonthSummaryDict] = {}

	def _get_summary(cur_date: datetime.date) -> MonthSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = MonthSummaryDict(
				cogs=0.0,
				revenue=0.0,
				num_transactions_with_price_info=0,
				num_transactions_total=0
			)

		return year_month_to_summary[month]

	incoming_pkg_ids_seen = set([])

	for incoming_pkg in d.incoming_records:
		if incoming_pkg['shipment_package_state'] == 'Returned':
			continue

		if not incoming_pkg['received_date']:
			continue

		summary = _get_summary(incoming_pkg['received_date'])
		
		if not safe_isnan(incoming_pkg['price']):
			summary['cogs'] += incoming_pkg['price']

		incoming_pkg_ids_seen.add(incoming_pkg['package_id'])

	for sales_tx in d.sales_tx_records:
		summary = _get_summary(sales_tx['sales_date'])
		
		if not safe_isnan(sales_tx['tx_total_price']):
			summary['revenue'] += sales_tx['tx_total_price']

		summary['num_transactions_total'] += 1
		has_price_info = sales_tx['tx_package_id'] in incoming_pkg_ids_seen
		if has_price_info:
			summary['num_transactions_with_price_info'] += 1

	topdown_total_cogs = 0.0

	for month, summary in year_month_to_summary.items():
		topdown_total_cogs += summary['cogs']

	return TopdownDetailsDict(
		topdown_cogs_rows=_to_cogs_summary_rows(year_month_to_summary),
		topdown_total_cogs=topdown_total_cogs
	)

def write_cogs_xlsx(
	ctx: AnalysisContext,
	topdown_cogs_rows: List[List[CellValue]],
	bottoms_up_cogs_rows: List[List[CellValue]],
	company_name: str) -> None:

	wb = excel_writer.WorkbookWriter(xlwt.Workbook())

	topdown_sheet = wb.add_sheet('Topdown')
	all_date_set = set([])
	date_to_topdown_row = {}
	for i in range(len(topdown_cogs_rows)):
		row = topdown_cogs_rows[i]
		if i != 0:
			date_to_topdown_row[row[0]] = row
			all_date_set.add(cast(str, row[0]))

	bottomsup_sheet = wb.add_sheet('Bottomsup')
	date_to_bottomsup_row = {}
	for i in range(len(bottoms_up_cogs_rows)):
		row = bottoms_up_cogs_rows[i]
		if i != 0:
			date_to_bottomsup_row[row[0]] = row
			all_date_set.add(cast(str, row[0]))

	all_dates = list(all_date_set)
	all_dates.sort()

	delta_sheet = wb.add_sheet('Delta')

	header_row = get_cogs_summary_columns()
	topdown_sheet.add_row(header_row)
	bottomsup_sheet.add_row(header_row)
	delta_sheet.add_row(header_row)

	for date_str in all_dates:

		topdown_row = date_to_topdown_row.get(date_str, _get_empty_cogs_row(date_str))
		bottomsup_row = date_to_bottomsup_row.get(date_str, _get_empty_cogs_row(date_str))

		delta_row = [topdown_row[0]]

		for j in range(len(topdown_row)):
			if j == 0:
				continue

			delta_row.append(cast(float, topdown_row[j]) - cast(float, bottomsup_row[j]))

		topdown_sheet.add_row(topdown_row)
		bottomsup_sheet.add_row(bottomsup_row)
		delta_sheet.add_row(delta_row)

	Path('out').mkdir(parents=True, exist_ok=True)

	filepath = ctx.get_output_path(f'reports/{company_name}_cogs_summary.xls')
	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))

def create_cogs_summary(
	d: Download,
	ctx: AnalysisContext,
	id_to_history: Dict[str, PackageHistory], 
	params: AnalysisParamsDict,
	debug_package_id: str = None,
	debug_profit_threshold: float = None
	) -> CogsSummaryDict:
	topdown_details = _create_top_down_cogs_summary_for_all_dates(
			d, params 
	)

	bottomsup_details = _create_cogs_summary_for_all_dates(
		id_to_history, params, 
		debug_package_id=debug_package_id, 
		debug_profit_threshold=debug_profit_threshold
	)

	return CogsSummaryDict(
		topdown_cogs_rows=topdown_details['topdown_cogs_rows'],
		bottomsup_cogs_rows=bottomsup_details['bottomsup_cogs_rows'],
		pct_transactions_with_cost=bottomsup_details['pct_transactions_with_cost'],
		avg_monthly_cogs=bottomsup_details['avg_monthly_cogs'],
		avg_monthly_revenue=bottomsup_details['avg_monthly_revenue'],
		bottomsup_total_cogs=bottomsup_details['bottomsup_total_cogs'],
		topdown_total_cogs=topdown_details['topdown_total_cogs']
	)
