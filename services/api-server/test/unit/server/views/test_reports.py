import json
import datetime
from base64 import b64encode
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from sqlalchemy import (JSON, BigInteger, Boolean, Float, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text)
from sqlalchemy.orm.session import Session
from decimal import *

from manage import app
from bespoke.date import date_util
from bespoke.db.db_constants import ProductType
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from server.views import report_generation

class TestReportsLoansPastDueView(db_unittest.TestCase):
	def test_past_due_loans_report_generation(self) -> None:
		past_due_report = report_generation.ReportsLoansPastDueView()

		loan = models.Loan()
		loan.maturity_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		loan.outstanding_principal_balance = Decimal(10000)
		loan.outstanding_interest = Decimal(500)
		loan.outstanding_fees = Decimal(250)
		
		running_total, rows_html = past_due_report.prepare_email_rows([loan])

		# since the maturity_date is set to now in this test
		# days due will always be zero
		days_due_html = rows_html.find("<td>0</td>")
		self.assertNotEqual(days_due_html, -1)

		total_pos = rows_html.find("10750")
		self.assertNotEqual(total_pos, -1)


class TestReportsLoansComingDueView(db_unittest.TestCase):
	def test_coming_due_loans_report_generation(self) -> None:
		coming_due_report = report_generation.ReportsLoansComingDueView()

		loan = models.Loan()
		loan.outstanding_principal_balance = Decimal(10000)
		loan.outstanding_interest = Decimal(500)
		loan.outstanding_fees = Decimal(250)

		running_total, rows_html = coming_due_report.prepare_email_rows([loan])
		total_pos = rows_html.find("10750")
		self.assertNotEqual(total_pos, -1)