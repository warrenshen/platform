import numpy
import os
import pandas as pd
import sys
from datetime import date
from dotenv import load_dotenv
from os import path
from typing import List, Dict, Tuple
from collections import defaultdict

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

load_dotenv(
    "/Users/victoria/dev/platform/services/api-server/notebooks/.env"
)  # TODO: to figure out how to properly do this
BIGQUERY_CREDENTIALS_PATH = os.environ.get("BIGQUERY_CREDENTIALS_PATH")

################################################
# data quality checks
################################################


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


def check_unknown_transfer_packages(unknown_transfer_df: pd.DataFrame) -> int:
    unknown_package_count = unknown_transfer_df.shape[0]
    if unknown_package_count > 0:
        print(
            f"[FAILURE] Found a total of {unknown_package_count} unknown transfer packages"
        )
    else:
        print(f"[SUCCESS] No unknown transfer packages!")
    return unknown_package_count


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


################################################
# vendor churn
################################################


def calculate_vendor_churn(
    incoming_transfer_df, license_list, vc_start_date, vc_end_date, vc_month_list
):
    df_vendor_churn = incoming_transfer_df[
        incoming_transfer_df["license_number"].isin(license_list)
    ]
    df_vendor_churn["year_month"] = pd.to_datetime(
        df_vendor_churn["created_date"]
    ).dt.strftime("%Y-%m")
    vc = (
        df_vendor_churn[
            ["year_month", "shipper_facility_name", "shipper_wholesale_price"]
        ]
        .groupby(["year_month", "shipper_facility_name"])
        .sum()
        .reset_index()
    )
    vc = vc.assign(year_month=lambda df: pd.to_datetime(df["year_month"]))

    vc_full = (
        (
            vc.groupby("shipper_facility_name").apply(
                lambda df: df.merge(
                    pd.Series(
                        None,
                        index=pd.date_range(
                            start=vc_start_date, end=vc_end_date, freq="MS"
                        ),
                        name="__place_holder",
                    ),
                    how="right",
                    left_on="year_month",
                    right_index=True,
                )
                .assign(
                    **{
                        "shipper_wholesale_price": lambda df_: df_.shipper_wholesale_price.fillna(
                            0
                        ),
                    }
                )
                .drop(["__place_holder", "shipper_facility_name"], axis=1)
            )
        )
        .reset_index()
        .drop(["level_1"], axis=1)
    ).round(2)

    rolling_4m_sum = vc_full.groupby("shipper_facility_name").apply(
        lambda df: df.set_index("year_month").sort_index().rolling(4).sum()
    )
    rolling_4m_sum.columns = ["rolling_4m_total_price"]
    facility_monthly_running_total = vc_full.groupby("shipper_facility_name").apply(
        lambda df: df.set_index("year_month")
        .sort_index()["shipper_wholesale_price"]
        .cumsum()
        .to_frame()
    )
    facility_monthly_running_total.columns = ["facility_running_total"]
    monthly_running_total = (
        facility_monthly_running_total.reset_index()
        .groupby("year_month")["facility_running_total"]
        .sum()
        .to_frame()
    )
    monthly_running_total.columns = ["monthly_running_total"]

    vc_result = (
        rolling_4m_sum.merge(
            facility_monthly_running_total,
            how="inner",
            left_index=True,
            right_index=True,
        )
        .reset_index()
        .merge(monthly_running_total, how="left", on="year_month")
    ).round(2)
    vc_result["%_total"] = (
        vc_result["facility_running_total"] / vc_result["monthly_running_total"]
    )
    vc_result["last_4m_active"] = vc_result["rolling_4m_total_price"] > 0
    vc_result["significant"] = vc_result["%_total"] > 0.001
    vc_result["measure"] = vc_result.apply(
        lambda row: "Active"
        if (row["last_4m_active"] & row["significant"])
        else ("Inactive" if row["significant"] else "Exclude"),
        axis=1,
    )
    # churn
    churn = (
        vc_result.groupby(["year_month"])
        .apply(lambda x: x[x["measure"] == "Inactive"]["%_total"].sum())
        .reset_index()
    )
    churn.columns = ["year_month", "%_inactive"]
    churn.index = churn.year_month

    # output vendor churn matrix
    vc_data = vc_full[vc_full["year_month"] <= vc_end_date]
    vc_data["year_month"] = vc_data["year_month"].astype(str)
    vc_matrix = pd.pivot_table(
        vc_data,
        values="shipper_wholesale_price",
        index="shipper_facility_name",
        columns="year_month",
        fill_value=0,
    ).reset_index()
    vc_matrix["facility_total"] = vc_matrix.sum(axis=1)
    vc_matrix["grand_total"] = vc_matrix["facility_total"].sum()
    vc_matrix["perc_total"] = vc_matrix["facility_total"] / vc_matrix["grand_total"]
    vc_matrix["last_4m_total"] = vc_matrix[vc_month_list].sum(axis=1)
    vc_matrix["last_4m_active"] = vc_matrix["last_4m_total"] > 0
    vc_matrix["significant"] = vc_matrix["perc_total"] > 0.001
    vc_matrix["measure"] = vc_matrix.apply(
        lambda row: "Active"
        if (row["last_4m_active"] & row["significant"])
        else ("Inactive" if row["significant"] else "Exclude"),
        axis=1,
    )
    return churn, vc_matrix


def calculate_vendor_churn_short(
    incoming_transfer_df,
    license_list,
    vc_start_date,
    vc_end_date,
    vc_month_list,
    vc_month_end,
):
    df_vendor_churn = incoming_transfer_df[
        incoming_transfer_df["license_number"].isin(license_list)
    ]
    df_vendor_churn["year_month"] = pd.to_datetime(
        df_vendor_churn["created_date"]
    ).dt.strftime("%Y-%m")
    vc = (
        df_vendor_churn[
            ["year_month", "shipper_facility_name", "shipper_wholesale_price"]
        ]
        .groupby(["year_month", "shipper_facility_name"])
        .sum()
        .reset_index()
    )
    vc = vc.assign(year_month=lambda df: pd.to_datetime(df["year_month"]))

    vc_full = (
        (
            vc.groupby("shipper_facility_name").apply(
                lambda df: df.merge(
                    pd.Series(
                        None,
                        index=pd.date_range(
                            start=vc_start_date, end=vc_end_date, freq="MS"
                        ),
                        name="__place_holder",
                    ),
                    how="right",
                    left_on="year_month",
                    right_index=True,
                )
                .assign(
                    **{
                        "shipper_wholesale_price": lambda df_: df_.shipper_wholesale_price.fillna(
                            0
                        ),
                    }
                )
                .drop(["__place_holder", "shipper_facility_name"], axis=1)
            )
        )
        .reset_index()
        .drop(["level_1"], axis=1)
    ).round(2)

    # cast any purchase under $ 100 to be 0
    indices = vc_full[vc_full["shipper_wholesale_price"] < 100].index.to_list()
    vc_full.loc[indices, "shipper_wholesale_price"] = 0

    # rolling_4m_sum
    rolling_4m_sum = vc_full.groupby("shipper_facility_name").apply(
        lambda df: df.set_index("year_month").sort_index().rolling(4).sum()
    )
    rolling_4m_sum.columns = ["rolling_4m_total_price"]

    # facility_monthly_running_total
    facility_monthly_running_total = vc_full.groupby("shipper_facility_name").apply(
        lambda df: df.set_index("year_month")
        .sort_index()["shipper_wholesale_price"]
        .rolling(window=12)
        .sum()
        .to_frame()
    )
    facility_monthly_running_total.columns = ["facility_running_total"]

    # monthly_running_total
    monthly_running_total = (
        facility_monthly_running_total.reset_index()
        .groupby("year_month")["facility_running_total"]
        .sum()
        .to_frame()
    )
    monthly_running_total.columns = ["monthly_running_total"]

    vc_result = (
        rolling_4m_sum.merge(
            facility_monthly_running_total,
            how="inner",
            left_index=True,
            right_index=True,
        )
        .reset_index()
        .merge(monthly_running_total, how="left", on="year_month")
    ).round(2)
    vc_result["%_total"] = (
        vc_result["facility_running_total"] / vc_result["monthly_running_total"]
    )
    vc_result["last_4m_active"] = vc_result["rolling_4m_total_price"] > 0
    vc_result["significant"] = vc_result["%_total"] > 0.001
    vc_result["measure"] = vc_result.apply(
        lambda row: "Active"
        if (row["last_4m_active"] & row["significant"])
        else ("Inactive" if row["significant"] else "Exclude"),
        axis=1,
    )
    # churn
    churn = (
        vc_result.groupby(["year_month"])
        .apply(lambda x: x[x["measure"] == "Inactive"]["%_total"].sum())
        .reset_index()
    )
    churn.columns = ["year_month", "%_inactive"]
    churn.index = churn.year_month

    # output vendor churn matrix
    vc_data = vc_full[vc_full["year_month"] <= vc_month_end]
    vc_data["year_month"] = vc_data["year_month"].astype(str)
    vc_matrix = pd.pivot_table(
        vc_data,
        values="shipper_wholesale_price",
        index="shipper_facility_name",
        columns="year_month",
        fill_value=0,
    ).reset_index()
    vc_matrix["facility_total"] = vc_matrix.iloc[:, -12:].sum(axis=1)
    vc_matrix["grand_total"] = vc_matrix["facility_total"].sum()
    vc_matrix["perc_total"] = vc_matrix["facility_total"] / vc_matrix["grand_total"]
    vc_matrix["last_4m_total"] = vc_matrix[vc_month_list].sum(axis=1)
    vc_matrix["last_4m_active"] = vc_matrix["last_4m_total"] > 0
    vc_matrix["significant"] = vc_matrix["perc_total"] > 0.001
    vc_matrix["measure"] = vc_matrix.apply(
        lambda row: "Active"
        if (row["last_4m_active"] & row["significant"])
        else ("Inactive" if row["significant"] else "Exclude"),
        axis=1,
    )
    return churn, vc_matrix


