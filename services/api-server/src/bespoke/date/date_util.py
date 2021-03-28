import datetime
from datetime import timedelta, timezone

import holidays
import numpy as np
from dateutil import parser, relativedelta

us_holidays = holidays.UnitedStates()

def human_readable_yearmonthday(dt: datetime.datetime) -> str:
	return dt.strftime('%m/%d/%Y')

def hours_from_today(hours: int) -> datetime.datetime:
	"""
		Returns a datetime N hours ahead of right now, e.g.,
		hours = 10 means this time is 10 hours into the future.
		Useful for generation expiration datetimes.
	"""
	return datetime.datetime.now(timezone.utc) + timedelta(hours=hours)

def now() -> datetime.datetime:
	return datetime.datetime.now(timezone.utc)

def datetime_to_str(dt: datetime.datetime) -> str:
	return dt.isoformat()

def date_to_str(date: datetime.date) -> str:
	return date.strftime('%m/%d/%Y')

def load_date_str(date_str: str) -> datetime.date:
	"""
		It is assumed the date is in the format of %m/%d/%Y, e.g.
		02/11/2020 is Feb 11th 2020
	"""
	return parser.parse(date_str).replace(tzinfo=datetime.timezone.utc).date()

def today_as_date() -> datetime.date:
	return load_date_str(date_to_str(now()))

def calculate_ebba_application_expires_at(application_date: datetime.datetime) -> datetime.datetime:
	return (application_date + relativedelta.relativedelta(months=1)).replace(15)

def has_expired(expires_at: datetime.datetime) -> bool:
	return now() >= expires_at

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

	# TODO(dlluncor): Ensure we use the same business days on the frontend and backend
	# are happy with the days we choose

	for i in range(30):
		is_weekday = np.is_busday(cur_date, weekmask='Mon Tue Wed Thu Fri')
		is_not_us_holiday = cur_date not in us_holidays # type: ignore

		if is_weekday and is_not_us_holiday:
			return cur_date

		num_days_increment = sign * 1
		cur_date = cur_date + timedelta(days=num_days_increment)

	raise Exception('No nearest business day found within 30 attempts')
