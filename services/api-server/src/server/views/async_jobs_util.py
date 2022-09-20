import datetime
import logging

from flask import current_app
from bespoke import errors
from decimal import *
from typing import Any, Callable, Dict, Iterable, Tuple, cast, List

from bespoke.date import date_util
from bespoke.db import models, models_util, queries
from bespoke.db.db_constants import AsyncJobNameEnum, AsyncJobStatusEnum, LoanTypeEnum, ProductType
from bespoke.email import sendgrid_util
from bespoke.finance.loans import reports_util
from bespoke.finance.reports import loan_balances
from bespoke.finance.payments import autogenerate_repayment_util
from bespoke.metrc.common.metrc_common_util import chunker, chunker_dict
from bespoke.reports import report_generation_util
from bespoke.slack import slack_util
from server.config import Config
from sqlalchemy import or_
from sqlalchemy.orm.session import Session

@errors.return_error_tuple
def generate_jobs(
	session: Session,
	job_name: str,
) -> Tuple[bool, errors.Error]:

	job_success, err_msg = ASYNC_JOB_GENERATION_LOOKUP[job_name](session)
	if job_name not in ASYNC_JOB_GENERATION_LOOKUP:
		return False, errors.Error("Job does not exist")
		
	return True, None

@errors.return_error_tuple
def add_job_to_queue(
	session: Session,
	job_name: str,
	submitted_by_user_id: str,
	is_high_priority: bool,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	new_job = models.AsyncJob( # type: ignore
		name = job_name,
		submitted_by_user_id = submitted_by_user_id,
		status = AsyncJobStatusEnum.QUEUED,
		is_high_priority = is_high_priority,
		job_payload = job_payload,
	)

	session.add(new_job)

	return True, None

@errors.return_error_tuple
def delete_job(
	session: Session,
	job_id: str,
) -> Tuple[bool, errors.Error]:

	delete_job = cast(
		models.AsyncJob,
		session.query(models.AsyncJob).filter(
			models.AsyncJob.id == job_id
		).first())

	if delete_job.status != AsyncJobStatusEnum.IN_PROGRESS:
		delete_job.is_deleted = True
		delete_job.deleted_at = date_util.now()
		delete_job.updated_at = date_util.now()
	else:
		return None, errors.Error(f"{job_id} is in progress and cannot be deleted.")

	return True, None

@errors.return_error_tuple
def change_job_priority(
	session: Session,
	job_ids: List[str],
	priority: bool,
) -> Tuple[bool, errors.Error]:

	change_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.id.in_(job_ids)
		).all())

	for job in change_jobs:
		if job.status != AsyncJobStatusEnum.IN_PROGRESS:
			job.is_high_priority = priority
			job.updated_at = date_util.now()
		else:
			return None, errors.Error(f"{job.id} is in progress and can not be changed.")

	return True, None

@errors.return_error_tuple
def retry_job(
	session: Session,
	job_ids: List[str],
) -> Tuple[bool, errors.Error]:

	retry_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.id.in_(job_ids)
		).all())

	for job in retry_jobs:
		if job.status == AsyncJobStatusEnum.FAILED:
			job.queued_at = date_util.now()
			job.status = AsyncJobStatusEnum.QUEUED
			job.updated_at = date_util.now()
		else:
			return None, errors.Error(f"{job.id} is not failed and can not be changed.")

	return True, None

@errors.return_error_tuple
def kick_off_handler(
	session: Session,
	session_maker: Callable,
	available_job_number: int,
) -> Tuple[List[str], errors.Error]:

	max_failed_attempts = 3

	currently_running_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.status == AsyncJobStatusEnum.IN_PROGRESS
		).order_by(
			models.AsyncJob.queued_at.desc()
		).all())

	number_of_running_jobs = len(currently_running_jobs)
	if number_of_running_jobs == available_job_number:
		return [], None

	queued_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.status == AsyncJobStatusEnum.QUEUED
		).filter(
			cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
		).order_by(
			models.AsyncJob.is_high_priority.desc()
		).order_by(
			models.AsyncJob.queued_at.asc()
		).all())

	number_of_queued_jobs = len(queued_jobs)
	number_of_jobs_available = available_job_number - number_of_running_jobs
	starting_jobs = queued_jobs[:min(number_of_queued_jobs, number_of_jobs_available)]

	for job in starting_jobs:

		job.status = AsyncJobStatusEnum.IN_PROGRESS
		job.updated_at = date_util.now()
		job.started_at = date_util.now()
		session.commit()
		payload = job.retry_payload if job.num_retries != 0 and job.retry_payload is not None else job.job_payload
		payload = cast(Dict[str, Any], payload)
		# TODO: session_maker should be eventually removed
		job_success, err_msg = ASYNC_JOB_ORCHESTRATION_LOOKUP[job.name](session, session_maker, payload)
		if job_success:
			job.status = AsyncJobStatusEnum.COMPLETED
		else:
			if job.num_retries >= max_failed_attempts:
				job.status = AsyncJobStatusEnum.FAILED
			else:
				job.status = AsyncJobStatusEnum.QUEUED
				job.queued_at = date_util.now()
			job.num_retries += 1
			job.err_details = [str(err_msg)]

		job.ended_at = date_util.now()
		job.updated_at = date_util.now()
		session.commit()
		# slack_util.send_slack_message(job)
	return [job.id for job in starting_jobs], None

