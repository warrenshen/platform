import base64
import datetime
import logging
import os
from datetime import timedelta
from typing import Callable, Dict, List, Tuple, cast

import requests
from bespoke import errors
from bespoke.config.config_util import MetrcAuthProvider
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance import contract_util
from bespoke.metrc import transfers_util
from bespoke.metrc import metrc_common_util
from bespoke.metrc.metrc_common_util import AuthDict, CompanyInfo, LicenseAuthDict, UNKNOWN_STATUS_CODE
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

@errors.return_error_tuple
def upsert_api_key(
	api_key: str,
	company_settings_id: str,
	metrc_api_key_id: str,
	security_cfg: security_util.ConfigDict,
	session: Session
) -> Tuple[bool, errors.Error]:

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.id == company_settings_id
		).first())

	if not company_settings:
		raise errors.Error('No company settings found, so we could not save the Metrc API key')

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
		
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(
			security_cfg, api_key
		)
	else:
		# The "add" case
		metrc_api_key = models.MetrcApiKey()
		metrc_api_key.encrypted_api_key = security_util.encode_secret_string(
			security_cfg, api_key
		)
		metrc_api_key.company_id = company_settings.company_id
		session.add(metrc_api_key)
		session.flush()

		company_settings.metrc_api_key_id = metrc_api_key.id

	return True, None

@errors.return_error_tuple
def view_api_key(
	metrc_api_key_id: str,
	security_cfg: security_util.ConfigDict,
	session: Session
) -> Tuple[str, errors.Error]:
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

	return api_key, None

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
			# Skip companies who do not have contracts setup
			return None, errors.Error('Company {} has no contract, but has a metrc key'.format(company_id))

		cur_contract, err = contract_util.get_active_contract_by_company_id(
			company_id=company_id,
			session=session
		)
		if err:
			return None, err

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
		api_key = security_util.decode_secret_string(
			security_cfg, metrc_api_key.encrypted_api_key
		)

		us_state, err = cur_contract.get_us_state()
		if err:
			return None, err

		vendor_key, err = auth_provider.get_vendor_key_by_state(us_state)
		if err:
			return None, err

		license_auths = []
		facilities = metrc_common_util.get_facilities(AuthDict(
			vendor_key=vendor_key,
			user_key=api_key
		), us_state)

		for facility in facilities:
			license_number = facility['license_number']
			license_id = None
			if license_number in licenses_map:
				license_id = licenses_map[license_number]['id']
			else:
				logging.warn(f'Company "{company_name}" has license "{license_number}" in Metrc which is not stored in our Postgres DB')

			license_auths.append(LicenseAuthDict(
				license_id=license_id,
				license_number=license_number,
				us_state=us_state,
				vendor_key=vendor_key,
				user_key=api_key
			))

		return CompanyInfo(
			company_id=company_id,
			name=company_name,
			licenses=license_auths,
			metrc_api_key_id=str(metrc_api_key.id),
			apis_to_use=metrc_common_util.ApisToUseDict(
				sales_receipts=False,
				incoming_transfers=True,
				outgoing_transfers=True,
				lab_tests=True
			)
		), None

def _download_data(
	company_id: str,
	auth_provider: MetrcAuthProvider,
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	session_maker: Callable
) -> Tuple[DownloadDataRespDict, errors.Error]:
	# Return: success, all_errs, fatal_error

	company_info, err = _get_metrc_company_info(
			auth_provider,
			security_cfg,
			company_id=company_id,
			session_maker=session_maker
		)
	if err:
		return DownloadDataRespDict(
			success=False, 
			all_errs=[]
		), err

	errs = []

	functioning_licenses_count = 0 # How many licenses is the API key functioning for
	license_to_statuses = {}

	for license in company_info.licenses:
		api_key_has_err = False # Assume 1 API key per customer

		transfers_status_code = UNKNOWN_STATUS_CODE
		packages_status_code = UNKNOWN_STATUS_CODE
		lab_results_status_code = UNKNOWN_STATUS_CODE

		# Download transfers data for the particular day and key
		statuses, err = transfers_util.populate_transfers_table(
			cur_date=cur_date,
			company_info=company_info,
			license=license,
			session_maker=session_maker,
			debug=False,
		)
		if statuses:
			if statuses['transfers_api'] != UNKNOWN_STATUS_CODE:
				# Only overwrite the status if we actually got a status code
				transfers_status_code = statuses['transfers_api']

			if statuses['packages_api'] != UNKNOWN_STATUS_CODE:
				packages_status_code = statuses['packages_api']

			if statuses['lab_results_api'] != UNKNOWN_STATUS_CODE:
				lab_results_status_code = statuses['lab_results_api']

		if err:
			logging.error(f'Error thrown for company {company_info.name} for date {cur_date} and license {license["license_number"]}!')
			logging.error(f'Error: {err}')

			errs.append(err)
			api_key_has_err = True

		functioning_licenses_count += 1 if not api_key_has_err else 0
		license_to_statuses[license['license_number']] = {
			'api_key_has_err': api_key_has_err, # Record whether there was an error with the Metrc API for this license
			'transfers_api': transfers_status_code,
			'packages_api': packages_status_code,
			'lab_results_api': lab_results_status_code
		}

	# Update whether this metrc key worked
	with session_scope(session_maker) as session:

		metrc_api_key = cast(
			models.MetrcApiKey,
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.id == company_info.metrc_api_key_id
		).first())

		if metrc_api_key:
			metrc_api_key.is_functioning = functioning_licenses_count > 0 # Metrc API key is "functioning" if at least one license is functioning
			metrc_api_key.last_used_at = date_util.now()
			metrc_api_key.status_codes_payload = license_to_statuses

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
	security_cfg: security_util.ConfigDict,
	cur_date: datetime.date,
	session_maker: Callable
) -> Tuple[DownloadDataRespDict, errors.Error]:

	return _download_data(
		company_id=company_id,
		auth_provider=auth_provider,
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
