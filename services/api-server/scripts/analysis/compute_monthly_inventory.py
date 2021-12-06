"""
This script demonstrates how to access the database outside of application context.
It demands the 'DATABASE_URL' environment be set to connect to the database.
For example:

DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/0000_example.py

When we run this script, we want to process the inventory, valuation for many customers
for their entire history.

	out/
		company_identifier1/results.txt
												graphs.png
		company_identifier2.results.txt
												graphs.png

		summary.xls

Steps to run it:

1. Download all dataframes, save them

python scripts/analysis/compute_monthly_inventory.py --input_file=<.xlsx> --download_only --save_dataframes --max_workers=5

2. Run the code for all customers

python scripts/analysis/compute_monthly_inventory.py --input_file=<.xlsx> --use_cached_dataframes --max_workers=1

3. If some succeeded, some failed and you need to make code edits, use:

python scripts/analysis/compute_monthly_inventory.py --input_file=<.xlsx> --use_cached_dataframes --use_cached_summaries --max_workers=1

"""
import argparse
import concurrent
import datetime
import json
import logging
import os
import sys
import time
import logging
import traceback
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from os import path
from mypy_extensions import TypedDict
from typing import List, Dict, Any, cast
from sqlalchemy.orm.session import Session
# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.excel import excel_reader
from bespoke.inventory.analysis.shared import package_history, download_util
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis import inventory_cogs_util as cogs_util
from bespoke.inventory.analysis import inventory_valuations_util as valuations_util
from bespoke.inventory.analysis import inventory_summary_util
from bespoke.inventory.analysis import stale_inventory_util
from bespoke.inventory.analysis.shared.inventory_types import (
	Query,
	AnalysisContext,
	ReadParams,
	WriteOutputParams,
	AnalysisParamsDict,
	AnalysisSummaryDict
)

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
					datefmt='%m/%d/%Y %H:%M:%S',
					level=logging.INFO)
dotenv_path = os.path.join(os.environ.get('SERVER_ROOT_DIR', '.'), '.env')
load_dotenv(dotenv_path)

def _run_analysis_for_customer(d: download_util.Download, ctx: AnalysisContext, q: Query, params: AnalysisParamsDict) -> AnalysisSummaryDict:
	## Analyze counts for the dataset
	logging.info('Analyzing counts for {}'.format(q.company_name))
	today_date = date_util.load_date_str(q.inventory_dates[-1]) # the most recent day is the one we want to compare the actual inventory to.
	
	before = time.time()
	id_to_history = util.get_histories(d, params=params)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for get_histories')

	before = time.time()
	util.print_counts(ctx, id_to_history)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for print_counts')

	before = time.time()
	util.run_orphan_analysis(d, ctx, id_to_history, params)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for orphan analysis')

	before = time.time()
	counts_analysis_dict = util.create_inventory_xlsx(d, ctx, id_to_history, q, params=params)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for create_inventory_xlsx')

	## Compute accuracy numbers for COGS and inventory
	logging.info('Computing inventory for {}'.format(q.company_name))
	
	# TODO(dlluncor): This is actually duplicated logic which is already run
	# in create_inventory_xlsx
	before = time.time()
	computed_resp = util.compute_inventory_across_dates(
			d, q.inventory_dates, params
	)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for compute_inventory_across_dates')

	before = time.time()
	today_date_str = today_date.strftime('%m/%d/%Y')
	compare_inventory_res = util.compare_computed_vs_actual_inventory(
			ctx=ctx,
			computed=computed_resp['date_to_computed_inventory_dataframe'][today_date_str],
			actual=d.inventory_packages_dataframe,
			params=params,
			compare_options={
					'num_errors_to_show': 10,
					'accept_computed_when_sold_out': True
			}
	)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for compare_computed_vs_actual_inventory')

	before = time.time()
	cogs_summary = cogs_util.create_cogs_summary(d, ctx, id_to_history, params)
	cogs_util.write_cogs_xlsx(
		ctx=ctx,
		topdown_cogs_rows=cogs_summary['topdown_cogs_rows'], 
		bottoms_up_cogs_rows=cogs_summary['bottomsup_cogs_rows'],
		company_name=q.company_name
	)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for create_cogs_summary')

	before = time.time()
	stale_inventory_util.compute_stale_inventory(d, ctx, params)
	after = time.time()
	ctx.log_timing(f'Took {round(after - before, 2)} seconds for compute_stale_inventory')

	# Plot graphs
	# TODO(dlluncor): Has to happen in the main thread to plot these graphs
	#valuations_util.plot_inventory_and_revenue(
	#		q=q,
	#		sales_receipts_dataframe=d.sales_receipts_dataframe,
	#		inventory_valuations=computed_resp['inventory_valuations']
	#)

	return AnalysisSummaryDict(
		company_name=q.company_name,
		company_identifier=q.company_identifier,
		analysis_params=params,
		counts_analysis=counts_analysis_dict,
		compare_inventory_results=compare_inventory_res,
		cogs_summary=cogs_summary
	)

