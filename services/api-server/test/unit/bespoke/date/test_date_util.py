import unittest
from dateutil.parser import parse
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

	def test_meets_noon_cutoff(self) -> None:
		tests: List[Dict] = [
			{
				'now': '2020-10-20T16:33:27.69+00:00',
				'requested_date': '10/20/2020',
				'timezone': 'US/Pacific',
				'meets_cutoff': True,
				'reason': '4:33pm UTC is 8:33am PST, so it meets the cutoff'
			},
			{
				'now': '2020-10-20T12:33:27.69-08:00',
				'requested_date': '10/20/2020',
				'timezone': 'US/Pacific',
				'meets_cutoff': False,
				'reason': 'Its currently 12:33pm so they must request the next day'
			},
			{
				'now': '2020-10-20T00:33:27.69+00:00',
				'requested_date': '10/18/2020',
				'timezone': 'US/Pacific',
				'meets_cutoff': False,
				'reason': '12:33am UTC is 4:33am PST the day before, so it cannot meet the cutoff'
			},
			{
				'now': '2020-10-20T00:33:27.69-08:00',
				'requested_date': '10/21/2020',
				'timezone': 'US/Pacific',
				'meets_cutoff': True,
				'reason': 'Requesting the day after is fine as well'
			}
		]

		for i in range(len(tests)):
			test = tests[i]
			now = parse(test['now'])
			requested_date = date_util.load_date_str(test['requested_date'])
			meets_cutoff, err = date_util.meets_noon_cutoff(requested_date, test['timezone'], now=now)

			self.assertEqual(
				test['meets_cutoff'], meets_cutoff, msg='Test {} failed. Err {}'.format(i, err))

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

	def test_get_report_month(self) -> None:
		"""
			
		"""
		tests: List[Dict] = [
			{
				'report_send_date': date_util.load_date_str('1/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('12/31/2020'),
				'expected_human_readable_statement_date': 'December 2020'
			},
			{
				'report_send_date': date_util.load_date_str('2/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('1/31/2021'),
				'expected_human_readable_statement_date': 'January 2021'
			},
			{
				'report_send_date': date_util.load_date_str('3/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('2/28/2021'),
				'expected_human_readable_statement_date': 'February 2021'
			},
			{
				'report_send_date': date_util.load_date_str('4/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('3/31/2021'),
				'expected_human_readable_statement_date': 'March 2021'
			},
			{
				'report_send_date': date_util.load_date_str('5/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('4/30/2021'),
				'expected_human_readable_statement_date': 'April 2021'
			},
			{
				'report_send_date': date_util.load_date_str('6/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('5/31/2021'),
				'expected_human_readable_statement_date': 'May 2021'
			},
			{
				'report_send_date': date_util.load_date_str('7/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('6/30/2021'),
				'expected_human_readable_statement_date': 'June 2021'
			},
			{
				'report_send_date': date_util.load_date_str('8/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('7/31/2021'),
				'expected_human_readable_statement_date': 'July 2021'
			},
			{
				'report_send_date': date_util.load_date_str('9/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('8/31/2021'),
				'expected_human_readable_statement_date': 'August 2021'
			},
			{
				'report_send_date': date_util.load_date_str('10/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('9/30/2021'),
				'expected_human_readable_statement_date': 'September 2021'
			},
			{
				'report_send_date': date_util.load_date_str('11/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('10/31/2021'),
				'expected_human_readable_statement_date': 'October 2021'
			},
			{
				'report_send_date': date_util.load_date_str('12/5/2021'),
				'expected_raw_statement_date': date_util.load_date_str('11/30/2021'),
				'expected_human_readable_statement_date': 'November 2021'
			},
			{
				'report_send_date': date_util.load_date_str('3/5/2020'),
				'expected_raw_statement_date': date_util.load_date_str('2/29/2020'),
				'expected_human_readable_statement_date': 'February 2020'
			},		
		]

		for test in tests:
			report_month_raw = date_util.get_previous_month_last_date(test['report_send_date'])

			self.assertEqual(
				test['expected_raw_statement_date'], 
				report_month_raw
			)

			report_month_display = date_util.human_readable_monthyear(report_month_raw)
			self.assertEqual(
				test['expected_human_readable_statement_date'],
				report_month_display
			)

	def test_is_leap_year(self) -> None:
		self.assertEqual(True, date_util.is_leap_year(2000))
		self.assertEqual(True, date_util.is_leap_year(2004))
		self.assertEqual(True, date_util.is_leap_year(2008))
		self.assertEqual(True, date_util.is_leap_year(2012))
		self.assertEqual(True, date_util.is_leap_year(2016))
		self.assertEqual(True, date_util.is_leap_year(2020))
		self.assertEqual(True, date_util.is_leap_year(2024))

		self.assertEqual(False, date_util.is_leap_year(2017))
		self.assertEqual(False, date_util.is_leap_year(2018))
		self.assertEqual(False, date_util.is_leap_year(2019))
		self.assertEqual(False, date_util.is_leap_year(2021))
		self.assertEqual(False, date_util.is_leap_year(2022))
		self.assertEqual(False, date_util.is_leap_year(2023))
