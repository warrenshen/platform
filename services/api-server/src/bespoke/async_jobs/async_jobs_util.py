from collections import defaultdict
import datetime
import logging
from datetime import timedelta
from typing import Any, Callable, Dict, cast, Iterable, List, Tuple
from flask import current_app
from bespoke import errors
from decimal import *
import json

from bespoke.date import date_util
from bespoke.db import db_constants, models, models_util, queries
from bespoke.db.db_constants import AsyncJobNameEnum, AsyncJobStatusEnum, ClientSurveillanceCategoryEnum, CustomerRoles, LoanTypeEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util, contract_util
from bespoke.finance.loans import reports_util
from bespoke.finance.payments import autogenerate_repayment_util
from bespoke.finance.payments.autogenerate_repayment_util import product_types_with_autogenerate
from bespoke.finance.purchase_orders import purchase_orders_util
from bespoke.finance.reports import loan_balances
from bespoke.metrc import metrc_download_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import chunker, chunker_dict
from bespoke.reports import report_generation_util
from bespoke.slack import slack_util
from server.config import Config
from sqlalchemy import or_
from sqlalchemy.orm.session import Session

ASYNC_JOB_NAME_TO_CUSTOM_DELAY_TOLERANCE_HOURS = {
	AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE: 4,
}

@errors.return_error_tuple
def generate_jobs(
	session: Session,
	job_name: str,
) -> Tuple[bool, errors.Error]:

	job_success, err_msg = ASYNC_JOB_GENERATION_LOOKUP[job_name](session)
	if job_name not in ASYNC_JOB_GENERATION_LOOKUP:
		return False, errors.Error("Job does not exist")
		
	return True, None

def add_job_summary(
	session: Session,
	job_name: str,
) -> Tuple[bool, errors.Error]:

	new_job = models.AsyncJobSummary( # type: ignore
		name = job_name,
		date = date_util.now_as_date(),
		metadata_info = {}
	)

	session.add(new_job)

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
	job_ids: List[str],
) -> Tuple[bool, errors.Error]:

	delete_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.id.in_(job_ids)
		).all())

	for job in delete_jobs:
		if job.status != AsyncJobStatusEnum.IN_PROGRESS:
			job.is_deleted = True
			job.deleted_at = date_util.now()
		else:
			return None, errors.Error(f"{job.id} is in progress and cannot be deleted.")

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
		else:
			return None, errors.Error(f"{job.id} is not failed and can not be changed.")

	return True, None

@errors.return_error_tuple
def orchestration_handler(
	session_maker: Callable,
	available_job_number: int,
) -> Tuple[List[str], errors.Error]:

	max_failed_attempts = 3
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	with session_scope(session_maker) as session:
		session.expire_on_commit=False
		currently_running_jobs = cast(
			List[models.AsyncJob],
			session.query(models.AsyncJob).filter(
				or_ (
					models.AsyncJob.status == AsyncJobStatusEnum.IN_PROGRESS,
					models.AsyncJob.status == AsyncJobStatusEnum.INITIALIZED,
				)
			).filter(
				cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
			).order_by(
				models.AsyncJob.queued_at.desc()
			).all())

		number_of_running_jobs = len(currently_running_jobs)
		if number_of_running_jobs == available_job_number:
			return [], None

		starting_job_limit = available_job_number - number_of_running_jobs
		queued_jobs_to_be_run = []
		
		capped_jobs = [AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE]
		capped_jobs_currently_running = list(filter(lambda job: job.name in capped_jobs, currently_running_jobs))
		maximum_number_of_capped_jobs = cfg.ASYNC_MAX_NUM_CAPPED_JOB
		num_capped_jobs_available_to_run = maximum_number_of_capped_jobs - len(capped_jobs_currently_running)
		capped_job_limit = num_capped_jobs_available_to_run if starting_job_limit > num_capped_jobs_available_to_run else starting_job_limit
		# checks and runs the capped jobs and adds them first to upcoming running jobs
		if capped_job_limit >= 1:
			starting_capped_jobs = cast(
				List[models.AsyncJob],
				session.query(models.AsyncJob).filter(
					models.AsyncJob.status == AsyncJobStatusEnum.QUEUED
				).filter(
					models.AsyncJob.name.in_(capped_jobs)
				).filter(
					cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
				).order_by(
					models.AsyncJob.is_high_priority.desc()
				).order_by(
					models.AsyncJob.queued_at.asc()
				).limit(
					capped_job_limit
				).all())
			if len(starting_capped_jobs) > 0:
				queued_jobs_to_be_run = starting_capped_jobs
				starting_job_limit -= len(starting_capped_jobs)

		# any left over jobs space is alotted to regular jobs
		if starting_job_limit >= 1:
			queued_jobs = cast(
				List[models.AsyncJob],
				session.query(models.AsyncJob).filter(
					models.AsyncJob.status == AsyncJobStatusEnum.QUEUED
				).filter(
					cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
				).filter(
					models.AsyncJob.name.notin_(capped_jobs)
				).order_by(
					models.AsyncJob.is_high_priority.desc()
				).order_by(
					models.AsyncJob.queued_at.asc()
				).limit(
					starting_job_limit
				).all())
			for job in queued_jobs:
				queued_jobs_to_be_run.append(job)

		# Cfg and sendgrid_client need to be passed in too the thread function 
		# or else the app instance is not recognized once a thread is spawned
		for job in queued_jobs_to_be_run:
			job.status = AsyncJobStatusEnum.INITIALIZED
			job.initialized_at = date_util.now()
			session.commit()
			cfg.THREAD_POOL.submit(execute_job, session_maker, cfg, sendgrid_client, job)

		# jobs that have run for over an hour are put into failure state
		for job in currently_running_jobs:
			if job.initialized_at is not None and job.initialized_at < date_util.hours_from_today(-1):
				job.status = AsyncJobStatusEnum.QUEUED
				job.initialized_at = None
				job.err_details = json.dumps({"Error" : f"Async job was initialized but did not run and was requeued."}) # type: ignore

			if job.started_at is not None and job.started_at < date_util.hours_from_today(-1):
				if job.num_retries >= cfg.ASYNC_MAX_FAILED_ATTMEPTS:
					job.status = AsyncJobStatusEnum.FAILED
					slack_util.send_job_slack_message(cfg, job)
				else:
					job.status = AsyncJobStatusEnum.QUEUED
					job.queued_at = date_util.now()
					
				job.ended_at = date_util.now()
				job.num_retries += 1
				job.err_details = json.dumps({"Error" : "Async job timed out."}) # type: ignore

		return [job.id for job in queued_jobs_to_be_run], None

	return [], None

