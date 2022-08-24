import logging
import random
import time

from typing import Any, Callable, Dict, Tuple, cast, List
from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (AsyncJobStatusEnum)
from sqlalchemy.orm.session import Session
from bespoke.db.db_constants import AsyncJobNameEnum
from bespoke.slack import slack_util

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
		job_success, err_msg = ASYNC_JOBS[job.name](payload)

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
		slack_util.send_slack_message(job)

	return [job.id for job in starting_jobs], None

@errors.return_error_tuple
def dummy_job(
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	# if random.randint(1, 100) < 50:
	# 	return False, errors.Error("Error")
	time.sleep(42)

	logging.info(f"dummy job with has been run")

	return True, None

ASYNC_JOBS = {
	AsyncJobNameEnum.DUMMY: dummy_job,
}
