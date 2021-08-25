import datetime
import decimal
import json
import uuid
import unittest
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke.metrc.common import metrc_common_util

class TestFns(unittest.TestCase):

	def test_get_default_apis_to_use(self) -> None:
		self.assertEqual(dict(
			sales_receipts=True,
			sales_transactions=True,
			incoming_transfers=True,
			outgoing_transfers=True,
			packages=True,
			lab_tests=True,
			harvests=True,
			plants=True,
			plant_batches=True,
		), metrc_common_util.get_default_apis_to_use())
