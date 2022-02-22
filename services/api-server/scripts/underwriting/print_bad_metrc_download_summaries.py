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

from bespoke.inventory.analysis.shared import create_queries


# load_dotenv('/Users/victoria/dev/platform/services/api-server/notebooks/.env')  # TODO: to figure out how to properly do this
load_dotenv()
BIGQUERY_CREDENTIALS_PATH = os.environ.get("BIGQUERY_CREDENTIALS_PATH")

def run():
    engine = create_engine(
        "bigquery://bespoke-financial/ProdMetrcData",
        credentials_path=os.path.expanduser(BIGQUERY_CREDENTIALS_PATH),
    )

    not_completed_metrc_download_summaries_query = create_queries.create_not_completed_metrc_download_summaries_query()
    not_completed_metrc_download_summaries_dataframe = pd.read_sql_query(not_completed_metrc_download_summaries_query, engine)

    download_summary_records = not_completed_metrc_download_summaries_dataframe.to_dict('records')
    for download_summary_record in download_summary_records:
        print(
            # download_summary_record['id'],
            download_summary_record['date'],
            download_summary_record['status'],
            download_summary_record['license_number'],
            download_summary_record['company_name'],
            download_summary_record['company_identifier'],
        )

########################
# main
########################
@click.command()

def main():
    run()


if __name__ == "__main__":
    main()
