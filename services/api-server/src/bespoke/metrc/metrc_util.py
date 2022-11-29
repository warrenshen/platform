import concurrent
import datetime
import logging
import time
import traceback
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.async_jobs import async_jobs_util
from bespoke.config.config_util import MetrcAuthProvider, MetrcWorkerConfig
from bespoke.date import date_util
from bespoke.db import models, queries
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.metrc import (
	transfers_util, sales_util, 
	packages_util, plants_util, plant_batches_util, harvests_util
)
from bespoke.metrc.common import metrc_common_util, metrc_download_summary_util
from bespoke.metrc.common.metrc_error_util import (
	BESPOKE_INTERNAL_ERROR_STATUS_CODE
)
from bespoke.metrc.common.metrc_common_util import (
	AuthDict, CompanyInfo, CompanyStateInfoDict, LicenseAuthDict, 
	MetrcErrorDetailsDict
)
from bespoke.security import security_util
from mypy_extensions import TypedDict
from server.config import Config
from sqlalchemy.orm.session import Session

DownloadDataRespDict = TypedDict('DownloadDataRespDict', {
	'success': bool,
	'nonblocking_download_errors': List[errors.Error],
})

DownloadDataForMetrcApiKeyForDateRespDict = TypedDict('DownloadDataForMetrcApiKeyForDateRespDict', {
	'success': bool,
	'nonblocking_download_errors': List[errors.Error],
})

DownloadDataForMetrcApiKeyInDateRangeRespDict = TypedDict('DownloadDataForMetrcApiKeyInDateRangeRespDict', {
	'success': bool,
	'nonblocking_download_errors': List[errors.Error],
})

def get_companies_with_metrc_keys(session_maker: Callable) -> List[str]:
	company_ids_set = set([])

	with session_scope(session_maker) as session:
		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).all())
		for metrc_api_key in metrc_api_keys:
			if metrc_api_key.is_deleted:
				continue
			company_ids_set.add(str(metrc_api_key.company_id))

	return list(company_ids_set)

def _get_metrc_company_info(
	session_maker: Callable,
	auth_provider: MetrcAuthProvider,
	security_cfg: security_util.ConfigDict,
	facilities_fetcher: metrc_common_util.FacilitiesFetcherInterface,
	company_id: str,
) -> Tuple[CompanyInfo, errors.Error]:
	with session_scope(session_maker) as session:
		company = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.id == company_id
			).first())
		if not company:
			return None, errors.Error('Company {} not found'.format(company_id))

		if not company.company_settings_id:
			return None, errors.Error('Company {} has no settings, but has a metrc key'.format(company_id))
			
		# Assume the current key set uses the customer's default state
		# in their contract.
		state_to_metrc_api_keys: Dict[str, List[models.MetrcApiKey]] = {}

		# Fetch additional metrc api keys for cross-state operators 
		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.company_id == company_id
			).filter(
				cast(Callable, models.MetrcApiKey.is_deleted.isnot)(True)
			).all())
		
		for metrc_api_key in metrc_api_keys:
			if not metrc_api_key.us_state:
				raise errors.Error('Metrc key {} is missing the us_state. It must be specified explicitly to download data from Metrc'.format(
					str(metrc_api_key.id)))

			cur_us_state = metrc_api_key.us_state
			
			if cur_us_state not in state_to_metrc_api_keys:
				state_to_metrc_api_keys[cur_us_state] = []

			state_to_metrc_api_keys[cur_us_state].append(metrc_api_key)

		all_licenses = cast(
			List[models.CompanyLicense],
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.company_id == company_id
			).filter(
				cast(Callable, models.CompanyLicense.is_deleted.isnot)(True)
		).all())

		licenses_map: Dict[str, models.CompanyLicenseDict] = {}
		for license in all_licenses:
			licenses_map[license.license_number] = license.as_dict()

		company_name = company.name
		state_to_company_infos: Dict[str, List[CompanyStateInfoDict]] = {}

		for us_state in state_to_metrc_api_keys.keys():
			vendor_key, err = auth_provider.get_vendor_key_by_state(us_state)
			if err:
				return None, err

			cur_metrc_api_keys = state_to_metrc_api_keys[us_state]
			for cur_metrc_api_key in cur_metrc_api_keys:
				api_key = security_util.decode_secret_string(
					security_cfg, cur_metrc_api_key.encrypted_api_key
				)

				facilities_arr, err = facilities_fetcher.get_facilities(AuthDict(
					vendor_key=vendor_key,
					user_key=api_key
				), us_state)

				if err:
					# Mark this Metrc API key as not functioning.
					cur_metrc_api_key.is_functioning = False
					logging.error('/facilities/v1 endpoint failed for api_key {}. Reason: {}'.format(
						str(cur_metrc_api_key.id), err))
					continue

				license_auths = []
				use_saved_licenses_only = cur_metrc_api_key.use_saved_licenses_only # Can change to False for debugging, such as when a customer has many licenses

				for facility_info in facilities_arr:
					license_number = facility_info['License']['Number']
					license_id = None
					if license_number in licenses_map:
						license_id = licenses_map[license_number]['id']
					elif use_saved_licenses_only:
						# If use_saved_licenses_only is true, then skip over this particular
						# license number
						continue
					else:
						logging.warn(f'Company "{company_name}" has license "{license_number}" in Metrc which is not stored in our Postgres DB')

					license_auths.append(LicenseAuthDict(
						license_id=license_id,
						license_number=license_number,
						us_state=us_state,
						vendor_key=vendor_key,
						user_key=api_key
					))

				company_state_info = CompanyStateInfoDict(
					licenses=license_auths,
					metrc_api_key_id=str(cur_metrc_api_key.id),
					facilities_payload=metrc_common_util.FacilitiesPayloadDict(
						facilities=facilities_arr 
					)
				)
				if us_state not in state_to_company_infos:
					state_to_company_infos[us_state] = []
				state_to_company_infos[us_state].append(company_state_info)
			
		return CompanyInfo(
			company_id=company_id,
			name=company_name,
			state_to_company_infos=state_to_company_infos
		), None

