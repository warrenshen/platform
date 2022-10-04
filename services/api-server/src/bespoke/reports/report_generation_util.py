import base64
import datetime
import json
import os
import requests
import time
import datetime
import logging

from decimal import *
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, models_util, queries
from bespoke.db.db_constants import (FeatureFlagEnum, LoanStatusEnum, LoanTypeEnum,
                                     PaymentType, FinancialSummaryPayloadField)
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util, number_util
from bespoke.finance.loans.loan_calculator import (LoanUpdateDict)
from bespoke.finance.reports import loan_balances
from bespoke.metrc.common.metrc_common_util import chunker, chunker_dict
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sendgrid.helpers.mail import Attachment, FileContent, FileName, FileType, Disposition
from server.config import Config, get_config
from server.views.common import auth_util, handler_util
from sqlalchemy import func, or_
from sqlalchemy.orm.session import Session

from bespoke.config.config_util import is_prod_env

config = get_config()

class ReportGenerationContext:
	def __init__(
		self, 
		company_lookup: Dict[str, models.Company],
		as_of_date: str
	):
		self.company_lookup = company_lookup

		self.today = date_util.date_to_datetime(
			date_util.load_date_str(as_of_date)
		)
		self.report_month_last_day = date_util.load_date_str(as_of_date)
		self.report_month_first_day = date_util.get_first_day_of_month_date(
			date_util.date_to_str(self.report_month_last_day)
		)
		self.statement_month = date_util.human_readable_monthyear(
			self.report_month_last_day
		)

def prepare_email_attachment(
	company_name: str,
	statement_month: str,
	html: str,
	is_landscape: bool
	) -> Attachment:
	"""
		The attachment function returns a tuple to make testing easier
		In the cron / manual kickoff use case, we should not expect to use the returned html str
		In the unit test case, we want to test the str for html validation
	"""
	request_details : Dict[str, object] = {
		"html": html,
		"landscape": is_landscape
	}
	is_prod = is_prod_env(os.environ.get('FLASK_ENV'))
	pdf_endpoint = "https://bespoke-pdf-generator.herokuapp.com/pdf-generate" if is_prod is True else \
		"https://bespoke-pdf-generator-staging.herokuapp.com/pdf-generate"

	request_attempt_count = 0
	request_successful = False
	MAX_ATTEMPT_COUNT = 5
	while request_attempt_count < MAX_ATTEMPT_COUNT and request_successful is False:
		response = requests.post(
			pdf_endpoint, 
			data = json.dumps(request_details), # dumps needs for Bool -> bool (json) conversion
			headers = {
				"Content-Type": "application/json"
			}
		)

		request_attempt_count += 1

		if response.status_code == 503 and request_attempt_count < MAX_ATTEMPT_COUNT:
			time.sleep(1)
		elif response.status_code // 200 == 2: # all 2xx status codes are acceptable
			request_successful = True
		else:
			response.raise_for_status()

	encoded_file = base64.b64encode(response.content).decode()
	company_name = company_name.replace(" ", "-")
	statement_month = statement_month.replace(" ", "-")
	while company_name.find("--") != -1:
		company_name = company_name.replace("--", "-")
	temp_pdf_name = f'{company_name}-{statement_month}-monthly_loc_customer_summary.pdf'
	final_pdf_name = f'{company_name}-{statement_month}-Summary-Report.pdf'
	attached_report = Attachment(
		FileContent(encoded_file),
		FileName(final_pdf_name),
		FileType("application/pdf"),
		Disposition("attachment")
	)

	return attached_report

def record_report_run_metadata(
	name: str,
	status: str,
	internal_state: Dict[str, object],
	params: Dict[str, object]
	) -> None:
	with models.session_scope(current_app.session_maker) as session:
		sync_pipeline_entry = models.SyncPipeline(
			name = name,
			status = status,
			internal_state = internal_state,
			params = params
		)
		session.add(sync_pipeline_entry)

