import unittest
from typing import List, Dict

from bespoke.security import security_util

class TestPassword(unittest.TestCase):

	def test_meets_password_complexity(self) -> None:

		tests: List[Dict] = [
			dict(meets_requirement=False, password='123', in_err_msg='8 characters'),
			dict(meets_requirement=False, password='12345678', in_err_msg='one lowercase'),
			dict(meets_requirement=False, password='1234567a', in_err_msg='one uppercase'),
			dict(meets_requirement=False, password='abcdefgH', in_err_msg='one number'),
			dict(meets_requirement=False, password='abcdef1H', in_err_msg='special character'),
			dict(meets_requirement=False, password='abcdef1H$ ', in_err_msg='space'),
			dict(meets_requirement=True, password='abcdef1H$')
		]
		for t in tests:
			meets_requirement, errs = security_util.meets_password_complexity_requirements(t['password'])

			self.assertEqual(meets_requirement, t['meets_requirement'])
			if meets_requirement:
				self.assertIsNone(errs)
			else:
				self.assertIn(t['in_err_msg'], errs[0].msg)

	def test_generate_password(self) -> None:
		for i in range(100):
			pw = security_util.generate_temp_password()
			self.assertTrue(len(pw) > 1)