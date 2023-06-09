import json
import datetime
import uuid
from typing import Dict, List, Tuple, cast
from sqlalchemy.orm.session import Session
from decimal import *
from bs4 import BeautifulSoup # type: ignore

from bespoke.date import date_util
from bespoke.db.db_constants import (ProductType, PaymentType, PaymentMethodEnum, 
	LoanTypeEnum, LoanStatusEnum, RequestStatusEnum)
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.model_types import PaymentItemsCoveredDict
from bespoke.finance import contract_util
from bespoke.finance.reports import loan_balances
from bespoke.reports.report_generation_util import *
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper
from server.views import report_generation
from dateutil import parser

TODAY = parser.parse('2020-10-01T16:33:27.69-08:00')
TODAY_DATE = TODAY.date()

def get_relative_date(base_date: datetime.datetime, offset: int) -> datetime.datetime:
	return base_date + date_util.timedelta(days=offset)

def _get_late_fee_structure() -> str:
	return json.dumps({
		'1-14': 0.25,
		'15-29': 0.50,
		'30+': 1.0
	})

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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
		late_fees_accrued_today = Decimal(0.0),
		product_type = None,
		needs_recompute = False,
		days_to_compute_back = None,
		loans_info = {}
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
			late_fees_accrued_today = Decimal(0.0),
			product_type = None,
			needs_recompute = False,
			days_to_compute_back = None,
			loans_info = {}
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
			late_fees_accrued_today = Decimal(0.0),
			product_type = None,
			needs_recompute = False,
			days_to_compute_back = None,
			loans_info = {}
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
	
