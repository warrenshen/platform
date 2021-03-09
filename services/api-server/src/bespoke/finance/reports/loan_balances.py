"""
  This file handles calculating a customer's balances for all the loans
  that they have, and their account level fees.
"""

"""
  Inputs:
	Contract:
	Repayments:

	Advances:
	Late Fees:

	Balances:
	Billing reports:
"""
import datetime
import decimal
import logging
from datetime import timedelta
from typing import Callable, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import LoanStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, number_util
from bespoke.finance.fetchers import per_customer_fetcher
from bespoke.finance.loans import loan_calculator
from bespoke.finance.loans.loan_calculator import LoanUpdateDict
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from mypy_extensions import TypedDict

SummaryUpdateDict = TypedDict('SummaryUpdateDict', {
	'product_type': str,
	'total_limit': float,
	'adjusted_total_limit': float,
	'total_outstanding_principal': float,
	'total_outstanding_interest': float,
	'total_outstanding_fees': float,
	'total_principal_in_requested_state': float,
	'available_limit': float,
})

EbbaApplicationUpdateDict = TypedDict('EbbaApplicationUpdateDict', {
	'id': str,
	'calculated_borrowing_base': float,
})

CustomerUpdateDict = TypedDict('CustomerUpdateDict', {
	'loan_updates': List[LoanUpdateDict],
	'active_ebba_application_update': EbbaApplicationUpdateDict,
	'summary_update': SummaryUpdateDict
})


def _get_active_ebba_application_update(
	contract_helper: contract_util.ContractHelper,
	ebba_application: models.EbbaApplicationDict,
	today: datetime.date) -> Tuple[EbbaApplicationUpdateDict, errors.Error]:

	cur_contract, err = contract_helper.get_contract(today)
	if err:
		return None, err

	product_type, err = cur_contract.get_product_type()
	if err:
		return None, err

	# If we're not working with a LINE_OF_CREDIT contract, we just return None
	# for the update dict without an error
	if product_type != ProductType.LINE_OF_CREDIT:
		return None, None

	cur_contract, err = cur_contract.for_product_type()
	if err:
		return None, err

	cur_contract = cast(contract_util.LOCContract, cur_contract)

	# If we don't have an active borrowing base, something is wrong
	if not ebba_application:
		err = errors.Error(
			f"Attempt to compute a new borrowing base for LINE_OF_CREDIT contract without an active borrowing base '{cur_contract.contract_id}'")
		logging.error(str(err))
		return None, err

	calculated_borrowing_base, err = cur_contract.compute_borrowing_base(ebba_application)
	if err:
		logging.error(
			f"Failed computing borrowing base for contract '{cur_contract.contract_id}' and ebba application '{ebba_application['id']}'")
		return None, err

	return EbbaApplicationUpdateDict(
		id=ebba_application['id'],
		calculated_borrowing_base=calculated_borrowing_base,
	), None


def _get_summary_update(
	contract_helper: contract_util.ContractHelper,
	loan_updates: List[LoanUpdateDict],
	active_ebba_application_update: EbbaApplicationUpdateDict,
	today: datetime.date
	) -> Tuple[SummaryUpdateDict, errors.Error]:
	cur_contract, err = contract_helper.get_contract(today)
	if err:
		return None, err

	product_type, err = cur_contract.get_product_type()
	if err:
		return None, err

	maximum_principal_limit, err = cur_contract.get_maximum_principal_limit()
	if err:
		return None, err

	adjusted_total_limit = maximum_principal_limit

	# The adjusted_total_limit for line of credit contracts uses the borrowing
	# base as its adjusted_total_limit
	if product_type == ProductType.LINE_OF_CREDIT:
		if active_ebba_application_update:
			adjusted_total_limit = active_ebba_application_update['calculated_borrowing_base']
		else:
			adjusted_total_limit = 0.0

	total_outstanding_principal = 0.0
	total_outstanding_interest = 0.0
	total_outstanding_fees = 0.0

	for l in loan_updates:
		total_outstanding_principal += l['outstanding_principal']
		total_outstanding_interest += l['outstanding_interest']
		total_outstanding_fees += l['outstanding_fees']

	return SummaryUpdateDict(
		product_type=product_type,
		total_limit=maximum_principal_limit,
		adjusted_total_limit=adjusted_total_limit,
		total_outstanding_principal=total_outstanding_principal,
		total_outstanding_interest=total_outstanding_interest,
		total_outstanding_fees=total_outstanding_fees,
		total_principal_in_requested_state=0.0,
		available_limit=max(0.0, maximum_principal_limit-total_outstanding_principal),
	), None

