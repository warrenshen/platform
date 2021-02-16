from mypy_extensions import TypedDict
from typing import Dict, List
from bespoke.db import models

FieldDict = TypedDict('FieldDict', {
		'name': str,
		'value': str
})

class Contract(object):
	"""
		Represents a contract stored as JSON
	"""

	def __init__(self, contract: models.ContractDict):
		self._c = contract
		self._config = contract['product_config']

	def get_fields(self) -> List[FieldDict]:
		if 'version' not in self._config:
			return []

		if self._config['version'] not in self._config:
			raise Exception('Current version doesnt exist in the config. Got version {}'.format(self._config['version']))

		orig_fields = self._config[self._config['version']]['fields']
		field_dicts = []
		for field in orig_fields:
			field_dicts.append(FieldDict(
				name=field['internal_name'],
				value=field['value']
			))
		return field_dicts

