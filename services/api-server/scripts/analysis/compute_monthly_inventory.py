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
import pandas
import psutil
import ray
import sys
import time
import logging
import traceback

from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from os import path
from mypy_extensions import TypedDict
from typing import Callable, Tuple, List, Dict, Any, Iterator, cast
from sqlalchemy.orm.session import Session

from bespoke.config import config_util
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.models_util import chunker
from bespoke import errors
from bespoke.email import email_manager, sendgrid_util
from bespoke.excel import excel_reader
from bespoke.inventory.analysis.shared import (
	package_history, download_util, create_queries
)
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis import inventory_cogs_util as cogs_util
from bespoke.inventory.analysis import inventory_valuations_util as valuations_util
from bespoke.inventory.analysis import inventory_summary_util
from bespoke.inventory.analysis import stale_inventory_util
from bespoke.inventory.analysis.shared.inventory_types import (
	Query,
	DataframeDownloadContext,
	AnalysisContext,
	FacilityDetailsDict,
	ReadParams,
	WriteOutputParams,
	AnalysisParamsDict,
	AnalysisSummaryDict,
	CompanyInfoDict,
)

BIGQUERY_ENGINE_URL = 'bigquery://bespoke-financial/ProdMetrcData'
DEFAULT_START_DATE_STR = '2020-01-01'

num_cpus = psutil.cpu_count(logical=False)
ray.init(num_cpus=num_cpus)

def _setup() -> None:
	logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
					datefmt='%m/%d/%Y %H:%M:%S',
					level=logging.INFO)

	dotenv_path = os.path.join(os.environ.get('SERVER_ROOT_DIR', '.'), '.env')
	load_dotenv(dotenv_path)

_setup()
logging.info(f'Running with {num_cpus} cpus')

def _run_analysis_with_params(
		d: download_util.Download, ctx: AnalysisContext, q: Query, 
		params: AnalysisParamsDict, index: int, initial_timing_info: Dict,
		facility_details: FacilityDetailsDict) -> AnalysisSummaryDict:
	## Analyze counts for the dataset
	logging.info('Analyzing counts for {}'.format(q.company_name))
	today_date = date_util.load_date_str(q.inventory_dates[-1]) # the most recent day is the one we want to compare the actual inventory to.
	
	total_before = time.time()

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
	compute_inventory_dict = util.create_inventory_xlsx(d, ctx, id_to_history, q, params=params)
	after = time.time()
	compute_inventory_timing = round(after - before, 2)
	ctx.log_timing(f'Took {compute_inventory_timing} seconds for create_inventory_xlsx')

	## Compute accuracy numbers for COGS and inventory
	logging.info('Computing inventory for {}'.format(q.company_name))

	before = time.time()
	today_date_str = today_date.strftime('%m/%d/%Y')
	compare_inventory_res = util.compare_computed_vs_actual_inventory(
			ctx=ctx,
			computed=compute_inventory_dict['date_to_computed_inventory_dataframe'][today_date_str],
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

	total_after = time.time()

	# Plot graphs
	# TODO(dlluncor): Has to happen in the main thread to plot these graphs
	#valuations_util.plot_inventory_and_revenue(
	#		q=q,
	#		sales_receipts_dataframe=d.sales_receipts_dataframe,
	#		inventory_valuations=computed_resp['inventory_valuations'],
	#   fresh_inventory_valuations=computed_resp['fresh_inventory_valuations']
	#)
	timing_info = initial_timing_info
	timing_info['3_compute_inventory'] = compute_inventory_timing
	timing_info['run_analysis_excluding_download'] = round(total_after - total_before, 2)

	return AnalysisSummaryDict(
		company_info=CompanyInfoDict(
			company_id=q.company_id,
			company_name=q.company_name,
			company_identifier=q.company_identifier,
			index=index
		),
		facility_details=facility_details,
		timing_info=timing_info,
		analysis_params=params,
		counts_analysis=compute_inventory_dict['counts_analysis'],
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
	'company_id': str,
	'facility_details_list': List[FacilityDetailsDict],
	'start_date': datetime.date,
	'num_sales_receipts': int
})

