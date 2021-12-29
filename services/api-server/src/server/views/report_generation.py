import base64
import datetime
import json
import logging
import math
import os
import time
import typing
from decimal import *
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple, cast

import pdfkit
import requests
from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import (DBOperation, LoanStatusEnum, LoanTypeEnum,
                                     PaymentType)
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans import reports_util
from bespoke.finance.payments import fees_due_util
from bespoke.finance.types.payment_types import PaymentItemsCoveredDict
from bespoke.metrc.common.metrc_common_util import chunker, chunker_dict
from bespoke.reports.reports_util import (prepare_email_attachment,
                                          record_report_run_metadata)
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sendgrid.helpers.mail import (Attachment, Disposition, FileContent,
                                   FileName, FileType)
from server.config import Config
from server.views.common import auth_util, handler_util
from sqlalchemy import func
from sqlalchemy.orm.session import Session

handler = Blueprint('report_generation', __name__)

class ReportsLoansComingDueView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	def get_artifact_string(self, loan: models.Loan, session : Session) -> str:
		artifact_string = "<td></td>"
		if loan.loan_type == LoanTypeEnum.INVOICE:
			invoice = cast(
				models.Invoice,
				session.query(models.Invoice).filter(
					models.Invoice.id == loan.artifact_id)
				.first())

			if invoice is not None:
				artifact_string = "<td>" + invoice.invoice_number + "</td>"
		else:
			po = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter(
					models.PurchaseOrder.id == loan.artifact_id)
				.first())

			if po is not None:
				artifact_string = "<td>P" + po.order_number + "</td>"

		return artifact_string

	def prepare_email_rows(self, loans : List[models.Loan], session : Session) -> Tuple[float, str]:
		running_total = 0.0
		rows_html = ""
		for l in loans:
			principal = float(l.outstanding_principal_balance) if l.outstanding_principal_balance is not None else 0.0
			interest = float(l.outstanding_interest) if l.outstanding_interest is not None else 0.0
			fees = float(l.outstanding_fees) if l.outstanding_fees is not None else 0.0

			loan_total = principal + interest + fees
			running_total += float(loan_total)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
				rows_html += self.get_artifact_string(l, session)
			rows_html += "<td>" + str(l.maturity_date) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(loan_total) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(principal) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(interest) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(fees) + "</td>"
			rows_html += "</tr>"

		return running_total, rows_html

	def process_loan_chunk(
		self,
		session : Session, 
		sendgrid_client : sendgrid_util.Client, 
		report_link : str, 
		payment_link : str, 
		loans_chunk : List[models.Loan],
		today : datetime.datetime
		) -> Tuple[Dict[str, List[models.Loan]], Response]:
		# filter for loans that have platform team specified numbers of days
		# before loan maturity, group by company_id to make sending out
		# a unified email to each company more straightforward
		loans_to_notify : Dict[str, List[models.Loan] ] = {}
		for l in loans_chunk:
			if l.origination_date is not None and l.maturity_date is not None and \
				l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
				days_until_maturity = date_util.num_calendar_days_passed(today.date(), l.maturity_date);
				if days_until_maturity == 1 or days_until_maturity == 3 or \
					days_until_maturity == 7 or days_until_maturity == 14:
					if l.company_id not in loans_to_notify:
						loans_to_notify[l.company_id] = [];
					loans_to_notify[l.company_id].append(l)

		for company_id, loans in loans_to_notify.items():
			# line of credit loans are slated for a different flow as part of future work
			if loans[0].loan_type == LoanTypeEnum.LINE_OF_CREDIT:
				continue

			# get company contact email, company name
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id)
				.first())
			
			all_users = models_util.get_active_users(company_id=company_id, session=session)
			for contact_user in all_users:
				contact_user_full_name = contact_user.first_name + " " + contact_user.last_name
				
				running_total, rows_html = self.prepare_email_rows(loans, session)
				total_string = number_util.to_dollar_format(running_total)

				# SendGrid worked inconsistently when using booleans as input data
				# "True" vs "" works consistently
				show_invoice_column = ""
				show_purchase_order_column = ""
				if loans[0].loan_type == LoanTypeEnum.INVOICE:
					show_invoice_column = "True"
				else:
					show_purchase_order_column = "True"

				template_data = {
					"company_user": contact_user_full_name,
				    "company_name": company.name,
				    "balance_due": total_string,
				    "report_link": report_link,
				    "rows": rows_html,
				    "send_date": date_util.human_readable_yearmonthday(date_util.now()),
				    "payment_link": "<a href='" + payment_link + "'>click here</a>",
				    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
				    "show_invoice_column": show_invoice_column,
				    "show_purchase_order_column": show_purchase_order_column,
				}
				if sendgrid_client is not None:
					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.REPORT_LOANS_COMING_DUE,
						template_data=template_data,
						recipients=[contact_user.email],
					)

					if err:
						return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

		return loans_to_notify, None

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Sending out report emails for loans coming due")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
		payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
		today = date_util.now()
		
		loans : List[models.Loan] = []
		with models.session_scope(current_app.session_maker) as session:
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).filter(
					models.Loan.origination_date != None
				).filter(
					models.Loan.loan_type == LoanTypeEnum.LINE_OF_CREDIT
				).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, report_link, payment_link, loans_chunk, today)

				if err:
					return err;
			
		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for loans coming due."}))

