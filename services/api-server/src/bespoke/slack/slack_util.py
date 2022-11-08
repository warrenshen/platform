import json
import requests

from bespoke import errors 
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import AsyncJobStatusEnum, AsyncJobNameEnum, AsyncJobNameEnumToLabel
from server.config import Config
from typing import Dict, List, Tuple

def send_job_summary(
	cfg: Config,
	async_jobs: List[models.AsyncJob],
	async_job_summaries: List[models.AsyncJobSummary]
) -> Tuple[ int, errors.Error]:
	headers = {'Content-Type': 'application/json'}

	# update company balances is skipped because it runs frequently
	# Monthly report summary is skipped because it is tracked in the UI
	# automatic debit courtesty alerts wasn't running before but was still converted in case
	skipped_jobs = [
		AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY, 
		AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY,
		AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS]
	
	days_run = {
		AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS: ["Wednesday"],
		AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
		AsyncJobNameEnum.LOANS_PAST_DUE: ["Monday", "Thursday"],
		AsyncJobNameEnum.LOANS_COMING_DUE: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: ["Monday"]
	}
	
	response_blocks = []
	today_info = {
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": f"Report for {date_util.date_to_db_str(date_util.now_as_date())}"
			}
		}
	response_blocks.append(today_info)
	successfully_generated_job_names = [summary.name for summary in async_job_summaries]
	for enum, label in AsyncJobNameEnumToLabel.items():
		# skip over the adhoc jobs
		if enum in skipped_jobs:
			continue

		all_async_jobs_for_enum = [job for job in async_jobs if job.name == enum]
		# jobs were generated
		if enum in successfully_generated_job_names:
			new_block = create_status_block(label, all_async_jobs_for_enum)

		# job did not generate any jobs
		else:
			day_of_week = date_util.human_readable_day_of_week(date_util.now())
			# if job enum is in days_run that means it wasn't supposed to run today
			if day_of_week not in days_run[enum]:
				new_block = create_job_is_not_run_today_block(label, days_run[enum])
			
			else:
				# this job was supposed to generate today but didn't
				new_block = create_generation_failure_block(label)
		response_blocks.append(new_block)

	response_blocks.append(get_divider_bar_block())
	payload = {"blocks" : response_blocks}


	response = requests.post(
			url = cfg.ASYNC_JOB_SLACK_URL, 
			data = json.dumps(payload), 
			headers = headers,
		)
	if response.status_code != 200:
	    return response.status_code, errors.Error(
	        'Request to slack returned an error %s, the response is:\n%s'
	        % (response.status_code, response.text))

	return response.status_code, None

def get_divider_bar_block() -> Dict:
	return {
			"type": "divider"
		}

def create_status_block(
	job_name: str,
	async_jobs: List[models.AsyncJob],
) -> Dict:
	total_jobs = len(async_jobs)
	num_success_jobs = len([job for job in async_jobs if job.status == AsyncJobStatusEnum.COMPLETED])
	num_failed_jobs = len([job for job in async_jobs if job.status == AsyncJobStatusEnum.FAILED])

	emoji = "white_check_mark" if num_failed_jobs == 0 else "rotating_light"
	job_succeded_text = f"{num_success_jobs} / {total_jobs} tasks succeeded" if total_jobs != 0 else ""
	job_failed_text = f"{num_failed_jobs} / {total_jobs} tasks failed" if total_jobs != 0 else ""

	job_detail_text = f"({job_succeded_text}, {job_failed_text})" if total_jobs != 0 else ""
	return {
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": f":{emoji}: {job_name} job ran successfully today {job_detail_text}"
			}
		}

def create_generation_failure_block(
	job_name: str,
) -> Dict:
	return {
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": f":x: {job_name} job failed today (no tasks set up)"
			}
		}

def create_job_is_not_run_today_block(
	job_name: str,
	dates: List[str],
) -> Dict:
	dates_string = ", ".join(dates)
	return {
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": f":white_large_square: {job_name} job does not run today (only on {dates_string})"
			}
		}

def send_job_slack_message(
	cfg: Config,
	job: models.AsyncJob
) -> Tuple[ int, errors.Error ]:

	headers = {'Content-Type': 'application/json'}
	is_dev = cfg.is_development_env()
	if job.status == AsyncJobStatusEnum.COMPLETED:
		payload = create_success_message(job)
	elif job.status == AsyncJobStatusEnum.FAILED:
		payload = create_failure_message(job, is_dev)
	else:
		return None, None
	response = requests.post(
		url = cfg.ASYNC_JOB_SLACK_URL, 
		data = json.dumps(payload), 
		headers = headers,
	)

	if response.status_code != 200:
	    return response.status_code, errors.Error(
	        'Request to slack returned an error %s, the response is:\n%s'
	        % (response.status_code, response.text))

	return response.status_code, None

def create_success_message(job: models.AsyncJob) -> Dict:
	job_name = AsyncJobNameEnumToLabel[job.name]
	started_at = date_util.human_readable_datetime(job.started_at)
	ended_at = date_util.human_readable_datetime(job.ended_at)
	job_payload = json.dumps(job.job_payload)
	return {
		"blocks": [
			{
				"type": "section",
				"fields": [
					{
						"type": "mrkdwn",
						"text": f":white_check_mark: {job_name} job has succeeded"
					},
					{
						"type": "mrkdwn",
						"text": "\n"
					},
					{
						"type": "mrkdwn",
						"text": f">Start Time: {started_at} \n> End Time: {ended_at} \n>Job Details: {job_payload}",
					}
				]
			},
		]
	}

def create_failure_message(job: models.AsyncJob, is_dev: bool) -> Dict:
	job_name = AsyncJobNameEnumToLabel[job.name]
	started_at = date_util.human_readable_datetime(job.started_at)
	ended_at = date_util.human_readable_datetime(job.ended_at)
	job_payload = job.job_payload
	err_details = job.err_details
	notify_at_here = "DEV" if is_dev else "@here"
	return {
		"blocks": [
			{
				"type": "section",
				"fields": [
					{
						"type": "mrkdwn",
						"text": f"{notify_at_here}",
					},
					{
						"type": "mrkdwn",
						"text": "\n"
					},
					{
						"type": "mrkdwn",
						"text": f":rotating_light: {job_name} job has failed"
					},
					{
						"type": "mrkdwn",
						"text": "\n"
					},
					{
						"type": "mrkdwn",
						"text": f">Start Time: {started_at} \n> End Time: {ended_at} \n>Job Details: {job_payload}",
					}
				]
			},
			{
				"type": "section",
				"fields": [
					{
						"type": "mrkdwn",
						"text": f"```Error: {err_details}```"
					}
				]
			}
		]
	}
