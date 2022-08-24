import requests
import json
from typing import Dict, Tuple
from bespoke.db import models
from bespoke.db.db_constants import AsyncJobStatusEnum, AsyncJobNameEnumToLabel
from bespoke.date import date_util

from bespoke import errors 

webhook = 'https://hooks.slack.com/services/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'

def send_slack_message(
	job: models.AsyncJob
) -> Tuple[ int, errors.Error ]:

	headers = {'Content-Type': 'application/json'}
	if job.status == AsyncJobStatusEnum.COMPLETED:
		payload = create_success_message(job)
	elif job.status == AsyncJobStatusEnum.FAILED:
		payload = create_failure_message(job)
	else:
		return None, None
	response = requests.post(
		url = webhook, 
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

def create_failure_message(job: models.AsyncJob) -> Dict:
	job_name = AsyncJobNameEnumToLabel[job.name]
	started_at = date_util.human_readable_datetime(job.started_at)
	ended_at = date_util.human_readable_datetime(job.ended_at)
	job_payload = job.job_payload
	err_details = job.err_details
	return {
		"blocks": [
			{
				"type": "section",
				"fields": [
					{
						"type": "mrkdwn",
						"text": "@here",
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

