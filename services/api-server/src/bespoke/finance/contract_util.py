import datetime
import json
import logging
import sys
from datetime import timedelta
from typing import Any, Callable, Dict, List, NamedTuple, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import ProductType
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

FieldDict = TypedDict('FieldDict', {
	'name': str,
	'value': str
})

FullFieldDict = TypedDict('FullFieldDict', {
	'section': str,
	'type': str,
	'format': str,
	'internal_name': str,
	'display_name': str,
	'description': str,
	'value': Any,
	'nullable': bool
})

class MinimumAmountDuration(object):
	MONTHLY = 'monthly'
	QUARTERLY = 'quarterly'
	ANNUALLY = 'annually'

INTERNAL_LATE_FEE_INFINITY = sys.maxsize

def _parse_late_fee_structure(late_fee_field: FullFieldDict) -> Tuple[List[Tuple[int, int, float]], errors.Error]:

	if not late_fee_field:
		logging.error('Warning no late fee structure specified in contract')
		return [], None

	late_fee_structure_str = late_fee_field['value']
	if not late_fee_structure_str:
		logging.error('Warning no late fee structure specified in contract')
		return [], None

	try:
		late_fee_structure = json.loads(late_fee_structure_str)
	except Exception as e:
		return None, errors.Error('Late fee structure is not stored as a valid JSON')

	if type(late_fee_structure) != dict:
		return None, errors.Error('Late fee structure is not a dict')

	if not late_fee_structure:
		return None, errors.Error('no ranges provided in this late fee structure')

	ranges = []

	for k, v in late_fee_structure.items():
		is_number = type(v) == float or type(v) == int
		if type(k) != str or not is_number:
			return None, errors.Error('Invalid late fee structure. The key must be a string and the value must be a float')

		if float(v) < 0 or 1.0 < float(v):
			return None, errors.Error(f"Invalid late fee structure. '{k}' must have a value between 0 and 1")

		# the key can either be an integer range 1-5, or it can be the tail-end
		# of a range, e.g., 7+
		has_infinity_case = False
		if k.endswith('+'):
			if has_infinity_case:
				return None, errors.Error('A contract cannot specify two infinity cases, e.g., cases with a "+" in it')

			has_infinity_case = True
			try:
				start_range = int(k.strip('+'))
				end_range = INTERNAL_LATE_FEE_INFINITY
				ranges.append((start_range, end_range, float(v)))
			except Exception as e:
				return None, errors.Error('A late fee key that ends with a "+" must be a number followed by a +')
		else:
			parts = k.split('-')
			if len(parts) != 2:
				return None, errors.Error('Each key to the late fee structure must be number-number, or number+. This key is missing a dash: "{}"'.format(k))

			try:
				start_range = int(parts[0])
				end_range = int(parts[1])
				ranges.append((start_range, end_range, float(v)))
			except Exception as e:
				return None, errors.Error('Each range in the late fee structure must be number-number. "{}" does not contain all integers'.format(k))

			if start_range >= end_range:
				return None, errors.Error('Start of the range may not be bigger or equal to the end of the range')

	if not has_infinity_case:
		return None, errors.Error('No infinity, end of range case supplied, e.g., one with a "+" in it')

	ranges.sort(key=lambda r: r[0]) # sort increasing by the smallest range

	# Ensure that ranges specified are mutually exclusive.
	for i in range(len(ranges) - 1):
		cur_range = ranges[i]
		(start_range, end_range, _) = cur_range
		# Make sure this range cant be found in any other range (non-overlapping)

		compare_range = ranges[i+1]
		(compare_start_range, compare_end_range, _) = compare_range

		if end_range + 1 != compare_start_range:
			return None, errors.Error('Range {} overlaps or is not consecutive with {}'.format(cur_range, compare_range))

	initial_start_range = ranges[0][0]
	if initial_start_range != 1:
		return None, errors.Error('The first range must start with day 1')

	return ranges, None

DynamicInterestRate = NamedTuple('DynamicInterestRate', [
	('start_date', datetime.date), 
	('end_date', datetime.date), 
	('interest_rate', float)
])

