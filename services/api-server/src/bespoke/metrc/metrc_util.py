import base64
import datetime
import logging
import os
import traceback
from datetime import timedelta
from typing import Any, Callable, Dict, List, Tuple, cast

import requests
from bespoke import errors
from bespoke.config.config_util import MetrcAuthProvider
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util
from bespoke.metrc import (
	transfers_util, sales_util, 
	packages_util, plants_util, plant_batches_util, harvests_util
)
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import (
	AuthDict, CompanyInfo, CompanyStateInfoDict, LicenseAuthDict, 
	UNKNOWN_STATUS_CODE
)
from bespoke.security import security_util
from dateutil import parser
from dotenv import load_dotenv
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth
from sqlalchemy.orm.session import Session

DownloadDataRespDict = TypedDict('DownloadDataRespDict', {
	'success': bool,
	'all_errs': List[errors.Error]
})

ViewApiKeyRespDict = TypedDict('ViewApiKeyRespDict', {
	'api_key': str,
	'us_state': str
})

@errors.return_error_tuple
def delete_api_key(
	company_settings_id: str,
	metrc_api_key_id: str,
	session: Session
) -> Tuple[bool, errors.Error]:

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.id == company_settings_id
		).first())

	if not company_settings:
		raise errors.Error('No company settings found, so we could not save the Metrc API key')

	metrc_api_key = cast(
		models.MetrcApiKey,
		session.query(models.MetrcApiKey).filter(
			models.MetrcApiKey.id == metrc_api_key_id
		).first())
	if not metrc_api_key:
		raise errors.Error('Metrc API Key to delete does not exist in the database')
	
	if company_settings.metrc_api_key_id and str(company_settings.metrc_api_key_id) == metrc_api_key_id:
		company_settings.metrc_api_key_id = None

	session.flush()

	cast(Callable, session.delete)(metrc_api_key)

	return True, None

@errors.return_error_tuple
def set_key_as_default(
	company_settings_id: str,
	metrc_api_key_id: str,
	session: Session
) -> Tuple[bool, errors.Error]:

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.id == company_settings_id
		).first())

	if not company_settings:
		raise errors.Error('No company settings found, so we could not save the Metrc API key')

	company_settings.metrc_api_key_id = cast(Any, metrc_api_key_id)
	return True, None

@errors.return_error_tuple
def upsert_api_key(
	api_key: str,
	company_settings_id: str,
	metrc_api_key_id: str,
	security_cfg: security_util.ConfigDict,
	us_state: str,
	session: Session
) -> Tuple[str, errors.Error]:

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.id == company_settings_id
		).first())

	if not company_settings:
		raise errors.Error('No company settings found, so we could not save the Metrc API key')

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.company_settings_id == company_settings_id
		).first())

	if not company:
		raise errors.Error('No company found with the corresponding company settings provided')

	metrc_api_keys = cast(
		List[models.MetrcApiKey],
		session.query(models.MetrcApiKey).filter(
			models.MetrcApiKey.company_id == company.id
		).all())

	if not us_state:
		raise errors.Error('US state must be specified to create or update a metrc API key')

	if metrc_api_key_id:
		# The "edit" case
		if metrc_api_key_id != str(company_settings.metrc_api_key_id):
			raise errors.Error('Metrc API Key ID to update does not match the one from the company settings')

		metrc_api_key = cast(
			models.MetrcApiKey,
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.id == metrc_api_key_id
			).first())
		if not metrc_api_key:
			raise errors.Error('Previously existing Metrc API Key does not exist in the database')
		
		metrc_api_key.us_state = us_state
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(
			security_cfg, api_key
		)
		return str(metrc_api_key.id), None
	else:

		# The "add" case
		metrc_api_key = models.MetrcApiKey()
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(
			security_cfg, api_key
		)
		metrc_api_key.company_id = company_settings.company_id
		metrc_api_key.us_state = us_state
		session.add(metrc_api_key)
		session.flush()

		if not company_settings.metrc_api_key_id:
			# Only set this key as the default if it's the first key
			# we are adding for a customer
			company_settings.metrc_api_key_id = metrc_api_key.id

		return str(metrc_api_key.id), None

@errors.return_error_tuple
def view_api_key(
	metrc_api_key_id: str,
	security_cfg: security_util.ConfigDict,
	session: Session
) -> Tuple[ViewApiKeyRespDict, errors.Error]:
	metrc_api_key = cast(
		models.MetrcApiKey,
		session.query(models.MetrcApiKey).filter(
			models.MetrcApiKey.id == metrc_api_key_id
		).first())

	if not metrc_api_key:
		raise errors.Error('No metrc api key found, so we could not present the underlying key')

	api_key = security_util.decode_secret_string(
		security_cfg, metrc_api_key.encrypted_api_key
	)

	return ViewApiKeyRespDict(
		api_key=api_key,
		us_state=metrc_api_key.us_state
	), None

### Download logic