@errors.return_error_tuple
def remove_orphaned_initialized_jobs(
	session_maker: Callable,
) -> Tuple[bool, errors.Error]:

	with session_scope(session_maker) as session:
		initialized_jobs = cast(
			List[models.AsyncJob],
			session.query(models.AsyncJob).filter(
				models.AsyncJob.status.in_([
					AsyncJobStatusEnum.INITIALIZED, 
					AsyncJobStatusEnum.IN_PROGRESS
				])
			).filter(
				cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
			).order_by(
				models.AsyncJob.queued_at.desc()
			).all())

		if len(initialized_jobs) == 0:
			return True, None


		# only requeue jobs if they're not company balances
		for job in initialized_jobs:
			if job.name == AsyncJobNameEnum.UPDATE_COMPANY_BALANCES:
				job.status = AsyncJobStatusEnum.COMPLETED
			else:
				job.status = AsyncJobStatusEnum.QUEUED
				job.queued_at = date_util.now()

	return True, None

def execute_job(
	session_maker: Callable,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job: models.AsyncJob,
) -> Tuple[bool, errors.Error]:
	with session_scope(session_maker) as session:
		job.status = AsyncJobStatusEnum.IN_PROGRESS
		job.started_at = date_util.now()
		# explicitly adding a session.merge() needed here in order for 
		# it to recognize that this is the same job created earlier. 
		session.merge(job)
		session.commit()

	with session_scope(session_maker) as session:
		payload = job.retry_payload if job.num_retries != 0 and job.retry_payload is not None else job.job_payload
		payload = cast(Dict[str, Any], payload)

		try_catch_exception = None
		try:
			job_success, err_msg = ASYNC_JOB_ORCHESTRATION_LOOKUP[job.name](session, cfg, sendgrid_client, payload)
		except Exception as e:
			try_catch_exception = e
		if job_success:
			job.status = AsyncJobStatusEnum.COMPLETED
		else:
			if job.num_retries >= cfg.ASYNC_MAX_FAILED_ATTMEPTS:
				job.status = AsyncJobStatusEnum.FAILED
				slack_util.send_job_slack_message(cfg, job)
			else:
				job.status = AsyncJobStatusEnum.QUEUED
				job.queued_at = date_util.now()
			job.num_retries += 1
			error_message = try_catch_exception if (try_catch_exception != None) else err_msg
			job.err_details = [str(error_message)]

		job.ended_at = date_util.now()
		session.merge(job)
		session.commit()
	return True, None

@errors.return_error_tuple
def create_job_summary(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	queued_async_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			or_(
				models.AsyncJob.status == AsyncJobStatusEnum.COMPLETED,
				models.AsyncJob.status == AsyncJobStatusEnum.FAILED
			)
		).filter(
			models.AsyncJob.ended_at >= date_util.hours_from_today(-24)
		).all())

	async_job_summaries = cast(
		List[models.AsyncJobSummary],
		session.query(models.AsyncJobSummary).filter(
			models.AsyncJobSummary.date == date_util.date_to_db_str(date_util.now_as_date())
		).all())

	# loans due jobs both run at midnight but the db date recorded is the day 
	# before due to time zone differences.
	async_job_loans = cast(
		List[models.AsyncJobSummary],
		session.query(models.AsyncJobSummary).filter(
			or_(
				models.AsyncJobSummary.name == AsyncJobNameEnum.LOANS_COMING_DUE,
				models.AsyncJobSummary.name == AsyncJobNameEnum.LOANS_PAST_DUE,
				models.AsyncJobSummary.name == AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN
			)
		).filter(
			models.AsyncJobSummary.date == date_util.date_to_db_str(date_util.hours_from_today(-24))
		).all())

	async_job_summaries += async_job_loans
	slack_util.send_job_summary(cfg, queued_async_jobs, async_job_summaries)

	return True, None

