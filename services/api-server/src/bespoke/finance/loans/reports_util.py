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

from sqlalchemy import or_, and_
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

def _compute_date_ranges_for_needs_recompute(
	start_date: datetime.date,
	end_date: datetime.date,
) -> List[Tuple[datetime.date, int]]:
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
	session: Session,
	company_ids: List[str], 
	cur_date: datetime.date, 
	days_to_compute_back: int, 
) -> Tuple[bool, errors.Error]:
	# Case 1: existing financial_summary.needs_recompute = False -> update is necessary
	# Case 2: existing financial_summary.needs_recompute = True -> update is necessary ONLY IF existing financial_summary.days_to_compute_back < days_to_compute_back
	# If neither of the above two cases is true, then we do not need to update the financial summary and thus we do not need to fetch it from the database.
	# financial_summaries = cast(
	# 	List[models.FinancialSummary],
	# 	session.query(models.FinancialSummary).filter(
	# 		models.FinancialSummary.company_id.in_(company_ids)
	# 	).filter(
	# 		models.FinancialSummary.date == cur_date
	# 	).filter(
	# 		 or_(
	# 			models.FinancialSummary.needs_recompute == False,
	# 			and_(
	# 				models.FinancialSummary.needs_recompute == True,
	# 				models.FinancialSummary.days_to_compute_back < days_to_compute_back
	# 			),
	# 		)
	# 	).all())

	financial_summaries = cast(
		List[models.FinancialSummary], 
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.company_id.in_(company_ids)
		).filter(
			models.FinancialSummary.date == cur_date
		).all())

	company_id_to_financial_summary = {}
	# add financial summaries by company id to a lookup
	for financial_summary in financial_summaries:
		company_id_to_financial_summary[str(financial_summary.company_id)] = financial_summary

	# if the company id is not in the lookup add a new blank financial summary
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
				total_outstanding_principal_past_due=decimal.Decimal(0.0),
				total_outstanding_interest=decimal.Decimal(0.0),
				total_outstanding_fees=decimal.Decimal(0.0),
				total_principal_in_requested_state=decimal.Decimal(0.0),
				available_limit=decimal.Decimal(0.0),
				interest_accrued_today=decimal.Decimal(0.0),
				late_fees_accrued_today=decimal.Decimal(0.0),
				minimum_monthly_payload={},
				account_level_balance_payload={},
			)
			session.add(financial_summary)

	for financial_summary in financial_summaries:
		if (
			not financial_summary.needs_recompute or
			(financial_summary.needs_recompute and financial_summary.days_to_compute_back < days_to_compute_back)
		):
			financial_summary.needs_recompute = True
			financial_summary.days_to_compute_back = days_to_compute_back

	return True, None

def set_companies_needs_recompute_by_date_range(
	session: Session,
	company_ids: List[str],
	start_date: datetime.date,
	end_date: datetime.date,
) -> Tuple[bool, errors.Error]:
	date_range_tuples = _compute_date_ranges_for_needs_recompute(
		start_date=start_date,
		end_date=end_date,
	)
	for date_range_tuple in date_range_tuples:
		start_date, days_to_compute_back = date_range_tuple
		success, err = set_needs_balance_recomputed(
			session=session,
			company_ids=company_ids,
			cur_date=start_date,
			days_to_compute_back=days_to_compute_back,
		)
		if err:
			return False, err
	return True, None

def _set_financial_summary_no_longer_needs_recompute(
	session: Session,
	company_id: str, 
	report_date: datetime.date, 
) -> None:

	financial_summary = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.company_id == company_id)
		.filter(
			models.FinancialSummary.date == report_date
		).first())
	if financial_summary:
		financial_summary.needs_recompute = False

