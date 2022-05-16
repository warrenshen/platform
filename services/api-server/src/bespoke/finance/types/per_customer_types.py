"""
  Types that are associated with the financials on a per customer basis.
"""

from mypy_extensions import TypedDict
from typing import List

from bespoke.db.models import (
	AugmentedTransactionDict,
	ContractDict, CompanySettingsDict,
	LoanDict, PaymentDict, EbbaApplicationDict, InvoiceDict,
	PurchaseOrderDict
)

Financials = TypedDict('Financials', {
	'contracts': List[ContractDict],
	'loans': List[LoanDict],
	'payments': List[PaymentDict],
	'invoices': List[InvoiceDict],
	'purchase_orders': List[PurchaseOrderDict],
	'augmented_transactions': List[AugmentedTransactionDict],
	'ebba_applications': List[EbbaApplicationDict],
	'active_ebba_application': EbbaApplicationDict,
})

CompanyInfoDict = TypedDict('CompanyInfoDict', {
	'id': str,
	'name': str
})

CustomerFinancials = TypedDict('CustomerFinancials', {
	'company_info': CompanyInfoDict,
	'company_settings': CompanySettingsDict,
	'financials': Financials
})
