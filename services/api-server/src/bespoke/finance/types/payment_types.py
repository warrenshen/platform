import datetime
from typing import List

from mypy_extensions import TypedDict

################################
# requested_to_principal: how much of payment customer wants to go to principal (relevant for Line of Credit payments only)
# requested_to_interest: how much of payment customer wants to go to interest (relevant for Line of Credit payments only)
# requested_to_account_fees: how much of payment customer wants to go to account-level fees (relevant for all payments)
# "requested_to_" fields are set during the "create repayment" step.
#
# to_principal: how much of payment went to principal (relevant for Line of Credit payments only)
# to_interest: how much of payment went to interest (relevant for Line of Credit payments only)
# to_account_fees: how much of payment went to account fees (relevant for all payments)
# to_user_credit: how much of payment went to user credit (relevant for all payments)
# "to_" fields are set during the "settle repayment" step.
################################
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

PaymentInputDict = TypedDict('PaymentInputDict', {
	'type': str,
	'payment_method': str,
	'amount': float,
})

TransactionAmountDict = TypedDict('TransactionAmountDict', {
	'to_principal': float,
	'to_interest': float,
	'to_fees': float
})

RepaymentPaymentInputDict = TypedDict('RepaymentPaymentInputDict', {
	'payment_method': str,
	'requested_amount': float,
	'requested_payment_date': datetime.date,
	'payment_date': datetime.date,
	'items_covered': PaymentItemsCoveredDict,
	'company_bank_account_id': str,
	'customer_note': str
})

PaymentInsertInputDict = TypedDict('PaymentInsertInputDict', {
	'company_id': str,
	'type': str,
	'requested_amount': float,
	'amount': float,
	'method': str,
	'requested_payment_date': str,
	'payment_date': str,
	'settlement_date': str,
	'items_covered': PaymentItemsCoveredDict,
	'company_bank_account_id': str,
	'customer_note': str,
	'bank_note': str
})
