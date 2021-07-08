import calendar
import datetime
import logging

from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Tuple, List, Dict, cast
from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, db_constants
from bespoke.db.models import FeeDict
from bespoke.db.db_constants import MinimumAmountDuration, TransactionSubType
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util, repayment_util
from bespoke.finance.types import payment_types

MonthEndPerCompanyRespInfo = TypedDict('MonthEndPerCompanyRespInfo', {
	'fee_info': models.FeeDict,
	'fee_amount': float,
	'total_outstanding_interest': float,
	'company': models.CompanyDict
})

AllMonthlyDueRespDict = TypedDict('AllMonthlyDueRespDict', {
	'company_due_to_financial_info': Dict[str, MonthEndPerCompanyRespInfo]
})

PerCompanyRespInfo = TypedDict('PerCompanyRespInfo', {
	'fee_info': models.FeeDict,
	'company': models.CompanyDict
})

AllMonthlyMinimumDueRespDict = TypedDict('AllMonthlyMinimumDueRespDict', {
	'company_due_to_financial_info': Dict[str, PerCompanyRespInfo]
})

def _get_first_day_of_month_date(date_str: str) -> datetime.date:
	# Find the last date of this month
	chosen_date = date_util.load_date_str(date_str)
	return datetime.date(chosen_date.year, chosen_date.month, 1)

def _get_last_day_of_month_date(date_str: str) -> datetime.date:
	# Find the last date of this month
	chosen_date = date_util.load_date_str(date_str)
	last_day_of_month = calendar.monthrange(chosen_date.year, chosen_date.month)[1]
	return datetime.date(chosen_date.year, chosen_date.month, last_day_of_month)

def _is_in_same_month(d1: datetime.date, d2: datetime.date) -> bool:
	return d1.year == d2.year and d1.month == d2.month

def _should_pay_this_month(fee_payload: models.FeeDict, cur_date: datetime.date) -> bool:
	if 'prorated_info' not in fee_payload or fee_payload['prorated_info'] is None:
		return False

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

def get_all_minimum_interest_fees_due(
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

	company_id_to_financial_info = {}

	for financial_summary in financial_summaries:
		cur_company_id = str(financial_summary.company_id)
		company_dict = company_id_to_dict[cur_company_id]

		if not financial_summary.minimum_monthly_payload:
			continue

		minimum_monthly_payload = cast(models.FeeDict, financial_summary.minimum_monthly_payload)

		if not _should_pay_this_month(minimum_monthly_payload, last_day_of_month_date):
			continue

		if number_util.is_currency_zero(minimum_monthly_payload['amount_short']):
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


def get_all_month_end_payments(
	date_str: str, session: Session) -> Tuple[AllMonthlyDueRespDict, errors.Error]:

	first_day_of_month_date = _get_first_day_of_month_date(date_str)
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

	financial_summaries_begin_of_month = cast(
		List[models.FinancialSummary],
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == first_day_of_month_date
		).filter(
			models.FinancialSummary.product_type == db_constants.ProductType.LINE_OF_CREDIT
		).all())

	if not financial_summaries_begin_of_month:
		return None, errors.Error('No financial summaries found at the beginning of month for date {}'.format(
			date_util.date_to_str(first_day_of_month_date)))

	loc_companies_at_beginning_of_month = {}
	for fin_summary in financial_summaries_begin_of_month:
		loc_companies_at_beginning_of_month[str(fin_summary.company_id)] = True

	company_id_to_financial_info = {}

	for financial_summary in financial_summaries:
		cur_company_id = str(financial_summary.company_id)
		company_dict = company_id_to_dict[cur_company_id]

		if not financial_summary.minimum_monthly_payload:
			continue

		is_loc_customer = financial_summary.product_type == db_constants.ProductType.LINE_OF_CREDIT

		if is_loc_customer and (cur_company_id not in loc_companies_at_beginning_of_month):
			logging.info('Skipping company {} from an LOC reverse draft ACH because they werent an LOC customer at the beginning of the month'.format(
				company_dict['name']))
			continue

		minimum_monthly_payload = cast(models.FeeDict, financial_summary.minimum_monthly_payload)

		fee_amount = float(financial_summary.total_outstanding_interest) if is_loc_customer else 0.0
		has_minimum_interest = not number_util.is_currency_zero(minimum_monthly_payload['amount_short'])

		if _should_pay_this_month(
			minimum_monthly_payload, last_day_of_month_date) and has_minimum_interest:
			fee_amount += minimum_monthly_payload['amount_short']

		if number_util.is_currency_zero(fee_amount):
			continue

		company_id_to_financial_info[cur_company_id] = MonthEndPerCompanyRespInfo(
			fee_info=minimum_monthly_payload,
			total_outstanding_interest=float(financial_summary.total_outstanding_interest),
			fee_amount=fee_amount,
			company=company_id_to_dict[cur_company_id]
		)

	return AllMonthlyDueRespDict(
		company_due_to_financial_info=company_id_to_financial_info
	), None

def create_month_end_payments_for_customers(
	date_str: str, minimum_due_resp: AllMonthlyDueRespDict,
	user_id: str, session: Session) -> Tuple[bool, errors.Error]:

	if not minimum_due_resp['company_due_to_financial_info']:
		return None, errors.Error('No companies provided to book minimum due fees')

	requested_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

	for customer_id, val_info in minimum_due_resp['company_due_to_financial_info'].items():
		fee_dict = val_info['fee_info']
		amount_due = fee_dict['amount_short']

		customer = cast(
			models.Company,
			session.query(models.Company).get(customer_id))

		if not customer.company_settings_id:
			return None, errors.Error(f'[DATA ERROR] Company {customer_id} is missing company settings id')

		company_settings = cast(
			models.CompanySettings,
			session.query(models.CompanySettings).get(str(customer.company_settings_id)))

		if not company_settings.collections_bank_account_id:
			return None, errors.Error(f'Company {customer.name} does not have bank account to reverse payments from configured')

		_, err = repayment_util.create_repayment(
			company_id=customer_id,
			payment_insert_input=payment_types.PaymentInsertInputDict(
				company_id=customer_id,
				type=None,
				requested_amount=val_info['fee_amount'],
				amount=None,
				method=db_constants.PaymentMethodEnum.REVERSE_DRAFT_ACH,
				requested_payment_date=date_util.date_to_str(requested_date),
				payment_date=None,
				settlement_date=None,
				company_bank_account_id=str(company_settings.collections_bank_account_id),
				items_covered=dict(
					requested_to_principal=0.0,
					requested_to_interest=val_info['total_outstanding_interest'],
					requested_to_account_fees=amount_due
				),
				customer_note='',
				bank_note=''
			),
			user_id=user_id,
			session=session,
			is_line_of_credit=True,
			bank_admin_override_for_ach_cutoff=True
		)
		if err:
			raise err

	return True, None