ArgsDict = TypedDict('ArgsDict', {
	'download_only': bool,
	'dry_run': bool,
	'save_dataframes': bool,
	'use_cached_dataframes': bool,
	'use_cached_summaries': bool,
	'use_incremental_querying': bool,
	'use_facilities': bool,
	'write_to_db': bool,
	'num_threads': int
})

def _run_analysis_per_customer(
	company_input: CompanyInputDict, 
	args_dict: ArgsDict,
	index: int) -> Tuple[List[AnalysisSummaryDict], errors.Error]:

	initial_before = time.time()

	company_name = company_input['company_name']
	company_identifier = company_input['company_identifier']

	# We dont want to mix up when we do dry runs with all the valuable
	# information we store when --pull_all_data is set
	output_prefix = 'out/dryrun' if args_dict['dry_run'] else 'out'

	download_ctx = DataframeDownloadContext(
		output_root_dir=output_prefix + '/' + company_identifier,
		read_params=ReadParams(
			use_cached_dataframes=args_dict['use_cached_dataframes']
		),
		write_params=WriteOutputParams(
			save_download_dataframes=args_dict['save_dataframes']
		)
	)

	if args_dict['use_cached_summaries']:
		summaries_file = download_ctx.get_output_path('backup/summaries.json')

		if os.path.exists(summaries_file):
			logging.info('Reading cached summaries for {}'.format(company_name))
			with open(summaries_file, 'r') as f:
				return json.loads(f.read())['summaries'], None

	## Setup input parameters
	with open(download_ctx.get_output_path('log.txt'), 'w') as f:
		f.write('')

	with open(download_ctx.get_output_path('timing.txt'), 'w') as f:
		f.write('')

	today_date = datetime.date.today()
	download_ctx.mkdir('download')
	download_ctx.mkdir('backup')

	# When downloading, we want to download the data for all licenses associated
	# with the customer.
	#
	# Then, we will split up that downloaded dataframe into each set of licenses
	# that correspond to a particular facility.
	all_licenses_for_customer_set = set([])
	for facility_details in company_input['facility_details_list']:
		for license_number in facility_details['license_numbers']:
			all_licenses_for_customer_set.add(license_number)

	transfer_packages_start_date = company_input['start_date'].strftime('%Y-%m-%d')
	sales_transactions_start_date = company_input['start_date'].strftime('%Y-%m-%d')
	df_query_params = download_util.DataFrameQueryParams(
		company_identifier=company_identifier,
		transfer_packages_start_date=transfer_packages_start_date,
		sales_transactions_start_date=sales_transactions_start_date,
		license_numbers=list(all_licenses_for_customer_set)
	)

	## Download the data
	logging.info('About to download all inventory history for {}'.format(company_name))

	try:
		before = time.time()
		logging.info('ENGINE URL IS {}'.format(BIGQUERY_ENGINE_URL))
		bigquery_engine = download_util.get_bigquery_engine(BIGQUERY_ENGINE_URL)
		sql_helper = download_util.BigQuerySQLHelper(download_ctx, bigquery_engine)

		all_dataframes_dict = download_util.get_dataframes_for_analysis(
			df_query_params, download_ctx, sql_helper, 
			dry_run=args_dict['dry_run'],
			num_threads=args_dict['num_threads'],
			use_incremental_querying=args_dict['use_incremental_querying']
		)
		after = time.time()
		run_sql_queries_timing = round(after - before, 2)
		download_ctx.log_timing('Took {} seconds to run sql queries for {}'.format(run_sql_queries_timing, company_name))

		facility_and_df_list = []
		before = time.time()

		for facility_details in company_input['facility_details_list']:
			cur_dataframes_dict = download_util.restrict_dataframe_to_licenses(
				all_dataframes_dict, facility_details['name'], facility_details['license_numbers']
			)
			facility_and_df_list.append((facility_details, cur_dataframes_dict))

		after = time.time()
		download_ctx.log_timing('Took {} seconds to filter dataframes by facility licenses {}'.format(round(after - before), company_name))

	except Exception as e:
		msg = f'Error downloading data for {company_name}. Err: {e}'
		logging.error(msg)
		err = errors.Error(msg)
		err.traceback = traceback.format_exc()
		logging.error(err.traceback)
		return [], err

	if args_dict['download_only']:
		return [], None

	summaries = []

	try:

		for (facility_details, cur_dataframes_dict) in facility_and_df_list:
			# Run the analysis for each facility that is under this customer umbrella
			uses_facilities = facility_details['name'] != 'default'
			company_facility_dir = f"{company_identifier}/{facility_details['name'].replace(' ', '_')}" if uses_facilities else company_identifier

			ctx = AnalysisContext(
				output_root_dir=f'{output_prefix}/{company_facility_dir}'
			)
			ctx.mkdir('reports')

			if uses_facilities:
				# If we're not using facilites, then this log.txt and timing.txt
				# file end up being the same as the download file, and we dont
				# want to remove the timing data from there.
				with open(ctx.get_output_path('log.txt'), 'w') as f:
					f.write('')

				with open(ctx.get_output_path('timing.txt'), 'w') as f:
					f.write('')

			before = time.time()
			d = util.Download()
			d.process_dataframes(cur_dataframes_dict, ctx=ctx)
			after = time.time()
			process_dataframes_timing = round(after - before, 2)
			ctx.log_timing('\nTook {} seconds to process dataframes for {}, facility={}'.format(
				process_dataframes_timing, company_name, facility_details['name']))

			q = util.Query(
				inventory_dates=download_util.get_inventory_dates(
					all_dataframes_dict, today_date
				),
				company_id=company_input['company_id'],
				company_name=company_name,
				company_identifier=company_identifier
			)
			params_list = _get_params_list()

			for params in params_list:
				# So the Dict doesnt get copied across the multiple params runs
				initial_timing_info = {
					'0_run_sql_queries': run_sql_queries_timing,
					'1_process_dataframes': process_dataframes_timing
				}
				summary = _run_analysis_with_params(d, ctx, q, params, index, initial_timing_info, facility_details)
				summaries.append(summary)

				if args_dict['write_to_db']:
					engine = models.create_engine(is_prod_default=False)
					session_maker = models.new_sessionmaker(engine)
					with session_scope(session_maker) as session:
						inventory_summary_util.write_summary_to_db(
							cur_date=date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE),
							summary=summary,
							session=session
						)

	except Exception as e:
		msg = f'Error running analysis logic for {q.company_name}. Err: {e}'
		logging.error(msg)
		err = errors.Error(msg)
		err.traceback = traceback.format_exc()
		logging.error(err.traceback)
		return [], err

	logging.info(f'Writing analysis summaries for {company_name}')
	with open(download_ctx.get_output_path('backup/summaries.json'), 'w') as f:
		f.write(json.dumps({
			'summaries': summaries
		}))

	initial_after = time.time()
	ctx.log_timing(f'\nTook {round(initial_after - initial_before, 2)} seconds for computing e2e summary for {company_name}')

	return summaries, None

