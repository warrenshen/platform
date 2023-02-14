from typing import Union, List
from mypy_extensions import TypedDict

PayoutItemsCoveredDict = TypedDict('PayoutItemsCoveredDict', {
})

FeeItemsCoveredDict = TypedDict('FeeItemsCoveredDict', {
	'effective_month': str, # for booking month-end minimum fees
}, total=False) 

# NOTE(JR): consider renaming Payment to Repayment to better align with terminology elsewhere in code base
PaymentItemsCoveredDict = TypedDict('PaymentItemsCoveredDict', {
	'loan_ids': List[str],
	'invoice_ids': List[str],
	'requested_from_holding_account': float,
	'requested_to_principal': float,
	'requested_to_interest': float,
	'requested_to_late_fees': float,
	'requested_to_account_fees': float,
	'forecasted_principal': float,
	'forecasted_interest': float,
	'forecasted_late_fees': float,
	'forecasted_account_fees': float,
	'to_principal': float,
	'to_interest': float,
	'to_late_fees': float,
	'to_account_fees': float,
	'to_user_credit': float
}, total=False)

ItemsCoveredDict = Union[PaymentItemsCoveredDict, FeeItemsCoveredDict, PayoutItemsCoveredDict]