def _download_data_for_license(
	session_maker: Callable,
	ctx: metrc_common_util.DownloadContext,
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

	if ctx.get_adjusted_apis_to_use().get('packages', False):
		try:
			package_models = packages_util.download_packages(ctx, session_maker)
			packages_util.write_packages(package_models, session_maker)
		except Exception as e:
			_catch_exception(e, '/packages')

	if ctx.get_adjusted_apis_to_use().get('harvests', False):
		try:
			harvest_models = harvests_util.download_harvests(ctx, session_maker)
			harvests_util.write_harvests(harvest_models, session_maker)
		except Exception as e:
			_catch_exception(e, '/harvests')

	if ctx.get_adjusted_apis_to_use().get('plant_batches', False):
		try:
			plant_batches_models = plant_batches_util.download_plant_batches(ctx, session_maker)
			plant_batches_util.write_plant_batches(plant_batches_models, session_maker)
		except Exception as e:
			_catch_exception(e, '/plantbatches')

	# NOTE: plants have references to plant batches and harvests, so this
	# must come after fetching plant_batches and harvests
	if ctx.get_adjusted_apis_to_use().get('plants', False):
		try:
			plants_models = plants_util.download_plants(ctx, session_maker)
			plants_util.write_plants(plants_models, session_maker)
		except Exception as e:
			_catch_exception(e, '/plants')

	# NOTE: Sales data has references to packages, so this method
	# should run after download_packages
	if ctx.get_adjusted_apis_to_use().get('sales_receipts', False):
		try:
			sales_receipts_models = sales_util.download_sales_info(ctx, session_maker)
			sales_util.write_sales_info(sales_receipts_models, ctx, session_maker)
		except Exception as e:
			_catch_exception(e, '/sales')

	if ctx.get_adjusted_apis_to_use().get('transfers', False):
		# NOTE: transfer must come after download_packages, because transfers
		# may update the state of packages
		# Download transfers data for the particular day and key
		err = None
		try:
			success, err = transfers_util.populate_transfers_table(
				ctx=ctx,
				session_maker=session_maker
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

def _download_and_summarize_data_for_license(
	session_maker: Callable,
	ctx: metrc_common_util.DownloadContext,
	metrc_api_key_id: str,
) -> Tuple[Optional[Dict], errors.Error]:
	cur_date = ctx.cur_date

	api_status_dict = None
	err = None

	try:
		before = time.time()
		api_status_dict, err = _download_data_for_license(
			session_maker=session_maker,
			ctx=ctx,
		)
		after = time.time()
		logging.info('Took {:.2f} seconds to download data for day {} license {}'.format(
			after - before, cur_date, ctx.license['license_number']))
	except errors.Error as e1:
		err = e1
	except Exception as e:
		logging.error('SEVERE error, download data for metrc failed: {}'.format(e))
		logging.error(traceback.format_exc())
		err = errors.Error('{}'.format(e))

	with session_scope(session_maker) as session:
		metrc_download_summary_util.write_metrc_download_summary(
			session=session,
			license_number=ctx.license['license_number'],
			cur_date=cur_date,
			# Note: we provide a license permissions dict with everything enabled.
			# This is because in the deprecated way of doing things, the download logic will
			# test every single endpoint, regardless of whether we have access to it or not.
			license_permissions_dict=metrc_common_util.LicensePermissionsDict(
				license_number=ctx.license['license_number'],
				is_harvests_enabled=True,
				is_packages_enabled=True,
				is_plant_batches_enabled=True,
				is_plants_enabled=True,
				is_sales_receipts_enabled=True,
				is_transfers_enabled=True,
			),
			retry_errors=ctx.get_retry_errors(),
			company_id=ctx.company_details['company_id'],
			metrc_api_key_id=metrc_api_key_id,
		)

	return api_status_dict, err

def _download_data(
	session_maker: Callable,
	company_id: str,
	auth_provider: MetrcAuthProvider,
	worker_cfg: MetrcWorkerConfig,
	sendgrid_client: sendgrid_util.Client,
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	apis_to_use: Optional[metrc_common_util.ApisToUseDict],
) -> Tuple[DownloadDataRespDict, errors.Error]:
	company_info, err = _get_metrc_company_info(
		session_maker=session_maker,
		auth_provider=auth_provider,
		security_cfg=security_cfg,
		facilities_fetcher=metrc_common_util.FacilitiesFetcher(),
		company_id=company_id,
	)
	if err:
		return DownloadDataRespDict(
			success=False,
			nonblocking_download_errors=[],
		), err

	errs = []
	company_details = metrc_common_util.CompanyDetailsDict(
		company_id=company_info.company_id,
		name=company_info.name
	)

	for us_state in company_info.get_us_states():
		# Each state may have multiple Metrc API keys.
		state_infos = company_info.get_company_state_infos(us_state)

		for state_info in state_infos:
			# How many licenses is the API key functioning for?
			functioning_licenses_count = 0
			license_to_statuses = {}
				
			with ThreadPoolExecutor(max_workers=worker_cfg.num_parallel_licenses) as executor:
				future_to_ctx = {}
				for license in state_info['licenses']:
					ctx = metrc_common_util.DownloadContext(
						sendgrid_client,
						worker_cfg,
						cur_date,
						company_details,
						apis_to_use,
						license,
						debug=False,
					)

					future_to_ctx[
						executor.submit(
							_download_and_summarize_data_for_license,
							session_maker=session_maker,
							ctx=ctx,
							metrc_api_key_id=state_info['metrc_api_key_id'],
						)
					] = ctx

				for future in concurrent.futures.as_completed(future_to_ctx):
					ctx = future_to_ctx[future]
					api_status_dict, err = future.result()
					if err:
						errs.append(err)

					if api_status_dict:
						license_to_statuses[ctx.license['license_number']] = api_status_dict

					functioning_licenses_count += 1 if not err else 0

			with session_scope(session_maker) as session:
				metrc_api_key = cast(
					models.MetrcApiKey,
					session.query(models.MetrcApiKey).filter(
						models.MetrcApiKey.id == state_info['metrc_api_key_id']
				).first())

				# Mark this Metrc API key as functioning.
				if metrc_api_key:
					metrc_api_key.is_functioning = True
					metrc_api_key.last_used_at = date_util.now()
					metrc_api_key.status_codes_payload = license_to_statuses
					metrc_api_key.facilities_payload = cast(Dict, state_info['facilities_payload'])

	if errs:
		return DownloadDataRespDict(
			success=False,
			nonblocking_download_errors=errs,
		), errors.Error('{}'.format(errs))

	return DownloadDataRespDict(
		success=True,
		nonblocking_download_errors=errs,
	), None

@errors.return_error_tuple
def download_data_for_one_customer(
	session_maker: Callable,
	company_id: str,
	auth_provider: MetrcAuthProvider,
	worker_cfg: MetrcWorkerConfig,
	sendgrid_client: sendgrid_util.Client,
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	apis_to_use: Optional[metrc_common_util.ApisToUseDict],
) -> Tuple[DownloadDataRespDict, errors.Error]:
	return _download_data(
		company_id=company_id,
		auth_provider=auth_provider,
		worker_cfg=worker_cfg,
		sendgrid_client=sendgrid_client,
		security_cfg=security_cfg,
		cur_date=cur_date,
		apis_to_use=apis_to_use,
		session_maker=session_maker,
	)

@errors.return_error_tuple
def refresh_metrc_api_key_permissions(
	session: Session,
	config: Config,
	metrc_api_key_id: str,
	submitted_by_user_id: str,
) -> Tuple[bool, errors.Error]:
	metrc_api_key, err = queries.get_metrc_api_key_by_id(
		session=session,
		metrc_api_key_id=metrc_api_key_id,
	)

	if err:
		return False, errors.Error('Metrc API key does not exist')

	metrc_api_key_dict = metrc_api_key.as_dict()
	security_cfg = config.get_security_config()

	metrc_api_key_data_fetcher = metrc_common_util.MetrcApiKeyDataFetcher(
		metrc_api_key_dict=metrc_api_key_dict,
		security_cfg=security_cfg,
	)

	metrc_api_key_permissions = metrc_api_key_data_fetcher.get_metrc_api_key_permissions()

	if not metrc_api_key_data_fetcher.facilities_json:
		metrc_api_key.is_functioning = False
		metrc_api_key.permissions_refreshed_at = date_util.now()
		metrc_api_key.permissions_payload = None
		return True, None

	metrc_api_key.is_functioning = True
	metrc_api_key.permissions_refreshed_at = date_util.now()
	metrc_api_key.permissions_payload = metrc_api_key_permissions

	success, err = async_jobs_util.generate_download_data_for_metrc_api_key_license_jobs_by_metrc_api_key_permissions(
		session=session,
		cfg=config,
		submitted_by_user_id=submitted_by_user_id,
		metrc_api_key_id=metrc_api_key_dict['id'],
		metrc_api_key_permissions=metrc_api_key_permissions,
	)

	if err:
		return False, err

	return True, None