def setup_for_past_or_coming_due_test(
	session: Session,
	num_happy_path_loans: int,
	is_past_due: bool,
	) -> List[str]:
	company_ids = [
		uuid.uuid4(),
		uuid.uuid4(),
		uuid.uuid4(),
	]

	# needed for the notified 
	for i in range(len(company_ids)):
		session.add(models.Company(
			id = company_ids[i],
			parent_company_id = uuid.uuid4(),
			name = "Company " + str(i)
		))
		session.add(models.CompanySettings(
			company_id = company_ids[i],
			is_dummy_account = False,
			# is_dummy_account = True,
			is_autogenerate_repayments_enabled = True,
		))

	# we return this to make testing the next step, get_loans_to_notify, easier to test
	company_id_strings = [
		str(company_ids[0]),
		str(company_ids[1]),
		str(company_ids[2]),
	]

	for i in range(num_happy_path_loans):
		if is_past_due:
			calculated_date = TODAY.date() + datetime.timedelta(-1 * i)
			earlier_date = calculated_date + datetime.timedelta(-60)
		else:
			calculated_date = TODAY.date() + datetime.timedelta(i)
			earlier_date = calculated_date + datetime.timedelta(60)

		test_amount = Decimal(12000 * (i + 1))

		purchase_order_id = uuid.uuid4()
		session.add(models.PurchaseOrder(
			id = purchase_order_id,
			order_number = "TESTPO-" + str(i),
			approved_at = TODAY + datetime.timedelta(-65),
			amount = test_amount,
			amount_funded = test_amount,
			status = RequestStatusEnum.APPROVED,
			delivery_date = calculated_date
		))

		loan = models.Loan()
		loan.company_id = company_ids[i % len(company_ids)]
		loan.artifact_id = purchase_order_id
		loan.identifier = str(i)
		loan.origination_date = earlier_date
		loan.maturity_date = calculated_date
		loan.adjusted_maturity_date = calculated_date
		loan.status = LoanStatusEnum.APPROVED
		loan.loan_type = LoanTypeEnum.INVENTORY
		loan.amount = test_amount
		loan.outstanding_principal_balance = Decimal(10000 * (i + 1))
		loan.outstanding_interest = Decimal(500)
		loan.outstanding_fees = Decimal(25)

		session.add(loan)

	# Adding loans that should *NOT* be picked up by the query
	# This tests to make sure our filters are setup properly

	rejected_loan = models.Loan()
	rejected_loan.company_id = company_ids[0]
	rejected_loan.origination_date = TODAY.date() + datetime.timedelta(-7)
	rejected_loan.rejected_at = TODAY + datetime.timedelta(-7)
	rejected_loan.status = LoanStatusEnum.REJECTED
	rejected_loan.loan_type = LoanTypeEnum.INVENTORY
	rejected_loan.amount = Decimal(12000)
	rejected_loan.outstanding_principal_balance = Decimal(10000)
	rejected_loan.outstanding_interest = Decimal(500)
	rejected_loan.outstanding_fees = Decimal(25)
	session.add(rejected_loan)

	closed_loan = models.Loan()
	closed_loan.company_id = company_ids[1]
	closed_loan.origination_date = TODAY.date() + datetime.timedelta(-65)
	closed_loan.maturity_date = TODAY.date() + datetime.timedelta(-60)
	closed_loan.adjusted_maturity_date = TODAY.date() + datetime.timedelta(-60)
	closed_loan.closed_at = TODAY + datetime.timedelta(-60)
	closed_loan.status = LoanStatusEnum.CLOSED
	closed_loan.loan_type = LoanTypeEnum.INVENTORY
	closed_loan.amount = Decimal(12000)
	closed_loan.outstanding_principal_balance = Decimal(10000)
	closed_loan.outstanding_interest = Decimal(500)
	closed_loan.outstanding_fees = Decimal(25)
	session.add(closed_loan)

	no_origination_date_loan = models.Loan()
	no_origination_date_loan.company_id = company_ids[2]
	no_origination_date_loan.maturity_date = TODAY.date() + datetime.timedelta(-7)
	no_origination_date_loan.adjusted_maturity_date = TODAY.date() + datetime.timedelta(-7)
	no_origination_date_loan.status = LoanStatusEnum.APPROVED
	no_origination_date_loan.loan_type = LoanTypeEnum.INVENTORY
	no_origination_date_loan.amount = Decimal(12000)
	no_origination_date_loan.outstanding_principal_balance = Decimal(10000)
	no_origination_date_loan.outstanding_interest = Decimal(500)
	no_origination_date_loan.outstanding_fees = Decimal(25)
	session.add(no_origination_date_loan)

	no_adjusted_maturity_date_loan = models.Loan()
	no_adjusted_maturity_date_loan.company_id = company_ids[0]
	no_adjusted_maturity_date_loan.origination_date = TODAY.date() + datetime.timedelta(-65)
	no_adjusted_maturity_date_loan.maturity_date = TODAY.date() + datetime.timedelta(-7)
	no_adjusted_maturity_date_loan.status = LoanStatusEnum.APPROVED
	no_adjusted_maturity_date_loan.loan_type = LoanTypeEnum.INVENTORY
	no_adjusted_maturity_date_loan.amount = Decimal(12000)
	no_adjusted_maturity_date_loan.outstanding_principal_balance = Decimal(10000)
	no_adjusted_maturity_date_loan.outstanding_interest = Decimal(500)
	no_adjusted_maturity_date_loan.outstanding_fees = Decimal(25)
	session.add(no_adjusted_maturity_date_loan)

	draft_loan = models.Loan()
	draft_loan.company_id = company_ids[1]
	draft_loan.origination_date = TODAY.date() + datetime.timedelta(6)
	draft_loan.maturity_date = TODAY.date() + datetime.timedelta(66)
	draft_loan.adjusted_maturity_date = TODAY.date() + datetime.timedelta(66)
	draft_loan.status = LoanStatusEnum.DRAFTED
	draft_loan.loan_type = LoanTypeEnum.INVENTORY
	draft_loan.amount = Decimal(12000)
	draft_loan.outstanding_principal_balance = Decimal(10000)
	draft_loan.outstanding_interest = Decimal(500)
	draft_loan.outstanding_fees = Decimal(25)
	session.add(draft_loan)

	line_of_credit_loan = models.Loan()
	line_of_credit_loan.company_id = company_ids[2]
	line_of_credit_loan.origination_date = TODAY.date() + datetime.timedelta(-6)
	line_of_credit_loan.maturity_date = TODAY.date() + datetime.timedelta(66)
	line_of_credit_loan.adjusted_maturity_date = TODAY.date() + datetime.timedelta(66)
	line_of_credit_loan.status = LoanStatusEnum.APPROVED
	line_of_credit_loan.loan_type = LoanTypeEnum.LINE_OF_CREDIT
	line_of_credit_loan.amount = Decimal(12000)
	line_of_credit_loan.outstanding_principal_balance = Decimal(10000)
	line_of_credit_loan.outstanding_interest = Decimal(500)
	line_of_credit_loan.outstanding_fees = Decimal(25)
	session.add(line_of_credit_loan)

	# This section adds a customer with a loan, but the customer has
	# opted into the auto-generated repayment flow
	if is_past_due is False:
		opted_in_customer_id = str(uuid.uuid4())

		session.add(models.Company(
			id = opted_in_customer_id,
			parent_company_id = uuid.uuid4(),
			name = "Test Company",
			is_customer = True,
			identifier = "TC",
		))

		session.add(models.CompanySettings(
			company_id = opted_in_customer_id,
			#is_dummy_account = False,
			is_dummy_account = True,
			is_autogenerate_repayments_enabled = True,
		))

		calculated_date = TODAY.date() + datetime.timedelta(i)
		earlier_date = calculated_date + datetime.timedelta(60)

		loan = models.Loan()
		loan.company_id = opted_in_customer_id
		loan.artifact_id = str(uuid.uuid4())
		loan.identifier = "1"
		loan.origination_date = TODAY_DATE + datetime.timedelta(days = -60)
		loan.maturity_date = TODAY_DATE + datetime.timedelta(days = 2)
		loan.adjusted_maturity_date = TODAY_DATE + datetime.timedelta(days = 2)
		loan.status = LoanStatusEnum.APPROVED
		loan.loan_type = LoanTypeEnum.INVENTORY
		loan.amount = Decimal(10000)
		loan.outstanding_principal_balance = Decimal(10000)
		loan.outstanding_interest = Decimal(500)
		loan.outstanding_fees = Decimal(25)

		session.add(loan)

	return company_id_strings

