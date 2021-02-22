import datetime
import json
import logging
import sys

from datetime import timedelta
from mypy_extensions import TypedDict
from typing import cast, Tuple, Dict, List, Any

from bespoke import errors
from bespoke.db import models

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

INTERNAL_LATE_FEE_INFINITY = sys.maxsize

def _parse_late_fee_structure(late_fee_field: FullFieldDict) -> List[Tuple[int, int, float]]:

	if not late_fee_field:
		logging.error('Warning no late fee structure specified in contract')
		return []
	
	late_fee_structure_str = late_fee_field['value']
	if not late_fee_structure_str:
		# TODO(dlluncor): This should actually throw an error once we have
		# contracts with late fee structures specified.
		logging.error('Warning no late fee structure specified in contract')
		return []

	try:
		late_fee_structure = json.loads(late_fee_structure_str)
	except Exception as e:
		raise Exception('Late fee structure is not stored as a valid JSON')

	if type(late_fee_structure) != dict:
		raise Exception('Late fee structure is not a dict')

	if not late_fee_structure:
		raise Exception('no ranges provided in this late fee structure')

	ranges = []

	for k, v in late_fee_structure.items():
		is_number = type(v) == float or type(v) == int
		if type(k) != str or not is_number:
			raise Exception('Invalid late fee structure. The key must be a string and the value must be a float')

		# the key can either be an integer range 1-5, or it can be the tail-end
		# of a range, e.g., 7+
		has_infinity_case = False
		if k.endswith('+'):
			if has_infinity_case:
				raise Exception('A contract cannot specify two infinity cases, e.g., cases with a "+" in it')
			
			has_infinity_case = True
			try:
				start_range = int(k.strip('+'))
				end_range = INTERNAL_LATE_FEE_INFINITY
				ranges.append((start_range, end_range, float(v)))
			except Exception as e:
				raise Exception('A late fee key that ends with a "+" must be a number followed by a +') 
		else:
			parts = k.split('-')
			if len(parts) != 2:
				raise Exception('Each key to the late fee structure must be number-number, or number+. This key is missing a dash: "{}"'.format(k))

			try:
				start_range = int(parts[0])
				end_range = int(parts[1])
				ranges.append((start_range, end_range, float(v)))
			except Exception as e:
				raise Exception('Each range in the late fee structure must be number-number. "{}" does not contain all integers'.format(k))

			if start_range >= end_range:
				raise Exception('Start of the range may not be bigger or equal to the end of the range')

	if not has_infinity_case:
		raise Exception('No infinity, end of range case supplied, e.g., one with a "+" in it')

	ranges.sort(key=lambda r: r[0]) # sort increasing by the smallest range

	# Ensure that ranges specified are mutually exclusive.
	for i in range(len(ranges) - 1):
		cur_range = ranges[i]
		(start_range, end_range, _) = cur_range
		# Make sure this range cant be found in any other range (non-overlapping)

		compare_range = ranges[i+1]
		(compare_start_range, compare_end_range, _) = compare_range

		if end_range + 1 != compare_start_range:
			raise Exception('Range {} overlaps or is not consecutive with {}'.format(cur_range, compare_range))

	initial_start_range = ranges[0][0]
	if initial_start_range != 1:
		raise Exception('The first range must start with day 1')

	return ranges

class Contract(object):
	"""
		Represents a contract stored as JSON
	"""

	def __init__(self, contract: models.ContractDict) -> None:
		self._c = contract
		self._config = contract['product_config']
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

	def _populate(self) -> None:
		if self._is_populated:
			return

		if 'version' not in self._config:
			raise Exception('Version does not exist in the contract config provided')

		if self._config['version'] not in self._config:
			raise Exception('Current version doesnt exist in the contract config. Got version {}'.format(self._config['version']))

		orig_fields = cast(List[FullFieldDict], self._config[self._config['version']]['fields'])
		
		self._field_dicts = []
		for field in orig_fields:
			self._field_dicts.append(FieldDict(
				name=field['internal_name'],
				value=field['value']
			))
			self._internal_name_to_field[field['internal_name']] = field

	def _get_field(self, internal_name: str) -> Tuple[FullFieldDict, errors.Error]:
		self._populate()
		if internal_name not in self._internal_name_to_field:
			return None, errors.Error(
				'Non-existent field "{}" provided to get contract field'.format(internal_name), 
				details={'contract_config': self._config})

		return self._internal_name_to_field[internal_name], None

	def _get_float_value(self, internal_name: str) -> Tuple[float, errors.Error]:
		field, err = self._get_field(internal_name)
		if err:
			return None, err

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

	def get_maximum_principal_limit(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('maximum_amount')

	def get_interest_rate(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('factoring_fee_percentage')

	def get_fee_multiplier(self, days_past_due: int) -> Tuple[float, errors.Error]:
		"""
			Past on how many days past due this loan is, we have a multiplier of how
			much we will take today's interest and add onto it.

			For example, if the late fee structure is 25% more when things are 1-7 late,
			then this returns 0.25 as the multiplier.
		"""
		self._populate()

		if not self._late_fee_ranges:
			# Cache and parse the late fee structure once.
			self._late_fee_ranges = _parse_late_fee_structure(self._internal_name_to_field.get('late_fee_structure'))

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


	def get_maturity_date(self, advance_settlement_date: datetime.date) -> Tuple[datetime.date, errors.Error]:
		"""
			Get the maturity date of a loan that starts with it's advance on this
			particular settlement date
		"""
		num_days_after_repayment, err = self._get_int_value('contract_financing_terms')
		if err:
			return None, err

		maturity_date = advance_settlement_date + timedelta(days=num_days_after_repayment)
		return maturity_date, None

	def get_fields(self) -> List[FieldDict]:
		self._populate()

		return self._field_dicts

