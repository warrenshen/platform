import json
import numpy
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
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple
from collections import defaultdict
import seaborn as sns

from underwriting import data_quality_checks
from underwriting import msrp_band_analyzer_util as mba_util

sns.set(rc={'figure.figsize':(11.7,8.27)})


class MSRPBand:
    """
    A class used to include all msrp analysis functions and attributes
    """

    def __init__(self):
        self.company_identifier_list = mba_util.COMPANY_IDENTIFIER_LIST
        self.transfer_start_date = mba_util.TRANSFER_PACKAGES_START_DATE
        self.sales_start_date = mba_util.SALES_TRANSACTIONS_START_DATE
        self.current_month = mba_util.CURRENT_MONTH
        self.measurement_dict = mba_util.MEASUREMENT_DICT
        self.company_costs_df = None
        self.company_sales_df = None
        self.msrp_summary_table = None
        self.msrp_summary_table_by_time = None
        self.default_price_column = 'tx_price_per_unit'
        self.outlier_df = None

    def fetch_data(
            self,
            company_identifier: List[str],
            transfer_start_date: str,
            sales_start_date: str,
            current_month: str
    ):
        """
        Pulls data from data storage, output costs transaction data and sales transaction data

        Parameters
        ----------
        company_identifier: List of companies to pull data from
        transfer_start_date: Start date for pulling costs transaction data
        sales_start_date: Start date for pulling sales transaction data
        current_month: Current month
        ----------
        """

        df_in, df_sales_deduped = data_quality_checks.run(tuple(company_identifier), transfer_start_date, sales_start_date)[:2]
        return df_in, df_sales_deduped

    def update_company_data(self, company_identifier):
        """
        Calls the fetch_data function to saves the datasets as class attributes

        Parameters
        ----------
        company_identifier: List of companies to pull data from
        ----------
        """
        self.company_costs_df, self.company_sales_df = self.fetch_data(
            company_identifier,
            self.transfer_start_date,
            self.sales_start_date,
            self.current_month
        )
        print("### Adding new columns calculated by average price per unit ### \t")
        self.add_new_columns()
        print("### Sorting time series ### \t")
        self.sort_time_by_month()
        print("### Removing NAs from product category row ### \t")
        self.clean_product_category_na()
        print("### Combining same product categories with different measurements ### \t")
        self.company_costs_df = self.combine_product_category_with_different_measurements(
            self.company_costs_df,
            'product_category_name',
        )
        self.company_sales_df = self.combine_product_category_with_different_measurements(
            self.company_sales_df,
            'tx_product_category_name',
        )
        print("### Available combined product category name in costs dataframe ### \t")
        print(self.company_costs_df['combined_product_category'].unique())
        print("### Available combined product category name in sales dataframe ### \t")
        print(self.company_sales_df['combined_product_category'].unique())


    def clean_product_category_na(self):
        """
        remove NAs from given category
        """
        self.company_costs_df = self.company_costs_df[~self.company_costs_df['product_category_name'].isna()]
        self.company_sales_df = self.company_sales_df[~self.company_sales_df['tx_product_category_name'].isna()]

    def add_new_columns(self):
        """
        Add tx_price_per_unit column to both dataframes and date_in_month which extracts the date in month format
        """
        self.company_costs_df.loc[:, 'tx_price_per_unit'] = self.company_costs_df.shipper_wholesale_price / self.company_costs_df.shipped_quantity
        self.company_costs_df.loc[:, 'date_in_month'] = pd.to_datetime(self.company_costs_df.created_date).dt.strftime('%Y-%m')
        self.company_sales_df.loc[:, 'tx_price_per_unit'] = self.company_sales_df.tx_total_price / self.company_sales_df.tx_quantity_sold
        self.company_sales_df.loc[:, 'date_in_month'] = pd.to_datetime(self.company_sales_df.sales_datetime).dt.strftime('%Y-%m')

    def boxplot_distribution_outlier_check(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str
    ):
        temp_df = self.select_df_by_transaction_type(transaction_type)
        temp_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        sns.boxplot(y=category_column_name, x=self.default_price_column, data=temp_df, orient='h')
        plt.show()
        median = temp_df[self.default_price_column].median()
        q1 = temp_df[self.default_price_column].quantile(.25)
        q3 = temp_df[self.default_price_column].quantile(.75)
        iqr = q3 - q1
        maxx = median + iqr * 1.5
        minn = median - iqr * 1.5

        outlier_df = pd.concat([temp_df[temp_df[self.default_price_column] < minn], temp_df[temp_df[self.default_price_column] > maxx]])

        self.outlier_df = outlier_df
        if transaction_type == 'C':
            self.company_costs_df = self.company_costs_df[~self.company_costs_df.index.isin(outlier_df.index)]
        else:
            self.company_sales_df = self.company_sales_df[~self.company_sales_df.index.isin(outlier_df.index)]

        print("Number of transactions outliers below Boxplot Whisker Minimum is {} %".format(
            (temp_df[self.default_price_column] < minn).mean()))
        print("Number of transactions outliers above Boxplot Whisker Maximum is {} %".format(
            (temp_df[self.default_price_column] > maxx).mean()))

    def select_df_by_transaction_type(self, transaction_type):
        """
        Chooses either costs or sales data for analysis

        Parameters
        ----------
        transaction_type: Which of the two dataframes (costs or sales) to use
        ----------
        """
        if transaction_type == 'C':
            return self.company_costs_df
        elif transaction_type == 'S':
            return self.company_sales_df
        else:
            print('Transaction type not recognized, try inputting C for costs or S for sales')

    def histogram_distribution_check(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str
    ):
        """
        Plots histogram plot to check distribution
        """
        temp_df = self.select_df_by_transaction_type(transaction_type)
        temp_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        print("Total number of transactions for {} in {} : {}".format(
            column_name_identifier, category_column_name, temp_df.shape[0]))
        sns.histplot(data=temp_df, x=self.default_price_column)
        plt.show()
        return

    def summary_table_by_category(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str
    ):
        """
        Finds summary table and saves into a class attribute
        """
        temp_df = self.select_df_by_transaction_type(transaction_type)
        msrp_summary_table_agg = temp_df.groupby(category_column_name)[self.default_price_column].describe()
        self.msrp_summary_table = msrp_summary_table_agg.loc[column_name_identifier].round(2)
        print(self.msrp_summary_table)

    def summary_table_by_category_time(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str
    ):
        """
        Finds summary table by date in month and saves into a class attribute
        """
        temp_df = self.select_df_by_transaction_type(transaction_type)
        msrp_summary_table_by_time_agg = temp_df.groupby([category_column_name, 'date_in_month'])[self.default_price_column].describe()
        self.msrp_summary_table_by_time = msrp_summary_table_by_time_agg.loc[column_name_identifier].round(2)
        print(self.msrp_summary_table_by_time)

    def sort_time_by_month(self):
        self.company_costs_df.sort_values('date_in_month', inplace=True)
        self.company_sales_df.sort_values('date_in_month', inplace=True)

    def line_plot_time_series_msrp_by_category(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str,
            confidence_level: int,
            error_style: str
    ):
        """
        Plots times series line plot broken down by specified category
        """
        temp_df = self.select_df_by_transaction_type(transaction_type)
        msrp_category_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        msrp_mean_df = msrp_category_df.groupby('date_in_month')[self.default_price_column].mean().reset_index()
        self.msrp_summary_table_by_time['lower_confidence_band'] = self.msrp_summary_table_by_time['mean'] - self.msrp_summary_table_by_time['std']
        self.msrp_summary_table_by_time['upper_confidence_band'] = self.msrp_summary_table_by_time['mean'] + self.msrp_summary_table_by_time['std']
        print(self.msrp_summary_table_by_time[['lower_confidence_band', 'upper_confidence_band']])
        ax = sns.lineplot(
            data=msrp_category_df,
            x='date_in_month',
            y=self.default_price_column,
            ci=confidence_level,
            err_style=error_style
        )
        plt.xticks(
            rotation=45,
            horizontalalignment='right',
            fontweight='light',
            fontsize='x-large'
        )
        ax.set(title='MSRP for {}: {} over time by month'.format(category_column_name, column_name_identifier))
        # label points on the plot
        for x, y in zip(msrp_mean_df['date_in_month'], msrp_mean_df[self.default_price_column]):
            plt.text(x=x,
                     y=y-y*.05,
                     s='{: .1f}'.format(y),
                     color='red')
        for x, y in zip(self.msrp_summary_table_by_time.index, self.msrp_summary_table_by_time.lower_confidence_band):
            plt.text(x=x,
                     y=y-y*.05,
                     s='{: .1f}'.format(y),
                     color='purple')
        for x, y in zip(self.msrp_summary_table_by_time.index, self.msrp_summary_table_by_time.upper_confidence_band):
            plt.text(x=x,
                     y=y+y*.01,
                     s='{: .1f}'.format(y),
                     color='purple')
        plt.show()

    def unit_conversion_ratio(self, unit1, unit2):
        ratio = self.measurement_dict[unit1.lower()] / self.measurement_dict[unit2.lower()]
        return ratio

    def product_category_standard_unit_conversion(self, category_name):
        result = category_name if '(' not in category_name else category_name.split('(')[0].strip()
        return result.lower()

    def combine_product_category_with_different_measurements(self, df, product_category_name, *, measurement_unit='gram'):
        """
        Combine categories with different measurement system but same product
        Ex. Flower packaged gram and Flower packaged half ounce combined with measurement conversions
        """
        measure_ratio_column_name = 'measurement_ratio_vs_{}'.format(measurement_unit)
        measurement_list = self.measurement_dict.keys()
        df['adjusted_tx_price_per_unit'] = df['tx_price_per_unit']
        df[measure_ratio_column_name] = 1
        for measurement in measurement_list:
            includes_measurement = df[product_category_name].str.contains(measurement, case=False).values
            df[measure_ratio_column_name][includes_measurement] = self.unit_conversion_ratio(measurement, measurement_unit)
        df['adjusted_tx_price_per_unit'] = df['tx_price_per_unit'] / df[measure_ratio_column_name]
        df['combined_product_category'] = df[product_category_name].apply(self.product_category_standard_unit_conversion)
        return df

    def breakdown_product_category_into_brands(self, transaction_type):
        """
        Plots times series line plot broken down by specified category
        """
        return

    def run_analysis(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str
    ):
        """
        Runs all functions for analysis

        Parameters
        ----------
        category_column_name: Category level to use for analysis
        column_name_identifier: Name of category to indice
        transaction_type: Using costs df or sales df
        ----------
        """
        if category_column_name == 'product_category_combined':
            self.default_price_column = 'adjusted_tx_price_per_unit'
        else:
            self.default_price_column = 'tx_price_per_unit'
        print("### Outputting boxplot distribution plot and finding outliers outside of Whisksers ### \t")
        self.boxplot_distribution_outlier_check(category_column_name, column_name_identifier, transaction_type)

        print("### Checking histogram distribution of MSRP for given {} ### \t".format(category_column_name))
        self.histogram_distribution_check(category_column_name, column_name_identifier, transaction_type)

        print("### Outputting summary table ### \t")
        self.summary_table_by_category(category_column_name, column_name_identifier, transaction_type)

        print("### Outputting summary table by time broken down in months ### \t")
        self.summary_table_by_category_time(category_column_name, column_name_identifier, transaction_type)

        print("### Outputting time series line plot of MSRP along with confidence bands ### \t")
        self.line_plot_time_series_msrp_by_category(
            category_column_name,
            column_name_identifier,
            transaction_type,
            mba_util.CONFIDENCE_LEVEL,
            mba_util.ERROR_STYLE
        )