def get_all_open_loans(
		session: Session,
		today_date: datetime.date,
		is_past_due: bool
	) -> List[models.Loan]:
	queries = [
		models.Loan.closed_at == None,
		models.Loan.rejected_at == None,
		models.Loan.origination_date != None,
		models.Loan.adjusted_maturity_date != None,
		models.Loan.status == LoanStatusEnum.APPROVED,
		models.Loan.loan_type != LoanTypeEnum.LINE_OF_CREDIT
	]

	if is_past_due:
		queries.append(models.Loan.adjusted_maturity_date < today_date)
	else:
		queries.append(models.Loan.adjusted_maturity_date >= today_date)

	all_open_loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			*queries
		).all())

	return all_open_loans

def get_artifact_string(
	session : Session,
	loan: models.Loan 
) -> str:
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

def prepare_coming_due_email_rows(
	session : Session,
	loans : List[models.Loan]
) -> Tuple[float, str]:
	running_total = 0.0
	rows_html = ""
	for l in loans:
		principal = float(l.outstanding_principal_balance) if l.outstanding_principal_balance is not None else 0.0
		interest = float(l.outstanding_interest) if l.outstanding_interest is not None else 0.0
		fees = float(l.outstanding_fees) if l.outstanding_fees is not None else 0.0
		maturity_date_display = date_util.human_readable_yearmonthday_from_date(l.adjusted_maturity_date) \
			if l.adjusted_maturity_date is not None else ""

		loan_total = principal + interest + fees
		running_total += float(loan_total)
		rows_html += "<tr>"
		rows_html += "<td>L" + str(l.identifier) + "</td>"
		if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
			rows_html += get_artifact_string(session, l)
		rows_html += "<td>" + maturity_date_display + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(loan_total) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(principal) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(interest) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(fees) + "</td>"
		rows_html += "</tr>"

	return running_total, rows_html

def is_customer_notifiable_customer_by_company_id(
	session : Session, 
	company_id : str
) -> bool:
	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.company_id == company_id
		).first())

	customer_opt_in = company_settings.is_autogenerate_repayments_enabled

	if customer_opt_in:
		return True

	return False

def process_coming_due_loan_chunk(
	session : Session, 
	company_id: str,
	sendgrid_client : sendgrid_util.Client, 
	report_link : str, 
	payment_link : str, 
	loans : List[models.Loan],
) -> Tuple[bool, errors.Error]:
	is_notifiable = is_customer_notifiable_customer_by_company_id(session, company_id)
	is_line_of_credit = loans[0].loan_type == LoanTypeEnum.LINE_OF_CREDIT
	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id)
		.first())
	
	all_users = models_util.get_active_users(
		company_id=company_id, 
		session=session,
		filter_contact_only=True
	)

	if is_notifiable and not is_line_of_credit:

		for contact_user in all_users:
			contact_user_full_name = contact_user.first_name + " " + contact_user.last_name
			
			running_total, rows_html = prepare_coming_due_email_rows(session, loans)
			total_string = number_util.to_dollar_format(running_total)

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
			    "send_date": date_util.date_to_str(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)),
			    "payment_link": "<a href='" + payment_link + "'>click here</a>",
			    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
			    "show_invoice_column": show_invoice_column,
			    "show_purchase_order_column": show_purchase_order_column,
			}
			if sendgrid_client is not None:
				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.REPORT_LOANS_COMING_DUE,
					template_data=template_data,
					# TODO: uncomment once job is running
					# recipients=[contact_user.email],
					recipients=["grace@bespokefinancial.com"],
					filter_out_contact_only=True,
					cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
				)

				if err:
					return False, errors.Error(str(err))

	return True, None

def get_all_open_loans_from_company(
	session: Session,
	company_id: str,
	today_date: datetime.date,
	is_past_due: bool
) -> List[models.Loan]:
	queries = [
		models.Loan.closed_at == None,
		models.Loan.rejected_at == None,
		models.Loan.origination_date != None,
		models.Loan.adjusted_maturity_date != None,
		models.Loan.status == LoanStatusEnum.APPROVED,
		models.Loan.loan_type != LoanTypeEnum.LINE_OF_CREDIT,
		models.Loan.company_id == company_id,
	]

	if is_past_due:
		queries.append(models.Loan.adjusted_maturity_date < today_date)
	else:
		queries.append(models.Loan.adjusted_maturity_date >= today_date)

	all_open_loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			*queries
		).all())
	return all_open_loans