@ray.remote # type: ignore
def _run_analysis_per_customer_for_ray( # type: ignore
	company_input: CompanyInputDict, 
	args_dict: ArgsDict,
	index: int) -> Tuple[List[AnalysisSummaryDict], errors.Error]: # type: ignore
	_setup()
	return _run_analysis_per_customer(company_input, args_dict, index)

def _get_company_inputs_from_xlsx(filepath: str, restrict_to_company_indentifier: str) -> List[CompanyInputDict]:
	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(filepath)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	company_inputs = []
	for i in range(len(sheet['rows'])):
		if i == 0:
			# skip header
			continue

		row = cast(List[Any], sheet['rows'][i])
		company_name = row[0].strip()
		company_identifier = row[1].strip()

		if restrict_to_company_indentifier and company_identifier != restrict_to_company_indentifier:
			continue

		company_inputs.append(CompanyInputDict(
			company_name=company_name,
			company_identifier=company_identifier,
			company_id='',
			facility_details_list=[
				FacilityDetailsDict(
					name='default',
					facility_row_id=None,
					license_numbers=[el.strip() for el in row[2].strip().split(';')]
				)
			],
			start_date=row[3],
			num_sales_receipts=1
		))

	return company_inputs

def _get_company_inputs_from_db(restrict_to_company_indentifier: str, use_facilities: bool) -> List[CompanyInputDict]:
	bigquery_engine = download_util.get_bigquery_engine(BIGQUERY_ENGINE_URL)
	metrc_download_summary_companies_query = create_queries.create_metrc_download_summary_companies_query()
	metrc_download_summary_companies_dataframe = pandas.read_sql_query(metrc_download_summary_companies_query, bigquery_engine)
	company_records = metrc_download_summary_companies_dataframe.to_dict('records')

	# Query for licenses

	company_identifiers = []
	company_id_to_name = {}
	company_ids_set = set([])

	for company_record in company_records:
		company_identifier = company_record['identifier']

		if restrict_to_company_indentifier and company_identifier != restrict_to_company_indentifier:
			continue

		company_id = company_record['id']
		company_identifiers.append(company_identifier)
		company_id_to_name[company_id] = company_record['name']
		company_ids_set.add(company_id)

	facility_id_to_name = {}
	company_facilities_records = []

	if use_facilities:
		company_facilities_query = create_queries.create_company_facilities_query(list(company_ids_set))
		company_facilities_dataframe = pandas.read_sql_query(company_facilities_query, bigquery_engine)
		company_facilities_records = company_facilities_dataframe.to_dict('records')
		for facility_record in company_facilities_records:
			facility_id_to_name[facility_record['facility_row_id']] = facility_record['facility_name']

	company_licenses_query = create_queries.create_company_licenses_query(company_identifiers)
	company_licenses_dataframe = pandas.read_sql_query(company_licenses_query, bigquery_engine)
	company_license_records = company_licenses_dataframe.to_dict('records')

	company_to_retailer_licenses: Dict[Tuple[str, str], List[str]] = {}
	# company_id -> facility_id -> licenses
	company_id_to_licenses_by_facility_id: Dict[str, Dict[str, List[str]]] = {}

	for company_license_record in company_license_records:
		company_id = company_license_record['company_id']

		license_number = company_license_record['license_number']
		license_category = company_license_record['license_category']
		if license_category not in ['Multiple', 'Retailer']:
			continue

		if company_id not in company_to_retailer_licenses:
			company_to_retailer_licenses[company_id] = []
		
		company_to_retailer_licenses[company_id].append(license_number)

		# Populate facility details
		facility_id = company_license_record['facility_row_id']
		if not facility_id:
			# If there is no facility associated with this license, then
			# bucket it into the "default" facility ID which is not a real
			# row but a way to organize the licenses by default.
			facility_id = 'default'

		if company_id not in company_id_to_licenses_by_facility_id:
			company_id_to_licenses_by_facility_id[company_id] = {}

		license_by_facility_id = company_id_to_licenses_by_facility_id[company_id]
		if facility_id not in license_by_facility_id:
			license_by_facility_id[facility_id] = []

		license_by_facility_id[facility_id].append(license_number)

	# Build a map of the company_id to facilities they have
	company_id_to_facilities: Dict[str, List[FacilityDetailsDict]] = {}
	for company_id in company_ids_set:
		facility_ids = []
		if company_id in company_id_to_licenses_by_facility_id:
			facility_ids = list(company_id_to_licenses_by_facility_id[company_id].keys())

		has_facilities = len(facility_ids) > 0 and facility_ids != ['default']

		if use_facilities and has_facilities:
			licenses_by_facility_id = company_id_to_licenses_by_facility_id[company_id]
			cur_facilities = []
			for facility_row_id, license_numbers in licenses_by_facility_id.items():
				if facility_row_id == 'default':
					facility_name = 'default'
				else:
					facility_name = facility_id_to_name[facility_row_id]

				cur_facilities.append(FacilityDetailsDict(
					name=facility_name,
					facility_row_id=None if facility_row_id == 'default' else facility_row_id,
					license_numbers=license_numbers,
				))

			company_id_to_facilities[company_id] = cur_facilities
		else:
			license_numbers = company_to_retailer_licenses.get(company_id, [])
			company_id_to_facilities[company_id] = [
				FacilityDetailsDict(
					name='default',
					facility_row_id=None,
					license_numbers=license_numbers
				)
			]

	# Query for sales receipts
	company_count_metrc_sales_receipts_query = create_queries.create_company_count_metrc_sales_receipts_query(company_identifiers)
	company_count_metrc_sales_receipts_dataframe = pandas.read_sql_query(company_count_metrc_sales_receipts_query, bigquery_engine)
	count_sales_receipt_records = company_count_metrc_sales_receipts_dataframe.to_dict('records')
	identifier_to_receipt_count = {}

	for count_sales_receipt_record in count_sales_receipt_records:
		identifier_to_receipt_count[count_sales_receipt_record['identifier']] = count_sales_receipt_record['count'] 

	company_inputs = []
	for company_record in company_records:
		company_identifier = company_record['identifier']

		if restrict_to_company_indentifier and company_identifier != restrict_to_company_indentifier:
			continue

		company_name = company_record['name']
		company_id = company_record['id']
		license_numbers = company_to_retailer_licenses.get(company_id, [])
		if not license_numbers:
			continue
		
		num_sales_receipts = identifier_to_receipt_count.get(company_identifier, 0)
		has_sales_receipts = num_sales_receipts > 0

		if not has_sales_receipts:
			print(f'WARNING!!!')
			print(f'WARNING: found company {company_name} ({company_identifier}) with 0 sales receipts but with retailer license(s)!')
			continue

		company_inputs.append(CompanyInputDict(
			company_name=company_name,
			company_identifier=company_identifier,
			company_id=company_id,
			facility_details_list=company_id_to_facilities[company_id],
			start_date=date_util.load_date_str(DEFAULT_START_DATE_STR),
			num_sales_receipts=num_sales_receipts
		))

	return company_inputs

