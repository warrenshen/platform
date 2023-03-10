"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/batch/

What:
This script soft deletes failed async jobs.

Why:
You can run this script after a incident which creates a large amount of failed async jobs.
"""

import sys
import os
import logging
from os import path

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db import db_constants

def delete_failed_async_jobs(session, is_test_run):
    # Delete failed async jobs
    failed_async_jobs = session.query(models.AsyncJob).filter(
        models.AsyncJob.status == db_constants.AsyncJobStatusEnum.FAILED,
    ).filter(
        models.AsyncJob.is_deleted.isnot(True),
    ).limit(50).all()

    for failed_async_job in failed_async_jobs:
        logging.info(f'Deleting failed async job {failed_async_job.id}')
        if not is_test_run:
            failed_async_job.is_deleted = True
            failed_async_job.deleted_at = date_util.now()

    return len(failed_async_jobs)


def main(is_test_run: bool) -> None:
    logging.basicConfig(level=logging.INFO)

    engine = models.create_engine(statement_timeout=30000) # 30 seconds timeout
    session_maker = models.new_sessionmaker(engine)

    page = 1
    deleted_jobs_count = 0

    while True:
        with models.session_scope(session_maker) as session:
            jobs_deleted = delete_failed_async_jobs(session, is_test_run)
            deleted_jobs_count += jobs_deleted

            if jobs_deleted < 50:
                break

            page += 1
            logging.info(f"Finished deleting page {page} of failed async jobs")

    logging.info(f"[SUCCESS] Successfully deleted {deleted_jobs_count} failed async jobs")


if __name__ == '__main__':
    if not os.environ.get('DATABASE_URL'):
        print('You must set "DATABASE_URL" in the environment to use this script')
        exit(1)

    is_test_run = True

    if not os.environ.get("CONFIRM"):
        print("This script CHANGES information in the database")
        print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
    else:
        is_test_run = False

    main(is_test_run=is_test_run)
