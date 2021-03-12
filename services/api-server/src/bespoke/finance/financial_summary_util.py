import datetime

from sqlalchemy.orm.session import Session
from typing import cast, List, Tuple

from bespoke import errors
from bespoke.db import models

def _get_most_recent_summary_date(session: Session) -> datetime.date:

	financial_summary = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary).order_by(models.FinancialSummary.date.desc()).first())
	if not financial_summary:
		return None

	return financial_summary.date

def get_latest_financial_summary_for_all_customers(session: Session) -> Tuple[List[models.FinancialSummary], errors.Error]:
		latest_date = _get_most_recent_summary_date(session)
		if not latest_date:
			return None, errors.Error('No financial summary found that has a date populated')		

		financial_summary = cast(
			List[models.FinancialSummary],
			session.query(models.FinancialSummary).filter(models.FinancialSummary.date == latest_date.isoformat()).all()
		)
		return financial_summary, None

def get_latest_financial_summary(company_id: str, session: Session) -> models.FinancialSummary:
		financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter_by(
				company_id=company_id
			).order_by(models.FinancialSummary.date.desc()).first()
		)
		return financial_summary
