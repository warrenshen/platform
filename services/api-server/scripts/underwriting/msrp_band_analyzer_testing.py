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
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple
from collections import defaultdict
import pickle
import seaborn as sns

from underwriting import data_quality_checks
from underwriting import msrp_band_analyzer_util as mba_util
from underwriting.msrp_band_analyzer import MSRPBand

sns.set(rc={'figure.figsize':(11.7,8.27)})

TESTING_COMPANY_NAMES = [
    'TT',
    'MD',
    'DWF',
    'GHC',
    'SV',
    '99HT'
]

TRAIN_COSTS_DF = pd.read_csv('train_costs_df.csv')
TRAIN_SALES_DF = pd.read_csv('train_sales_df.csv')
MBA_TRAIN = MSRPBand(company_costs_df=TRAIN_COSTS_DF, company_sales_df=TRAIN_SALES_DF)


class MSRPTest(MSRPBand):
    def __init__(self, company_costs_df=None, company_sales_df=None):
        self.company_identifier_list = mba_util.COMPANY_IDENTIFIER_LIST
        self.transfer_start_date = mba_util.TRANSFER_PACKAGES_START_DATE
        self.sales_start_date = mba_util.SALES_TRANSACTIONS_START_DATE
        self.current_month = mba_util.CURRENT_MONTH
        self.measurement_dict = mba_util.MEASUREMENT_DICT
        self.company_costs_df = company_costs_df
        self.company_sales_df = company_sales_df
        self.msrp_summary_table = None
        self.msrp_summary_table_by_time = None
        self.default_price_column = 'tx_price_per_unit'
        self.outlier_df = None
        self.confidence_band_multiplier = mba_util.CONFIDENCE_BAND_MULTIPLIER
        self.outside_band_costs_df = None
        self.inside_band_costs_df = None
        self.train_band_costs_dict = None
        self.outside_band_sales_df = None
        self.inside_band_sales_df = None
        self.train_band_sales_dict = None
        self.non_compatible_timeframe_costs_df = None
        self.non_compatible_timeframe_sales_df = None

    def update_test_set(self, testing_company_names):
        MSRPBand.update_company_data(self, testing_company_names)

    def run_test_set_analysis(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str,
            *,
            use_unit_converted_price=True,
            ignore_non_unit_extractable_rows=False
    ):
        if use_unit_converted_price:
            MBA_TRAIN.default_price_column = 'adjusted_tx_price_per_unit'
        else:
            MBA_TRAIN.default_price_column = 'tx_price_per_unit'
        print("### Outputting boxplot distribution plot and finding outliers outside of Whisksers ### \t")
        MBA_TRAIN.boxplot_distribution_outlier_check(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        plt.clf()
        MBA_TRAIN.summary_table_by_category_time(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        MBA_TRAIN.line_plot_time_series_msrp_by_category(
            category_column_name,
            column_name_identifier,
            transaction_type,
            mba_util.CONFIDENCE_LEVEL,
            mba_util.ERROR_STYLE,
            ignore_non_unit_extractable_rows
        )

        analysis_data = MSRPBand.select_df_by_transaction_type(self, transaction_type, ignore_non_unit_extractable_rows=False)
        analysis_data_category = analysis_data[analysis_data[category_column_name] == column_name_identifier]
        band_table = MBA_TRAIN.msrp_summary_table_by_time
        cleaned_df, outlier_df, non_compatible_timeframe_df, outlier_percentage = self.compare_test_band_percentage(
            analysis_data_category,
            band_table,
            MBA_TRAIN.default_price_column
        )

        return cleaned_df, outlier_df, non_compatible_timeframe_df, outlier_percentage, band_table

    def compare_test_band_percentage(self, data, band_summary_table, price_column):
        lower_band_dict = band_summary_table['lower_confidence_band'].to_dict()
        upper_band_dict = band_summary_table['upper_confidence_band'].to_dict()
        timeframe_exist = data['date_in_month'].apply(lambda x: True if (x in lower_band_dict.keys() and x in upper_band_dict.keys()) else False)
        non_compatible_timeframe_data = data[~timeframe_exist]
        data = data[timeframe_exist]
        outside_band = data.apply(lambda row: True if (row[price_column] < lower_band_dict[row['date_in_month']] or row[price_column] > upper_band_dict[row['date_in_month']]) else False, axis=1)
        outliers = data[outside_band]
        cleaned_data = data[~outside_band]
        outlier_percentage = np.round(np.mean(outside_band), 4) * 100 if len(outside_band) > 0 else 0
        return cleaned_data, outliers, non_compatible_timeframe_data, outlier_percentage

    def compare_entire_data_band(self, category_column_name, transaction_type, *, use_unit_converted_price=True, ignore_non_unit_extractable_rows=False):
        analysis_data = MSRPBand.select_df_by_transaction_type(self, transaction_type, False)
        unique_category_names = analysis_data[category_column_name].unique()
        all_cleaned_df = []
        all_outlier_df = []
        all_non_compatible_timeframe_df = []
        band_table_dict = {}
        for category_name in unique_category_names:
            print('### RUN BAND ANALYSIS FOR PRODUCT CATEGORY {} ###'.format(category_name))
            try:
                cleaned_df, outlier_df, non_compatible_timeframe_df, outlier_percentage, band_table = self.run_test_set_analysis(
                    category_column_name,
                    category_name,
                    transaction_type,
                    use_unit_converted_price=use_unit_converted_price,
                    ignore_non_unit_extractable_rows=ignore_non_unit_extractable_rows
                )
                print("### % outliers for column category name {} is {}% ###".format(category_name, outlier_percentage))
            except ValueError:
                continue
            all_cleaned_df.append(cleaned_df)
            all_outlier_df.append(outlier_df)
            all_non_compatible_timeframe_df.append(non_compatible_timeframe_df)
            band_table_dict[category_name] = band_table
        if transaction_type == 'C':
            self.outside_band_costs_df = pd.concat(all_outlier_df)
            self.inside_band_costs_df = pd.concat(all_cleaned_df)
            self.non_compatible_timeframe_costs_df = pd.concat(all_non_compatible_timeframe_df)
            overall_outlier_percentage = np.round(
                self.outside_band_costs_df.shape[0] / (self.outside_band_costs_df.shape[0] + self.inside_band_costs_df.shape[0]), 3) * 100
            print("### Overall % outliers that are outside of time series band in column {} is {}% ###".format(category_column_name, overall_outlier_percentage))
            self.train_band_costs_dict = band_table_dict
        else:
            self.outside_band_sales_df = pd.concat(all_outlier_df)
            self.inside_band_sales_df = pd.concat(all_cleaned_df)
            self.non_compatible_timeframe_sales_df = pd.concat(all_non_compatible_timeframe_df)
            overall_outlier_percentage = np.round(
                self.outside_band_sales_df.shape[0] / (self.outside_band_sales_df.shape[0] + self.inside_band_sales_df.shape[0]), 3) * 100
            print("### Overall % outliers that are outside of time series band in column {} is {}% ###".format(
                category_column_name, overall_outlier_percentage))
            self.train_band_sales_dict = band_table_dict

