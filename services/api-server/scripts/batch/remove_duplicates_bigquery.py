"""
DATABASE_URL= python remove_duplicates_bigquery.py
"""

import os
import sys
import pandas
import time
import traceback
from os import path
from typing import List, cast
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from google.cloud import bigquery

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.inventory.analysis.shared import download_util
from bespoke.db import models, models_util

BIGQUERY_ENGINE_URL = 'bigquery://bespoke-financial/ProdMetrcData'

def read_queries():
	load_dotenv('.env')
	# Need to set GOOGLE_APPLICATION_CREDENTIALS to the same
	# variable as BIGQUERY_CREDENTIALS_PATH
	client = bigquery.Client()

	dirs = os.listdir('out/duplicates')
	for dirname in dirs:
		df = pandas.read_pickle(f'out/duplicates/{dirname}')
		records = df.to_dict('records')
		print(records)

def main(is_test_run: bool = True):
	load_dotenv('.env')

	bigquery_engine = download_util.get_bigquery_engine(BIGQUERY_ENGINE_URL)
	query0 = """
		select companies.identifier
		from companies
	"""
	#df = pandas.read_sql_query(query0, bigquery_engine)
	#records = df.to_dict('records')

	identifiers = [
		#'GC', 'BMC', 'UR', 'TGL', 'DGG', 'TTS', 'FW', 'QR', 'GRG', 
		'EH', 'HC', 'DCS', 'HB', 'PL', 'ND', 'CSC', 'CPC', 'DCO', 
		'CHO', 'DWF', 'KC', 'MW', 'CG', 'UHHC', 'TL', '5MIL', 'FI', 
		'DNA', 'BBF', 'D-INV', 'MV', 'DW', 'LBF', 'SHI', 'SDG', 
		'MCT', 'GG', 'KOC', 'LW', 'FH', 'LL', 'CTE', 'CI', 'RER', 
		'VOY', 'GO', 'IDC', 'OD', 'DEMO2', 'SG', 'RA', 'THC', 'AF', 
		'KN', 'LC', 'BD', 'LU', 'CCC', 'CAN', 'SS', 'HTC', 'IC', 
		'PV', 'D-PMF', 'BMG', 'SFV', 'GF', 'FL', 'DL', 'DP', 'AC', 
		'SC', 'DHS', 'AL', 'BT', 'BO', 'DF', 'DDF', 'MT', 'PHG', 'HSW', 
		'EJ', 'HBF', 'HPCC', 'KGA', 'GW', 'UM', 'FF', 'HF', 'DR', 'BIS', 
		'PC', 'SD', 'SU', 'HG', 'GLNR', 'GP', 'SO', 'DEMO1', 'EP', 'EM', 
		'CC', 'GT', '31L', 'MD', 'ML', 'ACT', 'BFF', 'JC', 'MPW', 'WHT'
	]

	for identifier in identifiers:
		query = f"""
			select metrc_sales_transactions.package_id, metrc_sales_receipts.receipt_number, count(*)
			from
				metrc_sales_receipts
				inner join companies on metrc_sales_receipts.company_id = companies.id
				inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
			WHERE companies.identifier = "{identifier}"
			GROUP BY metrc_sales_transactions.package_id, metrc_sales_receipts.receipt_number
			HAVING count(*)>1
		"""
		df = pandas.read_sql_query(query, bigquery_engine)
		if len(df.index) > 0:
			print(f'{identifier} has sales transaction duplicates')
			df.to_pickle(f'out/duplicates/{identifier}.pickle')
		else:
			print(f'{identifier} has no sales transaction duplicates')

if __name__ == '__main__':
	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	#main(is_test_run)
	read_queries()