def prepare_past_due_email_rows(
		session : Session,
		loans : List[models.Loan],
		today_date : datetime.date
) -> Tuple[float, str]:
	running_total = 0.0
	rows_html = ""
	for l in loans:
		principal = float(l.outstanding_principal_balance) if l.outstanding_principal_balance is not None else 0.0
		interest = float(l.outstanding_interest) if l.outstanding_interest is not None else 0.0
		fees = float(l.outstanding_fees) if l.outstanding_fees is not None else 0.0

		loan_total = principal + interest + fees
		running_total += float(loan_total)
		days_past_due = date_util.number_days_between_dates(today_date, l.adjusted_maturity_date)
		rows_html += "<tr>"
		rows_html += "<td>L" + str(l.identifier) + "</td>"
		if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
			rows_html += get_artifact_string(session, l)
		rows_html += "<td>" + str(days_past_due) + "</td>"
		rows_html += "<td>" + date_util.human_readable_yearmonthday_from_date(l.adjusted_maturity_date) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(loan_total) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(principal) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(interest) + "</td>"
		rows_html += "<td>" + number_util.to_dollar_format(fees) + "</td>"
		rows_html += "</tr>"

	return running_total, rows_html

def process_past_due_loan_chunk(
	session : Session, 
	company_id : str,
	sendgrid_client : sendgrid_util.Client, 
	report_link : str, 
	payment_link: str,
	loans : List[models.Loan],
) -> Tuple[bool, errors.Error]:
	is_notifiable = is_customer_notifiable_customer_by_company_id(session, company_id)
	is_line_of_credit = loans[0].loan_type == LoanTypeEnum.LINE_OF_CREDIT
	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id)
		.first())

	all_users = models_util.get_active_users(
		company_id=company_id, 
		session=session,
		filter_contact_only=True
	)
	for contact_user in all_users:
		contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

		running_total, rows_html =prepare_past_due_email_rows(
			session, 
			loans,
			date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
		)
		total_string = number_util.to_dollar_format(running_total)

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
		    "send_date": date_util.date_to_str(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)),
		    "payment_link": "<a href='" + payment_link + "'>click here</a>",
		    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
		    "show_invoice_column": show_invoice_column,
		    "show_purchase_order_column": show_purchase_order_column,
		}
		if sendgrid_client is not None:
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.REPORT_LOANS_PAST_DUE,
				template_data=template_data,
				# TODO: uncomment once job is running
				# recipients=[contact_user.email],
				recipients=["grace@bespokefinancial.com"],
				filter_out_contact_only=True,
				cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
			)
			if err:
					return False, errors.Error(str(err))
	
	return True, None

def get_past_due_loans_to_notify(
	session: Session,
	company_id: str,
	today_date: datetime.date,
) -> List[models.Loan]:
	all_open_loans = get_all_open_loans_from_company(session, company_id, today_date, is_past_due = True)

	return all_open_loans

def get_coming_due_loans_to_notify(
	session: Session,
	company_id: str,
	today_date: datetime.date,
) -> List[models.Loan]:
	all_open_loans = get_all_open_loans_from_company(session, company_id, today_date, is_past_due = False)
	loans_to_notify = []
	for loan in all_open_loans:
		days_until_maturity = date_util.num_calendar_days_passed(today_date, loan.adjusted_maturity_date);
		if days_until_maturity == 1 or days_until_maturity == 3 or days_until_maturity == 7:
			loans_to_notify.append(loan)
	return loans_to_notify

