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

from mypy_extensions import TypedDict
from typing import Callable, Tuple, List, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db.db_constants import LoanStatusEnum
from bespoke.finance import contract_util
from bespoke.finance import number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from bespoke.finance.fetchers import per_customer_fetcher

LoanUpdateDict = TypedDict('LoanUpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_interest': float,
	'outstanding_fees': float
})

SummaryUpdateDict = TypedDict('SummaryUpdateDict', {
	'product_type': str,
	'total_limit': float,
	'total_outstanding_principal': float,
	'total_outstanding_interest': float,
	'total_outstanding_fees': float,
	'total_principal_in_requested_state': float,
	'available_limit': float                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
})

CustomerUpdateDict = TypedDict('CustomerUpdateDict', {
	'loan_updates': List[LoanUpdateDict],
	'summary_update': SummaryUpdateDict
})

class ContractHelper(object):

	def __init__(self, contract_dicts: List[models.ContractDict], private: bool) -> None:
		self._contract_dicts = contract_dicts

	def get_contract(self, cur_date: datetime.date) -> Tuple[contract_util.Contract, errors.Error]:
		# TODO(dlluncor): Handle when we have a range of contracts between date ranges
		return contract_util.Contract(self._contract_dicts[0]), None

	@staticmethod
	def build(contract_dicts: List[models.ContractDict]) -> Tuple['ContractHelper', errors.Error]:
		return ContractHelper(contract_dicts, private=True), None

def _get_transactions_on_date(
	cur_date: datetime.date, transactions: List[models.TransactionDict]) -> List[models.TransactionDict]:
	txs_on_date = []
	for tx in transactions:
		if tx['effective_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def _get_summary_update(
	contract_helper: ContractHelper,
	loan_updates: List[LoanUpdateDict], 
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
		total_outstanding_principal=total_outstanding_principal,
		total_outstanding_interest=total_outstanding_interest,
		total_outstanding_fees=total_outstanding_fees,
		total_principal_in_requested_state=0.0,
		available_limit=max(0.0, maximum_principal_limit-total_outstanding_principal)
	), None

class BalanceRange(object):
	"""
		For summarization purposes, the time a certain balance was in effect and
		the interest and fees associated with that.
	"""
	def __init__(self, start_date: datetime.date, outstanding_principal: float) -> None:
		self.start_date = start_date
		self.outstanding_principal = outstanding_principal
		self.end_date: datetime.date = None
		self.interest_rates: List[float] = []
		self.fee_multipliers: List[float] = []

	def add_end_date(self, end_date: datetime.date) -> None:
		self.end_date = end_date

	def add_fee_info(self, interest_rate: float, fee_multiplier: float) -> None:
		self.interest_rates.append(interest_rate)
		self.fee_multipliers.append(fee_multiplier)

