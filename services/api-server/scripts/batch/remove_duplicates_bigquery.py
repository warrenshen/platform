"""
DATABASE_URL= python remove_duplicates_bigquery.py
"""

import os
import sys
import pandas
import time
import traceback
from os import path
from typing import Iterable, List, Any, cast
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from google.cloud import bigquery

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.inventory.analysis.shared import download_util
from bespoke.db import models, models_util

BIGQUERY_ENGINE_URL = 'bigquery://bespoke-financial/ProdMetrcData'

RESTRICT_TO_COMPANIES = ['GF', 'HPCC', 'ML', 'PL']

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def _delete_duplicates_for_company(
	client: Any,
	bigquery_engine: Any,
	company_identifier: str,
	package_ids: List[str],
	receipt_numbers: List[str]
) -> None:

	package_ids_list = [f"'{package_id}'" for package_id in package_ids]
	receipt_numbers_list = [f"'{receipt_number}'" for receipt_number in receipt_numbers]
	
	print('Fetching {} rows to delete for {}'.format(len(receipt_numbers), company_identifier))

	query = f"""
		select metrc_sales_transactions.id, metrc_sales_transactions.is_deleted, metrc_sales_transactions.updated_at, metrc_sales_transactions.package_id, metrc_sales_receipts.receipt_number
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		WHERE companies.identifier = '{company_identifier}' AND metrc_sales_transactions.package_id in ({','.join(package_ids_list)}) AND metrc_sales_receipts.receipt_number in ({','.join(receipt_numbers_list)})
	"""

	try:
		df = pandas.read_sql_query(query, bigquery_engine)
	except Exception as e:
		print('FAILED to fetch all transactions to delete for {}'.format(company_identifier))
		return

	query_records = df.to_dict('records')

	key_to_dups = {}
	for record in query_records:
		if record['is_deleted']:
			continue

		key = (record['package_id'], record['receipt_number'])
		if key not in key_to_dups:
			key_to_dups[key] = []

		key_to_dups[key].append(record)

	keys = list(key_to_dups.keys())

	all_ids_to_delete = []

	for key in keys:
		records = key_to_dups[key]
		if len(records) < 2:
			continue
		records.sort(key=lambda x: x['updated_at'])
		to_delete_records = records[0:len(records) - 1] # Dont delete the last one
		ids_to_delete = [f"'{cur_record['id']}'" for cur_record in to_delete_records]
		all_ids_to_delete.extend(ids_to_delete)

	NUM_TO_CHUNK = 1000

	print('Going to set is_deleted on {} rows in total for {}'.format(
		len(all_ids_to_delete), company_identifier))

	for keys_to_delete in chunker(all_ids_to_delete, NUM_TO_CHUNK):
		try:
			print('Setting is_deleted on {} rows for {}'.format(NUM_TO_CHUNK, company_identifier))
			dml_statement = (
					"UPDATE ProdMetrcData.metrc_sales_transactions "
					"SET is_deleted = true "
					f"WHERE id in ({','.join(keys_to_delete)})")
			query_job = client.query(dml_statement)
			query_job.result()
		except Exception as e:
			#print(e)
			print('Failed to deleted ids {}'.format(keys_to_delete))

def read_queries():
	load_dotenv('.env')
	# Need to set GOOGLE_APPLICATION_CREDENTIALS to the same
	# variable as BIGQUERY_CREDENTIALS_PATH
	client = bigquery.Client()
	bigquery_engine = download_util.get_bigquery_engine(BIGQUERY_ENGINE_URL)
	
	dirs = os.listdir('out/duplicates')
	for dirname in dirs:
		company_identifier = dirname.replace('.pickle', '')
		if RESTRICT_TO_COMPANIES and company_identifier not in RESTRICT_TO_COMPANIES:
			continue

		df = pandas.read_pickle(f'out/duplicates/{dirname}')
		records = df.to_dict('records')

		print('Going to set is_deleted on {} rows for {}'.format(
			len(records), company_identifier))

		record_chunks = list(chunker(records, 2000))

		with ThreadPoolExecutor(max_workers=4) as executor:
			future_to_i = {}
			for i in range(len(record_chunks)):
				cur_records = record_chunks[i]
				future_to_i[executor.submit(
					_delete_duplicates_for_company,
						client=client,
						bigquery_engine=bigquery_engine,
						company_identifier=company_identifier,
						package_ids=[record['package_id'] for record in cur_records],
						receipt_numbers=[record['receipt_number'] for record in cur_records]
				)] = i

			for future in concurrent.futures.as_completed(future_to_i):
				i = future_to_i[future]
				print('Completed setting is_deleted for chunk {}'.format(i))

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
		'GC', 'BMC', 'UR', 'TGL', 'DGG', 'TTS', 'FW', 'QR', 'GRG', 
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
		if RESTRICT_TO_COMPANIES and identifier not in RESTRICT_TO_COMPANIES:
			continue

		query = f"""
			select metrc_sales_transactions.package_id, metrc_sales_receipts.receipt_number, count(*)
			from
				metrc_sales_receipts
				inner join companies on metrc_sales_receipts.company_id = companies.id
				inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
			WHERE companies.identifier = "{identifier}" AND (metrc_sales_transactions.is_deleted = false or metrc_sales_transactions.is_deleted is null)
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

	main(is_test_run)
	#read_queries()
