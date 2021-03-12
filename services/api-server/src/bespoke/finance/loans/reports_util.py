import datetime
import decimal
import logging
from typing import Callable, Iterable, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance import financial_summary_util
from bespoke.finance.reports import loan_balances
from sqlalchemy.orm.session import Session

CompanyBalanceComputeResult = Tuple[List[str], errors.Error]


def update_company_balance(
	session_maker: Callable,
	company: models.CompanyDict,
	report_date: datetime.date,
	includes_future_transactions: bool
) -> Optional[str]:
	logging.info(f"Updating balance for '{company['name']}' with id: '{company['id']}'")

	customer_balance = loan_balances.CustomerBalance(company, session_maker)
	customer_update_dict, err = customer_balance.update(
		today=report_date, includes_future_transactions=includes_future_transactions)
	if err:
		msg = 'Error updating customer balance for company "{}". Error: {}'.format(
			company['name'], err
		)
		logging.error(msg)
		return msg

	success, err = customer_balance.write(customer_update_dict)
	if err:
		msg = 'Error writing results to update customer balance. Error: {}'.format(err)
		logging.error(msg)
		return msg

	logging.info(f"Successfully updated balance for '{company['name']}' with id '{company['id']}' for date '{report_date}'")
	return None


def delete_old_bank_financial_summaries(session: Session, report_date: datetime.date) -> None:
	"""Deletes the old bank summaries"""
	bank_summaries = cast(
		List[models.BankFinancialSummary],
		session.query(models.BankFinancialSummary).filter(
			models.BankFinancialSummary.date == report_date.isoformat()
		).all()
	)

	if bank_summaries:
		for bank_summary in bank_summaries:
			cast(Callable, session.delete)(bank_summary)


def compute_bank_financial_summaries(session: Session,
	report_date: datetime.date) -> Tuple[Iterable[models.BankFinancialSummary], errors.Error]:
	"""Given a session_maker and a report date, we grab the current financial statements
	and compute new bank financial statements across all of our product types. This function
	returns the list of bank financial summaries and an optional descriptive error.
	"""
	financial_summaries, err = financial_summary_util.get_latest_financial_summary_for_all_customers(session)

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

	contract_ids = [str(company.contract_id) for company in companies]

	contracts = cast(
		List[models.Contract],
		session.query(models.Contract).filter(
			models.Contract.id.in_(contract_ids)
		).all())

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
				available_limit=decimal.Decimal(0.0)
			)

	# Sum up all the financial summaries across customers
	for summary in financial_summaries:
		product_type = company_id_to_product_type[str(summary.company_id)]
		cur_bank_summary = product_type_to_bank_summary[product_type]
		cur_bank_summary.total_limit += decimal.Decimal(summary.total_limit or 0)
		cur_bank_summary.adjusted_total_limit += decimal.Decimal(summary.adjusted_total_limit or 0)
		cur_bank_summary.total_outstanding_principal += decimal.Decimal(summary.total_outstanding_principal or 0)
		cur_bank_summary.total_outstanding_principal_for_interest += decimal.Decimal(summary.total_outstanding_principal_for_interest or 0)
		cur_bank_summary.total_outstanding_interest += decimal.Decimal(summary.total_outstanding_interest or 0)
		cur_bank_summary.total_outstanding_fees += decimal.Decimal(summary.total_outstanding_fees or 0)
		cur_bank_summary.total_principal_in_requested_state += decimal.Decimal(summary.total_principal_in_requested_state or 0)
		cur_bank_summary.available_limit += decimal.Decimal(summary.available_limit or 0)

	return product_type_to_bank_summary.values(), None


def compute_and_update_bank_financial_summaries(session: Session, report_date: datetime.date) -> errors.Error:
	bank_financial_summaries, err = compute_bank_financial_summaries(session, report_date)
	if err:
		return err

	delete_old_bank_financial_summaries(session, report_date)

	for new_bank_summary in bank_financial_summaries:
		session.add(new_bank_summary)

	return None


def run_customer_balances_for_companies(
	session_maker: Callable,
	companies: List[models.CompanyDict],
	report_date: datetime.date,
	includes_future_transactions: bool,
	) -> CompanyBalanceComputeResult:
	"""Given a session_maker, a list of companies, and a report date, this function
	updates the balance for each of the given companies. It then updates the
	financial summary for the bank itself, deleting old financial summaries as
	needed. It returns two sorts of errors: The first return value is a list of
	descriptive errors that we do not consider a 'failure'. The second return value
	is an optional fatal error."""
	logging.info('There are {} companies for whom we are updating balances'.format(len(companies)))
	errors_list: List[str] = []

	if not len(companies):
		return errors_list, None

	for company in companies:
		descriptive_error = update_company_balance(
			session_maker, company, report_date, includes_future_transactions)
		if descriptive_error:
			errors_list.append(descriptive_error)

	with session_scope(session_maker) as session:
		fatal_error = compute_and_update_bank_financial_summaries(session, report_date)
		if fatal_error:
			return errors_list, fatal_error

	if len(errors_list) == len(companies):
		return errors_list, errors.Error('No companies balances could be computed successfully. Errors: {}'.format(
			errors_list))

	return errors_list, None


def list_companies_that_need_balances_recomputed(session_maker: Callable) -> List[models.CompanyDict]:
	with session_scope(session_maker) as session:
		return [company.as_dict() \
			for company in session.query(models.Company).filter(models.Company.needs_balance_recomputed).all()]


def run_customer_balances_for_companies_that_need_recompute(
    session_maker: Callable, report_date: datetime.date, includes_future_transactions: bool) -> CompanyBalanceComputeResult:
    companies = list_companies_that_need_balances_recomputed(session_maker)
    return run_customer_balances_for_companies(session_maker, companies, report_date, includes_future_transactions)


def list_all_companies(session_maker: Callable) -> List[models.CompanyDict]:
	with session_scope(session_maker) as session:
		return [company.as_dict() \
			for company in session.query(models.Company).all()]

def run_customer_balances_for_all_companies(
	session_maker: Callable, report_date: datetime.date, includes_future_transactions: bool) -> CompanyBalanceComputeResult:
	companies = list_companies_that_need_balances_recomputed(session_maker)
	return run_customer_balances_for_companies(session_maker, companies, report_date, includes_future_transactions)
