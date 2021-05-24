import base64
import os
from typing import Callable, Dict, List, Tuple, cast

import logging
import requests
from dateutil import parser
from dotenv import load_dotenv
from mypy_extensions import TypedDict
from requests.auth import HTTPBasicAuth
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.config.config_util import MetrcAuthProvider
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc import transfers_util
from bespoke.metrc.metrc_common_util import CompanyInfo, AuthDict, LicenseDict
from bespoke.security import security_util

@errors.return_error_tuple
def add_api_key(
	api_key: str, 
	company_settings_id: str, 
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

def _get_companies_with_metrc_keys(
	auth_provider: MetrcAuthProvider, 
	security_cfg: security_util.ConfigDict, 
	session_maker: Callable) -> List[CompanyInfo]:
	company_infos = []

	# Find all customers that have a metrc key 
	with session_scope(session_maker) as session:
		companies = cast(
			List[models.Company],
			session.query(models.Company).all())

		company_settings_ids = []
		company_id_to_name = {}
		for company in companies:
			if not company.company_settings_id:
				continue
			company_settings_ids.append(str(company.company_settings_id))
			company_id_to_name[str(company.id)] = company.name

		company_settings = cast(
			List[models.CompanySettings],
			session.query(models.CompanySettings).filter(
				models.CompanySettings.id.in_(company_settings_ids)
		).all())

		metrc_api_key_ids = []
		for company_setting in company_settings:
			if not company_setting.metrc_api_key_id:
				continue

			metrc_api_key_ids.append(str(company_setting.metrc_api_key_id))

		metrc_api_keys = cast(
			List[models.MetrcApiKey],
			session.query(models.MetrcApiKey).filter(
				models.MetrcApiKey.id.in_(metrc_api_key_ids)
		).all())


		company_ids_with_metrc_keys = set([])
		for metrc_api_key in metrc_api_keys:
			company_id = str(metrc_api_key.company_id)
			company_ids_with_metrc_keys.add(company_id)

		all_licenses = cast(
			List[models.CompanyLicense],
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.company_id.in_(company_ids_with_metrc_keys)
			).filter(
   					cast(Callable, models.CompanyLicense.is_deleted.isnot)(True)
    	).all())

		company_id_to_licenses: Dict[str, List[LicenseDict]] = {}
		for license in all_licenses:
			company_id = str(license.company_id)
			if company_id not in company_id_to_licenses:
				company_id_to_licenses[company_id] = []

			company_id_to_licenses[company_id].append(LicenseDict(
				license_id=str(license.id),
				license_number=license.license_number
			))

		for metrc_api_key in metrc_api_keys:
			company_id = str(metrc_api_key.company_id)
			company_name = company_id_to_name[company_id]
			api_key = security_util.decode_secret_string(
				security_cfg, metrc_api_key.encrypted_api_key
			)

			if company_id not in company_id_to_licenses:
				logging.warn('Company ID {}, Name: "{}" has no licenses saved in the DB, skipping...'.format(
										 company_id, company_id_to_name[company_id]))
				continue

			logging.info('Company name: {} has metrc key {}'.format(company_name, api_key))
			company_infos.append(CompanyInfo(
				company_id=company_id,
				name=company_name,
				us_state='CA', # TODO(dlluncor): save the us state associated with the key
				licenses=company_id_to_licenses[company_id],
				auth_dict=AuthDict(
					vendor_key=api_key,
					user_key=auth_provider.get_user_key()
				)
			))

	return company_infos

@errors.return_error_tuple
def download_data_for_all_customers(
	auth_provider: MetrcAuthProvider, 
	security_cfg: security_util.ConfigDict, 
	session_maker: Callable
) -> Tuple[bool, errors.Error]:
	
	company_infos = _get_companies_with_metrc_keys(
		auth_provider, security_cfg, session_maker)

	errs = []
	cur_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	for company_info in company_infos:

		with session_scope(session_maker) as session:

				# Download transfers data for the particular day
				_, err = transfers_util.populate_transfers_table(
					cur_date=cur_date,
					company_info=company_info,
					session=session
				)
				if err:
					session.rollback()
					errs.append(err)

	# TODO(dlluncor): Handle errs
	return None, None

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
