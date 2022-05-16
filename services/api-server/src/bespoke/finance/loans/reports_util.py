import datetime
import decimal
import logging
from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Set, Callable, Dict, Iterable, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import financial_summary_util, number_util, contract_util
from bespoke.finance.reports import loan_balances
from bespoke.finance.reports.loan_balances import CustomerUpdateDict
from sqlalchemy.orm.session import Session

DAYS_TO_COMPUTE_BACK = 14

ComputeSummaryRequest = TypedDict('ComputeSummaryRequest', {
	'company': models.CompanyDict,
	'company_id': str,
	'report_date': datetime.date,
	'update_days_back': int
})

def get_dates_updated(report_date: datetime.date, days_back: int) -> List[datetime.date]:
	"""
		Assuming you gave loan_balances.update the report_date and days_back parameter, which
		dates got updated? This fn returns that list.
	"""
	dates_updated = [report_date]

	for i in range(days_back):
		dates_updated.append(report_date - timedelta(days=i+1))

	return dates_updated

def date_ranges_for_needs_balance_recomputed(
	start_date: datetime.date, end_date: datetime.date) -> List[Tuple[datetime.date, int]]:
	"""
		Given the user wants customer balances run from start_date to end_date, produce the corresponding
		set of (report_date, days_to_compute_back) tuples to eventually send to the server
	"""
	
	cur_date = end_date
	step_back = DAYS_TO_COMPUTE_BACK

	date_tuples = []
	while cur_date - timedelta(days=step_back + 1) >= start_date:
		date_tuples.append((cur_date, DAYS_TO_COMPUTE_BACK))
		cur_date = cur_date - timedelta(days=step_back + 1)

	# Fill up the remaining days, which may be less than 14
	if cur_date >= start_date:
		date_tuples.append((cur_date, (cur_date - start_date).days))

	return date_tuples

def set_needs_balance_recomputed(
	company_ids: List[str], 
	cur_date: datetime.date, 
	create_if_missing: bool, 
	days_to_compute_back: int, 
	session: Session) -> Tuple[bool, errors.Error]:
	financial_summaries = cast(List[models.FinancialSummary], session.query(models.FinancialSummary).filter(
		models.FinancialSummary.company_id.in_(company_ids)).filter(
		models.FinancialSummary.date == cur_date
	).all())


	if create_if_missing:
		company_id_to_financial_summary = {}
		for financial_summary in financial_summaries:
			company_id_to_financial_summary[str(financial_summary.company_id)] = financial_summary

		for company_id in company_ids:
			if company_id not in company_id_to_financial_summary:
				# create an empty one
				financial_summary = models.FinancialSummary(
					date=cur_date,
					company_id=company_id,
					needs_recompute=True,
					days_to_compute_back=days_to_compute_back,
					total_limit=decimal.Decimal(0.0),
					adjusted_total_limit=decimal.Decimal(0.0),
					total_outstanding_principal=decimal.Decimal(0.0),
					total_outstanding_principal_for_interest=decimal.Decimal(0.0),
					total_outstanding_interest=decimal.Decimal(0.0),
					total_outstanding_fees=decimal.Decimal(0.0),
					total_principal_in_requested_state=decimal.Decimal(0.0),
					available_limit=decimal.Decimal(0.0),
					interest_accrued_today=decimal.Decimal(0.0),
					minimum_monthly_payload={},
					account_level_balance_payload={},
				)
				session.add(financial_summary)

	else:	
		if not financial_summaries:
			return None, errors.Error(
				"Failed to find any companys associated with company_ids {}".format(company_ids))

		if len(financial_summaries) != len(company_ids):
			return None, errors.Error('Failed to find all financial summaries associated with company_ids {} on {}'.format(company_ids, cur_date))

	for financial_summary in financial_summaries:
		financial_summary.needs_recompute = True
		financial_summary.days_to_compute_back = days_to_compute_back

	return True, None

def _set_financial_summary_no_longer_needs_recompute(company_id: str, report_date: datetime.date, session_maker: Callable) -> None:

	with session_scope(session_maker) as session:
		financial_summary = cast(
			models.FinancialSummary,
			session.query(models.FinancialSummary).filter(
				models.FinancialSummary.company_id == company_id)
			.filter(models.FinancialSummary.date == report_date).first())
		if financial_summary:
			financial_summary.needs_recompute = False

