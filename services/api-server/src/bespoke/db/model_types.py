from typing import Union, List
from mypy_extensions import TypedDict

PayoutItemsCoveredDict = TypedDict('PayoutItemsCoveredDict', {
})

FeeItemsCoveredDict = TypedDict('FeeItemsCoveredDict', {
	'effective_month': str, # for booking month-end minimum fees
}, total=False) 

PaymentItemsCoveredDict = TypedDict('PaymentItemsCoveredDict', {
	'loan_ids': List[str],
	'invoice_ids': List[str],
	'requested_to_principal': float,
	'requested_to_interest': float,
	'requested_to_account_fees': float,
	'to_principal': float,
	'to_interest': float,
	'to_account_fees': float,
	'to_user_credit': float,
}, total=False)

ItemsCoveredDict = Union[PaymentItemsCoveredDict, FeeItemsCoveredDict, PayoutItemsCoveredDict]