class CustomerBalance(object):
	"""
		Object to help us calculate what the customer's balance should be.
	"""

	def __init__(self, company_dict: models.CompanyDict, session_maker: Callable) -> None:
		self._session_maker = session_maker
		self._company_name = company_dict['name']
		self._company_id = company_dict['id']

	def update(self, today: datetime.date) -> Tuple[CustomerUpdateDict, errors.Error]:
		# Get your contracts and loans
		fetcher = per_customer_fetcher.Fetcher(per_customer_types.CompanyInfoDict(
			id=self._company_id,
			name=self._company_name
		), self._session_maker)
		_, err = fetcher.fetch()
		if err:
			return None, err

		customer_info = fetcher.get_financials()
		financials = customer_info['financials']
		num_loans = len(financials['loans'])

		# TODO(dlluncor): Handle account-level fees
		contract_helper, err = contract_util.ContractHelper.build(
			self._company_id, financials['contracts'])
		if err:
			return None, err

		all_errors = []
		loan_update_dicts = []
		total_principal_in_requested_state = 0.0

		for loan in financials['loans']:
			transactions_for_loan = loan_calculator.get_transactions_for_loan(loan['id'], financials['transactions'])

			if loan['status'] == LoanStatusEnum.APPROVAL_REQUESTED:
				total_principal_in_requested_state += loan['amount']

			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			calculator = loan_calculator.LoanCalculator(contract_helper)
			loan_update_dict, errors = calculator.calculate_loan_balance(loan, transactions_for_loan, today)
			if errors:
				logging.error('Got these errors associated with loan {}'.format(loan['id']))
				for err in errors:
					logging.error(err.msg)

				all_errors.extend(errors)
			else:
				loan_update_dicts.append(loan_update_dict)

		if all_errors:
			raise Exception('Will not proceed with updates because there was more than 1 error during loan balance updating')


		ebba_application_update, err = _get_active_ebba_application_update(
			contract_helper,
			financials.get('active_ebba_application'),
			today)
		if err:
			return None, err

		summary_update, err = _get_summary_update(contract_helper,
			loan_update_dicts,
			ebba_application_update,
			today)
		if err:
			return None, err

		summary_update['total_principal_in_requested_state'] = total_principal_in_requested_state

		return CustomerUpdateDict(
			loan_updates=loan_update_dicts,
			active_ebba_application_update=ebba_application_update,
			summary_update=summary_update,
		), None

	def write(self, customer_update: CustomerUpdateDict) -> Tuple[bool, errors.Error]:
		loan_ids = []
		loan_id_to_update = {}
		for loan_update in customer_update['loan_updates']:
			loan_id = loan_update['loan_id']
			loan_id_to_update[loan_id] = loan_update
			loan_ids.append(loan_id)

		err_details = {
			'customer_name': self._company_name,
			'method': 'CustomerBalance.write'
		}

		with session_scope(self._session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			if not loans:
				loans = []

			for loan in loans:
				cur_loan_update = loan_id_to_update[str(loan.id)]
				loan.outstanding_principal_balance = decimal.Decimal(cur_loan_update['outstanding_principal'])
				loan.outstanding_interest = decimal.Decimal(cur_loan_update['outstanding_interest'])
				loan.outstanding_fees = decimal.Decimal(cur_loan_update['outstanding_fees'])

			financial_summary = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == self._company_id).first())

			should_add_summary = not financial_summary
			if should_add_summary:
				financial_summary = models.FinancialSummary(
					company_id=self._company_id
				)

			summary_update = customer_update['summary_update']

			financial_summary.total_limit = decimal.Decimal(summary_update['total_limit'])
			financial_summary.adjusted_total_limit = decimal.Decimal(summary_update['adjusted_total_limit'])
			financial_summary.total_outstanding_principal = decimal.Decimal(summary_update['total_outstanding_principal'])
			financial_summary.total_outstanding_interest = decimal.Decimal(summary_update['total_outstanding_interest'])
			financial_summary.total_outstanding_fees = decimal.Decimal(summary_update['total_outstanding_fees'])
			financial_summary.total_principal_in_requested_state = decimal.Decimal(summary_update['total_principal_in_requested_state'])
			financial_summary.available_limit = decimal.Decimal(summary_update['available_limit'])

			if should_add_summary:
				session.add(financial_summary)

			# Update the active ebba application's calculated borrowing base to
			# reflect the value as a product of the current contract. These are
			# first computed in the UI and stored on the server. However, if the
			# contract changes, then the calculated value we've stored may no
			# longer reflect the terms of the company's contract.
			active_ebba_application_update = customer_update.get('active_ebba_application_update')
			if active_ebba_application_update:
				app = session.query(models.EbbaApplication).get(active_ebba_application_update['id'])
				app.calculated_borrowing_base = decimal.Decimal(active_ebba_application_update['calculated_borrowing_base'])

			# The balance was updated so we no longer need to "recompute" it
			company = session.query(models.Company).get(self._company_id)
			company.needs_balance_recomputed = False

			return True, None

