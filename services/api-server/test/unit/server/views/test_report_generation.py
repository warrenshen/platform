import json
import datetime
import uuid
from base64 import b64encode
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from sqlalchemy import (JSON, BigInteger, Boolean, Float, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text, update)
from sqlalchemy.orm.session import Session
from decimal import *
from bs4 import BeautifulSoup # type: ignore

from manage import app
from bespoke.date import date_util
from bespoke.db.db_constants import ProductType, PaymentType, PaymentMethodEnum, LoanTypeEnum, LoanStatusEnum, RequestStatusEnum
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.model_types import (
	PaymentItemsCoveredDict
)
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util
from bespoke.finance.payments import fees_due_util
from bespoke.finance.reports import loan_balances
from bespoke.reports.report_generation_util import *
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

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

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

def add_financial_summaries_for_company(
	session: Session, 
	company_id: str) -> None:
	"""
		This function was original written in the context of monthly summary reports for LoC customers
		As such, it sets up three financial summaries for get_end_of_report_month_financial_summary in
		report_generation to make sure if pulls the summary from the last day of the month
	"""

	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -1),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(0.0),
		total_outstanding_interest = Decimal(1800.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))

	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -2),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(0.0),
		total_outstanding_interest = Decimal(1800.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))

	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -3),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(0.0),
		total_outstanding_interest = Decimal(1800.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))