################################################
# data integrity checks
################################################


def check_per_unit_incoming(
    incoming_transfer_df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    incoming_transfer_df["per_unit_incoming"] = (
        incoming_transfer_df["shipper_wholesale_price"]
        / incoming_transfer_df["shipped_quantity"]
    )
    # by package ID
    per_unit_incoming_package_sort = (
        incoming_transfer_df[["package_id", "per_unit_incoming"]]
        .groupby(["package_id"])
        .mean()
        .sort_values(by="per_unit_incoming", ascending=False)
        .reset_index()
    )
    per_unit_incoming_package_top5 = per_unit_incoming_package_sort[0:5]
    print("printing per unit incoming by package ID summary ...")
    print(
        f'max per unit incoming: {per_unit_incoming_package_sort["per_unit_incoming"][0]}'
        + f' from package ID: {per_unit_incoming_package_sort["package_id"][0]}'
    )
    print(
        f'min per unit incoming: {per_unit_incoming_package_sort.dropna()["per_unit_incoming"][-1:].values[0]}'
        + f' from package ID: {per_unit_incoming_package_sort.dropna()["package_id"][-1:].values[0]}'
    )
    # print(per_unit_incoming_package_top5)
    print("")
    # by product name
    per_unit_incoming_product_sort = (
        incoming_transfer_df[["product_name", "per_unit_incoming"]]
        .groupby(["product_name"])
        .max()
        .sort_values(by="per_unit_incoming", ascending=False)
        .reset_index()
    )
    per_unit_incoming_product_top5 = per_unit_incoming_product_sort[0:5]
    return per_unit_incoming_package_sort, per_unit_incoming_product_sort


################################################
# margin + cogs analysis
################################################


def cogs_analysis(
    df_in: pd.DataFrame, df_sales: pd.DataFrame, freq: str, state: str
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    df_sales["per_unit"] = df_sales["tx_total_price"] / df_sales["tx_quantity_sold"]
    # set frequency
    if freq == "monthly":
        df_sales["date"] = df_sales["sales_datetime"].dt.strftime("%Y-%m")
    elif freq == "weekly":
        df_sales["date"] = df_sales["sales_datetime"].dt.strftime("%Y-%W")
        df_sales["week"] = df_sales["sales_datetime"].dt.strftime("%W")
    # total # of trxns
    s_total_count = df_sales.groupby("date")["tx_total_price"].count()
    df_total_count = pd.Series(s_total_count).to_frame()
    df_total_count = df_total_count.reset_index()
    df_total_count.rename(columns={"tx_total_price": "total_count"}, inplace=True)
    # revenue
    s_revenue = df_sales.groupby("date")["tx_total_price"].sum()
    df_revenue = pd.Series(s_revenue).to_frame()
    df_revenue = df_revenue.reset_index()
    df_revenue.rename(columns={"tx_total_price": "revenue"}, inplace=True)

    df_in["per_unit_incoming"] = (
        df_in["shipper_wholesale_price"] / df_in["shipped_quantity"]
    )

    # per unit price by package id
    df_in_price = df_in[df_in["shipper_wholesale_price"].notnull()]
    average_incoming_package_id = df_in_price.groupby("package_id")[
        "per_unit_incoming"
    ].mean()
    df_avg_incoming_price = pd.Series(average_incoming_package_id).to_frame()
    df_avg_incoming_price = df_avg_incoming_price.reset_index()
    # per unit price by product name
    average_incoming_product = df_in_price.groupby("product_name")[
        "per_unit_incoming"
    ].mean()
    df_avg_product = pd.Series(average_incoming_product).to_frame()
    df_avg_product = df_avg_product.reset_index()
    df_avg_product.rename(
        columns={"per_unit_incoming": "per_unit_product"}, inplace=True
    )

    # merge with (cogs by package id)
    df_cogs_package_id = pd.merge(
        df_sales,
        df_avg_incoming_price,
        left_on="tx_package_id",
        right_on="package_id",
        how="left",
    )
    df_cogs_package_id["total_incoming"] = (
        df_cogs_package_id["per_unit_incoming"] * df_cogs_package_id["tx_quantity_sold"]
    )
    df_cogs_package_id.replace([numpy.inf], numpy.nan, inplace=True)
    df_cogs_package_id_notnull = df_cogs_package_id[
        df_cogs_package_id["total_incoming"].notnull()
    ]

    # sum cogs by package id
    s_cogs = df_cogs_package_id_notnull.groupby("date")["total_incoming"].sum()
    df_cogs_id = pd.Series(s_cogs).to_frame()
    df_cogs_id = df_cogs_id.reset_index()
    # count # of trxn by package id
    s_cogs_count = df_cogs_package_id_notnull.groupby("date")["total_incoming"].count()
    df_cogs_count = pd.Series(s_cogs_count).to_frame()
    df_cogs_count = df_cogs_count.reset_index()
    df_cogs_count.rename(columns={"total_incoming": "count_incoming"}, inplace=True)

    # merge with (cogs by product name)
    df_cogs_average_product = pd.merge(
        df_cogs_package_id,
        df_avg_product,
        left_on="tx_product_name",
        right_on="product_name",
        how="left",
    )

    df_cogs_average_product["total_product"] = (
        df_cogs_average_product["tx_quantity_sold"]
        * df_cogs_average_product["per_unit_product"]
    )
    df_cogs_null = df_cogs_average_product[
        df_cogs_average_product["per_unit_incoming"].isnull()
    ]
    df_cogs_product = df_cogs_null[df_cogs_null["per_unit_product"].notnull()]
    # sum cogs filldown by product name
    product_sum = df_cogs_product.groupby("date")["total_product"].sum()
    df_product_sum = pd.Series(product_sum).to_frame()
    df_product_sum = df_product_sum.reset_index()
    df_product_sum.rename(columns={"total_product": "product_sum"}, inplace=True)
    # count # of trxn filldown by product name
    product_count = df_cogs_product.groupby("date")["total_product"].count()
    df_product_count = pd.Series(product_count).to_frame()
    df_product_count = df_product_count.reset_index()
    df_product_count.rename(columns={"total_product": "product_count"}, inplace=True)
    df_cogs_product_df = pd.merge(df_product_sum, df_product_count)

    # prepare summary
    df_summary = pd.merge(df_revenue, df_cogs_product_df, how="left")
    df_summary = pd.merge(df_summary, df_cogs_id, how="left")
    df_summary["product_sum"] = df_summary["product_sum"].fillna(0)
    df_summary["product_count"] = df_summary["product_count"].fillna(0)
    # total cogs = by product id cogs + by product name cogs
    df_summary["cogs"] = df_summary["total_incoming"] + df_summary["product_sum"]
    df_summary = pd.merge(df_summary, df_cogs_count)
    df_summary = pd.merge(df_summary, df_total_count)
    # total count = by package id count + by product count
    df_summary["total_count_incoming"] = (
        df_summary["count_incoming"] + df_summary["product_count"]
    )
    df_summary["margin_$"] = df_summary["revenue"] - df_summary["cogs"]
    df_summary["margin_%"] = df_summary["margin_$"] / df_summary["revenue"]
    df_summary["coverage"] = (
        df_summary["total_count_incoming"] / df_summary["total_count"]
    )
    df_summary_simp = df_summary[
        [
            "date",
            "revenue",
            "cogs",
            "margin_$",
            "margin_%",
            "total_count_incoming",
            "product_count",
            "count_incoming",
            "coverage",
            "total_count",
        ]
    ]

    # tax treatment
    df_summary_simp["revenue_after_tax"] = df_summary_simp["revenue"] * 1.15
    df_summary_simp["cogs_after_tax"] = df_summary_simp["cogs"] * 1.27
    df_summary_simp["margin_$_after_tax"] = (
        df_summary_simp["revenue_after_tax"] - df_summary_simp["cogs_after_tax"]
    )
    df_summary_simp["margin_%_after_tax"] = (
        df_summary_simp["margin_$_after_tax"] / df_summary_simp["revenue_after_tax"]
    )
    # past quarter pre tax
    df_summary_simp["gm_past_quarter"] = (
        df_summary_simp[["margin_%"]].rolling(3).mean().values
    )
    df_summary_simp["gm_past_2quarters"] = (
        df_summary_simp[["margin_%"]].rolling(6).mean().values
    )
    df_summary_simp["gm_past_3quarters"] = (
        df_summary_simp[["margin_%"]].rolling(9).mean().values
    )
    df_summary_simp["sum_cogs_past_3months"] = (
        df_summary_simp[["cogs"]].rolling(3).sum().values
    )
    # past quarter after tax
    df_summary_simp["gm_past_quarter_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(3).mean().values
    )
    df_summary_simp["gm_past_2quarters_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(6).mean().values
    )
    df_summary_simp["gm_past_3quarters_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(9).mean().values
    )
    # revenue change
    # df_summary_simp['revenue_change'] = df_summary_simp['revenue'].pct_change()

    if state == "CA":
        df_summary_simp["gm_final"] = df_summary_simp["margin_%_after_tax"]

        df_summary_simp["gm_past_quarter_final"] = df_summary_simp[
            "gm_past_quarter_after_tax"
        ]
        df_summary_simp["gm_past_2quarters_final"] = df_summary_simp[
            "gm_past_2quarters_after_tax"
        ]
        df_summary_simp["gm_past_3quarters_final"] = df_summary_simp[
            "gm_past_3quarters_after_tax"
        ]
    else:
        df_summary_simp["gm_final"] = df_summary_simp["margin_%"]
        df_summary_simp["gm_past_quarter_final"] = df_summary_simp["gm_past_quarter"]
        df_summary_simp["gm_past_2quarters_final"] = df_summary_simp[
            "gm_past_2quarters"
        ]
        df_summary_simp["gm_past_3quarters_final"] = df_summary_simp[
            "gm_past_3quarters"
        ]
    df_summary_simp["revenue_change"] = df_summary_simp["revenue"].pct_change().values
    df_summary_simp.index = df_summary_simp.date
    df_summary_simp = df_summary_simp.round(2)

    return df_summary_simp, df_cogs_average_product


################################################
#UOM: pounds to gram convertion
def convert_pounds_to_grams(df_in_sales_joined):
    df_in_sales_joined['tx_unit_of_measure'] = df_in_sales_joined['tx_unit_of_measure'].str.lower()
    df_in_sales_joined['shipped_unit_of_measure'] = df_in_sales_joined['shipped_unit_of_measure'].str.lower()
    indices = df_in_sales_joined[(df_in_sales_joined['tx_unit_of_measure'].str.contains("gram"))&\
                          (df_in_sales_joined['shipped_unit_of_measure'].str.contains("pound"))].index.to_list()
    df_in_sales_joined.loc[indices, "per_unit_incoming"] = df_in_sales_joined.loc[indices, "per_unit_incoming_pounds_convert"]
    return df_in_sales_joined


def cogs_analysis_uom(
        df_in: pd.DataFrame, df_sales: pd.DataFrame, freq: str, state: str
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    df_sales["per_unit"] = df_sales["tx_total_price"] / df_sales["tx_quantity_sold"]
    # set frequency
    if freq == "monthly":
        df_sales["date"] = df_sales["sales_datetime"].dt.strftime("%Y-%m")
    elif freq == "weekly":
        df_sales["date"] = df_sales["sales_datetime"].dt.strftime("%Y-%W")
        df_sales["week"] = df_sales["sales_datetime"].dt.strftime("%W")
    # total # of trxns
    s_total_count = df_sales.groupby("date")["tx_total_price"].count()
    df_total_count = pd.Series(s_total_count).to_frame()
    df_total_count = df_total_count.reset_index()
    df_total_count.rename(columns={"tx_total_price": "total_count"}, inplace=True)
    # revenue
    s_revenue = df_sales.groupby("date")["tx_total_price"].sum()
    df_revenue = pd.Series(s_revenue).to_frame()
    df_revenue = df_revenue.reset_index()
    df_revenue.rename(columns={"tx_total_price": "revenue"}, inplace=True)

    df_in["per_unit_incoming"] = (
            df_in["shipper_wholesale_price"] / df_in["shipped_quantity"]
    )

    # per unit price by package id, by UOM too
    df_in_price = df_in[df_in["shipper_wholesale_price"].notnull()]
    average_incoming_package_id = df_in_price.groupby(["package_id", "shipped_unit_of_measure"])[
        "per_unit_incoming"
    ].mean()
    df_avg_incoming_price = pd.Series(average_incoming_package_id).to_frame()
    df_avg_incoming_price = df_avg_incoming_price.reset_index()
    df_avg_incoming_price['shipped_unit_of_measure'] = df_avg_incoming_price['shipped_unit_of_measure'].str.lower()
    df_avg_incoming_price["per_unit_incoming_pounds_convert"] = df_avg_incoming_price["per_unit_incoming"] / 453.592

    # per unit price by product name
    average_incoming_product = df_in_price.groupby(["product_name"])[
        "per_unit_incoming"
    ].mean()
    df_avg_product = pd.Series(average_incoming_product).to_frame()
    df_avg_product = df_avg_product.reset_index()
    df_avg_product.rename(
        columns={"per_unit_incoming": "per_unit_product"}, inplace=True
    )

    # merge with (cogs by package id)
    df_cogs_package_id = pd.merge(
        df_sales,
        df_avg_incoming_price,
        left_on="tx_package_id",
        right_on="package_id",
        how="left",
    )
    #################################################################
    df_cogs_package_id = convert_pounds_to_grams(df_cogs_package_id)
    #################################################################
    df_cogs_package_id["total_incoming"] = (
            df_cogs_package_id["per_unit_incoming"] * df_cogs_package_id["tx_quantity_sold"]
    )
    df_cogs_package_id.replace([numpy.inf], numpy.nan, inplace=True)
    df_cogs_package_id_notnull = df_cogs_package_id[
        df_cogs_package_id["total_incoming"].notnull()
    ]

    # sum cogs by package id
    s_cogs = df_cogs_package_id_notnull.groupby("date")["total_incoming"].sum()
    df_cogs_id = pd.Series(s_cogs).to_frame()
    df_cogs_id = df_cogs_id.reset_index()
    # count # of trxn by package id
    s_cogs_count = df_cogs_package_id_notnull.groupby("date")["total_incoming"].count()
    df_cogs_count = pd.Series(s_cogs_count).to_frame()
    df_cogs_count = df_cogs_count.reset_index()
    df_cogs_count.rename(columns={"total_incoming": "count_incoming"}, inplace=True)

    # merge with (cogs by product name)
    df_cogs_average_product = pd.merge(
        df_cogs_package_id,
        df_avg_product,
        left_on=["tx_product_name"],
        right_on=["product_name"],
        how="left",
    )

    df_cogs_average_product["total_product"] = (
            df_cogs_average_product["tx_quantity_sold"]
            * df_cogs_average_product["per_unit_product"]
    )
    df_cogs_null = df_cogs_average_product[
        df_cogs_average_product["per_unit_incoming"].isnull()
    ]
    df_cogs_product = df_cogs_null[df_cogs_null["per_unit_product"].notnull()]
    # sum cogs filldown by product name
    product_sum = df_cogs_product.groupby("date")["total_product"].sum()
    df_product_sum = pd.Series(product_sum).to_frame()
    df_product_sum = df_product_sum.reset_index()
    df_product_sum.rename(columns={"total_product": "product_sum"}, inplace=True)
    # count # of trxn filldown by product name
    product_count = df_cogs_product.groupby("date")["total_product"].count()
    df_product_count = pd.Series(product_count).to_frame()
    df_product_count = df_product_count.reset_index()
    df_product_count.rename(columns={"total_product": "product_count"}, inplace=True)
    df_cogs_product_df = pd.merge(df_product_sum, df_product_count)

    # prepare summary
    df_summary = pd.merge(df_revenue, df_cogs_product_df, how="left")
    df_summary = pd.merge(df_summary, df_cogs_id, how="left")
    df_summary["product_sum"] = df_summary["product_sum"].fillna(0)
    df_summary["product_count"] = df_summary["product_count"].fillna(0)
    # total cogs = by product id cogs + by product name cogs
    df_summary["cogs"] = df_summary["total_incoming"] + df_summary["product_sum"]
    df_summary = pd.merge(df_summary, df_cogs_count)
    df_summary = pd.merge(df_summary, df_total_count)
    # total count = by package id count + by product count
    df_summary["total_count_incoming"] = (
            df_summary["count_incoming"] + df_summary["product_count"]
    )
    df_summary["margin_$"] = df_summary["revenue"] - df_summary["cogs"]
    df_summary["margin_%"] = df_summary["margin_$"] / df_summary["revenue"]
    df_summary["coverage"] = (
            df_summary["total_count_incoming"] / df_summary["total_count"]
    )
    df_summary_simp = df_summary[
        [
            "date",
            "revenue",
            "cogs",
            "margin_$",
            "margin_%",
            "total_count_incoming",
            "product_count",
            "count_incoming",
            "coverage",
            "total_count",
        ]
    ]

    # tax treatment
    df_summary_simp["revenue_after_tax"] = df_summary_simp["revenue"] * 1.15
    df_summary_simp["cogs_after_tax"] = df_summary_simp["cogs"] * 1.27
    df_summary_simp["margin_$_after_tax"] = (
            df_summary_simp["revenue_after_tax"] - df_summary_simp["cogs_after_tax"]
    )
    df_summary_simp["margin_%_after_tax"] = (
            df_summary_simp["margin_$_after_tax"] / df_summary_simp["revenue_after_tax"]
    )
    # past quarter pre tax
    df_summary_simp["gm_past_quarter"] = (
        df_summary_simp[["margin_%"]].rolling(3).mean().values
    )
    df_summary_simp["gm_past_2quarters"] = (
        df_summary_simp[["margin_%"]].rolling(6).mean().values
    )
    df_summary_simp["gm_past_3quarters"] = (
        df_summary_simp[["margin_%"]].rolling(9).mean().values
    )
    df_summary_simp["sum_cogs_past_3months"] = (
        df_summary_simp[["cogs"]].rolling(3).sum().values
    )
    # past quarter after tax
    df_summary_simp["gm_past_quarter_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(3).mean().values
    )
    df_summary_simp["gm_past_2quarters_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(6).mean().values
    )
    df_summary_simp["gm_past_3quarters_after_tax"] = (
        df_summary_simp[["margin_%_after_tax"]].rolling(9).mean().values
    )

    if state == "CA":
        df_summary_simp["gm_final"] = df_summary_simp["margin_%_after_tax"]

        df_summary_simp["gm_past_quarter_final"] = df_summary_simp[
            "gm_past_quarter_after_tax"
        ]
        df_summary_simp["gm_past_2quarters_final"] = df_summary_simp[
            "gm_past_2quarters_after_tax"
        ]
        df_summary_simp["gm_past_3quarters_final"] = df_summary_simp[
            "gm_past_3quarters_after_tax"
        ]
    else:
        df_summary_simp["gm_final"] = df_summary_simp["margin_%"]
        df_summary_simp["gm_past_quarter_final"] = df_summary_simp["gm_past_quarter"]
        df_summary_simp["gm_past_2quarters_final"] = df_summary_simp[
            "gm_past_2quarters"
        ]
        df_summary_simp["gm_past_3quarters_final"] = df_summary_simp[
            "gm_past_3quarters"
        ]
    df_summary_simp["revenue_change"] = df_summary_simp["revenue"].pct_change().values
    df_summary_simp.index = df_summary_simp.date
    df_summary_simp = df_summary_simp.round(2)

    return df_summary_simp, df_cogs_average_product

################################################

################################################
# rev change vs state
################################################


def gmv_change_variance_point_mapping(x):
    if x < -0.1:
        return -5
    elif x >= -0.1 and x < -0.05:
        return -2.5
    elif x >= -0.05 and x < 0:
        return 0
    elif x >= 0 and x < 0.05:
        return 5
    else:
        return 10


def get_gmv_change_bm(state):
    if state == "CA":
        return [
            [numpy.nan, numpy.nan, numpy.nan, 0.17, -0.05, 0.02, -0.11, 0],
            [numpy.nan, numpy.nan, numpy.nan, 0.04, 0.28, 0.52, 0.76, 1],
        ]
    elif state == "MA":
        return [
            [-0.07, 0.01, -0.07, 0.09, -0.11, 0.02, 0.05],
            [0.52, 0.6, 0.68, 0.76, 0.84, 0.92, 1],
        ]
    elif state == "CO":
        return [
            [
                0.23,
                -0.01,
                -0.06,
                -0.03,
                0.1,
                -0.06,
                -0.05,
                -0.03,
                -0.11,
                0.06,
                0.09,
                -0.16,
                0.12,
            ],
            [0.04, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92, 1],
        ]
    elif state == "MI":
        return [
            [
                -0.01,
                -0.1,
                -0.05,
                0.08,
                -0.11,
                -0.06,
                -0.03,
                -0.1,
                0.04,
                -0.13,
                -0.01,
                -0.05,
                0.22,
            ],
            [0.04, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92, 1],
        ]


def calculate_quarterly_sum_gmv_ca(cogs_analysis_df, bm):
    # 2020
    sum_gmv_q1_2020 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2020-01")
        & (cogs_analysis_df["date"] <= "2020-03")
    ]["revenue"].sum()
    sum_gmv_q2_2020 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2020-04")
        & (cogs_analysis_df["date"] <= "2020-06")
    ]["revenue"].sum()
    sum_gmv_q3_2020 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2020-07")
        & (cogs_analysis_df["date"] <= "2020-09")
    ]["revenue"].sum()
    sum_gmv_q4_2020 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2020-10")
        & (cogs_analysis_df["date"] <= "2020-12")
    ]["revenue"].sum()
    # 2021
    sum_gmv_q1_2021 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-01")
        & (cogs_analysis_df["date"] <= "2021-03")
    ]["revenue"].sum()
    sum_gmv_q2_2021 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-04")
        & (cogs_analysis_df["date"] <= "2021-06")
    ]["revenue"].sum()
    sum_gmv_q3_2021 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-07")
        & (cogs_analysis_df["date"] <= "2021-09")
    ]["revenue"].sum()
    sum_gmv_q4_2021 = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-10")
        & (cogs_analysis_df["date"] <= "2021-12")
    ]["revenue"].sum()
    gmv_df = pd.DataFrame(
        [
            sum_gmv_q1_2020,
            sum_gmv_q2_2020,
            sum_gmv_q3_2020,
            sum_gmv_q4_2020,
            sum_gmv_q1_2021,
            sum_gmv_q2_2021,
            sum_gmv_q3_2021,
            sum_gmv_q4_2021,
        ]
    )
    gmv_df.columns = ["sum_gmv"]
    gmv_df["sum_gmv_change"] = gmv_df["sum_gmv"].pct_change().values
    gmv_df["sum_gmv_change_ca"] = bm[0]
    gmv_df["weight"] = bm[1]
    gmv_df["variance"] = gmv_df["sum_gmv_change"] - gmv_df["sum_gmv_change_ca"]
    gmv_df["points"] = [
        gmv_change_variance_point_mapping(n) for n in gmv_df["variance"]
    ]
    gmv_df.replace([numpy.inf, -numpy.inf], numpy.nan, inplace=True)
    gmv_df["total"] = gmv_df["points"] * gmv_df["weight"]
    gmv_df.index = [
        "2020Q1",
        "2020Q2",
        "2020Q3",
        "2020Q4",
        "2021Q1",
        "2021Q2",
        "2021Q3",
        "2021Q4",
    ]
    return gmv_df