def update_company_balance(
	session: Session,
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

	customer_balance = loan_balances.CustomerBalance(company, session)
	if update_days_back == None:
		update_days_back = 0
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
		_set_financial_summary_no_longer_needs_recompute(session, company['id'], report_date)
	
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
	
	_set_financial_summary_no_longer_needs_recompute(session, company['id'], report_date)
	
	# Internally we re-compute the most recent X days of previous loan balances
	# when an update happens to a customer, but in terms of this fucntion,
	# we only need to return the customer_update_dict for today because we use
	# it for debugging purposes. 
	return day_to_customer_update_dict, None

def delete_old_bank_financial_summaries(
	session: Session, 
	report_date: datetime.date
) -> None:
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
			total_outstanding_principal_past_due=decimal.Decimal(0.0),
			total_outstanding_interest=decimal.Decimal(0.0),
			total_outstanding_fees=decimal.Decimal(0.0),
			total_principal_in_requested_state=decimal.Decimal(0.0),
			interest_accrued_today=decimal.Decimal(0.0),
			late_fees_accrued_today=decimal.Decimal(0.0),
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
		cur_bank_summary.total_outstanding_principal_past_due += decimal.Decimal(summary.total_outstanding_principal_past_due or 0)
		cur_bank_summary.total_outstanding_interest += decimal.Decimal(summary.total_outstanding_interest or 0)
		cur_bank_summary.total_outstanding_fees += decimal.Decimal(summary.total_outstanding_fees or 0)
		cur_bank_summary.interest_accrued_today += decimal.Decimal(summary.interest_accrued_today or 0)
		cur_bank_summary.late_fees_accrued_today += decimal.Decimal(summary.late_fees_accrued_today or 0)
		cur_bank_summary.total_principal_in_requested_state += decimal.Decimal(summary.total_principal_in_requested_state or 0)
		cur_bank_summary.available_limit += decimal.Decimal(summary.available_limit or 0)

	for product_type, cur_bank_summary in product_type_to_bank_summary.items():
		cur_bank_summary.total_limit = number_util.round_currency_decimal(cur_bank_summary.total_limit)
		cur_bank_summary.adjusted_total_limit = number_util.round_currency_decimal(cur_bank_summary.adjusted_total_limit)
		cur_bank_summary.total_outstanding_principal = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_principal)
		cur_bank_summary.total_outstanding_principal_for_interest = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_principal_for_interest)
		cur_bank_summary.total_outstanding_principal_past_due = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_principal_past_due)
		cur_bank_summary.total_outstanding_interest = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_interest)
		cur_bank_summary.total_outstanding_fees = number_util.round_currency_decimal(cur_bank_summary.total_outstanding_fees)
		cur_bank_summary.total_principal_in_requested_state = number_util.round_currency_decimal(cur_bank_summary.total_principal_in_requested_state)
		cur_bank_summary.interest_accrued_today = number_util.round_currency_decimal(cur_bank_summary.interest_accrued_today)
		cur_bank_summary.late_fees_accrued_today = number_util.round_currency_decimal(cur_bank_summary.late_fees_accrued_today)
		cur_bank_summary.available_limit = number_util.round_currency_decimal(cur_bank_summary.available_limit)

	return product_type_to_bank_summary.values(), None