def main() -> None:
	parser = argparse.ArgumentParser()

	## Determines input companies to process

	parser.add_argument(
		'--input_file',
		help='Input file that specifies all the companies to run for',
	) # Specifying this flag tells us the specific companies to use
	  # if this flag is not specified, then we pull from the list of
	  # retailer licenses / companies we have in the DB

	## To speed up your re-runs

	parser.add_argument(
		'--use_cached_dataframes',
		dest='use_cached_dataframes',
		action='store_true',
	) # Whether to use pre-downloaded dataframes from BigQuery

	parser.add_argument(
		'--use_incremental_querying',
		dest='use_incremental_querying',
		action='store_true',
	) # Whether to query for additional days of data and use the cached dataframes for previously pulled data

	parser.add_argument(
		'--save_dataframes',
		dest='save_dataframes',
		action='store_true',
	) # Whether to save those dataframes to a file

	## Prod flags

	parser.add_argument(
		'--write_to_db',
		dest='write_to_db',
		action='store_true',

	) # If true, then the summaries will be written to the DB

	## Performance tuning

	parser.add_argument(
		'--num_processes',
		help='Number of max processes to use for parallel processing',
		type=int
	)

	parser.add_argument(
		'--num_threads',
		help='Number of max threads to use for parallel processing',
		type=int
	)

	## Feature flags

	parser.add_argument(
		'--use_facilities',
		dest='use_facilities',
		action='store_true',
	) # Whether to use facilities to group information about a customer

	## Debug flags

	parser.add_argument(
		'--dry_run',
		dest='dry_run',
		action='store_true',

	) # This will only query a small number of rows from the DB, for testing

	parser.add_argument(
		'--company_identifier',
		help='The single company to run this script for'
	) # Whether to use the summaries we stored for a customer


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

	args = parser.parse_args()

	if args.input_file:
		company_inputs = _get_company_inputs_from_xlsx(args.input_file, args.company_identifier)
	else:
		company_inputs = _get_company_inputs_from_db(
			args.company_identifier, args.use_facilities)

	if args.write_to_db and not os.environ.get('SENDGRID_API_KEY'):
		raise Exception('When writing to the DB, we expect to use the email client to notify us of completion')

	if args.use_incremental_querying and not args.use_cached_dataframes:
		raise Exception('To use --use_incremental_querying you must also set that you are using the cached_dataframes')

	if args.use_incremental_querying and not args.save_dataframes:
		raise Exception('To use --use_incremental_querying you must also --save_dataframes because we need to use those saved dataframes to add the recently fetched data onto')

	dry_run = True if args.dry_run else False
	num_threads = args.num_threads if args.num_threads else 1
	num_processes = args.num_processes if args.num_processes else 1

	line1 = 'Processing {} companies with dry_run={}, num_threads={}, num_processes={}'.format(
		len(company_inputs), dry_run, num_threads, num_processes)
	logging.info(line1)
	
	args_dict = ArgsDict(
		download_only=args.download_only,
		dry_run=dry_run,
		use_cached_dataframes=args.use_cached_dataframes,
		save_dataframes=args.save_dataframes,
		use_cached_summaries=args.use_cached_summaries,
		use_incremental_querying=args.use_incremental_querying,
		write_to_db=args.write_to_db,
		use_facilities=args.use_facilities,
		num_threads=num_threads
	)

	# We want to keep tasks that take a similar amount of time grouped together
	# We use the number of sales receipts a customer has a proxy for how long the total
	# analysis will take for that customer.
	company_inputs.sort(key=lambda x: x['num_sales_receipts'])
	company_input_chunks = cast(Iterator[List[CompanyInputDict]], chunker(company_inputs, size=num_cpus))
	
	index = 0
	summaries = []
	errors_list: List[errors.Error] = []
	before = time.time()
	cur_date = datetime.date.today()

	for company_input_chunk in company_input_chunks:
		if num_processes > 1:
			results_list = cast(List[Tuple[List[AnalysisSummaryDict], errors.Error]], ray.get([
				_run_analysis_per_customer_for_ray.remote(
					company_input_chunk[j], args_dict, index + j
			) for j in range(len(company_input_chunk))]))
		else:
			results_list = []
			for j in range(len(company_input_chunk)):
				results_list.append(cast(Callable, _run_analysis_per_customer)(
					company_input_chunk[j], args_dict, index + j
				))

		index += len(company_input_chunk)
		for (summary_results, err) in results_list:
			if err:
				errors_list.append(err)
			else:
				summaries.extend(summary_results)

	summaries.sort(key=lambda x: x['company_info']['index'])
	after = time.time()

	line2 = f'Took {round(after - before, 2)} seconds to run analysis for all companies'
	logging.info(line2)
	inventory_summary_util.write_excel_for_summaries(summaries, cur_date)
	additional_info = f'{line1}\n{line2}'

	if not args.write_to_db:
		return

	template_data = sendgrid_util.NotificationTemplateData(
		trigger_name='run_metrc_analysis_for_all_customers',
		domain='',
		outcome='FAILED' if len(errors_list) > 0 else 'SUCCEEDED',
		additional_info=additional_info
	)
	if errors_list:
		template_data['descriptive_errors'] = [f'{err}\n{err.traceback}' for err in errors_list]

	email_sender = email_manager.EmailSender(email_manager.EmailSenderConfigDict(
		sendgrid_api_key=os.environ.get('SENDGRID_API_KEY'),
		from_addr=config_util.BESPOKE_NO_REPLY_EMAIL_ADDRESS
	))
	email_sender.send_dynamic_email_template(
		to_=[config_util.BESPOKE_OPS_EMAIL_ADDRESS],
		template_id=sendgrid_util.get_template_id(sendgrid_util.TemplateNames.OPS_TRIGGER_NOTIFICATION),
		template_data=cast(Dict, template_data),
	)

if __name__ == "__main__":
	main()