def add_payments_for_company(
	session: Session, 
	company_id: str
	) -> None:
	"""
		This function adds *both* repayments and advances. This is to make sure that functions
		that should only pull one or the other are doing so
	"""
	
	items_covered_one: PaymentItemsCoveredDict = {
		'loan_ids': [str(uuid.uuid4())],
		'invoice_ids': [str(uuid.uuid4())],
		'requested_to_principal': 5000.00,
		'requested_to_interest': 500.00,
		'requested_to_account_fees': 100.00,
		'to_principal': 5000.00,
		'to_interest': 500.00,
		'to_account_fees': 100.00,
		'to_user_credit': 0.0
	}

	repayment_id1 = uuid.uuid4()
	session.add(models.Payment( # type: ignore
		id = repayment_id1,
		company_id = company_id,
		created_at = get_relative_date(TODAY, -12),
		updated_at = get_relative_date(TODAY, -12),
		settlement_identifier = "1",
		type = PaymentType.REPAYMENT,
		method = PaymentMethodEnum.ACH,
		requested_amount = Decimal(5600.0),
		amount = None,
		requested_payment_date = get_relative_date(TODAY, -10),
		payment_date = get_relative_date(TODAY, -10),
		deposit_date = get_relative_date(TODAY, -10),
		settlement_date = get_relative_date(TODAY, -9),
		items_covered = items_covered_one,
		company_bank_account_id = str(uuid.uuid4()),
		recipient_bank_account_id = str(uuid.uuid4()),
		customer_note = "",
		bank_note = "",
		requested_by_user_id = str(uuid.uuid4()),
		submitted_at = get_relative_date(TODAY, -12),
		submitted_by_user_id = str(uuid.uuid4()),
		settled_at = get_relative_date(TODAY, -9),
		settled_by_user_id = str(uuid.uuid4()),
		originating_payment_id = str(uuid.uuid4()),
		is_deleted = False,
		reversed_at = None
	))

	session.add(models.Transaction( # type: ignore
		type = PaymentType.REPAYMENT,
		subtype = None, 
		amount = Decimal(5600.0),
		loan_id = None, # not needed for testing
		payment_id = repayment_id1,
		to_principal = Decimal(5000.0),
		to_interest = Decimal(500.0),
		to_fees = Decimal(100.0),
		effective_date = get_relative_date(TODAY, -10),
		created_by_user_id = str(uuid.uuid4()),
		is_deleted = False
	))

	items_covered_two: PaymentItemsCoveredDict  = {
		'loan_ids': [str(uuid.uuid4())],
		'invoice_ids': [str(uuid.uuid4())],
		'requested_to_principal': 1000.00,
		'requested_to_interest': 500.00,
		'requested_to_account_fees': 100.00,
		'to_principal': 5000.00,
		'to_interest': 500.00,
		'to_account_fees': 100.00,
		'to_user_credit': 0.0
	}

	repayment_id2 = uuid.uuid4()
	session.add(models.Payment( # type: ignore
		id = repayment_id2,
		company_id = company_id,
		created_at = get_relative_date(TODAY, -11),
		updated_at = get_relative_date(TODAY, -11),
		settlement_identifier = "1",
		type = PaymentType.REPAYMENT,
		method = PaymentMethodEnum.ACH,
		requested_amount = Decimal(1600.0),
		amount = None,
		requested_payment_date = get_relative_date(TODAY, -9),
		payment_date = get_relative_date(TODAY, -9),
		deposit_date = get_relative_date(TODAY, -9),
		settlement_date = get_relative_date(TODAY, -8),
		items_covered = items_covered_two,
		company_bank_account_id = str(uuid.uuid4()),
		recipient_bank_account_id = str(uuid.uuid4()),
		customer_note = "",
		bank_note = "",
		requested_by_user_id = str(uuid.uuid4()),
		submitted_at = get_relative_date(TODAY, -11),
		submitted_by_user_id = str(uuid.uuid4()),
		settled_at = get_relative_date(TODAY, -8),
		settled_by_user_id = str(uuid.uuid4()),
		originating_payment_id = str(uuid.uuid4()),
		is_deleted = False,
		reversed_at = None
	))

	session.add(models.Transaction( # type: ignore
		type = PaymentType.REPAYMENT,
		subtype = None, 
		amount = Decimal(1600.0),
		loan_id = None, # not needed for testing
		payment_id = repayment_id2,
		to_principal = Decimal(1000.0),
		to_interest = Decimal(500.0),
		to_fees = Decimal(100.0),
		effective_date = get_relative_date(TODAY, -9),
		created_by_user_id = str(uuid.uuid4()),
		is_deleted = False
	))

	items_covered_three: PaymentItemsCoveredDict  = {
		'loan_ids': [str(uuid.uuid4())],
		'invoice_ids': [str(uuid.uuid4())],
		'requested_to_principal': 1000.00,
		'requested_to_interest': 500.00,
		'requested_to_account_fees': 100.00,
		'to_principal': 5000.00,
		'to_interest': 500.00,
		'to_account_fees': 100.00,
		'to_user_credit': 0.0
	}

	repayment_id3 = uuid.uuid4()
	session.add(models.Payment( # type: ignore
		id = repayment_id3,
		company_id = company_id,
		created_at = get_relative_date(TODAY, -11),
		updated_at = get_relative_date(TODAY, -11),
		settlement_identifier = "1",
		type = PaymentType.ADVANCE,
		method = PaymentMethodEnum.REVERSE_DRAFT_ACH,
		requested_amount = Decimal(1600.0),
		amount = None,
		requested_payment_date = get_relative_date(TODAY, -9),
		payment_date = get_relative_date(TODAY, -9),
		deposit_date = get_relative_date(TODAY, -9),
		settlement_date = get_relative_date(TODAY, -8),
		items_covered = items_covered_three,
		company_bank_account_id = str(uuid.uuid4()),
		recipient_bank_account_id = str(uuid.uuid4()),
		customer_note = "",
		bank_note = "",
		requested_by_user_id = str(uuid.uuid4()),
		submitted_at = get_relative_date(TODAY, -11),
		submitted_by_user_id = str(uuid.uuid4()),
		settled_at = get_relative_date(TODAY, -8),
		settled_by_user_id = str(uuid.uuid4()),
		originating_payment_id = str(uuid.uuid4()),
		is_deleted = False,
		reversed_at = None
	))

	session.add(models.Transaction( # type: ignore
		type = PaymentType.REPAYMENT,
		subtype = None, 
		amount = Decimal(1600.0),
		loan_id = None, # not needed for testing
		payment_id = repayment_id1,
		to_principal = Decimal(1000.0),
		to_interest = Decimal(500.0),
		to_fees = Decimal(100.0),
		effective_date = get_relative_date(TODAY, -9),
		created_by_user_id = str(uuid.uuid4()),
		is_deleted = False
	))