class ReportsLoansPastDueView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	def get_artifact_string(self, loan: models.Loan, session : Session) -> str:
		artifact_string = "<td></td>"
		if loan.loan_type == LoanTypeEnum.INVOICE:
			invoice = cast(
				models.Invoice,
				session.query(models.Invoice).filter(
					models.Invoice.id == loan.artifact_id)
				.first())

			if invoice is not None:
				artifact_string = "<td>" + invoice.invoice_number + "</td>"
		else:
			po = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter(
					models.PurchaseOrder.id == loan.artifact_id)
				.first())

			if po is not None:
				artifact_string = "<td>P" + po.order_number + "</td>"

		return artifact_string

	def prepare_email_rows(self, loans : List[models.Loan], session : Session) -> Tuple[float, str]:
		running_total = 0.0
		rows_html = ""
		for l in loans:
			principal = float(l.outstanding_principal_balance) if l.outstanding_principal_balance is not None else 0.0
			interest = float(l.outstanding_interest) if l.outstanding_interest is not None else 0.0
			fees = float(l.outstanding_fees) if l.outstanding_fees is not None else 0.0

			loan_total = principal + interest + fees
			running_total += float(loan_total)
			days_past_due = date_util.number_days_between_dates(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE), l.maturity_date)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
				rows_html += self.get_artifact_string(l, session)
			rows_html += "<td>" + str(days_past_due) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(loan_total) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(principal) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(interest) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(fees) + "</td>"
			rows_html += "</tr>"

		return running_total, rows_html

	def process_loan_chunk(
		self, 
		session : Session, 
		sendgrid_client : sendgrid_util.Client, 
		report_link : str, 
		payment_link: str,
		loans_chunk : List[models.Loan],
		today : datetime.datetime
		) -> Tuple[Dict[str, List[models.Loan]], Response]:
		# filter for loans that have platform team specified numbers of days
		# before loan maturity, group by company_id to make sending out
		# a unified email to each company more straightforward
		loans_to_notify : Dict[str, List[models.Loan] ] = {}
		for l in loans_chunk:
			if l.origination_date is not None and l.maturity_date is not None and \
				l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
				if date_util.is_past_due(today.date(), l.maturity_date, date_util.DEFAULT_TIMEZONE):
					if l.company_id not in loans_to_notify:
						loans_to_notify[l.company_id] = [];
					loans_to_notify[l.company_id].append(l)

		for company_id, loans in loans_to_notify.items():
			# line of credit loans are slated for a different flow as part of future work
			if loans[0].loan_type == LoanTypeEnum.LINE_OF_CREDIT:
				continue

			# get company contact email, company name
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id)
				.first())
			
			all_users = models_util.get_active_users(company_id=company_id, session=session)
			for contact_user in all_users:
				contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

				running_total, rows_html = self.prepare_email_rows(loans, session)
				total_string = number_util.to_dollar_format(running_total)

				# SendGrid worked inconsistently when using booleans as input data
				# "True" vs "" works consistently
				show_invoice_column = ""
				show_purchase_order_column = ""
				if loans[0].loan_type == LoanTypeEnum.INVOICE:
					show_invoice_column = "True"
				else:
					show_purchase_order_column = "True"

				template_data = {
					"company_user": contact_user_full_name,
				    "company_name": company.name,
				    "balance_due": total_string,
				    "report_link": report_link,
				    "rows": rows_html,
				    "send_date": date_util.human_readable_yearmonthday(date_util.now()),
				    "payment_link": "<a href='" + payment_link + "'>click here</a>",
				    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
				    "show_invoice_column": show_invoice_column,
				    "show_purchase_order_column": show_purchase_order_column,
				}
				if sendgrid_client is not None:
					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.REPORT_LOANS_PAST_DUE,
						template_data=template_data,
						recipients=[contact_user.email],
					)

					if err:
						return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

		return loans_to_notify, None

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Sending out report emails for loans coming due")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
		payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
		today = date_util.now()
		
		loans : List[models.Loan] = []
		with models.session_scope(current_app.session_maker) as session:
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).filter(
					models.Loan.origination_date != None
				).filter(
					models.Loan.loan_type != LoanTypeEnum.LINE_OF_CREDIT
				).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, report_link, payment_link, loans_chunk, today)

				if err:
					return err;
			
		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for loans past due."}))

