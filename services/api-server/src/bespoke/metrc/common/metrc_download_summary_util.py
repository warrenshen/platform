import datetime
import logging
from mypy_extensions import TypedDict
from typing import Any, Dict, List, Tuple, cast
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.db import models
from bespoke.db.db_constants import MetrcDownloadStatus, MetrcDownloadSummaryStatus
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_error_util import MetrcRetryError

RerunDailyJobInfoDict = TypedDict('RerunDailyJobInfoDict', {
	'cur_date': datetime.date,
	'company_id': str
})

def _create_metrc_download_summary_instance(retry_errors: List[MetrcRetryError]) -> models.MetrcDownloadSummary:
	"""
		Get a summary based on all the errors seen for the day
	"""
	summary = models.MetrcDownloadSummary(
		harvests_status=MetrcDownloadStatus.SUCCESS,
		packages_status=MetrcDownloadStatus.SUCCESS,
		plant_batches_status=MetrcDownloadStatus.SUCCESS,
		plants_status=MetrcDownloadStatus.SUCCESS,
		sales_status=MetrcDownloadStatus.SUCCESS,
		transfers_status=MetrcDownloadStatus.SUCCESS,
		status=MetrcDownloadSummaryStatus.COMPLETED,
		num_retries=0,
		retry_payload={},
		err_details={},
	)
	if not retry_errors:
		return summary

	def _update_summary_status(newer_status: str) -> None:
		if summary.status == MetrcDownloadSummaryStatus.FAILURE:
			# Once we determine its a failure, keep it pinned to that
			# value.
			return

		if newer_status == MetrcDownloadStatus.NO_ACCESS:
			# We ignore when we have NO_ACCESS to an API endpoint since
			# retrying wont do anything there.
			pass
		elif newer_status == MetrcDownloadStatus.METRC_SERVER_ERROR:
			summary.status = MetrcDownloadSummaryStatus.NEEDS_RETRY
		elif newer_status == MetrcDownloadStatus.BESPOKE_SERVER_ERROR:
			summary.status = MetrcDownloadSummaryStatus.NEEDS_RETRY

	err_details: Dict = {
		'errors': []
	}

	def _update_status(cur_status: str, retry_error: MetrcRetryError) -> str:
		newer_status = retry_error.get_api_status()
		_update_summary_status(newer_status)

		if cur_status == MetrcDownloadStatus.NO_ACCESS:
			# No one can override NO_ACCESS
			return cur_status

		err_details['errors'].append({
			'params': retry_error.retry_params,
			'err_details': retry_error.err_details,
		})
 
		if cur_status == MetrcDownloadStatus.METRC_SERVER_ERROR:
			# Metrc server error comes next in precedence
			return cur_status

		return newer_status

	for retry_error in retry_errors:
		params = retry_error.retry_params
		path = params['path']

		if path.startswith('/harvests'):
			summary.harvests_status = _update_status(
				summary.harvests_status, retry_error)
		elif path.startswith('/packages'):
			summary.packages_status = _update_status(
				summary.packages_status, retry_error)
		elif path.startswith('/plantbatches'):
			summary.plant_batches_status = _update_status(
				summary.plant_batches_status, retry_error)
		elif path.startswith('/plants'):
			summary.plants_status = _update_status(
				summary.plants_status, retry_error)
		elif path.startswith('/sales'):
			summary.sales_status = _update_status(
				summary.sales_status, retry_error)
		elif path.startswith('/transfers'):
			summary.transfers_status = _update_status(
				summary.transfers_status, retry_error)

	summary.retry_payload = {}
	summary.err_details = err_details
	return summary

def _copy_over_summary(prev: models.MetrcDownloadSummary, cur: models.MetrcDownloadSummary) -> None:
	prev.retry_payload = cur.retry_payload
	prev.status = cur.status
	prev.err_details = cur.err_details

	prev.harvests_status = cur.harvests_status
	prev.packages_status = cur.packages_status
	prev.plant_batches_status = cur.plant_batches_status
	prev.plants_status = cur.plants_status
	prev.sales_status = cur.sales_status
	prev.transfers_status = cur.transfers_status

	prev.num_retries += 1

	if prev.status == MetrcDownloadSummaryStatus.COMPLETED:
		prev.num_retries = 0

	if prev.num_retries > 3:
		# We dont allow a summary to retry more than 3 times
		prev.status = MetrcDownloadSummaryStatus.FAILURE

