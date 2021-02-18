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
import logging
from datetime import timedelta

from mypy_extensions import TypedDict
from typing import Callable, Tuple, List

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance import contract_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import per_customer_types
from bespoke.finance.fetchers import per_customer_fetcher

UpdateDict = TypedDict('UpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_interest': float,
	'outstanding_fees': float
})

class ContractHelper(object):

	def __init__(self, contract_dicts: List[models.ContractDict], private: bool) -> None:
		self._contract_dicts = contract_dicts

	def get_contract(self, cur_date: datetime.date) -> Tuple[contract_util.Contract, errors.Error]:
		# TODO(dlluncor): Handle when we have a range of contracts between date ranges
		return contract_util.Contract(self._contract_dicts[0]), None

	def get_interest_on_date(self, cur_date: datetime.date) -> Tuple[float, errors.Error]:
		contract, err = self.get_contract(cur_date)
		if err:
			return None, err
		return contract.get_interest_rate()

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

def _calculate_loan_balance(
	contract_helper: ContractHelper,
	loan: models.LoanDict, transactions: List[models.TransactionDict], 
	today: datetime.date) -> Tuple[UpdateDict, List[errors.Error]]:
	# Replay the history of the loan and all the expenses that are due as a result.

	# Heres what you owe based on the transaction history applied to your loan

	# Once we've considered how these transactions were applied, here is the remaining amount
	# which hasn't been factored in yet based on how much you owe up to this particular day.
	days_out = date_util.num_calendar_days_passed(today, loan['origination_date'])
	days_overdue = date_util.num_calendar_days_passed(today, loan['adjusted_maturity_date'])
	
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

		# Apply transactions
		for tx in cur_transactions:
			# TODO: what happens when fees, interest or principal go negative?
			sign = 1 if payment_util.is_advance(tx) else -1

			outstanding_principal += sign * tx['to_principal']
			outstanding_interest += sign * tx['to_interest']
			outstanding_fees += sign * tx['to_fees']

		cur_interest_rate, err = contract_helper.get_interest_on_date(cur_date)
		if err:
			errors.append(err)
			continue

		outstanding_interest += cur_interest_rate * max(0.0, outstanding_principal)
		outstanding_fees += 0.0 # obvi need to calculate fees today

	if errors:
		return None, errors

	return UpdateDict(
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
		contract_helper, err = ContractHelper.build(financials['contracts'])
		if err:
			return None, err

		all_errors = []

		for loan in financials['loans']:
			transactions_for_loan = _get_transactions_for_loan(loan['id'], financials['transactions'])
			update_dict, errors = _calculate_loan_balance(contract_helper, loan, transactions_for_loan, today)
			if errors:
				logging.error('Got these errors associated with loan {}'.format(loan['id']))
				for err in errors:
					logging.error(err.msg)

				all_errors.extend(errors)
			else:
				update_dicts.append(update_dict)

		if all_errors:
			raise Exception('Will not proceed with updates because there was more than 1 error during loan balance updating')

		return update_dicts, None

	def write(self, updates: List[UpdateDict]) -> None:
		if not updates:
			return
		print('Loan updates')
		for update in updates:
			print(update)
