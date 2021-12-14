import os
import sys

from os import path
from typing import Iterable, List

sys.path.append(path.realpath(path.join(os.getcwd(), "../../src")))

from bespoke.inventory.analysis.shared.create_queries import *

def create_company_download_summaries_query(company_identifier: str, start_date: str, end_date:str=None) -> str:
	end_date_where_clause = f"""
		and metrc_download_summaries.date <= "{end_date}"
	""" if end_date else ''
	return f"""
		select
			metrc_download_summaries.license_number,
			metrc_download_summaries.date,
			metrc_download_summaries.status
		from
			metrc_download_summaries
			inner join companies on metrc_download_summaries.company_id = companies.id
		where
			True
			and companies.identifier = "{company_identifier}"
			and metrc_download_summaries.date >= "{start_date}"
			{end_date_where_clause}
		order by
			date desc
	"""

def create_company_grouped_gmv_by_receipts_query(company_identifier: str, start_date: str, group_type: str) -> str:
	if group_type not in ['week', 'month']:
		return 'Invalid group type'
	return f"""
		select
			date_trunc(metrc_sales_receipts.sales_datetime, {group_type}) as sales_{group_type},
			sum(metrc_sales_receipts.total_price) as month_gmv
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
		where
			True
			and companies.identifier = "{company_identifier}"
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
		group by
			1
		order by
			1
	"""

def create_company_weekly_gmv_by_receipts_query(company_identifier: str, start_date: str) -> str:
	return create_company_grouped_gmv_by_receipts_query(company_identifier, start_date, 'week')

def create_company_monthly_gmv_by_receipts_query(company_identifier: str, start_date: str) -> str:
	return create_company_grouped_gmv_by_receipts_query(company_identifier, start_date, 'month')

def create_company_monthly_units_sold_query(company_identifier, start_date):
	return f"""
		select
			date_trunc(metrc_sales_receipts.sales_datetime, month) as sales_month,
			sum(metrc_sales_transactions.quantity_sold) as month_units_sold
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		where
			True
			and companies.identifier = "{company_identifier}"
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
			and metrc_sales_transactions.unit_of_measure = 'Each'
		group by
			1
		order by
			1
	"""

def create_company_monthly_units_sold_by_product_category_name_query(company_identifier, start_date):
	return f"""
		select
			date_trunc(metrc_sales_receipts.sales_datetime, month) as sales_month,
			metrc_sales_transactions.product_category_name,
			sum(metrc_sales_transactions.quantity_sold) as month_units_sold
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		where
			True
			and companies.identifier = "{company_identifier}"
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
			and metrc_sales_transactions.unit_of_measure = 'Each'
		group by
			1,
			2
		order by
			1,
			2
	"""

def create_company_incoming_transfer_packages_for_analysis_query(
	company_identifier: str,
	license_numbers: List[str] = None,
) -> str:
	license_numbers = [f"'{license_number}'" for license_number in license_numbers] if license_numbers else None
	license_numbers_where_clause = f"""
		and company_deliveries.license_number in ({','.join(license_numbers)})
	""" if license_numbers else ''

	return f"""
		select
			case
				when company_deliveries.delivery_type = 'INCOMING_UNKNOWN' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'OUTGOING_UNKNOWN' then 'OUTGOING_TO_PAYOR'
				when company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' then 'OUTGOING_TO_PAYOR'
				else company_deliveries.delivery_type
			end as delivery_type,
			company_deliveries.license_number,
			metrc_deliveries.shipment_type_name,
			metrc_deliveries.shipment_transaction_type,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_payload.shipmentpackagestate as shipment_package_state,
			metrc_transfer_packages.package_payload.receiverwholesaleprice as receiver_wholesale_price,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.received_unit_of_measure
		from
			metrc_transfers
			inner join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			inner join companies on company_deliveries.company_id = companies.id
			inner join metrc_deliveries on metrc_transfers.id = metrc_deliveries.transfer_row_id
			inner join metrc_transfer_packages on metrc_deliveries.id = metrc_transfer_packages.delivery_row_id
		where
			True
			and companies.identifier = "{company_identifier}"
			and (
				company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' or
				company_deliveries.delivery_type = 'INCOMING_INTERNAL' or
				company_deliveries.delivery_type = 'INCOMING_UNKNOWN'
			)
			{license_numbers_where_clause}
		order by
			metrc_transfers.created_date desc
	"""

def create_company_inventory_packages_for_analysis_query(
	company_identifier: str,
	license_numbers: List[str] = None,
) -> str:
	license_numbers = [f"'{license_number}'" for license_number in license_numbers] if license_numbers else None
	license_numbers_where_clause = f"""
		and metrc_packages.license_number in ({','.join(license_numbers)})
	""" if license_numbers else ''

	return f"""
		select
			metrc_packages.license_number,
			metrc_packages.package_id,
			metrc_packages.package_type
		from
			companies
			inner join metrc_packages on companies.id = metrc_packages.company_id
		where
			True
			and companies.identifier = "{company_identifier}"
			{license_numbers_where_clause}
		order by
			metrc_packages.packaged_date desc
	"""

def create_company_sales_transactions_for_analysis_query(
	company_identifier: str,
	license_numbers: List[str]=None,
) -> str:
	"""
	Note the left outer join of metrc_sales_transactions.
	"""
	license_numbers = [f"'{license_number}'" for license_number in license_numbers] if license_numbers else None
	license_numbers_where_clause = f"""
		and metrc_sales_receipts.license_number in ({','.join(license_numbers)})
	""" if license_numbers else ''

	return f"""
		select
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.receipt_id,
			metrc_sales_transactions.package_id,
			metrc_sales_transactions.product_name,
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		where
			True
			and companies.identifier = "{company_identifier}"
			{license_numbers_where_clause}
		order by
			metrc_sales_receipts.sales_datetime desc
	"""

def create_api_keys_for_analysis_query(
) -> str:
	return f"""
		select
			companies.identifier,
			companies.name,
			metrc_api_keys.us_state,
			metrc_api_keys.is_functioning,
			metrc_api_keys.facilities_payload
		from
			metrc_api_keys
			inner join companies on metrc_api_keys.company_id = companies.id
		where
			True
		order by
			metrc_api_keys.last_used_at desc
	"""