def compute_and_update_bank_financial_summaries(
	session: Session, 
	report_date: datetime.date
) -> errors.Error:
	new_bank_financial_summaries, err = compute_bank_financial_summaries(session, report_date)
	if err:
		return err

	existing_bank_summaries = cast(
		List[models.BankFinancialSummary],
		session.query(models.BankFinancialSummary).filter(
			models.BankFinancialSummary.date == report_date
		).all()
	)

	if existing_bank_summaries:
		# Order may differ between existing and new bank summaries
		# Map the product type string to the financial summaries so
		# that we can update correctly while iterating through the
		# existing bank financial summaries
		new_bank_summary_map: Dict[str, models.BankFinancialSummary] = {}
		for bank_summary in new_bank_financial_summaries:
			new_bank_summary_map[str(bank_summary.product_type)] = bank_summary

		# Now that the product types are mapped, update
		# the exsiting bank financial summaries with
		# the newly calculated amounts
		for existing_bank_summary in existing_bank_summaries:
			product_type = str(existing_bank_summary.product_type)
			new_bank_summary = new_bank_summary_map[product_type]

			existing_bank_summary.total_limit = new_bank_summary.total_limit
			existing_bank_summary.total_outstanding_principal = new_bank_summary.total_outstanding_principal
			existing_bank_summary.total_outstanding_principal_for_interest = new_bank_summary.total_outstanding_principal_for_interest
			existing_bank_summary.total_outstanding_principal_past_due = new_bank_summary.total_outstanding_principal_past_due
			existing_bank_summary.total_outstanding_interest = new_bank_summary.total_outstanding_interest
			existing_bank_summary.total_outstanding_fees = new_bank_summary.total_outstanding_fees
			existing_bank_summary.total_principal_in_requested_state = new_bank_summary.total_principal_in_requested_state
			existing_bank_summary.available_limit = new_bank_summary.available_limit
			existing_bank_summary.adjusted_total_limit = new_bank_summary.adjusted_total_limit
			existing_bank_summary.interest_accrued_today = new_bank_summary.interest_accrued_today
			existing_bank_summary.late_fees_accrued_today = new_bank_summary.late_fees_accrued_today
	else:
		for new_bank_summary in new_bank_financial_summaries:
			session.add(new_bank_summary)

	return None

def list_financial_summaries_that_need_balances_recomputed(
	session: Session,
	today: datetime.date, 
	amount_to_fetch: int
) -> List[ComputeSummaryRequest]:
	# Prioritize the financial summaries that calculate today's balances first
	financial_summaries = session.query(models.FinancialSummary).filter(
		models.FinancialSummary.needs_recompute == True
	).filter(
		models.FinancialSummary.date == today
	).order_by(
		models.FinancialSummary.updated_at.asc()
	).limit(amount_to_fetch).all()

	# creates a ComputeSummaryRequest from all the financial summaries
	summary_requests = []
	for fin_summary in financial_summaries:
		summary_requests.append(ComputeSummaryRequest(
			report_date=fin_summary.date,
			company_id=str(fin_summary.company_id),
			company=None,
			update_days_back=fin_summary.days_to_compute_back
		))

	# grabs more financial summaries if not enough work 
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

	# finds all the unique company ids from the financial summaries
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

	# for every summary request add the company.as_dict() information onto the ComputeSummaryRequest
	for req in summary_requests:
		if req['company_id'] in company_id_to_company:
			req['company'] = company_id_to_company[req['company_id']]
		else:
			raise errors.Error('Company {} did not have a company dict associated with it')

	return summary_requests


def list_financial_summaries_that_need_balances_recomputed_by_company(
	session: Session, 
	company_id: str,
	today: datetime.date, 
	amount_to_fetch: int
) -> List[ComputeSummaryRequest]:
	# this is very very similar to list_financial_summaries_that_need_balances_recomputed
	# right above, the only difference is less work is being done to check for company 
	# since we only have a singular company id
	financial_summaries = session.query(models.FinancialSummary).filter(
		models.FinancialSummary.needs_recompute == True
	).filter(
		models.FinancialSummary.date == today
	).filter(
		models.FinancialSummary.company_id == company_id
	).limit(amount_to_fetch).all()

	summary_requests = []
	for fin_summary in financial_summaries:
		summary_requests.append(ComputeSummaryRequest(
			report_date=fin_summary.date,
			company_id=str(fin_summary.company_id),
			company=None,
			update_days_back=fin_summary.days_to_compute_back
		))

	# get more summaries if needed that are further back to compute
	if len(summary_requests) < amount_to_fetch:
		more_financial_summaries = session.query(models.FinancialSummary).filter(
			models.FinancialSummary.needs_recompute == True
		).filter(
			models.FinancialSummary.date != today
		).filter(
			models.FinancialSummary.company_id == company_id
		).limit(amount_to_fetch - len(summary_requests)).all()

		for fin_summary in more_financial_summaries:
			summary_requests.append(ComputeSummaryRequest(
				report_date=fin_summary.date,
				company_id=str(fin_summary.company_id),
				company=None,
				update_days_back=fin_summary.days_to_compute_back
			))

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())

	if not company:
		raise errors.Error('Company not found in summary request')

	company_as_dict = company.as_dict()

	for req in summary_requests:
		req['company'] = company_as_dict

	return summary_requests
	
