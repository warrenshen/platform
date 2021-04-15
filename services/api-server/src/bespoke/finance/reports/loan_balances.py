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
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import LoanStatusEnum, ProductType
from bespoke.db.models import session_scope
from bespoke.finance import contract_util, number_util
from bespoke.finance.fetchers import per_customer_fetcher
from bespoke.finance.loans import loan_calculator
from bespoke.finance.loans.loan_calculator import LoanUpdateDict
from bespoke.finance.payments import payment_util
from bespoke.finance.types import finance_types, per_customer_types
from mypy_extensions import TypedDict

FeeDict = TypedDict('FeeDict', {
	'amount_accrued': float, # how much has accrued in fees for the time period
	'minimum_amount': float, # the minimum you must pay in a time period
	'amount_short': float, # how much you owe for a time period because of the minimum_due
	'duration': str # Over what duration is this fee owed
})

AccountBalanceDict = TypedDict('AccountBalanceDict', {
	'fees_total': float,
	'credits_total': float
})

SummaryUpdateDict = TypedDict('SummaryUpdateDict', {
	'product_type': str,
	'total_limit': float,
	'adjusted_total_limit': float,
	'total_outstanding_principal': float,
	'total_outstanding_principal_for_interest': float,
	'total_outstanding_interest': float,
	'total_outstanding_fees': float,
	'total_principal_in_requested_state': float,
	'total_interest_accrued_today': float,
	'available_limit': float,
	'minimum_monthly_payload': FeeDict,
	'account_level_balance_payload': AccountBalanceDict,
	'day_volume_threshold_met': datetime.date
})

EbbaApplicationUpdateDict = TypedDict('EbbaApplicationUpdateDict', {
	'id': str,
	'calculated_borrowing_base': float,
})