def _get_params_list() -> List[util.AnalysisParamsDict]:

	# Default args, no inference
	params = util.AnalysisParamsDict(
		sold_threshold=package_history.DEFAULT_SOLD_THRESHOLD,
		find_parent_child_relationships=False,
		use_prices_to_fill_missing_incoming=False,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None,
		stale_inventory_params=None
	)
	"""
	# COGS add the flag 
	params2 = util.AnalysisParamsDict(
		sold_threshold=package_history.DEFAULT_SOLD_THRESHOLD,
		find_parent_child_relationships=False,
		use_prices_to_fill_missing_incoming=False,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params={
			'readjust_profit_threshold': 0.9,
			'readjust_type': 'remove'
		}
	)
	"""
	return [params]

CompanyInputDict = TypedDict('CompanyInputDict', {
	'company_name': str,
	'company_identifier': str,
	'license_numbers': List[str],
	'start_date': datetime.date
})

ArgsDict = TypedDict('ArgsDict', {
	'download_only': bool,
	'dry_run': bool,
	'save_dataframes': bool,
	'use_cached_dataframes': bool,
	'use_cached_summaries': bool
})

def _compute_inventory_for_customer(
	company_input: CompanyInputDict, 
	args_dict: ArgsDict) -> List[AnalysisSummaryDict]:

	initial_before = time.time()

	company_name = company_input['company_name']
	company_identifier = company_input['company_identifier']
	transfer_packages_start_date = company_input['start_date'].strftime('%Y-%m-%d')
	sales_transactions_start_date = company_input['start_date'].strftime('%Y-%m-%d')
	license_numbers = company_input['license_numbers']

	# We dont want to mix up when we do dry runs with all the valuable
	# information we store when --pull_all_data is set
	if args_dict['dry_run']:
		output_root_dir = 'out/dryrun/{}'.format(company_identifier)
	else:
		output_root_dir = 'out/{}'.format(company_identifier)

	ctx = AnalysisContext(
		output_root_dir=output_root_dir,
		read_params=ReadParams(
			use_cached_dataframes=args_dict['use_cached_dataframes']
		),
		write_params=WriteOutputParams(
			save_download_dataframes=args_dict['save_dataframes']
		)
	)

	if args_dict['use_cached_summaries']:
		summaries_file = ctx.get_output_path('backup/summaries.json')

		if os.path.exists(summaries_file):
			logging.info('Reading cached summaries for {}'.format(company_name))
			with open(summaries_file, 'r') as f:
				return json.loads(f.read())['summaries']

	## Setup input parameters

	today_date = datetime.date.today()

	ctx.mkdir('reports')
	ctx.mkdir('download')
	ctx.mkdir('backup')
	with open(ctx.get_output_path('log.txt'), 'w') as f:
		f.write('')

	with open(ctx.get_output_path('timing.txt'), 'w') as f:
		f.write('')

	q = util.Query(
		inventory_dates=[], # gets filled in once we have the dataframes
		transfer_packages_start_date=transfer_packages_start_date,
		sales_transactions_start_date=sales_transactions_start_date,
		company_name=company_name,
		company_identifier=company_identifier,
		license_numbers=license_numbers
	)

	## Download the data
	logging.info('About to download all inventory history for {}'.format(q.company_name))

	try:
		before = time.time()
		engine = download_util.get_bigquery_engine('bigquery://bespoke-financial/ProdMetrcData')
		all_dataframes_dict = download_util.get_dataframes_for_analysis(q, ctx, engine, dry_run=args_dict['dry_run'])
		after = time.time()
		ctx.log_timing('Took {} seconds to run sql queries for {}'.format(
			round(after - before, 2), q.company_name))
		
		before = time.time()
		d = util.Download()
		d.download_dataframes(
			all_dataframes_dict, 
			sql_helper=download_util.BigQuerySQLHelper(ctx, engine),
			ctx=ctx
		)
		after = time.time()
		ctx.log_timing('\nTook {} seconds to process dataframes for {}'.format(
			round(after - before, 2), q.company_name))

		q.inventory_dates = download_util.get_inventory_dates(
			all_dataframes_dict, today_date)

		params_list = _get_params_list()
	except Exception as e:
		logging.error(f'Error downloading data for {q.company_name}. Err: {e}')
		logging.error(traceback.format_exc())
		return []

	if args_dict['download_only']:
		return []

	summaries = []

	try:
		for params in params_list:
			summaries.append(_run_analysis_for_customer(d, ctx, q, params))
	except Exception as e:
		logging.error(f'Error running analysis logic for {q.company_name}. Err: {e}')
		logging.error(traceback.format_exc())
		return []

	logging.info(f'Writing analysis summaries for {q.company_name}')
	with open(ctx.get_output_path('backup/summaries.json'), 'w') as f:
		f.write(json.dumps({
			'summaries': summaries
		}))

	initial_after = time.time()
	ctx.log_timing(f'\nTook {round(initial_after - initial_before, 2)} seconds for computing e2e summary for {q.company_name}')

	return summaries