@errors.return_error_tuple
def orchestrate_loans_coming_due(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	company_id = job_payload["company_id"]
	if "company_id" not in job_payload:
		return False, errors.Error("Company id does not exist in job payload")

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
def generate_companies_loans_coming_due(
	session: Session,
) -> Tuple[bool, errors.Error]:
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	today_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	cfg = cast(Config, current_app.app_config)

	while not is_done:

		try:
			companies, has_more_customers, err = queries.get_all_customers(
				session,
				is_active = True,
				offset = current_page * BATCH_SIZE,
				batch_size = BATCH_SIZE,
			)
			
			# Normally, we would check for the length of companies here
			# However, we set up `get_all_customers` to filter for active customers
			# One nice thing about that function is that it returns an error before
			# filtering if no customers are found. This error based exit
			# plays nicely with our offset approach used here
			if not has_more_customers:
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

	add_job_summary(session, AsyncJobNameEnum.LOANS_COMING_DUE)

	return True, None

@errors.return_error_tuple
def generate_companies_loans_past_due(
	session: Session,
) -> Tuple[bool, errors.Error]:
	current_page = 0
	BATCH_SIZE = 50
	is_done = False 

	today_date=date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	cfg = cast(Config, current_app.app_config)

	while not is_done:

		try:
			companies, has_more_customers, err = queries.get_all_customers(
				session,
				is_active = True,
				offset = current_page * BATCH_SIZE,
				batch_size = BATCH_SIZE,
			)
			
			# Normally, we would check for the length of companies here
			# However, we set up `get_all_customers` to filter for active customers
			# One nice thing about that function is that it returns an error before
			# filtering if no customers are found. This error based exit
			# plays nicely with our offset approach used here
			if not has_more_customers:
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
	add_job_summary(session, AsyncJobNameEnum.LOANS_PAST_DUE)

	return True, None

@errors.return_error_tuple
def orchestrate_loans_past_due(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	company_id = job_payload["company_id"]
	report_link = cfg.BESPOKE_DOMAIN + "/1/reports"
	payment_link = cfg.BESPOKE_DOMAIN + "/1/loans"
	today_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
	
	loans_to_notify = report_generation_util.get_past_due_loans_to_notify(session, company_id, today_date)
	if len(loans_to_notify) != 0:
		_, err = report_generation_util.process_past_due_loan_chunk(session, company_id, sendgrid_client, report_link, payment_link, loans_to_notify)

		if err:
			return False, errors.Error("unable to send")		
	return True, None

def generate_autogenerate_repayments(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	customers, has_more_customers, err = queries.get_all_customers(session)

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

	add_job_summary(session, AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS)

	return True, None

def orchestrate_autogenerate_repayments(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
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
	bot_user_id = cfg.BOT_USER_ID

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
				recipients = [contact_user.email],
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
		recipients = cfg.BANK_NOTIFY_EMAIL_ADDRESSES,
		filter_out_contact_only = False,
		attachment = None,
	)
	if err:
		return False, errors.Error(str(err))

	return True, None

def generate_autogenerate_repayment_alerts(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	customers, has_more_customers, err = queries.get_all_customers(session)

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
	add_job_summary(session, AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS)
	
	return True, None

def orchestrate_autogenerate_repayment_alerts(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
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
	bot_user_id = cfg.BOT_USER_ID

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
		customer_balance_lookup[company_id] = loan_balances.CustomerBalance(customer.as_dict(), session)

	# returns a dict of company id to another dict that is due date to loan for next four days
	company_to_per_date_loans, err = autogenerate_repayment_util.find_loans_for_weekly_repayment_reminder(
		session,
		filtered_customer_ids,
		start_date,
		start_maturity_date,
		end_maturity_date,
	)
	if err:
		return False, errors.Error(str(err))
	company_loans_by_date = company_to_per_date_loans[company_id]
	total_number_of_loans = 0
	for loans in company_loans_by_date.values():
		total_number_of_loans += len(loans)
	if total_number_of_loans == 0:
		return True, None

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
				recipients = [contact_user.email],
				filter_out_contact_only = True,
				attachment = None,
				cc_recipients = [cfg.NO_REPLY_EMAIL_ADDRESS]
			)
			if err:
				return False, errors.Error(str(err))

	logging.info("Successfully sent out weekly alert to customers who have opted into the auto-generated repayment process.")

	return True, None

def generate_daily_company_balances_run(
	session: Session,
) -> Tuple[bool, errors.Error]:
	logging.info("Received request to run the daily company balances run")
	cfg = cast(Config, current_app.app_config)

	# generate all bank_financial_summaries for the day first if
	# they don't already exists, otherwise, multiple threads try
	# to create the bank_financial_summary and it goes poorly
	cur_date = date_util.now_as_date(date_util.UTC_TIMEZONE)
	reports_util.compute_and_update_bank_financial_summaries(
		session,
		cur_date,
	)

	# mark that all companies need their balance recomputed
	companies = reports_util.list_all_companies(session)
	company_ids = [company['id'] for company in companies]
	reports_util._set_needs_balance_recomputed(
		session,
		company_ids, 
		cur_date, 
		days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK, 
	)

	for company in companies:
		payload = {"company_id" :company["id"]}

		add_job_to_queue(
			session = session,
			job_name = AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN,
			submitted_by_user_id = cfg.BOT_USER_ID,
			is_high_priority = False,
			job_payload = payload
		)

	add_job_summary(session, AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN)

	return True, None

@errors.return_error_tuple
def generate_update_company_balances(
	session: Session
) -> Tuple[bool, errors.Error]:
	logging.info("Received request to update all company balances")
	cfg = cast(Config, current_app.app_config)

	# queries for all the company_balances job that are queued to not replicate work to be done
	currently_queued_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.name.in_([
				AsyncJobNameEnum.UPDATE_COMPANY_BALANCES,
			])
		).filter(
			models.AsyncJob.status == AsyncJobStatusEnum.QUEUED
		).all())
	currently_queued_payloads = [dict(job.job_payload if job.job_payload else {}) for job in currently_queued_jobs]
	currently_queued_company_ids = [ payload.get("company_id") for  payload in currently_queued_payloads]

	# Grab all companies and check if each one is dirty, if so generate job to update
	companies = reports_util.list_all_companies(session)
	cur_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	# add each companies recomputing job to the queue
	for company in companies:
		if company["id"] not in currently_queued_company_ids:
			summary_requests = reports_util.list_financial_summaries_that_need_balances_recomputed_by_company(
				session,
				company["id"],
				date_util.now_as_date(),
				amount_to_fetch = 1
			)

			if len(summary_requests) > 0:
				payload = {"company_id" :company["id"]}

				add_job_to_queue(
					session=session,
					job_name=AsyncJobNameEnum.UPDATE_COMPANY_BALANCES,
					submitted_by_user_id=cfg.BOT_USER_ID,
					is_high_priority=False,
					job_payload=payload
				)

	# this checks if a job summary already exists for the day, all the others
	# should be duplicates, but we want to make sure that it runs once a day
	first_job_summary = cast(
        models.AsyncJobSummary,
        session.query(models.AsyncJobSummary).filter(
            models.AsyncJobSummary.date == date_util.now_as_date()
        ).first())

	if first_job_summary == None:
		add_job_summary(session, AsyncJobNameEnum.UPDATE_COMPANY_BALANCES)

	return True, None

@errors.return_error_tuple
def orchestrate_update_dirty_company_balances(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
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
		amount_to_fetch=5,
	)
	if not compute_requests:
		return True, None
	
	active_compute_requests = reports_util.remove_financial_summaries_that_no_longer_need_to_be_recomputed(
		session,
		company_id,
		compute_requests,
	)

	dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
		session,
		active_compute_requests,
	)

	if fatal_error:
		logging.error(f"Got FATAL error while recomputing balances for companies that need it: '{fatal_error}'")
		return False, errors.Error(str(fatal_error))

	for cur_date in dates_updated:
		fatal_error = reports_util.compute_and_update_bank_financial_summaries(
			session, 
			cur_date,
		)
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
		
	add_job_summary(session, AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY)
	
	return True, None

@errors.return_error_tuple
def orchestrate_reports_monthly_loan_summary_Non_LOC(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:	
	company_id = job_payload["company_id"]
	is_test = job_payload["is_test"]
	test_email = job_payload["email"]
	as_of_date = job_payload["as_of_date"]
	user_id = job_payload["user_id"]
	print("Sending out monthly summary report emails for non-LOC customers")
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
		company_balance_lookup[str(company.id)] = loan_balances.CustomerBalance(company.as_dict(), session)

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
			session = session,
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
	logging.info("Received request to generate loan summary for loc")

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

	add_job_summary(session, AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY)

	return True, None

@errors.return_error_tuple
def orchestrate_reports_monthly_loan_summary_LOC(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:	
	company_id = job_payload["company_id"]
	is_test = job_payload["is_test"]
	test_email = job_payload["email"]
	as_of_date = job_payload["as_of_date"]
	user_id = job_payload["user_id"]

	print("Sending out monthly summary report emails for LOC customers")
	if sendgrid_client is None:
		return False, errors.Error('Cannot find sendgrid client')

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
			session = session,
			name = "monthly_summary_live_run",
			status = "succeeded",
			internal_state = recorded_state,
			params = {}
			)

	return True, None

@errors.return_error_tuple
def generate_automatic_debit_courtesy_alerts(
	session: Session
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)

	companies = reports_util.list_all_companies(session)
	company_ids = [company['id'] for company in companies]

	for company_id in company_ids:
		payload = {"company_id" : company_id}
		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=payload)
	add_job_summary(session, AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS)

	return True, None

@errors.return_error_tuple
def orchestrate_automatic_debit_courtesy_alerts(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	logging.info("Sending out courtesy alert for automatic monthly debits")

	today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)
	company_id = job_payload["company_id"]

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

	BATCH_SIZE = 50
	for loans_chunk in cast(Iterable[List[models.Loan]], chunker(all_open_loans, BATCH_SIZE)):
		_, err = report_generation_util.process_loan_chunk_for_automatic_debit_courtesy_alert(
			session, 
			sendgrid_client, 
			loans_chunk, 
			today)
		
		if err:
			return False, errors.Error(str(err))

	return True, None

# This method is NOT invoked by a daily cron job.
@errors.return_error_tuple
def generate_download_data_for_metrc_api_key_license_jobs_by_metrc_api_key_permissions(
	session: Session,
	cfg: Config,
	submitted_by_user_id: str,
	metrc_api_key_id: str,
	metrc_api_key_permissions: metrc_common_util.MetrcApiKeyPermissions,
) -> Tuple[bool, errors.Error]:
	# Query for currently active jobs to prevent doing duplicate work.
	currently_active_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			cast(Callable, models.AsyncJob.is_deleted.isnot)(True)
		).filter(
			models.AsyncJob.name == AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE
		).filter(
			models.AsyncJob.status.in_([
				AsyncJobStatusEnum.QUEUED,
				AsyncJobStatusEnum.INITIALIZED,
				AsyncJobStatusEnum.IN_PROGRESS,
			])
		).all())
	currently_active_payloads = [dict(job.job_payload if job.job_payload else {}) for job in currently_active_jobs]
	currently_active_tuples = set([
		(payload.get("metrc_api_key_id"), payload.get("license_number")) for payload in currently_active_payloads
	])

	for metrc_api_key_permission in metrc_api_key_permissions:
		license_number = metrc_api_key_permission["license_number"]
		if (metrc_api_key_id, license_number) not in currently_active_tuples:
			job_payload = {
				"metrc_api_key_id": metrc_api_key_id,
				"license_number": license_number,
			}
			add_job_to_queue(
				session=session,
				job_name=AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE,
				submitted_by_user_id=submitted_by_user_id,
				is_high_priority=False,
				job_payload=job_payload,
			)

	return True, None