class ReportsMonthlyLoanSummaryLOCView(MethodView):
	decorators = [auth_util.bank_admin_required]

	def get_end_of_report_month_financial_summary(
		self,
		session : Session,
		company_id : str,
		summary_date : datetime.date,
		) -> Optional[models.FinancialSummary]:
		
		financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter(
				models.FinancialSummary.company_id == company_id
			).filter(
				models.FinancialSummary.date == summary_date
			).first())

		return financial_summary

	def get_report_month_repayments(
		self,
		session : Session,
		company_id : str,
		report_month_first_day : datetime.date,
		report_month_last_day : datetime.date
		) -> Tuple[float, float, float]:
		principal_repayments = 0.0
		interest_repayments = 0.0
		fee_repayments = 0.0

		repayments = cast(
			List[models.Payment],
			session.query(models.Payment).filter(
				models.Payment.company_id == company_id
			).filter(
				models.Payment.payment_date >= report_month_first_day
			).filter(
				models.Payment.payment_date <= report_month_last_day
			).filter(
				models.Payment.type == PaymentType.REPAYMENT
			).all())

		# To get final amounts, we need to query transactions
		# In order to query this in one go, gather up all the repayment ids
		repayment_ids = []
		for r in repayments:
			repayment_ids.append(r.id)
		transactions = cast(
			List[models.Transaction],
			session.query(models.Transaction).filter(
				models.Transaction.payment_id.in_(repayment_ids)
			).all())

		for t in transactions:
			principal_repayments += float(t.to_principal) if t.to_principal is not None else 0.0
			interest_repayments += float(t.to_interest) if t.to_interest is not None else 0.0
			fee_repayments += float(t.to_fees) if t.to_fees is not None else 0.0

		return principal_repayments, interest_repayments, fee_repayments

	def get_report_month_advances(
		self,
		session : Session,
		company_id : str,
		report_month_first_day : datetime.date,
		report_month_last_day : datetime.date
		) -> float:
		# using type ignore here for "Call to untyped function "with_entities" in typed context"
		advanced_amount = session.query(models.Loan).with_entities( # type: ignore
				func.sum(models.Loan.amount)
			).filter(
				models.Loan.company_id == company_id
			).filter(
				cast(Callable, models.Loan.is_deleted.isnot)(True)
			).filter(
				models.Loan.origination_date >= report_month_first_day
			).filter(
				models.Loan.origination_date <= report_month_last_day
			).first()[0]

		return advanced_amount or 0.0

	def get_cmi_and_mmf(
		self,
		session : Session,
		contract : contract_util.Contract,
		company_id : str,
		report_month_first_day : datetime.date,
		report_month_last_day : datetime.date,
		interest_fee_balance: float,
		previous_report_month_last_day: datetime.date,
		) -> Tuple[str, str, Tuple[float, float, float], errors.Error]:
		"""
		- The queries for current monthly interest and minimum monthly fee are combined
			in order to save a save a contract query, but also to abstract away the comparison
			logic to determine which is greater (and displayed)
		- We also return a tuple of (cmi, mmf, outstanding_interest) regardless as 
			that's needed for the minimum payment due calculation. This implies that you
			SHOULD call get_cmi_and_mmf BEFORE get_minimum_payment_due
		"""
		# Minimum Monthly Fee
		# IMPORTANT/TODO(JR): Brittney wanted to punt on how to handle quarterly and annual contract minimums until next month for 2 reasons
		# 1. New comptroller begins Jan 5th, wanted her opinion on the best way to handle the business logic
		# 2. We currently have no quarterly customers and our one annual customer, Standard Holding, has already met their minimum
		#    so defaulting to zero for the minimum_monthly_fee (mmf) is fine because then it will just report the CMI by default, which is desired
		#mmf_tuple = contract.get_minimum_amount_owed_per_duration()
		#mmf = mmf_tuple[0]["amount"] if mmf_tuple is not None else 0
		mmf_tuple = contract._get_minimum_monthly_amount()
		
		mmf = mmf_tuple[0] if mmf_tuple[0] is not None else 0.0

		# Prorating the minimum monthly fee if contract started during report month
		contract_start_date, start_date_err = contract.get_start_date()
		if contract_start_date >= report_month_first_day and \
			contract_start_date <= report_month_last_day:
			days_for_monthly_fee = date_util.number_days_between_dates(
				report_month_last_day,
				contract_start_date
			)
			days_in_month = date_util.get_days_in_month(report_month_last_day)
			mmf = mmf * (float(days_for_monthly_fee) / float(days_in_month))
		
		
		# Used later in get_minimum_payment_due, queried here since
		# we're already getting financial summary information
		previous_month_end_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter(
				models.FinancialSummary.company_id == company_id
			).filter(
				models.FinancialSummary.date == previous_report_month_last_day
			).first())


		# Current Monthly Interest
		# The finance team noted that "CMI is interest accrued during the month, regardless of if it is paid or not"
		# As such, the CMI calculation is comprised of two parts:
		#     1. outstanding principal * (daily interest rate * days in cycle)
		#     2. loans started in report month * (daily interest rate * prorated days in cycle)
		# Those parts are accounted in the financial summaries table, so we can just sum them up here
		cmi = session.query(models.FinancialSummary).with_entities( # type: ignore
				func.sum(models.FinancialSummary.interest_accrued_today)
			).filter(
				models.FinancialSummary.company_id == company_id
			).filter(
				models.FinancialSummary.date >= report_month_first_day
			).filter(
				models.FinancialSummary.date <= report_month_last_day
			).first()[0]
		
		cmi = float(cmi)
		mmf = float(mmf)

		# Compare and determine output
		if cmi > mmf:	
			cmi_or_mmf_title = "Current Month's Interest"
			cmi_or_mmf_amount = cmi
		else:
			cmi_or_mmf_title = "Minimum Monthly Fee"
			cmi_or_mmf_amount = mmf

		total_outstanding_interest = float(previous_month_end_summary.total_outstanding_interest) if previous_month_end_summary is not None else 0.0

		return cmi_or_mmf_title, \
			number_util.to_dollar_format(cmi_or_mmf_amount), \
			(cmi, mmf, total_outstanding_interest), \
			None

	def prepare_html_for_attachment(
		self,
		template_data: Dict[str, object]
		) -> str:
		"""
			HTML attachment is split out to make testing easier. Specifically, so we don't have to
			worry about setting up wkhtmltopdf in a GitHub action. Moreover, wkhtmltopdf is already
			tested in it's own repo, so there's more value in testing the in house generated html
			string for validity than (re)testing the generated pdf for validity
		"""
		# if statement so that we can access the css file during unit tests with minimal changes
		css_path = '../src/server/views/css/monthly_report.css' if 'api-server/test' in os.getcwd() else 'server/views/css/monthly_report.css'
		with open(css_path, 'r') as file:
			css_file = file.read().rstrip()

		html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<style>{ css_file }</style>