def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument(
		'--input_file',
		help='Input file that specifies all the companies to run for',
	)

	parser.add_argument(
		'--dry_run',
		dest='dry_run',
		action='store_true',

	) # Must be set to not run in dryrun mode

	parser.add_argument(
		'--use_cached_dataframes',
		dest='use_cached_dataframes',
		action='store_true',
	) # Whether to use pre-downloaded dataframes from BigQuery

	parser.add_argument(
		'--save_dataframes',
		dest='save_dataframes',
		action='store_true',
	) # Whether to save those dataframes to a file

	parser.add_argument(
		'--use_cached_summaries',
		dest='use_cached_summaries',
		action='store_true',
	) # Whether to use the summaries we stored for a customer

	parser.add_argument(
		'--download_only',
		dest='download_only',
		action='store_true',

	) # To download data only, dont run any analysis

	parser.add_argument(
		'--max_workers',
		help='Number of max workers to use for parallel processing',
	)

	parser.add_argument(
		'--company_identifier',
		help='The single company to run this script for'
	) # Whether to use the summaries we stored for a customer

	args = parser.parse_args()

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(args.input_file)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	dry_run = True if args.dry_run else False

	company_inputs = []
	for i in range(len(sheet['rows'])):
		if i == 0:
			# skip header
			continue

		row = cast(List[Any], sheet['rows'][i])
		company_name = row[0].strip()
		company_identifier = row[1].strip()

		if args.company_identifier and company_identifier != args.company_identifier:
			continue

		company_inputs.append(CompanyInputDict(
			company_name=company_name,
			company_identifier=company_identifier,
			license_numbers=[el.strip() for el in row[2].strip().split(';')],
			start_date=row[3]
		))

	logging.info('Processing {} companies with dry_run={}'.format(len(company_inputs), dry_run))

	index_to_summary = {}

	args_dict = ArgsDict(
		download_only=args.download_only,
		dry_run=dry_run,
		use_cached_dataframes=args.use_cached_dataframes,
		save_dataframes=args.save_dataframes,
		use_cached_summaries=args.use_cached_summaries
	)

	max_workers = int(args.max_workers) if args.max_workers else 1
	with ThreadPoolExecutor(max_workers=max_workers) as executor:
		future_to_i = {}

		for i in range(len(company_inputs)):
			company_input = company_inputs[i]
			future_to_i[executor.submit(
				_compute_inventory_for_customer, 
				company_input,
				args_dict)] = i

		for future in concurrent.futures.as_completed(future_to_i):
			summary = future.result()
			index = future_to_i[future]
			index_to_summary[index] = summary

	indices = list(index_to_summary.keys())
	indices.sort()

	summaries = []
	for index in indices:
		summaries.extend(index_to_summary[index])

	inventory_summary_util.write_excel_for_summaries(summaries)

if __name__ == "__main__":
	main()