def prepare_html_for_attachment_for_non_loc(
	session: Session,
	company_id: str,
	template_data: Dict[str, object],
	loans : List[models.Loan],
	rgc: ReportGenerationContext,
	company_balance_lookup: Dict[str, loan_balances.CustomerBalance],
	company_identifier: str,
	is_unit_test: bool = False
) -> Tuple[str, errors.Error]:
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
			cast(Callable, models.PurchaseOrder.is_deleted.isnot)(True)
		).filter(
			models.PurchaseOrder.id.in_(purchase_order_ids)
		).all())
	vendor_lookup = {}
	for po in purchase_order_list:
		vendor_lookup[str(po.id)] = {
			"id": str(po.vendor_id),
			"date": po.order_date,
			"amount": float(po.amount),
			"order_number": po.order_number
		}
	invoice_list = cast(
		List[models.Invoice],
		session.query(models.Invoice).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Invoice.id.in_(invoice_ids)
		).all())
	payor_lookup = {}
	for inv in invoice_list:
		payor_lookup[str(inv.id)] = {
			"id": str(inv.payor_id),
			"date": inv.invoice_date,
			"amount": float(inv.total_amount),
			"invoice_number": inv.invoice_number
		}

	# The customer balance update function returns in a format that
	# isn't a natural fit for adding up interest accrued on a given day
	# This section rearranges the data to be per loan -and- filters
	# to only include updates for the report month
	loan_update_lookup: Dict[str, Dict[datetime.date, LoanUpdateDict]] = {}
	if str(company_id) in company_balance_lookup: 
		update_tuple, err = company_balance_lookup[str(company_id)].update(
			rgc.report_month_first_day,
			rgc.today.date(),
			include_debug_info = False, # 
			is_past_date_default_val = False, #
		)
		if err:
			return None, err

		for tuple_date, update_data in update_tuple.items():
			if update_data is None:
				continue

			if tuple_date == rgc.report_month_last_day:
				loan_updates = update_data.get("loan_updates", None)
				
				if loan_updates:
					for update in loan_updates:
						loan_id = update.get("loan_id", "")
						if loan_id != "":
							if loan_id not in loan_update_lookup:
								loan_update_lookup[str(loan_id)] = {}
							loan_update_lookup[str(loan_id)][tuple_date] = update
	
	total_accrued_interest = 0.0
	total_accrued_principal = 0.0
	"""
	NOTE(JR): The if is_unit_test check is a temporary measure. The current unit test for this function
	is just checking for correct html. Setting up this function fully in a unit test involves a lot of 
	data setup work to make sure that loan updates are correctly populated. As we modularize the code,
	we should put in the work for that, but it didn't make sense to put in that work when we're just
	checkcing for correct html.
	"""
	if is_unit_test is False:
		for l in loans:
			loan_update_dict = loan_update_lookup[str(l.id)][rgc.report_month_last_day]

			days_factored = date_util.number_days_between_dates(rgc.report_month_last_day, l.origination_date, inclusive_later_date = True) \
				if l.origination_date is not None else 0 

			outstanding_principal = loan_update_dict['outstanding_principal'] or 0
			outstanding_principal_display = number_util.to_dollar_format(outstanding_principal)
			total_accrued_principal += outstanding_principal

			outstanding_interest = (loan_update_dict['outstanding_interest'] or 0) + (loan_update_dict['outstanding_fees'] or 0)
			outstanding_interest_display = number_util.to_dollar_format(outstanding_interest)
			total_accrued_interest += outstanding_interest

			artifact_number = str(vendor_lookup[str(l.artifact_id)]["order_number"]) if l.loan_type == LoanTypeEnum.INVENTORY \
				else str(payor_lookup[str(l.artifact_id)]["invoice_number"])
			artifact_date = cast(datetime.date, vendor_lookup[str(l.artifact_id)]["date"] if l.loan_type == LoanTypeEnum.INVENTORY \
				else payor_lookup[str(l.artifact_id)]["date"])
			artifact_amount = float(str(vendor_lookup[str(l.artifact_id)]["amount"])) if l.loan_type == LoanTypeEnum.INVENTORY \
				else float(str(payor_lookup[str(l.artifact_id)]["amount"])) # float(str(blah)) because mypy

			partner_id = str(vendor_lookup[str(l.artifact_id)]["id"]) if l.loan_type == LoanTypeEnum.INVENTORY \
				else str(payor_lookup[str(l.artifact_id)]["id"])
			partner_name = rgc.company_lookup[partner_id].name

			amount_advanced = float(l.amount)
			rows += f"""<tr>
        		<td>{ f'{company_identifier}-{l.identifier}' }</td>
        		<td>{ artifact_number }</td>
        		<td>{ number_util.to_dollar_format(artifact_amount) }</td>
        		<td>{ partner_name }</td>
        		<td>{ date_util.date_to_str(artifact_date) if artifact_date is not None else '' }</td>
        		<td>{ date_util.date_to_str(l.origination_date) if l.origination_date is not None else '' }
        		<td>{ date_util.date_to_str(l.maturity_date) if l.maturity_date is not None else '' }</td>
        		<td>{ number_util.to_dollar_format(amount_advanced) }</td>
        		<td>{ str(days_factored) }</td>
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
		                <th>Customer Identifier</th>
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

	return html, None

def process_loan_chunk_for_non_loc_monthly_summary(
	session : Session, 
	sendgrid_client : sendgrid_util.Client, 
	rgc: ReportGenerationContext,
	loans_to_notify : Dict[str, List[models.Loan] ],
	company_balance_lookup: Dict[str, loan_balances.CustomerBalance],
	is_test: bool,
	test_email: str
) -> Tuple[Dict[str, List[models.Loan]], errors.Error]:

	for company_id, loans in loans_to_notify.items():
		company = rgc.company_lookup[str(company_id)]

		template_data: Dict[str, object] = {
			"company_name": company.name,
			"send_date": date_util.human_readable_monthyear(rgc.today),
		    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
		    "statement_month": rgc.statement_month,
		}

		html, err = prepare_html_for_attachment_for_non_loc(
			session, 
			company_id, 
			template_data, 
			loans, 
			rgc, 
			company_balance_lookup,
			company.identifier,
		)
		attached_report = prepare_email_attachment(company.name, rgc.statement_month, html, is_landscape = True)

		if is_test is False:
			all_users = models_util.get_active_users(
				company_id=company_id, 
				session=session,
				filter_contact_only=True
			)
			for contact_user in all_users:
				template_data["company_user"] = contact_user.first_name + " " + contact_user.last_name
				
				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_NON_LOC,
					template_data=template_data,
					recipients=[contact_user.email],
					filter_out_contact_only=True,
					attachment=attached_report,
					cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
				)

				if err:
					return loans_to_notify, err
		else:
			template_data["company_user"] = "Test Email"
				
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_NON_LOC,
				template_data=template_data,
				recipients=[test_email],
				filter_out_contact_only=True,
				attachment=attached_report,
				cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
			)

			if err:
				return loans_to_notify, err


	return loans_to_notify, None

def get_end_of_report_month_financial_summary_for_loc(
	session : Session,
	company_id : str,
	rgc: ReportGenerationContext
) -> Optional[models.FinancialSummary]:
	financial_summary = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.company_id == company_id
		).filter(
			models.FinancialSummary.date == rgc.report_month_last_day
		).first())

	return financial_summary

def get_report_month_repayments_for_loc(
	session : Session,
	company_id : str,
	rgc: ReportGenerationContext,
) -> Tuple[float, float, float, float]:
	principal_repayments = 0.0
	interest_repayments = 0.0
	fee_repayments = 0.0
	account_fee_repayments = 0.0

	repayments = cast(
		List[models.Payment],
		session.query(models.Payment).filter(
			cast(Callable, models.Payment.is_deleted.isnot)(True)
		).filter(
			models.Payment.company_id == company_id
		).filter(
			models.Payment.settlement_date >= rgc.report_month_first_day
		).filter(
			models.Payment.settlement_date <= rgc.report_month_last_day
		).filter(
			models.Payment.type == PaymentType.REPAYMENT
		).filter(
			models.Payment.reversed_at == None
		).filter(
			models.Payment.settled_at != None
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
		to_principal = float(t.to_principal) if t.to_principal is not None else 0.0
		principal_repayments += to_principal

		to_interest = float(t.to_interest) if t.to_interest is not None else 0.0
		interest_repayments += to_interest

		to_fees = float(t.to_fees) if t.to_fees is not None else 0.0
		fee_repayments += to_fees

		# Acount fees are not separately tracked in a to_* field for transactions
		# As such, to figure out account_fee repayments, you need to use the below formula
		to_acount_fees = float(t.amount) - to_principal - to_interest - to_fees
		account_fee_repayments += to_acount_fees

	return principal_repayments, interest_repayments, fee_repayments, account_fee_repayments

def get_report_month_advances_for_loc(
	session : Session,
	company_id : str,
	rgc: ReportGenerationContext,
	) -> float:
	# using type ignore here for "Call to untyped function "with_entities" in typed context"
	advanced_amount = session.query(models.Loan).with_entities( # type: ignore
			func.sum(models.Loan.amount)
		).filter(
			models.Loan.company_id == company_id
		).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Loan.origination_date >= rgc.report_month_first_day
		).filter(
			models.Loan.origination_date <= rgc.report_month_last_day
		).first()[0]

	return advanced_amount or 0.0

def get_cmi_and_mmf_for_loc(
	session : Session,
	contract : contract_util.Contract,
	company_id : str,
	rgc: ReportGenerationContext,
	interest_fee_balance: float,
	previous_report_month_last_day: datetime.date,
	financial_summary: models.FinancialSummary
) -> Tuple[str, float, Tuple[float, float, float], errors.Error]:
	"""
	- The queries for current monthly interest and minimum monthly fee are combined
		in order to save a save a contract query, but also to abstract away the comparison
		logic to determine which is greater (and displayed)
	- We also return a tuple of (cmi, mmf, outstanding_interest) regardless as 
		that's needed for the minimum payment due calculation. This implies that you
		SHOULD call get_cmi_and_mmf_for_loc BEFORE get_minimum_payment_due_for_loc
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
	if contract_start_date >= rgc.report_month_first_day and \
		contract_start_date <= rgc.report_month_last_day:
		days_for_monthly_fee = date_util.number_days_between_dates(
			rgc.report_month_last_day,
			contract_start_date,
			inclusive_later_date = True
		)
		days_in_month = date_util.get_days_in_month(rgc.report_month_last_day)
		mmf = mmf * (float(days_for_monthly_fee) / float(days_in_month))
	
	
	# Used later in get_minimum_payment_due_for_loc, queried here since
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
			models.FinancialSummary.date >= rgc.report_month_first_day
		).filter(
			models.FinancialSummary.date <= rgc.report_month_last_day
		).first()[0]
	
	payload = financial_summary.account_level_balance_payload
	account_fees = float(cast(Dict[str, Any], payload).get(FinancialSummaryPayloadField.FEES_TOTAL, 0.0))

	cmi = float(cmi) + account_fees
	mmf = float(mmf)

	# Compare and determine output
	if cmi > mmf:
		cmi_or_mmf_title = "Current Month's Interest and Fees"
		cmi_or_mmf_amount = cmi
	else:
		cmi_or_mmf_title = "Minimum Monthly Fee"
		cmi_or_mmf_amount = mmf

	total_outstanding_interest = float(previous_month_end_summary.total_outstanding_interest) if previous_month_end_summary is not None else 0.0

	return cmi_or_mmf_title, \
		cmi_or_mmf_amount, \
		(cmi, mmf, total_outstanding_interest), \
		None

