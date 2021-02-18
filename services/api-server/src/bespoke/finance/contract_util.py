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

	def get_product_type(self) -> Tuple[str, errors.Error]:
		if 'product_type' not in self._config:
			return None, errors.Error('Product type missing from contract config')

		return self._config['product_type'], None

	def get_maximum_principal_limit(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('maximum_amount')

	def get_interest_rate(self) -> Tuple[float, errors.Error]:
		return self._get_float_value('factoring_fee_percentage')

	def get_fields(self) -> List[FieldDict]:
		self._populate()

		return self._field_dicts

