import json
import datetime
from base64 import b64encode
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from sqlalchemy import (JSON, BigInteger, Boolean, Float, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text)
from sqlalchemy.orm.session import Session
from decimal import *

from manage import app
from bespoke.date import date_util
from bespoke.db.db_constants import ProductType
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from bespoke_test import auth_helper
from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from server.views import report_generation
from dateutil import parser

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
# coming due report sent 1, 3, 7, or 14 days away, make sure to subtract 1
TWO_DAYS_FROM_TODAY = TODAY + date_util.timedelta(days=2)
FOUR_DAYS_BEFORE_TODAY = TODAY - date_util.timedelta(days=4)
MONTH_FROM_TODAY = TODAY + date_util.timedelta(days=30)
LAST_YEAR = TODAY - date_util.timedelta(days=365)

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

def add_loans_for_company(
	session: Session, 
	company_id: str,
	product_type: str,
	has_contract: bool = True,
	is_dummy_account: bool = False) -> None:

	if has_contract:
		contract = models.Contract(
			company_id=company_id,
			product_type=product_type,
			product_config=contract_test_helper.create_contract_config(
				product_type=product_type,
				input_dict=ContractInputDict(
					interest_rate=5.00,
					maximum_principal_amount=120000.01,
					max_days_until_repayment=0, # unused
					late_fee_structure=_get_late_fee_structure(), # unused
				)
			),
			start_date=date_util.load_date_str('1/1/2020'),
			adjusted_end_date=date_util.load_date_str('12/1/2024')
		)
		session.add(contract)
		session.commit()
		session.refresh(contract)

	company = session.query(models.Company).get(company_id)

	if has_contract:
		company.contract_id = contract.id

	company_settings = session.query(models.CompanySettings).get(company.company_settings_id)
	company_settings.is_dummy_account = is_dummy_account
	session.commit()


	# Add coming due loan
	session.add(models.Loan(
		company_id = company_id,
		amount = Decimal(10000.0),
		maturity_date = TWO_DAYS_FROM_TODAY,
		adjusted_maturity_date = TWO_DAYS_FROM_TODAY,
		origination_date = LAST_YEAR,
		outstanding_principal_balance = Decimal(5000.0),
		outstanding_interest = Decimal(500.0),
		outstanding_fees = Decimal(100.0),
		status = "approved",
		loan_type = "purchase_order",
		identifier = "1"
	))

	# Add past due loan
	session.add(models.Loan(
		company_id = company_id,
		amount = Decimal(10000.0),
		maturity_date = FOUR_DAYS_BEFORE_TODAY,
		adjusted_maturity_date = FOUR_DAYS_BEFORE_TODAY,
		origination_date = LAST_YEAR,
		outstanding_principal_balance = Decimal(5000.0),
		outstanding_interest = Decimal(500.0),
		outstanding_fees = Decimal(100.0),
		status = "approved",
		loan_type = "purchase_order",
		identifier = "1"
	))

	# Add loan that isn't past or coming due
	session.add(models.Loan(
		company_id = company_id,
		amount = Decimal(10000.0),
		maturity_date = MONTH_FROM_TODAY,
		adjusted_maturity_date = MONTH_FROM_TODAY,
		origination_date = LAST_YEAR,
		outstanding_principal_balance = Decimal(5000.0),
		outstanding_interest = Decimal(500.0),
		outstanding_fees = Decimal(100.0),
		status = "approved",
		loan_type = "purchase_order",
		identifier = "1"
	))

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

		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		with session_scope(self.session_maker) as session:
			add_loans_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.PURCHASE_MONEY_FINANCING)
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).all())

			notified_loans, _ = past_due_report.process_loan_chunk(session, 
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports", 
				loans_chunk = all_open_loans,
				today = parser.parse('2020-10-01T16:33:27.69-08:00')
			)

			notified_loan_count = 0
			for _, loans in notified_loans.items():
				notified_loan_count += len(loans)
			self.assertEqual(notified_loan_count, 1)


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

		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		with session_scope(self.session_maker) as session:
			add_loans_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.PURCHASE_MONEY_FINANCING)
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).all())

			notified_loans, _ = coming_due_report.process_loan_chunk(session, 
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports", 
				loans_chunk = all_open_loans,
				today = parser.parse('2020-10-01T16:33:27.69-08:00')
			)

			notified_loan_count = 0
			for _, loans in notified_loans.items():
				notified_loan_count += len(loans)
			self.assertEqual(notified_loan_count, 1)
