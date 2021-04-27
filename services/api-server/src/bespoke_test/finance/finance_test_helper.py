import decimal

from bespoke.db import models

def get_default_financial_summary(total_limit: float, available_limit: float) -> models.FinancialSummary:
	return models.FinancialSummary(
		total_limit=decimal.Decimal(total_limit),
		adjusted_total_limit=decimal.Decimal(total_limit),
		total_outstanding_principal=decimal.Decimal(0.0),
		total_outstanding_principal_for_interest=decimal.Decimal(0.0),
		total_outstanding_interest=decimal.Decimal(0.0),
		total_outstanding_fees=decimal.Decimal(0.0),
		total_principal_in_requested_state=decimal.Decimal(0.0),
		interest_accrued_today=decimal.Decimal(0.0),
		available_limit=decimal.Decimal(available_limit),
		minimum_monthly_payload={},
		account_level_balance_payload={}
	)
