import json
import datetime
from typing import Callable, Dict, Tuple

from manage_async import app, config
from bespoke.db.db_constants import ClientSurveillanceCategoryEnum, RequestStatusEnum
from bespoke.db import models
from bespoke.date import date_util
from bespoke.db.models import session_scope
from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

class TestExpireActiveEbbaApplications(db_unittest.TestCase):

	def _get_request_headers(self) -> Dict:
		return {
			"Content-Type": "application/json",
			"x-api-key": config.ASYNC_SERVER_API_KEY,
		}

	def _run_simple_test(self,
		endpoint: str,
		populate: Callable,
		request: Dict
	) -> Tuple[Dict, test_helper.BasicSeed]:
		seed = self.seed_database()
		populate(self.session_maker, seed)

		headers = self._get_request_headers()

		with app.test_client() as client:
			response = client.post(endpoint,
				data=json.dumps(request),
				headers=headers)
			return json.loads(response.data), seed

	def test_unsets_expired_application(self) -> None:
		def populate(session_maker: Callable, seed: test_helper.BasicSeed) -> None:
			company_id = seed.get_company_id('company_admin', index=0)
			app_id = None

			with session_scope(session_maker) as session:
				app = models.EbbaApplication( # type: ignore
					company_id=company_id,
					application_date=date_util.load_date_str("03/04/2021"),
					status=RequestStatusEnum.APPROVED,
					requested_at=datetime.datetime.utcnow() - datetime.timedelta(days=15),
					expires_date=(datetime.datetime.utcnow() - datetime.timedelta(days=15)).date(),
					category=ClientSurveillanceCategoryEnum.BORROWING_BASE
				)

				session.add(app)
				session.commit()
				session.refresh(app)

				app_id = app.id

				settings = session.query(models.CompanySettings) \
					.filter(models.CompanySettings.company_id == company_id) \
					.first()
				settings.active_borrowing_base_id = app.id

			with session_scope(session_maker) as session:
				settings = session.query(models.CompanySettings) \
					.filter(models.CompanySettings.company_id == company_id) \
					.first()

				self.assertIsNotNone(settings.active_borrowing_base_id)
				self.assertEqual(settings.active_borrowing_base_id, app_id)

		response, seed = self._run_simple_test(
			'/triggers/expire-active-ebba-applications',
			populate,
			{})

		self.assertEqual(response['status'], 'OK')

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			settings = session.query(models.CompanySettings) \
				.filter(models.CompanySettings.company_id == company_id) \
				.first()
			self.assertIsNone(settings.active_borrowing_base_id)

	def test_ignores_the_others(self) -> None:
		def populate(session_maker: Callable, seed: test_helper.BasicSeed) -> None:
			company_id = seed.get_company_id('company_admin', index=0)
			app_id = None

			with session_scope(session_maker) as session:
				app = models.EbbaApplication( # type: ignore
					company_id=company_id,
					application_date=date_util.load_date_str("03/04/2021"),
					status=RequestStatusEnum.APPROVED,
					requested_at=datetime.datetime.utcnow() + datetime.timedelta(days=15),
					expires_date=(datetime.datetime.utcnow() + datetime.timedelta(days=15)).date(),
				)

				session.add(app)
				session.commit()
				session.refresh(app)

				app_id = app.id

				settings = session.query(models.CompanySettings) \
					.filter(models.CompanySettings.company_id == company_id) \
					.first()
				settings.active_borrowing_base_id = app.id

			with session_scope(session_maker) as session:
				settings = session.query(models.CompanySettings) \
					.filter(models.CompanySettings.company_id == company_id) \
					.first()

				self.assertIsNotNone(settings.active_borrowing_base_id)
				self.assertEqual(settings.active_borrowing_base_id, app_id)

		response, seed = self._run_simple_test(
			'/triggers/expire-active-ebba-applications',
			populate,
			{})

		self.assertEqual(response['status'], 'OK')

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(self.session_maker) as session:
			settings = session.query(models.CompanySettings) \
				.filter(models.CompanySettings.company_id == company_id) \
				.first()
			self.assertIsNotNone(settings.active_borrowing_base_id)