def calculate_quarterly_sum_gmv_ma(cogs_analysis_df, bm):
    gmv_df = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-09")
        & (cogs_analysis_df["date"] <= "2022-03")
    ][["revenue_change"]]
    gmv_df["sum_gmv_change_ma"] = bm[0]
    gmv_df["weight"] = bm[1]
    gmv_df["variance"] = gmv_df["revenue_change"] - gmv_df["sum_gmv_change_ma"]
    gmv_df["points"] = [
        gmv_change_variance_point_mapping(n) for n in gmv_df["variance"]
    ]
    gmv_df.replace([numpy.inf, -numpy.inf], numpy.nan, inplace=True)
    gmv_df["total"] = gmv_df["points"] * gmv_df["weight"]
    return gmv_df


def calculate_quarterly_sum_gmv_ma_short(cogs_analysis_df):
    # for NECC
    gmv_df = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-09")
        & (cogs_analysis_df["date"] <= "2022-03")
    ][["revenue_change"]]
    gmv_df["sum_gmv_change_ma"] = [-0.07, 0.09, -0.11, 0.02, 0.05]
    gmv_df["weight"] = [0.68, 0.76, 0.84, 0.92, 1]
    gmv_df["variance"] = gmv_df["revenue_change"] - gmv_df["sum_gmv_change_ma"]
    gmv_df["points"] = [
        gmv_change_variance_point_mapping(n) for n in gmv_df["variance"]
    ]
    gmv_df.replace([numpy.inf, -numpy.inf], numpy.nan, inplace=True)
    gmv_df["total"] = gmv_df["points"] * gmv_df["weight"]
    return gmv_df