@errors.return_error_tuple
def loans_coming_due_job(
	session: Session,
	session_maker: Callable,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	company_id = job_payload["company_id"]
	if "company_id" not in job_payload:
		return False, errors.Error("Company id does not exist in job payload")
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
	payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
	today_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	
	loans_to_notify = report_generation_util.get_coming_due_loans_to_notify(session, company_id, today_date)
	if len(loans_to_notify) != 0:
		_, err = report_generation_util.process_coming_due_loan_chunk(session, company_id, sendgrid_client, report_link, payment_link, loans_to_notify)

		if err:
			return False, errors.Error("Unable to send")		
	return True, None

@errors.return_error_tuple
def generate_companies_loans_coming_due_job(
	session: Session,
) -> Tuple[bool, errors.Error]:
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	cfg = cast(Config, current_app.app_config)

	while not is_done:

		try:
			companies = cast(
				List[models.Company],
				session.query(models.Company).order_by(
					models.Company.id.asc()
				).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all())

			if len(companies) <= 0:
				is_done = True
				continue

			for company in companies:
				company_id = str(company.id)

				loans_to_notify = report_generation_util.get_coming_due_loans_to_notify(session, company_id, today_date)				
				payload = {"company_id" : str(company.id)}

				if len(loans_to_notify) != 0:
					add_job_to_queue(
						session=session,
						job_name=AsyncJobNameEnum.LOANS_COMING_DUE,
						submitted_by_user_id=cfg.BOT_USER_ID,
						is_high_priority=False,
						job_payload=payload
					)

		except Exception as e:
			return False, errors.Error(str(e))

		current_page += 1
	return True, None

@errors.return_error_tuple
def generate_companies_loans_past_due_job(
	session: Session,
) -> Tuple[bool, errors.Error]:
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	cfg = cast(Config, current_app.app_config)

	while not is_done:

		try:
			companies = cast(
				List[models.Company],
				session.query(models.Company).order_by(
					models.Company.id.asc()
				).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all())

			if len(companies) <= 0:
				is_done = True
				continue

			for company in companies:
				company_id = str(company.id)

				loans_to_notify = report_generation_util.get_past_due_loans_to_notify(session, company_id, today_date)				
				payload = {"company_id" : str(company.id)}

				if len(loans_to_notify) != 0:
					add_job_to_queue(
						session=session,
						job_name=AsyncJobNameEnum.LOANS_PAST_DUE,
						submitted_by_user_id=cfg.BOT_USER_ID,
						is_high_priority=False,
						job_payload=payload
					)

		except Exception as e:
			return False, errors.Error(str(e))

		current_page += 1
	return True, None

@errors.return_error_tuple
def loans_past_due_job(
	session: Session,
	session_maker: Callable,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	company_id = job_payload["company_id"]
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
	payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
	today_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	
	loans_to_notify = report_generation_util.get_past_due_loans_to_notify(session, company_id, today_date)
	if len(loans_to_notify) != 0:
		_, err = report_generation_util.process_past_due_loan_chunk(session, company_id, sendgrid_client, report_link, payment_link, loans_to_notify)

		if err:
			return False, errors.Error("unable to send")		
	return True, None

def autogenerate_repayment_customers(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	customers, err = queries.get_all_customers(session)

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING
	]
	today_date: datetime.date = date_util.now_as_date()

	customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customers(
		session, 
		customers,
		product_types_with_autogenerate,
		today_date,
	)

	for customer_id in filtered_customer_ids:
		payload = {"company_id" : str(customer_id)}
		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=payload
		)
	return True, None

def autogenerate_repayments(
	session: Session,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
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
	company_id = job_payload["company_id"]

	logging.info(f"Autogenerating repayments for {company_id} that opted in")
	cfg = cast(Config, current_app.app_config)
	bot_user_id = cfg.BOT_USER_ID

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING
	]

	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
	if sendgrid_client is None:
		return False, errors.Error("Cannot find sendgrid client")

	customer = cast(
        models.Company,
        session.query(models.Company).filter(
            models.Company.is_customer == True
        ).filter(
            models.Company.id == company_id
        ).first())

	today_date: datetime.date = date_util.now_as_date()
	all_company_html: List[ Dict[str, Dict[str, str]] ] = []

	customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customer(
		session, 
		customer,
		product_types_with_autogenerate,
		today_date,
	)
	if err:
		return False, errors.Error(str(err))

	loans_for_repayment, err = autogenerate_repayment_util.find_mature_loans_without_open_repayments(
		session,
		filtered_customer_ids,
		today_date,
	)
	if err:
		return False, errors.Error(str(err))

	email_alert_data, err = autogenerate_repayment_util.generate_repayments_for_mature_loans(
		session,
		customer_lookup,
		company_settings_lookup,
		loans_for_repayment,
		bot_user_id,
		today_date,
	)
	if err:
		return False, errors.Error(str(err))

	company_html, err = autogenerate_repayment_util.format_email_alert_data(
		email_alert_data,
	)
	if err:
		return False, errors.Error(str(err))

	all_company_html.append(company_html)

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
				# TODO : change this to the contact user email once in prod
				recipients = ["do-not-reply-development@bespokefinancial.com"],
				# recipients = [contact_user.email],
				filter_out_contact_only = True,
				attachment = None,
				cc_recipients = [cfg.NO_REPLY_EMAIL_ADDRESS]
			)
			if err:
				return False, errors.Error(str(err))

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
		recipients = [cfg.NO_REPLY_EMAIL_ADDRESS],
		filter_out_contact_only = False,
		attachment = None,
	)
	if err:
		return False, errors.Error(str(err))

	return True, None

