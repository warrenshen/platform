import json
import logging
import os

from google.cloud import bigquery
from jinjasql import JinjaSql
from typing import Any, Dict

log = logging.getLogger(__name__)

ALLOWED_BIGQUERY_DATATYPES = [
    "STRING",
    "BYTES",
    "INTEGER",
    "INT64",
    "BOOLEAN",
    "BOOL",
    "TIMESTAMP",
    "DATE",
    "TIME",
    "DATETIME",
    "GEOGRAPHY",
    "NUMERIC",
]

AIRFLOW_ENV = os.getenv("AIRFLOW_ENV", "development")

class BigQueryHelper(object):
    def __init__(self) -> None:
        log.info("initializing big query helper")
        self.client: bigquery.Client = None
        self.set_client()
        self.jinja_sql = JinjaSql(param_style='pyformat')

    def set_client(self) -> None:
        log.info("setting client")
        # did lazy imports
        from google.cloud import bigquery
        from google.oauth2 import service_account

        service_account_string = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_DICT")
        service_account_dict = json.loads(service_account_string)
        credentials = service_account.Credentials.from_service_account_info(service_account_dict)
        self.client = bigquery.Client(
            project="bespoke-financial",
            credentials=credentials,
        )
        log.info("developer client set")

    def execute_sql(self, sql: str) -> bigquery.table.RowIterator:
        query_job = self.client.query(sql)
        results = query_job.result()
        log.info(f"execute sql results - {results}")
        return results

    def construct_sql(self, query_template: str, params: Dict[str, Any] = {}) -> str:
        query, bind_params = self.jinja_sql.prepare_query(query_template, params)

        final_sql = query % bind_params
        log.info(f'sql -- {final_sql}')
        return final_sql
