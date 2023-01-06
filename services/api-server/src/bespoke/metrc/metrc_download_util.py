import datetime
import logging
import time
import traceback
from typing import Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.async_jobs import async_jobs_util
from bespoke.config.config_util import MetrcWorkerConfig
from bespoke.date import date_util
from bespoke.db import queries
from bespoke.metrc import (
	transfers_util, sales_util, 
	packages_util, plants_util, plant_batches_util, harvests_util
)
from bespoke.metrc.common import metrc_common_util, metrc_download_summary_util
from bespoke.metrc.common.metrc_error_util import (
	BESPOKE_INTERNAL_ERROR_STATUS_CODE
)
from bespoke.metrc.common.metrc_common_util import (
	MetrcErrorDetailsDict
)
from mypy_extensions import TypedDict
from server.config import Config
from sqlalchemy.orm.session import Session

DownloadDataForMetrcApiKeyForDateRespDict = TypedDict('DownloadDataForMetrcApiKeyForDateRespDict', {
	'success': bool,
	'is_previously_successful': bool,
	'nonblocking_download_errors': List[errors.Error],
})

DownloadDataForMetrcApiKeyInDateRangeRespDict = TypedDict('DownloadDataForMetrcApiKeyInDateRangeRespDict', {
	'success': bool,
	'nonblocking_download_errors': List[errors.Error],
})

def _download_data_for_ctx(
	session: Session,
	ctx: metrc_common_util.DownloadContext,
	license_permissions_dict: metrc_common_util.LicensePermissionsDict,
) -> Tuple[Dict, errors.Error]:
	cur_date = ctx.cur_date
	license = ctx.license
	license_number = license['license_number']
	company_name = ctx.company_details['name']

	logging.info(f'Downloading Metrc data for license {license_number} for last modified date {cur_date}')
	cur_date_str = ctx.get_cur_date_str()

	def _catch_exception(e: Exception, path: str) -> None:
		ctx.error_catcher.add_retry_error(
			path=path,
			time_range=[cur_date_str],
			err_details=MetrcErrorDetailsDict(
				reason='Unexpected exception downloading or writing {}. Err: {}'.format(path, e),
				status_code=BESPOKE_INTERNAL_ERROR_STATUS_CODE,
				traceback='{}'.format(traceback.format_exc())
			)
		)
		logging.error('EXCEPTION downloading {} for company {} on {}'.format(path, company_name, cur_date))
		logging.error(traceback.format_exc())

	if license_permissions_dict['is_packages_enabled'] and ctx.get_adjusted_apis_to_use().get('packages', False):
		try:
			package_models = packages_util.download_packages_with_session(session=session, ctx=ctx)
			packages_util.write_packages_with_session(session=session, package_models=package_models)
		except Exception as e:
			_catch_exception(e, '/packages')

	if license_permissions_dict['is_harvests_enabled'] and ctx.get_adjusted_apis_to_use().get('harvests', False):
		try:
			harvest_models = harvests_util.download_harvests_with_session(session=session, ctx=ctx)
			harvests_util.write_harvests_with_session(session=session, harvest_models=harvest_models)
		except Exception as e:
			_catch_exception(e, '/harvests')

	if license_permissions_dict['is_plant_batches_enabled'] and ctx.get_adjusted_apis_to_use().get('plant_batches', False):
		try:
			plant_batches_models = plant_batches_util.download_plant_batches_with_session(session=session, ctx=ctx)
			plant_batches_util.write_plant_batches_with_session(
                session=session,
                plant_batches_models=plant_batches_models,
            )
		except Exception as e:
			_catch_exception(e, '/plantbatches')

	# NOTE: plants have references to plant batches and harvests, so this
	# must come after fetching plant_batches and harvests
	if license_permissions_dict['is_plants_enabled'] and ctx.get_adjusted_apis_to_use().get('plants', False):
		try:
			plants_models = plants_util.download_plants_with_session(session=session, ctx=ctx)
			plants_util.write_plants_with_session(session=session, plants_models=plants_models)
		except Exception as e:
			_catch_exception(e, '/plants')

	# NOTE: Sales data has references to packages, so this method
	# should run after download_packages
	if license_permissions_dict['is_sales_receipts_enabled'] and ctx.get_adjusted_apis_to_use().get('sales_receipts', False):
		try:
			sales_receipts_tuple = sales_util.download_sales_info_with_session(
                session=session,
                ctx=ctx,
            )
			sales_util.write_sales_info_with_session(
                session=session,
                ctx=ctx,
                sales_receipts_tuple=sales_receipts_tuple,
            )
		except Exception as e:
			_catch_exception(e, '/sales')

	if license_permissions_dict['is_transfers_enabled'] and ctx.get_adjusted_apis_to_use().get('transfers', False):
		# NOTE: transfer must come after download_packages, because transfers
		# may update the state of packages
		# Download transfers data for the particular day and key
		err = None
		try:
			success, err = transfers_util.populate_transfers_table_with_session(
				session=session,
				ctx=ctx,
			)
		except Exception as e:
			_catch_exception(e, '/transfers')

		if err:
			logging.error(f'Error thrown for license {license_number} for last modified date {cur_date}!')
			logging.error(f'Error: {err}')

	return {
		'transfers_api': ctx.request_status['transfers_api'],
		'transfer_packages_api': ctx.request_status['transfer_packages_api'],
		'transfer_packages_wholesale_api': ctx.request_status['transfer_packages_wholesale_api'],
		'packages_api': ctx.request_status['packages_api'],
		'plants_api': ctx.request_status['plants_api'],
		'plant_batches_api': ctx.request_status['plant_batches_api'],
		'harvests_api': ctx.request_status['harvests_api'],
		'lab_results_api': ctx.request_status['lab_results_api'],
		'sales_receipts_api': ctx.request_status['receipts_api'],
		'sales_transactions_api': ctx.request_status['sales_transactions_api']
	}, None

