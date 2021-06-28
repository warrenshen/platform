import calendar
import datetime

from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Tuple, List, Dict, cast
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import FeeDict
from bespoke.db.db_constants import MinimumAmountDuration, TransactionSubType
from bespoke.finance.payments import payment_util

PerCompanyRespInfo = TypedDict('PerCompanyRespInfo', {
	'fee_info': models.FeeDict,
	'company': models.CompanyDict
})

AllMonthlyMinimumDueRespDict = TypedDict('AllMonthlyMinimumDueRespDict', {
	'company_due_to_financial_info': Dict[str, PerCompanyRespInfo]
})

def _get_last_day_of_month_date(date_str: str) -> datetime.date:
	# Find the last date of this month
	chosen_date = date_util.load_date_str(date_str)
	last_day_of_month = calendar.monthrange(chosen_date.year, chosen_date.month)[1]
	return datetime.datetime(chosen_date.year, chosen_date.month, last_day_of_month)

def _is_in_same_month(d1: datetime.date, d2: datetime.date) -> bool:
	return d1.year == d2.year and d1.month == d2.month

def _should_pay_this_month(fee_payload: models.FeeDict, cur_date: datetime.date) -> bool:
	day_to_pay = fee_payload['prorated_info']['day_to_pay']
	date_to_pay = date_util.load_date_str(day_to_pay)

	if fee_payload['duration'] == MinimumAmountDuration.MONTHLY:
		return cur_date == date_to_pay
	elif fee_payload['duration'] == MinimumAmountDuration.QUARTERLY:
		return cur_date == date_to_pay
	elif fee_payload['duration'] == MinimumAmountDuration.ANNUALLY:
		return _is_in_same_month(cur_date, date_to_pay)
	else:
		raise errors.Error('Unrecognized fee payload duration "{}"'.format(fee_payload['duration']))

def get_all_monthly_minimum_fees_due(
	date_str: str, session: Session) -> Tuple[AllMonthlyMinimumDueRespDict, errors.Error]:
	
	last_day_of_month_date = _get_last_day_of_month_date(date_str)

	companies = cast(
		List[models.Company],
		session.query(models.Company).all())
	company_id_to_dict = {}
	for company in companies:
		company_id_to_dict[str(company.id)] = company.as_dict()

	financial_summaries = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == last_day_of_month_date
		).all())

	if not financial_summaries:
		return None, errors.Error('No financial summaries found for date {}'.format(
			date_util.date_to_str(last_day_of_month_date)))

	#missing_company_names: List[str] = []
	company_id_to_financial_info = {}

	for financial_summary in financial_summaries:
		cur_company_id = str(financial_summary.company_id)

		if not financial_summary.minimum_monthly_payload:
			continue

		minimum_monthly_payload = cast(models.FeeDict, financial_summary.minimum_monthly_payload)
		#companies_with_financial_info[cur_company_id] = True

		if not _should_pay_this_month(minimum_monthly_payload, last_day_of_month_date):
			continue

		company_id_to_financial_info[cur_company_id] = PerCompanyRespInfo(
			fee_info=minimum_monthly_payload,
			company=company_id_to_dict[cur_company_id]
		)

	return AllMonthlyMinimumDueRespDict(
		company_due_to_financial_info=company_id_to_financial_info
	), None

def create_minimum_due_fee_for_customers(
	date_str: str, minimum_due_resp: AllMonthlyMinimumDueRespDict,
	user_id: str, session: Session) -> Tuple[bool, errors.Error]:

	if not minimum_due_resp['company_due_to_financial_info']:
		return None, errors.Error('No companies provided to book minimum due fees')

	effective_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	for customer_id, val_info in minimum_due_resp['company_due_to_financial_info'].items():
		fee_dict = val_info['fee_info']
		amount_due = fee_dict['amount_short']
		_ = payment_util.create_and_add_account_level_fee(
			company_id=customer_id,
			subtype=TransactionSubType.MINIMUM_INTEREST_FEE,
			amount=amount_due,
			originating_payment_id=None,
			created_by_user_id=user_id,
			deposit_date=effective_date,
			effective_date=effective_date,
			session=session,
		)

	return True, None

	
