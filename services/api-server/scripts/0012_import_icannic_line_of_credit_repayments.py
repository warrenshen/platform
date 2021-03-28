import os
import sys
from datetime import datetime, time
from os import path
from typing import Any, Callable, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType, RequestStatusEnum
from bespoke.excel import excel_reader

from lib.repayments import import_settled_repayments_line_of_credit

path = 'scripts/data/icannic_repayments_2020_03_25.xlsx'
workbook, err = excel_reader.ExcelWorkbook.load_xlsx(path)
if err:
	raise Exception(err)

sheet, err = workbook.get_sheet_by_name('Sheet1')
if err:
	raise Exception(err)

# customer_identifier, loan_identifier, payment_type, payment_date, deposit_date, settlement_date
REPAYMENT_TUPLES = sheet['rows']

def import_line_of_credit_repayments_icannic(session_maker: Callable) -> None:
	print(f'Beginning import...')
	# Skip the header row and filter out empty rows.
	filtered_repayment_tuples = list(filter(lambda repayment_tuple: repayment_tuple[0] is not '', REPAYMENT_TUPLES[1:]))
	import_settled_repayments_line_of_credit(session_maker, filtered_repayment_tuples)
	print(f'Finished import')


def main() -> None:
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)
	import_line_of_credit_repayments_icannic(session_maker)

if __name__ == "__main__":
	main()
