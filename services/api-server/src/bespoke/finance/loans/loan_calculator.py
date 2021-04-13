"""
	A loan calculator is an object that takes in transactions and a report date,
	and then calculates the outstanding principal, interest and fees that will
	be associated with this loan at a particular date.
"""
import datetime
import logging
from collections import OrderedDict
from datetime import timedelta
from typing import Dict, List, NamedTuple, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.finance import contract_util, number_util
from bespoke.finance.payments import payment_util
from bespoke.finance.types import finance_types
from mypy_extensions import TypedDict

LoanUpdateDict = TypedDict('LoanUpdateDict', {
	'loan_id': str,
	'adjusted_maturity_date': datetime.date,
	'outstanding_principal': float,
	'outstanding_principal_for_interest': float,
	'outstanding_interest': float,
	'outstanding_fees': float,
	'interest_accrued_today': float,
	'should_close_loan': bool
})

ThresholdInfoDict = TypedDict('ThresholdInfoDict', {
	'day_threshold_met': datetime.date
})

class ThresholdAccumulator(object):
	"""
		An object to accumulate the principal amounts for the factoring fee threshold
	"""

	def __init__(self, contract_helper: contract_util.ContractHelper) -> None:
		self._date_to_txs: Dict[datetime.date, List[models.AugmentedTransactionDict]] = OrderedDict()
		self._contract_helper = contract_helper

	def add_transaction(self, tx: models.AugmentedTransactionDict) -> None:
		cur_date = tx['transaction']['effective_date']
		if cur_date not in self._date_to_txs:
			self._date_to_txs[cur_date] = []

		self._date_to_txs[cur_date].append(tx)

	def compute_threshold_info(self, report_date: datetime.date) -> Tuple[ThresholdInfoDict, errors.Error]:
		contract, err = self._contract_helper.get_contract(report_date)
		if err:
			return None, err

		start_date, err = contract.get_start_date()
		if err:
			return None, err

		end_date, err = contract.get_adjusted_end_date()
		if err:
			return None, err

		factoring_fee_threshold, err = contract.get_factoring_fee_threshold()
		has_threshold_set = factoring_fee_threshold > 0.0
		starting_value, starting_value_err = contract.get_factoring_fee_threshold_starting_value()
		if has_threshold_set and starting_value is None:
			return None, errors.Error('Factoring fee threshold starting value must be set if a customers factoring fee threshold is set')

		total_repayments_amount = starting_value if starting_value else 0.0
		if has_threshold_set and total_repayments_amount >= factoring_fee_threshold:
			# You crossed the threshold immediately because of carry-over
			return ThresholdInfoDict(
				day_threshold_met=start_date
			), None

		for cur_date, aug_txs in self._date_to_txs.items():

			for aug_tx in aug_txs:
				tx = aug_tx['transaction']

				if tx['effective_date'] < start_date or tx['effective_date'] > end_date or tx['effective_date'] > report_date:
					# Dont include transactions happening outside of the range
					# of the current contract in effect, or that come after
					# the current report date.
					continue

				if payment_util.is_repayment(tx):
					total_repayments_amount += tx['to_principal']

			if has_threshold_set and total_repayments_amount >= factoring_fee_threshold:
				return ThresholdInfoDict(
					day_threshold_met=cur_date
				), None

		return ThresholdInfoDict(
			day_threshold_met=None
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

def _get_transactions_on_deposit_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		if tx['payment']['deposit_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def _get_transactions_on_settlement_date(
	cur_date: datetime.date, augmented_transactions: List[models.AugmentedTransactionDict]) -> List[models.AugmentedTransactionDict]:
	txs_on_date = []
	for tx in augmented_transactions:
		# Note: we could use tx['payment']['settlement_date'] here alternatively.
		if tx['transaction']['effective_date'] == cur_date:
			txs_on_date.append(tx)

	return txs_on_date

def get_transactions_for_loan(
	loan_id: str, augmented_transactions: List[models.AugmentedTransactionDict],
	accumulator: ThresholdAccumulator = None) -> List[models.AugmentedTransactionDict]:
	loan_txs = []
	for tx in augmented_transactions:
		if tx['transaction']['loan_id'] == loan_id:
			loan_txs.append(tx)
			if accumulator:
				accumulator.add_transaction(tx)

	return loan_txs

AccumulatedAmountDict = TypedDict('AccumulatedAmountDict', {
	'interest_amount': float
})

_MONTH_TO_QUARTER = {
	1: 1,
	2: 1,
	3: 1,

	4: 2,
	5: 2,
	6: 2,

	7: 3,
	8: 3,
	9: 3,

	10: 4,
	11: 4,
	12: 4
}

class FeeAccumulator(object):
	"""
		Helps keep track of how many fees have been paid over a particular period of time.
	"""
	def __init__(self) -> None:
		self._month_to_amounts: Dict[finance_types.Month, AccumulatedAmountDict] = {}
		self._quarter_to_amounts: Dict[finance_types.Quarter, AccumulatedAmountDict] = {}
		self._year_to_amounts: Dict[finance_types.Year, AccumulatedAmountDict] = {}

	def init_with_date_range(self, start_date: datetime.date, end_date: datetime.date) -> None:
		# Allows you to initialize what months, quarters, year must get included based on this date range
		cur_date = start_date

		while cur_date <= end_date:
			self.accumulate(0.0, cur_date)
			cur_date = start_date + timedelta(days=30)

	def get_amount_accrued_by_duration(self, duration: str, day: datetime.date) -> Tuple[float, errors.Error]:

		if duration == contract_util.MinimumAmountDuration.MONTHLY:
			month = finance_types.Month(month=day.month, year=day.year)

			if month not in self._month_to_amounts:
				return None, errors.Error('{} is missing the minimum fees monthly amount'.format(month))

			return self._month_to_amounts[month]['interest_amount'], None

		elif duration == contract_util.MinimumAmountDuration.QUARTERLY:
			quarter = finance_types.Quarter(quarter=_MONTH_TO_QUARTER[day.month], year=day.year)

			if quarter not in self._quarter_to_amounts:
				return None, errors.Error('{} is missing the minimum fees quarter amount'.format(quarter))

			return self._quarter_to_amounts[quarter]['interest_amount'], None

		elif duration == contract_util.MinimumAmountDuration.ANNUALLY:
			year = finance_types.Year(year=day.year)

			if year not in self._year_to_amounts:
				return None, errors.Error('{} is missing the minimum fees year amount'.format(year))

			return self._year_to_amounts[year]['interest_amount'], None


		return None, errors.Error('Invalid duration provided to accrue interest: "{}"'.format(duration))

	def accumulate(self, interest_for_day: float, day: datetime.date) -> None:
		# Month accumulation
		month = finance_types.Month(month=day.month, year=day.year)
		if month not in self._month_to_amounts:
			self._month_to_amounts[month] = AccumulatedAmountDict(interest_amount=0)

		self._month_to_amounts[month]['interest_amount'] += interest_for_day

		# Quarter accumulation
		quarter_num = _MONTH_TO_QUARTER[day.month]
		quarter = finance_types.Quarter(quarter=quarter_num, year=day.year)

		if quarter not in self._quarter_to_amounts:
			self._quarter_to_amounts[quarter] = AccumulatedAmountDict(interest_amount=0)

		self._quarter_to_amounts[quarter]['interest_amount'] += interest_for_day

		# Year accumulation
		year = finance_types.Year(year=day.year)

		if year not in self._year_to_amounts:
			self._year_to_amounts[year] = AccumulatedAmountDict(interest_amount=0)

		self._year_to_amounts[year]['interest_amount'] += interest_for_day


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
		threshold_info: ThresholdInfoDict,
		loan: models.LoanDict,
		augmented_transactions: List[models.AugmentedTransactionDict],
		today: datetime.date
	) -> Tuple[LoanUpdateDict, List[errors.Error]]:
		# Replay the history of the loan and all the expenses that are due as a result.
		# Heres what you owe based on the transaction history applied to your loan.

		if not loan['origination_date']:
			return None, [errors.Error('Could not determine loan balance for loan_id={} because it has no origination_date set'.format(
				loan['id']))]

		calculate_up_to_date = today

		if today < loan['origination_date']:
			# No loan has been originated yet, so skip any calculations for it.
			days_out = 0
		else:
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
		interest_accrued_today = 0.0
		has_been_funded = False

		errors_list = []

		# TODO(dlluncor): Error condition, the loan's origination_date is set, but there is no corresponding
		# advance associated with this loan.
		# Data consistency check. The origination_date on the loan should match the effective_date on the
		# first advance transaction that funds this loan.

		for i in range(days_out):
			cur_date = loan['origination_date'] + timedelta(days=i)
			# Check each transaction and the effect it had on this loan
			transactions_on_settlement_date = _get_transactions_on_settlement_date(cur_date, augmented_transactions)

			# Advances count against principal on the settlement date (which happens to be
			# be the same as deposit date)

			for aug_tx in transactions_on_settlement_date:
				tx = aug_tx['transaction']
				if payment_util.is_advance(tx) or payment_util.is_adjustment(tx):
					# Adjustments and advances both get applied at the beginning of the day
					outstanding_principal += tx['to_principal']
					outstanding_principal_for_interest += tx['to_principal']
					outstanding_interest += tx['to_interest']
					outstanding_fees += tx['to_fees']

				if payment_util.is_advance(tx):
					has_been_funded = True

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

			# NOTE: divide money into amount above threshold and amount below threshold
			factoring_fee_threshold, err = cur_contract.get_factoring_fee_threshold()
			has_threshold_set = factoring_fee_threshold > 0.0
			day_threshold_met = threshold_info['day_threshold_met']

			interest_rate_used = cur_interest_rate

			if has_threshold_set and day_threshold_met:
				# There was some day that the customer met the threshold
				if cur_date > day_threshold_met:
					# After the day we meet the threshold, everything is at the reduced interest rate
					reduced_interest_rate, err = cur_contract.get_discounted_interest_rate_due_to_factoring_fee()
					if err:
						errors_list.append(err)
						continue

					interest_rate_used = reduced_interest_rate

			if outstanding_principal_for_interest == 0:
				interest_rate_used = 0.0
			elif outstanding_principal_for_interest < 0:
				logging.warn(f'Outstanding principal for interest ({outstanding_principal_for_interest}) is negative on {cur_date} for loan {loan["id"]}')
				interest_due_for_day = 0.0

			interest_due_for_day = interest_rate_used * outstanding_principal_for_interest
			outstanding_interest += interest_due_for_day

			# If the customer does not have any outstanding principal, even though their principal for
			# interest is accruing, dont charge any additional fees there.
			has_outstanding_principal = number_util.float_gt(round(outstanding_principal, 2), 0.0)
			fee_due_for_day = fee_multiplier * interest_due_for_day if has_outstanding_principal else 0.0
			outstanding_fees += fee_due_for_day

			if cur_date == today:
				interest_accrued_today = interest_due_for_day

			self._fee_accumulator.accumulate(
				interest_for_day=interest_due_for_day, day=cur_date)

			# Apply repayment transactions at the "end of the day"
			self._note_today(
				cur_date=cur_date,
				outstanding_principal=outstanding_principal,
				interest_rate=interest_rate_used,
				fee_multiplier=fee_multiplier
			)

			transactions_on_deposit_date = _get_transactions_on_deposit_date(cur_date, augmented_transactions)
			for aug_tx in transactions_on_deposit_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The outstanding principal for a payment gets reduced on the payment date
					outstanding_principal -= tx['to_principal']
					outstanding_interest -= tx['to_interest']
					outstanding_fees -= tx['to_fees']

			for aug_tx in transactions_on_settlement_date:
				tx = aug_tx['transaction']
				if payment_util.is_repayment(tx):
					# The principal for interest calculations gets paid off on the settlement date
					outstanding_principal_for_interest -= tx['to_principal']


		if errors_list:
			return None, errors_list

		# If you haven't gone through the transaction's settlement days, but you did include
		# them because they were deposited, interest and fees may go negative for those
		# clearance days, but then when those settlement days happen, the fees and interest
		# balance out.

		# Note the final date that this report was run.
		if self._balance_ranges:
			self._balance_ranges[-1].add_end_date(cur_date)

		# NOTE: This will be handy later when we want to show to the user how
		# we calculated all the interest and fees.
		# print(self.get_summary())

		l = LoanUpdateDict(
			loan_id=loan['id'],
			adjusted_maturity_date=loan['adjusted_maturity_date'],
			outstanding_principal=number_util.round_currency(outstanding_principal),
			outstanding_principal_for_interest=number_util.round_currency(outstanding_principal_for_interest),
			outstanding_interest=number_util.round_currency(outstanding_interest),
			outstanding_fees=number_util.round_currency(outstanding_fees),
			interest_accrued_today=number_util.round_currency(interest_accrued_today),
			should_close_loan=False
		)

		if not loan['closed_at'] and has_been_funded:
			# If the loan hasn't been closed yet and is funded, then
			# check whether it should be closed.
			# If it already has been closed, then no need to close it again.
			# If it's not funded yet, then we shouldnt close it out yet.
			l['should_close_loan'] = payment_util.should_close_loan(
				new_outstanding_principal=l['outstanding_principal'],
				new_outstanding_interest=l['outstanding_interest'],
				new_outstanding_fees=l['outstanding_fees']
			)

		return l, None
