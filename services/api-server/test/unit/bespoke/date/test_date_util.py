import unittest
from typing import List, Dict

from bespoke.date import date_util

class TestDateUtil(unittest.TestCase):

	def test_num_calendars_passed(self) -> None:
		tests: List[Dict] = [
			{
				'date1': '1/1/2020',
				'date2': '1/10/2020',
				'num_days': 10
			},
			{
				'date1': '1/10/2020',
				'date2': '1/1/2020',
				'num_days': 10
			},
			{
				'date1': '1/30/2020',
				'date2': '2/2/2020',
				'num_days': 4
			},
			{
				'date1': '2/20/2020', # Feb 2020 has 29 days because of leap year
				'date2': '3/2/2020',
				'num_days': 12
			},
			{
				'date1': '2/20/2021', # Feb 2021 has 28 days like normal
				'date2': '3/2/2021',
				'num_days': 11
			}
		]

		for test in tests:
			d1 = date_util.load_date_str(test['date1'])
			d2 = date_util.load_date_str(test['date2'])

			self.assertEqual(
				test['num_days'], 
				date_util.num_calendar_days_passed(d1, d2)
			)

	def test_now_as_date(self) -> None:
		self.assertEqual(10, len(date_util.date_to_str(date_util.now_as_date('US/Pacific'))))

	def test_get_nearest_business_day(self) -> None:
		tests: List[Dict] = [
			{
				'reference_date': '2/14/2021', # Sunday
				'expected_date': '2/12/2021',
				'preceeding': True
			},
			{
				'reference_date': '2/14/2021', # Sunday
				'expected_date': '2/16/2021', # Skips Presidents Day which is Jan 15th
				'preceeding': False
			},
			{
				'reference_date': '2/14/2021',
				'expected_date': '2/16/2021',
				'preceeding': False
			}
		]

		for test in tests:
			d1 = date_util.load_date_str(test['reference_date'])

			self.assertEqual(
				date_util.load_date_str(test['expected_date']), 
				date_util.get_nearest_business_day(d1, preceeding=test['preceeding'])
			)
