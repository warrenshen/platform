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
	AnalysisParamsDict
)
from bespoke.inventory.analysis.shared.download_util import Download
from bespoke.inventory.analysis.shared.package_history import PackageHistory

CogsSummaryDict = TypedDict('CogsSummaryDict', {
	'cogs': float,
	'revenue': float,
	'num_transactions_with_price_info': int,
	'num_transactions_total': int,
})

def _to_cogs_summary_rows(year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict]) -> List[List[CellValue]]:
	keys = list(year_month_to_summary.keys())
	keys.sort(key=lambda x: datetime.date(year=x.year, month=x.month, day=1))

	rows: List[List[CellValue]] = []
	rows.append(['year_month', 'revenue', 'cogs', 'margin_$', 'margin_%',
							 'txs_with_incoming', 'num_txs', 'coverage'])
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

def create_cogs_summary_for_all_dates(
	package_id_to_history: Dict[str, PackageHistory],
	params: AnalysisParamsDict
) -> List[List[CellValue]]:

	year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict] = {}

	def _get_summary(cur_date: datetime.date) -> CogsSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = CogsSummaryDict(
				cogs=0.0,
				revenue=0.0,
				num_transactions_with_price_info=0,
				num_transactions_total=0
			)

		return year_month_to_summary[month]

	for package_id, history in package_id_to_history.items():

		# Previous COGS code
		"""
		if history.incomings and history.sales_txs:
			# Needs at least 1 sales tx to be considered part of COGS
			incoming_pkg = history.incomings[-1]
			summary = _get_summary(incoming_pkg['received_date'])
			if not numpy.isnan(incoming_pkg['shipper_wholesale_price']):
				summary['cogs'] += incoming_pkg['shipper_wholesale_price']
		"""

		has_price_info = len(history.incomings) > 0
		per_unit_cost = 0.0
		if has_price_info:
			incoming_pkg = history.incomings[-1]	
			per_unit_cost = incoming_pkg['price'] / incoming_pkg['quantity']
				
		for sales_tx in history.sales_txs:
			summary = _get_summary(sales_tx['sales_date'])
			if not numpy.isnan(sales_tx['tx_total_price']):
				summary['revenue'] += sales_tx['tx_total_price']

			summary['num_transactions_total'] += 1
			if has_price_info:
				summary['cogs'] += sales_tx['tx_quantity_sold'] * per_unit_cost 
				summary['num_transactions_with_price_info'] += 1

	return _to_cogs_summary_rows(year_month_to_summary)

def create_top_down_cogs_summary_for_all_dates(
	d: Download,
	params: AnalysisParamsDict
) -> List[List[CellValue]]:

	year_month_to_summary: Dict[finance_types.Month, CogsSummaryDict] = {}

	def _get_summary(cur_date: datetime.date) -> CogsSummaryDict:
		month = finance_types.Month(
			month=cur_date.month,
			year=cur_date.year
		)
		if month not in year_month_to_summary:
			year_month_to_summary[month] = CogsSummaryDict(
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
		
		if not numpy.isnan(incoming_pkg['shipper_wholesale_price']):
			summary['cogs'] += incoming_pkg['shipper_wholesale_price']

		incoming_pkg_ids_seen.add(incoming_pkg['package_id'])

	for sales_tx in d.sales_tx_records:
		summary = _get_summary(sales_tx['sales_date'])
		
		if not numpy.isnan(sales_tx['tx_total_price']):
			summary['revenue'] += sales_tx['tx_total_price']

		summary['num_transactions_total'] += 1
		has_price_info = sales_tx['tx_package_id'] in incoming_pkg_ids_seen
		if has_price_info:
			summary['num_transactions_with_price_info'] += 1

	return _to_cogs_summary_rows(year_month_to_summary)

def write_cogs_xlsx(
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
	delta_sheet.add_row(bottoms_up_cogs_rows[0]) # header

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

	filepath = f'out/{company_name}_cogs_summary.xls'
	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))
