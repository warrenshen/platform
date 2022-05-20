import os
import sys

from os import path
from typing import Iterable, List
import json
import numpy as np
import click
import os
import pandas as pd
import pyarrow
import sys
import math
from datetime import date
from dotenv import load_dotenv
from sqlalchemy import create_engine
from os import path
import pickle
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple
from collections import defaultdict
import seaborn as sns

sys.path.append(path.realpath(path.join(os.getcwd(), "../../src")))
from bespoke.inventory.analysis.shared.create_queries import *
from underwriting import inventory_freshness_analysis_query as ifa_query

BIGQUERY_CREDENTIALS_PATH = os.environ.get('BIGQUERY_CREDENTIALS_PATH')
engine = create_engine('bigquery://bespoke-financial/ProdMetrcData', credentials_path=os.path.expanduser(BIGQUERY_CREDENTIALS_PATH))

TRANSFER_PACKAGES_START_DATE = '2020-01-01'

PRODUCT_SELF_LIFE_DICT = {
    'Flower': .5,
    'Trim': .5,
    'Fresh Frozen': 999,
    'Edibles': 1,
    'Wax': 1,
    'Resin': 1,
    'Tinctures': 1,
    'Vapes': 1,
    'Shatter': 1,
    'Concentrates': 1,
    'Rosin': 1,
}

PRODUCT_CATEGORY_NAME_2_PRODUCT_TYPE = {
    'Buds':	'Flower',
    'Buds (by strain)':	'Flower',
    'Concentrate': 'Concentrates',
    'Concentrate (each)': 'Concentrates',
    'Edibles': 'Edibles',
    'Edibles (each)': 'Edibles',
    'Edible (volume - each)': 'Edibles',
    'Edible (weight)': 'Edibles',
    'Edible (weight - each)': 'Edibles',
    'Extracts':	'Concentrates',
    'Extracts (each)': 'Concentrates',
    'Extract (volume)':	'Concentrates',
    'Extract (volume - each)': 'Concentrates',
    'Extract (weight)':	'Concentrates',
    'Extract (weight - each)': 'Concentrates',
    'Flower': 'Flower',
    'Flower (packaged - each)':	'Flower',
    'Flower (packaged eighth - each)': 'Flower',
    'Flower (packaged gram - each)': 'Flower',
    'Flower (packaged half ounce - each)': 'Flower',
    'Flower (packaged ounce - each)': 'Flower',
    'Flower (packaged quarter - each)':	'Flower',
    'Fresh Cannabis Plant': 'Flower',
    'Hemp Concentrate': 'Concentrates',
    'Immature Plant': 'Flower',
    'Immature Plants': 'Flower',
    'Infused Butter/Oil (volume - each)': 'Edibles',
    'Infused Butter/Oil (weight)': 'Edibles',
    'Infused Butter/Oil (weight - each)': 'Edibles',
    'Infused Pre-Roll':	'Flower',
    'Inhalable Cannabinoid Product with Non-Cannabis Additives': 'Concentrates',
    'Inhalable Cannabinoid Product with Non-Cannabis Additives (each)':	'Concentrates',
    'Inhalable Cannabinoid Product with Non-Cannabis Additives (with ingredients)':	'Concentrates',
    'Non-Infused (Plain) Pre-Roll':	'Flower',
    'Other Concentrate (volume)': 'Concentrates',
    'Other Concentrate (volume - each)': 'Concentrates',
    'Other Concentrate (weight)': 'Concentrates',
    'Other Concentrate (weight - each)': 'Concentrates',
    'Pre-Roll Flower': 'Flower',
    'Pre-Roll Infused':	'Flower',
    'Pre-Roll Leaf': 'Flower',
    'Shake': 'Flower',
    'Shake (Packaged Eighth - each)': 'Flower',
    'Shake (Packaged Gram - each)':	'Flower',
    'Shake (Packaged Half Ounce - each)': 'Flower',
    'Shake (Packaged Ounce - each)': 'Flower',
    'Shake (Packaged Quarter - each)': 'Flower',
    'Shake/Trim': 'Flower',
    'Shake/Trim (by strain)': 'Flower',
    'Tinctures (each)':	'Tinctures',
    'Tincture (volume)': 'Tinctures',
    'Tincture (volume - each)':	'Tinctures',
    'Tincture (weight - each)':	'Tinctures',
    'Topical (volume - each)': 'Tinctures',
    'Topical (weight - each)': 'Tinctures',
    'Vape Cartridge (volume - each)': 'Vapes',
    'Vape Cartridge (weight - each)': 'Vapes',
    'Whole Harvested Plant': 'Flower'
}

