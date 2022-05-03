import os
import sys

from os import path
from typing import Iterable, List

sys.path.append(path.realpath(path.join(os.getcwd(), "../../src")))
from bespoke.inventory.analysis.shared.create_queries import *


def create_inventory_days_since_package_metric_query(company_identifier,license_numbers, include_quantity_zero, sales_transactions_start_date):
    inventory_query = create_company_inventory_packages_query(
        company_identifier,
        include_quantity_zero=include_quantity_zero,
        license_numbers=license_numbers,
    )
    query_sales = create_company_sales_receipts_with_transactions_query(
        company_identifier,
        sales_transactions_start_date,
        license_numbers=license_numbers,
    )
    days_sold_since_package_metric_query = '''
        SELECT 
            sales.license_number,
            sales.receipt_number,
            sales.rt_type,
            sales.sales_customer_type,
            sales.sales_datetime,
            sales.sales_month,
            sales.total_packages,
            sales.rt_total_price,
            sales.tx_type,
            sales.tx_package_id,
            sales.tx_package_label,
            sales.tx_product_name,
            sales.tx_product_category_name,
            sales.tx_unit_of_measure,
            sales.tx_quantity_sold,
            sales.tx_total_price,
            sales.tx_total_price / sales.tx_quantity_sold AS price_per_unit,
            inventory.package_id,
            inventory.package_label,
            inventory.type,
            inventory.packaged_date,
            inventory.last_modified_at,
            inventory.package_type,
            inventory.product_name,
            inventory.product_category_name,
            inventory.quantity,
            inventory.unit_of_measure,
            inventory.item_id,
            inventory.item_product_category_type,
            inventory.production_batch_number,
            inventory.source_production_batch_numbers,
            inventory.source_harvest_names,
            inventory.is_testing_sample,
            inventory.is_trade_sample,
            inventory.is_on_hold,
            inventory.archived_date,
            inventory.finished_date,
            DATE_DIFF(DATE(sales.sales_datetime), DATE(inventory.packaged_date), DAY) AS sales_days_diff,
            DATE_DIFF(DATE(inventory.last_modified_at), DATE(inventory.packaged_date), DAY) AS inventory_days_diff
        FROM 
            ({QUERY_SALES}) AS sales
        INNER JOIN
            ({QUERY_INVENTORY}) AS inventory
        ON 
            sales.tx_package_id = inventory.package_id 
        ORDER BY packaged_date DESC
    '''
    days_sold_since_package_metric_query = days_sold_since_package_metric_query.format(QUERY_SALES=query_sales,
                                                                                       QUERY_INVENTORY=inventory_query)
    return days_sold_since_package_metric_query

def create_inventory_days_since_package_metric_query_by_product_name(company_identifier,license_numbers, include_quantity_zero, sales_transactions_start_date):
    inventory_query = create_company_inventory_packages_query(
        company_identifier,
        include_quantity_zero=include_quantity_zero,
        license_numbers=license_numbers,
    )
    query_sales = create_company_sales_receipts_with_transactions_query(
        company_identifier,
        sales_transactions_start_date,
        license_numbers=license_numbers,
    )
    days_sold_since_package_metric_query = '''
        SELECT 
            sales.license_number,
            sales.receipt_number,
            sales.rt_type,
            sales.sales_customer_type,
            sales.sales_datetime,
            sales.sales_month,
            sales.total_packages,
            sales.rt_total_price,
            sales.tx_type,
            sales.tx_package_id,
            sales.tx_package_label,
            sales.tx_product_name,
            sales.tx_product_category_name,
            sales.tx_unit_of_measure,
            sales.tx_quantity_sold,
            sales.tx_total_price,
            sales.tx_total_price / sales.tx_quantity_sold AS price_per_unit,
            inventory.package_id,
            inventory.package_label,
            inventory.type,
            inventory.packaged_date,
            inventory.last_modified_at,
            inventory.package_type,
            inventory.product_name,
            inventory.product_category_name,
            inventory.quantity,
            inventory.unit_of_measure,
            inventory.item_id,
            inventory.item_product_category_type,
            inventory.production_batch_number,
            inventory.source_production_batch_numbers,
            inventory.source_harvest_names,
            inventory.is_testing_sample,
            inventory.is_trade_sample,
            inventory.is_on_hold,
            inventory.archived_date,
            inventory.finished_date,
            DATE_DIFF(DATE(sales.sales_datetime), DATE(inventory.packaged_date), DAY) AS sales_days_diff,
            DATE_DIFF(DATE(inventory.last_modified_at), DATE(inventory.packaged_date), DAY) AS inventory_days_diff
        FROM 
            ({QUERY_INVENTORY}) AS inventory
        LEFT JOIN
            ({QUERY_SALES}) AS sales
        ON 
            sales.tx_product_name = inventory.product_name 
        ORDER BY packaged_date DESC
    '''
    days_sold_since_package_metric_query = days_sold_since_package_metric_query.format(QUERY_SALES=query_sales,
                                                                                       QUERY_INVENTORY=inventory_query)
    return days_sold_since_package_metric_query