def autogenerate_repayment_alerts_customers(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	customers, err = queries.get_all_customers(session)

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING
	]

	# Get the weekly range for days the cron job will run during the next week
	today_date: datetime.date = date_util.now_as_date()

	customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customers(
		session, 
		customers,
		product_types_with_autogenerate,
		today_date,
	)

	for customer_id in filtered_customer_ids:
		payload = {"company_id" : str(customer_id)}
		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=payload
		)
	return True, None

def autogenerate_repayment_alerts(
	session: Session,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
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
	company_id = job_payload["company_id"]
	logging.info(f"Autogenerating repayment alerts for customer {company_id} that opted in")
	cfg = cast(Config, current_app.app_config)
	bot_user_id = cfg.BOT_USER_ID

	product_types_with_autogenerate: List[str] = [
		ProductType.DISPENSARY_FINANCING
	]

	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
	if sendgrid_client is None:
		return False, errors.Error("Cannot find sendgrid client")

	customer = cast(
        models.Company,
        session.query(models.Company).filter(
            models.Company.is_customer == True
        ).filter(
            models.Company.id == company_id
        ).first())

	# Get the weekly range for days the cron job will run during the next week
	today_date: datetime.date = date_util.now_as_date()
	start_date, end_date, start_maturity_date, end_maturity_date, err = autogenerate_repayment_util.find_repayment_alert_start_date(
		today_date,
	)
	if err:
		return False, errors.Error(str(err))

	all_company_html: List[ Dict[str, Dict[str, str]] ] = []
	logging.info(f'Generating weekly alerts on scheduled auto-generated repayments for opted-in customer')

	customer_lookup, filtered_customer_ids, company_settings_lookup, err = autogenerate_repayment_util.get_opt_in_customer(
		session, 
		customer,
		product_types_with_autogenerate,
		today_date,
	)
	if err:
		return False, errors.Error(str(err))

	customer_balance_lookup = {}
	for company_id in customer_lookup:
		customer = customer_lookup[company_id]
		customer_balance_lookup[company_id] = loan_balances.CustomerBalance(customer.as_dict(), current_app.session_maker)

	company_to_per_date_loans, err = autogenerate_repayment_util.find_loans_for_weekly_repayment_reminder(
		session,
		filtered_customer_ids,
		start_date,
		start_maturity_date,
		end_maturity_date,
	)
	if err:
		return False, errors.Error(str(err))

	company_html, err = autogenerate_repayment_util.generate_html_for_weekly_repayment_reminder(
		session,
		customer_lookup,
		customer_balance_lookup,
		company_to_per_date_loans,
		start_maturity_date,
		end_maturity_date,
	)
	if err:
		return False, errors.Error(str(err))

	all_company_html.append(company_html)

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
				# TODO : change this to the contact user email once in prod
				recipients = ["do-not-reply-development@bespokefinancial.com"],
				# recipients = [contact_user.email],
				filter_out_contact_only = True,
				attachment = None,
				cc_recipients = [cfg.NO_REPLY_EMAIL_ADDRESS]
			)
			if err:
				return False, errors.Error(str(err))
	logging.info("Successfully sent out weekly alert to customers who have opted into the auto-generated repayment process.")
	return True, None