# This method is NOT invoked by a daily cron job.
@errors.return_error_tuple
def generate_download_data_for_metrc_api_key_license_job_by_license_number(
	session: Session,
	cfg: Config,
	metrc_api_key_id: str,
	license_number: str,
) -> Tuple[bool, errors.Error]:
	job_payload = {
		"metrc_api_key_id": metrc_api_key_id,
		"license_number": license_number,
	}
	add_job_to_queue(
		session=session,
		job_name=AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE,
		submitted_by_user_id=cfg.BOT_USER_ID,
		is_high_priority=False,
		job_payload=job_payload,
	)

	return True, None

@errors.return_error_tuple
def orchestrate_download_data_for_metrc_api_key_license(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	metrc_api_key_id = job_payload["metrc_api_key_id"]
	license_number = job_payload["license_number"]

	end_date = date_util.now_as_date() - datetime.timedelta(days=1) # End date is yesterday.
	start_date = end_date - datetime.timedelta(days=cfg.DOWNLOAD_METRC_DATA_DAYS)

	response, err = metrc_download_util.download_data_for_metrc_api_key_license_in_date_range(
		session=session,
		config=cfg,
		apis_to_use=None,
		metrc_api_key_id=metrc_api_key_id,
		license_number=license_number,
		start_date=start_date,
		end_date=end_date,
		is_async_job=True,
		is_retry_failures=False,
	)

	if err:
		return False, err
	else:
		return True, None

@errors.return_error_tuple
def generate_refresh_metrc_api_key_permissions(
	session: Session,
) -> Tuple[bool, errors.Error]:
	"""
	Generate a job to refresh permissions for any Metrc API key which has not had permissions refreshed yet today.
	If a Metrc API key has already had permission refreshed today, do not generate a job.
	"""
	cfg = cast(Config, current_app.app_config)
	today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	candidate_metrc_api_keys = cast(
		List[models.MetrcApiKey],
		session.query(models.MetrcApiKey).filter(
			cast(Callable, models.MetrcApiKey.is_deleted.isnot)(True)
		).filter(
			cast(Callable, models.MetrcApiKey.is_functioning.isnot)(False)
		).filter(
			or_(
				models.MetrcApiKey.permissions_refreshed_at == None,
				models.MetrcApiKey.permissions_refreshed_at < today,
			)
		).all())

	for candidate_metrc_api_key in candidate_metrc_api_keys:
		metrc_api_key_id = str(candidate_metrc_api_key.id)
		job_payload = {
			"metrc_api_key_id": metrc_api_key_id,
		}
		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.REFRESH_METRC_API_KEY_PERMISSIONS,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=job_payload,
		)

	return True, None