class Analyzer:
    def __init__(self):
        self.company_identifier = []
        self.license_numbers = []
        self.include_quantity_zero = True
        self.today = date.today()
        self.SALES_TRANSACTIONS_START_DATE = '2020-01-01'
        self.SALES_TRANSACTIONS_END_DATE = str(date.today())

    def run_query(self, query):
        data = pd.read_sql_query(query, engine)
        return data

    def update_class_attributes(self, company_identifier, licence_numbers, include_quantity_zero,
                                start_date='2020-01-01', end_date=str(date.today())):
        self.company_identifier = company_identifier
        self.license_numbers = licence_numbers
        self.include_quantity_zero = include_quantity_zero
        self.SALES_TRANSACTIONS_START_DATE = start_date
        self.SALES_TRANSACTIONS_END_DATE = end_date

    def find_most_valuable_products(self, groupby_col, order_col, direction, top_k):
        query = ifa_query.best_selling_products_by_liquidity(
            self.company_identifier,
            self.license_numbers,
            self.SALES_TRANSACTIONS_START_DATE,
            self.SALES_TRANSACTIONS_END_DATE,
            groupby_col,
            order_col,
            direction,
            top_k
        )
        return self.run_query(query)

    def get_inventory_valuation_query(self, method, by_product_name=True, discount_rate=.1):
        # method includes ['last_sale_valuation', 'discount_valuation']
        if method == 'last_sale_valuation':
            query = ifa_query.create_company_inventory_valudation_by_last_sale_price(
                self.company_identifier,
                self.license_numbers,
                self.include_quantity_zero,
                self.SALES_TRANSACTIONS_START_DATE,
                self.SALES_TRANSACTIONS_END_DATE,
                by_product_name
            )

        elif method == 'discount_valuation':
            query = ifa_query.create_company_inventory_valudation_by_discounting_time_value(
                self.company_identifier,
                self.license_numbers,
                self.include_quantity_zero,
                self.SALES_TRANSACTIONS_START_DATE,
                self.SALES_TRANSACTIONS_END_DATE,
                discount_rate,
                by_product_name
            )
        else:
            query = ''
            print('Please provide valuation method from the following: ')
            print(['last_sale_valuation', 'discount_valuation'])
        return self.run_query(query)

    def find_inventory_valuation(self, method, by_product_name=True, discount_rate=.1):
        data = self.get_inventory_valuation_query(method, by_product_name, discount_rate)
        data['product_type'] = data.product_category_name.apply(
            lambda x: PRODUCT_CATEGORY_NAME_2_PRODUCT_TYPE[x] if x in PRODUCT_CATEGORY_NAME_2_PRODUCT_TYPE else ''
        )
        data['shelf_life'] = data['product_type'].apply(
            lambda x: PRODUCT_SELF_LIFE_DICT[x] if x in PRODUCT_SELF_LIFE_DICT else 1
        )
        data['expired'] = data['inventory_year_diff'] > data['shelf_life']
        if method == 'last_sale_valuation':
            data['price_per_unit'][data['expired']] = 0
            valuation = np.sum(data['quantity'] * data['price_per_unit'])
        elif method == 'discount_valuation':
            data['discounted_price'][data['expired']] = 0
            valuation = np.sum(data['quantity'] * data['discounted_price'])
        else:
            valuation = 0
            print('Please provide valuation method from the following: ')
            print(['last_sale_valuation', 'discount_valuation'])
        return data, valuation

    def find_incoming_inventory_valuation(self, method, by_product_name=True, discount_rate=.1):
        query = ifa_query.create_company_incoming_inventory_valudation_by_discounting_time_value(
            self.company_identifier,
            self.license_numbers,
            self.include_quantity_zero,
            self.SALES_TRANSACTIONS_START_DATE,
            self.SALES_TRANSACTIONS_END_DATE,
            discount_rate,
            by_product_name
        )
        data = self.run_query(query)
        data['product_type'] = data.product_category_name.apply(
            lambda x: PRODUCT_CATEGORY_NAME_2_PRODUCT_TYPE[x] if x in PRODUCT_CATEGORY_NAME_2_PRODUCT_TYPE else ''
        )
        data['shelf_life'] = data['product_type'].apply(
            lambda x: PRODUCT_SELF_LIFE_DICT[x] if x in PRODUCT_SELF_LIFE_DICT else 1
        )
        data['expired'] = data['inventory_year_diff'] > data['shelf_life']
        if method == 'discount_valuation':
            data['discounted_price'][data['expired']] = 0
            valuation = np.sum(data['quantity'] * data['discounted_price'])
        else:
            valuation = 0
            print('Please provide valuation method from the following: ')
            print(['last_sale_valuation', 'discount_valuation'])
        return data, valuation

    def find_most_valuable_products_by_velocity_sales_weighted(self, groupby_col, top_k, normailize_by_quantity=False):
        base_query = ifa_query.create_company_sale_metric_query(
            self.company_identifier, self.license_numbers,
            self.SALES_TRANSACTIONS_START_DATE,
            self.SALES_TRANSACTIONS_END_DATE, groupby_col)
        order_col = 'quantity_sale_velocity_per_day' if normailize_by_quantity else 'sale_velocity_per_day'
        query = '''
            SELECT
                *,
                (CASE WHEN avg_days_since_sale <1 THEN number_of_sales ELSE number_of_sales/avg_days_since_sale END) AS sale_velocity_per_day,
                (CASE WHEN avg_days_since_sale <1 THEN number_of_sales ELSE quantity_sold/avg_days_since_sale END) AS quantity_sale_velocity_per_day
            FROM 
                ({BASE_QUERY}) AS base_query
            WHERE 
                number_of_sales > 10
            ORDER BY 
                {ORDER_COL} DESC
            LIMIT 
                {N}
        '''
        query = query.format(BASE_QUERY=base_query, ORDER_COL=order_col, N=top_k)
        return self.run_query(query)

    def find_all_valuation(self, by_product_name=True, discount_rate=.1):
        valuation_sales_last_sale = np.round(self.find_inventory_valuation(
            'last_sale_valuation', by_product_name, discount_rate)[1])
        print('#### Inventory Valuation based on sales data using last sale method: ${} ####'.format(
            valuation_sales_last_sale))
        valuation_sales_discount_time = np.round(self.find_inventory_valuation(
            'discount_valuation', by_product_name, discount_rate)[1])
        print('#### Inventory Valuation based on sales data using discount time method: ${} ####'.format(
            valuation_sales_discount_time))
        valuation_inventory_discount_time = np.round(self.find_incoming_inventory_valuation(
            'discount_valuation', by_product_name, discount_rate)[1])
        print('#### Inventory Valuation based on incoming data using discount time method: ${} ####'.format(
            valuation_inventory_discount_time))
        return valuation_sales_last_sale, valuation_sales_discount_time, valuation_inventory_discount_time

    def create_product_k_means_clusters(self):
        return

    def find_top_products_from_inventory(self):
        return