@errors.return_error_tuple
def update_company_balances_job(
	session: Session
) -> Tuple[bool, errors.Error]:
	logging.info("Received request to update all company balances")
	cfg = cast(Config, current_app.app_config)

	# mark that all companies need their balance recomputed
	companies = reports_util.list_all_companies(session)
	cur_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	company_ids = [company['id'] for company in companies]
	reports_util._set_needs_balance_recomputed(
		session,
		company_ids, 
		cur_date, 
		create_if_missing=True,
		# days_to_compute_back=0, 
		days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK, 
		)

	logging.info("Submitted that all customers need their company balances updated")

	# add each companies recomputing job to the queue
	for company in companies:
		payload = {"company_id" :company["id"]}

		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.UPDATE_COMPANY_BALANCES,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=payload)
	return True, None

# TODO: sessionmaker should be eventually removed
@errors.return_error_tuple
def update_dirty_company_balances_job(
	session: Session,
	session_maker: Callable,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	# before this was done for all companies at once now the update is going to be done for one company at a time

	logging.debug("Received request to update dirty company balances")
	company_id = job_payload["company_id"]
	today = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	compute_requests = reports_util.list_financial_summaries_that_need_balances_recomputed_by_company(
		session, 
		company_id,
		today, 
		amount_to_fetch=5)
	if not compute_requests:
		return True, None

	# TODO: sessionmaker should be eventually removed
	dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
		session,
		session_maker,
		compute_requests
	)
	if fatal_error:
		logging.error(f"Got FATAL error while recomputing balances for companies that need it: '{fatal_error}'")
		return False, errors.Error(str(fatal_error))

	for cur_date in dates_updated:
		fatal_error = reports_util.compute_and_update_bank_financial_summaries(
			session, 
			cur_date)
		if fatal_error:
			return False, errors.Error('FAILED to update bank financial summary on {}'.format(fatal_error))

	logging.info("Finished request to update {} dirty financial summaries".format(len(compute_requests)))

	return True, None

# this is a little different because the job is being generated directly from an endpoint
@errors.return_error_tuple
def reports_monthly_loan_summary_Non_LOC_generate(
	session: Session,
	is_test: bool,
	test_email: str,
	as_of_date: str,
	user_id: str,
	companies: List[str]
) -> Tuple[bool, errors.Error]:
	logging.info("Received request to generate loan summary for non loc")

	# if no companies specified then create monthly summary report for ALL companies
	if len(companies) == 0:
		all_companies = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).all())
		companies = [str(company.id) for company in all_companies]

	non_dummy_companies = cast(
		List[models.CompanySettings],
		session.query(models.CompanySettings).filter(
			models.CompanySettings.company_id.in_(companies)
		).filter(
			models.CompanySettings.is_dummy_account != True
		).all())

	non_dummy_company_ids = [str(non_dummy_company.company_id) for non_dummy_company in non_dummy_companies]

	non_LOC_companies = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.company_id.in_(non_dummy_company_ids)
		).filter(
			models.FinancialSummary.product_type != ProductType.LINE_OF_CREDIT
		).filter(
			models.FinancialSummary.date == as_of_date
		).all())


	valid_companies = [str(contract.company_id) for contract in non_LOC_companies]

	# add each companies recomputing job to the queue
	for company_id in valid_companies:
		payload = {
			"company_id": company_id,
			"is_test": is_test,
			"email": test_email,
			"as_of_date": as_of_date,
			"user_id": user_id,
			}

		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY,
			submitted_by_user_id=user_id,
			is_high_priority=False,
			job_payload=payload)
	return True, None

