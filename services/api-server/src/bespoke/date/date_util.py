import datetime
import holidays
import numpy as np
import pytz

from datetime import timedelta, timezone
from typing import Tuple
from dateutil import parser, relativedelta

from bespoke import errors

us_holidays = holidays.UnitedStates()
DEFAULT_TIMEZONE = 'US/Pacific'

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

def now_as_date(timezone: str) -> datetime.date:
	dt = datetime.datetime.now(pytz.utc)
	dt = dt.astimezone(pytz.timezone(timezone))
	return dt.date()

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
		return False, errors.Error('this is a date in the past. Please select a date after {}'.format(now_dt.date()))

	year = requested_date.year
	month = requested_date.month
	day = requested_date.day

	noon_today = datetime.datetime(year, month, day, hour=12).replace(tzinfo=pytz.timezone(timezone))

	if now_dt < noon_today:
		return True, None

	return False, errors.Error('it is currently after 12 noon in your timezone. Please select the next business day')

def get_earliest_requested_payment_date(timezone: str) -> datetime.date:
	requested_date = now_as_date(timezone)

	meets_cutoff, err = meets_noon_cutoff(requested_date, timezone=timezone)
	if meets_cutoff:
		return requested_date

	# Find the nearest business day, starting from
	# the next day being the earliest possible day.
	next_date = requested_date + timedelta(days=1)
	return get_nearest_business_day(next_date, preceeding=False)

def datetime_to_str(dt: datetime.datetime) -> str:
	return dt.isoformat()

def date_to_str(date: datetime.date) -> str:
	return date.strftime('%m/%d/%Y')

def load_date_str(date_str: str) -> datetime.date:
	"""
		It is assumed the date is in the format of %m/%d/%Y, e.g.
		02/11/2020 is Feb 11th 2020
	"""
	return parser.parse(date_str).date()

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

	for i in range(30):
		is_weekday = np.is_busday(cur_date, weekmask='Mon Tue Wed Thu Fri')
		is_not_us_holiday = cur_date not in us_holidays # type: ignore

		if is_weekday and is_not_us_holiday:
			return cur_date

		num_days_increment = sign * 1
		cur_date = cur_date + timedelta(days=num_days_increment)

	raise Exception('No nearest business day found within 30 attempts')
