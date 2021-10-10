import datetime
import decimal
import json
import uuid
import requests
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke import errors

from bespoke.config.config_util import MetrcAuthProvider
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import (ProductType)
from bespoke.db.models import session_scope
from bespoke.metrc import metrc_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import (
	AuthDict, LicenseAuthDict, CompanyStateInfoDict, CompanyInfo, 
	FacilityInfoDict, FacilityLicenseDict
)
from bespoke.security import security_util

from bespoke_test.contract import contract_test_helper
from bespoke_test.contract.contract_test_helper import ContractInputDict
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _get_contract(company_id: str, product_type: str, us_state: str) -> models.Contract:
	return models.Contract(
		company_id=company_id,
		product_type=product_type,
		product_config=contract_test_helper.create_contract_config(
			product_type=product_type,
			input_dict=ContractInputDict(
				interest_rate=0.03,
				maximum_principal_amount=120000.01,
				max_days_until_repayment=0, # unused
				late_fee_structure=json.dumps({
					'1-14': 0.25,
					'15-29': 0.50,
					'30+': 1.0
					},
				),
				us_state=us_state
			)
		),
		start_date=date_util.load_date_str('1/1/2020'),
		adjusted_end_date=date_util.load_date_str('12/1/2020')
	)

class FakeFacilitiesFetcher(metrc_common_util.FacilitiesFetcherInterface):

	def __init__(self, 
		state_to_facilities: Dict[str, List[FacilityInfoDict]],
		state_to_errs: Dict[str, errors.Error]) -> None:
		self._state_to_facilities = state_to_facilities
		self._state_to_errs = state_to_errs

	def get_facilities(self, auth_dict: AuthDict, us_state: str) -> Tuple[List[FacilityInfoDict], errors.Error]:
		if us_state in self._state_to_errs:
			return None, self._state_to_errs[us_state]

		return self._state_to_facilities[us_state], None

