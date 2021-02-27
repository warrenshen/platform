"""
	A file that helps you create contracts for different products
"""
from mypy_extensions import TypedDict
from typing import Dict

from bespoke.db import db_constants

ContractInputDict = TypedDict('ContractInputDict', {
	'interest_rate': float,
	'maximum_principal_amount': float,
	'max_days_until_repayment': int,
	'late_fee_structure': str,
	'borrowing_base_accounts_receivable_percentage': float,
	'borrowing_base_inventory_percentage': float,
	'borrowing_base_cash_percentage': float,
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
		},
		{
			'internal_name': 'late_fee_structure',
			'value': input_dict['late_fee_structure']
		},
	]

	borrowing_base_fields = (
		'borrowing_base_accounts_receivable_percentage',
		'borrowing_base_inventory_percentage',
		'borrowing_base_cash_percentage'
	)

	for field in borrowing_base_fields:
		value = input_dict.get(field)
		if value:
			fields.append({'internal_name': field, 'value': value})

	return {
		'version': version_key,
		'product_type': product_type,
		version_key: {
			'fields': fields
		}
	}