def add_loans_for_loc_summary(
	session : Session,
	company_id: str
	) -> None:
	session.add(models.Loan(
		company_id = company_id,
		amount = Decimal(10000.0),
		maturity_date = get_relative_date(TODAY, 365),
		adjusted_maturity_date = get_relative_date(TODAY, 365),
		origination_date = get_relative_date(TODAY, -20),
		outstanding_principal_balance = Decimal(5000.0),
		outstanding_interest = Decimal(500.0),
		outstanding_fees = Decimal(100.0),
		status = "approved",
		loan_type = "purchase_order",
		identifier = "1"
	))

	session.add(models.Loan(
		company_id = company_id,
		amount = Decimal(20000.0),
		maturity_date = get_relative_date(TODAY, 365),
		adjusted_maturity_date = get_relative_date(TODAY, 365),
		origination_date = get_relative_date(TODAY, -21),
		outstanding_principal_balance = Decimal(7000.0),
		outstanding_interest = Decimal(700.0),
		outstanding_fees = Decimal(120.0),
		status = "approved",
		loan_type = "purchase_order",
		identifier = "2"
	))

def setup_data_for_cmi_and_mmf(
	session: Session,
	company_id: str,
	cmi_should_be_higher: bool
	) -> None:
	# this is for the interest balance calculation that gets fed into cmi_and_mmf
	# The 30 and 31 offsets in the date field assumes TODAY remains as October 1st
	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -31).date(),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(0.0),
		total_outstanding_interest = Decimal(1800.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))
	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -30).date(),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(18000.0),
		total_outstanding_interest = Decimal(80.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(7000.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))
	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -29).date(),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(18000.0),
		total_outstanding_interest = Decimal(80.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(10000.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))
	session.add(models.FinancialSummary(
		date = get_relative_date(TODAY, -1).date(),
		company_id = company_id,
		total_limit = Decimal(10000.0),
		total_outstanding_principal = Decimal(8000.0),
		total_outstanding_principal_for_interest = Decimal(18000.0),
		total_outstanding_interest = Decimal(80.0),
		total_outstanding_fees = Decimal(200.0),
		total_principal_in_requested_state = Decimal(0.0),
		total_amount_to_pay_interest_on = Decimal(0.0),
		total_interest_paid_adjustment_today = Decimal(0.0),
		total_fees_paid_adjustment_today = Decimal(0.0),
		available_limit = Decimal(0.0),
		adjusted_total_limit = Decimal(0.0),
		minimum_monthly_payload = {},
		account_level_balance_payload = {
			"fees_total": 25, 
			"credits_total": 0
		},
		day_volume_threshold_met = None,
		interest_accrued_today = Decimal(5000.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None
	))
	if cmi_should_be_higher == True:
		session.add(models.FinancialSummary(
			date = get_relative_date(TODAY, -28).date(),
			company_id = company_id,
			total_limit = Decimal(10000.0),
			total_outstanding_principal = Decimal(8000.0),
			total_outstanding_principal_for_interest = Decimal(18000.0),
			total_outstanding_interest = Decimal(80.0),
			total_outstanding_fees = Decimal(200.0),
			total_principal_in_requested_state = Decimal(0.0),
			total_amount_to_pay_interest_on = Decimal(0.0),
			total_interest_paid_adjustment_today = Decimal(0.0),
			total_fees_paid_adjustment_today = Decimal(0.0),
			available_limit = Decimal(0.0),
			adjusted_total_limit = Decimal(0.0),
			minimum_monthly_payload = {},
			account_level_balance_payload = {},
			day_volume_threshold_met = None,
			interest_accrued_today = Decimal(5000.0),
			product_type = None,
			needs_recompute = False,
			days_to_compute_back = None
		))
		session.add(models.FinancialSummary(
			date = get_relative_date(TODAY, -27).date(),
			company_id = company_id,
			total_limit = Decimal(10000.0),
			total_outstanding_principal = Decimal(8000.0),
			total_outstanding_principal_for_interest = Decimal(18000.0),
			total_outstanding_interest = Decimal(80.0),
			total_outstanding_fees = Decimal(200.0),
			total_principal_in_requested_state = Decimal(0.0),
			total_amount_to_pay_interest_on = Decimal(0.0),
			total_interest_paid_adjustment_today = Decimal(0.0),
			total_fees_paid_adjustment_today = Decimal(0.0),
			available_limit = Decimal(0.0),
			adjusted_total_limit = Decimal(0.0),
			minimum_monthly_payload = {},
			account_level_balance_payload = {},
			day_volume_threshold_met = None,
			interest_accrued_today = Decimal(5000.0),
			product_type = None,
			needs_recompute = False,
			days_to_compute_back = None
		))

	contract_id = uuid.uuid4()
	product_config = {
		"v1": {
			"fields":[
				{
					"value":0.05,
					"internal_name":"factoring_fee_percentage"
				},
				{
					"value":20000.0,
					"internal_name":"minimum_monthly_amount"
				}
			]
		},
		"version":"v1",
		"product_type":"line_of_credit"
	}
	session.add(models.Contract(
		id = contract_id,
		company_id = company_id,
		product_type = ProductType.LINE_OF_CREDIT,
		product_config = product_config,
		start_date = get_relative_date(TODAY, -60),
		end_date = get_relative_date(TODAY, 365),
		adjusted_end_date = get_relative_date(TODAY, 365),
		terminated_at = None,
		is_deleted = False
	))

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())
	company.contract_id = contract_id # type: ignore
	session.add(company)

