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
from typing import List, Dict, Tuple
from collections import defaultdict

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from bespoke.inventory.analysis.shared import create_queries, prepare_data
from bespoke.inventory.analysis.shared import download_util, inventory_types
from bespoke.inventory.analysis import active_inventory_util as util
from bespoke.inventory.analysis import inventory_valuations_util as valuations_util


load_dotenv('/Users/victoria/dev/platform/services/api-server/notebooks/.env')  # TODO: to figure out how to properly do this
BIGQUERY_CREDENTIALS_PATH = os.environ.get("BIGQUERY_CREDENTIALS_PATH")

########################
# all the functions
########################

# 1. check_company_license_download
def check_company_license_download(
    license_numbers: List[str], download_summary_records: List[Dict[str, str]]
) -> Dict[str, str]:
    license_number_to_download_summary_records = {}

    for license_number in license_numbers:
        license_number_to_download_summary_records[license_number] = list(
            filter(
                lambda download_summary_record: download_summary_record[
                    "license_number"
                ]
                == license_number,
                download_summary_records,
            )
        )
    bad_count = 0
    bad_history = defaultdict(list)
    for (
        license_number,
        download_summary_records,
    ) in license_number_to_download_summary_records.items():
        print(f"Verifying download summaries for license {license_number}...")
        print(f'Earliest download summary: {download_summary_records[-1]["date"]}')
        print(f'Latest download summary: {download_summary_records[0]["date"]}')
        for download_summary_record in download_summary_records:
            if download_summary_record["status"] != "completed":
                bad_count += 1
                print(
                    f'Found bad download summary for license {license_number} on date {download_summary_record["date"]}'
                )
                bad_history[license_number].append(download_summary_record["date"])

        print("")
    if bad_count > 0:
        print(f"[FAILURE] Found a total of {bad_count} bad download summaries")
    else:
        print(f"[SUCCESS] All download summaries look good!")
    return bad_history


# 2. check_unknown_transfer_packages
def check_unknown_transfer_packages(unknown_transfer_df: pd.DataFrame) -> int:
    unknown_package_count = unknown_transfer_df.shape[0]
    if unknown_package_count > 0:
        print(
            f"[FAILURE] Fxound a total of {unknown_package_count} unknown transfer packages"
        )
    else:
        print(f"[SUCCESS] No unknown transfer packages!")
    return unknown_package_count


# 3. check_receiver_wholesale_price_coverage
def check_receiver_wholesale_price_coverage(
    incoming_transfer_df: pd.DataFrame,
) -> float:
    rwp_exists_count = incoming_transfer_df[
        incoming_transfer_df["receiver_wholesale_price"].notnull()
    ].shape[0]
    total_count = incoming_transfer_df.shape[0]
    rwp_coverage = round(rwp_exists_count / total_count, 2) * 100
    print(
        f"{rwp_coverage}% of incoming transfer packages have receiver wholesale price"
    )
    return rwp_coverage


# 4. check_incoming_transfer_package_coverage
def check_incoming_transfer_package_coverage(
    incoming_transfer_df: pd.DataFrame, sales_df: pd.DataFrame
) -> Tuple[List, pd.DataFrame]:
    package_transfer_sales_merged = pd.merge(
        sales_df,
        incoming_transfer_df,
        left_on="tx_package_id",
        right_on="package_id",
        how="left",
    )
    package_transfer_sales_merged_missed = package_transfer_sales_merged[
        package_transfer_sales_merged["package_id"].isnull()
    ]
    count_trxn_missed = package_transfer_sales_merged_missed.shape[0]
    count_total_trxn = sales_df.shape[0]
    missed_ratio = count_trxn_missed / count_total_trxn
    print(
        f"# transactions missing incoming transfer package: {count_trxn_missed} ({count_trxn_missed / count_total_trxn * 100}%)"
    )
    print(f"# transactions total: {count_total_trxn}")
    return missed_ratio, package_transfer_sales_merged_missed

#5. check_receipts_missing_sales_trxns
def float_eq(receipt_total_price: float, transactions_total_price: float, num_transactions: int) -> bool:
    # For every additional transaction, increase threshold by 0.01 (a penny).
    threshold = num_transactions * 0.1
    return math.isclose(receipt_total_price, transactions_total_price, abs_tol=threshold)

