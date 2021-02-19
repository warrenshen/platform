"""
	A file that helps you create contracts for different products
"""
from mypy_extensions import TypedDict
from typing import Dict

from bespoke.db import db_constants

ContractInputDict = TypedDict('ContractInputDict', {
	'interest_rate': float,
	'maximum_principal_amount': float,
	'max_days_until_repayment': int
})

def create_contract_config(
	product_type: str, input_dict: ContractInputDict, version: int = 1) -> Dict:
	if product_type not in db_constants.PRODUCT_TYPES:
		raise Exception('Unknown product type provided {}'.format(product_type))

	version_key = 'v{}'.format(version)
	fields = [
		{
			'internal_name': 'factoring_fee_percentage',
			'value': input_dict['interest_rate']
		},
		{
			'internal_name': 'maximum_amount',
			'value': input_dict['maximum_principal_amount']
		},
		{
			'internal_name': 'contract_financing_terms',
			'value': input_dict['max_days_until_repayment']
		}
	]

	return {
		'version': version_key,
		'product_type': product_type,
		version_key: {
			'fields': fields
		}
	}