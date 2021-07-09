"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.db import models

from lib import advances, companies, contracts, loans, purchase_orders, repayments

from bespoke.excel import excel_reader


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	payor_vendors_path = 'scripts/data/payor_vendors_2021_07_08.xlsx'
	with models.session_scope(session_maker) as session:
		companies.load_into_db_from_excel(session, payor_vendors_path)

	inventory_historical_path = 'scripts/data/inventory_historical_2021_07_08.xlsx'

	with models.session_scope(session_maker) as session:
		workbook, err = excel_reader.ExcelWorkbook.load_xlsx(inventory_historical_path)
		if err:
			raise Exception(err)

		purchase_orders_sheet, err = workbook.get_sheet_by_index(0)
		if err:
			raise Exception(err)

		loans_sheet, err = workbook.get_sheet_by_index(1)
		if err:
			raise Exception(err)

		advances_sheet, err = workbook.get_sheet_by_index(2)
		if err:
			raise Exception(err)

		repayments_sheet, err = workbook.get_sheet_by_index(3)
		if err:
			raise Exception(err)

		purchase_order_tuples = purchase_orders_sheet['rows']
		# Skip the header row and filter out empty rows.
		filtered_purchase_order_tuples = list(filter(lambda purchase_order_tuple: purchase_order_tuple[0] is not '', purchase_order_tuples[1:]))
		purchase_orders.import_funded_purchase_orders(session, filtered_purchase_order_tuples)

		loan_tuples = loans_sheet['rows']
		filtered_loan_tuples = list(filter(lambda loan_tuple: loan_tuple[0] is not '', loan_tuples[1:]))
		loans.import_loans(session, filtered_loan_tuples, is_frozen=True)

		advance_tuples = advances_sheet['rows']
		# Skip the header row and filter out empty rows.
		filtered_advance_tuples = list(filter(lambda advance_tuple: advance_tuple[0] is not '', advance_tuples[1:]))
		advances.import_settled_advances(session, filtered_advance_tuples)

		repayment_tuples = repayments_sheet['rows']
		filtered_repayment_tuples = list(filter(lambda repayment_tuple: repayment_tuple[0] is not '', repayment_tuples[1:]))
		repayments.import_settled_repayments(session, filtered_repayment_tuples)

		loans.reset_loan_statuses(session)

		print(f'Finished import')

if __name__ == "__main__":
	main()