def _get_metrc_download_summary(
	session: Session,
	license_number: str,
	date: datetime.date,
) -> models.MetrcDownloadSummary:
	metrc_download_summary = cast(
		models.MetrcDownloadSummary,
		session.query(models.MetrcDownloadSummary).filter(
			models.MetrcDownloadSummary.license_number == license_number
		).filter(
			models.MetrcDownloadSummary.date == date
		).first())
	return metrc_download_summary


def is_metrc_download_summary_previously_successful(
	session: Session,
	license_number: str,
	date: datetime.date,
	new_license_permissions_dict: metrc_common_util.LicensePermissionsDict,
) -> bool:
	existing_metrc_download_summary = _get_metrc_download_summary(
		session=session,
		license_number=license_number,
		date=date,
	)

	if not existing_metrc_download_summary:
		return False

	nlpd = new_license_permissions_dict
	existing = existing_metrc_download_summary
	success_status = MetrcDownloadStatus.SUCCESS
	# If the new license permissions dict has permission to data that
	# the previous download summary did not successfully download,
	# do NOT consider the previous download successful.
	if (
		(nlpd['is_harvests_enabled'] and existing.harvests_status != success_status) or
		(nlpd['is_plant_batches_enabled'] and existing.plant_batches_status != success_status) or
		(nlpd['is_plants_enabled'] and existing.plants_status != success_status) or
		(nlpd['is_packages_enabled'] and existing.packages_status != success_status) or
		(nlpd['is_sales_receipts_enabled'] and existing.sales_status != success_status) or
		(nlpd['is_transfers_enabled'] and existing.transfers_status != success_status)
	):
		return False

	return True

def write_metrc_download_summary(
	session: Session,
	license_number: str,
	cur_date: datetime.date,
	retry_errors: List[MetrcRetryError],
	company_id: str,
	metrc_api_key_id: str,
) -> None:
	new_metrc_download_summary = _create_metrc_download_summary_instance(retry_errors)
	new_metrc_download_summary.license_number = license_number
	new_metrc_download_summary.date = cur_date
	new_metrc_download_summary.company_id = cast(Any, company_id)
	new_metrc_download_summary.metrc_api_key_id = cast(Any, metrc_api_key_id)

	existing_metrc_download_summary = _get_metrc_download_summary(
		session=session,
		license_number=license_number,
		date=cur_date,
	)

	if existing_metrc_download_summary:
		_copy_over_summary(prev=existing_metrc_download_summary, cur=new_metrc_download_summary)
	else:
		session.add(new_metrc_download_summary)

	if retry_errors:
		for retry_error in retry_errors:
			if retry_error.get_api_status() == MetrcDownloadStatus.NO_ACCESS:
				continue

			logging.error('Error with one of the metrc downloads for day {} company {}. Reason: {}'.format(
				cur_date, company_id, retry_error.err_details))

def fetch_metrc_daily_summaries_to_rerun(session: Session, num_to_fetch: int) -> Tuple[List[RerunDailyJobInfoDict], errors.Error]:
	rows_to_fetch = num_to_fetch * 2

	summaries = session.query(models.MetrcDownloadSummary).filter(
		models.MetrcDownloadSummary.status == MetrcDownloadSummaryStatus.NEEDS_RETRY
	).limit(rows_to_fetch).all()

	# We only want to re-run metrc download summaries for
	# the unique combination of (license_number, date).
	unique_tuples = set([])
	for summary in summaries:
		unique_tuples.add((
			summary.date, str(summary.company_id)
		))
		if len(unique_tuples) >= num_to_fetch:
			# Weve reached all the re-runs that have been requested
			break

	rerun_daily_infos = []
	for tup in unique_tuples:
		cur_date = tup[0]
		company_id = tup[1]
		rerun_daily_infos.append(RerunDailyJobInfoDict(
			cur_date=cur_date,
			company_id=company_id
		))

	return rerun_daily_infos, None