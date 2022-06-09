import calendar
import datetime
from datetime import timedelta, timezone
from typing import Tuple

import holidays
import numpy as np
import pytz
from calendar import monthrange
from bespoke import errors
from dateutil import parser, relativedelta

us_holidays = holidays.UnitedStates()
DEFAULT_TIMEZONE = 'US/Pacific'

def human_readable_yearmonthday(dt: datetime.datetime) -> str:
	return dt.strftime('%m/%d/%Y')

def human_readable_yearmonthday_from_date(date: datetime.date) -> str:
	return date.strftime('%m/%d/%Y')

def human_readable_monthyear(date: datetime.date) -> str:
	return date.strftime('%B %Y')

def hours_from_today(hours: int) -> datetime.datetime:
	"""
		Returns a datetime N hours ahead of right now, e.g.,
		hours = 10 means this time is 10 hours into the future.
		Useful for generation expiration datetimes.
	"""
	return datetime.datetime.now(timezone.utc) + timedelta(hours=hours)

def get_last_day_of_month(year: int, month: int) -> int:
	return monthrange(year, month)[1]

def is_last_day_of_month(day: datetime.date) -> int:
	return get_last_day_of_month(year=day.year, month=day.month) == day.day

def now() -> datetime.datetime:
	return datetime.datetime.now(timezone.utc)

def now_as_date(timezone: str = DEFAULT_TIMEZONE, now: datetime.datetime = None) -> datetime.date:
	if now is None:
		now = datetime.datetime.now(pytz.utc)

	dt = now.astimezone(pytz.timezone(timezone))
	return dt.date()

def get_previous_month_last_date(send_date : datetime.date) -> datetime.date:
	"""
		Please use human_readable_monthyear for display formatting

		Select Use Cases:
		- Monthly reporting where email is send out for previous month
			- Example:
				- Send Date: 10/5/2021
				- Report Month: September 2021
		- Monthly reporting to get the last day of the month for financial summary queries
	"""
	first_of_current_month = send_date.replace(day = 1)
	report_month = first_of_current_month - datetime.timedelta(days = 1)

	return report_month

def is_leap_year(year: int) -> bool:
	year_match = False

	if (year % 4) == 0:
		if (year % 100) == 0:
			if (year % 400) == 0:
				year_match = True
		else:
			year_match = True

	return year_match

def get_days_in_month(target : datetime.date) -> int:
	"""
		Select Use Cases:
		- Days in cycle field of monthly summary reporting
	"""
	month = target.month
	year = target.year
	
	month_mapping = {
		1: 31,
		2: 28,
		3: 31,
		4: 30,
		5: 31,
		6: 30,
		7: 31,
		8: 31,
		9: 30,
		10: 31,
		11: 30,
		12: 31,
	}

	days_in_month = month_mapping[month]

	if month == 2 and is_leap_year(year):
		days_in_month = 29

	return days_in_month

def meets_noon_cutoff(requested_date: datetime.date, timezone: str, now: datetime.datetime = None) -> Tuple[bool, errors.Error]:
	if now is None:
		now = datetime.datetime.now(pytz.utc)

	now_dt = now.astimezone(pytz.timezone(timezone))

	if requested_date > now_dt.date():
		# If the user specified a day in the future, then they've met the
		# noon cutoff
		return True, None

	if requested_date < now_dt.date():
		# Cannot specify a day in the past.
		return False, errors.Error('This is a date in the past. Please select a date after {}'.format(now_dt.date()))

	year = requested_date.year
	month = requested_date.month
	day = requested_date.day

	noon_today = datetime.datetime(year, month, day, hour=12).replace(tzinfo=pytz.timezone(timezone))

	if now_dt < noon_today:
		return True, None

	# We use PST here as the default comparison because the 12 noon cutoff is for the operations team
	# and the bank we use. Both of which are primarily based in PST.
	return False, errors.Error('It is currently after 12 noon in Pacific Standard Time. Please select the next business day')

