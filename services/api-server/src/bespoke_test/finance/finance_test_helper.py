import decimal
from typing import cast, Any

from bespoke.date import date_util
from bespoke.db import models

def get_default_financial_summary(
	total_limit: float, 
	available_limit: float,
	product_type: str,
	date_str: str = None,
	company_id: str = None,
	total_outstanding_interest: float = 0.0,
	minimum_interest_info: models.MinimumInterestInfoDict = None,
) -> models.FinancialSummary:
	date = date_util.load_date_str(date_str) if date_str else None

	return models.FinancialSummary(
		total_limit=decimal.Decimal(total_limit),
		adjusted_total_limit=decimal.Decimal(total_limit),
		total_outstanding_principal=decimal.Decimal(0.0),
		total_outstanding_principal_for_interest=decimal.Decimal(0.0),
		total_outstanding_interest=decimal.Decimal(total_outstanding_interest),
		total_outstanding_fees=decimal.Decimal(0.0),
		total_principal_in_requested_state=decimal.Decimal(0.0),
		interest_accrued_today=decimal.Decimal(0.0),
		available_limit=decimal.Decimal(available_limit),
		minimum_monthly_payload=minimum_interest_info if minimum_interest_info else cast(Any, {}),
		account_level_balance_payload={},
		product_type=product_type,
		date=date,
		company_id=company_id
	)