# TODO: sessionmaker should be eventually removed
@errors.return_error_tuple
def reports_monthly_loan_summary_Non_LOC(
	session: Session,
	session_maker: Callable,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:	
	company_id = job_payload["company_id"]
	is_test = job_payload["is_test"]
	test_email = job_payload["email"]
	as_of_date = job_payload["as_of_date"]
	user_id = job_payload["user_id"]

	print("Sending out monthly summary report emails for non-LOC customers")
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
	if sendgrid_client is None:
		return False, errors.Error('Cannot find sendgrid client')

	user = session.query(models.User).filter(
		models.User.id == user_id
	).first()

	all_companies = cast(
		List[models.Company],
		session.query(models.Company)
		.all())
	company_lookup = {}
	company_balance_lookup = {}
	for company in all_companies:
		company_lookup[str(company.id)] = company
		company_balance_lookup[str(company.id)] = loan_balances.CustomerBalance(company.as_dict(), current_app.session_maker)

	rgc = report_generation_util.ReportGenerationContext(
		company_lookup = company_lookup,
		as_of_date = as_of_date
	)

	all_open_loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			or_(models.Loan.closed_at == None, models.Loan.closed_at > rgc.report_month_last_day)
		).filter(
			models.Loan.origination_date != None
		).filter(
			models.Loan.origination_date <= rgc.report_month_last_day
		).filter(
			models.Loan.loan_type != LoanTypeEnum.LINE_OF_CREDIT		
		).filter(
			models.Loan.company_id == company_id
		).all())

	# in order to record most recent date run, this adds a dummy msc for every non loc monthly summary run
	if is_test is False:
		msc, _ = queries.get_monthly_summary_calculation_by_company_id_and_date(
				session, 
				company_id, 
				rgc.report_month_last_day)
		if msc is None:
			session.add(models.MonthlySummaryCalculation( # type: ignore
				company_id = company_id,
				report_month = rgc.report_month_last_day,
				minimum_payment = None
			))
		else:
			msc.minimum_payment = None

	if len(all_open_loans) == 0:
		return True, None

	# LOC vs non-LOC split handled at query level
	# This is for organizing loans on a per company basis to make emails easier
	loans_to_notify : Dict[str, List[models.Loan] ] = {}

	# Sort the loans for each company based on disbursement identifier
	# We use the two join-ed keys to make sure the correct ordering when
	# the disbursement identifiers also have letters in them, e.g. "3" should come before "10A"
	# and "11A" should come before "11B"
	# ###############
	# For the two type: ignores below, if SupportsLessThan is integrated into typing (see linked issue)
	# then we should consider revisiting (https://github.com/python/typing/issues/760)
	all_open_loans.sort(key = lambda x: # type: ignore
		( int(''.join(n for n in x.disbursement_identifier if n.isdigit())), # type: ignore
			''.join(n for n in x.disbursement_identifier if n.isalpha()))
		if x.disbursement_identifier is not None else (0,'A'))
	loans_to_notify[str(company_id)] = all_open_loans
	
	BATCH_SIZE = 50
	for loans_chunk in cast(Iterable[ Dict[str, List[models.Loan]] ], chunker_dict(loans_to_notify, BATCH_SIZE)):
		_, err = report_generation_util.process_loan_chunk_for_non_loc_monthly_summary(
			session, 
			sendgrid_client, 
			rgc, 
			loans_chunk, 
			company_balance_lookup, 
			is_test, 
			test_email)

		if err:
			return False, errors.Error(str(err));

	# Once all emails have been sent, record a successful live run if applicable
	if is_test is False:
		recorded_state : Dict[str, object] = {
			"user_name": user.first_name + " " + user.last_name,
			"user_id": str(user.id)
		}
		report_generation_util.record_report_run_metadata(
			name = "monthly_summary_live_run",
			status = "succeeded",
			internal_state = recorded_state,
			params = {}
		)

	return True, None

