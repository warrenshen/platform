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

	line_of_credit_all_path = 'scripts/data/line_of_credit_all_2021_04_27.xlsx'

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(line_of_credit_all_path)

	if err:
		raise Exception(err)

	print(f'Beginning import...')

	repayments_sheet, err = workbook.get_sheet_by_index(2)
	if err:
		raise Exception(err)

	repayment_tuples = repayments_sheet['rows']
	filtered_repayment_tuples = list(filter(lambda repayment_tuple: repayment_tuple[0] is not '', repayment_tuples[1:]))
	repayments.import_settled_repayments_line_of_credit(session_maker, filtered_repayment_tuples)

	print(f'Finished import')

if __name__ == "__main__":
	main()