def setup_data_for_available_credit(
	session: Session,
	company_id: str
	) -> None:
	ebba_id = uuid.uuid4()
	
	session.add(models.EbbaApplication( # type: ignore
		id = ebba_id,
		company_id = company_id,
		monthly_accounts_receivable = Decimal(100000.0), # 100k
		monthly_inventory = Decimal(100000.0), #100k
		monthly_cash = Decimal(1000000.0), # 1M
		amount_cash_in_daca = Decimal(0.0),
		status = "approved",
		calculated_borrowing_base = Decimal(100000.0)
	))

	session.commit()

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.company_id == company_id
		).first())
	company_settings.active_ebba_application_id = ebba_id # type: ignore
	session.add(company_settings)
	
class TestReportsLoansPastDueView(db_unittest.TestCase):
	def test_past_due_loans_report_generation(self) -> None:
		past_due_report = report_generation.ReportsLoansPastDueView()

		with session_scope(self.session_maker) as session:

			loan = models.Loan()
			loan.maturity_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
			loan.adjusted_maturity_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
			loan.outstanding_principal_balance = Decimal(10000)
			loan.outstanding_interest = Decimal(500)
			loan.outstanding_fees = Decimal(250)
			
			running_total, rows_html = past_due_report.prepare_email_rows([loan], session)

			# since the maturity_date is set to now in this test
			# days due will always be zero
			days_due_html = rows_html.find("<td>0</td>")
			self.assertNotEqual(days_due_html, -1)

			total_pos = rows_html.find("10,750")
			self.assertNotEqual(total_pos, -1)

			self.reset()
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()
		
			add_loans_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.PURCHASE_MONEY_FINANCING)
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).all())

			loans_to_notify : Dict[str, List[models.Loan] ] = {}
			for l in all_open_loans:
				if l.origination_date is not None and l.adjusted_maturity_date is not None and \
					l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
					days_until_maturity = date_util.num_calendar_days_passed(TODAY.date(), l.adjusted_maturity_date);
					if days_until_maturity == 1 or days_until_maturity == 3 or \
						days_until_maturity == 7 or days_until_maturity == 14:
						if l.company_id not in loans_to_notify:
							loans_to_notify[l.company_id] = [];
						loans_to_notify[l.company_id].append(l)

			notified_loans, _ = past_due_report.process_loan_chunk(session, 
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports",
				payment_link = "http://localhost:3005/1/loans", 
				loans_to_notify= loans_to_notify,
				today = parser.parse('2020-10-01T16:33:27.69-08:00')
			)

			notified_loan_count = 0
			for _, loans in notified_loans.items():
				notified_loan_count += len(loans)
			self.assertEqual(notified_loan_count, 1)