def calculate_quarterly_sum_gmv_co(cogs_analysis_df, bm):
    gmv_df = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-03")
        & (cogs_analysis_df["date"] <= "2022-03")
    ][["revenue_change"]]
    gmv_df["sum_gmv_change_co"] = bm[0]
    gmv_df["weight"] = bm[1]
    gmv_df["variance"] = gmv_df["revenue_change"] - gmv_df["sum_gmv_change_co"]
    gmv_df["points"] = [
        gmv_change_variance_point_mapping(n) for n in gmv_df["variance"]
    ]
    gmv_df.replace([numpy.inf, -numpy.inf], numpy.nan, inplace=True)
    gmv_df["total"] = gmv_df["points"] * gmv_df["weight"]
    return gmv_df


def calculate_quarterly_sum_gmv_mi(cogs_analysis_df, bm):
    gmv_df = cogs_analysis_df[
        (cogs_analysis_df["date"] >= "2021-04")
        & (cogs_analysis_df["date"] <= "2022-04")
    ][["revenue_change"]]
    gmv_df["sum_gmv_change_mi"] = bm[0]
    gmv_df["weight"] = bm[1]
    gmv_df["variance"] = gmv_df["revenue_change"] - gmv_df["sum_gmv_change_mi"]
    gmv_df["points"] = [
        gmv_change_variance_point_mapping(n) for n in gmv_df["variance"]
    ]
    gmv_df.replace([numpy.inf, -numpy.inf], numpy.nan, inplace=True)
    gmv_df["total"] = gmv_df["points"] * gmv_df["weight"]
    return gmv_df


