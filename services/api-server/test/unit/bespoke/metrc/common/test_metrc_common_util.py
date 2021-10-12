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

from bespoke.date import date_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import (
	_get_date_str, SplitTimeBy
)

class TestFns(unittest.TestCase):

	def test_get_time_ranges(self) -> None:
		cur_date = date_util.load_date_str('10/01/2020')
		actual_time_ranges = metrc_common_util._get_time_ranges(
			_get_date_str(cur_date), SplitTimeBy.HOUR)

		expected = [
			['2020-10-01T00:00:00', '2020-10-01T01:00:00'],
			['2020-10-01T01:00:00', '2020-10-01T02:00:00'],
			['2020-10-01T02:00:00', '2020-10-01T03:00:00'],
			['2020-10-01T03:00:00', '2020-10-01T04:00:00'],
			['2020-10-01T04:00:00', '2020-10-01T05:00:00'],
			['2020-10-01T05:00:00', '2020-10-01T06:00:00'],
			['2020-10-01T06:00:00', '2020-10-01T07:00:00'],
			['2020-10-01T07:00:00', '2020-10-01T08:00:00'],
			['2020-10-01T08:00:00', '2020-10-01T09:00:00'],
			['2020-10-01T09:00:00', '2020-10-01T10:00:00'],
			['2020-10-01T10:00:00', '2020-10-01T11:00:00'],
			['2020-10-01T11:00:00', '2020-10-01T12:00:00'],
			['2020-10-01T12:00:00', '2020-10-01T13:00:00'],
			['2020-10-01T13:00:00', '2020-10-01T14:00:00'],
			['2020-10-01T14:00:00', '2020-10-01T15:00:00'],
			['2020-10-01T15:00:00', '2020-10-01T16:00:00'],
			['2020-10-01T16:00:00', '2020-10-01T17:00:00'],
			['2020-10-01T17:00:00', '2020-10-01T18:00:00'],
			['2020-10-01T18:00:00', '2020-10-01T19:00:00'],
			['2020-10-01T19:00:00', '2020-10-01T20:00:00'],
			['2020-10-01T20:00:00', '2020-10-01T21:00:00'],
			['2020-10-01T21:00:00', '2020-10-01T22:00:00'],
			['2020-10-01T22:00:00', '2020-10-01T23:00:00'],
			['2020-10-01T23:00:00', '2020-10-02T00:00:00'],
		]

		self.assertEqual(expected, actual_time_ranges)

		cur_date = date_util.load_date_str('10/31/2020')
		actual_time_ranges = metrc_common_util._get_time_ranges(
			_get_date_str(cur_date), SplitTimeBy.HOUR)

		expected = [
			['2020-10-31T00:00:00', '2020-10-31T01:00:00'],
			['2020-10-31T01:00:00', '2020-10-31T02:00:00'],
			['2020-10-31T02:00:00', '2020-10-31T03:00:00'],
			['2020-10-31T03:00:00', '2020-10-31T04:00:00'],
			['2020-10-31T04:00:00', '2020-10-31T05:00:00'],
			['2020-10-31T05:00:00', '2020-10-31T06:00:00'],
			['2020-10-31T06:00:00', '2020-10-31T07:00:00'],
			['2020-10-31T07:00:00', '2020-10-31T08:00:00'],
			['2020-10-31T08:00:00', '2020-10-31T09:00:00'],
			['2020-10-31T09:00:00', '2020-10-31T10:00:00'],
			['2020-10-31T10:00:00', '2020-10-31T11:00:00'],
			['2020-10-31T11:00:00', '2020-10-31T12:00:00'],
			['2020-10-31T12:00:00', '2020-10-31T13:00:00'],
			['2020-10-31T13:00:00', '2020-10-31T14:00:00'],
			['2020-10-31T14:00:00', '2020-10-31T15:00:00'],
			['2020-10-31T15:00:00', '2020-10-31T16:00:00'],
			['2020-10-31T16:00:00', '2020-10-31T17:00:00'],
			['2020-10-31T17:00:00', '2020-10-31T18:00:00'],
			['2020-10-31T18:00:00', '2020-10-31T19:00:00'],
			['2020-10-31T19:00:00', '2020-10-31T20:00:00'],
			['2020-10-31T20:00:00', '2020-10-31T21:00:00'],
			['2020-10-31T21:00:00', '2020-10-31T22:00:00'],
			['2020-10-31T22:00:00', '2020-10-31T23:00:00'],
			['2020-10-31T23:00:00', '2020-11-01T00:00:00'],
		]

		self.assertEqual(expected, actual_time_ranges)

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
