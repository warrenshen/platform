'''
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script does the following:
1. Given a company with licenses
2. Search for Metrc-related rows that should be assigned to this company but are incorrectly assigned to another company
3. Reassign these company deliveries to given company

Metrc-related rows:
Company delivery
Metrc package
Metrc plant
Metrc plant batch
Metrc harvest
Metrc sales receipt

Why:
You can run this script when you reassign a license from one company to another and need to reassign the associated company deliveries.
For example if you moved a license from EMA to EMT, you can run this script for EMT to move over Metrc-related rows to EMT.
'''

import argparse
import os
import sys
import time
from os import path
from typing import Any, Callable, List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../../src')))
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../')))

from bespoke.db import db_constants, metrc_models_util, models, models_util

def reassign_table_by_license(
	table_name: str,
	model: Any,
	unique_key_columns: List[Any],
	us_state: str,
	license_number: str,
	company_id: str,
	session_maker: Callable,
	is_test_run: bool,
):
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:
		with models.session_scope(session_maker) as session:
			offset = current_page * BATCH_SIZE
			print(f'[Page {current_page + 1} offset {offset}] Reassigning {table_name} for license {license_number}...')

			try:
				# TODO(warrenshen): an order by is necessary / missing here.
				metrc_table_rows_batch = cast(
					List[model],
					session.query(model).filter(
						model.us_state == us_state
					).filter(
						model.license_number == license_number
					).filter(
						model.company_id != company_id
					).offset(
						current_page * BATCH_SIZE
					).limit(BATCH_SIZE).all())
			except Exception as e:
				print(e)
				print('[WARNING] Caught SQL query exception, sleeping for 5 seconds before retrying...')
				time.sleep(5)
				continue

			if len(metrc_table_rows_batch) <= 0:
				is_done = True
				continue
			else:
				for metrc_table_row in metrc_table_rows_batch:
					if str(metrc_table_row.company_id) != company_id:
						# Check if duplicate row exists or not.
						if unique_key_columns and len(unique_key_columns) > 0:
							duplicate_metrc_table_row_query = session.query(model)
							for unique_key_column in unique_key_columns:
								if unique_key_column.key == 'company_id':
									duplicate_metrc_table_row_query = duplicate_metrc_table_row_query.filter(unique_key_column == company_id)
								else:
									duplicate_metrc_table_row_query = duplicate_metrc_table_row_query.filter(unique_key_column == getattr(metrc_table_row, unique_key_column.key))
							duplicate_metrc_table_row = duplicate_metrc_table_row_query.first()

							if duplicate_metrc_table_row:
								# Correct row already exists, delete this unnecessary one.
								print(f'Destroying {table_name} {str(metrc_table_row.id)}...')
								if not is_test_run:
									session.delete(metrc_table_row)
								return

						print(f'Updating {table_name} {str(metrc_table_row.id)} company_id from {str(metrc_table_row.company_id)} to {str(company_id)}...')
						if not is_test_run:
							metrc_table_row.company_id = company_id

				current_page += 1

def main(is_test_run: bool, company_identifier: str) -> None:
	engine = models.create_engine(statement_timeout=30000) # 30 seconds timeout
	session_maker = models.new_sessionmaker(engine)

	company_id: str = None

	with models.session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.identifier == company_identifier
			).first())

		if not company:
			print('ERROR! No company exists for given company identifier')
			return
		else:
			company_id = str(company.id)

	company_license_tuples = []

	with models.session_scope(session_maker) as session:
		company_licenses = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.company_id == company_id
			).all())

		for company_license in company_licenses:
			company_license_tuples.append((company_license.us_state, company_license.license_number))

	table_tuples = [
		(
			'company_deliveries',
			models.CompanyDelivery,
			[
				models.CompanyDelivery.us_state,
				models.CompanyDelivery.license_number,
				models.CompanyDelivery.company_id,
				models.CompanyDelivery.transfer_row_id,
				models.CompanyDelivery.delivery_row_id,
			],
		),
		('metrc_harvests', models.MetrcHarvest, None),
		('metrc_packages', models.MetrcPackage, None),
		('metrc_plant_batches', models.MetrcPlantBatch, None),
		('metrc_plants', models.MetrcPlant, None),
		('metrc_sales_receipts', models.MetrcSalesReceipt, None),
	]

	for company_license_tuple in company_license_tuples:
		company_us_state, company_license_number = company_license_tuple

		table_count = 0
		for table_tuple in table_tuples:
			table_name, model, unique_key_columns = table_tuple
			print(f'[Table {table_count + 1}] Reassigning {table_name} company_id...')
			reassign_table_by_license(
				table_name,
				model,
				unique_key_columns,
				company_us_state,
				company_license_number,
				company_id,
				session_maker,
				is_test_run
			)
			table_count += 1

parser = argparse.ArgumentParser()
parser.add_argument('company_identifier', help='Identifier of company to perform action on')

if __name__ == '__main__':
	args = parser.parse_args()

	if not os.environ.get('DATABASE_URL'):
		print('You must set "DATABASE_URL" in the environment to use this script')
		exit(1)

	is_test_run = True

	if not os.environ.get('CONFIRM'):
		print('This script CHANGES information in the database')
		print('You must set "CONFIRM=1" as an environment variable to actually perform database changes with this script')
	else:
		is_test_run = False

	main(is_test_run=is_test_run, company_identifier=args.company_identifier)
