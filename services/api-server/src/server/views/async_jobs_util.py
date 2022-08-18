import logging
from typing import Any, Dict, Tuple, cast, List

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import (AsyncJobStatusEnum)
from sqlalchemy.orm.session import Session
from bespoke.db.db_constants import AsyncJobNameEnum

@errors.return_error_tuple
def add_job_to_queue(
	session: Session,
	job_name: str,
	submitted_by_user_id: str,
	is_high_priority: bool,
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	new_job = models.AsyncJobs( # type: ignore
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
		models.AsyncJobs,
		session.query(models.AsyncJobs).filter(
			models.AsyncJobs.id == job_id
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
		List[models.AsyncJobs],
		session.query(models.AsyncJobs).filter(
			models.AsyncJobs.id.in_(job_ids)
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
		List[models.AsyncJobs],
		session.query(models.AsyncJobs).filter(
			models.AsyncJobs.id.in_(job_ids)
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
def dummy_job(
	job_payload: Dict[str, Any],
) -> Tuple[bool, errors.Error]:

	logging.info("dummy job has been run")

	return True, None

ASYNC_JOBS = {
	AsyncJobNameEnum.DUMMY: dummy_job,
}