def update_company_balance(
	session_maker: Callable,
	company: models.CompanyDict,
	report_date: datetime.date,
	update_days_back: int,
	is_past_date_default_val: bool,
	include_debug_info: bool,
	today_for_test: datetime.date = None
) -> Tuple[Dict[datetime.date, CustomerUpdateDict], str]:
	"""
		is_past_date_default_val is set to True if in fact this update_company_balance
		is a date in the past. See /run_customer_balances to see how this value should be
		set to True on dates where the update is a previous date.
	"""
	logging.info(f"Calculating balance for '{company['name']}' with id: '{company['id']}' for report date '{report_date}, update_days_back={update_days_back}'")

	customer_balance = loan_balances.CustomerBalance(company, session_maker)

	day_to_customer_update_dict, err = customer_balance.update(
		start_date_for_storing_updates=report_date - timedelta(days=update_days_back),
		today=report_date,
		include_debug_info=include_debug_info,
		is_past_date_default_val=is_past_date_default_val
	)

	if err:
		msg = 'Error updating customer balance for company "{}". Error: {}'.format(
			company['name'], err
		)
		# Note, we set the finacial_summary needs_recompute to False because we attempted to
		# recompute it and just failed.
		_set_financial_summary_no_longer_needs_recompute(company['id'], report_date, session_maker)
	
		logging.error(msg)
		return None, msg

	days_to_update = list(day_to_customer_update_dict.keys())
	today = today_for_test
	if not today:
		today = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)

	for i in range(len(days_to_update)):
		cur_date = days_to_update[i]
		customer_update_dict = day_to_customer_update_dict[cur_date]

		if customer_update_dict is not None:
			event = events.new(
				company_id=company['id'],
				is_system=True,
				action=events.Actions.COMPANY_BALANCE_UPDATE,
				data={
					'report_date': date_util.date_to_str(cur_date),
					'loan_ids': [l['loan_id'] for l in customer_update_dict['loan_updates']],
				}
			)

			with session_scope(session_maker) as session:
				is_todays_update = today == cur_date
				success, err = customer_balance.write(customer_update_dict, is_todays_update)
				if err:
					msg = 'Error writing results to update customer balance. Error: {}'.format(err)
					logging.error(msg)
					event.set_failed().write_with_session(session)
					session.rollback()
					return None, msg
				event.set_succeeded().write_with_session(session)

			logging.debug(f"Successfully updated balance for '{company['name']}' with id '{company['id']}' for date '{cur_date}'")
		else:
			logging.debug(f"Skipping balance for '{company['name']}' with id '{company['id']}' for date '{cur_date}' because it could not be calculated")
	
	_set_financial_summary_no_longer_needs_recompute(company['id'], report_date, session_maker)
	
	# Internally we re-compute the most recent X days of previous loan balances
	# when an update happens to a customer, but in terms of this fucntion,
	# we only need to return the customer_update_dict for today because we use
	# it for debugging purposes. 
	return day_to_customer_update_dict, None


def delete_old_bank_financial_summaries(session: Session, report_date: datetime.date) -> None:
	"""Deletes the old bank summaries"""
	bank_summaries = cast(
		List[models.BankFinancialSummary],
		session.query(models.BankFinancialSummary).filter(
			models.BankFinancialSummary.date == report_date
		).all()
	)

	if bank_summaries:
		for bank_summary in bank_summaries:
			cast(Callable, session.delete)(bank_summary)

	# Call session.flush() here so subsequent insert does not
	# trigger duplicate key error for bank_financial_summaries.
	session.flush()