def get_gmv_change(state, cogs_analysis_df):
    if state == "CA":
        return calculate_quarterly_sum_gmv_ca(
            cogs_analysis_df, get_gmv_change_bm(state)
        )
    elif state == "MA":
        return calculate_quarterly_sum_gmv_ma(
            cogs_analysis_df, get_gmv_change_bm(state)
        )
    elif state == "CO":
        return calculate_quarterly_sum_gmv_co(
            cogs_analysis_df, get_gmv_change_bm(state)
        )
    elif state == "MI":
        return calculate_quarterly_sum_gmv_mi(
            cogs_analysis_df, get_gmv_change_bm(state)
        )


################################################
# inventory
################################################
def get_valid_inventory_df(inventory_data):
    #exclude trade samples
    inventory_data = inventory_data[~inventory_data['is_trade_sample']]
    #exclude quantity zero packages
    inventory_data = inventory_data[inventory_data['quantity'] > 0]
    return inventory_data

def calculate_inventory_valuation(
    incoming_transfer_df, inventory_df, license_list, today_date
):
    # legal name
    legal_name = incoming_transfer_df[
        incoming_transfer_df["license_number"].isin(license_list)
    ]["recipient_facility_name"].values[0]
    # process df_in and df_sales
    incoming_transfer_df["per_unit_incoming"] = (
        incoming_transfer_df["shipper_wholesale_price"]
        / incoming_transfer_df["shipped_quantity"]
    )
    incoming_transfer_df_price = incoming_transfer_df[
        incoming_transfer_df["shipper_wholesale_price"].notnull()
    ]
    # by package id
    average_incoming_package_id = incoming_transfer_df_price.groupby(["package_id"])[
        "per_unit_incoming"
    ].mean()
    df_avg_incoming_price = pd.Series(average_incoming_package_id).to_frame()
    df_avg_incoming_price = df_avg_incoming_price.reset_index()
    # by product
    average_incoming_product = incoming_transfer_df_price.groupby(["product_name"])[
        "per_unit_incoming"
    ].mean()
    df_avg_product = pd.Series(average_incoming_product).to_frame()
    df_avg_product = df_avg_product.reset_index()
    df_avg_product.rename(
        columns={"per_unit_incoming": "per_unit_product"}, inplace=True
    )
    inventory_df = get_valid_inventory_df(inventory_df)
    # calculate inventory
    df_inventory_incoming = pd.merge(
        inventory_df,
        df_avg_incoming_price,
        left_on=["package_id"],
        right_on=["package_id"],
        how="left",
    )
    # left_on=['tx_product_name','tx_unit_of_measure'], right_on=['product_name','shipped_unit_of_measure'], how='left'
    df_inventory_incoming.replace([numpy.inf], numpy.nan, inplace=True)
    df_inv_null = df_inventory_incoming[
        df_inventory_incoming["per_unit_incoming"].isnull()
    ]
    df_inv_product = pd.merge(
        df_inv_null,
        df_avg_product,
        left_on=["product_name"],
        right_on=["product_name"],
        how="left",
    )
    df_inv_product.replace([numpy.inf], numpy.nan, inplace=True)
    df_inv_product_price = df_inv_product[df_inv_product["per_unit_product"].notnull()]
    df_inv_product_price["total_price"] = (
        df_inv_product_price["quantity"] * df_inv_product_price["per_unit_product"]
    )

    inventory_product_value = df_inv_product_price["total_price"].sum()
    df_inventory_incoming["total_price"] = (
        df_inventory_incoming["quantity"] * df_inventory_incoming["per_unit_incoming"]
    )
    inventory_value = df_inventory_incoming["total_price"].sum()
    total_inv_value = inventory_product_value + inventory_value
    total_inv_value_after_tax = (inventory_product_value + inventory_value) * 1.27
    inv_count_product = df_inv_product_price["per_unit_product"].count()
    inv_count_incoming = df_inventory_incoming["per_unit_incoming"].count()
    inv_count_total = df_inventory_incoming["quantity"].count()
    inv_total_incoming = inv_count_product + inv_count_incoming
    inventory_coverage = inv_total_incoming / inv_count_total
    # prepare data
    data = [
        [today_date],
        [round(total_inv_value, 2)],
        [round(total_inv_value_after_tax, 2)],
        [inv_total_incoming],
        [inv_count_total],
        [round(inventory_coverage, 2)],
        [license_list],
        [legal_name],
    ]
    df_inventory_license = pd.DataFrame(data).T
    df_inventory_license.columns = [
        "date",
        "value",
        "value_after_tax",
        "total_incoming",
        "total",
        "coverage",
        "license",
        "legal_name",
    ]
    return df_inventory_license


