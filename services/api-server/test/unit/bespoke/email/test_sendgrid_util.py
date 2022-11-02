import uuid
from sqlalchemy.orm.session import Session
from typing import List, Dict

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke_test.db import db_unittest

class TestSendGridClient(db_unittest.TestCase):

	def test_maybe_add_or_remove_recipients(self) -> None:
		tests: List[Dict] = [
			{
				'recipients': ['b@customer.com', 'b@customer.com'],
				'cfg': {
					'flask_env': 'development'
				},
				'template_name': '',
				'expected_recipients': ['b@customer.com']
			},
			{
				'recipients': ['a@gmail.com', 'b@customer.com'],
				'cfg': {
					'flask_env': 'development'
				},
				'template_name': '',
				'expected_recipients': ['b@customer.com']
			},
			{
				'recipients': ['a@gmail.com', 'b@customer.com'],
				'cfg': {
					'flask_env': 'staging',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': '',
				'expected_recipients': ['b@customer.com']
			},
			{
				'recipients': ['a@gmail.com', 'b@customer.com', 'c@bespokefinancial.com'],
				'cfg': {
					'flask_env': 'staging',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': '',
				'expected_recipients': ['b@customer.com', 'c@bespokefinancial.com']
			},
			{
				'recipients': ['a@gmail.com'],
				'cfg': {
					'flask_env': 'production',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': sendgrid_util.TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER,
				'expected_recipients': ['a@gmail.com', 'no-reply@bespokefinancial.com']
			},
			{
				'recipients': ['a@gmail.com'],
				'cfg': {
					'flask_env': 'production',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': sendgrid_util.TemplateNames.USER_FORGOT_PASSWORD,
				'expected_recipients': ['a@gmail.com']
			}
		]

		for test in tests:
			self.assertEqual(
				test['expected_recipients'], 
				sendgrid_util._maybe_add_or_remove_recipients(
					test['recipients'],
					test['cfg'],
					test['template_name'],
					self.session_maker,
					filter_out_contact_only = False
				)
			)

def setup_users_for_deactivated_email_test(
	session: Session
	) -> None:
	session.add(models.User(
		company_id = str(uuid.uuid4()),
		email = 'roger@blazeit.com',
		password = 'xxxx',
		role = 'Test Role',
		first_name = 'Roger',
		last_name = 'Federer',
		login_method = 'simple',
		is_deleted = True
	))

	session.add(models.User(
		company_id = str(uuid.uuid4()),
		email = 'clifford@blazeit.com',
		password = 'xxxx',
		role = 'Walk Requester',
		first_name = 'Clifford',
		last_name = 'The Dog',
		login_method = 'simple',
		is_deleted = None
	))

def setup_users_for_filtering_out_contact_only_test(
	session: Session
	) -> None:
	session.add(models.User(
		company_id = str(uuid.uuid4()),
		email = 'roger@blazeit.com',
		password = 'xxxx',
		role = 'company_admin',
		first_name = 'Roger',
		last_name = 'Federer',
		login_method = 'simple',
		is_deleted = True
	))

	session.add(models.User(
		company_id = str(uuid.uuid4()),
		email = 'clifford@blazeit.com',
		password = 'xxxx',
		role = 'company_contact_only',
		first_name = 'Clifford',
		last_name = 'The Dog',
		login_method = 'simple',
		is_deleted = None
	))

class TestSendGridUtilityFunctions(db_unittest.TestCase):

	def test_remove_deactived_emails(self) -> None:
		with session_scope(self.session_maker) as session:
			setup_users_for_deactivated_email_test(session)

			recipients = ["roger@blazeit.com", "clifford@blazeit.com"]
			recipients = sendgrid_util._remove_deactived_emails(recipients, session)

			self.assertEqual(False, "roger@blazeit.com" in recipients)
			self.assertEqual(True, "clifford@blazeit.com" in recipients)

	def test_filter_out_contact_only_emails(self) -> None:
		with session_scope(self.session_maker) as session:
			setup_users_for_filtering_out_contact_only_test(session)

			recipients = ["roger@blazeit.com", "clifford@blazeit.com"]
			recipients = sendgrid_util._filter_out_contact_only_emails(recipients, session)

			self.assertEqual(True, "roger@blazeit.com" in recipients)
			self.assertEqual(False, "clifford@blazeit.com" in recipients)