def compute_bank_financial_summaries(
	session: Session,
	report_date: datetime.date,
) -> Tuple[Iterable[models.BankFinancialSummary], errors.Error]:
	"""Given a session_maker and a report date, we grab the current financial statements
	and compute new bank financial statements across all of our product types. This function
	returns the list of bank financial summaries and an optional descriptive error.
	"""
	financial_summaries, err = financial_summary_util.get_financial_summary_for_all_customers(session, report_date)

	if err:
		return None, err

	if not financial_summaries:
		return None, errors.Error('No financial summaries registered in the DB') # Early Return

	company_ids = [str(summary.company_id) for summary in financial_summaries]

	companies = cast(
		List[models.Company],
		session.query(models.Company).filter(
			models.Company.id.in_(company_ids)
		).all())

	if not companies:
		return None, errors.Error('No companies registered in the DB') # Early Return

	if len(companies) != len(company_ids):
		return None, errors.Error('Not all companies found that have a financial summary') # Early Return

	contract_ids = []
	ignore_company_ids = set([])

	for company in companies:
		if not company.contract_id:
			logging.warn('[WARNING]: Company "{}" has no contract setup for it'.format(company.name))
			ignore_company_ids.add(str(company.id))
			continue

		contract_ids.append(str(company.contract_id))

	contracts = cast(
		List[models.Contract],
		contract_util.get_active_contracts_base_query(session).filter(
			models.Contract.id.in_(contract_ids)
		).all())

	all_settings = cast(List[models.CompanySettings], session.query(models.CompanySettings).all())
	for cur_settings in all_settings:
		if cur_settings.is_dummy_account:
			ignore_company_ids.add(str(cur_settings.company_id))

	if not contracts:
		return None, errors.Error('No contracts registered in the DB') # Early Return

	if len(contracts) != len(contract_ids):
		return None, errors.Error('Not all contracts found that have a financial summary') # Early Return

	company_id_to_product_type = {}
	for contract in contracts:
		company_id_to_product_type[str(contract.company_id)] = contract.product_type

	product_type_to_bank_summary = {}

	# We want a bank financial summary per product type even when there
	# are not any customers using a given product type
	for product_type in db_constants.PRODUCT_TYPES:
		product_type_to_bank_summary[product_type] = models.BankFinancialSummary(
			date=report_date,
			product_type=product_type,
			total_limit=decimal.Decimal(0.0),
			adjusted_total_limit=decimal.Decimal(0.0),
			total_outstanding_principal=decimal.Decimal(0.0),
			total_outstanding_principal_for_interest=decimal.Decimal(0.0),
			total_outstanding_interest=decimal.Decimal(0.0),
			total_outstanding_fees=decimal.Decimal(0.0),
			total_principal_in_requested_state=decimal.Decimal(0.0),
			interest_accrued_today=decimal.Decimal(0.0),
			available_limit=decimal.Decimal(0.0),
		)

	# Sum up all the financial summaries across customers
	for summary in financial_summaries:
		company_id = str(summary.company_id)
		if company_id in ignore_company_ids:
			continue
		product_type = company_id_to_product_type[company_id]
		cur_bank_summary = product_type_to_bank_summary[product_type]
		cur_bank_summary.total_limit += decimal.Decimal(summary.total_limit or 0)
		cur_bank_summary.adjusted_total_limit += decimal.Decimal(summary.adjusted_total_limit or 0)
		cur_bank_summary.total_outstanding_principal += decimal.Decimal(summary.total_outstanding_principal or 0)
		cur_bank_summary.total_outstanding_principal_for_interest += decimal.Decimal(summary.total_outstanding_principal_for_interest or 0)
		cur_bank_summary.total_outstanding_interest += decimal.Decimal(summary.total_outstanding_interest or 0)
		cur_bank_summary.total_outstanding_fees += decimal.Decimal(summary.total_outstanding_fees or 0)
		cur_bank_summary.interest_accrued_today += decimal.Decimal(summary.interest_accrued_today or 0)
		cur_bank_summary.total_principal_in_requested_state += decimal.Decimal(summary.total_principal_in_requested_state or 0)
		cur_bank_summary.available_limit += decimal.Decimal(summary.available_limit or 0)

	for product_type, cur_bank_summary in product_type_to_bank_summary.items():
		cur_bank_summary.total_limit = number_util.round_currency_decimal(cur_bank_summary.total_limit)
		cur_bank_summary.adjusted_total_limit = number_util.round_currency_decimal(cur_bank_summary.adjusted_total_limit)
		cur_bank_summary.total_outstanding_principal = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_principal)
		cur_bank_summary.total_outstanding_principal_for_interest = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_principal_for_interest)
		cur_bank_summary.total_outstanding_interest = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_interest)
		cur_bank_summary.total_outstanding_fees = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_fees)
		cur_bank_summary.total_principal_in_requested_state = number_util.round_currency_decimal(cur_bank_summary.total_principal_in_requested_state)
		cur_bank_summary.interest_accrued_today = number_util.round_currency_decimal(cur_bank_summary.interest_accrued_today)
		cur_bank_summary.available_limit = number_util.round_currency_decimal(cur_bank_summary.available_limit)


	return product_type_to_bank_summary.values(), None