def prepare_html_for_attachment_for_loc(
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

def get_available_credit_for_loc(
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

	active_borrowing_base_id = company_settings.active_borrowing_base_id
	
	ebba_application = cast(
		models.EbbaApplication,
		session.query(models.EbbaApplication).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.EbbaApplication.id == active_borrowing_base_id
		).first())

	tcl_cpb = total_credit_line - current_principal_balance
	if ebba_application is None:
		available_credit = tcl_cpb
	else:
		borrowing_base = float(ebba_application.calculated_borrowing_base)
		bb_cpb = borrowing_base - current_principal_balance	
		available_credit = bb_cpb if bb_cpb < tcl_cpb else tcl_cpb

	return available_credit

def get_minimum_payment_due_for_loc(
	previous_interest_and_fees_billed: float,
	interest_and_fee_repayments: float,
	cmi_or_mmf_amount: float,
) -> Tuple[str, float]:
	minimum_payment_due = previous_interest_and_fees_billed - interest_and_fee_repayments + cmi_or_mmf_amount

	return number_util.to_dollar_format(minimum_payment_due), minimum_payment_due

def process_loan_chunk_for_loc(
	session : Session, 
	sendgrid_client : sendgrid_util.Client,
	loans_to_notify : Dict[str, List[models.Loan] ],
	rgc: ReportGenerationContext,
	is_test: bool,
	test_email: str
) -> Tuple[Dict[str, List[models.Loan]], errors.Error]:

	for company_id, loans in loans_to_notify.items():
		# get company contact email, company name
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())

		contract, err = contract_util.get_active_contract_by_company_id(session, company_id)
		if err:
			return loans_to_notify, err

		automatic_debit_date = date_util.date_to_str(
			date_util.get_automated_debit_date(
				rgc.report_month_last_day
			)
		)
		financial_summary = get_end_of_report_month_financial_summary_for_loc(session, company_id, rgc)
		account_level_balance_payload = cast(Dict[str, Any], financial_summary.account_level_balance_payload)
		outstanding_account_fees = account_level_balance_payload.get(FinancialSummaryPayloadField.FEES_TOTAL, 0)

		# Checks for edge case where LoC has started a contract right before this email gets sent
		# (e.g. contract starts 10/1, email sent 10/5, there won't be a report to send)
		if financial_summary is None:
			continue

		interest_plus_fees = float(financial_summary.total_outstanding_interest) + \
			float(financial_summary.total_outstanding_fees)

		# Report Previous Month is the basis for "Previous *" amounts in the email
		previous_report_month_last_day = date_util.get_previous_month_last_date(rgc.report_month_last_day)
		previous_financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter(
				models.FinancialSummary.company_id == company_id
			).filter(
				models.FinancialSummary.date == previous_report_month_last_day
			).first())

		account_level_balance_payload = cast(Dict[str, Any], previous_financial_summary.account_level_balance_payload if previous_financial_summary else {})
		previous_outstanding_account_fees = account_level_balance_payload.get(FinancialSummaryPayloadField.FEES_TOTAL, 0)

		advances = get_report_month_advances_for_loc(session, company_id, rgc)
		principal_advanced = number_util.to_dollar_format(advances)

		principal_repayments, interest_repayments, fee_repayments, account_fee_repayments = get_report_month_repayments_for_loc(
			session, 
			company_id, 
			rgc
		)
		principal_repayments_display = number_util.to_dollar_format(principal_repayments)
		interest_fee_repayments_amount = interest_repayments + fee_repayments + account_fee_repayments
		interest_fee_repayments_display = number_util.to_dollar_format(interest_fee_repayments_amount)

		tcl = float(financial_summary.adjusted_total_limit)
		total_credit_line = number_util.to_dollar_format(tcl)

		# if guard for when LoC customers are just starting out and won't have a previous month
		if previous_financial_summary is not None:
			previous_pb = float(previous_financial_summary.total_outstanding_principal)
			previous_principal_balance = number_util.to_dollar_format(previous_pb)
			previous_interest = float(previous_financial_summary.total_outstanding_interest)
			previous_fees = float(previous_financial_summary.total_outstanding_fees)
			previous_interest_and_fees_amount = previous_interest + \
				previous_fees + \
				previous_outstanding_account_fees
			previous_interest_and_fees = number_util.to_dollar_format(previous_interest_and_fees_amount)

			interest_fee_balance = (interest_repayments + fee_repayments) - previous_interest - previous_fees
		else:
			# Set defaults that make it obvious that there isn't a previous month to pull from
			previous_interest_and_fees_amount = 0.0
			previous_principal_balance = "N/A"
			previous_interest_and_fees = "N/A"

			interest_fee_balance = (interest_repayments + fee_repayments)


		current_pb = float(financial_summary.total_outstanding_principal) if financial_summary is not None else 0.0
		current_principal_balance = number_util.to_dollar_format(current_pb)

		available_credit = number_util.to_dollar_format(
			get_available_credit_for_loc(
				session,
				company.id,
				current_pb,
				tcl
			)
		)

		min_monthly_payload = cast(Dict[str, Any], financial_summary.minimum_monthly_payload)

		# Current Month's Interest or Min Monthly Fee
		cmi_or_mmf_title, cmi_or_mmf_amount, cmi_mmf_scores, err = get_cmi_and_mmf_for_loc( \
			session, 
			contract, 
			company_id, 
			rgc,
			interest_fee_balance,
			previous_report_month_last_day,
			financial_summary
		)
		cmi_or_mmf_amount_display = number_util.to_dollar_format(cmi_or_mmf_amount)
		if err:
			return loans_to_notify, err
		
		
		payment_due_date = date_util.date_to_str(date_util.get_first_day_of_month_date(automatic_debit_date))
		minimum_payment_due, minimum_payment_amount = get_minimum_payment_due_for_loc(
			previous_interest_and_fees_amount,
			interest_fee_repayments_amount,
			cmi_or_mmf_amount
		)

		if is_test == False:
			msc, _ = queries.get_monthly_summary_calculation_by_company_id_and_date(
				session, 
				company_id, 
				rgc.report_month_last_day)
			if msc is None:
				session.add(models.MonthlySummaryCalculation( # type: ignore
					company_id = company_id,
					report_month = rgc.report_month_last_day,
					minimum_payment = Decimal(minimum_payment_amount)
				))
			else:
				msc.minimum_payment = Decimal(minimum_payment_amount)

		template_data: Dict[str, object] = {
			# Greeting and preamble
			"automatic_debit_date": automatic_debit_date,

		    # Table Header/Footer
		    "company_name": company.name,
		    "statement_month": rgc.statement_month,
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
		    "days_in_cycle": date_util.get_days_in_month(rgc.report_month_last_day),
		    "cmi_or_mmf_title": cmi_or_mmf_title,
		    "cmi_or_mmf_amount": cmi_or_mmf_amount_display,
		    "payment_due_date": payment_due_date,
		    "minimum_payment_due": minimum_payment_due,
		}
		html = prepare_html_for_attachment_for_loc(template_data)
		attached_report = prepare_email_attachment(company.name, rgc.statement_month, html, is_landscape = False)

		if is_test is False:
			all_users = models_util.get_active_users(
				company_id=company_id, 
				session=session,
				filter_contact_only=True
			)
			for contact_user in all_users:
				template_data["company_user"] = contact_user.first_name + " " + contact_user.last_name

				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_LOC,
					template_data=template_data,
					recipients=[contact_user.email],
					cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS],
					filter_out_contact_only=True,
					attachment=attached_report
				)

				if err:
					return loans_to_notify, err
		else:
			template_data["company_user"] = "Test Email"

			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.REPORT_MONTHLY_SUMMARY_LOC,
				template_data=template_data,
				recipients=[test_email],
				cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS],
				filter_out_contact_only=True,
				attachment=attached_report
			)
			
			if err:
				return loans_to_notify, err

	return loans_to_notify, None

def process_loan_chunk_for_automatic_debit_courtesy_alert(
	session: Session, 
	sendgrid_client: sendgrid_util.Client, 
	loans_chunk: List[models.Loan],
	today: datetime.date
) -> Tuple[Dict[str, List[models.Loan]], errors.Error]:
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
	report_month_last_day = date_util.get_previous_month_last_date(today)

	for company_id, loans in loans_to_notify.items():
		msc = cast(
			models.MonthlySummaryCalculation,
			session.query(models.MonthlySummaryCalculation).filter(
				models.MonthlySummaryCalculation.company_id == company_id
			).filter(
				models.MonthlySummaryCalculation.report_month == report_month_last_day
			).first())
		all_users = models_util.get_active_users(
			company_id=company_id, 
			session=session,
			filter_contact_only=True
		)
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
				"summary_send_date": date_util.date_to_str(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE))
			}

			if sendgrid_client is not None:
				_, err = sendgrid_client.send(
					template_name=sendgrid_util.TemplateNames.AUTOMATIC_DEBIT_COURTESY_ALERT,
					template_data=template_data,
					recipients=[contact_user.email],
					filter_out_contact_only=True,
					cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
				)

				if err:
					return {}, errors.Error(str(err))

	return loans_to_notify, None