def get_companies_with_metrc_keys(session_maker: Callable) -> List[str]:
	company_ids_set = set([])

	with session_scope(session_maker) as session:
		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).all())
		for metrc_api_key in metrc_api_keys:
			company_ids_set.add(str(metrc_api_key.company_id))

	return list(company_ids_set)

def _get_metrc_company_info(
	auth_provider: MetrcAuthProvider,
	security_cfg: security_util.ConfigDict,
	facilities_fetcher: metrc_common_util.FacilitiesFetcherInterface,
	company_id: str,
	session_maker: Callable) -> Tuple[CompanyInfo, errors.Error]:

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

		if not company.contract_id:
			# Allow companies who do not have contracts setup as well
			pass
			
		company_setting = cast(
			models.CompanySettings,
			session.query(models.CompanySettings).filter(
				models.CompanySettings.id == company.company_settings_id
		).first())

		metrc_api_key_id = None
		if not company_setting.metrc_api_key_id:
			return None, errors.Error('No metrc key ID exists for company {}'.format(company_id))

		metrc_api_key_id = str(company_setting.metrc_api_key_id)

		metrc_api_key = cast(
			models.MetrcApiKey,
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.id == metrc_api_key_id
		).first())

		# Assume the current key set uses the customer's default state
		# in their contract.
		state_to_metrc_api_keys: Dict[str, List[models.MetrcApiKey]] = {}

		# Fetch additional metrc api keys for cross-state operators 
		other_metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.company_id == company_id
		).all())

		for other_metrc_api_key in other_metrc_api_keys:
	
			if not other_metrc_api_key.us_state:
				raise errors.Error('Metrc key {} is missing the us_state. It must be specified explicitly to download data from Metrc'.format(
					str(other_metrc_api_key.id)))

			cur_us_state = other_metrc_api_key.us_state
			
			if cur_us_state not in state_to_metrc_api_keys:
				state_to_metrc_api_keys[cur_us_state] = []
			state_to_metrc_api_keys[cur_us_state].append(other_metrc_api_key)

		all_licenses = cast(
			List[models.CompanyLicense],
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.company_id == company_id
			).filter(
				cast(Callable, models.CompanyLicense.is_deleted.isnot)(True)
		).all())

		licenses_map: Dict[str, models.CompanyLicenseDict] = {}
		us_states_set = set([])
		for license in all_licenses:
			licenses_map[license.license_number] = license.as_dict()
			if license.us_state:
				us_states_set.add(license.us_state)

		company_name = company.name
		use_unsaved_licenses = True # Can change to False for debugging, such as when a customer has many licenses
		state_to_company_infos: Dict[str, List[CompanyStateInfoDict]] = {}

		for us_state in us_states_set:
			vendor_key, err = auth_provider.get_vendor_key_by_state(us_state)
			if err:
				return None, err

			cur_metrc_api_keys = state_to_metrc_api_keys[us_state]
			for cur_metrc_api_key in cur_metrc_api_keys:
				api_key = security_util.decode_secret_string(
					security_cfg, cur_metrc_api_key.encrypted_api_key
				)

				facilities_arr = facilities_fetcher.get_facilities(AuthDict(
					vendor_key=vendor_key,
					user_key=api_key
				), us_state)

				license_auths = []

				for facility_info in facilities_arr:
					license_number = facility_info['License']['Number']
					license_id = None
					if license_number in licenses_map:
						license_id = licenses_map[license_number]['id']
					elif use_unsaved_licenses:
						logging.warn(f'Company "{company_name}" has license "{license_number}" in Metrc which is not stored in our Postgres DB')
					else:
						# If use_unsaved_licenses is false, then skip over this particular
						# license number
						continue

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
					apis_to_use=metrc_common_util.get_default_apis_to_use(),
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
	ctx: metrc_common_util.DownloadContext,
	session_maker: Callable) -> Tuple[Dict, errors.Error]:
	cur_date = ctx.cur_date
	license = ctx.license

	logging.info('Running download metrc data for company "{}" for last modified date {} with license {}'.format(
		ctx.company_details['name'], cur_date, license['license_number']
	))

	if ctx.apis_to_use.get('packages', False):
		package_models = packages_util.download_packages(ctx)
		packages_util.write_packages(package_models, session_maker)

	if ctx.apis_to_use.get('harvests', False):
		harvest_models = harvests_util.download_harvests(ctx)
		harvests_util.write_harvests(harvest_models, session_maker)

	if ctx.apis_to_use.get('plant_batches', False):
		plant_batches_models = plant_batches_util.download_plant_batches(ctx)
		plant_batches_util.write_plant_batches(plant_batches_models, session_maker)

	# NOTE: plants have references to plant batches and harvests, so this
	# must come after fetching plant_batches and harvests
	if ctx.apis_to_use.get('plants', False):
		plants_models = plants_util.download_plants(ctx)
		plants_util.write_plants(plants_models, session_maker)

	# NOTE: Sales data has references to packages, so this method
	# should run after download_packages
	if ctx.apis_to_use.get('sales_receipts', False):
		sales_receipts_models = sales_util.download_sales_info(ctx, session_maker)
		sales_util.write_sales_info(sales_receipts_models, session_maker)

	# NOTE: transfer must come after download_packages, because transfers
	# may update the state of packages
	# Download transfers data for the particular day and key
	success, err = transfers_util.populate_transfers_table(
		ctx=ctx,
		session_maker=session_maker
	)
	if err:
		logging.error(f'Error thrown for company {ctx.company_details["name"]} for date {cur_date} and license {license["license_number"]}!')
		logging.error(f'Error: {err}')
		return None, err

	return {
		'api_key_has_err': err is not None, # Record whether there was an error with the Metrc API for this license
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

def _download_data(
	company_id: str,
	auth_provider: MetrcAuthProvider,
	sendgrid_client: sendgrid_util.Client,
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	session_maker: Callable
) -> Tuple[DownloadDataRespDict, errors.Error]:
	# Return: success, all_errs, fatal_error
	facilities_fetcher = metrc_common_util.FacilitiesFetcher()

	company_info, err = _get_metrc_company_info(
		auth_provider,
		security_cfg,
		facilities_fetcher,
		company_id=company_id,
		session_maker=session_maker
	)
	if err:
		return DownloadDataRespDict(
			success=False,
			all_errs=[]
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
				
			for license in state_info['licenses']:
				ctx = metrc_common_util.DownloadContext(
					sendgrid_client, cur_date, company_details, 
					state_info['apis_to_use'], license, debug=False
				)
				api_status_dict = None
				err = None
				try:
					api_status_dict, err = _download_data_for_license(
						ctx, session_maker)
				except errors.Error as e1:
					err = e1
				except Exception as e:
					logging.error('SEVERE error, download data for metrc failed: {}'.format(e))
					logging.error(traceback.format_exc())
					err = errors.Error('{}'.format(e))

				if err:
					errs.append(err)

				if api_status_dict:
					license_to_statuses[license['license_number']] = api_status_dict

				functioning_licenses_count += 1 if not err else 0

			# Update whether this metrc key worked
			with session_scope(session_maker) as session:

				metrc_api_key = cast(
					models.MetrcApiKey,
					session.query(models.MetrcApiKey).filter(
						models.MetrcApiKey.id == state_info['metrc_api_key_id']
				).first())

				if metrc_api_key:
					metrc_api_key.is_functioning = functioning_licenses_count > 0 # Metrc API key is "functioning" if at least one license is functioning
					metrc_api_key.last_used_at = date_util.now()
					metrc_api_key.status_codes_payload = license_to_statuses
					metrc_api_key.facilities_payload = cast(Dict, state_info['facilities_payload'])

	if errs:
		return DownloadDataRespDict(
			success=False, 
			all_errs=errs
		), errors.Error('{}'.format(errs))

	return DownloadDataRespDict(
		success=True, all_errs=errs
	), None

@errors.return_error_tuple
def download_data_for_one_customer(
	company_id: str,
	auth_provider: MetrcAuthProvider,
	sendgrid_client: sendgrid_util.Client,
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	session_maker: Callable
) -> Tuple[DownloadDataRespDict, errors.Error]:

	return _download_data(
		company_id=company_id,
		auth_provider=auth_provider,
		sendgrid_client=sendgrid_client,
		security_cfg=security_cfg,
		cur_date=cur_date,
		session_maker=session_maker
	)

### End download logic

def main() -> None:
	load_dotenv(os.path.join(os.environ.get('SERVER_ROOT_DIR'), '.env'))

	user_key = os.environ.get('METRC_USER_KEY')
	vendor_key_CA = os.environ.get('METRC_VENDOR_KEY_CA')

	if not user_key or not vendor_key_CA:
		raise Exception('METRC_USER_KEY or METRC_VENDOR_KEY_CA not set')

	auth_dict = {'vendor_key': vendor_key_CA, 'user_key': user_key}

	#url = 'https://sandbox-api-ca.metrc.com/facilities/v1'
	base_url = 'https://api-ca.metrc.com'
	url = f'{base_url}/facilities/v1'
	#url = f'{base_url}/packages/v1/active?licenseNumber=123-ABC&lastModifiedStart=2018-01-17T06:30:00Z&lastModifiedEnd=2018-01-17T17:30:00Z'
	#url = 'https://api-ca.metrc.com/packages/v1/active?licenseNumber=C11-0000995-LIC&lastModifiedStart=2020-04-10&lastModifiedEnd=2020-04-20'
	#url = f'{base_url}/harvests/v1/waste/types'

	# json = json_data
	resp = requests.get(url, auth=HTTPBasicAuth(vendor_key_CA, user_key))
	if resp.status_code != 200:
		print('!ERROR')
		print(resp.content)
	else:
		print(resp.content)

if __name__ == '__main__':
	main()
