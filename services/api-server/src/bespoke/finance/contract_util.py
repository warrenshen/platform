from mypy_extensions import TypedDict
from typing import Dict, List

FieldDict = TypedDict('FieldDict', {
		'name': str,
		'value': str
})

class Contract(object):
	"""
		Represents a contract stored as JSON
	"""

	def __init__(self, product_config: Dict):
		self._c = product_config

	def get_fields(self) -> List[FieldDict]:
		if 'version' not in self._c:
			return []

		if self._c['version'] not in self._c:
			raise Exception('Current version doesnt exist in the config. Got version {}'.format(self._c['version']))

		orig_fields = self._c[self._c['version']]['fields']
		field_dicts = []
		for field in orig_fields:
			field_dicts.append(FieldDict(
				name=field['internal_name'],
				value=field['value']
			))
		return field_dicts

