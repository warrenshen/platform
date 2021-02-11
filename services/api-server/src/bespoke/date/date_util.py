import datetime
from dateutil import parser
from datetime import timezone, timedelta

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

def has_expired(expires_at: datetime.datetime) -> bool:
	return now() >= expires_at

def calendar_days_apart(d1: datetime.date, d2: datetime.date) -> int:
	delta = d1 - d2
	return int(abs(delta.days))