def calculate_inventory_valuation_fresh(
    incoming_transfer_df, inventory_df, license_list, today_date
):
    # legal name
    legal_name = incoming_transfer_df[
        incoming_transfer_df["license_number"].isin(license_list)
    ]["recipient_facility_name"].values[0]
    # process df_in and df_sales
    incoming_transfer_df["per_unit_incoming"] = (
        incoming_transfer_df["shipper_wholesale_price"]
        / incoming_transfer_df["shipped_quantity"]
    )
    incoming_transfer_df_price = incoming_transfer_df[
        incoming_transfer_df["shipper_wholesale_price"].notnull()
    ]
    # by package id
    average_incoming_package_id = incoming_transfer_df_price.groupby(["package_id"])[
        "per_unit_incoming"
    ].mean()
    df_avg_incoming_price = pd.Series(average_incoming_package_id).to_frame()
    df_avg_incoming_price = df_avg_incoming_price.reset_index()
    # by product
    average_incoming_product = incoming_transfer_df_price.groupby(["product_name"])[
        "per_unit_incoming"
    ].mean()
    df_avg_product = pd.Series(average_incoming_product).to_frame()
    df_avg_product = df_avg_product.reset_index()
    df_avg_product.rename(
        columns={"per_unit_incoming": "per_unit_product"}, inplace=True
    )
    inventory_df = get_valid_inventory_df(inventory_df)

    # prepare fresh inventory
    inventory_df = inventory_df.reset_index(drop=True)
    inventory_df["age"] = [
        today_date - inventory_df["packaged_date"][i] for i in range(len(inventory_df))
    ]
    inventory_df["age_int"] = [
        inventory_df["age"][i] / numpy.timedelta64(1, "D")
        for i in range(len(inventory_df))
    ]
    inventory_df_fresh = inventory_df[inventory_df["age_int"] <= 90]

    # calculate inventory
    df_inventory_incoming = pd.merge(
        inventory_df_fresh,
        df_avg_incoming_price,
        left_on=["package_id"],
        right_on=["package_id"],
        how="left",
    )
    # left_on=['tx_product_name','tx_unit_of_measure'], right_on=['product_name','shipped_unit_of_measure'], how='left'
    df_inventory_incoming.replace([numpy.inf], numpy.nan, inplace=True)
    df_inv_null = df_inventory_incoming[
        df_inventory_incoming["per_unit_incoming"].isnull()
    ]
    df_inv_product = pd.merge(
        df_inv_null,
        df_avg_product,
        left_on=["product_name"],
        right_on=["product_name"],
        how="left",
    )
    df_inv_product.replace([numpy.inf], numpy.nan, inplace=True)
    df_inv_product_price = df_inv_product[df_inv_product["per_unit_product"].notnull()]
    df_inv_product_price["total_price"] = (
        df_inv_product_price["quantity"] * df_inv_product_price["per_unit_product"]
    )

    inventory_product_value = df_inv_product_price["total_price"].sum()
    df_inventory_incoming["total_price"] = (
        df_inventory_incoming["quantity"] * df_inventory_incoming["per_unit_incoming"]
    )
    inventory_value = df_inventory_incoming["total_price"].sum()
    total_inv_value = inventory_product_value + inventory_value
    total_inv_value_after_tax = (inventory_product_value + inventory_value) * 1.27
    inv_count_product = df_inv_product_price["per_unit_product"].count()
    inv_count_incoming = df_inventory_incoming["per_unit_incoming"].count()
    inv_count_total = df_inventory_incoming["quantity"].count()
    inv_total_incoming = inv_count_product + inv_count_incoming
    inventory_coverage = inv_total_incoming / inv_count_total
    # prepare data
    data = [
        [today_date],
        [round(total_inv_value, 2)],
        [round(total_inv_value_after_tax, 2)],
        [inv_total_incoming],
        [inv_count_total],
        [round(inventory_coverage, 2)],
        [license_list],
        [legal_name],
    ]
    df_inventory_license = pd.DataFrame(data).T
    df_inventory_license.columns = [
        "date",
        "value",
        "value_after_tax",
        "total_incoming",
        "total",
        "coverage",
        "license",
        "legal_name",
    ]
    return df_inventory_license, inventory_df


def calculate_msrp_based_inventory_valuation(
    incoming_transfer_df, sales_df, inventory_df, license_list, today_date
):
    # legal name
    legal_name = incoming_transfer_df[
        incoming_transfer_df["license_number"].isin(license_list)
    ]["recipient_facility_name"].values[0]
    # process df_in and df_sales
    sales_df["per_unit"] = sales_df["tx_total_price"] / sales_df["tx_quantity_sold"]
    sales_df["year_month"] = sales_df["sales_datetime"].dt.strftime("%Y-%m")
    # per unit msrp by package id
    df_msrp = sales_df[sales_df["tx_total_price"].notnull()]
    average_msrp_package_id = df_msrp.groupby("tx_package_id")["per_unit"].mean()
    df_avg_msrp_package_id = pd.Series(average_msrp_package_id).to_frame()
    df_avg_msrp_package_id = df_avg_msrp_package_id.reset_index()
    # per unit msrp by product name
    average_msrp_product = df_msrp.groupby("tx_product_name")["per_unit"].mean()
    df_avg_msrp_product = pd.Series(average_msrp_product).to_frame()
    df_avg_msrp_product = df_avg_msrp_product.reset_index()
    df_avg_msrp_product.rename(columns={"per_unit": "per_unit_product"}, inplace=True)

    inventory_df = get_valid_inventory_df(inventory_df)

    # calculate inventory
    # merge with per unit msrp by package id
    df_inventory_package_id = pd.merge(
        inventory_df,
        df_avg_msrp_package_id,
        left_on=["package_id"],
        right_on=["tx_package_id"],
        how="left",
    )
    df_inventory_package_id.replace([numpy.inf], numpy.nan, inplace=True)
    # merge with per unit msrp by product
    df_inv_null = df_inventory_package_id[df_inventory_package_id["per_unit"].isnull()]
    df_inv_product = pd.merge(
        df_inv_null,
        df_avg_msrp_product,
        left_on=["product_name"],
        right_on=["tx_product_name"],
        how="left",
    )
    df_inv_product.replace([numpy.inf], numpy.nan, inplace=True)
    df_inv_product_price = df_inv_product[df_inv_product["per_unit_product"].notnull()]
    df_inv_product_price["total_price"] = (
        df_inv_product_price["quantity"] * df_inv_product_price["per_unit_product"]
    )
    inventory_product_value = df_inv_product_price["total_price"].sum()

    df_inventory_package_id["total_price"] = (
        df_inventory_package_id["quantity"] * df_inventory_package_id["per_unit"]
    )
    inventory_package_id_value = df_inventory_package_id["total_price"].sum()
    total_inv_value = inventory_product_value + inventory_package_id_value
    inv_count_product = df_inv_product_price["per_unit_product"].count()
    inv_count_package_id = df_inventory_package_id["per_unit"].count()
    inv_count_total = df_inventory_package_id["quantity"].count()
    inv_total_mapped = inv_count_product + inv_count_package_id
    inventory_coverage = inv_total_mapped / inv_count_total
    # prepare data
    data = [
        [today_date],
        [round(total_inv_value, 2)],
        [inv_total_mapped],
        [inv_count_total],
        [round(inventory_coverage, 2)],
        [license_list],
        [legal_name],
    ]
    df_inventory_license = pd.DataFrame(data).T
    df_inventory_license.columns = [
        "date",
        "value",
        "total_incoming",
        "total",
        "coverage",
        "license",
        "legal_name",
    ]
    return df_inventory_license