class TestReportsLoansPastDueView(db_unittest.TestCase):
	def test_past_due_loans_report_generation(self) -> None:

		with session_scope(self.session_maker) as session:
			company_id_strings = setup_for_past_or_coming_due_test(
				session, 
				num_happy_path_loans = 14, 
				is_past_due = True
			)
			session.flush()
			company_id = company_id_strings[0]
			all_open_loans = get_all_open_loans_from_company(session, company_id, TODAY.date(), is_past_due = True)
			all_open_loans1 = get_all_open_loans_from_company(session, company_id_strings[1], TODAY.date(), is_past_due = True)
			all_open_loans2 = get_all_open_loans_from_company(session, company_id_strings[2], TODAY.date(), is_past_due = True)

			# 13 because the first generated loan should be for constant TODAY, which won't be past due
			self.assertEqual(len(all_open_loans) + len(all_open_loans1) + len(all_open_loans2), 13)

			# loans assigned to companies based of a mod divided range iterator
			loans_to_notify = get_past_due_loans_to_notify(session, company_id, TODAY.date())
			loans_to_notify1 = get_past_due_loans_to_notify(session, company_id_strings[1], TODAY.date())
			loans_to_notify2 = get_past_due_loans_to_notify(session, company_id_strings[2], TODAY.date())

			self.assertEqual(len(loans_to_notify), 4)
			self.assertEqual(len(loans_to_notify1), 5)
			self.assertEqual(len(loans_to_notify2), 4)
			
			# check the generated table html for all the pertinent loan details
			email_row_loans = loans_to_notify
			running_total, rows_html = prepare_past_due_email_rows(session, email_row_loans, TODAY_DATE)
			self.assertEqual(running_total, 342100.0)

			# check first loan
			first_loan_identifier = rows_html.find("<td>L3</td>")
			first_loan_days_past_due = rows_html.find("<td>3</td>")
			first_loan_maturity_date = rows_html.find("<td>09/28/2020</td>")
			first_loan_outstanding_total = rows_html.find("<td>$40,525.00</td>")
			first_loan_outstanding_principal = rows_html.find("<td>$40,000.00</td>")
			first_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			first_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(first_loan_identifier, -1)
			self.assertNotEqual(first_loan_days_past_due, -1)
			self.assertNotEqual(first_loan_maturity_date, -1)
			self.assertNotEqual(first_loan_outstanding_total, -1)
			self.assertNotEqual(first_loan_outstanding_principal, -1)
			self.assertNotEqual(first_loan_outstanding_interest, -1)
			self.assertNotEqual(first_loan_outstanding_fees, -1)

			# check second loan
			second_loan_identifier = rows_html.find("<td>L6</td>")
			second_loan_days_past_due = rows_html.find("<td>6</td>")
			second_loan_maturity_date = rows_html.find("<td>09/22/2020</td>")
			second_loan_outstanding_total = rows_html.find("<td>$70,525.00</td>")
			second_loan_outstanding_principal = rows_html.find("<td>$70,000.00</td>")
			second_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			second_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(second_loan_identifier, -1)
			self.assertNotEqual(second_loan_days_past_due, -1)
			self.assertNotEqual(second_loan_maturity_date, -1)
			self.assertNotEqual(second_loan_outstanding_total, -1)
			self.assertNotEqual(second_loan_outstanding_principal, -1)
			self.assertNotEqual(second_loan_outstanding_interest, -1)
			self.assertNotEqual(second_loan_outstanding_fees, -1)

			# check third loan
			third_loan_identifier = rows_html.find("<td>L9</td>")
			third_loan_days_past_due = rows_html.find("<td>9</td>")
			third_loan_maturity_date = rows_html.find("<td>09/22/2020</td>")
			third_loan_outstanding_total = rows_html.find("<td>$100,525.00</td>")
			third_loan_outstanding_principal = rows_html.find("<td>$100,000.00</td>")
			third_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			third_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(third_loan_identifier, -1)
			self.assertNotEqual(third_loan_days_past_due, -1)
			self.assertNotEqual(third_loan_maturity_date, -1)
			self.assertNotEqual(third_loan_outstanding_total, -1)
			self.assertNotEqual(third_loan_outstanding_principal, -1)
			self.assertNotEqual(third_loan_outstanding_interest, -1)
			self.assertNotEqual(third_loan_outstanding_fees, -1)

			# check fourth loan
			fourth_loan_identifier = rows_html.find("<td>L12</td>")
			fourth_loan_days_past_due = rows_html.find("<td>12</td>")
			fourth_loan_maturity_date = rows_html.find("<td>09/19/2020</td>")
			fourth_loan_outstanding_total = rows_html.find("<td>$130,525.00</td>")
			fourth_loan_outstanding_principal = rows_html.find("<td>$130,000.00</td>")
			fourth_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			fourth_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(fourth_loan_identifier, -1)
			self.assertNotEqual(fourth_loan_days_past_due, -1)
			self.assertNotEqual(fourth_loan_maturity_date, -1)
			self.assertNotEqual(fourth_loan_outstanding_total, -1)
			self.assertNotEqual(fourth_loan_outstanding_principal, -1)
			self.assertNotEqual(fourth_loan_outstanding_interest, -1)
			self.assertNotEqual(fourth_loan_outstanding_fees, -1)		
			
			# check notified_loan_count
			notified_loans, err_msg = process_past_due_loan_chunk(
				session, 
				company_id = company_id,
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports",
				payment_link = "http://localhost:3005/1/loans", 
				loans = loans_to_notify
			)

			self.assertEqual(notified_loans, True)
			self.assertEqual(err_msg, None)

