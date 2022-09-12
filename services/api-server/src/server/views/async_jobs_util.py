import logging

from typing import Any, Callable, Dict, Tuple, cast, List
from bespoke import errors
from flask import current_app
from server.config import Config
from bespoke.date import date_util
from bespoke.db import models
from sqlalchemy.orm.session import Session
from bespoke.db.db_constants import AsyncJobNameEnum, AsyncJobStatusEnum
from bespoke.slack import slack_util
from bespoke.finance.loans import reports_util
from bespoke.reports.report_generation_util import process_coming_due_loan_chunk, get_coming_due_loans_to_notify, get_past_due_loans_to_notify, process_past_due_loan_chunk 
from bespoke.email import sendgrid_util


@errors.return_error_tuple
def generate_jobs(
	session: Session,
	job_name: str,
) -> Tuple[bool, errors.Error]:

	job_success, err_msg = ASYNC_JOB_GENERATION_LOOKUP[job_name](session)
	if job_name not in ASYNC_JOB_GENERATION_LOOKUP:
		return False, errors.Error("Job does not exist")
		
	ASYNC_JOB_GENERATION_LOOKUP[job_name](session)

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
	
	loans_to_notify = get_coming_due_loans_to_notify(session, company_id, today_date)
	if len(loans_to_notify) != 0:
		_, err = process_coming_due_loan_chunk(session, company_id, sendgrid_client, report_link, payment_link, loans_to_notify)

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

				loans_to_notify = get_coming_due_loans_to_notify(session, company_id, today_date)				
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

				loans_to_notify = get_past_due_loans_to_notify(session, company_id, today_date)				
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
	
	loans_to_notify = get_past_due_loans_to_notify(session, company_id, today_date)
	if len(loans_to_notify) != 0:
		_, err = process_past_due_loan_chunk(session, company_id, sendgrid_client, report_link, payment_link, loans_to_notify)

		if err:
			return False, errors.Error("unable to send")		
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

ASYNC_JOB_GENERATION_LOOKUP = {
	AsyncJobNameEnum.LOANS_COMING_DUE: generate_companies_loans_coming_due_job,
	AsyncJobNameEnum.LOANS_PAST_DUE: generate_companies_loans_past_due_job,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: update_company_balances_job, 
}

ASYNC_JOB_ORCHESTRATION_LOOKUP = {
	AsyncJobNameEnum.LOANS_COMING_DUE: loans_coming_due_job,
	AsyncJobNameEnum.LOANS_PAST_DUE: loans_past_due_job,
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: update_dirty_company_balances_job,
}