CustomerUpdateDict = TypedDict('CustomerUpdateDict', {
	'today': datetime.date,
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
		calculated_borrowing_base=number_util.round_currency(calculated_borrowing_base),
	), None

def _get_cur_minimum_fees(contract_helper: contract_util.ContractHelper, today: datetime.date, fee_accumulator: loan_calculator.FeeAccumulator) -> Tuple[FeeDict, errors.Error]:
	cur_contract, err = contract_helper.get_contract(today)
	if err:
		return None, err

	minimum_owed_dict, err = cur_contract.get_minimum_amount_owed_per_duration()
	has_no_duration_set = err is not None
	if has_no_duration_set:
		return FeeDict(
			minimum_amount=0.0,
			amount_accrued=0.0,
			amount_short=0.0,
			duration=None
		), None

	contract_start_date, err = cur_contract.get_start_date()
	if err:
		return None, err

	duration = minimum_owed_dict['duration']
	amount_accrued, err = fee_accumulator.get_amount_accrued_by_duration(duration, today)
	if err:
		return None, err

	# TODO(dlluncor): Incorporate this once get_prorated_fee_info is ready to go
	#prorated_info = loan_calculator.get_prorated_fee_info(duration, contract_start_date, today)
	prorated_fraction = 1 #prorated_info['fraction']

	# Use a fraction to determine how much we pro-rate this fee.
	minimum_due = minimum_owed_dict['amount'] * prorated_fraction

	amount_short = max(0, minimum_due - amount_accrued)

	cur_month_fees = FeeDict(
		minimum_amount=minimum_due,
		amount_accrued=number_util.round_currency(amount_accrued),
		amount_short=number_util.round_currency(amount_short),
		duration=duration
	)
	return cur_month_fees, None

def _get_account_level_balance(customer_info: per_customer_types.CustomerFinancials) -> Tuple[AccountBalanceDict, errors.Error]:
	fees_total = 0.0
	credits_total = 0.0

	for aug_tx in customer_info['financials']['augmented_transactions']:
		tx = aug_tx['transaction']
		if tx['loan_id'] is not None:
			continue

		tx_type = tx['type']
		# Account level transactions have no loan_id associated with them
		if tx_type in db_constants.FEE_TYPES:
			fees_total += tx['amount']
		elif tx_type in db_constants.CREDIT_TO_USER_TYPES:
			credits_total += tx['amount']
		else:
			return None, errors.Error('Transaction {} has a type "{}" which is neither a fee nor a credit to a user. This implies an unregistered or incorrect transaction type'.format(
				tx['id'], tx_type))

	return AccountBalanceDict(
		fees_total=number_util.round_currency(fees_total),
		credits_total=number_util.round_currency(credits_total)
	), None

def _get_summary_update(
	customer_info: per_customer_types.CustomerFinancials,
	contract_helper: contract_util.ContractHelper,
	loan_updates: List[LoanUpdateDict],
	active_ebba_application_update: EbbaApplicationUpdateDict,
	fee_accumulator: loan_calculator.FeeAccumulator,
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
	total_outstanding_principal_for_interest = 0.0
	total_outstanding_interest = 0.0
	total_outstanding_fees = 0.0
	total_interest_accrued_today = 0.0

	for l in loan_updates:
		total_outstanding_principal += l['outstanding_principal']
		total_outstanding_principal_for_interest += l['outstanding_principal_for_interest']
		total_outstanding_interest += l['outstanding_interest']
		total_outstanding_fees += l['outstanding_fees']
		total_interest_accrued_today += l['interest_accrued_today']

	minimum_monthly_payload, err = _get_cur_minimum_fees(contract_helper, today, fee_accumulator)
	if err:
		return None, err

	account_level_balance, err = _get_account_level_balance(customer_info)
	if err:
		return None, err

	return SummaryUpdateDict(
		product_type=product_type,
		total_limit=maximum_principal_limit,
		adjusted_total_limit=adjusted_total_limit,
		total_outstanding_principal=total_outstanding_principal,
		total_outstanding_principal_for_interest=total_outstanding_principal_for_interest,
		total_outstanding_interest=total_outstanding_interest,
		total_outstanding_fees=total_outstanding_fees,
		total_principal_in_requested_state=0.0,
		total_interest_accrued_today=total_interest_accrued_today,
		available_limit=max(0.0, adjusted_total_limit - total_outstanding_principal),
		minimum_monthly_payload=minimum_monthly_payload,
		account_level_balance_payload=account_level_balance,
		day_volume_threshold_met=None,
	), None

class CustomerBalance(object):
	"""
		Object to help us calculate what the customer's balance should be.
	"""

	def __init__(self, company_dict: models.CompanyDict, session_maker: Callable) -> None:
		self._session_maker = session_maker
		self._company_name = company_dict['name']
		self._company_id = company_dict['id']

	@errors.return_error_tuple
	def update(self, today: datetime.date) -> Tuple[CustomerUpdateDict, errors.Error]:
		# Get your contracts and loans
		fetcher = per_customer_fetcher.Fetcher(per_customer_types.CompanyInfoDict(
			id=self._company_id,
			name=self._company_name
		), self._session_maker, ignore_deleted=True)
		_, err = fetcher.fetch()
		if err:
			raise err

		customer_info = fetcher.get_financials()
		financials = customer_info['financials']
		num_loans = len(financials['loans'])

		contract_helper, err = contract_util.ContractHelper.build(
			self._company_id, financials['contracts'])
		if err:
			raise err

		# TODO(dlluncor): Allow someone who runs a report to tell us when is the
		# start date to fetch information from.
		#
		# For now, we just assume it's the same as today.
		start_date = today
		fee_accumulator = loan_calculator.FeeAccumulator()
		fee_accumulator.init_with_date_range(start_date, today)

		all_errors = []
		loan_update_dicts = []
		total_principal_in_requested_state = 0.0

		# What day do you cross the threshold, and on that day you cross the threshold,
		# how much money stays below the threshold
		loan_id_to_transactions = {}
		threshold_accumulator = loan_calculator.ThresholdAccumulator(contract_helper)

		for loan in financials['loans']:
			transactions_for_loan = loan_calculator.get_transactions_for_loan(
				loan['id'], financials['augmented_transactions'], accumulator=threshold_accumulator)

			if loan['status'] == LoanStatusEnum.APPROVAL_REQUESTED:
				total_principal_in_requested_state += loan['amount']

			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			loan_id_to_transactions[loan['id']] = transactions_for_loan

		# Calculate a summary for the factoring fee threshold
		threshold_info, err = threshold_accumulator.compute_threshold_info(
			report_date=today)
		if err:
			return None, err

		for loan in financials['loans']:
			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			transactions_for_loan = loan_id_to_transactions[loan['id']]

			calculator = loan_calculator.LoanCalculator(contract_helper, fee_accumulator)
			loan_update_dict, errors_list = calculator.calculate_loan_balance(
				threshold_info,
				loan,
				transactions_for_loan,
				today,
				should_round_output=False,
			)
			if errors_list:
				logging.error('Got these errors associated with loan {}'.format(loan['id']))
				for err in errors_list:
					logging.error(err.msg)

				all_errors.extend(errors_list)
			else:
				loan_update_dicts.append(loan_update_dict)

		if all_errors:
			raise errors.Error(
				'Will not proceed with updates because there was more than 1 error during loan balance updating',
				details={'errors': all_errors}
			)


		ebba_application_update, err = _get_active_ebba_application_update(
			contract_helper,
			financials.get('active_ebba_application'),
			today)
		if err:
			raise err

		summary_update, err = _get_summary_update(
			customer_info,
			contract_helper,
			loan_update_dicts,
			ebba_application_update,
			fee_accumulator,
			today,
		)

		if err:
			raise err

		summary_update['total_principal_in_requested_state'] = total_principal_in_requested_state
		summary_update['day_volume_threshold_met'] = threshold_info['day_threshold_met']

		return CustomerUpdateDict(
			today=today,
			loan_updates=loan_update_dicts,
			active_ebba_application_update=ebba_application_update,
			summary_update=summary_update,
		), None

	@errors.return_error_tuple
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
				loan.outstanding_principal_balance = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_principal']))
				loan.outstanding_interest = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_interest']))
				loan.outstanding_fees = decimal.Decimal(number_util.round_currency(cur_loan_update['outstanding_fees']))

				if cur_loan_update['should_close_loan']:
					payment_util.close_loan(loan)

			financial_summary = cast(
				models.FinancialSummary,
				session.query(models.FinancialSummary).filter(
					models.FinancialSummary.company_id == self._company_id)
				.filter(models.FinancialSummary.date == customer_update['today'].isoformat()).first())

			should_add_summary = not financial_summary
			if should_add_summary:
				financial_summary = models.FinancialSummary(
					company_id=self._company_id
				)

			summary_update = customer_update['summary_update']
			financial_summary.date = customer_update['today']
			financial_summary.total_limit = decimal.Decimal(number_util.round_currency(summary_update['total_limit']))
			financial_summary.adjusted_total_limit = decimal.Decimal(number_util.round_currency(summary_update['adjusted_total_limit']))
			financial_summary.total_outstanding_principal = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_principal']))
			financial_summary.total_outstanding_principal_for_interest = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_principal_for_interest']))
			financial_summary.total_outstanding_interest = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_interest']))
			financial_summary.total_outstanding_fees = decimal.Decimal(number_util.round_currency(summary_update['total_outstanding_fees']))
			financial_summary.total_principal_in_requested_state = decimal.Decimal(number_util.round_currency(summary_update['total_principal_in_requested_state']))
			financial_summary.interest_accrued_today = decimal.Decimal(number_util.round_currency(summary_update['total_interest_accrued_today']))
			financial_summary.available_limit = decimal.Decimal(number_util.round_currency(summary_update['available_limit']))
			financial_summary.minimum_monthly_payload = cast(Dict, summary_update['minimum_monthly_payload'])
			financial_summary.account_level_balance_payload = cast(Dict, summary_update['account_level_balance_payload'])
			financial_summary.day_volume_threshold_met = summary_update['day_volume_threshold_met']

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