class TestReportsLoansComingDueView(db_unittest.TestCase):
	def test_coming_due_loans_report_generation(self) -> None:

		with session_scope(self.session_maker) as session:
			company_id_strings = setup_for_past_or_coming_due_test(
				session, 
				num_happy_path_loans = 15, 
				is_past_due = False
			)
			session.flush()

			company_id = company_id_strings[0]

			all_open_loans = get_all_open_loans(session, TODAY.date(), is_past_due = False)
			# 15 because the first generated loan should be for constant TODAY
			# which is included in the calculation for coming due
			self.assertEqual(len(all_open_loans), 16)

			# loans assigned to companies based of a mod divided range iterator
			# and are also filtered if their days before loan due is in [1, 3, 7]
			loans_to_notify = get_coming_due_loans_to_notify(session, company_id_strings[0], TODAY.date())
			loans_to_notify2 = get_coming_due_loans_to_notify(session, company_id_strings[2], TODAY.date())
			self.assertEqual(len(loans_to_notify), 2)
			self.assertEqual(len(loans_to_notify2), 1)

			# this test was originally checking for a 14 days coming due loan
			# since we're no longer pulling for 14 days, we're making sure
			# that this customer doesn't have any loans to notify
			loans_to_notify1 = get_coming_due_loans_to_notify(session, company_id_strings[1], TODAY.date())
			self.assertEqual(len(loans_to_notify1), 0)

			email_row_loans = loans_to_notify
			running_total, rows_html = prepare_coming_due_email_rows(session, email_row_loans)
			self.assertEqual(running_total, 81050.0)

			# check first loan
			first_loan_identifier = rows_html.find("<td>L0</td>")
			first_loan_artifact_identifier = rows_html.find("<td>PTESTPO-0</td>")
			first_loan_maturity_date = rows_html.find("<td>10/01/2020</td>")
			first_loan_outstanding_total = rows_html.find("<td>$10,525.00</td>")
			first_loan_outstanding_principal = rows_html.find("<td>$10,000.00</td>")
			first_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			first_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(first_loan_identifier, -1)
			self.assertNotEqual(first_loan_artifact_identifier, -1)
			self.assertNotEqual(first_loan_maturity_date, -1)
			self.assertNotEqual(first_loan_outstanding_total, -1)
			self.assertNotEqual(first_loan_outstanding_principal, -1)
			self.assertNotEqual(first_loan_outstanding_interest, -1)
			self.assertNotEqual(first_loan_outstanding_fees, -1)

			# check second loan
			second_loan_identifier = rows_html.find("<td>L6</td>")
			second_loan_artifact_identifier = rows_html.find("<td>PTESTPO-6</td>")
			second_loan_maturity_date = rows_html.find("<td>10/07/2020</td>")
			second_loan_outstanding_total = rows_html.find("<td>$70,525.00</td>")
			second_loan_outstanding_principal = rows_html.find("<td>$70,000.00</td>")
			second_loan_outstanding_interest = rows_html.find("<td>$500.00</td>")
			second_loan_outstanding_fees = rows_html.find("<td>$25.00</td>")
			self.assertNotEqual(second_loan_identifier, -1)
			self.assertNotEqual(second_loan_artifact_identifier, -1)
			self.assertNotEqual(second_loan_maturity_date, -1)
			self.assertNotEqual(second_loan_outstanding_total, -1)
			self.assertNotEqual(second_loan_outstanding_principal, -1)
			self.assertNotEqual(second_loan_outstanding_interest, -1)
			self.assertNotEqual(second_loan_outstanding_fees, -1)

			# check notified_loan_count
			notified_loans, err_msg = process_coming_due_loan_chunk(
				session,
				company_id = company_id, 
				sendgrid_client = None, 
				report_link = "http://localhost:3005/1/reports",
				payment_link = "http://localhost:3005/1/loans", 
				loans = loans_to_notify
			)

			self.assertEqual(notified_loans, True)
			self.assertEqual(err_msg, None)

