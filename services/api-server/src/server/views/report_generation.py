import json
import logging
import time
import datetime
import typing
import math
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sqlalchemy.orm.session import Session
from decimal import *

from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import DBOperation, LoanTypeEnum
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import reports_util
from bespoke.metrc.common.metrc_common_util import chunker
from server.config import Config
from server.views.common import auth_util, handler_util

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
			loan_total = l.outstanding_principal_balance + l.outstanding_interest + l.outstanding_fees
			running_total += float(loan_total)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
				rows_html += self.get_artifact_string(l, session)
			rows_html += "<td>" + str(l.maturity_date) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(loan_total)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_principal_balance)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_interest)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_fees)) + "</td>"
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
			if l.origination_date is not None and l.maturity_date is not None:
				days_until_maturity = date_util.num_calendar_days_passed(today.date(), l.maturity_date);
				if days_until_maturity == 1 or days_until_maturity == 3 or \
					days_until_maturity == 7 or days_until_maturity == 14:
					if l.company_id not in loans_to_notify:
						loans_to_notify[l.company_id] = [];
					loans_to_notify[l.company_id].append(l)

		emails_sent = 0;
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
				    "payment_link": payment_link,
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
			loan_total = l.outstanding_principal_balance + l.outstanding_interest + l.outstanding_fees
			running_total += float(loan_total)
			days_past_due = date_util.number_days_between_dates(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE), l.maturity_date)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			if l.loan_type != LoanTypeEnum.LINE_OF_CREDIT:
				rows_html += self.get_artifact_string(l, session)
			rows_html += "<td>" + str(days_past_due) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(loan_total)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_principal_balance)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_interest)) + "</td>"
			rows_html += "<td>" + number_util.to_dollar_format(float(l.outstanding_fees)) + "</td>"
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
			if l.origination_date is not None and l.maturity_date is not None:
				if date_util.is_past_due(today.date(), l.maturity_date, date_util.DEFAULT_TIMEZONE):
					if l.company_id not in loans_to_notify:
						loans_to_notify[l.company_id] = [];
					loans_to_notify[l.company_id].append(l)

		emails_sent = 0;
		for company_id, loans in loans_to_notify.items():
			# line of credit loans are slated for a different flow as part of future work
			if loans[0].loan_type == LoanTypeEnum.LINE_OF_CREDIT:
				logging.info("LOOK AT ME")
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
				session.query(models.Loan).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				_, err = self.process_loan_chunk(session, sendgrid_client, report_link, payment_link, loans_chunk, today)

				if err:
					return err;
			
		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for loans past due."}))

handler.add_url_rule(
	"/generate_loans_coming_due_reports",
	view_func=ReportsLoansComingDueView.as_view(name='generate_loans_coming_due_reports'))

handler.add_url_rule(
	"/generate_loans_past_due_reports",
	view_func=ReportsLoansPastDueView.as_view(name='generate_loans_past_due_reports'))