</head>
<body>
	<header>
		<div><img class="logo" src="images/bespoke-logo.png" alt="Bespoke Financial Logo" /></div>
		<div class="contact">
		<ul>
			<li>
				<img class="icon" src="images/email.png" alt="Email Icon"/>
				<a href="mailto:info@bespokefinancial">info@bespokefinancial.com</a>
			</li>
			<li>
				<img class="icon" src="images/internet.png" alt="Internet Icon"/>
				<a href="https://bespokefinancial.com/" target="_blank">www.bespokefinancial.com</a>
			</li>
			<li>
				<img class="icon" src="images/phone.png" alt="Phone Icon"/>
				<span>+1 213-282-8411</span>
			</li>
		</ul>
		</div>
	</header>


	<table class="summary-header-table">
        <tbody>
            <tr>
                <td>{ template_data["company_name"] }</td>
                <td>
                	<span class="automatic-debit">
                		<strong>Automatic Debit Date:</strong>
                		{ template_data["automatic_debit_date"] }
                	</span>
                	<span>
                		<strong>Report Month:</strong>
                		{ template_data["statement_month"] }
                	</span>
                </td>
            </tr>
        </tbody>
    </table>

    <table class="loc-summary-row-table">
        <thead>
            <tr>
                <th>Previous Principal Balance</th>
                <th>Principal Repayments</th>
                <th>Principal Advanced</th>
                <th>Current Principal Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{ template_data["previous_principal_balance"] }</td>
                <td>{ template_data["principal_repayments"] }</td>
                <td>{ template_data["principal_advanced"] }</td>
                <td>{ template_data["current_principal_balance"] }</td>
            </tr>
        </tbody>
        </table>
    <table class="loc-summary-row-table">
        <thead>
            <tr>
                <th>Previous Interest &amp; Fees Billed</th>
                <th>Interest &amp; Fee Repayments</th>
                <th>Total Credit Line</th>
                <th>Available Credit</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{ template_data["previous_interest_and_fees_billed"] }</td>
                <td>{ template_data["interest_and_fee_payments"] }</td>
                <td>{ template_data["total_credit_line"] }</td>
                <td>{ template_data["available_credit"] }</td>
            </tr>
        </tbody>
        </table>
        
    <table class="loc-summary-footer-table">
        <tbody>
            <tr>
                <td>Days in Cycle</td>
                <td>{ template_data["days_in_cycle"] }</td>
            </tr>
            <tr>
                <td>{ template_data["cmi_or_mmf_title"] }</td>
                <td>{ template_data["cmi_or_mmf_amount"] }</td>
            </tr>
            <tr>
                <td>Payment Due Date</td>
                <td>{ template_data["payment_due_date"] }</td>
            </tr>
            <tr>
                <td><strong>Minimum Payment Due</strong></td>
                <td><strong>{ template_data["minimum_payment_due"] } </strong></td>
            </tr>
        </tbody>
    </table>
