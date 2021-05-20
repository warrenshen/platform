"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/
"""

import os
import sys
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))

from bespoke.db import models
from bespoke.excel import excel_reader

from lib import advances, companies, loans, purchase_orders, repayments


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	line_of_credit_path = 'scripts/data/line_of_credit_pioneer_valley_05_20_21.xlsx'

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(line_of_credit_path)

	if err:
		raise Exception(err)

	print(f'Beginning import...')

	with models.session_scope(session_maker) as session:
		loans_sheet, err = workbook.get_sheet_by_index(0)
		if err:
			raise Exception(err)

		loan_tuples = loans_sheet['rows']
		filtered_loan_tuples = list(filter(lambda loan_tuple: loan_tuple[0] is not '', loan_tuples[1:]))
		loans.import_line_of_credit_loans(session, filtered_loan_tuples)

	print(f'Finished import')

if __name__ == "__main__":
	main()
