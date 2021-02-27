"""
  Types that are associated with the financials on a per customer basis.
"""

from mypy_extensions import TypedDict
from typing import List

from bespoke.db.models import (
	ContractDict, CompanyDict, CompanySettingsDict,
	LoanDict, TransactionDict, PaymentDict, EbbaApplicationDict
)

Financials = TypedDict('Financials', {
	'contracts': List[ContractDict],
	'loans': List[LoanDict],
	'payments': List[PaymentDict],
	'transactions': List[TransactionDict],
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