class TestReportsLoansComingDueView(db_unittest.TestCase):
	def test_coming_due_loans_report_generation(self) -> None:
		coming_due_report = report_generation.ReportsLoansComingDueView()

		with session_scope(self.session_maker) as session:

			loan = models.Loan()
			loan.adjusted_maturity_date = TWO_DAYS_FROM_TODAY
			loan.outstanding_principal_balance = Decimal(10000)
			loan.outstanding_interest = Decimal(500)
			loan.outstanding_fees = Decimal(250)

			running_total, rows_html = coming_due_report.prepare_email_rows([loan], session)
			total_pos = rows_html.find("10,750")
			self.assertNotEqual(total_pos, -1)

			self.reset()
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()
		
			add_loans_for_company(session, seed.get_company_id('company_admin', index=0), ProductType.PURCHASE_MONEY_FINANCING)
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).all())

			loans_to_notify : Dict[str, List[models.Loan] ] = {}
			for l in all_open_loans:
				if l.origination_date is not None and l.adjusted_maturity_date is not None and \
					l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
					days_until_maturity = date_util.num_calendar_days_passed(TODAY.date(), l.adjusted_maturity_date);
					if days_until_maturity == 1 or days_until_maturity == 3 or \
						days_until_maturity == 7 or days_until_maturity == 14:
						if l.company_id not in loans_to_notify:
							loans_to_notify[l.company_id] = [];
						loans_to_notify[l.company_id].append(l)

			notified_loans, _ = coming_due_report.process_loan_chunk(session, 
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports",
				payment_link = "http://localhost:3005/1/loans", 
				loans_to_notify = loans_to_notify,
				today = parser.parse('2020-10-01T16:33:27.69-08:00')
			)

			notified_loan_count = 0
			for _, loans in notified_loans.items():
				notified_loan_count += len(loans)
			self.assertEqual(notified_loan_count, 1)

