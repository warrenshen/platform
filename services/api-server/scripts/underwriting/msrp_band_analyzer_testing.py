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
from underwriting import msrp_band_analyzer

sns.set(rc={'figure.figsize':(11.7,8.27)})

TRAINING_COMPANY_NAMES = [
    'DL',
    'DW',
    'EMA',
    'EMM',
    'EMT',
    'EMF',
    'ST',
    'GRG',
    'EL',
    'VS',
]

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
MBA_TRAIN = msrp_band_analyzer.MSRPBand(company_costs_df=TRAIN_COSTS_DF, company_sales_df=TRAIN_SALES_DF)
MBA_TEST = msrp_band_analyzer.MSRPBand()
MBA_TEST.update_company_data(TESTING_COMPANY_NAMES)


def run_test_set_analysis(
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        *,
        use_unit_converted_price=True
):
    if use_unit_converted_price:
        MBA_TRAIN.default_price_column = 'adjusted_tx_price_per_unit'
    else:
        MBA_TRAIN.default_price_column = 'tx_price_per_unit'
    print("### Outputting boxplot distribution plot and finding outliers outside of Whisksers ### \t")
    MBA_TRAIN.boxplot_distribution_outlier_check(category_column_name, column_name_identifier, transaction_type)
    plt.clf()
    MBA_TRAIN.summary_table_by_category_time(category_column_name, column_name_identifier, transaction_type)
    MBA_TRAIN.line_plot_time_series_msrp_by_category(
        category_column_name,
        column_name_identifier,
        transaction_type,
        mba_util.CONFIDENCE_LEVEL,
        mba_util.ERROR_STYLE
    )

    analysis_data = MBA_TEST.select_df_by_transaction_type(transaction_type)
    analysis_data_category = analysis_data[analysis_data[category_column_name] == column_name_identifier]
    band_table = MBA_TRAIN.msrp_summary_table_by_time
    outlier_df, outlier_percentage = compare_test_band_percentage(analysis_data_category, band_table, MBA_TRAIN.default_price_column)

    return outlier_df, outlier_percentage


def compare_test_band_percentage(data, band_summary_table, price_column):
    lower_band_dict = band_summary_table['lower_confidence_band'].to_dict()
    upper_band_dict = band_summary_table['upper_confidence_band'].to_dict()
    outside_band = data.apply(lambda row: True if (row[price_column] < lower_band_dict[row['date_in_month']] or row[price_column] > upper_band_dict[row['date_in_month']]) else False, axis=1)
    outliers = data[outside_band]
    outlier_percentage = np.sum(outside_band)
    return outliers, outlier_percentage

