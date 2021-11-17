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
"""
import datetime
import os
import sys
import logging
from dotenv import load_dotenv
from os import path
from typing import List, Dict, Any, cast
from sqlalchemy.orm.session import Session
# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.inventory.analysis.shared import package_history, download_util
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis import inventory_cogs_util as cogs_util
from bespoke.inventory.analysis import inventory_valuations_util as valuations_util
from bespoke.inventory.analysis import inventory_summary_util
from bespoke.inventory.analysis.shared.inventory_types import (
	Query,
	AnalysisParamsDict,
	AnalysisSummaryDict
)

logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s',
					datefmt='%m/%d/%Y %H:%M:%S',
					level=logging.INFO)
dotenv_path = os.path.join(os.environ.get('SERVER_ROOT_DIR', '.'), '.env')
load_dotenv(dotenv_path)

def _run_analysis_for_customer(d: download_util.Download, q: Query, params: AnalysisParamsDict) -> AnalysisSummaryDict:
	## Analyze counts for the dataset
	logging.info('Analyzing counts for {}'.format(q.company_name))
	today_date = date_util.load_date_str(q.inventory_dates[-1]) # the most recent day is the one we want to compare the actual inventory to.
	id_to_history = util.get_histories(d, params=params)

	util.print_counts(id_to_history)
	util.run_orphan_analysis(d, id_to_history, params)
	counts_analysis_dict = util.create_inventory_xlsx(d, id_to_history, q, params=params)

	## Compute accuracy numbers for COGS and inventory
	logging.info('Computing inventory for {}'.format(q.company_name))
	
	computed_resp = util.compute_inventory_across_dates(
			d, q.inventory_dates, params
	)

	today_date_str = today_date.strftime('%m/%d/%Y')
	compare_inventory_res = util.compare_computed_vs_actual_inventory(
			computed=computed_resp['date_to_computed_inventory_dataframe'][today_date_str],
			actual=d.inventory_packages_dataframe,
			compare_options={
					'num_errors_to_show': 10,
					'accept_computed_when_sold_out': True
			}
	)

	cogs_summary = cogs_util.create_cogs_summary(d, id_to_history, params)
	cogs_util.write_cogs_xlsx(
			topdown_cogs_rows=cogs_summary['topdown_cogs_rows'], 
			bottoms_up_cogs_rows=cogs_summary['bottomsup_cogs_rows'],
			company_name=q.company_name
	)

	# Plot graphs
	valuations_util.plot_inventory_and_revenue(
			q=q,
			sales_receipts_dataframe=d.sales_receipts_dataframe,
			inventory_valuations=computed_resp['inventory_valuations']
	)

	return AnalysisSummaryDict(
		company_name=q.company_name,
		company_identifier=q.company_identifier,
		analysis_params=params,
		counts_analysis=counts_analysis_dict,
		compare_inventory_results=compare_inventory_res,
		cogs_summary=cogs_summary
	)

def _compute_inventory_for_customer(
	company_identifier: str, params_list: List[AnalysisParamsDict], dry_run: bool) -> List[AnalysisSummaryDict]:
	identifier_to_name = {
		'RA': 'Royal_Apothecary'
	}
	transfer_packages_start_date = '2020-01-01'
	sales_transactions_start_date = '2020-01-01'

	company_name = identifier_to_name.get(company_identifier, company_identifier)

	## Setup input parameters

	today_date = datetime.date.today()

	q = util.Query(
		inventory_dates=[], # gets filled in once we have the dataframes
		transfer_packages_start_date=transfer_packages_start_date,
		sales_transactions_start_date=sales_transactions_start_date,
		company_name=company_name,
		company_identifier=company_identifier,
		license_numbers=[] # No licenses means use all licenses associated with this customer
	)

	## Download the data
	logging.info('About to download all inventory history for {}'.format(q.company_name))
	engine = download_util.get_bigquery_engine('bigquery://bespoke-financial/ProdMetrcData')
	all_dataframes_dict = download_util.get_dataframes_for_analysis(q, engine, dry_run=dry_run)
	d = util.Download()
	d.download_dataframes(all_dataframes_dict, sql_helper=download_util.BigQuerySQLHelper(engine))
	q.inventory_dates = download_util.get_inventory_dates(
		all_dataframes_dict, today_date)

	summaries = []
	for params in params_list:
		summaries.append(_run_analysis_for_customer(d, q, params))

	return summaries

def main() -> None:
	dry_run = True
	# Dont infer anything
	params = util.AnalysisParamsDict(
		sold_threshold=package_history.DEFAULT_SOLD_THRESHOLD,
		find_parent_child_relationships=False,
		use_prices_to_fill_missing_incoming=False,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None
	)
	# Pricing table only
	params2 = util.AnalysisParamsDict(
		sold_threshold=package_history.DEFAULT_SOLD_THRESHOLD,
		find_parent_child_relationships=False,
		use_prices_to_fill_missing_incoming=True,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None
	)
	# Pricing table + parenting logic
	params3 = util.AnalysisParamsDict(
		sold_threshold=package_history.DEFAULT_SOLD_THRESHOLD,
		find_parent_child_relationships=True,
		use_prices_to_fill_missing_incoming=True,
		external_pricing_data_config=None,
		use_margin_estimate_config=False,
		margin_estimate_config=None,
		cogs_analysis_params=None
	)
	summaries = _compute_inventory_for_customer('RA', [params, params2, params3], dry_run=dry_run)
	inventory_summary_util.write_excel_for_summaries(summaries)

if __name__ == "__main__":
	main()