class DynamicInterestRateHelper(object):

	def __init__(self, dynamic_interest_rates: List[DynamicInterestRate], private: bool) -> None:
		self._dynamic_interest_rates = dynamic_interest_rates

	def get_interest_rate(self, cur_date: datetime.date) -> Tuple[float, errors.Error]:
		# Find the contract that fits in between the time range

		for dynamic_rate in self._dynamic_interest_rates:
			if cur_date >= dynamic_rate.start_date and cur_date <= dynamic_rate.end_date:
				return dynamic_rate.interest_rate, None

		return None, errors.Error(f'There is no interest rate configured for the date {cur_date}')

	@staticmethod
	def build(
		dynamic_interest_rate_dict: Dict[str, float],
		contract_start_date: datetime.date,
		contract_end_date: datetime.date) -> Tuple['DynamicInterestRateHelper', errors.Error]:

		sorted_dynamic_interest_rates = []
		keys = list(dynamic_interest_rate_dict.keys())
		for i in range(len(keys)):
			key = keys[i]
			interest_rate = dynamic_interest_rate_dict[key]
			parts = key.split('-')
			if len(parts) != 2:
				return None, errors.Error('Dynamic interest rate is missing a start and end date. Got {}'.format(key))

			start_date_str = parts[0]
			end_date_str = parts[1]
			try:
				start_date = date_util.load_date_str(start_date_str)
			except Exception as e:
				return None, errors.Error('Invalid start date provided: {}'.format(start_date_str))

			try:
				end_date = date_util.load_date_str(end_date_str)
			except Exception as e:
				return None, errors.Error('Invalid end date provided: {}'.format(end_date_str))

			rate = DynamicInterestRate(
				start_date=start_date,
				end_date=end_date,
				interest_rate=interest_rate
			)

			sorted_dynamic_interest_rates.append(rate)

		sorted_dynamic_interest_rates.sort(key=lambda c: c.start_date)

		for i in range(len(sorted_dynamic_interest_rates)):
			if i == 0:
				continue

			prev = sorted_dynamic_interest_rates[i - 1]
			cur = sorted_dynamic_interest_rates[i]
			if cur.start_date < prev.end_date:
				return None, errors.Error(f'Interest rate #{(i - 1) + 1} has a start and end range ({prev.start_date}, {prev.end_date}) which overlaps in time with interest rate #{i + 1} ({cur.start_date}, {cur.end_date})')

		validate_contract_range = contract_start_date and contract_end_date
		if validate_contract_range:
			for i in range(len(sorted_dynamic_interest_rates)):
				cur = sorted_dynamic_interest_rates[i]

				if i == 0:
					if cur.start_date != contract_start_date:
						return None, errors.Error('The first dynamic interest rate must be on the first day of the contract')

				if cur.end_date < cur.start_date:
					return None, errors.Error('Dynamic interest rate end date must come after the start date')

				if i > 0:
					prev = sorted_dynamic_interest_rates[i - 1]
					if prev.end_date + timedelta(days=1) != cur.start_date:
						return None, errors.Error('Dynamic interest rate ranges must come one day after the previous one, so there is no gap. Found a gap between {} and {}'.format(
							prev.end_date, cur.start_date))

				if i == len(sorted_dynamic_interest_rates) - 1:
					if cur.end_date != contract_end_date:
						return None, errors.Error('The last dynamic interest rate must be on the last day of the contract')

		return DynamicInterestRateHelper(sorted_dynamic_interest_rates, private=True), None

MinimumOwedDict = TypedDict('MinimumOwedDict', {
	'duration': str,
	'amount': float
})

