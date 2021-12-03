import pandas as pd
from typing import List, Dict

def dedupe_sales_transactions(sales_receipts_with_transactions_dataframe: pd.DataFrame) -> pd.DataFrame:
		sales_receipts_with_transactions_dataframe.drop_duplicates(
			subset=['receipt_number', 'tx_package_id'],
			keep='last',
			inplace=True
		)
		return sales_receipts_with_transactions_dataframe
