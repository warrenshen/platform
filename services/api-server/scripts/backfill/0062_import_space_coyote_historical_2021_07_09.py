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

from lib import advances, companies, contracts, invoices, loans, repayments

from bespoke.excel import excel_reader


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	invoice_historical_path = 'scripts/data/space_coyote_historical_2021_07_09.xlsx'

	with models.session_scope(session_maker) as session:
		workbook, err = excel_reader.ExcelWorkbook.load_xlsx(invoice_historical_path)
		if err:
			raise Exception(err)

		invoices_sheet, err = workbook.get_sheet_by_index(0)
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

		invoice_tuples = invoices_sheet['rows']
		# Skip the header row and filter out empty rows.
		filtered_invoice_tuples = list(filter(lambda invoice_tuple: invoice_tuple[0] is not '', invoice_tuples[1:]))
		invoices.import_funded_invoices(session, filtered_invoice_tuples)

		loan_tuples = loans_sheet['rows']
		filtered_loan_tuples = list(filter(lambda loan_tuple: loan_tuple[0] is not '', loan_tuples[1:]))
		loans.import_loans(session, filtered_loan_tuples, is_frozen=True)

		advance_tuples = advances_sheet['rows']
		# Skip the header row and filter out empty rows.
		filtered_advance_tuples = list(filter(lambda advance_tuple: advance_tuple[0] is not '', advance_tuples[1:]))
		advances.import_settled_advances(session, filtered_advance_tuples)

		repayment_tuples = repayments_sheet['rows']
		filtered_repayment_tuples = list(filter(lambda repayment_tuple: repayment_tuple[0] is not '', repayment_tuples[1:]))
		repayments.import_settled_repayments(session, filtered_repayment_tuples, account_fee_type='custom')

		loans.reset_loan_statuses(session)

		loans.populate_frozen_loan_reports(session_maker)
		
		print(f'Finished import')

if __name__ == "__main__":
	main()