class TestDeleteKey(db_unittest.TestCase):

	def setUp(self) -> None:
		self.security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY='url-secret-key1234',
			URL_SALT='url-salt1234',
			BESPOKE_DOMAIN='https://app.bespokefinancial.com'
		)

	def test_delete_last_remaining_key(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_util.view_api_key(
				metrc_api_key_id,
				security_cfg=self.security_cfg,
				session=session
			)
			self.assertIsNone(err)
			self.assertEqual('the-api-key', view_resp['api_key'])
			self.assertEqual('CA', view_resp['us_state'])

		with session_scope(self.session_maker) as session:
			success, err = metrc_util.delete_api_key(
				company_settings_id, 
				metrc_api_key_id,
				session=session
			)
			self.assertTrue(success)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_util.view_api_key(
				metrc_api_key_id,
				security_cfg=self.security_cfg,
				session=session
			)
			self.assertIsNotNone(err)

class TestUpsertApiKey(db_unittest.TestCase):

	def setUp(self) -> None:
		self.security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY='url-secret-key1234',
			URL_SALT='url-salt1234',
			BESPOKE_DOMAIN='https://app.bespokefinancial.com'
		)

	def test_upsert_first_key(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_util.view_api_key(
				metrc_api_key_id,
				security_cfg=self.security_cfg,
				session=session
			)
			self.assertIsNone(err)
			self.assertEqual('the-api-key', view_resp['api_key'])
			self.assertEqual('CA', view_resp['us_state'])

	def test_allowed_two_keys_from_same_state(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		
		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

			# Cannot add another default us_state because that will conflict
			# with the existing key.
			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key2', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key2', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA', # disallowed because the default state is CA
				session=session
			)
			self.assertIsNone(err)

class TestGetCompanyInfo(db_unittest.TestCase):

	def setUp(self) -> None:
		self.security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY='url-secret-key1234',
			URL_SALT='url-salt1234',
			BESPOKE_DOMAIN='https://app.bespokefinancial.com'
		)
		self.auth_provider = MetrcAuthProvider(
			user_key='metrc-user-key',
			state_to_vendor_key={
				'CA': 'ca-vendorkey',
				'OR': 'or-vendorkey',
				'FL': 'fl-vendorkey'
			}
		)


	def _assert_company_info(self, expected: Dict, actual: CompanyInfo) -> None:
		
		self.assertEqual(expected['company_id'], actual.company_id)
		for us_state in actual.get_us_states():
			self.assertIn(us_state, expected['state_to_company_infos'])
			expected_infos = expected['state_to_company_infos'][us_state]
			actual_infos = actual.get_company_state_infos(us_state)

			self.assertEqual(len(expected_infos), len(actual_infos))

			for j in range(len(expected_infos)):
				expected_info = expected_infos[j]
				actual_info = actual_infos[j]

				actual_info['licenses'].sort(key=lambda l: l['license_number'])

				self.assertEqual(len(expected_info['licenses']), len(actual_info['licenses']))
				for i in range(len(expected_info['licenses'])):
					self.assertDictEqual(expected_info['licenses'][i], cast(Dict, actual_info['licenses'][i]))
				self.assertEqual(expected_info['metrc_api_key_id'], actual_info['metrc_api_key_id'])
				self.assertDictEqual(expected_info['facilities_payload'], cast(Dict, actual_info['facilities_payload']))

	def test_no_facilities_no_licenses(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		facilities: List[FacilityInfoDict] = []
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

		company_info, err = metrc_util._get_metrc_company_info(
			auth_provider=self.auth_provider,
			security_cfg=self.security_cfg,
			facilities_fetcher=FakeFacilitiesFetcher({
				'CA': facilities
			}, state_to_errs={}),
			company_id=company_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)
		self._assert_company_info({
			'company_id': company_id,
			'state_to_company_infos': {
					'CA': [
						{
							'licenses': [],
							'metrc_api_key_id': metrc_api_key_id,
							'facilities_payload': {
								'facilities': []
							}				
						}
					],
			},
		}, company_info)

	def test_single_state_facilities_and_licenses(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		facilities: List[FacilityInfoDict] = [
			FacilityInfoDict(
				License=FacilityLicenseDict(
					Number='abcd'
				)
			),
			FacilityInfoDict(
				License=FacilityLicenseDict(
					Number='ijkl'
				)
			)
		]
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

			license1 = models.CompanyLicense()
			license1.company_id = cast(Any, company_id)
			license1.license_number = 'abcd'

			license2 = models.CompanyLicense()
			license2.company_id = cast(Any, company_id)
			license2.license_number = 'efgh'

			session.add(license1)
			session.add(license2)
			session.flush()
			license_id1 = str(license1.id)
			license_id2 = str(license2.id)

		company_info, err = metrc_util._get_metrc_company_info(
			auth_provider=self.auth_provider,
			security_cfg=self.security_cfg,
			facilities_fetcher=FakeFacilitiesFetcher({
				'CA': facilities
			}, state_to_errs={}),
			company_id=company_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)
		self._assert_company_info({
			'company_id': company_id,
			'state_to_company_infos': 
				{
					'CA': [ 
						{
							'licenses': [
								{
									'license_id': license_id1,
									'license_number': 'abcd',
				  				'us_state': 'CA',
									'user_key': 'the-api-key',
									'vendor_key': 'ca-vendorkey'
								},
								{
									'license_id': None,
									'license_number': 'ijkl',
				  				'us_state': 'CA',
									'user_key': 'the-api-key',
									'vendor_key': 'ca-vendorkey'
								}
							],
							'metrc_api_key_id': metrc_api_key_id,
							'facilities_payload': {
								'facilities': [
									{'License': {'Number': 'abcd'}},
				          {'License': {'Number': 'ijkl'}}
				        ]
							}
						}
					]
				}
		}, company_info)

	def test_multi_state_facilities_and_licenses_with_failures_that_get_ignored(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		ca_facilities: List[FacilityInfoDict] = [
			FacilityInfoDict(
				License=FacilityLicenseDict(
					Number='abcd'
				)
			),
			FacilityInfoDict(
				License=FacilityLicenseDict(
					Number='efgh'
				)
			)
		]
		or_facilities: List[FacilityInfoDict] = [
			FacilityInfoDict(
				License=FacilityLicenseDict(
					Number='ijkl'
				)
			)
		]
		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			company_settings_id = seed.get_company_settings_id('company_admin', index=0)

			metrc_api_key_id2, err = metrc_util.upsert_api_key(
				api_key='the-api-key2', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='OR',
				session=session
			)
			self.assertIsNone(err)

			# Because of the way upsert works, it sets the default metrc_key
			# for now, so this has to come second
			metrc_api_key_id, err = metrc_util.upsert_api_key(
				api_key='the-api-key', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='CA',
				session=session
			)
			self.assertIsNone(err)

			metrc_api_key_id3, err = metrc_util.upsert_api_key(
				api_key='the-api-key3', 
				company_settings_id=company_settings_id, 
				metrc_api_key_id=None,
				security_cfg=self.security_cfg,
				us_state='FL',
				session=session
			)
			self.assertIsNone(err)

			license1 = models.CompanyLicense()
			license1.company_id = cast(Any, company_id)
			license1.license_number = 'abcd'

			license2 = models.CompanyLicense()
			license2.company_id = cast(Any, company_id)
			license2.license_number = 'ijkl'
			license2.us_state = 'OR'

			session.add(license1)
			session.add(license2)
			session.flush()
			license_id1 = str(license1.id)
			license_id2 = str(license2.id)

		company_info, err = metrc_util._get_metrc_company_info(
			auth_provider=self.auth_provider,
			security_cfg=self.security_cfg,
			facilities_fetcher=FakeFacilitiesFetcher({
				'CA': ca_facilities,
				'OR': or_facilities
			}, state_to_errs={
				'FL': errors.Error('No succesful facilities found for FL')
			}),
			company_id=company_id,
			session_maker=self.session_maker
		)
		self.assertIsNone(err)
		self._assert_company_info({
			'company_id': company_id,
			'state_to_company_infos': {
				'CA': [
					{
						'licenses': [
							{
								'license_id': license_id1,
								'license_number': 'abcd',
			  				'us_state': 'CA',
								'user_key': 'the-api-key',
								'vendor_key': 'ca-vendorkey'
							},
							{
								'license_id': None,
								'license_number': 'efgh',
			  				'us_state': 'CA',
								'user_key': 'the-api-key',
								'vendor_key': 'ca-vendorkey'
							},
						],
						'metrc_api_key_id': metrc_api_key_id,
						'facilities_payload': {
							'facilities': [
								{'License': {'Number': 'abcd'}},
			          {'License': {'Number': 'efgh'}}
			        ]
						}
					}
				],
				'OR': [
					{
						'licenses': [			
							{
								'license_id': license_id2,
								'license_number': 'ijkl',
			  				'us_state': 'OR',
								'user_key': 'the-api-key2',
								'vendor_key': 'or-vendorkey'
							}
						],
						'metrc_api_key_id': metrc_api_key_id2,
						'facilities_payload': {
							'facilities': [
								{'License': {'Number': 'ijkl'}}
			        ]
						}
					}
				]
			}
		}, company_info)