def compute_and_update_bank_financial_summaries(session: Session, report_date: datetime.date) -> errors.Error:
	bank_financial_summaries, err = compute_bank_financial_summaries(session, report_date)
	if err:
		return err

	delete_old_bank_financial_summaries(session, report_date)

	for new_bank_summary in bank_financial_summaries:
		session.add(new_bank_summary)

	return None

def list_financial_summaries_that_need_balances_recomputed(session_maker: Callable, today: datetime.date, amount_to_fetch: int) -> List[ComputeSummaryRequest]:
	# Prioritize the financial summaries that calculate today's balances first

	with session_scope(session_maker) as session:
		financial_summaries = session.query(models.FinancialSummary).filter(
			models.FinancialSummary.needs_recompute == True
		).filter(models.FinancialSummary.date == today
		).limit(amount_to_fetch).all()

		summary_requests = []
		for fin_summary in financial_summaries:
			summary_requests.append(ComputeSummaryRequest(
				report_date=fin_summary.date,
				company_id=str(fin_summary.company_id),
				company=None,
				update_days_back=fin_summary.days_to_compute_back
			))

		if len(summary_requests) < amount_to_fetch:
			more_financial_summaries = session.query(models.FinancialSummary).filter(
				models.FinancialSummary.needs_recompute == True
			).filter(models.FinancialSummary.date != today
			).limit(amount_to_fetch - len(summary_requests)).all()

			for fin_summary in more_financial_summaries:
				summary_requests.append(ComputeSummaryRequest(
					report_date=fin_summary.date,
					company_id=str(fin_summary.company_id),
					company=None,
					update_days_back=fin_summary.days_to_compute_back
				))

		company_ids = set([req['company_id'] for req in summary_requests])
		companies = cast(
			List[models.Company],
			session.query(models.Company).filter(
				models.Company.id.in_(company_ids)
			).all())

		if len(companies) != len(company_ids):
			raise errors.Error('Not all companies fetched match the company ids in the summary request')

		company_id_to_company = {}
		for company in companies:
			company_id_to_company[str(company.id)] = company.as_dict()

		for req in summary_requests:
			if req['company_id'] in company_id_to_company:
				req['company'] = company_id_to_company[req['company_id']]
			else:
				raise errors.Error('Company {} did not have a company dict associated with it')

	return summary_requests

def run_customer_balances_for_financial_summaries_that_need_recompute(
	session_maker: Callable, compute_requests: List[ComputeSummaryRequest]) -> Tuple[Set[datetime.date], List[str], errors.Error]:

	dates_updated = set([])

	descriptive_errors = []
	for req in compute_requests:
		day_to_customer_update_dict, descriptive_error = update_company_balance(
			session_maker, 
			req['company'], 
			req['report_date'],
			update_days_back=req['update_days_back'],
			include_debug_info=False,
			is_past_date_default_val=False
		)
		if descriptive_error:
			descriptive_errors.append(descriptive_error)

		dates_updated.update(get_dates_updated(req['report_date'], req['update_days_back']))

	if len(descriptive_errors) == len(compute_requests):
		return None, descriptive_errors, errors.Error('No companies balances could be computed successfully. Errors: {}'.format(
			descriptive_errors))

	return dates_updated, descriptive_errors, None 


def list_all_companies(session_maker: Callable) -> List[models.CompanyDict]:
	with session_scope(session_maker) as session:
		companies = session.query(models.Company).filter(
			cast(Callable, models.Company.is_customer.is_)(True)
		).order_by(
			models.Company.name.asc()
		).all()
		return [company.as_dict() for company in companies]