</body>
</html>
		"""

		return html

	def get_available_credit(
		self,
		session: Session,
		company_id: str,
		current_principal_balance: float,
		total_credit_line: float
		) -> float:
		# lesser of:
		#	a. borrowing base - current principal balance
		#	b. total credit line - current principal balance
		company_settings = cast(
			models.CompanySettings,
			session.query(models.CompanySettings).filter(
				models.CompanySettings.company_id == company_id
			).first())

		active_ebba_application_id = company_settings.active_ebba_application_id
		
		ebba_application = cast(
			models.EbbaApplication,
			session.query(models.EbbaApplication).filter(
				models.EbbaApplication.id == active_ebba_application_id
			).first())

		tcl_cpb = total_credit_line - current_principal_balance
		if ebba_application is None:
			available_credit = tcl_cpb
		else:
			borrowing_base = float(ebba_application.calculated_borrowing_base)
			bb_cpb = borrowing_base - current_principal_balance	
			available_credit = bb_cpb if bb_cpb < tcl_cpb else tcl_cpb

		return available_credit

	def get_minimum_payment_due(
		self,
		cmi_mmf_scores: Tuple[float, float, float],
		interest_repayments: float, 
		interest_fee_balance: float
		) -> Tuple[str, float]:
		cmi, mmf, outstanding_interest = cmi_mmf_scores

		cmi_or_mmf = cmi if cmi > mmf else mmf
		minimum_payment_due = outstanding_interest - interest_repayments + cmi_or_mmf
		
		return number_util.to_dollar_format(minimum_payment_due), minimum_payment_due

	def process_loan_chunk(
		self, 
		session : Session, 
		sendgrid_client : sendgrid_util.Client, 
		report_link : str, 
		payment_link: str,
		loans_to_notify : Dict[str, List[models.Loan] ],
		today : datetime.date,
		is_test: bool,
		test_email: str
		) -> Tuple[Dict[str, List[models.Loan]], Response]:
		if sendgrid_client is None:
			return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client does not exist." }))

		# Report Month is the basis for "Current *" amounts in the email
		report_month_last_day = date_util.get_report_month_last_day(today)

		for company_id, loans in loans_to_notify.items():
			# get company contact email, company name
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id
				).first())

			contract, err = contract_util.get_active_contract_by_company_id(company_id, session)
			
			if err:
				return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': \
					"Could not query contract for company " + company.name + ": " + repr(err) }))

			product_config = contract.get_product_config()["v1"]["fields"] if contract is not None else []
			contract_dict = {}
			for pc in product_config:
				contract_dict[pc["internal_name"]] = pc["value"] if pc["value"] is not None else ""
			
			automatic_debit_date = date_util.date_to_str(date_util.get_automated_debit_date(today))
			
			financial_summary = self.get_end_of_report_month_financial_summary(session, company_id, report_month_last_day)

			# Checks for edge case where LoC has started a contract right before this email gets sent
			# (e.g. contract starts 10/1, email sent 10/5, there won't be a report to send)
			if financial_summary is None:
				continue

			interest_plus_fees = float(financial_summary.total_outstanding_interest) + \
				float(financial_summary.total_outstanding_fees)

			# Report Previous Month is the basis for "Previous *" amounts in the email
			previous_report_month_last_day = date_util.get_report_month_last_day(report_month_last_day)
			previous_financial_summary = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == company_id
				).filter(
					models.FinancialSummary.date == previous_report_month_last_day
				).first())

			# We need to gather all repayments for the report month to calculate
			# principal and interest & fee repayment total
			report_month_first_day = fees_due_util._get_first_day_of_month_date(date_util.date_to_str(report_month_last_day))

			advances = self.get_report_month_advances(session, company_id, report_month_first_day, report_month_last_day)
			principal_advanced = number_util.to_dollar_format(advances)

			principal_repayments, interest_repayments, fee_repayments = self.get_report_month_repayments(
				session, 
				company_id, 
				report_month_first_day, 
				report_month_last_day
			)
			principal_repayments_display = number_util.to_dollar_format(principal_repayments)
			interest_fee_repayments_display = number_util.to_dollar_format(interest_repayments + fee_repayments)

			tcl = float(contract_dict["maximum_amount"])
			total_credit_line = number_util.to_dollar_format(tcl)

			# if guard for when LoC customers are just starting out and won't have a previous month
			if previous_financial_summary is not None:
				previous_pb = float(previous_financial_summary.total_outstanding_principal)
				previous_principal_balance = number_util.to_dollar_format(previous_pb)
				previous_interest = float(previous_financial_summary.total_outstanding_interest)
				previous_fees = float(previous_financial_summary.total_outstanding_fees)
				previous_interest_and_fees = number_util.to_dollar_format( \
					previous_interest + \
					previous_fees)

				interest_fee_balance = (interest_repayments + fee_repayments) - previous_interest - previous_fees
			else:
				# Set defaults that make it obvious that there isn't a previous month to pull from
				previous_principal_balance = "N/A"
				previous_interest_and_fees = "N/A"

				interest_fee_balance = (interest_repayments + fee_repayments)


			current_pb = (float(previous_pb) if previous_pb is not None else 0.0) +  \
					float(advances) - float(principal_repayments)
			current_principal_balance = number_util.to_dollar_format(current_pb)

			available_credit = number_util.to_dollar_format(
				self.get_available_credit(
					session,
					company.id,
					current_pb,
					tcl
				)
			)

			min_monthly_payload = cast(Dict[str, Any], financial_summary.minimum_monthly_payload)

			# Current Month's Interest or Min Monthly Fee
			cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = self.get_cmi_and_mmf( \
				session, 
				contract, 
				company_id, 
				report_month_first_day, 
				report_month_last_day,
				interest_fee_balance,
				previous_report_month_last_day
			)
			if err:
				return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Failed to calculate current monthly interest and minimum monthly fee " + repr(err) }))
			
			payment_due_date = date_util.date_to_str(fees_due_util._get_first_day_of_month_date(automatic_debit_date))
			minimum_payment_due, minimum_payment_amount = self.get_minimum_payment_due(cmi_mmf_scores, interest_repayments, interest_fee_balance)

			msc = cast(
				models.MonthlySummaryCalculation,
				session.query(models.MonthlySummaryCalculation).filter(
					models.MonthlySummaryCalculation.company_id == company_id
				).filter(
					models.MonthlySummaryCalculation.report_month == report_month_last_day
				).first())
			if msc is None:
				session.add(models.MonthlySummaryCalculation( # type: ignore
					company_id = company_id,
					report_month = report_month_last_day,
					minimum_payment = Decimal(minimum_payment_amount)
				))
			else:
				msc.minimum_payment = Decimal(minimum_payment_amount)

			statement_month = date_util.human_readable_monthyear(report_month_last_day)

			template_data: Dict[str, object] = {
				# Greeting and preamble
				"automatic_debit_date": automatic_debit_date,

			    # Table Header/Footer
			    "company_name": company.name,
			    "statement_month": statement_month,
			    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",

			    # First Row
			    "previous_principal_balance": previous_principal_balance,
			    "principal_repayments": "(" + principal_repayments_display + ")",
			    "principal_advanced": principal_advanced,
			    "current_principal_balance": current_principal_balance,
			    
			    # Second Row
			    "previous_interest_and_fees_billed": previous_interest_and_fees,
			    "interest_and_fee_payments": "(" + interest_fee_repayments_display + ")",
			    "total_credit_line": total_credit_line,
			    "available_credit": available_credit,
			    
			    # Summary Row
			    "days_in_cycle": date_util.get_days_in_month(report_month_last_day),
			    "cmi_or_mmf_title": cmi_or_mmf_title,
			    "cmi_or_mmf_amount": cmi_or_mmf_amount,
			    "payment_due_date": payment_due_date,
			    "minimum_payment_due": minimum_payment_due,
			}
			html = self.prepare_html_for_attachment(template_data)
			attached_report = prepare_email_attachment(company.name, statement_month, html, is_landscape = False)

			if is_test is False:
				all_users = models_util.get_active_users(company_id=company_id, session=session)
				for contact_user in all_users:
					template_data["company_user"] = contact_user.first_name + " " + contact_user.last_name

					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_LOC,
						template_data=template_data,
						recipients=[contact_user.email],
						attachment=attached_report
					)

					if err:
						return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))
			else:
				template_data["company_user"] = "Test Email"

				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_LOC,
					template_data=template_data,
					recipients=[test_email],
					attachment=attached_report
				)

				if err:
					return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

		return loans_to_notify, None

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		variables = form.get("variables", None)
		is_test = variables.get("isTest", False) if variables else False
		test_email = variables.get("email", None) if variables else None

		print("Sending out monthly summary report emails for LOC customers")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
		payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
		today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
			  models.User.id == user_session.get_user_id()
			).first()

			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).filter(
					models.Loan.origination_date != None
				).filter(
					models.Loan.loan_type == LoanTypeEnum.LINE_OF_CREDIT
				).all())

			# LOC vs non-LOC split handled at query level
			# This is for organizing loans on a per company basis to make emails easier
			loans_to_notify : Dict[str, List[models.Loan] ] = {}
			for l in all_open_loans:
				if l.origination_date is not None and l.maturity_date is not None and \
					l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
					company_id = str(l.company_id)
					if company_id is not None:
						if company_id not in loans_to_notify:
							loans_to_notify[company_id] = [];
						loans_to_notify[company_id].append(l)

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[ Dict[str, List[models.Loan]] ], chunker_dict(loans_to_notify, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, report_link, payment_link, loans_to_notify, today, is_test, test_email)

				if err:
					return err;

			# Once all emails have been sent, record a successful live run if applicable
			if is_test is False:
				recorded_state : Dict[str, object] = {
					"user_name": user.first_name + " " + user.last_name,
					"user_id": str(user.id)
				}
				record_report_run_metadata(
					name = "monthly_summary_live_run",
					status = "succeeded",
					internal_state = recorded_state,
					params = {}
				)

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for monthly LOC loan summaries."}))

class AutomaticDebitCourtesyView(MethodView):
	def process_loan_chunk(
		self, 
		session : Session, 
		sendgrid_client : sendgrid_util.Client, 
		loans_chunk : List[models.Loan],
		today : datetime.date
		) -> Tuple[Dict[str, List[models.Loan]], Response]:
		# LOC vs non-LOC split handled at query level
		# This is for organizing loans on a per company basis to make emails easier
		loans_to_notify : Dict[str, List[models.Loan] ] = {}
		for l in loans_chunk:
			if l.origination_date is not None and l.maturity_date is not None and \
				l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
				company_id = str(l.company_id)
				if company_id is not None:
					if company_id not in loans_to_notify:
						loans_to_notify[company_id] = [];
					loans_to_notify[company_id].append(l)

		# Report Month is the basis for "Current *" amounts in the email
		report_month_last_day = date_util.get_report_month_last_day(today)

		for company_id, loans in loans_to_notify.items():
			msc = cast(
				models.MonthlySummaryCalculation,
				session.query(models.MonthlySummaryCalculation).filter(
					models.MonthlySummaryCalculation.company_id == company_id
				).filter(
					models.MonthlySummaryCalculation.report_month == report_month_last_day
				).first())

			all_users = models_util.get_active_users(company_id=company_id, session=session)
			for contact_user in all_users:
				contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

				company = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == company_id
					).first())

				template_data = {
					"company_user": contact_user_full_name,
					"support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
					"company_name": company.name,
					"report_month": date_util.human_readable_monthyear(report_month_last_day),
					"debit_amount": number_util.to_dollar_format(float(msc.minimum_payment)),
					"summary_send_date": date_util.human_readable_yearmonthday(date_util.now())
				}
				if sendgrid_client is not None:
					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.AUTOMATIC_DEBIT_COURTESY_ALERT,
						template_data=template_data,
						recipients=[contact_user.email]
					)

					if err:
						return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

		return loans_to_notify, None

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Sending out courtesy alert for automatic monthly debits")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

		with models.session_scope(current_app.session_maker) as session:
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).filter(
					models.Loan.origination_date != None
				).filter(
					models.Loan.loan_type == LoanTypeEnum.LINE_OF_CREDIT
				).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, loans_chunk, today)
				
				if err:
					return err;
		

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent out courtesy alert for automatic monthly debits."}))

class ReportsMonthlyLoanSummaryNonLOCView(MethodView):
	decorators = [auth_util.bank_admin_required]

	def prepare_html_for_attachment(
		self,
		session: Session,
		template_data: Dict[str, object],
		loans : List[models.Loan],
		company_lookup: Dict[str, str]
		) -> str:
		"""
			HTML attachment is split out to make testing easier. Specifically, so we don't have to
			worry about setting up wkhtmltopdf in a GitHub action. Moreover, wkhtmltopdf is already
			tested in it's own repo, so there's more value in testing the in house generated html
			string for validity than (re)testing the generated pdf for validity
		"""

		company_name = str(template_data["company_name"])
		loan_type = loans[0].loan_type
		if loan_type == "purchase_order":
			invoice_or_po_number = "PO Number"
			invoice_or_po_total = "PO Total"
			vendor_or_payor = "Vendor"
			invoice_or_po_date = "PO Date"
		else:
			invoice_or_po_number = "Invoice Number"
			invoice_or_po_total = "Invoice Total"
			vendor_or_payor = "Payor"
			invoice_or_po_date = "Invoice Date"

		# Generate table rows to insert into template string below
		rows = ""

		# Gather artifact ids from loans on a preliminary pass, this enables us to gather
		# all the purchase orders (or invoices) in one query, which is in turn used to botjh
		# lookup the human readable vendor name and the artifact's order/invoice date
		purchase_order_ids = []
		invoice_ids = []
		for l in loans:
			purchase_order_ids.append(l.artifact_id) if l.loan_type == "purchase_order" else invoice_ids.append(l.artifact_id)
		purchase_order_list = cast(
			List[models.PurchaseOrder],
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.id.in_(purchase_order_ids)
			).all())
		vendor_lookup = {}
		for po in purchase_order_list:
			vendor_lookup[str(po.id)] = {
				"id": str(po.vendor_id),
				"date": po.order_date,
				"amount": float(po.amount)
			}
		invoice_list = cast(
			List[models.Invoice],
			session.query(models.Invoice).filter(
				models.Invoice.id.in_(invoice_ids)
			).all())
		payor_lookup = {}
		for inv in invoice_list:
			payor_lookup[str(inv.id)] = {
				"id": str(inv.payor_id),
				"date": inv.invoice_date,
				"amount": float(inv.total_amount)
			}

		total_accrued_interest = 0.0
		total_accrued_principal = 0.0
		temp_count = 0
		for l in loans:
			if l.outstanding_interest is not None:
				outstanding_interest = float(l.outstanding_interest)
				total_accrued_interest += outstanding_interest
				outstanding_interest_display = number_util.to_dollar_format(outstanding_interest)
			else:
				outstanding_interest_display = ""
			if l.outstanding_principal_balance is not None:
				outstanding_principal = float(l.outstanding_principal_balance)
				total_accrued_principal += outstanding_principal
				outstanding_principal_display = number_util.to_dollar_format(outstanding_principal)
			else:
				outstanding_principal_display = ""

			artifact_prefix = "PO" if l.loan_type == "purchase_order" else "I"
			artifact_number = artifact_prefix + l.identifier
			artifact_date = vendor_lookup[str(l.artifact_id)]["date"] if l.loan_type == "purchase_order" \
				else payor_lookup[str(l.artifact_id)]["date"]
			artifact_amount = float(str(vendor_lookup[str(l.artifact_id)]["amount"])) if l.loan_type == "purchase_order" \
				else float(str(payor_lookup[str(l.artifact_id)]["amount"])) # float(str(blah)) because mypy

			partner_id = str(vendor_lookup[str(l.artifact_id)]["id"]) if l.loan_type == "purchase_order" \
				else str(payor_lookup[str(l.artifact_id)]["id"])
			partner_name = company_lookup[partner_id]

			amount_advanced = float(l.amount)
			today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
			funded_at = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE, now = l.funded_at)
			days_factored = str(date_util.number_days_between_dates(today, funded_at))
			rows += f"""<tr>
        		<td>{ l.disbursement_identifier }</td>
        		<td>{ artifact_number }</td>
        		<td>{ number_util.to_dollar_format(artifact_amount) }</td>
        		<td>{ partner_name }</td>
        		<td>{ artifact_date }</td>
        		<td>{ date_util.date_to_str(funded_at) if l.funded_at is not None else '' }
        		<td>{ date_util.date_to_str(l.maturity_date) if l.maturity_date is not None else '' }</td>
        		<td>{ number_util.to_dollar_format(amount_advanced) }</td>
        		<td>{ days_factored }</td>
        		<td>{ outstanding_interest_display }</td>
        		<td>{ outstanding_principal_display }</td>
        	</tr>"""

        # if statement so that we can access the css file during unit tests with minimal changes
		css_path = '../src/server/views/css/monthly_report.css' if 'api-server/test' in os.getcwd() else 'server/views/css/monthly_report.css'
		with open(css_path, 'r') as file:
			css_file = file.read().rstrip()

		# Generate HTML for report attachment
		html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Monthly Summary Report</title>
	<style>{ css_file }</style>
</head>
<body>
	<header>
		<div><img class="logo" src="images/bespoke-logo.png" alt="Bespoke Financial Logo" /></div>
		<div class="contact">
		<ul>
			<li>
				<img class="icon" src="images/email.png" alt="Email Icon"/>
				<a href="mailto:info@bespokefinancial">info@bespokefinancial.com</a>
			</li>
			<li>
				<img class="icon" src="images/internet.png" alt="Internet Icon"/>
				<a href="https://bespokefinancial.com/" target="_blank">www.bespokefinancial.com</a>
			</li>
			<li>
				<img class="icon" src="images/phone.png" alt="Phone Icon"/>
				<span>+1 213-282-8411</span>
			</li>
		</ul>
		</div>
	</header>

	<table class="summary-header-table">
        <tbody>
            <tr>
                <td>{ company_name }</td>
                <td>{ template_data["statement_month"] }</td>
            </tr>
        </tbody>
    </table>

     <table class="loan-table">
        <thead>
            <tr>
                <th>Disbursement Round</th>
                <th>{ invoice_or_po_number }</th>
                <th>{ invoice_or_po_total }</th>
                <th>{ vendor_or_payor }</th>
                <th>{ invoice_or_po_date }</th>
                <th>Date Financed</th>
                <th>Financing Maturity Date</th>
                <th>Amount Advanced</th>
                <th>Days Factored</th>
                <th>Accrued Interest</th>
                <th>Outstanding Principal Balance</th>
            </tr>
        </thead>
        <tbody>
        	{ rows }
        </tbody>
    </table>
    <table class="summary-table">
    	<tbody>
    		<tr>
	    		<td><strong>Total Accrued Interest</strong></td>
	    		<td>{ number_util.to_dollar_format(total_accrued_interest) }</td>
    		</tr>
    		<tr>
	    		<td><strong>Total Accrued Principal</strong></td>
	    		<td>{ number_util.to_dollar_format(total_accrued_principal) }</td>
    		</tr>
    	<tbody>
    </table>
</body>
</html>
		"""

		return html

	def process_loan_chunk(
		self, 
		session : Session, 
		sendgrid_client : sendgrid_util.Client, 
		report_link : str, 
		payment_link: str,
		loans_to_notify : Dict[str, List[models.Loan] ],
		today : datetime.datetime,
		company_lookup: Dict[str, str],
		is_test: bool,
		test_email: str
		) -> Tuple[Dict[str, List[models.Loan]], Response]:
		report_month_last_day = date_util.get_report_month_last_day(today)

		if sendgrid_client is None:
			return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Cannot find sendgrid client"}))

		for company_id, loans in loans_to_notify.items():
			# get company contact email, company name
			company = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == company_id)
				.first())

			statement_month = date_util.human_readable_monthyear(report_month_last_day)

			template_data: Dict[str, object] = {
				"company_name": company.name,
				"send_date": date_util.human_readable_monthyear(date_util.now_as_date(timezone = date_util.DEFAULT_TIMEZONE)),
			    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
			    "statement_month": statement_month,
			}
			html = self.prepare_html_for_attachment(session, template_data, loans, company_lookup)
			attached_report = prepare_email_attachment(company.name, statement_month, html, is_landscape = True)

			if is_test is False:
				all_users = models_util.get_active_users(company_id=company_id, session=session)
				for contact_user in all_users:
					template_data["company_user"] = contact_user.first_name + " " + contact_user.last_name
					
					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_NON_LOC,
						template_data=template_data,
						recipients=[contact_user.email],
						attachment=attached_report
					)

					if err:
						return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))
			else:
				template_data["company_user"] = "Test Email"
					
				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_NON_LOC,
					template_data=template_data,
					recipients=[test_email],
					attachment=attached_report
				)

				if err:
					return loans_to_notify, make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))


		return loans_to_notify, None

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		variables = form.get("variables", None)
		is_test = variables.get("isTest", False) if variables else False
		test_email = variables.get("email", None) if variables else None
		
		print("Sending out monthly summary report emails for non-LOC customers")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
		payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
		today = date_util.now()

		with models.session_scope(current_app.session_maker) as session:
			user_session = auth_util.UserSession.from_session()
			user = session.query(models.User).filter(
			  models.User.id == user_session.get_user_id()
			).first()

			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).filter(
					models.Loan.origination_date != None
				).filter(
					models.Loan.loan_type != LoanTypeEnum.LINE_OF_CREDIT
				).all())

			# LOC vs non-LOC split handled at query level
			# This is for organizing loans on a per company basis to make emails easier
			loans_to_notify : Dict[str, List[models.Loan] ] = {}
			for l in all_open_loans:
				if l.origination_date is not None and l.maturity_date is not None and \
					l.status == LoanStatusEnum.APPROVED and l.closed_at is None and l.rejected_at is None:
					if l.company_id not in loans_to_notify:
						loans_to_notify[l.company_id] = [];
					loans_to_notify[l.company_id].append(l)

			# We generate a (potentially) long table later on for the attachment
			# with each row possibly having a different vendor/payor. So, in the interest
			# of limiting the number of queries, we first grab all companies (since vendors/payors are there, too)
			# and turn them into lookup tables and pass those into the generation functions

			all_companies = cast(
				List[models.Company],
				session.query(models.Company)
				.all())
			company_lookup = {}
			for c in all_companies:
				company_lookup[str(c.id)] = c.name
			
			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[ Dict[str, List[models.Loan]] ], chunker_dict(loans_to_notify, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, report_link, payment_link, \
					loans_chunk, today, company_lookup, is_test, test_email)

				if err:
					return err;

			# Once all emails have been sent, record a successful live run if applicable
			if is_test is False:
				recorded_state : Dict[str, object] = {
					"user_name": user.first_name + " " + user.last_name,
					"user_id": str(user.id)
				}
				record_report_run_metadata(
					name = "monthly_summary_live_run",
					status = "succeeded",
					internal_state = recorded_state,
					params = {}
				)

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for monthly non-LOC loan summary."}))

handler.add_url_rule(
	"/generate_loans_coming_due_reports",
	view_func=ReportsLoansComingDueView.as_view(name='generate_loans_coming_due_reports'))

handler.add_url_rule(
	"/generate_loans_past_due_reports",
	view_func=ReportsLoansPastDueView.as_view(name='generate_loans_past_due_reports'))

handler.add_url_rule(
	"/generate_monthly_loans_summary_loc",
	view_func=ReportsMonthlyLoanSummaryLOCView.as_view(name='generate_monthly_loans_summary_loc'))

handler.add_url_rule(
	"/loc_summary_automatic_debit_courtesy",
	view_func=AutomaticDebitCourtesyView.as_view(name='loc_summary_automatic_debit_courtesy'))

handler.add_url_rule(
	"/generate_monthly_loans_summary_non_loc",
	view_func=ReportsMonthlyLoanSummaryNonLOCView.as_view(name='generate_monthly_loans_summary_non_loc'))
