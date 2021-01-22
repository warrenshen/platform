import datetime
from datetime import timezone

def now() -> datetime.datetime:
	return datetime.datetime.now(timezone.utc)

def has_expired(expires_at: datetime.datetime) -> bool:
	return now() >= expires_at