@errors.return_error_tuple
def orchestrate_refresh_metrc_api_key_permissions(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	metrc_api_key_id = job_payload["metrc_api_key_id"]

	success, err = metrc_download_util.refresh_metrc_api_key_permissions(
		session=session,
		config=cfg,
		metrc_api_key_id=metrc_api_key_id,
		submitted_by_user_id=cfg.BOT_USER_ID,
	)
	if err:
		return False, err

	return True, None

@errors.return_error_tuple
def generate_reject_purchase_order_past_60_days(
	session: Session
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)

	purchase_orders = cast(
		List[models.PurchaseOrder],
		session.query(models.PurchaseOrder).join(# type: ignore
			models.Company, models.PurchaseOrder.company_id == models.Company.id
		).join(
			models.Contract, models.Company.contract_id == models.Contract.id
		).filter(
			cast(Callable, models.PurchaseOrder.is_deleted.isnot)(True)
		).filter(
			models.PurchaseOrder.new_purchase_order_status.in_([
				db_constants.NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR,
				db_constants.NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_VENDOR,
				db_constants.NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_BESPOKE,
				db_constants.NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING,
				db_constants.NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL,
				db_constants.NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED,
			])
		).filter(
			models.PurchaseOrder.order_date < date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE) - timedelta(days=60)
		).filter(
			models.Company.contract_id != None
		).filter(
			models.Contract.product_type.in_([
				db_constants.ProductType.DISPENSARY_FINANCING,
				db_constants.ProductType.INVENTORY_FINANCING,
				db_constants.ProductType.PURCHASE_MONEY_FINANCING,
			])
		).all())

	past_due_purchase_order_ids_by_company_id = defaultdict(list)
	for purchase_order in purchase_orders:
		net_terms = purchase_order.net_terms if purchase_order.net_terms else 0
		if purchase_order.order_date + timedelta(days=net_terms + 60) < date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE):
			past_due_purchase_order_ids_by_company_id[str(purchase_order.company_id)].append(str(purchase_order.id))

	for company_id, purchase_order_ids in past_due_purchase_order_ids_by_company_id.items():
		payload = {"company_id" : company_id, "purchase_order_ids" : purchase_order_ids}
		add_job_to_queue(
			session=session,
			job_name=AsyncJobNameEnum.PURCHASE_ORDERS_PAST_DUE,
			submitted_by_user_id=cfg.BOT_USER_ID,
			is_high_priority=False,
			job_payload=payload)

	add_job_summary(session, AsyncJobNameEnum.PURCHASE_ORDERS_PAST_DUE)

	return True, None


