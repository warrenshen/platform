import datetime
import logging
from calendar import monthrange
from collections import OrderedDict
from datetime import timedelta
from typing import Dict, List, NamedTuple, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import FeeDict, ProratedFeeInfoDict
from bespoke.finance import number_util, contract_util
from bespoke.finance.types import finance_types
from mypy_extensions import TypedDict

AccumulatedAmountDict = TypedDict('AccumulatedAmountDict', {
	'interest_amount': float,
	'fees_amount': float
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

_QUARTER_TO_START_MONTH = {
	1: 1,
	2: 4,
	3: 7,
	4: 10
}

_QUARTER_TO_LAST_MONTH = {
	1: 3,
	2: 6,
	3: 9,
	4: 12
}

def _get_quarter(month: int) -> int:
	return _MONTH_TO_QUARTER[month]

def _get_start_month(quarter: int) -> int:
	return _QUARTER_TO_START_MONTH[quarter]

def _get_last_month(quarter: int) -> int:
	return _QUARTER_TO_LAST_MONTH[quarter]

def _num_days_in_month(day: datetime.date) -> int:
	return monthrange(day.year, day.month)[1]

def _get_num_days_into_quarter(day: datetime.date) -> int:
	# Return how many days into the quarter this date is, e.g.,
	# if the quarter starts on 1/1/2020 and day is 1/20/2020, then
	# it returns 20, since it's 20 days into the quarter
	start_month = _get_start_month(quarter=_get_quarter(day.month))
	start_of_quarter_day = datetime.date(year=day.year, month=start_month, day=1)

	return (day - start_of_quarter_day).days

class QuarterHelper(object):
	"""
		A class to help manage dealing with quarters of the year.
	"""
	def __init__(self, today: datetime.date) -> None:
		# Our reference point that anchors ourselves to a particular quarter.
		self.today = today
		self._todays_quarter = _get_quarter(month=self.today.month)

	def get_num_days_in_quarter(self) -> int:
		# Get the number of days in this quarter that "today" belongs to.
		start_month = _get_start_month(quarter=self._todays_quarter)
		total_num_days = 0

		for i in range(3):
			# Sum up the number of days in the 3 months that span this quarter.
			cur_month = start_month + i
			cur_date = datetime.date(self.today.year, cur_month, 1) # First of the month
			num_days_this_month = _num_days_in_month(cur_date)
			total_num_days += num_days_this_month

		return total_num_days

	def has_overlap(self, day: datetime.date) -> bool:
		# Does this day exist in the same quarter as "today"?

		if self.today.year != day.year:
			return False

		if self._todays_quarter != _get_quarter(day.month):
			return False

		return True

	def get_last_day(self) -> datetime.date:
		# Returns the last day of the quarter.
		last_month = _get_last_month(quarter=self._todays_quarter)
		days_in_last_month = _num_days_in_month(datetime.date(self.today.year, last_month, 1))
		return datetime.date(self.today.year, last_month, days_in_last_month)

def get_prorated_fee_info(duration: str, contract_start_date: datetime.date, today: datetime.date) -> ProratedFeeInfoDict:
	start = contract_start_date

	if duration == contract_util.MinimumAmountDuration.MONTHLY:

		num_days_in_month = _num_days_in_month(today)
		last_day_of_month = datetime.date(today.year, today.month, num_days_in_month)
		numerator = None

		if start.year == today.year and start.month == today.month:
			# If we are in the same month the contract started, then we have to consider
			# pro-rating the fee
			numerator = num_days_in_month - start.day + 1 # number of days you had the contract this month
		else:
			# No pro-rating is needed
			numerator = num_days_in_month

		return ProratedFeeInfoDict(
			numerator=numerator,
			denom=num_days_in_month,
			fraction=numerator / num_days_in_month,
			day_to_pay=date_util.date_to_str(last_day_of_month)
		)
	elif duration == contract_util.MinimumAmountDuration.QUARTERLY:
		quarter_helper = QuarterHelper(today)
		num_days_in_quarter = quarter_helper.get_num_days_in_quarter()

		if quarter_helper.has_overlap(contract_start_date):
			numerator = num_days_in_quarter - _get_num_days_into_quarter(start)
		else:
			# No pro-rating is needed
			numerator = num_days_in_quarter

		return ProratedFeeInfoDict(
			numerator=numerator,
			denom=num_days_in_quarter,
			fraction=numerator / num_days_in_quarter,
			day_to_pay=date_util.date_to_str(quarter_helper.get_last_day())
		)
	elif duration == contract_util.MinimumAmountDuration.ANNUALLY:
		# You dont pro-rate the annual fee, and you only book it at the end
		# of the 1 year anniversary.
		return ProratedFeeInfoDict(
			numerator=365,
			denom=365,
			fraction=1,
			day_to_pay=date_util.date_to_str(
				datetime.date(start.year + 1, start.month, start.day))
		)
	else:
		raise errors.Error('Invalid duration provided {}'.format(duration))

class FeeAccumulator(object):
	"""
		Helps keep track of how many fees have been paid over a particular period of time.
	"""
	def __init__(self) -> None:
		self._month_to_amounts: Dict[finance_types.Month, AccumulatedAmountDict] = {}
		self._quarter_to_amounts: Dict[finance_types.Quarter, AccumulatedAmountDict] = {}
		self._year_to_amount = AccumulatedAmountDict(interest_amount=0, fees_amount=0)

	def init_with_date_range(self, start_date: datetime.date, end_date: datetime.date) -> None:
		# Allows you to initialize what months, quarters, year must get included based on this date range
		cur_date = start_date

		while cur_date <= end_date:
			self.accumulate(start_date, end_date, 0.0, 0.0, cur_date)
			cur_date = start_date + timedelta(days=30)

	def get_amount_fees_accrued_by_month(self, month: finance_types.Month) -> Tuple[float, errors.Error]:
		if month not in self._month_to_amounts:
			return None, errors.Error('{} is missing the monthly amount of fees accrued'.format(month))

		return self._month_to_amounts[month]['fees_amount'], None

	def get_amount_interest_accrued_by_month(self, month: finance_types.Month) -> Tuple[float, errors.Error]:
		if month not in self._month_to_amounts:
			return None, errors.Error('{} is missing the monthly amount of interest accrued'.format(month))

		return self._month_to_amounts[month]['interest_amount'], None

	def get_amount_revenue_accrued_by_duration(self, duration: str, day: datetime.date) -> Tuple[float, errors.Error]:

		if duration == contract_util.MinimumAmountDuration.MONTHLY:
			month = finance_types.Month(month=day.month, year=day.year)

			if month not in self._month_to_amounts:
				return None, errors.Error('{} is missing the minimum fees monthly amount'.format(month))

			return self._month_to_amounts[month]['interest_amount'] + self._month_to_amounts[month]['fees_amount'], None

		elif duration == contract_util.MinimumAmountDuration.QUARTERLY:
			quarter = finance_types.Quarter(quarter=_get_quarter(month=day.month), year=day.year)

			if quarter not in self._quarter_to_amounts:
				return None, errors.Error('{} is missing the minimum fees quarter amount'.format(quarter))

			return self._quarter_to_amounts[quarter]['interest_amount'] + self._quarter_to_amounts[quarter]['fees_amount'], None

		elif duration == contract_util.MinimumAmountDuration.ANNUALLY:
			# For the annual summation, we check in the accumulate method that we only
			# count up interest from within a year of the contract start.
			return self._year_to_amount['interest_amount'] + self._year_to_amount['fees_amount'], None

		return None, errors.Error('Invalid duration provided to accrue interest: "{}"'.format(duration))

	def accumulate(self,
		todays_contract_start_date: datetime.date,
		todays_contract_end_date: datetime.date,
		interest_for_day: float,
		fees_for_day: float,
		day: datetime.date
	) -> None:
		if day < todays_contract_start_date or day > todays_contract_end_date:
			# Dont count these fees towards their accumulated total if it happened outside
			# of the contract in-place when this report is generated.
			return

		# Month accumulation
		month = finance_types.Month(month=day.month, year=day.year)
		if month not in self._month_to_amounts:
			self._month_to_amounts[month] = AccumulatedAmountDict(interest_amount=0, fees_amount=0)

		self._month_to_amounts[month]['interest_amount'] += interest_for_day
		self._month_to_amounts[month]['fees_amount'] += fees_for_day

		# Quarter accumulation
		quarter_num = _MONTH_TO_QUARTER[day.month]
		quarter = finance_types.Quarter(quarter=quarter_num, year=day.year)

		if quarter not in self._quarter_to_amounts:
			self._quarter_to_amounts[quarter] = AccumulatedAmountDict(interest_amount=0, fees_amount=0)

		self._quarter_to_amounts[quarter]['interest_amount'] += interest_for_day
		self._quarter_to_amounts[quarter]['fees_amount'] += fees_for_day

		# Only accumulate within a year of the contract start date
		year_from_contract_end = todays_contract_start_date + timedelta(days=365)
		if day < year_from_contract_end:
			self._year_to_amount['interest_amount'] += interest_for_day
			self._year_to_amount['fees_amount'] += fees_for_day


def get_cur_minimum_fees(contract_helper: contract_util.ContractHelper, today: datetime.date, fee_accumulator: FeeAccumulator) -> Tuple[FeeDict, errors.Error]:
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
			duration=None,
			prorated_info=None
		), None

	contract_start_date, err = cur_contract.get_start_date()
	if err:
		return None, err

	duration = minimum_owed_dict['duration']
	amount_accrued, err = fee_accumulator.get_amount_revenue_accrued_by_duration(duration, today)
	if err:
		return None, err

	prorated_info = get_prorated_fee_info(duration, contract_start_date, today)
	prorated_fraction = prorated_info['fraction']

	# Use a fraction to determine how much we pro-rate this fee.
	minimum_due = minimum_owed_dict['amount'] * prorated_fraction

	amount_short = max(0, minimum_due - amount_accrued)

	cur_month_fees = FeeDict(
		minimum_amount=minimum_due,
		amount_accrued=number_util.round_currency(amount_accrued),
		amount_short=number_util.round_currency(amount_short),
		duration=duration,
		prorated_info=prorated_info
	)
	return cur_month_fees, None