def _download_data_for_metrc_api_key_license_for_date(
	session: Session,
	worker_cfg: MetrcWorkerConfig,
	apis_to_use: Optional[metrc_common_util.ApisToUseDict],
	metrc_api_key_data_fetcher: metrc_common_util.MetrcApiKeyDataFetcher,
	date: datetime.date,
	is_retry_failures: bool,
) -> Tuple[DownloadDataForMetrcApiKeyForDateRespDict, errors.Error]:
	all_nonblocking_download_errors: List[errors.Error] = []

	license_number = metrc_api_key_data_fetcher.get_target_license_number()
	license_permissions_dict = metrc_api_key_data_fetcher.get_target_license_permissions_dict()

	company_id = metrc_api_key_data_fetcher.metrc_api_key_dict['company_id'] # Default is the company ID of the Metrc API key.
	company_name = 'Unknown (Please Configure License)'

	company_license, err = queries.get_company_license_by_license_number(
		session=session,
		license_number=license_number,
	)
	if company_license and company_license.company_id:
		company, err = queries.get_company_by_id(
			session=session,
			company_id=str(company_license.company_id),
		)
		if company:
			company_id = str(company.id)
			company_name = company.name

	# Note: company ID and company name may not be equal to the company that the
	# Metrc API key is associated with (metrc_api_keys.company_id). This is intentional,
	# as a Metrc API key may have access to a license that belongs to a different company.
	company_details = metrc_common_util.CompanyDetailsDict(
		company_id=company_id,
		name=company_name,
	)
	ctx = metrc_common_util.DownloadContext(
		sendgrid_client=None,
		worker_cfg=worker_cfg,
		cur_date=date,
		company_details=company_details,
		apis_to_use=apis_to_use,
		license_auth=metrc_common_util.LicenseAuthDict(
			license_number=license_number,
			us_state=metrc_api_key_data_fetcher.metrc_api_key_dict['us_state'],
			vendor_key=metrc_api_key_data_fetcher.auth_dict['vendor_key'],
			user_key=metrc_api_key_data_fetcher.auth_dict['user_key'],
		),
		debug=False,
	)

	today = date_util.now_as_date()
	if date >= today:
		return DownloadDataForMetrcApiKeyForDateRespDict(
			success=False,
			is_previously_successful=False, # It is not possible for a previous download to be successful.
			nonblocking_download_errors=all_nonblocking_download_errors
		), errors.Error('Date is today or in the future, which is invalid')


	is_previously_successful = metrc_download_summary_util.is_metrc_download_summary_previously_successful(
		session=session,
		license_number=license_number,
		date=date,
		new_license_permissions_dict=license_permissions_dict,
		is_retry_failures=is_retry_failures,
	)
	if is_previously_successful:
		logging.info(f'Download data for license number {license_number} and date {date} was previously successful')
		return DownloadDataForMetrcApiKeyForDateRespDict(
			success=True,
			is_previously_successful=True,
			nonblocking_download_errors=all_nonblocking_download_errors,
		), None

	logging.info(f'Downloading data for license number {license_number} and date {date}...')

	api_status_dict = None
	err = None

	try:
		before = time.time()
		api_status_dict, err = _download_data_for_ctx(
			session=session,
			ctx=ctx,
			license_permissions_dict=license_permissions_dict,
		)
		after = time.time()
		logging.info('Took {:.2f} seconds to download data for day {} license {}'.format(
			after - before, date, ctx.license['license_number']))
	except errors.Error as e1:
		err = e1
	except Exception as e:
		logging.error('SEVERE error, download data for metrc failed: {}'.format(e))
		logging.error(traceback.format_exc())
		err = errors.Error('{}'.format(e))

	metrc_download_summary_util.write_metrc_download_summary(
		session=session,
		license_number=license_number,
		cur_date=date,
		license_permissions_dict=license_permissions_dict,
		retry_errors=ctx.get_retry_errors(),
		company_id=ctx.company_details['company_id'],
		metrc_api_key_id=metrc_api_key_data_fetcher.get_metrc_api_key_id(),
	)

	return DownloadDataForMetrcApiKeyForDateRespDict(
		success=True,
		is_previously_successful=False,
		nonblocking_download_errors=all_nonblocking_download_errors,
	), None