class Contract(object):
	"""
		Represents a contract stored as JSON
	"""

	def __init__(self, c: models.ContractDict, private: bool) -> None:
		self.contract_id = c['id']
		self._contract_dict = c
		self._private = private
		self._config = c['product_config']
		self._is_populated = False
		self._field_dicts: List[FieldDict] = []
		self._internal_name_to_field: Dict[str, FullFieldDict] = {}

		"""
			A late fee range specified like
			{
				"1-7": 0.25,
				"8-10": 0.6,
				"10+": 1.0
			}
			will be stored as:
			[(1, 7, 0.25), (8, 10, 0.6), (10, "inf", 1.0)]
		"""
		self._late_fee_ranges: List[Tuple[int, int, float]] = []

	def get_product_config(self) -> Dict:
		# NOTE: This may be modified in the "build" function to add additional fields
		# if this was an older config
		return self._config

	def _populate(self, throw_error: bool = True) -> Tuple[bool, errors.Error]:
		if self._is_populated:
			return True, None

		if 'version' not in self._config:
			msg = 'Version does not exist in the contract config provided'
			if throw_error:
				raise Exception(msg)
			else:
				return None, errors.Error(msg)

		if self._config['version'] not in self._config:
			msg = 'Current version doesnt exist in the contract config. Got version {}'.format(self._config['version'])
			if throw_error:
				raise Exception(msg)
			else:
				return None, errors.Error(msg)

		orig_fields = cast(List[FullFieldDict], self._config[self._config['version']]['fields'])

		self._field_dicts = []
		for field in orig_fields:
			self._field_dicts.append(FieldDict(
				name=field['internal_name'],
				value=field['value']
			))
			self._internal_name_to_field[field['internal_name']] = field

		return True, None

	def _get_field(self, internal_name: str) -> Tuple[FullFieldDict, errors.Error]:
		self._populate()
		if internal_name not in self._internal_name_to_field:
			return None, errors.Error(
				'Non-existent field "{}" provided to get contract field'.format(internal_name),
				details={'contract_config': self._config})

		return self._internal_name_to_field[internal_name], None

	def _get_bool_value(self, internal_name: str) -> Tuple[bool, errors.Error]:
		field, err = self._get_field(internal_name)
		if err:
			return None, err

		# Checking if field['value'] allows us to permit None, which is treated as False.
		if field['value'] and type(field['value']) != bool:
			return None, errors.Error(
				'Got an "{}" which is not stored as a boolean'.format(internal_name),
				details={'contract_config': self._config})

		return field['value'], None

	def _get_float_value(self, internal_name: str, default_if_null: float = None) -> Tuple[float, errors.Error]:
		field, err = self._get_field(internal_name)
		if err:
			return None, err

		if field['value'] is None and default_if_null is not None:
			return default_if_null, None

		if type(field['value']) != float and type(field['value']) != int:
			return None, errors.Error(
				'Got an "{}" which is not stored as a number'.format(internal_name),
				details={'contract_config': self._config})

		return field['value'], None

	def _get_int_value(self, internal_name: str) -> Tuple[float, errors.Error]:
		field, err = self._get_field(internal_name)
		if err:
			return None, err

		if type(field['value']) != int:
			return None, errors.Error(
				'Got a field "{}" which is not stored as an integer'.format(internal_name),
				details={'contract_config': self._config})

		return field['value'], None

	def _get_string_value(self, internal_name: str) -> Tuple[str, errors.Error]:
		field, err = self._get_field(internal_name)
		if err:
			return None, err

		if field['value'] and type(field['value']) != str:
			return None, errors.Error(
				'Got a field "{}" which is not stored as an string'.format(internal_name),
				details={'contract_config': self._config})

		return field['value'], None

	def get_product_type(self) -> Tuple[str, errors.Error]:
		if 'product_type' not in self._config:
			return None, errors.Error('Product type missing from contract config')

		return self._config['product_type'], None

	def get_start_date(self) -> Tuple[datetime.date, errors.Error]:
		if 'start_date' not in self._contract_dict:
			return None, errors.Error('Start date missing in contract')

		start_date = self._contract_dict['start_date']
		if not start_date:
			return None, errors.Error('Start date in contract is not valid')

		return start_date, None

	def get_adjusted_end_date(self) -> Tuple[datetime.date, errors.Error]:
		if 'adjusted_end_date' not in self._contract_dict:
			return None, errors.Error('Adjusted end date missing in contract')

		adjusted_end_date = self._contract_dict['adjusted_end_date']
		if not adjusted_end_date:
			return None, errors.Error('Adjusted end date in contract is not valid')

		return adjusted_end_date, None

	def get_timezone_str(self) -> Tuple[str, errors.Error]:
		if 'timezone' not in self._config:
			return date_util.DEFAULT_TIMEZONE, None

		return self._config['timezone'], None

	def get_us_state(self) -> Tuple[str, errors.Error]:
		if 'us_state' not in self._config:
			return 'CA', None

		return self._config['us_state'], None

	def get_maximum_principal_limit(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('maximum_amount')

	def get_advance_rate(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('advance_rate')

	def _get_minimum_monthly_amount(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('minimum_monthly_amount')

	def _get_minimum_quarterly_amount(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('minimum_quarterly_amount')

	def _get_minimum_annual_amount(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('minimum_annual_amount')

	def get_include_borrowing_base_for_limits(self) -> Tuple[bool, errors.Error]:
		# Yes, we include borrowing base in credit limit calculations for all LOC customers.
		# Previously we did not for a temporary period of time (hence the commented out code).

		# return self._get_bool_value('include_borrowing_base_for_limits')
		return True, None

	def get_minimum_amount_owed_per_duration(self) -> Tuple[MinimumOwedDict, errors.Error]:
		minimum_monthly_amount, err = self._get_minimum_monthly_amount()
		if minimum_monthly_amount is not None:

			return MinimumOwedDict(
				duration=MinimumAmountDuration.MONTHLY,
				amount=minimum_monthly_amount
			), None

		minimum_quarterly_amount, err = self._get_minimum_quarterly_amount()
		if minimum_quarterly_amount is not None:
			return MinimumOwedDict(
				duration=MinimumAmountDuration.QUARTERLY,
				amount=minimum_quarterly_amount
			), None

		minimum_annual_amount, err = self._get_minimum_annual_amount()
		if minimum_annual_amount is not None:
			return MinimumOwedDict(
				duration=MinimumAmountDuration.ANNUALLY,
				amount=minimum_annual_amount
			), None

		return None, errors.Error('No minimum amount is established for monthly, quarterly or annually')

	def get_factoring_fee_threshold(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('factoring_fee_threshold', default_if_null=0.0)

	def get_factoring_fee_threshold_starting_value(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('factoring_fee_threshold_starting_value')

	def get_discounted_interest_rate_due_to_factoring_fee(self, cur_date: datetime.date) -> Tuple[float, errors.Error]:
		factoring_fee_threshold, err = self._get_float_value('factoring_fee_threshold', default_if_null=0.0)
		if err:
			return None, err

		# If there is no Volume Discount (Factoring Fee) Threshold
		# set, return the normal interest rate.
		if factoring_fee_threshold <= 0.0:
			return self.get_interest_rate(cur_date)
		else:
			return self._get_float_value('adjusted_factoring_fee_percentage', default_if_null=0.0)

	def _get_fixed_interest_rate(self) -> Tuple[float, errors.Error]:
		# Returns interest rate in decimal format (0.0 = 0%, 1.0 = 100%).
		return self._get_float_value('factoring_fee_percentage')

	def _get_dynamic_interest_rate_dict(self) -> Dict[str, float]:
		dynamic_interest_rate_field = self._internal_name_to_field.get('dynamic_interest_rate')
		dynamic_interest_rate_dict = dynamic_interest_rate_field['value'] if dynamic_interest_rate_field else {}
		is_dynamic_interest_rate_set = dynamic_interest_rate_dict and \
			len(list(dynamic_interest_rate_dict.keys())) > 0

		return dynamic_interest_rate_dict if is_dynamic_interest_rate_set else None

	def get_interest_rate(self, cur_date: datetime.date) -> Tuple[float, errors.Error]:
		# Returns interest rate in decimal format (0.0 = 0%, 1.0 = 100%).
		dynamic_interest_rate_dict = self._get_dynamic_interest_rate_dict()

		if dynamic_interest_rate_dict:
			dynamic_helper, err = DynamicInterestRateHelper.build(
				dynamic_interest_rate_dict,
				contract_start_date=None,
				contract_end_date=None)
			if err:
				return None, err

			return dynamic_helper.get_interest_rate(cur_date)

		return self._get_float_value('factoring_fee_percentage')

	def get_wire_fee(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('wire_fee')

	def _use_preceeding_business_day(self) -> Tuple[bool, errors.Error]:
		business_only_supports_succeeding_business_day = True
		if business_only_supports_succeeding_business_day:
			# When this is set to True, everybody must be the succeeding business day
			return False, None

		product_type, err = self.get_product_type()
		if err:
			return None, err

		if product_type == ProductType.LINE_OF_CREDIT:
			# Always use succeeding business day for line of credit product type.
			return False, None
		else:
			return self._get_bool_value('preceeding_business_day')

	def get_maturity_date(self, advance_settlement_date: datetime.date) -> Tuple[datetime.date, errors.Error]:
		"""
			Get the maturity date of a loan that starts with it's advance on this
			particular settlement date
		"""
		product_type, err = self.get_product_type()
		if err:
			return None, err

		if product_type == ProductType.LINE_OF_CREDIT:
			end_date, err = self.get_adjusted_end_date()
			if err:
				return None, err

			return date_util.get_nearest_business_day(end_date, preceeding=False), None
		else:
			num_days_after_repayment, err = self._get_int_value('contract_financing_terms')
			if err:
				return None, err

			maturity_date = advance_settlement_date + timedelta(days=num_days_after_repayment)
			return maturity_date, None

	def get_adjusted_maturity_date(self, advance_settlement_date: datetime.date) -> Tuple[datetime.date, errors.Error]:
		"""
			Get the maturity date of a loan that starts with it's advance on this
			particular settlement date
		"""
		maturity_date, err = self.get_maturity_date(advance_settlement_date)
		if err:
			return None, err

		use_preceeding, err = self._use_preceeding_business_day()
		if err:
			return None, err

		return date_util.get_nearest_business_day(maturity_date, preceeding=use_preceeding), None

	def get_fee_multiplier(self, days_past_due: int) -> Tuple[float, errors.Error]:
		"""
			Past on how many days past due this loan is, we have a multiplier of how
			much we will take today's interest and add onto it.

			For example, if the late fee structure is 25% more when things are 1-7 late,
			then this returns 0.25 as the multiplier.
		"""
		product_type, err = self.get_product_type()
		if err:
			return None, err

		# There is no fee multiplier for Line of Credit product type.
		if product_type == ProductType.LINE_OF_CREDIT:
			return 0.0, None

		self._populate()

		if not self._late_fee_ranges:
			# Cache and parse the late fee structure once.
			self._late_fee_ranges, err = _parse_late_fee_structure(self._internal_name_to_field.get('late_fee_structure'))
			if err:
				return None, err

		n = days_past_due

		for (start_range, end_range, multiplier) in self._late_fee_ranges:
			if end_range == INTERNAL_LATE_FEE_INFINITY:
				# Special case when we are dealing with the 7+ case for example
				if n >= start_range:
					return multiplier, None
			elif n >= start_range and n <= end_range:
				return multiplier, None

		return None, errors.Error(
			'Could not find a matching fee multiplier for days_past_due={}'.format(
				days_past_due))

	def get_fields(self) -> List[FieldDict]:
		self._populate()

		return self._field_dicts

	def _validate_dynamic_interest_rate(self) -> Tuple[bool, errors.Error]:
		dynamic_interest_rate_dict = self._get_dynamic_interest_rate_dict()

		fixed_interest_rate, err = self._get_fixed_interest_rate()
		is_fixed_interest_rate_set = fixed_interest_rate is not None

		if dynamic_interest_rate_dict and is_fixed_interest_rate_set:
			return False, errors.Error('The dynamic and fixed interest rate may not both be set. Please fill in one or the other.')

		if not dynamic_interest_rate_dict and not is_fixed_interest_rate_set:
			return False, errors.Error('Either the dynamic or fixed interest rate must be set. Please fill in one or the other.')

		if dynamic_interest_rate_dict:
			contract_start_date, err = self.get_start_date()
			if err:
				return None, err

			contract_end_date, err = self.get_adjusted_end_date()
			if err:
				return None, err

			_, err = DynamicInterestRateHelper.build(
				dynamic_interest_rate_dict, contract_start_date, contract_end_date)
			if err:
				return None, err

		return True, None

	def validate(self) -> errors.Error:
		minimum_monthly_amount, err = self._get_minimum_monthly_amount()
		minimum_quarterly_amount, err = self._get_minimum_quarterly_amount()
		minimum_annual_amount, err = self._get_minimum_annual_amount()

		if minimum_monthly_amount and minimum_quarterly_amount:
			return errors.Error('The minimum monthly and quarterly amount may not be set at the same time')

		if minimum_quarterly_amount and minimum_annual_amount:
			return errors.Error('The minimum quarterly and annual amount may not be set at the same time')

		if minimum_monthly_amount and minimum_annual_amount:
			return errors.Error('The minimum monthly and annual amount may not be set at the same time')

		# Volume discount starting value check if the threshold is set.
		factoring_fee_threshold, err = self.get_factoring_fee_threshold()
		has_threshold_set = factoring_fee_threshold > 0.0
		starting_value, starting_value_err = self.get_factoring_fee_threshold_starting_value()
		if has_threshold_set and starting_value is None:
			return errors.Error('Factoring Fee Threshold Starting Value must be set if the Factoring Fee Threshold is set')

		_, err = self._validate_dynamic_interest_rate()
		if err:
			return err

		return None

	def for_product_type(self) -> Tuple['Contract', errors.Error]:
		product_type, err = self.get_product_type()
		if err:
			return None, err

		Constructor = {
			ProductType.LINE_OF_CREDIT: LOCContract,
			ProductType.INVENTORY_FINANCING: InventoryFinancingContract,
			ProductType.INVOICE_FINANCING: InvoiceFinancingContract,
			ProductType.PURCHASE_MONEY_FINANCING: PMFContract,
		}.get(product_type)

		if not Constructor:
			return None, errors.Error(f"Cannot coerce '{product_type}' contracts to a subclass")

		obj = Constructor(self._contract_dict, self._private)
		obj._populate()
		return obj, None

	@staticmethod
	def build(contract_dict: models.ContractDict, validate: bool) -> Tuple['Contract', errors.Error]:
		"""
			Method that constructs a helper to read a Contract.

			Optionally, it will validate the structure and validity of how the contract
			was setup.

			This function may update fields
			that may not have existed on this contract due to schema changes or additional
			fields added to the contract.
		"""
		contract = Contract(contract_dict, private=True)

		if validate:
			concrete_object, err = contract.for_product_type()
			if err:
				return None, err

			err = concrete_object.validate()
			if err:
				return None, err

		return contract, None


class InventoryFinancingContract(Contract):
	"""Stubbed subclass so that we can start handling the vagaries of
	different contract types"""

	def __init__(self, c: models.ContractDict, private: bool) -> None:
		super(InventoryFinancingContract, self).__init__(c, private)

	def validate(self) -> errors.Error:
		err = super().validate()
		if err:
			return err
		_, err = self.get_fee_multiplier(days_past_due=1)
		return err


class InvoiceFinancingContract(Contract):

	def __init__(self, c: models.ContractDict, private: bool) -> None:
		super(InvoiceFinancingContract, self).__init__(c, private)

	def validate(self) -> errors.Error:
		err = super().validate()
		if err:
			return err

		_, err = self.get_fee_multiplier(days_past_due=1)
		return err


class PMFContract(Contract):

	def __init__(self, c: models.ContractDict, private: bool) -> None:
		super(PMFContract, self).__init__(c, private)

	def validate(self) -> errors.Error:
		err = super().validate()
		if err:
			return err

		_, err = self.get_fee_multiplier(days_past_due=1)
		return err

class LOCContract(Contract):

	def __init__(self, c: models.ContractDict, private: bool) -> None:
		super(LOCContract, self).__init__(c, private)

	def get_borrowing_base_accounts_receivable_percentage(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('borrowing_base_accounts_receivable_percentage', default_if_null=0.0)

	def get_borrowing_base_inventory_percentage(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('borrowing_base_inventory_percentage', default_if_null=0.0)

	def get_borrowing_base_cash_percentage(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('borrowing_base_cash_percentage', default_if_null=0.0)

	def get_borrowing_base_cash_in_daca_percentage(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('borrowing_base_cash_in_daca_percentage', default_if_null=0.0)

	# Based on https://github.com/bespoke-capital/platform/blob/3d0574e2d1198137ff089f02ddafe383708c0d0e/services/app/src/components/EbbaApplication/CreateEbbaApplicationModal.tsx#L44-L76
	def compute_borrowing_base(self, ebba: models.EbbaApplicationDict) -> Tuple[float, errors.Error]:
		accounts_receivable_percentage, err = self.get_borrowing_base_accounts_receivable_percentage()
		if err:
			return None, err

		inventory_percentage, err = self.get_borrowing_base_inventory_percentage()
		if err:
			return None, err

		cash_percentage, err = self.get_borrowing_base_cash_percentage()
		if err:
			return None, err

		cash_in_daca_percentage, err = self.get_borrowing_base_cash_in_daca_percentage()
		if err:
			return None, err

		borrowing_base = \
			((ebba['monthly_accounts_receivable'] or 0.0) * accounts_receivable_percentage) \
			+ ((ebba['monthly_inventory'] or 0.0) * inventory_percentage) \
			+ ((ebba['monthly_cash'] or 0.0) * cash_percentage) \
			+ ((ebba['amount_cash_in_daca'] or 0.0) * cash_in_daca_percentage)

		return borrowing_base, None

	def validate(self) -> errors.Error:
		err = super().validate()
		if err:
			return err

		fields = (
			'borrowing_base_accounts_receivable_percentage',
			'borrowing_base_inventory_percentage',
			'borrowing_base_cash_percentage',
			'borrowing_base_cash_in_daca_percentage',
		)

		for field in fields:
			v, err = getattr(self, f"get_{field}")()
			if err:
				return err

			if v < 0.0 or 1.0 < v:
				return errors.Error(
					f"'{field}' must have a value between 0 and 1"
				)

		return None


def get_active_contracts_by_company_ids(
	company_ids: List[str],
	session: Session,
	err_details: Dict,
) -> Tuple[Dict[str, Contract], errors.Error]:
	companies = cast(
		List[models.Company],
		session.query(models.Company).filter(
			models.Company.id.in_(company_ids)
		).all())
	if not companies or len(companies) != len(company_ids):
		return None, errors.Error('Could not find all the companies associated with the request', details=err_details)

	contract_ids = []
	companies_with_missing_contracts = []
	for company in companies:
		if not company.contract_id:
			companies_with_missing_contracts.append(str(company.name))
		else:
			contract_ids.append(str(company.contract_id))

	if companies_with_missing_contracts:
		return None, errors.Error('{} have missing contracts, cannot proceed with the current function'.format(companies_with_missing_contracts), details=err_details)

	contracts = cast(
		List[models.Contract],
		session.query(models.Contract).filter(
			models.Contract.id.in_(contract_ids)
		).all())
	if not contracts or len(contracts) != len(contract_ids):
		return None, errors.Error('Could not find all the contracts associated with all companies provided', details=err_details)

	company_id_to_contract = {}
	for contract in contracts:
		company_id = str(contract.company_id)
		contract_obj, err = Contract.build(contract.as_dict(), validate=False)
		if err:
			return None, err
		company_id_to_contract[company_id] = contract_obj

	return company_id_to_contract, None


def get_active_contract_by_company_id(
	company_id: str,
	session: Session,
) -> Tuple[Contract, errors.Error]:
	company_id_to_contract, err = get_active_contracts_by_company_ids(
		company_ids=[company_id],
		session=session,
		err_details={
			'method': 'get_active_contract_by_company_id',
		},
	)

	if err:
		return None, err

	return company_id_to_contract[company_id], None


class ContractHelper(object):

	def __init__(self, contract_dicts: List[models.ContractDict], private: bool) -> None:
		self._contract_dicts = contract_dicts

	def get_contract(self, cur_date: datetime.date) -> Tuple[Contract, errors.Error]:
		# Find the contract that fits in between the time range

		for cur_contract in self._contract_dicts:
			if cur_date >= cur_contract['start_date'] and cur_date <= cur_contract['adjusted_end_date']:
				return Contract.build(cur_contract, validate=False)

		return None, errors.Error(f'There is no contract configured for the date {cur_date}')

	@staticmethod
	def build(company_id: str, contract_dicts: List[models.ContractDict]) -> Tuple['ContractHelper', errors.Error]:
		if not contract_dicts:
			return None, errors.Error('No contracts have been setup for company: {}'.format(company_id))

		sorted_contract_dicts = []
		for i in range(len(contract_dicts)):
			c = contract_dicts[i]
			if not c.get('start_date'):
				return None, errors.Error('Contract #{} for company {} is missing a start_date'.format(i + 1, company_id))

			if not c.get('adjusted_end_date'):
				return None, errors.Error('Contract #{} for company {} is missing an adjusted_end_date'.format(i + 1, company_id))

			sorted_contract_dicts.append(c)

		sorted_contract_dicts.sort(key=lambda c: c['start_date'])

		for i in range(len(sorted_contract_dicts)):
			if i == 0:
				continue

			prev_contract = sorted_contract_dicts[i - 1]
			cur_contract = sorted_contract_dicts[i]
			if cur_contract['start_date'] < prev_contract['adjusted_end_date']:
				return None, errors.Error(f'Contract #{(i - 1) + 1} has a start and end range ({prev_contract["start_date"]}, {prev_contract["adjusted_end_date"]}) which overlaps in time with Contract #{i + 1} ({cur_contract["start_date"]}, {cur_contract["adjusted_end_date"]})')

		return ContractHelper(sorted_contract_dicts, private=True), None
