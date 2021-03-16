"""
	A loan calculator is an object that takes in transactions and a report date,
	and then calculates the outstanding principal, interest and fees that will
	be associated with this loan at a particular date.
"""
import datetime
from datetime import timedelta
from typing import Dict, List, Tuple, NamedTuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance import contract_util, number_util
from bespoke.finance.types import finance_types
from bespoke.finance.payments import payment_util
from mypy_extensions import TypedDict

LoanUpdateDict = TypedDict('LoanUpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_principal_for_interest': float,
	'outstanding_interest': float,
	'outstanding_fees': float
})

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

def _get_transactions_on_payment_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		if tx['payment']['payment_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def _get_transactions_on_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		if tx['transaction']['effective_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def get_transactions_for_loan(loan_id: str, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	loan_txs = []
	for tx in augmented_transactions:
		if tx['transaction']['loan_id'] == loan_id:
			loan_txs.append(tx)
	return loan_txs

AccumulatedAmountDict = TypedDict('AccumulatedAmountDict', {
	'total_amount': float
})

class FeeAccumulator(object):
	"""
		Helps keep track of how many fees have been paid over a particular period of time.
	"""
	def __init__(self) -> None:
		self._month_to_amounts: Dict[finance_types.Month, AccumulatedAmountDict] = {}

	def init_with_date_range(self, start_date: datetime.date, end_date: datetime.date) -> None:
		# Allows you to initialize what months must get included based on this date range
		cur_date = start_date

		while cur_date <= end_date:
			self.accumulate(0.0, 0.0, cur_date)
			cur_date = start_date + timedelta(days=30)

	def get_month_to_amounts(self) -> Dict[finance_types.Month, AccumulatedAmountDict]:
		return self._month_to_amounts

	def accumulate(self, fee_for_day: float, interest_for_day: float, day: datetime.date) -> None:
		month = finance_types.Month(month=day.month, year=day.year)
		if month not in self._month_to_amounts:
			self._month_to_amounts[month] = AccumulatedAmountDict(total_amount=0)

		self._month_to_amounts[month]['total_amount'] += fee_for_day + interest_for_day


class LoanCalculator(object):
	"""
		Helps calculate and summarize the history of the loan with respect to
		how the interest and fees are accumulated.
	"""
	def __init__(self, contract_helper: contract_util.ContractHelper, fee_accumulator: FeeAccumulator) -> None:
		self._contract_helper = contract_helper
		self._fee_accumulator = fee_accumulator
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

	def calculate_loan_balance(
		self,
		loan: models.LoanDict,
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date,
		includes_future_transactions: bool,
	) -> Tuple[LoanUpdateDict, List[errors.Error]]:
		# includes_future_transactions: whether or not calculation of loan balance
		# should includes transaction in the future (relative to the today parameter).
		# For customer users of Bespoke, we generally want to include transactions in the future
		# such that outstanding principal, interest, and fees are lower (payments are optimistically applied).
		# For bank users of Bespoke, we may NOT want to include transactions in the future
		# such that bank user can audit how loan balance changes over time on a day-by-day basis.

		# Replay the history of the loan and all the expenses that are due as a result.
		# Heres what you owe based on the transaction history applied to your loan.

		if not loan['origination_date']:
			return None, [errors.Error('Could not determine loan balance for loan_id={} because it has no origination_date set'.format(
				loan['id']))]

		calculate_up_to_date = today

		if includes_future_transactions:
			effective_dates = [aug_tx['transaction']['effective_date'] for aug_tx in augmented_transactions]
			if len(effective_dates) > 0:
				# Get the MAX effective_date of all transactions. This may include transactions with an effective_date
				# in the future, since such transactions may exist from payments with a settlement_date in the future.
				max_transaction_effective_date = max(effective_dates)
				calculate_up_to_date = max(max_transaction_effective_date, today)

		# Once we've considered how these transactions were applied, here is the remaining amount
		# which hasn't been factored in yet based on how much you owe up to this particular day.
		days_out = date_util.num_calendar_days_passed(
			calculate_up_to_date,
			loan['origination_date'],
		)

		# For each day between today and the origination date, you need to calculate interest and fees
		# and consider transactions along the way.
		outstanding_principal = 0.0 # The customer sees this as their outstanding principal
		outstanding_principal_for_interest = 0.0 # Amount of principal used for calculating interest and fees off of
		outstanding_interest = 0.0
		outstanding_fees = 0.0
		errors_list = []

		# TODO(dlluncor): Error condition, the loan's origination_date is set, but there is no corresponding
		# advance associated with this loan.
		# Data consistency check. The origination_date on the loan should match the effective_date on the
		# first advance transaction that funds this loan.

		for i in range(days_out):
			cur_date = loan['origination_date'] + timedelta(days=i)
			# Check each transaction and the effect it had on this loan
			cur_augmented_transactions = _get_transactions_on_date(cur_date, augmented_transactions)

			for aug_tx in cur_augmented_transactions:
				tx = aug_tx['transaction']
				# TODO(dlluncor): what happens when fees, interest or principal go negative?
				if payment_util.is_advance(tx):
					outstanding_principal += tx['to_principal']
					outstanding_principal_for_interest += tx['to_principal']
					outstanding_interest += tx['to_interest']
					outstanding_fees += tx['to_fees']

			cur_contract, err = self._contract_helper.get_contract(cur_date)
			if err:
				errors_list.append(err)
				continue

			# Interest
			cur_interest_rate, err = cur_contract.get_interest_rate()
			if err:
				errors_list.append(err)
				continue

			# Fees
			fees_due_today = 0.0
			fee_multiplier = 0.0
			if cur_date > loan['adjusted_maturity_date']:
				days_past_due = (cur_date - loan['adjusted_maturity_date']).days

				fee_multiplier, err = cur_contract.get_fee_multiplier(days_past_due=days_past_due)
				if err:
					errors_list.append(err)
					continue
			else:
				# Fees do not accrue on the day of the maturity date
				pass

			# Add it to the outstanding interest and fees
			interest_due_for_day = cur_interest_rate * max(0.0, outstanding_principal_for_interest)
			outstanding_interest += interest_due_for_day

			fee_due_for_day = fee_multiplier * interest_due_for_day
			outstanding_fees += fee_due_for_day

			self._fee_accumulator.accumulate(
				fee_for_day=fee_due_for_day, interest_for_day=interest_due_for_day, day=cur_date)

			# Apply repayment transactions at the "end of the day"
			self._note_today(
				cur_date=cur_date,
				outstanding_principal=outstanding_principal,
				interest_rate=cur_interest_rate,
				fee_multiplier=fee_multiplier
			)

			transactions_on_payment_date = _get_transactions_on_payment_date(cur_date, augmented_transactions)
			for aug_tx in transactions_on_payment_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The outstanding principal for a payment gets reduced on the payment date
					outstanding_principal -= tx['to_principal']

			for aug_tx in cur_augmented_transactions:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The principal for interest calculations gets paid off on the settlement date
					outstanding_principal_for_interest -= tx['to_principal']
					outstanding_interest -= tx['to_interest']
					outstanding_fees -= tx['to_fees']

		if errors_list:
			return None, errors_list

		# Note the final date that this report was run.
		self._balance_ranges[-1].add_end_date(cur_date)

		# NOTE: This will be handy later when we want to show to the user how
		# we calculated all the interest and fees.
		#print(self.get_summary())

		return LoanUpdateDict(
			loan_id=loan['id'],
			adjusted_maturity_date=loan['adjusted_maturity_date'],
			outstanding_principal=outstanding_principal,
			outstanding_principal_for_interest=outstanding_principal_for_interest,
			outstanding_interest=outstanding_interest,
			outstanding_fees=outstanding_fees
		), None
