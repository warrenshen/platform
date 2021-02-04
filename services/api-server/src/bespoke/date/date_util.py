import datetime
from dateutil import parser
from datetime import timezone

def human_readable_yearmonthday(dt: datetime.datetime) -> str:
	return dt.strftime('%m/%d/%Y')


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

def has_expired(expires_at: datetime.datetime) -> bool:
	return now() >= expires_at
