
import unittest
from typing import List, Dict

from bespoke.email import sendgrid_util

class TestSendGridClient(unittest.TestCase):

	def test_maybe_add_or_remove_recipients(self) -> None:
		tests: List[Dict] = [
			{
				'recipients': ['b@sweatequity.vc', 'b@sweatequity.vc'],
				'cfg': {
					'flask_env': 'development'
				},
				'template_name': '',
				'expected_recipients': ['b@sweatequity.vc']
			},
			{
				'recipients': ['a@gmail.com', 'b@sweatequity.vc'],
				'cfg': {
					'flask_env': 'development'
				},
				'template_name': '',
				'expected_recipients': ['b@sweatequity.vc']
			},
			{
				'recipients': ['a@gmail.com', 'b@sweatequity.vc'],
				'cfg': {
					'flask_env': 'staging',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': '',
				'expected_recipients': ['b@sweatequity.vc', 'no-reply@bespokefinancial.com']
			},
			{
				'recipients': ['a@gmail.com', 'b@sweatequity.vc', 'c@bespokefinancial.com'],
				'cfg': {
					'flask_env': 'staging',
					'no_reply_email_addr': 'no-reply@bespokefinancial.com'
				},
				'template_name': '',
				'expected_recipients': ['b@sweatequity.vc', 'c@bespokefinancial.com', 'no-reply@bespokefinancial.com']
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
					test['template_name']
				)
			)
