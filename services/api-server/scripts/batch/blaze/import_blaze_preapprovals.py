"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/
"""

import argparse
import os
import sys
from os import path
from typing import List, cast

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../../src")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.excel import excel_reader
from bespoke.finance import number_util

from sqlalchemy.orm.session import Session


def import_preapprovals(
	session: Session,
	is_test_run: bool,
	preapproval_tuples: List[List[str]],
) -> None:
	preapprovals_count = len(preapproval_tuples)
	print(f'Running for {preapprovals_count} preapprovals...')

	for index, new_preapproval_tuple in enumerate(preapproval_tuples):
		print(f'[{index + 1} of {preapprovals_count}]')
		(
			external_blaze_company_id,
			external_blaze_shop_id,
			max_credit_limit,
			annual_interest_rate,
			expiration_date,
		) = new_preapproval_tuple

		parsed_external_blaze_company_id = external_blaze_company_id.strip()
		parsed_external_blaze_shop_id = external_blaze_shop_id.strip()
		parsed_max_credit_limit = number_util.round_currency(float(max_credit_limit))
		parsed_annual_interest_rate = float(annual_interest_rate)
		parsed_expiration_date = date_util.load_date_str(expiration_date) if type(expiration_date) == 'str' else expiration_date

		if not (
			parsed_external_blaze_company_id and
			parsed_external_blaze_shop_id and
			parsed_max_credit_limit and
			parsed_max_credit_limit > 0 and
			parsed_annual_interest_rate and
			parsed_annual_interest_rate > 0 and
			parsed_expiration_date
		):
			print(f'[{index + 1} of {preapprovals_count}] Invalid preapproval field(s)')
			print(f'EXITING EARLY')
			return

		existing_blaze_preapproval = cast(
			models.BlazePreapproval,
			session.query(models.BlazePreapproval).filter(
				models.BlazePreapproval.external_blaze_company_id == parsed_external_blaze_company_id
			).filter(
				models.BlazePreapproval.external_blaze_shop_id == parsed_external_blaze_shop_id
			).filter(
				models.BlazePreapproval.expiration_date == parsed_expiration_date
			).first())

		if existing_blaze_preapproval:
			print(f'[{index + 1} of {preapprovals_count}] Preapproval ({parsed_external_blaze_company_id}, {parsed_external_blaze_shop_id}, {parsed_expiration_date}) already exists')
			continue

		if not is_test_run:
			blaze_preapproval = models.BlazePreapproval(
				external_blaze_company_id=parsed_external_blaze_company_id,
				external_blaze_shop_id=parsed_external_blaze_shop_id,
				max_credit_limit=parsed_max_credit_limit,
				annual_interest_rate=parsed_annual_interest_rate,
				expiration_date=parsed_expiration_date,
			)
			session.add(blaze_preapproval)

		print(f'[{index + 1} of {preapprovals_count}] Created preapproval ({parsed_external_blaze_company_id}, {parsed_external_blaze_shop_id}, {parsed_expiration_date})')

# Normal (not line of credit) loans.
def load_into_db_from_excel(session: Session, is_test_run: bool, path: str) -> None:

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
	if err:
		raise Exception(err)

	sheet, err = workbook.get_sheet_by_index(0)
	if err:
		raise Exception(err)

	preapproval_tuples = sheet['rows']
	# Skip the header row and filter out empty rows.
	filtered_preapproval_tuples = list(filter(lambda preapproval_tuple: preapproval_tuple[0] != '', preapproval_tuples[1:]))
	import_preapprovals(session, is_test_run, filtered_preapproval_tuples)

def main(
	is_test_run: bool,
	xlsx_file_path: str,
) -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	print(f'Beginning import...')

	with models.session_scope(session_maker) as session:
		load_into_db_from_excel(session, is_test_run, xlsx_file_path)

	print(f'Finished import')

parser = argparse.ArgumentParser()
parser.add_argument('xlsx_file_path', help='File path of XLSX file to import')

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

	main(is_test_run=is_test_run, xlsx_file_path=args.xlsx_file_path)
