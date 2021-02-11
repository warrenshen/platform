"""
  Types that are associated with the financials on a per customer basis.
"""

from mypy_extensions import TypedDict
from typing import List

from bespoke.db.models import (
	CompanyDict, CompanySettingsDict,
	LoanDict, TransactionDict, PaymentDict
)

Financials = TypedDict('Financials', {
	'loans': List[LoanDict],
	'payments': List[PaymentDict],
	'transactions': List[TransactionDict]
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
