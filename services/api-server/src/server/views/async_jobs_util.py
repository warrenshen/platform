import logging
from typing import Any, Dict, Tuple, cast

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

	delete_job.is_deleted = True
	delete_job.deleted_at = date_util.now()
	delete_job.updated_at = date_util.now()

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