import json
import logging
import time
import datetime
import typing
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView

from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.loans import reports_util
from bespoke.metrc.common.metrc_common_util import chunker
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('report_generation', __name__)


class ReportsLoansComingDueView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	def prepare_email_rows(self, loans : List[models.Loan]) -> Tuple[float, str]:
		running_total = 0.0
		rows_html = ""
		for l in loans:
			loan_total = l.outstanding_principal_balance + l.outstanding_interest + l.outstanding_fees
			running_total += float(loan_total)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			rows_html += "<td>" + str(l.maturity_date) + "</td>"
			rows_html += "<td>$" + str(loan_total) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_principal_balance) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_interest) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_fees) + "</td>"
			rows_html += "</tr>"

		return running_total, rows_html

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Sending out report emails for loans coming due")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		
		loans : List[models.Loan] = []
		with models.session_scope(current_app.session_maker) as session:
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.closed_at == None
				).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				# filter for loans that have platform team specified numbers of days
				# before loan maturity, group by company_id to make sending out
				# a unified email to each company more straightforward
				today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
				loans_to_notify : Dict[str, List[models.Loan] ] = {}
				for l in loans_chunk:
					days_until_maturity = date_util.num_calendar_days_passed(today, l.maturity_date);
					if days_until_maturity == 1 or days_until_maturity == 3 or \
						days_until_maturity == 7 or days_until_maturity == 14:
						if l.company_id not in loans_to_notify:
							loans_to_notify[l.company_id] = [];
						loans_to_notify[l.company_id].append(l)


				emails_sent = 0;
				for company_id, loans in loans_to_notify.items():
					with models.session_scope(current_app.session_maker) as session:
						# get company contact email, company name
						company = cast(
							models.Company,
							session.query(models.Company).filter(
								models.Company.id == company_id)
							.first())
						
						contact_user = cast(
							models.User,
							session.query(models.User).filter(
								models.User.company_id == company_id)
							.first())
						contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

						report_link = ""
						if cfg.is_prod_env() is True:
							report_link = cfg.PROD_DOMAIN + "/1/reports"
						elif cfg.is_test_env() is True:
							report_link = cfg.TEST_DOMAIN + "/1/reports"
						elif cfg.is_development_env() is True:
							report_link = cfg.DEV_DOMAIN + "/1/reports"
						
						running_total, rows_html = self.prepare_email_rows(loans)	

						template_data = {
							"company_user": contact_user_full_name,
						    "company_name": company.name,
						    "balance_due": running_total,
						    "rows": rows_html,
						    "report_link": report_link
						}
						_, err = sendgrid_client.send(
							template_name=sendgrid_util.TemplateNames.REPORT_LOANS_COMING_DUE,
							template_data=template_data,
							recipients=[contact_user.email],
						)

						if err:
							return make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))
			
		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for loans coming due."}))

class ReportsLoansPastDueView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	def prepare_email_rows(self, loans : List[models.Loan]) -> Tuple[float, str]:	
		running_total = 0.0
		rows_html = ""
		for l in loans:
			loan_total = l.outstanding_principal_balance + l.outstanding_interest + l.outstanding_fees
			running_total += float(loan_total)
			days_past_due = date_util.number_days_between_dates(date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE), l.maturity_date)
			rows_html += "<tr>"
			rows_html += "<td>L" + str(l.identifier) + "</td>"
			rows_html += "<td>" + str(days_past_due) + "</td>"
			rows_html += "<td>$" + str(loan_total) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_principal_balance) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_interest) + "</td>"
			rows_html += "<td>$" + str(l.outstanding_fees) + "</td>"
			rows_html += "</tr>"

		return running_total, rows_html

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Sending out report emails for loans coming due")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		
		loans : List[models.Loan] = []
		with models.session_scope(current_app.session_maker) as session:
			all_open_loans = cast(
				List[models.Loan],
				session.query(models.Loan).all())

			BATCH_SIZE = 50
			for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
				# filter for loans that have platform team specified numbers of days
				# before loan maturity, group by company_id to make sending out
				# a unified email to each company more straightforward
				today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
				loans_to_notify : Dict[str, List[models.Loan] ] = {}
				for l in loans_chunk:
					if date_util.is_past_due(l.maturity_date):
						if l.company_id not in loans_to_notify:
							loans_to_notify[l.company_id] = [];
						loans_to_notify[l.company_id].append(l)

				emails_sent = 0;
				for company_id, loans in loans_to_notify.items():
					# get company contact email, company name
					company = cast(
						models.Company,
						session.query(models.Company).filter(
							models.Company.id == company_id)
						.first())
					
					contact_user = cast(
						models.User,
						session.query(models.User).filter(
							models.User.company_id == company_id)
						.first())
					contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

					report_link = ""
					if cfg.is_prod_env():
						report_link = "https://app.bespokefinancial.com/1/reports"
					elif cfg.is_test_env():
						report_link = "https://bespoke-app-staging.herokuapp.com/1/reports"
					elif cfg.is_development_env():
						report_link = "http://localhost:3005/1/reports"
					
					running_total, rows_html = self.prepare_email_rows(loans)

					template_data = {
						"company_user": contact_user_full_name,
					    "company_name": company.name,
					    "balance_due": running_total,
					    "rows": rows_html,
					    "report_link": report_link
					}
					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.REPORT_LOANS_PAST_DUE,
						template_data=template_data,
						recipients=[contact_user.email],
					)

					if err:
						return make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))
			
		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent email alert(s) for loans past due."}))

handler.add_url_rule(
	"/generate_loans_coming_due_reports",
	view_func=ReportsLoansComingDueView.as_view(name='generate_loans_coming_due_reports'))

handler.add_url_rule(
	"/generate_loans_past_due_reports",
	view_func=ReportsLoansPastDueView.as_view(name='generate_loans_past_due_reports'))