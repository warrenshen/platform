import datetime
from typing import Callable, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from sqlalchemy.orm.session import Session

def _get_today(now_for_test: datetime.datetime) -> datetime.date:
	return now_for_test.date() if now_for_test else date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

def _get_summary_date_or_most_recent_date(session: Session, report_date: datetime.date) -> datetime.date:
	report_date_financial_summary = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary)
			.filter(models.FinancialSummary.date == report_date)
			.first()
		)
	if report_date_financial_summary:
		return report_date

	most_recent_financial_summary = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary)
			.filter(models.FinancialSummary.date != None)
			.filter(cast(Callable, models.FinancialSummary.product_type.isnot)(None)) # Dont select summaries that dont have data filled in yet
			.order_by(models.FinancialSummary.date.desc())
			.first()
		)

	if not most_recent_financial_summary:
		return None

	return most_recent_financial_summary.date

def get_financial_summary_for_all_customers(
	session: Session,
	report_date: datetime.date,
) -> Tuple[List[models.FinancialSummary], errors.Error]:
		latest_date = _get_summary_date_or_most_recent_date(session, report_date)
		if not latest_date:
			return None, errors.Error('No financial summary found that has a date populated')

		financial_summaries = cast(
			List[models.FinancialSummary],
			session.query(models.FinancialSummary).filter(models.FinancialSummary.date == latest_date.isoformat()).all()
		)

		return financial_summaries, None

def get_latest_financial_summary(company_id: str, session: Session, now_for_test: datetime.datetime = None) -> models.FinancialSummary:
		today = _get_today(now_for_test)

		todays_financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter_by(
				company_id=company_id
			).filter(models.FinancialSummary.date == today).first()
		)
		if todays_financial_summary:
			return todays_financial_summary

		latest_financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter_by(
				company_id=company_id
			).filter(
				cast(Callable, models.FinancialSummary.product_type.isnot)(None) # Dont select summaries that dont have data filled in yet
			).order_by(models.FinancialSummary.date.desc()).first()
		)
		return latest_financial_summary
