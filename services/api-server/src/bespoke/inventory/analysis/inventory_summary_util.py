import logging
import xlwt
from typing import List

from bespoke.excel import excel_writer
from bespoke.excel.excel_writer import CellValue
from bespoke.inventory.analysis.shared.inventory_types import (
	AnalysisSummaryDict
)
def write_excel_for_summaries(summaries: List[AnalysisSummaryDict]) -> None:
	
	wb = excel_writer.WorkbookWriter(xlwt.Workbook())
	summary_sheet = wb.add_sheet('Summary')

	rows: List[List[CellValue]] = []
	rows.append(
		['company_name', 'identifier', 
		 'uses_pricing_table', 'uses_parenting',

		 # Counts
		 'pct_excluded', 'counts_summary',

		 # Inventory
		 'pct_inventory_match', 
		 'pct_accuracy_of_quantity',
		 'pct_inventory_overestimate', 
		 'pct_quantity_overestimated',
		 
		 # Revenue
		 # TODO(dlluncor):
		 # Average trailing 10 months of COGS * 12 = yearly COGS
		 # want a inventory_turnover = yearly COGS / inventory_valuation
		 'pct_transactions_with_cost',
		 'topdown_total_cogs', 
		 'bottomsup_total_cogs', 
		 'current_inventory_value', 
		 'cogs_reconciled_delta_as_pct', 
		 'cogs_summary'
		])

	company_names = set([])

	for summary in summaries:
		company_names.add(summary['company_name'])
		cur_params = summary['analysis_params']

		row: List[CellValue] = [
			summary['company_name'],
			summary['company_identifier'],
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
			inventory_res['current_inventory_value'],
			cogs_reconciled_delta_as_pct,
			''
		]

		row.extend(count_row)
		row.extend(inventory_row)
		row.extend(revenue_row)
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
		filepath = f'out/many_companies_analysis_summary.xls'

	with open(filepath, 'wb') as f:
		wb.save(f)
		logging.info('Wrote result to {}'.format(filepath))