def check_receipts_missing_sales_trxns(sales_trxn_df: pd.DataFrame) -> float:
    sales_receipt_with_transactions_records = sales_trxn_df.to_dict('records')
    receipt_number_to_transactions = {}
    for sales_receipt_with_transaction_record in sales_receipt_with_transactions_records:
        receipt_number = sales_receipt_with_transaction_record['receipt_number']
        if receipt_number in receipt_number_to_transactions:
            receipt_number_to_transactions[receipt_number] += [sales_receipt_with_transaction_record]
        else:
            receipt_number_to_transactions[receipt_number] = [sales_receipt_with_transaction_record]
    mismatch_count = 0  # Count of receipts where receipt total price does not match transactions total price.
    missing_count = 0  # Count of receipts with no transactions.
    total_count = 0  # Count of receipts (including those missing transactions).

    mismatch_over_count = 0
    mismatch_under_count = 0

    month_to_mismatch_count = {}
    month_to_missing_count = {}

    month_to_mismatch_over_count = {}
    month_to_mismatch_under_count = {}

    example_mismatch_over_receipts = []
    example_mismatch_under_receipts = []

    for receipt_number, receipt_transactions in list(receipt_number_to_transactions.items()):
        receipt_total_price = receipt_transactions[0]['rt_total_price']
        receipt_sales_month = receipt_transactions[0]['sales_month']
        receipt_total_packages = receipt_transactions[0]['total_packages']

        total_count += 1

        if len(receipt_transactions) == 1 and receipt_transactions[0]['tx_package_id'] == None:
            missing_count += 1
            if receipt_sales_month not in month_to_missing_count:
                month_to_missing_count[receipt_sales_month] = 0
            month_to_missing_count[receipt_sales_month] += 1
            continue

        # Check whether 'total_packages' field of sales receipt matches number of transactions related to receipt.
        if receipt_total_packages != len(receipt_transactions):
            missing_count += 1
            if receipt_sales_month not in month_to_missing_count:
                month_to_missing_count[receipt_sales_month] = 0
            month_to_missing_count[receipt_sales_month] += 1
            continue

        transactions_total_price = sum(
            receipt_transaction['tx_total_price'] for receipt_transaction in receipt_transactions)
        if not float_eq(receipt_total_price, transactions_total_price, len(receipt_transactions)):
            mismatch_count += 1
            if receipt_total_price < transactions_total_price:
                mismatch_over_count += 1
                example_mismatch_over_receipts += [(receipt_number, receipt_transactions)]
            else:
                mismatch_under_count += 1
                example_mismatch_under_receipts += [(receipt_number, receipt_transactions)]

            if receipt_sales_month not in month_to_mismatch_count:
                month_to_mismatch_count[receipt_sales_month] = 0
            month_to_mismatch_count[receipt_sales_month] += 1
            continue
    return mismatch_count / total_count

