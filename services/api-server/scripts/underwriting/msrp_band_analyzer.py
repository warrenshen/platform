import numpy as np
import pandas as pd
import sys
import pickle
import matplotlib.pyplot as plt
from typing import List
import seaborn as sns

from underwriting import data_quality_checks
from underwriting import msrp_band_analyzer_util as mba_util

sns.set(rc={'figure.figsize':(11.7,8.27)})


class MSRPBand:
    """
    A class used to include all msrp analysis functions and attributes
    """

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
        self.default_band_method = 'std'

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
        print("### Breaking down product names into specific measures with regular expressions ### \t")
        self.company_costs_df = self.extract_units_from_product_name(
            self.company_costs_df,
            'product_name',
            'product_category_name',
            'received_unit_of_measure'
        )
        self.company_sales_df = self.extract_units_from_product_name(
            self.company_sales_df,
            'tx_product_name',
            'tx_product_category_name',
            'tx_unit_of_measure'
        )
        print("### Combining same product categories with different measurements ### \t")
        self.company_costs_df = self.combine_product_category_with_different_measurements(
            self.company_costs_df,
            'product_category_name',
        )
        self.company_sales_df = self.combine_product_category_with_different_measurements(
            self.company_sales_df,
            'tx_product_category_name',
        )
        print("### Breaking down product names into different brands ### \t")
        self.company_costs_df = self.breakdown_product_category_into_brands(
            self.company_costs_df,
            'product_name',
            'product_category_name'
        )
        self.company_sales_df = self.breakdown_product_category_into_brands(
            self.company_sales_df,
            'tx_product_name',
            'tx_product_category_name'
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
        self.company_costs_df = self.company_costs_df[self.company_costs_df['shipper_wholesale_price'] != .01]
        self.company_sales_df = self.company_sales_df[self.company_sales_df['tx_total_price'] != .01]

    def add_new_columns(self):
        """
        Add tx_price_per_unit column to both dataframes and date_in_month which extracts the date in month format
        """
        self.company_costs_df.loc[:, 'tx_price_per_unit'] = self.company_costs_df.shipper_wholesale_price / self.company_costs_df.shipped_quantity
        self.company_costs_df.loc[:, 'date_in_month'] = pd.to_datetime(self.company_costs_df.created_date).dt.strftime('%Y-%m')
        self.company_sales_df.loc[:, 'tx_price_per_unit'] = self.company_sales_df.tx_total_price / self.company_sales_df.tx_quantity_sold
        self.company_sales_df.loc[:, 'date_in_month'] = pd.to_datetime(self.company_sales_df.sales_datetime).dt.strftime('%Y-%m')
        self.company_costs_df = self.company_costs_df[self.company_costs_df['tx_price_per_unit'] > .01]
        self.company_sales_df = self.company_sales_df[self.company_sales_df['tx_price_per_unit'] > .01]

    def boxplot_distribution_outlier_check(
        self,
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        ignore_non_unit_extractable_rows: bool
    ):
        temp_df = self.select_df_by_transaction_type(transaction_type, ignore_non_unit_extractable_rows)
        temp_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        box = sns.boxplot(y=category_column_name, x=self.default_price_column, data=temp_df, orient='h')
        median = temp_df[self.default_price_column].median()
        q1 = temp_df[self.default_price_column].quantile(.25)
        q3 = temp_df[self.default_price_column].quantile(.75)
        iqr = q3 - q1
        maxx = q3 + iqr * 1.5
        minn = q1 - iqr * 1.5

        outlier_df = pd.concat([temp_df[temp_df[self.default_price_column] < minn], temp_df[temp_df[self.default_price_column] > maxx]])
        if self.outlier_df is None:
            self.outlier_df = outlier_df
        else:
            self.outlier_df = pd.concat([self.outlier_df, outlier_df])

        if transaction_type == 'C':
            self.company_costs_df = self.company_costs_df[~self.company_costs_df.index.isin(outlier_df.index)]
        else:
            self.company_sales_df = self.company_sales_df[~self.company_sales_df.index.isin(outlier_df.index)]

        print("Number of transactions outliers below Boxplot Whisker Minimum is {} %".format(
            (temp_df[self.default_price_column] < minn).mean()*100))
        print("Number of transactions outliers above Boxplot Whisker Maximum is {} %".format(
            (temp_df[self.default_price_column] > maxx).mean()*100))
        return box

    def select_df_by_transaction_type(self, transaction_type, ignore_non_unit_extractable_rows):
        """
        Chooses either costs or sales data for analysis

        Parameters
        ----------
        transaction_type: Which of the two dataframes (costs or sales) to use
        ignore_non_unit_extractable_rows: Ignore rows that have no extracted units
        ----------
        """
        if transaction_type == 'C':
            if ignore_non_unit_extractable_rows:
                return self.company_costs_df[(self.company_costs_df.received_unit_of_measure == 'Grams') | (self.company_costs_df.extracted_units.isna() == False)]
            return self.company_costs_df
        elif transaction_type == 'S':
            if ignore_non_unit_extractable_rows:
                return self.company_sales_df[(self.company_sales_df.tx_unit_of_measure == 'Grams') | (self.company_sales_df.extracted_units.isna() == False)]
            return self.company_sales_df
        else:
            print('Transaction type not recognized, try inputting C for costs or S for sales')

    def histogram_distribution_check(
        self,
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        ignore_non_unit_extractable_rows: bool
    ):
        """
        Plots histogram plot to check distribution
        """
        temp_df = self.select_df_by_transaction_type(transaction_type, ignore_non_unit_extractable_rows)
        temp_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        print("Total number of transactions for {} in {} : {}".format(
            column_name_identifier, category_column_name, temp_df.shape[0]))
        histplot = sns.histplot(data=temp_df, x=self.default_price_column)
        return histplot

    def summary_table_by_category(
        self,
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        ignore_non_unit_extractable_rows: bool
    ):
        """
        Finds summary table and saves into a class attribute
        """
        temp_df = self.select_df_by_transaction_type(transaction_type, ignore_non_unit_extractable_rows)
        msrp_summary_table_agg = temp_df.groupby(category_column_name)[self.default_price_column].describe()
        self.msrp_summary_table = msrp_summary_table_agg.loc[column_name_identifier].round(2)

    def summary_table_by_category_time(
            self,
            category_column_name: str,
            column_name_identifier: str,
            transaction_type: str,
            ignore_non_unit_extractable_rows: bool
    ):
        """
        Finds summary table by date in month and saves into a class attribute
        """
        temp_df = self.select_df_by_transaction_type(transaction_type, ignore_non_unit_extractable_rows)
        msrp_summary_table_by_time_agg = temp_df.groupby([category_column_name, 'date_in_month'])[self.default_price_column].describe()
        self.msrp_summary_table_by_time = msrp_summary_table_by_time_agg.loc[column_name_identifier].round(2)

    def sort_time_by_month(self):
        self.company_costs_df.sort_values('date_in_month', inplace=True)
        self.company_sales_df.sort_values('date_in_month', inplace=True)

    def find_boxplot_max_min_band(self, data):
        median = data[self.default_price_column].median()
        q1 = data[self.default_price_column].quantile(.25)
        q3 = data[self.default_price_column].quantile(.75)
        iqr = q3 - q1
        maxx = q3 + iqr * 1.5
        minn = q1 - iqr * 1.5
        self.msrp_summary_table_by_time['lower_confidence_band'] = minn
        self.msrp_summary_table_by_time['lower_confidence_band'][self.msrp_summary_table_by_time['lower_confidence_band'] < 0] = 0
        self.msrp_summary_table_by_time['upper_confidence_band'] = maxx

    def find_std_lower_upper_band(self, data):
        self.msrp_summary_table_by_time['std'] = self.msrp_summary_table_by_time['std'].fillna(0)
        avg_std = data[self.default_price_column].std()
        self.msrp_summary_table_by_time['std'][self.msrp_summary_table_by_time['std'] < .25 * avg_std] = avg_std
        self.msrp_summary_table_by_time['lower_confidence_band'] = self.msrp_summary_table_by_time['mean'] - self.msrp_summary_table_by_time['std'].fillna(0) * self.confidence_band_multiplier
        self.msrp_summary_table_by_time['lower_confidence_band'][self.msrp_summary_table_by_time['lower_confidence_band'] < 0] = 0
        self.msrp_summary_table_by_time['upper_confidence_band'] = self.msrp_summary_table_by_time['mean'] + self.msrp_summary_table_by_time['std'].fillna(0) * self.confidence_band_multiplier

    def line_plot_time_series_msrp_by_category(
        self,
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        confidence_level: any,
        error_style: str,
        ignore_non_unit_extractable_rows: bool,
        band_method: str
    ):
        """
        Plots times series line plot broken down by specified category
        """
        temp_df = self.select_df_by_transaction_type(transaction_type, ignore_non_unit_extractable_rows)
        msrp_category_df = temp_df[temp_df[category_column_name] == column_name_identifier]
        msrp_mean_df = msrp_category_df.groupby('date_in_month')[self.default_price_column].mean().reset_index()
        if band_method == 'minmax':
            self.find_boxplot_max_min_band(msrp_category_df)
        else:
            self.find_std_lower_upper_band(msrp_category_df)
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
        ax.set(title="MSRP for {}: '{}' over time by month".format(category_column_name, column_name_identifier))
        # label points on the plot
        plt.fill_between(msrp_mean_df['date_in_month'], self.msrp_summary_table_by_time.lower_confidence_band, self.msrp_summary_table_by_time.upper_confidence_band, alpha=.3)
        for x, y in zip(msrp_mean_df['date_in_month'], msrp_mean_df[self.default_price_column]):
            plt.text(x=x,
                     y=y-y*.01,
                     s='{: .1f}'.format(y),
                     color='red')
        for x, y in zip(self.msrp_summary_table_by_time.index, self.msrp_summary_table_by_time.lower_confidence_band):
            plt.text(x=x,
                     y=y-y*.01,
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
        #count_idx = ((df['count_measure_from_product_name'].isna() == False) & (df[product_category_name] == 'Capsule (weight - each)') & (df['extracted_units'].isna() == False))
        #df['extracted_units'][count_idx] = df['extracted_units'][count_idx] / df['count_measure_from_product_name'][count_idx]
        #extracted_units_idx = ((df[measure_ratio_column_name] == 1) & (df['extracted_units'].isna() == False))
        extracted_units_idx = (df['extracted_units'].isna() == False)
        df[measure_ratio_column_name][extracted_units_idx] = df['extracted_units'][extracted_units_idx]
        df['adjusted_tx_price_per_unit'] = df['tx_price_per_unit'] / df[measure_ratio_column_name]
        df['combined_product_category'] = df[product_category_name].apply(self.product_category_standard_unit_conversion)
        return df

    def extract_units_from_product_name(self, df, product_name, product_category_name, current_measurement):
        """
        Create new column that extracts unit measures from product names
        """
        df['bad_numbers_from_product_name'] = df[product_name].str.extract('([0-9][0-9][0-9][0-9][0-9]+)', expand = False)
        df[product_name] = df.apply(lambda row: row[product_name].replace(row['bad_numbers_from_product_name'], '') if type(row['bad_numbers_from_product_name']) == str else row[product_name], axis=1)
        df['extracted_units'] = np.nan
        df['letter_gram_measure_from_product_name'] = df[product_name].str.extract('([0-9]*[\.]?[0-9]+[\s]?[gG])', expand=False)
        df['letter_milligram_measure_from_product_name'] = df[product_name].str.extract('([0-9]*[\.]?[0-9]+[\s]?[mM][gG])',expand=False)
        # df['letter_litre_measure_from_product_name'] = df[product_name].str.extract('([0-9]*[\.]?[0-9]+[\s]?[mM]?[lL])', expand=False)
        # df['fraction_letter_gram_measure_from_product_name'] = df[product_name].str.extract('([0-9]/[0-9]?[\s]?[mM]?[gG])', expand=False)
        df['count_measure_from_product_name'] = df[product_name].str.extract('([0-9]+[\s]?count|[0-9]+[\s]?capsule|[0-9]+[\s]?ct|[0-9]+[\s]?pk)', expand=False)
        count_measure_non_na_index = (df['count_measure_from_product_name'].isna() == False)
        df['count_measure_from_product_name'][count_measure_non_na_index] = df['count_measure_from_product_name'][count_measure_non_na_index].apply(mba_util.extract_count_units)
        df['gram_measure_from_product_name'] = df[product_name].str.extract('([hH][aA][lL][fF] [gG][rR][aA][mM]|[gG][rR][aA][mM])', expand=False)
        df['oz_measure_from_product_name'] = df[product_name].str.extract('([0-9]/[0-9]?[\s]?oz|[0-9]*[\.]?[0-9]+[\s]?oz)', expand=False)

        for product_category in df[product_category_name].unique():
            if product_category not in mba_util.PRODUCT_CATEGORY_NAME_NLP_USAGE_DICTIONARY.keys():
                continue
            algorithm_method = mba_util.PRODUCT_CATEGORY_NAME_NLP_USAGE_DICTIONARY[product_category]
            if len(algorithm_method) == 0:
                continue
            else:
                for measure_column in algorithm_method:
                    # print(measure_column)
                    idx = ((df[current_measurement] == 'Each') &
                           (df[measure_column].isna() == False) &
                           (df[product_category_name] == product_category))
                    df['extracted_units'][idx] = df[measure_column][idx].apply(mba_util.EXTRACTED_MEASUREMENT_COLUMNS[measure_column])

        return df

    def breakdown_product_category_into_brands(self, df, product_name, category_name):
        """
        Create new column that breaks down category name into brands
        """
        df['brand_breakable_by_dash_boolean'] = (
             (df[product_name].str.contains('-')) &
             (df[product_name].str.contains("\|") == False) &
             (df[product_name].str.contains("Pre-Roll") == False) &
             (df[product_name].str.contains("sample", case=False) == False) &
             (df[product_name].str.contains("^(1 ml)") == False) &
             (df[product_name].str.contains("[A-Z]+[0-9]+-[A-Z]+[0-9]+|[0-9]+[A-Z]+-[0-9]+[A-Z]+|[A-Z]+[0-9]+-[0-9]+[A-Z]+|[0-9]+[A-Z]+-[A-Z]+[0-9]+") == False)
             )
        df['brands'] = df.apply(lambda row: row[product_name].split('-')[0].strip() if row['brand_breakable_by_dash_boolean'] else row[product_name], axis=1)
        df['brands_by_category'] = df.apply(lambda row: row[product_name].split('-')[0].strip() + ' ({})'.format(row[category_name]) if row['brand_breakable_by_dash_boolean'] else row[product_name], axis=1)
        return df

    def run_analysis(
        self,
        category_column_name: str,
        column_name_identifier: str,
        transaction_type: str,
        band_method: str,
        *,
        use_unit_converted_price=True,
        ignore_non_unit_extractable_rows=False
    ):
        """
        Runs all functions for analysis

        Parameters
        ----------
        category_column_name: Category level to use for analysis
        column_name_identifier: Name of category to indice
        transaction_type: Using costs df or sales df
        band_method: Method for calculating bands
        use_unit_converted_price: Uses unit converted price column for running analysis
        ignore_non_unit_extractable_rows: Ignore rows where extracted_units is NA
        ----------
        """
        if use_unit_converted_price:
            self.default_price_column = 'adjusted_tx_price_per_unit'
        else:
            self.default_price_column = 'tx_price_per_unit'
        print("### Outputting boxplot distribution plot and finding outliers outside of Whisksers ### \t")
        box = self.boxplot_distribution_outlier_check(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        plt.show()

        print("### Checking histogram distribution of MSRP for given {} ### \t".format(category_column_name))
        histogram = self.histogram_distribution_check(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        plt.show()

        print("### Outputting summary table ### \t")
        self.summary_table_by_category(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        print(self.msrp_summary_table)

        print("### Outputting summary table by time broken down in months ### \t")
        self.summary_table_by_category_time(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
        print(self.msrp_summary_table_by_time)

        print("### Outputting time series line plot of MSRP along with confidence bands ### \t")
        self.line_plot_time_series_msrp_by_category(
            category_column_name,
            column_name_identifier,
            transaction_type,
            mba_util.CONFIDENCE_LEVEL,
            mba_util.ERROR_STYLE,
            ignore_non_unit_extractable_rows,
            band_method
        )
        print(self.msrp_summary_table_by_time[['lower_confidence_band', 'upper_confidence_band']])

    def run_time_series_plot_analysis_multi_category(
        self,
        category_column_name: str,
        column_name_identifier_list: list,
        transaction_type: str,
        band_method: str,
        *,
        use_unit_converted_price=True,
        ignore_non_unit_extractable_rows=False
    ):
        """
        Runs all functions for analysis on multiple categories together.

        Parameters
        ----------
        category_column_name: Category level to use for analysis
        column_name_identifier_list: Names of list of category to indice
        transaction_type: Using costs df or sales df
        band_method: Method of calculating bands
        use_unit_converted_price: Uses unit converted price column for running analysis
        ignore_non_unit_extractable_rows: Ignore rows where extracted_units is NA
        ----------
        """
        if use_unit_converted_price:
            self.default_price_column = 'adjusted_tx_price_per_unit'
        else:
            self.default_price_column = 'tx_price_per_unit'
        for column_name_identifier in column_name_identifier_list:
            print('### RUN ANALYSIS FOR PRODUCT CATEGORY {} ###'.format(column_name_identifier))
            # In case there are no transactions for this specific category type, we will skip.
            try:
                self.boxplot_distribution_outlier_check(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
            except ValueError:
                print("### There are 0 rows with category name of {} ###".format(column_name_identifier))
                print("### SKIPPING PRODUCT CATEGORY {} ###".format(column_name_identifier))
                continue
            self.histogram_distribution_check(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
            plt.clf()
            self.summary_table_by_category(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
            self.summary_table_by_category_time(category_column_name, column_name_identifier, transaction_type, ignore_non_unit_extractable_rows)
            self.line_plot_time_series_msrp_by_category(
                category_column_name,
                column_name_identifier,
                transaction_type,
                mba_util.CONFIDENCE_LEVEL,
                mba_util.ERROR_STYLE,
                ignore_non_unit_extractable_rows,
                band_method
            )

    def output_time_series_metadata(self):
        """
        Output csvs to check other company data integrity in msrp_band_analyzer_check script
        """
        self.company_costs_df.to_csv('train_costs_df.csv')
        self.company_sales_df.to_csv('train_sales_df.csv')
        # self.msrp_summary_table.to_csv('train_msrp_summary_{}.csv'.format(column_name_identifier))
        # self.msrp_summary_table_by_time.to_csv('train_msrp_summary_by_time_{}.csv'.format(column_name_identifier))
        # self.outlier_df.to_csv('train_outlier_df_{}.csv'.format(column_name_identifier))

    def save(self):
        """save class as self.name.txt"""
        file = open(mba_util.TRAINING_OBJECT_NAME, 'wb')
        pickle.dump(self.__dict__, file)
        file.close()