################################################
# scoring
################################################


def get_gm_perc_thresholds(state):
    if state == "CA":
        return [[0.41, 0.47, 0.56], [0.41, 0.47, 0.56], [0.42, 0.48, 0.56]]
    elif state == "CO":
        return [[0.48, 0.57, 0.63], [0.48, 0.57, 0.63], [0.49, 0.57, 0.62]]
    elif state == "MI":
        return [[0.43, 0.48, 0.54], [0.49, 0.53, 0.57], [0.54, 0.56, 0.58]]
    elif state == "MA":
        return [[0.53, 0.54, 0.56], [0.54, 0.54, 0.56], [0.53, 0.53, 0.55]]
    else:
        return None


def get_gm_perc_scores(threshold, gm_3, gm_6, gm_9):
    # 3m score
    if gm_3 <= threshold[0][0]:
        score_3m = -2
    elif threshold[0][0] < gm_3 <= threshold[0][1]:
        score_3m = 0
    elif threshold[0][1] < gm_3 <= threshold[0][2]:
        score_3m = 5
    elif gm_3 > threshold[0][2]:
        score_3m = 5
    else:
        score_3m = 0
    # 6m score
    if gm_6 <= threshold[1][0]:
        score_6m = -2
    elif threshold[1][0] < gm_6 <= threshold[1][1]:
        score_6m = 0
    elif threshold[1][1] < gm_6 <= threshold[1][2]:
        score_6m = 5
    elif gm_6 > threshold[1][2]:
        score_6m = 5
    else:
        score_6m = 0
    # 9m score
    if gm_9 <= threshold[2][0]:
        score_9m = -2
    elif threshold[2][0] < gm_9 <= threshold[2][1]:
        score_9m = 0
    elif threshold[2][1] < gm_9 <= threshold[2][2]:
        score_9m = 5
    elif gm_9 > threshold[2][2]:
        score_9m = 5
    else:
        score_9m = 0
    return score_3m, score_6m, score_9m


def get_short_repayment_score(dpd):
    if dpd <= 9:
        return 10
    elif 9 < dpd <= 30:
        return 0
    elif dpd > 30:
        return -10
    else:
        return None


def calculate_interest_rate(score, full_score):
    score_ratio = score / full_score
    placeholder = (1 + 0.5 * (1 - score_ratio)) * 0.015
    rate = placeholder * 12
    return round(placeholder, 4), round(rate, 4)


# create template file with after tax inventory valuation and also credit limit
def create_template_new(
    df_rev_vs_state,
    df_cogs_analysis,
    df_inventory_analysis,
    df_inventory_analysis_msrp,
    df_churn,
    df_license_check,
    license_list,
    state_,
    current_month,
):
    # legal name
    legal_name = df_inventory_analysis["legal_name"][0]
    # cogs coverage check
    metrc_cogs_coverage_current = df_cogs_analysis[df_cogs_analysis["coverage"] > 0][
        "coverage"
    ].mean()
    metrc_cogs_coverage_current_reliable = metrc_cogs_coverage_current > 0.75
    print(metrc_cogs_coverage_current, metrc_cogs_coverage_current_reliable)

    # inventory coverage check
    metrc_inventory_coverage_current = df_inventory_analysis.coverage.values[0]
    metrc_inventory_coverage_current_reliable = metrc_inventory_coverage_current > 0.75
    print(metrc_inventory_coverage_current, metrc_inventory_coverage_current_reliable)

    # inventory TO
    inventory_to_current = (
        df_cogs_analysis.loc[current_month]["sum_cogs_past_3months"]
        / df_inventory_analysis.value[0]
        * 4
    )
    inventory_to_current_score = 0 if inventory_to_current < 6 else 10
    print(inventory_to_current, inventory_to_current_score)

    # inventory valuation
    inventory = df_inventory_analysis["value"][0]
    if state_ == "CA":
        inventory_after_tax = df_inventory_analysis["value_after_tax"][0]
        sum_cogs_past_3months_after_tax = (
            df_cogs_analysis["sum_cogs_past_3months"].loc[current_month] * 1.27
        )
    else:
        inventory_after_tax = inventory
        sum_cogs_past_3months_after_tax = df_cogs_analysis["sum_cogs_past_3months"].loc[
            current_month
        ]

    # inventory valuation msrp based
    inventory_msrp = df_inventory_analysis_msrp["value"][0]

    # past 3m cogs with tax

    sum_cogs_past_3months = df_cogs_analysis["sum_cogs_past_3months"].loc[current_month]

    # credit limit
    credit_limit = round(min(sum_cogs_past_3months_after_tax, inventory_after_tax), -4)

    # vendor churn score
    vendor_churn_current = df_churn.loc[current_month]["%_inactive"].values[0]
    vendor_churn_current_score = 0 if vendor_churn_current > 0.2 else 10
    print(vendor_churn_current, vendor_churn_current_score)
    # margin score
    if df_cogs_analysis.shape[0] < 10:
        gm_past_quarter = df_cogs_analysis.loc[current_month]["gm_final"]
        gm_past_2quarters = df_cogs_analysis.shift(1).loc[current_month]["gm_final"]
        gm_past_3quarters = df_cogs_analysis.shift(2).loc[current_month]["gm_final"]
    else:
        # gm past 1,2,3 quarters (after tax if CA else pre tax)
        gm_past_quarter = df_cogs_analysis.loc[current_month]["gm_past_quarter_final"]
        gm_past_2quarters = df_cogs_analysis.loc[current_month][
            "gm_past_2quarters_final"
        ]
        gm_past_3quarters = df_cogs_analysis.loc[current_month][
            "gm_past_3quarters_final"
        ]

    (
        gm_past_quarter_score,
        gm_past_2quarters_score,
        gm_past_3quarters_score,
    ) = get_gm_perc_scores(
        get_gm_perc_thresholds(state_),
        gm_past_quarter,
        gm_past_2quarters,
        gm_past_3quarters,
    )
    # revenue vs state score
    revenue_state_score = min(round(df_rev_vs_state.dropna()["total"].sum(), 2), 10)
    total = (
        inventory_to_current_score
        + gm_past_quarter_score
        + gm_past_2quarters_score
        + gm_past_3quarters_score
        + vendor_churn_current_score
        + revenue_state_score
    )
    # all templates
    template_data = pd.DataFrame(
        [
            ["legal name", legal_name],
            ["date", current_month],
            ["license", license_list],
            [
                "license is current",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .is_current[0],
            ],
            [
                "license is active",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .license_status[0],
            ],
            [
                "license check",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .license_check[0],
            ],
            ["metrc cogs coverage", metrc_cogs_coverage_current],
            ["metrc cogs coverage reliable ?", metrc_cogs_coverage_current_reliable],
            ["metrc inventory coverage", metrc_inventory_coverage_current],
            [
                "metrc inventory coverage reliable ?",
                metrc_inventory_coverage_current_reliable,
            ],
            ["inventory turnover", inventory_to_current],
            ["inventory turnover score", inventory_to_current_score],
            # gm
            ["GM past quarter", gm_past_quarter],
            ["GM score past quarter", gm_past_quarter_score],
            ["GM past 2 quarters", gm_past_2quarters],
            ["GM score past 2 quarters", gm_past_2quarters_score],
            ["GM past 3 quarters", gm_past_3quarters],
            ["GM score past 3 quarters", gm_past_3quarters_score],
            # vendor churn
            ["vendor churn", vendor_churn_current],
            ["vendor churn score", vendor_churn_current_score],
            # revenue trend vs state
            ["revenue vs state change score", revenue_state_score],
            # inventory valuation
            ["inventory valuation", round(inventory, 2)],
            ["inventory valuation after tax (CA only)", round(inventory_after_tax, 2)],
            # inventory valuation msrp based
            ["inventory valuation (msrp based)", round(inventory_msrp, 2)],
            # sum past 3m cogs afte tax
            ["sum_cogs_past_3months", round(sum_cogs_past_3months, 2)],
            [
                "sum_cogs_past_3months after tax (CA only)",
                round(sum_cogs_past_3months_after_tax, 2),
            ],
            # total score
            ["total score", total],
            ["Monthly Rate (%)", calculate_interest_rate(total, 45)[0] * 100],
            ["interest rate (%)", calculate_interest_rate(total, 45)[1] * 100],
            ["credit limit", credit_limit],
        ]
    )
    return template_data


