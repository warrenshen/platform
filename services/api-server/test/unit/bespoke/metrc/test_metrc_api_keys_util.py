from bespoke.db.models import session_scope
from bespoke.metrc import metrc_api_keys_util
from bespoke.security import security_util
from bespoke_test.db import db_unittest, test_helper

class TestDeleteKey(db_unittest.TestCase):

	def setUp(self) -> None:
		self.security_cfg = security_util.ConfigDict(
			URL_SECRET_KEY='url-secret-key1234',
			URL_SALT='url-salt1234',
			BESPOKE_DOMAIN='https://app.bespokefinancial.com'
		)

	def test_delete_last_remaining_key(self) -> None:
		self.reset()
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			metrc_api_key_id, err = metrc_api_keys_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key',
				security_cfg=self.security_cfg,
				us_state='CA',
				use_saved_licenses_only=False,
				session=session
			)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_api_keys_util.view_api_key(
				metrc_api_key_id,
				security_cfg=self.security_cfg,
				session=session
			)
			self.assertIsNone(err)
			self.assertEqual('the-api-key', view_resp['api_key'])
			self.assertEqual('CA', view_resp['us_state'])

		with session_scope(self.session_maker) as session:
			success, err = metrc_api_keys_util.delete_api_key(
				metrc_api_key_id,
				session=session
			)
			self.assertTrue(success)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_api_keys_util.view_api_key(
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
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			metrc_api_key_id, err = metrc_api_keys_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key',
				security_cfg=self.security_cfg,
				us_state='CA',
				use_saved_licenses_only=False,
				session=session
			)
			self.assertIsNone(err)

		with session_scope(self.session_maker) as session:
			view_resp, err = metrc_api_keys_util.view_api_key(
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
			metrc_api_key_id, err = metrc_api_keys_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key',
				security_cfg=self.security_cfg,
				us_state='CA',
				use_saved_licenses_only=False,
				session=session
			)
			self.assertIsNone(err)

			metrc_api_key_id, err = metrc_api_keys_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key2',
				security_cfg=self.security_cfg,
				us_state='CA',
				use_saved_licenses_only=False,
				session=session
			)
			self.assertIsNone(err)

			metrc_api_key_id, err = metrc_api_keys_util.upsert_api_key(
				company_id=company_id,
				metrc_api_key_id=None,
				api_key='the-api-key2',
				security_cfg=self.security_cfg,
				us_state='CA', # disallowed beacuse its a duplicate
				use_saved_licenses_only=False,
				session=session
			)
			self.assertIsNotNone(err)
