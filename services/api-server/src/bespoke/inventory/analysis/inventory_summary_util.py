import datetime
import logging
import xlwt
from sqlalchemy.orm.session import Session
from typing import List, Any, cast

from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisSummaryDict
)
from bespoke.db import models

DEFAULT_METHODOLOGY = 'noflags_v1'

def _underscore(s: str) -> str:
	return '_' if s else ''

def _get_methodology(summary: AnalysisSummaryDict) -> str:
	params = summary['analysis_params']

	if not params['find_parent_child_relationships'] and \
		not params['use_prices_to_fill_missing_incoming'] and \
		not params['use_margin_estimate_config']:
		return DEFAULT_METHODOLOGY			

	approach = ''
	if params['find_parent_child_relationships']:
		approach += _underscore(approach) + 'parent'

	if params['use_prices_to_fill_missing_incoming']:
		approach += _underscore(approach) + 'pricing_table'

	if params['use_margin_estimate_config']:
		approach += _underscore(approach) + 'margin_estimate'

	return approach

def write_summary_to_db(
	cur_date: datetime.date, summary: AnalysisSummaryDict, session: Session) -> None:
	
	methodology = _get_methodology(summary)
	inventory_res = summary['compare_inventory_results']
	cogs_summary = summary['cogs_summary']

	db_summary = models.MetrcAnalysisSummary()
	db_summary.company_id = cast(Any, summary['company_info']['company_id'])
	db_summary.date = cur_date
	db_summary.methodology = methodology
	db_summary.default_methodology = DEFAULT_METHODOLOGY
	db_summary.counts_payload = {
		'pct_packages_excluded': summary['counts_analysis']['pct_excluded'],
		'timing_info': summary['timing_info']
	}
	db_summary.inventory_accuracy_payload = {
		'pct_inventory_matching': inventory_res['pct_inventory_matching'],
		'pct_accuracy_of_quantity': inventory_res['pct_accuracy_of_quantity'],
		'pct_inventory_overestimate': inventory_res['pct_inventory_overestimate'],
		'pct_quantity_overestimated': inventory_res['pct_quantity_overestimated']
	}
	db_summary.inventory_payload = {
		'current_inventory_value':	inventory_res['current_inventory_value'],
	}

	db_summary.cogs_revenue_payload = {
		'pct_transactions_with_cost':	cogs_summary['pct_transactions_with_cost'],
		'topdown_total_cogs':	cogs_summary['topdown_total_cogs'],
		'bottomsup_total_cogs':	cogs_summary['bottomsup_total_cogs'],
		'avg_monthly_cogs':	cogs_summary['avg_monthly_cogs'],
		'avg_monthly_revenue':	cogs_summary['avg_monthly_revenue'],
	}
	db_summary.stale_info_payload = {
		'current_nonstale_inventory_value': inventory_res['current_nonstale_inventory_value'],
		'pct_stale_packages': inventory_res['pct_stale_packages']
	}

	prev = session.query(models.MetrcAnalysisSummary).filter(
		models.MetrcAnalysisSummary.company_id == summary['company_info']['company_id']
	).filter(
		models.MetrcAnalysisSummary.date == cur_date
	).filter(
		models.MetrcAnalysisSummary.methodology == methodology
	).first()

	if prev:
		prev.counts_payload = db_summary.counts_payload
		prev.inventory_accuracy_payload = db_summary.inventory_accuracy_payload
		prev.cogs_revenue_payload = db_summary.cogs_revenue_payload
		prev.stale_info_payload = db_summary.stale_info_payload
	else:
		session.add(db_summary)

def write_excel_for_summaries(summaries: List[AnalysisSummaryDict], cur_date: datetime.date) -> None:
	
	wb = excel_writer.WorkbookWriter(xlwt.Workbook())
	summary_sheet = wb.add_sheet('Summary')

	rows: List[List[CellValue]] = []
	rows.append(
		[
			'company_name', 
			'identifier', 
		  'uses_pricing_table', 
		  'uses_parenting',

		 	# Counts
		 	'pct_excluded', 
		 	'counts_summary',

		 # Inventory
		 'pct_inventory_match', 
		 'pct_accuracy_of_quantity',
		 'pct_inventory_overestimate', 
		 'pct_quantity_overestimated',
		 
		 # Revenue
		 # want a inventory_turnover = yearly COGS / inventory_valuation
		 'pct_transactions_with_cost',
		 'topdown_total_cogs', 
		 'bottomsup_total_cogs',
		 'avg_monthly_cogs',
		 'avg_monthly_revenue',
		 'current_inventory_value', 
		 'cogs_reconciled_delta_as_pct', 
		 'cogs_summary',

		 # Stale report
		 'current_nonstale_inventory_value',
		 'pct_stale_packages'
		])

	company_names = set([])

	for summary in summaries:
		company_info = summary['company_info']
		company_names.add(company_info['company_name'])
		cur_params = summary['analysis_params']

		row: List[CellValue] = [
			company_info['company_name'],
			company_info['company_identifier'],
			'true' if cur_params['use_prices_to_fill_missing_incoming'] else '',
			'true' if cur_params['find_parent_child_relationships'] else ''
		]

		count_row: List[CellValue] = [
			summary['counts_analysis']['pct_excluded'], 
			''
		]

		inventory_res = summary['compare_inventory_results']
		inventory_row: List[CellValue] = [
			inventory_res['pct_inventory_matching'],
			inventory_res['pct_accuracy_of_quantity'],
			inventory_res['pct_inventory_overestimate'],
			inventory_res['pct_quantity_overestimated']
		]

		cogs_summary = summary['cogs_summary']
		numer = (cogs_summary['bottomsup_total_cogs'] + inventory_res['current_inventory_value']) - cogs_summary['topdown_total_cogs']
		denom = cogs_summary['topdown_total_cogs']
		cogs_reconciled_delta_as_pct = numer / denom * 100

		revenue_row: List[CellValue] = [
			cogs_summary['pct_transactions_with_cost'],
			cogs_summary['topdown_total_cogs'],
			cogs_summary['bottomsup_total_cogs'],
			cogs_summary['avg_monthly_cogs'],
			cogs_summary['avg_monthly_revenue'],
			inventory_res['current_inventory_value'],
			round(cogs_reconciled_delta_as_pct, 2),
			''
		]

		stale_info_row: List[CellValue] = [
			inventory_res['current_nonstale_inventory_value'],
			inventory_res['pct_stale_packages']
		]

		row.extend(count_row)
		row.extend(inventory_row)
		row.extend(revenue_row)
		row.extend(stale_info_row)
		rows.append(row)

	for row in rows:
		summary_sheet.add_row(row)

	if not company_names:
		logging.error('No company summaries were generated successfully')
		return

	for_one_company = len(company_names) == 1
	company_name = list(company_names)[0]

	if for_one_company:
		filepath = f'out/{company_name}_analysis_summary.xls'
	else:
		filepath = f'out/many_companies_analysis_summary_{cur_date.isoformat()}.xls'

	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))