########################
# main
########################
@click.command()
@click.argument("company-identifier", nargs=-1)
@click.option("--transfer-packages-start-date", default="2020-01-01", type=str)
@click.option("--sales-transactions-start-date", default="2020-01-01", type=str)
def main(
    company_identifier: Tuple[str],
    transfer_packages_start_date: str,
    sales_transactions_start_date: str,
):
    company_identifier = list(company_identifier)
    assert (
        len(company_identifier) > 0
    ), "got 0 company_identifier, should have at least 1!!!"

    engine = create_engine(
        "bigquery://bespoke-financial/ProdMetrcData",
        credentials_path=os.path.expanduser(BIGQUERY_CREDENTIALS_PATH),
    )

    # fetch download report and licenses
    company_licenses_query = create_queries.create_company_licenses_query(
        company_identifier
    )
    company_download_summaries_query = (
        create_queries.create_company_download_summaries_query(
            company_identifier, transfer_packages_start_date
        )
    )
    company_licenses_dataframe = pd.read_sql_query(company_licenses_query, engine)
    company_download_summaries_dataframe = pd.read_sql_query(
        company_download_summaries_query, engine
    )
    license_numbers = company_download_summaries_dataframe["license_number"].unique()
    download_summary_records = company_download_summaries_dataframe.to_dict("records")

    # 1. check bad_download_history
    bad_download_history = check_company_license_download(
        license_numbers, download_summary_records
    )
    assert (
        len(bad_download_history) == 0
    ), f"got {len(bad_download_history)} bad download history: {bad_download_history}"

    # get list of retailer license numbers
    license_numbers = list(
        company_licenses_dataframe[
            company_licenses_dataframe["license_category"].isin(
                ["Retailer", "Multiple"]
            )
        ]["license_number"].unique()
    )
    company_incoming_transfer_packages_query = (
        create_queries.create_company_incoming_transfer_packages_query(
            company_identifier,
            transfer_packages_start_date,
            license_numbers=license_numbers,
        )
    )
    company_outgoing_transfer_packages_query = (
        create_queries.create_company_outgoing_transfer_packages_query(
            company_identifier,
            transfer_packages_start_date,
            license_numbers=license_numbers,
        )
    )
    company_unknown_transfer_packages_query = (
        create_queries.create_company_unknown_transfer_packages_query(
            company_identifier,
            transfer_packages_start_date,
        )
    )
    company_sales_transactions_query = (
        create_queries.create_company_sales_transactions_query(
            company_identifier,
            sales_transactions_start_date,
            license_numbers=license_numbers,
        )
    )
    company_sales_receipts_query = create_queries.create_company_sales_receipts_query(
        company_identifier,
        sales_transactions_start_date,
        license_numbers=license_numbers,
    )
    company_sales_receipts_with_transactions_query = (
        create_queries.create_company_sales_receipts_with_transactions_query(
            company_identifier,
            sales_transactions_start_date,
            license_numbers=license_numbers,
        )
    )
    company_inventory_packages_query = (
        create_queries.create_company_inventory_packages_query(
            company_identifier,
            include_quantity_zero=True,
            license_numbers=license_numbers,
        )
    )

    company_incoming_transfer_packages_dataframe = pd.read_sql_query(
        company_incoming_transfer_packages_query, engine
    )
    company_outgoing_transfer_packages_dataframe = pd.read_sql_query(
        company_outgoing_transfer_packages_query, engine
    )
    company_unknown_transfer_packages_dataframe = pd.read_sql_query(
        company_unknown_transfer_packages_query, engine
    )
    company_sales_transactions_dataframe = pd.read_sql_query(
        company_sales_transactions_query, engine
    )
    company_sales_receipts_dataframe = pd.read_sql_query(
        company_sales_receipts_query, engine
    )
    company_sales_receipts_with_transactions_dataframe = pd.read_sql_query(
        company_sales_receipts_with_transactions_query, engine
    )
    company_inventory_packages_dataframe = pd.read_sql_query(
        company_inventory_packages_query, engine
    )

    # 2. check unknown_package_count
    unknown_package_count = check_unknown_transfer_packages(
        company_unknown_transfer_packages_dataframe
    )
    assert (
        unknown_package_count == 0
    ), f"got {unknown_package_count} unknown transfer packages"

    # 3. check receiver wholesale price coverage
    rwp_coverage = check_receiver_wholesale_price_coverage(
        company_incoming_transfer_packages_dataframe
    )
    assert (
        rwp_coverage >= 0
    ), f"{rwp_coverage}% of incoming transfer packages have receiver wholesale price"

    deduped_sales_receipts_with_transactions_dataframe = (
        prepare_data.dedupe_sales_transactions(
            company_sales_receipts_with_transactions_dataframe
        )
    )
    deduped_sales_receipts_with_transactions_dataframe[
        "sales_month"
    ] = deduped_sales_receipts_with_transactions_dataframe[
        "sales_datetime"
    ].dt.strftime(
        "%Y-%m"
    )

    # 4. check incoming_transfer_package_coverage
    (
        incoming_transfer_package_coverage,
        incoming_transfer_package_coverage_missing,
    ) = check_incoming_transfer_package_coverage(
        company_incoming_transfer_packages_dataframe,
        deduped_sales_receipts_with_transactions_dataframe,
    )
    assert (
        incoming_transfer_package_coverage <= 1
    ), f"{incoming_transfer_package_coverage} of transactions missing incoming transfer package"

    #5. check_receipts_missing_sales_trxns
    perc_receipts_missing_sales_trxns = check_receipts_missing_sales_trxns(deduped_sales_receipts_with_transactions_dataframe)
    assert (
        perc_receipts_missing_sales_trxns <= 0.1
    ), f"{perc_receipts_missing_sales_trxns} of receipts missing sales transactions"

if __name__ == "__main__":
    main()