def create_template_update(
    df_rev_vs_state,
    df_cogs_analysis,
    df_inventory_analysis,
    df_inventory_analysis_msrp,
    df_inventory_analysis_fresh,
    df_churn,
    df_license_check,
    license_list,
    state_,
    current_month,
):
    # legal name
    legal_name = df_inventory_analysis["legal_name"][0]
    # cogs coverage check
    metrc_cogs_coverage_current = df_cogs_analysis[df_cogs_analysis["coverage"] > 0][
        "coverage"
    ].mean()
    metrc_cogs_coverage_current_reliable = metrc_cogs_coverage_current > 0.75
    print(metrc_cogs_coverage_current, metrc_cogs_coverage_current_reliable)

    # inventory coverage check
    metrc_inventory_coverage_current = df_inventory_analysis.coverage.values[0]
    metrc_inventory_coverage_current_reliable = metrc_inventory_coverage_current > 0.75
    print(metrc_inventory_coverage_current, metrc_inventory_coverage_current_reliable)

    # inventory TO
    inventory_to_current = (
        df_cogs_analysis.loc[current_month]["sum_cogs_past_3months"]
        / df_inventory_analysis.value[0]
        * 4
    )
    inventory_to_current_score = 0 if inventory_to_current < 6 else 10
    print(inventory_to_current, inventory_to_current_score)

    # inventory valuation
    inventory = df_inventory_analysis["value"][0]
    fresh_inventory = df_inventory_analysis_fresh["value"][0]
    if state_ == "CA":
        inventory_after_tax = df_inventory_analysis["value_after_tax"][0]
        sum_cogs_past_3months_after_tax = (
            df_cogs_analysis["sum_cogs_past_3months"].loc[current_month] * 1.27
        )
        fresh_inventory_after_tax = df_inventory_analysis_fresh["value_after_tax"][0]
    else:
        inventory_after_tax = inventory
        sum_cogs_past_3months_after_tax = df_cogs_analysis["sum_cogs_past_3months"].loc[
            current_month
        ]
        fresh_inventory_after_tax = fresh_inventory

        # inventory valuation msrp based (no tax)
    inventory_msrp = df_inventory_analysis_msrp["value"][0]

    # past 3m cogs with tax
    sum_cogs_past_3months = df_cogs_analysis["sum_cogs_past_3months"].loc[current_month]
    # gm dollar
    gm_dollar = round(df_cogs_analysis["margin_$"].mean(), 2)
    gm_dollar_score = 15 if gm_dollar >= 200000 else 0

    # credit limit
    credit_limit = round(min(sum_cogs_past_3months_after_tax, inventory_after_tax), -4)

    # vendor churn score
    vendor_churn_current = df_churn.loc[current_month]["%_inactive"].values[0]
    vendor_churn_current_score = 0 if vendor_churn_current > 0.2 else 10
    print(vendor_churn_current, vendor_churn_current_score)
    # margin score
    if df_cogs_analysis.shape[0] < 10:
        gm_past_quarter = df_cogs_analysis.loc[current_month]["gm_final"]
        gm_past_2quarters = df_cogs_analysis.shift(1).loc[current_month]["gm_final"]
        gm_past_3quarters = df_cogs_analysis.shift(2).loc[current_month]["gm_final"]
    else:
        # gm past 1,2,3 quarters (after tax if CA else pre tax)
        gm_past_quarter = df_cogs_analysis.loc[current_month]["gm_past_quarter_final"]
        gm_past_2quarters = df_cogs_analysis.loc[current_month][
            "gm_past_2quarters_final"
        ]
        gm_past_3quarters = df_cogs_analysis.loc[current_month][
            "gm_past_3quarters_final"
        ]

    (
        gm_past_quarter_score,
        gm_past_2quarters_score,
        gm_past_3quarters_score,
    ) = get_gm_perc_scores(
        get_gm_perc_thresholds(state_),
        gm_past_quarter,
        gm_past_2quarters,
        gm_past_3quarters,
    )
    total_gm_perc_score = (
        gm_past_quarter_score + gm_past_2quarters_score + gm_past_3quarters_score
    )
    total_gm_score = min(total_gm_perc_score + gm_dollar_score, 15)

    # revenue vs state score
    revenue_state_score = min(round(df_rev_vs_state.dropna()["total"].sum(), 2), 10)
    total = (
        inventory_to_current_score
        + total_gm_score
        + vendor_churn_current_score
        + revenue_state_score
    )
    # all templates
    template_data = pd.DataFrame(
        [
            ["legal name", legal_name],
            ["date", current_month],
            ["license", license_list],
            [
                "license is current",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .is_current[0],
            ],
            [
                "license is active",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .license_status[0],
            ],
            [
                "license check",
                df_license_check[df_license_check["license_number"].isin(license_list)]
                .reset_index()
                .license_check[0],
            ],
            ["metrc cogs coverage", round(metrc_cogs_coverage_current, 2)],
            ["metrc cogs coverage reliable ?", metrc_cogs_coverage_current_reliable],
            ["metrc inventory coverage", round(metrc_inventory_coverage_current, 2)],
            [
                "metrc inventory coverage reliable ?",
                metrc_inventory_coverage_current_reliable,
            ],
            ["inventory turnover", inventory_to_current],
            ["inventory turnover score", inventory_to_current_score],
            # gm
            ["GM past 3m", gm_past_quarter],
            ["GM score 3m", gm_past_quarter_score],
            ["GM past 6m", gm_past_2quarters],
            ["GM score past 6m", gm_past_2quarters_score],
            ["GM past 9m", gm_past_3quarters],
            ["GM score past 9m", gm_past_3quarters_score],
            ["Total GM perc score", total_gm_perc_score],
            ["GM dollar", gm_dollar],
            ["GM dollar score", gm_dollar_score],
            ["Total GM score", total_gm_score],
            # vendor churn
            ["vendor churn", vendor_churn_current],
            ["vendor churn score", vendor_churn_current_score],
            # revenue trend vs state
            ["revenue vs state change score", revenue_state_score],
            # inventory valuation
            ["inventory valuation", round(inventory, 2)],
            ["inventory valuation after tax (CA only)", round(inventory_after_tax, 2)],
            ["fresh inventory valuation", round(fresh_inventory, 2)],
            [
                "fresh inventory valuation after tax (CA only)",
                round(fresh_inventory_after_tax, 2),
            ],
            # inventory valuation msrp based
            ["inventory valuation (msrp based)", round(inventory_msrp, 2)],
            # sum past 3m cogs afte tax
            ["sum cogs past 3m", round(sum_cogs_past_3months, 2)],
            [
                "sum cogs past 3m after tax (CA only)",
                round(sum_cogs_past_3months_after_tax, 2),
            ],
            # total score
            ["total score", total],
            [
                "Calculated monthly Rate (%)",
                calculate_interest_rate(total, 45)[0] * 100,
            ],
            [
                "Calculated interest rate (%)",
                calculate_interest_rate(total, 45)[1] * 100,
            ],
            ["credit limit", credit_limit],
        ]
    )
    return template_data
