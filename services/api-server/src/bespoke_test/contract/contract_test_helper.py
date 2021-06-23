"""
	A file that helps you create contracts for different products
"""
from typing import Dict, cast

from bespoke.db import models
from bespoke.db import db_constants
from bespoke.db.db_constants import ProductType
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session

ContractInputDict = TypedDict('ContractInputDict', {
	'contract_financing_terms': int,
	'interest_rate': float,
	'advance_rate': float,
	'maximum_principal_amount': float,
	'max_days_until_repayment': int,
	'late_fee_structure': str,
	'dynamic_interest_rate': str,
	'preceeding_business_day': bool,
	'minimum_monthly_amount': float,
	'minimum_quarterly_amount': float,
	'minimum_annual_amount': float,
	'factoring_fee_threshold': float,
	'factoring_fee_threshold_starting_value': float,
	'adjusted_factoring_fee_percentage': float,
	'wire_fee': float,
	'repayment_type_settlement_timeline': str,
	'timezone': str,
	# LOC contracts
	'borrowing_base_accounts_receivable_percentage': float,
	'borrowing_base_inventory_percentage': float,
	'borrowing_base_cash_percentage': float,
	'borrowing_base_cash_in_daca_percentage': float
}, total=False)

def create_contract_config(
	product_type: str, input_dict: ContractInputDict, version: int = 1) -> Dict:
	if product_type not in db_constants.PRODUCT_TYPES:
		raise Exception('Unknown product type provided {}'.format(product_type))

	version_key = 'v{}'.format(version)
	# Shared fields across all product types
	fields = [
		{
			'internal_name': 'factoring_fee_percentage',
			'value': input_dict.get('interest_rate', None)
		},
		{
			'internal_name': 'maximum_amount',
			'value': input_dict['maximum_principal_amount']
		},
		{
			'internal_name': 'minimum_monthly_amount',
			'value': input_dict.get('minimum_monthly_amount', None)
		},
		{
			'internal_name': 'minimum_quarterly_amount',
			'value': input_dict.get('minimum_quarterly_amount', None)
		},
		{
			'internal_name': 'minimum_annual_amount',
			'value': input_dict.get('minimum_annual_amount', None)
		},
		{
			'internal_name': 'timezone',
			'value': input_dict.get('timezone', None)
		},
		{
			'internal_name': 'advance_rate',
			'value': input_dict.get('advance_rate', 1.0)
		},
		{
			'internal_name': 'factoring_fee_threshold',
			'value': input_dict.get('factoring_fee_threshold', None)
		},
		{
			'internal_name': 'factoring_fee_threshold_starting_value',
			'value': input_dict.get('factoring_fee_threshold_starting_value', None)
		},
		{
			'internal_name': 'adjusted_factoring_fee_percentage',
			'value': input_dict.get('adjusted_factoring_fee_percentage', None)
		},
		{
			'internal_name': 'wire_fee',
			'value': input_dict.get('wire_fee', 0.0)
		},
		{
			'internal_name': 'repayment_type_settlement_timeline',
			'value': input_dict.get('repayment_type_settlement_timeline', '{}')
		}
	]

	# Note the internal_name must match the input_dict key for all these new fields
	new_field_names = ['dynamic_interest_rate']
	for new_field_name in new_field_names:
		if new_field_name in input_dict:
			fields.append(
				{
						'internal_name': new_field_name,
						'value': cast(Dict, input_dict)[new_field_name]
				}
			)

	if product_type != ProductType.LINE_OF_CREDIT:
		# Non-LOC fields
		fields.extend([
			{
				'internal_name': 'contract_financing_terms',
				'value': input_dict['max_days_until_repayment']
			},
			{
				'internal_name': 'late_fee_structure',
				'value': input_dict['late_fee_structure']
			},
			{
				'internal_name': 'preceeding_business_day',
				'value': input_dict.get('preceeding_business_day')
			}
		])

	if product_type == ProductType.LINE_OF_CREDIT:
		borrowing_base_fields = (
			'borrowing_base_accounts_receivable_percentage',
			'borrowing_base_inventory_percentage',
			'borrowing_base_cash_percentage',
			'borrowing_base_cash_in_daca_percentage',
		)

		for field in borrowing_base_fields:
			value = input_dict.get(field)
			fields.append({'internal_name': field, 'value': value})

		# TODO(dlluncor): Remove this feature once we figure out how we want to
		# treat borrowing limits in the long-term.
		fields.extend([
			{
				'internal_name': 	'include_borrowing_base_for_limits',
				'value': True
			}
		])

	return {
		'version': version_key,
		'product_type': product_type,
		version_key: {
			'fields': fields
		}
	}

def set_and_add_contract_for_company(
	contract: models.Contract, company_id: str, session: Session) -> None:
	session.add(contract)
	session.flush()
	contract_id = str(contract.id)

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())

	if not company:
		raise Exception('No company found matching company_id={}'.format(company_id))

	company.contract_id = contract_id

