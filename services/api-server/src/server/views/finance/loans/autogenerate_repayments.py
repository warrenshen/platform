import datetime
import json
import logging
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import models, models_util, queries
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.payments import autogenerate_repayment_util
from bespoke.finance.reports import loan_balances
from bespoke.metrc.common.metrc_common_util import chunker
from flask import Blueprint, Response, current_app, make_response
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('autogenerate_repayments', __name__)

class AutogenerateRepaymentView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING,
		ProductType.INVENTORY_FINANCING,
	]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		"""
			This endpoint is used by a cron job that checks for customers with
			open loans that are either on or past their adjusted maturity date 
			and do not yet have an associated repayment.

			For each run, a customer should have either 0 or 1 repayments setup.
			If a customer has multiple loans that fit the criteria, then one
			repayment is set up for the group of them.

			Once this is done, the loans are gathered into an email template
			and sent to the finance team to keep them apprised of this automated
			system.

			Use Cases:
			1. Customer is either not active or a dummy account
				- Skip this customer
			2. Customer has not opted in or bank has overridden the opt in
				- Skip this customer
			3. Customer is opted in, but has no loans or no loans due
				- Skip this customer
			4. Customer is opted in, has a loan(s) due, and that loan(s) does not have any open repayments. 
				- Generate repayment for the outstanding amounts
			5. Customer is opted in, has a loan due, but there is an existing non-settled full repayment.
				- Skip this loan. No action needed
			6. Customer is opted in, has a loan due, but there is a submitted but not settled partial repayment.
				- Skip this loan. Assumption here is that process will settle existing repayment before
					the next time this cron job runs
		"""
		logging.info("Autogenerating repayments for customers that opted in")
		cfg = cast(Config, current_app.app_config)
		bot_user_id = cfg.BOT_USER_ID

		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
		if sendgrid_client is None:
			return handler_util.make_error_response('Cannot find sendgrid client')

		with models.session_scope(current_app.session_maker) as session:
			customers, err = queries.get_all_customers(session)
			if err:
				raise err

			BATCH_SIZE = 10
			batch_index = 1
			batches_count = len(customers) // BATCH_SIZE + 1
			today_date: datetime.date = date_util.now_as_date()
			all_company_html: List[ Dict[str, Dict[str, str]] ] = []
			for customers_chunk in chunker(customers, BATCH_SIZE):
				logging.info(f'Autogenerating loan repayments batch {batch_index} of {batches_count} for opted-in customers...')

				customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customers(
					session, 
					customers_chunk,
					self.product_types_with_autogenerate,
					today_date,
				)
				if err:
					raise err

				loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
					session,
					filtered_customer_ids,
					today_date,
				)
				if err:
					raise err

				email_alert_data, err = autogenerate_repayment_util.generate_repayments_for_mature_loans(
					session,
					customer_lookup,
					company_settings_lookup,
					loans_for_repayment,
					bot_user_id,
					today_date,
				)
				if err:
					raise err

				company_html, err = autogenerate_repayment_util.format_email_alert_data(
					email_alert_data,
				)
				if err:
					raise err

				all_company_html.append(company_html)

				batch_index += 1

			# flatten to make easier to send out per customer
			# TODO(JR): add code to store where we left off (record emails being sent in db table,
			# likely useful for month-end as well) in the event of a failure
			all_company_html_dict: Dict[str, Dict[str, str] ] = {}
			all_company_html_str: str = ""
			for company_html_dict in all_company_html:
				for company_id in company_html_dict:
					all_company_html_dict[company_id] = company_html_dict[company_id]
					if "bespoke_html" in company_html_dict[company_id]:
						all_company_html_str += company_html_dict[company_id]["bespoke_html"]

			generation_date = date_util.human_readable_yearmonthday_from_date(today_date)

			for company_id in all_company_html_dict:
				# Send out alert to finance team with all the auto-generated repayments
				template_data: Dict[str, object] = {
					"company_name": all_company_html_dict[company_id]["customer_name"],
					"message": "You are receiving this message because you opted into the repayment auto-generation feature. If you wish to opt out, please go to your settings and uncheck 'Is Autogeneration Enabled?`.",
					"generation_date": generation_date,
	  				"tables": all_company_html_dict[company_id]["customer_html"] \
	  					if "customer_html" in all_company_html_dict[company_id] else "",
	  				'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
				}

				active_customer_users = models_util.get_active_users(
					company_id=company_id, 
					session=session,
					filter_contact_only=True
				)

				for contact_user in active_customer_users:
					_, err = sendgrid_client.send(
						template_name = sendgrid_util.TemplateNames.ALERT_FOR_AUTO_GENERATED_REPAYMENTS,
						template_data = template_data,
						recipients = [contact_user.email],
						filter_out_contact_only = True,
						attachment = None,
						cc_recipients = [cfg.NO_REPLY_EMAIL_ADDRESS]
					)
					if err:
						raise err

			# Send out alert to finance team with all the auto-generated repayments
			bespoke_template_data: Dict[str, object] = {
				"company_name": "Bespoke Financial",
				"message:": "The customer must have opted into this feature to be included here. If the repayments bounce, please make sure to turn on the bank override of the customer opt-in inside the bank only section of the customer's settings page.",
				"generation_date": generation_date,
  				"tables": all_company_html_str,
  				'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
			}

			_, err = sendgrid_client.send(
				template_name = sendgrid_util.TemplateNames.ALERT_FOR_AUTO_GENERATED_REPAYMENTS,
				template_data = bespoke_template_data,
				recipients = ["jr@bespokefinancial.com"],#[cfg.NO_REPLY_EMAIL_ADDRESS],
				filter_out_contact_only = False,
				attachment = None,
			)
			if err:
				raise err

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully autogenerated repayments for customers that opted in."}))

