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
from datetime import timedelta

from mypy_extensions import TypedDict
from typing import Callable, Tuple, List

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from bespoke.finance.fetchers import per_customer_fetcher

UpdateDict = TypedDict('UpdateDict', {
	'loan_id': str,
	'outstanding_principal': float,
	'outstanding_interest': float,
	'outstanding_fees': float
})

class ContractHelper(object):
	# TODO(dlluncor): Implement

	def __init__(self, contract_dicts: List[models.ContractDict]) -> None:
		pass

	def get_contract(self, cur_date: datetime.date) -> models.ContractDict:
		return None

def _get_transactions_on_date(
	cur_date: datetime.date, transactions: List[models.TransactionDict]) -> List[models.TransactionDict]:
	txs_on_date = []
	for tx in transactions:
		if tx['effective_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def _get_interest_on_date(
	cur_date: datetime.date) -> float:
	# TODO(dlluncor): Consider contract which is effective at this current date.
	return 0.01

def _calculate_loan_balance(
	contract_helper: ContractHelper,
	loan: models.LoanDict, transactions: List[models.TransactionDict], 
	today: datetime.date) -> UpdateDict:
	# Replay the history of the loan and all the expenses that are due as a result.

	# Heres what you owe based on the transaction history applied to your loan

	# Once we've considered how these transactions were applied, here is the remaining amount
	# which hasn't been factored in yet based on how much you owe up to this particular day.
	days_out = date_util.calendar_days_apart(today, loan['origination_date'])
	days_overdue = date_util.calendar_days_apart(today, loan['adjusted_maturity_date'])
	
	# For each day between today and the origination date, you need to calculate interest and fees
	# and consider transactions along the way.
	outstanding_principal = 0.0
	outstanding_interest = 0.0
	outstanding_fees = 0.0

	for i in range(days_out): # is it days_out + 1?
		cur_date = loan['origination_date'] + timedelta(days=i)
		# Check each transaction and the effect it had on this loan
		cur_transactions = _get_transactions_on_date(cur_date, transactions)

		# Apply transactions
		for tx in cur_transactions:
			# TODO: what happens when fees, interest or principal go negative?
			sign = 1 if payment_util.is_advance(tx) else -1

			outstanding_principal += sign * tx['to_principal']
			outstanding_interest += sign * tx['to_interest']
			outstanding_fees += sign * tx['to_fees']

		cur_interest_rate = _get_interest_on_date(cur_date)
		outstanding_interest += cur_interest_rate * max(0.0, outstanding_principal)
		outstanding_fees += 0.0 # obvi need to calculate fees today

	return UpdateDict(
		loan_id=loan['id'],
		outstanding_principal=outstanding_principal,
		outstanding_interest=outstanding_interest,
		outstanding_fees=outstanding_fees
	)


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

	def update(self, today: datetime.date) -> Tuple[List[UpdateDict], errors.Error]:
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
			return [], None

		update_dicts = []
		contract_helper = ContractHelper(financials['contracts'])
		for loan in financials['loans']:
			transactions_for_loan = _get_transactions_for_loan(loan['id'], financials['transactions'])
			update_dict = _calculate_loan_balance(contract_helper, loan, transactions_for_loan, today)
			update_dicts.append(update_dict)

		return update_dicts, None

	def write(self, updates: List[UpdateDict]) -> None:
		if not updates:
			return
		print('Loan updates')
		for update in updates:
			print(update)