# Download data for key for date range
# 1. Check the licenses key has access to
# 2. Check the permissions the key has access to for each license
# 3. Save the results from 1 and 2
# 4. For each license and each date in date range
#   a. If download was previously done for license and date with greater than
#      or equal to permissions vs current permissions, skip download
#   b. Otherwise, run download for license and date
#
# is_async_job: whether invocation is within an async job
# is_retry_failures: whether or not download retries Metrc download summaries marked as failures
@errors.return_error_tuple
def download_data_for_metrc_api_key_license_in_date_range(
	session: Session,
	config: Config,
	apis_to_use: Optional[metrc_common_util.ApisToUseDict],
	metrc_api_key_id: str,
	license_number: str,
	start_date: datetime.date,
	end_date: datetime.date,
	is_async_job: bool = False,
	is_retry_failures: bool = False,
) -> Tuple[DownloadDataForMetrcApiKeyInDateRangeRespDict, errors.Error]:
	metrc_api_key, err = queries.get_metrc_api_key_by_id(
		session=session,
		metrc_api_key_id=metrc_api_key_id,
	)
	if err:
		return DownloadDataForMetrcApiKeyInDateRangeRespDict(
			success=True,
			nonblocking_download_errors=[errors.Error('Metrc API key does not exist')],
		), err

	metrc_api_key_dict = metrc_api_key.as_dict()
	worker_cfg = config.get_metrc_worker_config()
	security_cfg = config.get_security_config()

	metrc_api_key_data_fetcher = metrc_common_util.MetrcApiKeyDataFetcher(
		metrc_api_key_dict=metrc_api_key_dict,
		security_cfg=security_cfg,
		target_license_number=license_number,
	)

	facilities_json = metrc_api_key_data_fetcher.get_facilities()
	if facilities_json:
		metrc_api_key.is_functioning = True
		metrc_api_key.last_used_at = date_util.now()
		metrc_api_key.facilities_payload = cast(Dict, metrc_api_key_data_fetcher.facilities_json)
		session.commit()
	else:
		metrc_api_key.is_functioning = False
		metrc_api_key.facilities_payload = None
		metrc_api_key.permissions_payload = None
		session.commit()

		# Short circuit return since the Metrc API key is not working.
		return DownloadDataForMetrcApiKeyInDateRangeRespDict(
			success=True,
			nonblocking_download_errors=[errors.Error('Metrc API key is not valid')],
		), None

	all_nonblocking_download_errors: List[errors.Error] = []
	not_previously_successful_count = 0

	cur_date = start_date
	while cur_date <= end_date:
		current_date_response, err = _download_data_for_metrc_api_key_license_for_date(
			session=session,
			worker_cfg=worker_cfg,
			apis_to_use=apis_to_use,
			metrc_api_key_data_fetcher=metrc_api_key_data_fetcher,
			date=cur_date,
			is_retry_failures=is_retry_failures,
		)

		if not current_date_response['success']:
			return DownloadDataForMetrcApiKeyInDateRangeRespDict(
				success=False,
				nonblocking_download_errors=all_nonblocking_download_errors,
			), errors.Error('{}'.format(err))
		else:
			is_previously_successful = current_date_response['is_previously_successful']
			if not is_previously_successful:
				not_previously_successful_count += 1
			nonblocking_download_errors = current_date_response['nonblocking_download_errors']

		cur_date = cur_date + datetime.timedelta(days=1)

		if is_async_job:
			# We limit the number of days actual data is downloaded to five days
			# and schedule another async job to pick up where this job left off.
			# This is because async jobs have a duration limit.
			if not_previously_successful_count >= 5:
				success, err = async_jobs_util.generate_download_data_for_metrc_api_key_license_job_by_license_number(
					session=session,
					cfg=config,
					metrc_api_key_id=metrc_api_key_dict['id'],
					license_number=license_number,
				)
				if err:
					return DownloadDataForMetrcApiKeyInDateRangeRespDict(
						success=False,
						nonblocking_download_errors=all_nonblocking_download_errors,
					), err
				break

	return DownloadDataForMetrcApiKeyInDateRangeRespDict(
		success=True,
		nonblocking_download_errors=all_nonblocking_download_errors,
	), None