def create_company_freshness_metric_query(company_identifier, license_numbers, include_quantity_zero, sales_transactions_start_date, groupby_col):
    days_sold_query = create_inventory_days_since_package_metric_query(company_identifier,license_numbers, include_quantity_zero, sales_transactions_start_date)
    freshness_metric_query = '''
        SELECT 
            {GROUPBY_COL},
            AVG(CASE WHEN sales_days_diff > 0 THEN sales_days_diff ELSE 0 END) AS avg_days_since_sale,
            MAX(CASE WHEN sales_days_diff > 0 THEN sales_days_diff ELSE 0 END) AS max_days_since_sale,
            MIN(CASE WHEN sales_days_diff > 0 THEN sales_days_diff ELSE 0 END) AS min_days_since_sale,
            COUNT({GROUPBY_COL}) AS number_of_sales,
            AVG(price_per_unit) AS avg_sale_price
        FROM 
            ({DAYS_SOLD_QUERY}) AS days_sold
        GROUP BY 
            {GROUPBY_COL}
    '''
    freshness_metric_query = freshness_metric_query.format(GROUPBY_COL=groupby_col, DAYS_SOLD_QUERY=days_sold_query)
    return freshness_metric_query


def create_company_inventory_valudation_by_last_sale_price(company_identifier, license_numbers, include_quantity_zero, sales_transactions_start_date, by_product = True):
    if by_product:
        days_sold_query = create_inventory_days_since_package_metric_query_by_product_name(company_identifier,
                                                                                           license_numbers,
                                                                                           include_quantity_zero,
                                                                                           sales_transactions_start_date
                                                                                           )
    else:
        days_sold_query = create_inventory_days_since_package_metric_query(company_identifier,
                                                                           license_numbers,
                                                                           include_quantity_zero,
                                                                           sales_transactions_start_date
                                                                           )
    company_inventory_valudation_query = '''
        SELECT 
            SUM(last_sold_price_valuation) AS total_inventory_valuation
        FROM
            (
            SELECT
                package_id,
                price_per_unit * quantity AS last_sold_price_valuation,
                row_number() OVER (PARTITION BY package_id, product_name ORDER BY sales_datetime DESC) AS day_sold_rank
            FROM 
                ({DAYS_SOLD_QUERY}) AS days_sold
            ) AS days_sold_date_rank
        WHERE days_sold_date_rank.day_sold_rank = 1
    '''
    company_inventory_valudation_query = company_inventory_valudation_query.format(DAYS_SOLD_QUERY=days_sold_query)
    return company_inventory_valudation_query


def create_company_inventory_valudation_by_discounting_time_value(company_identifier, license_numbers, include_quantity_zero, sales_transactions_start_date, discount_rate, by_product=True):
    if by_product:
        days_sold_query = create_inventory_days_since_package_metric_query_by_product_name(company_identifier,
                                                                                           license_numbers,
                                                                                           include_quantity_zero,
                                                                                           sales_transactions_start_date
                                                                                           )
    else:
        days_sold_query = create_inventory_days_since_package_metric_query(company_identifier,
                                                                           license_numbers,
                                                                           include_quantity_zero,
                                                                           sales_transactions_start_date
                                                                           )
    discount_rate = 1 + discount_rate
    company_inventory_valudation_query = '''
        SELECT 
            SUM(quantity * avg_price_per_unit * POW({DISCOUNT_RATE}, inventory_year_diff)) AS total_inventory_valuation
        FROM
            (
            SELECT
                package_id,
                product_name,
                quantity,
                inventory_days_diff / 365 AS inventory_year_diff,
                avg(price_per_unit) AS avg_price_per_unit 
            FROM 
                ({DAYS_SOLD_QUERY}) AS days_sold
            GROUP BY 
                package_id,
                product_name,
                quantity,
                inventory_year_diff
            ) AS days_sold_date_rank
    '''
    company_inventory_valudation_query = company_inventory_valudation_query.format(DAYS_SOLD_QUERY=days_sold_query,
                                                                                   DISCOUNT_RATE=discount_rate)
    return company_inventory_valudation_query


def best_selling_products_by_liquidity(company_identifier, license_numbers, include_quantity_zero, sales_transactions_start_date, groupby_col, order_col, direction, top_k):
    base_query = create_company_freshness_metric_query(company_identifier, license_numbers, include_quantity_zero, sales_transactions_start_date, groupby_col)
    best_selling_query = '''
        SELECT
            *
        FROM 
            ({BASE_QUERY}) AS base_query
        WHERE 
            number_of_sales > 10
        ORDER BY 
            {ORDER_COL} {DIRECTION}
        LIMIT 
            {N}
    '''
    best_selling_query = best_selling_query.format(BASE_QUERY=base_query, ORDER_COL=order_col, DIRECTION=direction, N=top_k)
    return best_selling_query