class TestReportsMonthlyLoanSummaryLOCView(db_unittest.TestCase):
	def test_get_end_of_report_month_financial_summary(self) -> None:

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_financial_summaries_for_company(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)

			fs = get_end_of_report_month_financial_summary_for_loc(session, company_id, rgc)
			
			self.assertEqual(fs.date, get_relative_date(TODAY, -1).date())
		
	def test_get_report_month_repayments(self) -> None:

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_payments_for_company(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			principal_repayments, interest_repayments, fee_repayments, account_fee_repayments = get_report_month_repayments_for_loc(
				session,
				company_id,
				rgc
			)
			self.assertEqual(principal_repayments, 7000.0)
			self.assertEqual(interest_repayments, 1500.0)
			self.assertEqual(fee_repayments, 300.0)

	def test_get_report_month_advances(self) -> None:

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			add_loans_for_loc_summary(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			advanced_amount = get_report_month_advances_for_loc(
				session,
				company_id,
				rgc
			)
			self.assertEqual(advanced_amount, 30000.0)

	def test_get_cmi_and_mmf(self) -> None:

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			setup_data_for_cmi_and_mmf(session, company_id, cmi_should_be_higher = False)


			contract, err = contract_util.get_active_contract_by_company_id(session, company_id)

			rgc = ReportGenerationContext(
				company_lookup = None,
				as_of_date = "2020-09-30"
			)
			previous_report_month_last_day = date_util.get_previous_month_last_date(rgc.report_month_last_day)

			financial_summary = get_end_of_report_month_financial_summary_for_loc(session, company_id, rgc)
			
			cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = get_cmi_and_mmf_for_loc(
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

			cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = get_cmi_and_mmf_for_loc(
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
		html = prepare_html_for_attachment_for_loc(template_data)
		is_valid_html = bool(BeautifulSoup(html, "html.parser").find())

		self.assertEqual(is_valid_html, True)


	def test_get_minimum_payment_due(self) -> None:

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
			minimum_payment_due, minimum_payment_amount = get_minimum_payment_due_for_loc(
				previous_interest_and_fees_billed = 20.0,
				interest_and_fee_repayments = 20.0,
				cmi_or_mmf_amount = 27060.00)

			self.assertEqual(minimum_payment_due, '$27,060.00')
			self.assertEqual(minimum_payment_amount, 27060.00)

	def test_get_available_credit(self) -> None:

		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			setup_data_for_available_credit(session, company_id)

			available_credit = get_available_credit_for_loc(session, company_id, 4000.00, 50000.00)
			self.assertEqual(available_credit, 46000.0)

class TestReportsMonthlyLoanSummaryNonLOCView(db_unittest.TestCase):
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

		customer_balance = loan_balances.CustomerBalance(test_company.as_dict(), session)
		company_balance_lookup: Dict[str, loan_balances.CustomerBalance] = {}
		company_balance_lookup[company_id] = customer_balance

		return loans, company_lookup, company_balance_lookup

	def test_prepare_html_for_attachment(self) -> None:		
		
		with session_scope(self.session_maker) as session:
			seed = test_helper.BasicSeed.create(self.session_maker, self)
			seed.initialize()

			company_id = seed.get_company_id('company_admin', index=0)
			loans, company_lookup, company_balance_lookup = self.setup_loans_for_non_loc_html_generation(session, company_id)


			report_month_last_day = date_util.get_previous_month_last_date(TODAY.date())
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
			html, err = prepare_html_for_attachment_for_non_loc(
				session, 
				company_id, 
				template_data, 
				loans, 
				rgc, 
				company_balance_lookup,
				company_identifier = "CC",
				is_unit_test=True
			)
			is_valid_html = bool(BeautifulSoup(html, "html.parser").find())

			self.assertEqual(is_valid_html, True)
			self.assertIsNone(err)