@errors.return_error_tuple
def reports_monthly_loan_summary_LOC_generate(
	session: Session,
	is_test: bool,
	test_email: str,
	as_of_date: str,
	user_id: str,
	companies: List[str]
) -> Tuple[bool, errors.Error]:
	logging.info("Received request to generate loan summary for non loc")

	# if no companies specified then create monthly summary report for ALL companies
	if len(companies) == 0:
		all_companies = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.is_customer == True
			).all())
		companies = [str(company.id) for company in all_companies]

	non_dummy_companies = cast(
		List[models.CompanySettings],
		session.query(models.CompanySettings).filter(
			models.CompanySettings.company_id.in_(companies)
		).filter(
			models.CompanySettings.is_dummy_account != True
		).all())

	non_dummy_company_ids = [str(non_dummy_company.company_id) for non_dummy_company in non_dummy_companies]

	LOC_companies = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.company_id.in_(non_dummy_company_ids)
		).filter(
			models.FinancialSummary.product_type == ProductType.LINE_OF_CREDIT
		).filter(
			models.FinancialSummary.date == as_of_date
		).all())

	valid_companies = [str(contract.company_id) for contract in LOC_companies]

	# add each companies recomputing job to the queue
	for company_id in valid_companies:
		payload = {
			"company_id": company_id,
			"is_test": is_test,
			"email": test_email,
			"as_of_date": as_of_date,
			"user_id": user_id,
			}

		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY,
			submitted_by_user_id=user_id,
			is_high_priority=False,
			job_payload=payload)
	return True, None

# TODO: sessionmaker should be eventually removed
@errors.return_error_tuple
def reports_monthly_loan_summary_LOC(
	session: Session,
	session_maker: Callable,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:	
	company_id = job_payload["company_id"]
	is_test = job_payload["is_test"]
	test_email = job_payload["email"]
	as_of_date = job_payload["as_of_date"]
	user_id = job_payload["user_id"]

	print("Sending out monthly summary report emails for LOC customers")
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
	if sendgrid_client is None:
		return False, errors.Error('Cannot find sendgrid client')

	user = session.query(models.User).filter(
		models.User.id == user_id
	).first()

	print("Sending out monthly summary report emails for LOC customers")
	user = session.query(models.User).filter(
	  models.User.id == user_id
	).first()

	all_open_loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Loan.closed_at == None
		).filter(
			models.Loan.origination_date != None
		).filter(
			models.Loan.loan_type == LoanTypeEnum.LINE_OF_CREDIT
		).filter(
			models.Loan.company_id == company_id
		).all())

	rgc = report_generation_util.ReportGenerationContext(
		company_lookup = None,
		as_of_date = as_of_date
	)

	# adds a 0 value msc for LOC customers with no loans
	if is_test is False and len(all_open_loans) == 0:
		msc, _ = queries.get_monthly_summary_calculation_by_company_id_and_date(
				session, 
				company_id, 
				rgc.report_month_last_day)
		if msc is None:
			session.add(models.MonthlySummaryCalculation( # type: ignore
				company_id = company_id,
				report_month = rgc.report_month_last_day,
				minimum_payment = Decimal(0)
			))
		else:
			msc.minimum_payment = Decimal(0)

	# early return if there are no loans 
	if len(all_open_loans) == 0:
		return True, None

	# LOC vs non-LOC split handled at query level
	# This is for organizing loans on a per company basis to make emails easier
	loans_to_notify : Dict[str, List[models.Loan] ] = {}


	loans_to_notify[str(company_id)] = all_open_loans
	

	BATCH_SIZE = 50
	for loans_chunk in cast(Iterable[ Dict[str, List[models.Loan]] ], chunker_dict(loans_to_notify, BATCH_SIZE)):
		_, err = report_generation_util.process_loan_chunk_for_loc(
			session, 
			sendgrid_client, 
			loans_to_notify, 
			rgc, 
			is_test, 
			test_email)

		if err:
			return False, errors.Error(str(err));

	# Once all emails have been sent, record a successful live run if applicable
	if is_test is False:
		recorded_state : Dict[str, object] = {
			"user_name": user.first_name + " " + user.last_name,
			"user_id": str(user.id)
		}
		report_generation_util.record_report_run_metadata(
			name = "monthly_summary_live_run",
			status = "succeeded",
			internal_state = recorded_state,
			params = {}
			)

	return True, None

ASYNC_JOB_GENERATION_LOOKUP = {
	AsyncJobNameEnum.LOANS_COMING_DUE: generate_companies_loans_coming_due_job,
	AsyncJobNameEnum.LOANS_PAST_DUE: generate_companies_loans_past_due_job,
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS: autogenerate_repayment_customers,
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS: autogenerate_repayment_alerts_customers,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: update_company_balances_job, 
}

ASYNC_JOB_ORCHESTRATION_LOOKUP = {
	AsyncJobNameEnum.LOANS_COMING_DUE: loans_coming_due_job,
	AsyncJobNameEnum.LOANS_PAST_DUE: loans_past_due_job,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: update_dirty_company_balances_job,
	AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY: reports_monthly_loan_summary_Non_LOC,
	AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY: reports_monthly_loan_summary_LOC,
}