class LoanCalculator(object):
	"""
		Helps calculate and summarize the history of the loan with respect to
		how the interest and fees are accumulated.
	"""
	def __init__(self, contract_helper: ContractHelper) -> None:
		self._contract_helper = contract_helper
		# For summarization
		self._balance_ranges: List[BalanceRange] = []

	def _note_today(
		self, cur_date: datetime.date, outstanding_principal: float, interest_rate: float, fee_multiplier: float) -> None:
		"""
		Give date ranges that a certain principal was in play, and the interest accrued on it being daily interest * num_days
		For that date range, also give what fees were accrued bucketed by when the accelerated payment kicked in.
		"""
		if not self._balance_ranges:
			# Initialize everything as this is the first call
			self._balance_ranges.append(BalanceRange(
				start_date=cur_date,
				outstanding_principal=outstanding_principal
			))

		cur_balance_range = self._balance_ranges[-1]
		prev_outstanding_balance = cur_balance_range.outstanding_principal
		balance_changed = not number_util.float_eq(outstanding_principal, prev_outstanding_balance)

		if balance_changed:
			# Create a date range for how long the previous balance lasted.
			cur_balance_range.add_end_date(cur_date - timedelta(days=1))
			self._balance_ranges.append(BalanceRange(
				start_date=cur_date,
				outstanding_principal=outstanding_principal
			))

		# Always add the current interest and fees to the latest range.
		self._balance_ranges[-1].add_fee_info(interest_rate, fee_multiplier)

	def get_summary(self) -> str:
		lines = []
		for balance_range in self._balance_ranges:
			cur_lines = [
				'From {} to {}'.format(balance_range.start_date, balance_range.end_date),
				'Principal: {}'.format(balance_range.outstanding_principal),
				'Interest_rates ({}): {}'.format(len(balance_range.interest_rates), balance_range.interest_rates),
				'Fees ({}): {}'.format(len(balance_range.fee_multipliers), balance_range.fee_multipliers),
				''
			]
			lines.extend(cur_lines)

		return '\n'.join(lines)
	
	def calculate_loan_balance(self,
		loan: models.LoanDict, transactions: List[models.TransactionDict], 
		today: datetime.date) -> Tuple[LoanUpdateDict, List[errors.Error]]:
		# Replay the history of the loan and all the expenses that are due as a result.

		# Heres what you owe based on the transaction history applied to your loan

		# Once we've considered how these transactions were applied, here is the remaining amount
		# which hasn't been factored in yet based on how much you owe up to this particular day.
		days_out = date_util.num_calendar_days_passed(today, loan['origination_date'])

		# For each day between today and the origination date, you need to calculate interest and fees
		# and consider transactions along the way.
		outstanding_principal = 0.0
		outstanding_interest = 0.0
		outstanding_fees = 0.0
		errors = []

		# TODO(dlluncor): Error condition, the loan's origination_date is set, but there is no corresponding
		# advance associated with this loan.
		# Data consistency check. The origination_date on the loan should match the effective_date on the
		# first advance transaction that funds this loan.

		for i in range(days_out):
			cur_date = loan['origination_date'] + timedelta(days=i)
			# Check each transaction and the effect it had on this loan
			cur_transactions = _get_transactions_on_date(cur_date, transactions)

			for tx in cur_transactions:
				# TODO(dlluncor): what happens when fees, interest or principal go negative?
				if payment_util.is_advance(tx):
					outstanding_principal += tx['to_principal']
					outstanding_interest += tx['to_interest']
					outstanding_fees += tx['to_fees']

			cur_contract, err = self._contract_helper.get_contract(cur_date)
			if err:
				errors.append(err)
				continue

			# Interest
			cur_interest_rate, err = cur_contract.get_interest_rate()
			if err:
				errors.append(err)
				continue
			
			# Fees
			fees_due_today = 0.0
			fee_multiplier = 0.0
			if cur_date > loan['adjusted_maturity_date']:
				days_past_due = (cur_date - loan['adjusted_maturity_date']).days

				fee_multiplier, err = cur_contract.get_fee_multiplier(days_past_due=days_past_due)
				if err:
					errors.append(err)
					continue
			else:
				# TODO(dlluncor): Do fees accrue on the day of the maturity date? I dont think
				# so but check
				pass

			# Add it to the outstanding interest and fees
			interest_due_on_day = cur_interest_rate / 100.0 * max(0.0, outstanding_principal)
			outstanding_interest += interest_due_on_day
			outstanding_fees += fee_multiplier * interest_due_on_day

			# Apply repayment transactions at the "end of the day"
			self._note_today(
				cur_date=cur_date,
				outstanding_principal=outstanding_principal, 
				interest_rate=cur_interest_rate,
				fee_multiplier=fee_multiplier
			)

			for tx in cur_transactions:
				if payment_util.is_repayment(tx):
					outstanding_principal -= tx['to_principal']
					outstanding_interest -= tx['to_interest']
					outstanding_fees -= tx['to_fees']

		if errors:
			return None, errors

		# Note the final date that this report was run.
		self._balance_ranges[-1].add_end_date(cur_date)

		# NOTE: This will be handy later when we want to show to the user how
		# we calculated all the interest and fees.
		#print(self.get_summary())

		return LoanUpdateDict(
			loan_id=loan['id'],
			adjusted_maturity_date=loan['adjusted_maturity_date'],
			outstanding_principal=outstanding_principal,
			outstanding_interest=outstanding_interest,
			outstanding_fees=outstanding_fees
		), None


def _get_transactions_for_loan(loan_id: str, transactions: List[models.TransactionDict]) -> List[models.TransactionDict]:
	loan_txs = []
	for t in transactions:
		if t['loan_id'] == loan_id:
			loan_txs.append(t)
	return loan_txs


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
		if num_loans == 0:
			print('TODO(dlluncor): Handle account-level people with no loans, for now ignore')
			return CustomerUpdateDict(loan_updates=[], summary_update=None), None

		contract_helper, err = ContractHelper.build(financials['contracts'])
		if err:
			return None, err

		all_errors = []
		loan_update_dicts = []
		total_principal_in_requested_state = 0.0

		for loan in financials['loans']:
			transactions_for_loan = _get_transactions_for_loan(loan['id'], financials['transactions'])
			
			if loan['status'] == LoanStatusEnum.APPROVAL_REQUESTED:
				total_principal_in_requested_state += loan['amount']

			if not loan['origination_date']:
				# If the loan hasn't been originated yet, nothing to calculate
				continue

			if not loan['adjusted_maturity_date']:
				logging.error('Data issue, adjusted_maturity_date missing for loan {}'.format(loan['id']))
				continue

			calculator = LoanCalculator(contract_helper)
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

		summary_update, err = _get_summary_update(contract_helper, loan_update_dicts, today)
		if err:
			return None, err

		summary_update['total_principal_in_requested_state'] = total_principal_in_requested_state

		return CustomerUpdateDict(
			loan_updates=loan_update_dicts,
			summary_update=summary_update
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
				return None, errors.Error('No loans found', details=err_details)

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
			financial_summary.total_outstanding_principal = decimal.Decimal(summary_update['total_outstanding_principal']) 
			financial_summary.total_outstanding_interest = decimal.Decimal(summary_update['total_outstanding_interest']) 
			financial_summary.total_outstanding_fees = decimal.Decimal(summary_update['total_outstanding_fees'])
			financial_summary.total_principal_in_requested_state = decimal.Decimal(summary_update['total_principal_in_requested_state']) 
			financial_summary.available_limit = decimal.Decimal(summary_update['available_limit']) 

			if should_add_summary:
				session.add(financial_summary)

			return True, None