def remove_financial_summaries_that_no_longer_need_to_be_recomputed(
	session: Session, 
	company_id: str,
	compute_requests: List[ComputeSummaryRequest],
) -> List[ComputeSummaryRequest]:
	
	# grabs the most recent contract
	contract = session.query(models.Contract).filter(
		models.Contract.company_id == company_id
	).order_by(
		models.Contract.adjusted_end_date.desc()
	).first()


	removed_summaries_report_date = []
	active_compute_requests = []

	if contract == None:
		# there are no contracts (potentially a propsective or test company)
		# all report dates should be removed out of calculation
		removed_summaries_report_date = [req['report_date'] for req in compute_requests]
	else:

		terminated_contract_date = contract.adjusted_end_date
		for compute_request in compute_requests:
			if compute_request['report_date'] > terminated_contract_date:
				removed_summaries_report_date.append(compute_request['report_date'])
			else:
				active_compute_requests.append(compute_request)

	# switch the financial summaries after the contract ended to needs_recompute = false
	financial_summaries = session.query(
		models.FinancialSummary
	).filter(
		models.FinancialSummary.company_id == company_id
	).filter(
		models.FinancialSummary.date.in_(removed_summaries_report_date)
	).all()

	for summary in financial_summaries:
		summary.needs_recompute = False	
		summary.days_to_compute_back = 0

	return active_compute_requests

def run_customer_balances_for_financial_summaries_that_need_recompute(
	session: Session,
	compute_requests: List[ComputeSummaryRequest]
) -> Tuple[Set[datetime.date], List[str], errors.Error]:
	dates_updated = set([])

	descriptive_errors = []
	for compute_request in compute_requests:
		day_to_customer_update_dict, descriptive_error = update_company_balance(
			session, 
			compute_request['company'],
			compute_request['report_date'],
			update_days_back=compute_request['update_days_back'],
			include_debug_info=False,
			is_past_date_default_val=False
		)
		if descriptive_error:
			descriptive_errors.append(descriptive_error)

		if compute_request['update_days_back'] == None:
			compute_request['update_days_back'] = 0
		dates_updated.update(get_dates_updated(compute_request['report_date'], compute_request['update_days_back']))

	if len(descriptive_errors) == len(compute_requests) and len(compute_requests) != 0:
		return None, descriptive_errors, errors.Error('No companies balances could be computed successfully. Errors: {}'.format(
			descriptive_errors))

	return dates_updated, descriptive_errors, None 

def list_all_companies(
	session: Session,
) -> List[models.CompanyDict]:
	companies = session.query(models.Company).filter(
		cast(Callable, models.Company.is_customer.is_)(True)
	).order_by(
		models.Company.name.asc()
	).all()
	return [company.as_dict() for company in companies]

def _set_needs_balance_recomputed(
	session: Session,
	company_ids: List[str],
	cur_date: datetime.date,
	days_to_compute_back: int,
) -> Tuple[bool, errors.Error]:

	if not company_ids:
		raise errors.Error("Failed to find company_ids in set_needs_balance_recomputed")

	_, err = set_needs_balance_recomputed(
			session=session,
			company_ids=company_ids,
			cur_date=cur_date,
			days_to_compute_back=days_to_compute_back,
		)
	if err:
		logging.error(f"FAILED marking that company.needs_balance_recomputed for companies: '{company_ids}'")
		raise errors.Error("Failed setting {} companies as dirty".format(len(company_ids)))

	return True, None
