import datetime
from datetime import timezone


def human_readable_yearmonthday(dt: datetime.datetime) -> str:
    return dt.strftime('%m/%d/%Y')


def now() -> datetime.datetime:
    return datetime.datetime.now(timezone.utc)


def has_expired(expires_at: datetime.datetime) -> bool:
    return now() >= expires_at