class AutogenerateRepaymentWeeklyAlertView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING,
		ProductType.INVENTORY_FINANCING,
	]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		"""
			This endpoint is used by a cron job that sends out an alert
			to customers who opted into the auto-generated repayment process.
			It checks for loans that will become mature, and thus have a 
			repayment generated, during the following week.

			Please be aware that while the job runs M-F, it's checking a day
			ahead to have the repayment scheduled for the settlement date of
			the repayment to match the adjusted maturity date of the loan.

			To visualize that. Look at the list below. This holds true unless
			there is a holiday. In that case, it checks for the next available
			business day.

			Cron Runs  | Checks For
			========================
			Monday     | Tuesday
			Tuesday    | Wednesday
			Wednesday  | Thursday
			Thursday   | Friday
			Friday     | Monday (of the next week)
			
		"""
		logging.info("Autogenerating repayments for customers that opted in")
		cfg = cast(Config, current_app.app_config)
		bot_user_id = cfg.BOT_USER_ID

		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
		if sendgrid_client is None:
			return handler_util.make_error_response('Cannot find sendgrid client')

		with models.session_scope(current_app.session_maker) as session:
			customers, err = queries.get_all_customers(session)
			if err:
				raise err

			# Get the weekly range for days the cron job will run during the next week
			today_date: datetime.date = date_util.now_as_date()
			start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
				today_date,
			)
			if err:
				raise err

			BATCH_SIZE = 10
			batch_index = 1
			batches_count = len(customers) // BATCH_SIZE + 1
			all_company_html: List[ Dict[str, Dict[str, str]] ] = []
			for customers_chunk in chunker(customers, BATCH_SIZE):
				logging.info(f'Generating weekly alerts on scheduled auto-generated repayments for opted-in customer batch {batch_index} of {batches_count}...')

				customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customers(
					session, 
					customers_chunk,
					self.product_types_with_autogenerate,
					today_date,
				)
				if err:
					raise err

				customer_balance_lookup = {}
				for company_id in customer_lookup:
					customer = customer_lookup[company_id]
					customer_balance_lookup[company_id] = loan_balances.CustomerBalance(customer.as_dict(), session)

				company_to_per_date_loans, err = autogenerate_repayment_util.find_loans_for_weekly_repayment_reminder(
					session,
					filtered_customer_ids,
					start_date,
					start_maturity_date,
					end_maturity_date,
				)
				if err:
					raise err

				company_html, err = autogenerate_repayment_util.generate_html_for_weekly_repayment_reminder(
					session,
					customer_lookup,
					customer_balance_lookup,
					company_to_per_date_loans,
					start_maturity_date,
					end_maturity_date,
				)
				if err:
					raise err

				all_company_html.append(company_html)

				batch_index += 1

			all_company_html_dict: Dict[str, Dict[str, str] ] = {}
			for company_html_dict in all_company_html:
				for company_id in company_html_dict:
					all_company_html_dict[company_id] = company_html_dict[company_id]

			for company_id in all_company_html_dict:
				# Send out alert to finance team with all the auto-generated repayments
				template_data: Dict[str, object] = {
					"company_name": all_company_html_dict[company_id]["customer_name"],
					"start_date": date_util.human_readable_yearmonthday_from_date(start_date),
					"end_date": date_util.human_readable_yearmonthday_from_date(end_date),
	  				"tables": all_company_html_dict[company_id]["html"] \
	  					if "html" in all_company_html_dict[company_id] else "",
	  				'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
				}

				active_customer_users = models_util.get_active_users(
					company_id=company_id, 
					session=session,
					filter_contact_only=True
				)

				for contact_user in active_customer_users:
					_, err = sendgrid_client.send(
						template_name = sendgrid_util.TemplateNames.ALERT_FOR_WEEKLY_SCHEDULED_AUTO_GENERATED_REPAYMENTS,
						template_data = template_data,
						recipients = [contact_user.email],
						filter_out_contact_only = True,
						attachment = None,
						cc_recipients = [cfg.NO_REPLY_EMAIL_ADDRESS]
					)
					if err:
						raise err

		return make_response(json.dumps({'status': 'OK', 'resp': "Successfully sent out weekly alert to customers who have opted into the auto-generated repayment process."}))

handler.add_url_rule(
	'/autogenerate_repayment', view_func=AutogenerateRepaymentView.as_view(name='autogenerate_repayment_view'))

handler.add_url_rule(
	'/autogenerate_repayment_alert', view_func=AutogenerateRepaymentWeeklyAlertView.as_view(name='autogenerate_repayment_alert_view'))