def get_earliest_requested_payment_date(timezone: str) -> datetime.date:
	requested_date = now_as_date(timezone)

	meets_cutoff, err = meets_noon_cutoff(requested_date, timezone=timezone)
	if meets_cutoff:
		return requested_date

	# Find the nearest business day, starting from
	# the next day being the earliest possible day.
	next_date = requested_date + timedelta(days=1)
	return get_nearest_business_day(next_date, preceeding=False)

def get_automated_debit_date(send_date: datetime.date) -> datetime.date:
	"""
	This function expects the last day of the report month. Given the as of date
	testing feature, that may not always be the last day of the calendar month
	As such, we set the day to 5, increment the month by 1, and find the nearest business day
	"""
	fifth_of_current_month = datetime.date(send_date.year, send_date.month, 5) + relativedelta.relativedelta(months=1)
	return get_nearest_business_day(fifth_of_current_month, preceeding=False)

def date_to_datetime(date: datetime.date) -> datetime.datetime:
	return datetime.datetime(year = date.year, month = date.month, day = date.day).replace(tzinfo=pytz.timezone(DEFAULT_TIMEZONE))

def datetime_to_str(dt: datetime.datetime) -> str:
	return dt.isoformat()

def date_to_db_str(date: datetime.date) -> str:
	return date.strftime('%Y-%m-%d')

def date_to_str(date: datetime.date) -> str:
	return date.strftime('%m/%d/%Y')

def load_date_str(date_str: str) -> datetime.date:
	"""
		It is assumed the date is in the format of %m/%d/%Y, e.g.
		02/11/2020 is Feb 11th 2020
	"""
	return parser.parse(date_str).date()

def load_datetime_str(datetime_str: str) -> datetime.datetime:
	"""
		It is assumed the date is in the format of %Y-%m-%dT%H:%M:%S.%f%z, e.g.
		2022-03-08T23:51:37.586439+00:00 is March 8th 2022 at 23:51:37 in the UTC timezone
	"""
	return parser.parse(datetime_str)

def calculate_ebba_application_expires_date(application_date: datetime.datetime) -> datetime.datetime:
	return (application_date + relativedelta.relativedelta(months=1)).replace(15)

def is_past_due(today: datetime.date, expires_date: datetime.date, timezone: str) -> bool:
	return today >= expires_date

def has_expired(expires_date: datetime.datetime) -> bool:
	return now() >= expires_date

def num_calendar_days_passed(d1: datetime.date, d2: datetime.date) -> int:
	"""
		The number of calendar days that have passed between these 2 dates. This number
		is inclusive, so we have to add 1 between the delta.

		For example there are 3 days that have passed from 10/01/2020 to 10/03/2020,
		but the delta is 2 days, so we have to add that extra 1.
	"""
	delta = d1 - d2
	return int(abs(delta.days)) + 1

def get_nearest_business_day(reference_date: datetime.date, preceeding: bool) -> datetime.date:
	cur_date = reference_date
	sign = -1 if preceeding else 1

	for i in range(30):
		is_weekday = np.is_busday(cur_date, weekmask='Mon Tue Wed Thu Fri')
		is_not_us_holiday = cur_date not in us_holidays # type: ignore

		if is_weekday and is_not_us_holiday:
			return cur_date

		num_days_increment = sign * 1
		cur_date = cur_date + timedelta(days=num_days_increment)

	raise Exception('No nearest business day found within 30 attempts')

def number_days_between_dates(
	later_date: datetime.date,
	earlier_date: datetime.date,
	inclusive_later_date: bool = False,
) -> int:
	result = (later_date - earlier_date).days + (1 if inclusive_later_date else 0)
	return result if result >= 0 else None

def get_first_day_of_month_date(date_str: str) -> datetime.date:
	# Find the last date of this month
	chosen_date = load_date_str(date_str)
	return datetime.date(chosen_date.year, chosen_date.month, 1)

def get_last_day_of_month_date(date_str: str) -> datetime.date:
	# Find the last date of this month
	chosen_date = load_date_str(date_str)
	last_day_of_month = calendar.monthrange(chosen_date.year, chosen_date.month)[1]
	return datetime.date(chosen_date.year, chosen_date.month, last_day_of_month)
