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
from bespoke.db import models, models_util
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
					recipients=["do-not-reply-development@bespokefinancial.com"],
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
				recipients=["do-not-reply-development@bespokefinancial.com"],
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