class TestReportsMonthlyLoanSummaryLOCView(db_unittest.TestCase):
	def test_get_end_of_report_month_financial_summary(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_financial_summaries_for_company(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)

			fs = loc_summary.get_end_of_report_month_financial_summary(session, company_id, rgc)
			
			self.assertEqual(fs.date, get_relative_date(TODAY, -1).date())
		
	def test_get_report_month_repayments(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_payments_for_company(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			principal_repayments, interest_repayments, fee_repayments, account_fee_repayments = loc_summary.get_report_month_repayments(
				session,
				company_id,
				rgc
			)
			self.assertEqual(principal_repayments, 7000.0)
			self.assertEqual(interest_repayments, 1500.0)
			self.assertEqual(fee_repayments, 300.0)

	def test_get_report_month_advances(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_loans_for_loc_summary(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			advanced_amount = loc_summary.get_report_month_advances(
				session,
				company_id,
				rgc
			)
			self.assertEqual(advanced_amount, 30000.0)

	def test_get_cmi_and_mmf(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			setup_data_for_cmi_and_mmf(session, company_id, cmi_should_be_higher = False)


			contract, err = contract_util.get_active_contract_by_company_id(company_id, session)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			previous_report_month_last_day = date_util.get_report_month_last_day(rgc.report_month_last_day)

			financial_summary = loc_summary.get_end_of_report_month_financial_summary(session, company_id, rgc)
			
			cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = loc_summary.get_cmi_and_mmf(
				session, 
				contract, 
				company_id, 
				rgc,
				interest_fee_balance = 23.74,
				previous_report_month_last_day = previous_report_month_last_day,
				financial_summary = financial_summary
			)

			# In this case, CMI is larger
			cmi, mmf, total_outstanding_interest = cmi_mmf_scores
			self.assertEqual(cmi, 22025.0)
			self.assertEqual(mmf, 20000.0)
			self.assertEqual(total_outstanding_interest, 1800.0)
			self.assertEqual(cmi_or_mmf_amount, 22025.00)

			# Reuse previous setup and tweak month start financial summary for the case
			# when minimum monthly fee is larger
			fs = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == company_id
				).filter(
					models.FinancialSummary.date == rgc.report_month_first_day
				).first())
			fs.total_outstanding_principal_for_interest = Decimal(80.0)
			session.add(fs)
			session.commit()

			cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = loc_summary.get_cmi_and_mmf(
				session, 
				contract, 
				company_id, 
				rgc,
				interest_fee_balance = 0.0,
				previous_report_month_last_day = previous_report_month_last_day,
				financial_summary = financial_summary
			)

			cmi, mmf, total_outstanding_interest = cmi_mmf_scores
			self.assertEqual(cmi, 22025.0)
			self.assertEqual(mmf, 20000.0)
			self.assertEqual(total_outstanding_interest, 1800.0)
			self.assertEqual(cmi_or_mmf_amount, 22025.00)

	def test_prepare_html_for_attachment(self) -> None:
		# This is just the template data stubs from sendgrid
		# since we are only testing to make sure that the html and pdf files are valid
		# we don't need to be concerned about using real data from the platform
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()
		template_data : Dict[str, object] = {
		    "company_user": "JR Smith",
		    "statement_month": "October 2021",
		    "automatic_debit_date": "10/5/2021",
		    "company_name": "Colorado Cliffs",
		    "previous_principal_balance": "$5,000,000.00",
		    "principal_repayments": "$0.00",
		    "principal_advanced": "$136,279.13",
		    "current_principal_balance": "$5,136,279.13",
		    "previous_interest_and_fees_billed": "$129,996.31",
		    "interest_and_fee_payments": "($129,996.31)",
		    "cmi_or_mmf_title": "Current Month's Interest",
		    "cmi_or_mmf_amount": "$120,818.47",
		    "minimum_payment_due": "$120,818.47",
		    "days_in_cycle": "31",
		    "total_credit_line": "$4,672,714.81",
		    "available_credit": "-$463,564.32",
		    "statement_date": "5/31/2021",
		    "payment_due_date": "10/31/2021",
		    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>"
		}
		html = loc_summary.prepare_html_for_attachment(template_data)
		is_valid_html = bool(BeautifulSoup(html, "html.parser").find())

		self.assertEqual(is_valid_html, True)


	def test_get_minimum_payment_due(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			setup_data_for_cmi_and_mmf(session, company_id, cmi_should_be_higher = True)

			# This was taken from the cmf test above
			cmi_mmf_scores = (27000.0, 20000.0, 80.0)
			"""
			minimum_payment_due, minimum_payment_amount = loc_summary.get_minimum_payment_due(
				cmi_mmf_scores, 
				previous_outstanding_account_fees = 0.0,
				interest_repayments = 20.0, 
				interest_fee_balance = 23.74)
			"""
			minimum_payment_due, minimum_payment_amount = loc_summary.get_minimum_payment_due(
				previous_interest_and_fees_billed = 20.0,
				interest_and_fee_repayments = 20.0,
				cmi_or_mmf_amount = 27060.00)

			self.assertEqual(minimum_payment_due, '$27,060.00')
			self.assertEqual(minimum_payment_amount, 27060.00)

	def test_get_available_credit(self) -> None:
		loc_summary = report_generation.ReportsMonthlyLoanSummaryLOCView()

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			setup_data_for_available_credit(session, company_id)

			available_credit = loc_summary.get_available_credit(session, company_id, 4000.00, 50000.00)
			self.assertEqual(available_credit, 46000.0)

class TestReportsMonthlyLoanSummaryNoneLOCView(db_unittest.TestCase):
	def setup_loans_for_non_loc_html_generation(
		self,
		session: Session,
		company_id: str
		) -> Tuple[List[models.Loan], Dict[str, models.Company], Dict[str, loan_balances.CustomerBalance]]:
		loans = []

		test_company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())
		
		vendor_id = uuid.uuid4()
		test_vendor = models.Company(
			id = vendor_id,
			is_customer = False, # because vendor
			name = "Best Nuggies",
			identifier = "BNGS",
			contract_name = "Best Nuggies",
			dba_name = "Best Nuggies, Inc.",
			company_settings_id = None
		)
		session.add(test_vendor)

		po_id = uuid.uuid4()
		session.add(models.PurchaseOrder( # type: ignore
			id = po_id,
			company_id = company_id,
			vendor_id = vendor_id,
			order_number = str(1),
			order_date = get_relative_date(TODAY, -4),
			delivery_date = get_relative_date(TODAY, -3),
			amount = Decimal(10000.0),
			is_cannabis = True,
			is_metrc_based = False,
			customer_note = "I'm a note",
			status = RequestStatusEnum.APPROVED,
		))

		loan_id = uuid.uuid4()
		loans.append(models.Loan(
			id = loan_id,
			company_id = company_id,
			loan_type = LoanTypeEnum.INVENTORY,
			status = LoanStatusEnum.APPROVED,
			artifact_id = po_id,
			origination_date = get_relative_date(TODAY, -29),
			funded_at = get_relative_date(TODAY, -28),
			identifier = str(1),
			amount = Decimal(10000.0),
			requested_payment_date = get_relative_date(TODAY, -4),
		))

		company_lookup = {}
		company_lookup[str(vendor_id)] = test_vendor
		company_lookup[str(company_id)] = test_company

		customer_balance = loan_balances.CustomerBalance(test_company.as_dict(), self.session_maker)
		company_balance_lookup: Dict[str, loan_balances.CustomerBalance] = {}
		company_balance_lookup[company_id] = customer_balance

		return loans, company_lookup, company_balance_lookup

	def test_prepare_html_for_attachment(self) -> None:
		non_loc_summary = report_generation.ReportsMonthlyLoanSummaryNonLOCView()
		
		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			loans, company_lookup, company_balance_lookup = self.setup_loans_for_non_loc_html_generation(session, company_id)


			report_month_last_day = date_util.get_report_month_last_day(TODAY.date())
			report_month_first_day = date_util.get_first_day_of_month_date(date_util.date_to_str(report_month_last_day))

			rgc = ReportGenerationContext(
				company_lookup = company_lookup,
				as_of_date = "2020-09-30"
			)

			template_data : Dict[str, object] = {
				"company_user": "JR Smith",
				"company_name": "Colorado Cliffs",
				"send_date": "10/1/2021",
				"support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
				"statement_month": "October 2021"
			}
			html = non_loc_summary.prepare_html_for_attachment(
				session, 
				company_id, 
				template_data, 
				loans, 
				rgc, 
				company_balance_lookup,
				is_unit_test=True
			)
			is_valid_html = bool(BeautifulSoup(html, "html.parser").find())

			self.assertEqual(is_valid_html, True)