@errors.return_error_tuple
def orchestrate_reject_purchase_order_past_60_days(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	company_id = job_payload["company_id"]
	purchase_order_ids = job_payload["purchase_order_ids"]
	rejection_note = "Purchase order is over 60 days past due"

	customer_name = ""
	purchase_orders = []

	for purchase_order_id in purchase_order_ids:
		purchase_order_for_sendgrid_template = {}
		purchase_order, err = purchase_orders_util.reject_purchase_order(
			session=session,
			purchase_order_id=purchase_order_id,
			rejected_by_user_id=cfg.BOT_USER_ID,
			rejected_by_user_full_name="Bespoke Financial",
			rejection_note=rejection_note,
			is_bank_admin=True
		)
		if err:
			return False, errors.Error(str(err))

		purchase_order_for_sendgrid_template["order_number"] = purchase_order.order_number
		purchase_order_for_sendgrid_template["amount"] = number_util.to_dollar_format(float(purchase_order.amount))
		purchase_order_for_sendgrid_template["requested_date"] = date_util.human_readable_yearmonthday(
			purchase_order.requested_at if purchase_order.requested_at is not None else date_util.now()
		)
		purchase_order_for_sendgrid_template["vendor_name"] = purchase_order.vendor.get_display_name()
		purchase_orders.append(purchase_order_for_sendgrid_template)
		customer_name = purchase_order.company.get_display_name()

	customer_users = models_util.get_active_users(
		company_id,
		session,
		filter_contact_only=True
	)

	if not customer_users:
		return False, errors.Error('There are no users configured for this customer')

	customer_emails = [user.email for user in customer_users]

	_, err = sendgrid_client.send(
		template_name = sendgrid_util.TemplateNames.BANK_REJECTED_PURCHASE_ORDER_MULTIPLE,
		template_data = {
			'customer_name': customer_name,
			'purchase_order': purchase_orders,
			'rejection_note': rejection_note,
		},
		recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses(),
	)

	if err:
		return False, errors.Error(str(err))

	session.commit()
	logging.info(f"Company ID: {company_id} had the following purchase orders rejected due to being past due 60 days: {purchase_order_ids}")

	return True, None

# not a cron job/manual generation
@errors.return_error_tuple
def generate_manual_financial_reports_coming_due_alerts(
	session: Session,
	is_test_run: bool = False,
	test_email: str = "",
	companies: List[str] = []
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	if companies is not None and len(companies) > 0:
		for company_id in companies:
			payload = {
				"company_id" : str(company_id), 
				"is_test_run" : is_test_run,
				"test_email" : test_email
				}
			add_job_to_queue(
				session=session,
				job_name=AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS,
				submitted_by_user_id=cfg.BOT_USER_ID,
				is_high_priority=True,
				job_payload=payload
			)
	else:
		current_page = 0
		BATCH_SIZE = 50
		is_done = False
		
		while not is_done:

			try:
				batched_companies, has_more_customers, err = queries.get_all_customers(
					session,
					is_active = True,
					offset = current_page * BATCH_SIZE,
					batch_size = BATCH_SIZE,
				)

				# Normally, we would check for the length of companies here
				# However, we set up `get_all_customers` to filter for active customers
				# One nice thing about that function is that it returns an error before
				# filtering if no customers are found. This error based exit
				# plays nicely with our offset approach used here
				if not has_more_customers:
					is_done = True
					continue
				
				for company in batched_companies:
					company_id = str(company.id)
					# cron generated runs are never test runs
					payload = {
						"company_id" : str(company_id), 
						"is_test_run" : is_test_run,
						"test_email" : test_email,
						}
					add_job_to_queue(
						session=session,
						job_name=AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS,
						submitted_by_user_id=cfg.BOT_USER_ID,
						is_high_priority=True,
						job_payload=payload
					)

			except Exception as e:
				return False, errors.Error(str(e))

			current_page += 1

	add_job_summary(session, AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS)

	return True, None

# while not currently used, is being kept for the future cron job
@errors.return_error_tuple
def generate_financial_reports_coming_due_alerts(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	current_page = 0
	BATCH_SIZE = 50
	is_done = False

	while not is_done:

		try:
			batched_companies, has_more_customers, err = queries.get_all_customers(
				session,
				is_active = True,
				offset = current_page * BATCH_SIZE,
				batch_size = BATCH_SIZE,
			)
			
			# Normally, we would check for the length of companies here
			# However, we set up `get_all_customers` to filter for active customers
			# One nice thing about that function is that it returns an error before
			# filtering if no customers are found. This error based exit
			# plays nicely with our offset approach used here
			if not has_more_customers:
				is_done = True
				continue

			for company in batched_companies:
				company_id = str(company.id)
				# cron generated runs are never test runs
				payload = {
					"company_id" : str(company_id), 
					"is_test_run" : False,
					"test_email" : "",
					}
				add_job_to_queue(
					session=session,
					job_name=AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS,
					submitted_by_user_id=cfg.BOT_USER_ID,
					is_high_priority=True,
					job_payload=payload
				)

		except Exception as e:
			return False, errors.Error(str(e))

		current_page += 1
	add_job_summary(session, AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS)

	return True, None

@errors.return_error_tuple
def orchestrate_financial_reports_coming_due_alerts(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:
	company_id = job_payload["company_id"]
	is_test_run = job_payload["is_test_run"]
	test_email = job_payload["test_email"]
	# LOC needs borrowing base + financial summaries
	contract, err = contract_util.get_active_contract_by_company_id(session, company_id)
	if err:
		return False, err
	contract_product_type = contract.get_product_type()[0]
	if contract_product_type == None:
		return False, errors.Error("Company has no active contract")

	company_settings, err = queries.get_company_settings_by_company_id(session, company_id)

	if err:
		return False, err

	get_last_month_due_date = date_util.get_previous_month_last_date(date_util.now_as_date())

	financial_report, err = queries.get_most_recent_ebba_applications_by_company_id(
			session,
			company_id,
			ClientSurveillanceCategoryEnum.FINANCIAL_REPORT,
			include_submitted = True,
			include_rejected = True
		)

	if err:
		return False, err

	missing_financial_report_months = []
	missing_financial_report_months_as_string = ""

	if financial_report != None:
		financial_report_last_date = date_util.get_last_day_of_month_date(str(financial_report.application_date))

		while financial_report_last_date < get_last_month_due_date:
			next_month = str(date_util.add_days(financial_report_last_date, 1))
			financial_report_last_date = date_util.get_last_day_of_month_date(next_month)
			missing_financial_report_months.append(financial_report_last_date)

		missing_financial_report_months_as_string = ", ".join([str(x) for x in missing_financial_report_months])

	else:
		missing_financial_report_months_as_string = "as of contract start"

	dispensary_financing_with_no_metrc_key = True if contract_product_type == ProductType.DISPENSARY_FINANCING and company_settings.metrc_api_key_id == None else False

	missing_information = ""
	if (len(missing_financial_report_months) > 0 or len(missing_financial_report_months_as_string) > 0) and not dispensary_financing_with_no_metrc_key:
		missing_information += f"<u><b>Submit Financial Reports</b></u><br>" \
			+ f"{'Balance Sheet as of:':30}{missing_financial_report_months_as_string}<br>" \
			+ f"{'Monthly Income Statement as of:':30} {missing_financial_report_months_as_string}<br>" \
			+ f"{'A/R Aging Summary Report as of:':30} {missing_financial_report_months_as_string}<br>" \
			+ f"{'A/P Aging Summary Report as of:':30} {missing_financial_report_months_as_string}<br>"
	
	if dispensary_financing_with_no_metrc_key:
			missing_information += f"<u><b>Submit Financial Reports</b></u><br>" \
			+ f"{'POS Data as of:':30} {missing_financial_report_months_as_string}<br>" \
			+ f"{'Inventory Report as of:':30} {missing_financial_report_months_as_string}<br>"
		
	if contract_product_type == ProductType.LINE_OF_CREDIT:
		borrowing_base, err = queries.get_most_recent_ebba_applications_by_company_id(
			session,
			company_id,
			ClientSurveillanceCategoryEnum.BORROWING_BASE,
			include_submitted = True,
			include_rejected = True
		)

		if err:
			return False, err

		missing_borrowing_base_months_as_string = ""
		missing_borrowing_base_months = []
		if borrowing_base != None:
			borrowing_base_last_date = date_util.get_last_day_of_month_date(str(borrowing_base.application_date))
			while borrowing_base_last_date < get_last_month_due_date:
				next_month = str(date_util.add_days(borrowing_base_last_date, 1))
				borrowing_base_last_date = date_util.get_last_day_of_month_date(next_month)
				missing_borrowing_base_months.append(borrowing_base_last_date)

			missing_borrowing_base_months_as_string = ", ".join([str(x) for x in missing_borrowing_base_months])
		else:
			missing_borrowing_base_months_as_string = "as of contract start"

		if len(missing_borrowing_base_months) > 0 or len(missing_borrowing_base_months_as_string) > 0:
			missing_information += f"<u><b>Create a Borrowing Base with supporting documents</b></u><br>" \
				+ f"{'A/R Aging Summary Report':30}: {missing_borrowing_base_months_as_string}<br>" \
				+ f"{'Inventory Valuation Report:':30} {missing_borrowing_base_months_as_string}<br>" \
				+ f"{'Bank Statements:':30} {missing_borrowing_base_months_as_string}<br>"

	customer_users = queries.get_active_users_by_role(
		session,
		company_id,
		CustomerRoles.FINANCIALS,
		filter_contact_only=True
	)

	if len(customer_users) == 0:
		customer_users = models_util.get_active_users(
		company_id,
		session,
		filter_contact_only=True
	)

	if not customer_users:
		return False, errors.Error('There are no users configured for this customer')

	customer_emails = [user.email for user in customer_users]

	# the 15th is the due date to turn in the previous months financial statements
	due_date = date_util.human_readable_yearmonthday_from_date(date_util.get_day_of_month_date(str(date_util.now_as_date()), 15))
	company, err = queries.get_company_by_id(session, company_id)

	if err:
		return False, err
	if is_test_run:
		recipients = [test_email]
	else: 
		recipients = customer_emails + sendgrid_client.get_bank_notify_email_addresses()

	if len(missing_information) > 0:
		if not (contract_product_type == ProductType.DISPENSARY_FINANCING and company_settings.metrc_api_key_id == None):
			missing_information += f"<b>**Please note: if adjustments were made to any prior month's financial statements after they were provided to Bespoke, include these in the upload.</b><br>" 
		_, err = sendgrid_client.send(
			template_name = sendgrid_util.TemplateNames.ALERT_FOR_EXPIRED_BORROWING_BASE_CERTIFICATION,
			template_data = {
				'company_name': company.name,
				'missing_information' : missing_information,
				'due_date': due_date,
				'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>',
			},
			recipients = recipients,
		)

	if err:
		return False, errors.Error(str(err))

	session.commit()
	logging.info(f"Company ID: {company_id} finished sending emails for missing financial reports.")

	return True, None

@errors.return_error_tuple
def generate_async_monitoring(
	session: Session,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)

	add_job_to_queue(
		session=session,
		job_name=AsyncJobNameEnum.ASYNC_MONITORING,
		submitted_by_user_id=cfg.BOT_USER_ID,
		is_high_priority=True,
		job_payload={}
	)

	return True, None

@errors.return_error_tuple
def orchestrate_async_monitoring(
	session: Session,
	cfg: Config,
	sendgrid_client: sendgrid_util.Client,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	# gets all waiting jobs
	queued_async_jobs = cast(
		List[models.AsyncJob],
		session.query(models.AsyncJob).filter(
			models.AsyncJob.status == AsyncJobStatusEnum.QUEUED
		).order_by(
			models.AsyncJob.queued_at.asc()
		).all())

	slack_message_info: Dict[str, Any] = {}
	slack_message_info["total_queued_async_jobs"] = len(queued_async_jobs)
	slack_message_info["longest_waiting_queued_async_job"] = date_util.human_readable_datetime(queued_async_jobs[0].queued_at) if len(queued_async_jobs) > 0 else "N/A"
	
	async_job_name_to_async_jobs_lookup: Dict[str, List[models.AsyncJob]] = {}
	for job in queued_async_jobs:
		if job.name not in async_job_name_to_async_jobs_lookup:
			async_job_name_to_async_jobs_lookup[job.name] = []	
		async_job_name_to_async_jobs_lookup[job.name].append(job)
	
	late_jobs: Dict[str, Tuple[str, int]] = {}
	for name, list_of_jobs in async_job_name_to_async_jobs_lookup.items():
		most_delayed_job = list_of_jobs[0]
		delay_tolerance_hours = (ASYNC_JOB_NAME_TO_CUSTOM_DELAY_TOLERANCE_HOURS[name] * -1) if name in ASYNC_JOB_NAME_TO_CUSTOM_DELAY_TOLERANCE_HOURS else -2
		earliest_acceptable_delay_time = date_util.hours_from_today(delay_tolerance_hours)

		if most_delayed_job.queued_at < earliest_acceptable_delay_time:
			late_jobs[name] = (date_util.human_readable_datetime(most_delayed_job.queued_at), len(list_of_jobs))

	slack_message_info['longest_waiting_queued_async_job_by_job_name'] = late_jobs
	slack_util.send_async_monitor_status_message(cfg, slack_message_info)
	return True, None

ASYNC_JOB_GENERATION_LOOKUP = {
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS: generate_autogenerate_repayments,
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS: generate_autogenerate_repayment_alerts,
	AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS: generate_automatic_debit_courtesy_alerts,
	AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS: generate_financial_reports_coming_due_alerts,
	AsyncJobNameEnum.LOANS_COMING_DUE: generate_companies_loans_coming_due,
	AsyncJobNameEnum.LOANS_PAST_DUE: generate_companies_loans_past_due,
	AsyncJobNameEnum.PURCHASE_ORDERS_PAST_DUE: generate_reject_purchase_order_past_60_days,
	AsyncJobNameEnum.REFRESH_METRC_API_KEY_PERMISSIONS: generate_refresh_metrc_api_key_permissions,
	AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN: generate_daily_company_balances_run,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: generate_update_company_balances,
	AsyncJobNameEnum.ASYNC_MONITORING: generate_async_monitoring,
}

ASYNC_JOB_ORCHESTRATION_LOOKUP = {
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS: orchestrate_autogenerate_repayments,
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS: orchestrate_autogenerate_repayment_alerts,
	AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS: orchestrate_automatic_debit_courtesy_alerts,
	AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE: orchestrate_download_data_for_metrc_api_key_license,
	AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS: orchestrate_financial_reports_coming_due_alerts,
	AsyncJobNameEnum.LOANS_COMING_DUE: orchestrate_loans_coming_due,
	AsyncJobNameEnum.LOANS_PAST_DUE: orchestrate_loans_past_due,
	AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY: orchestrate_reports_monthly_loan_summary_LOC,
	AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY: orchestrate_reports_monthly_loan_summary_Non_LOC,
	AsyncJobNameEnum.PURCHASE_ORDERS_PAST_DUE: orchestrate_reject_purchase_order_past_60_days,
	AsyncJobNameEnum.REFRESH_METRC_API_KEY_PERMISSIONS: orchestrate_refresh_metrc_api_key_permissions,
	AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN: orchestrate_update_dirty_company_balances,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: orchestrate_update_dirty_company_balances,
	AsyncJobNameEnum.ASYNC_MONITORING: orchestrate_async_monitoring,

}
