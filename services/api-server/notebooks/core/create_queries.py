import os
import sys

from os import path
from typing import Iterable

sys.path.append(path.realpath(path.join(os.getcwd(), "../../src")))
from bespoke.inventory.analysis.shared.create_queries import *

# Company queries: get data for a specific-company.
def create_company_licenses_query(company_identifier: str) -> str:
    return f"""
        select
            company_licenses.us_state,
            company_licenses.license_number,
            company_licenses.license_category,
            company_licenses.legal_name,
            company_licenses.is_current,
            company_licenses.license_status,
            company_licenses.rollup_id,
            company_licenses.license_description
        from
            company_licenses
            inner join companies on company_licenses.company_id = companies.id
        where
            True
            and companies.identifier = "{company_identifier}"
    """

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
