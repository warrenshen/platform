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

from lib import companies


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	company_licenses_path = 'scripts/data/company_licenses_vendors_2021_06_03.xlsx'

	workbook, err = excel_reader.ExcelWorkbook.load_xlsx(company_licenses_path)

	if err:
		raise Exception(err)

	print(f'Beginning import...')

	with models.session_scope(session_maker) as session:
		company_licenses_sheet, err = workbook.get_sheet_by_index(0)
		if err:
			raise Exception(err)

		company_license_tuples = company_licenses_sheet['rows']
		filtered_company_license_tuples = list(filter(lambda company_license_tuple: company_license_tuple[0] is not '', company_license_tuples[1:]))
		companies.import_company_licenses(session, filtered_company_license_tuples)

	print(f'Finished import')

if __name__ == "__main__":
	main()
