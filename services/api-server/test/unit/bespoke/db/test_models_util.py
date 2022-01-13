import unittest
import uuid
from sqlalchemy.orm.session import Session

from bespoke.db import models, models_util
from bespoke.db.models import session_scope
from bespoke.db import db_constants

from bespoke_test.db import db_unittest

def setup_users_for_get_active_users(
	session: Session,
	company_id: str
	) -> None:
	session.add(models.User(
		company_id = company_id,
		email = 'winnie@100acrewood.com',
		password = 'xxxx',
		role = 'Smackerel Sampler',
		first_name = 'Winnie',
		last_name = 'The Pooh',
		login_method = 'simple',
		is_deleted = True
	))

	session.add(models.User(
		company_id = company_id,
		email = 'rabbit@100acrewood.com',
		password = 'xxxx',
		role = 'Worrywort',
		first_name = 'Rabbit',
		last_name = 'Daws',
		login_method = 'simple',
		is_deleted = None
	))

	session.add(models.User(
		company_id = company_id,
		email = 'eeyore@100acrewood.com',
		password = 'xxxx',
		role = 'company_contact_only',
		first_name = 'Eeyore',
		last_name = 'Gloomy',
		login_method = 'simple',
		is_deleted = None
	))

class TestModelsUtil(db_unittest.TestCase):

	def test_get_active_users(self) -> None:
		with session_scope(self.session_maker) as session:
			company_id = str(uuid.uuid4())
			setup_users_for_get_active_users(session, company_id)

			# **Without** company_contact_only filter
			active_users_without_filter = models_util.get_active_users(company_id, session)
			self.assertEqual(len(active_users_without_filter), 2)

			active_emails_without_filter = [u.email for u in active_users_without_filter]
			self.assertEqual(False, 'winnie@100acrewood.com' in active_emails_without_filter)
			self.assertEqual(True, 'rabbit@100acrewood.com' in active_emails_without_filter)
			self.assertEqual(True, 'eeyore@100acrewood.com' in active_emails_without_filter)

			# **With** company_contact_only filter
			active_users_with_filter = models_util.get_active_users(company_id, session, filter_contact_only=True)
			self.assertEqual(len(active_users_with_filter), 1)

			active_emails_with_filter = [u.email for u in active_users_with_filter]
			self.assertEqual(False, 'winnie@100acrewood.com' in active_emails_with_filter)
			self.assertEqual(True, 'rabbit@100acrewood.com' in active_emails_with_filter)
			self.assertEqual(False, 'eeyore@100acrewood.com' in active_emails_with_filter)
