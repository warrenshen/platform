import datetime
import decimal
import json
import uuid
import unittest
from dateutil import parser
from mypy_extensions import TypedDict
from typing import Any, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke.db import models
from bespoke.metrc.common import package_common_util

class TestMergePackage(unittest.TestCase):

	def test_maybe_merge_into_prev_package_ignore(self) -> None:
		prev = models.MetrcPackage(
			last_modified_at=parser.parse('01/02/2020'),
			package_id='1',
			package_label='B',
		)
		cur = models.MetrcPackage(
			last_modified_at=parser.parse('01/01/2020'),
			package_id='2',
			package_label='A',
		)

		package_common_util.maybe_merge_into_prev_package(
			prev=prev,
			cur=cur
		)

		fields = ['package_id', 'package_label']
		for field in fields:
			# No overwriting should have taken place because cur took place before prev
			self.assertNotEqual(getattr(prev, field), getattr(cur, field))

	def test_maybe_merge_into_prev_package_perform(self) -> None:
		prev = models.MetrcPackage(
			type='type-1',
			package_id='1',
			package_label='B',
			package_type='1-type',
			product_name='1-name',
			product_category_name='1-category-name',
			package_payload={'Label': 'B'},
			last_modified_at=parser.parse('01/01/2020'),
			packaged_date=parser.parse('01/03/2020'),
			updated_at=parser.parse('01/06/2020')
		)
		prev.company_id = cast(Any, uuid.uuid4())

		cur = models.MetrcPackage(
			type='type-2',
			package_id='2',
			package_label='A',
			package_type='2-type',
			product_name='2-name',
			product_category_name='2-category-name',
			package_payload={'Label': 'A'},
			last_modified_at=parser.parse('01/02/2020'),
			packaged_date=parser.parse('01/04/2020'),
			updated_at=parser.parse('01/05/2020')
		)
		cur.company_id = cast(Any, uuid.uuid4())

		package_common_util.maybe_merge_into_prev_package(
			prev=prev,
			cur=cur
		)

		fields = [
			'type', 
			'company_id',
			'package_id',
			'package_label',
			'package_type',
			'product_name',
			'product_category_name',
			'package_payload',
			'last_modified_at', 
			'packaged_date',
			'updated_at'
		]
		for field in fields:
			# No overwriting should have taken place because cur took place before prev
			self.assertEqual(getattr(prev, field), getattr(cur, field))

class TestMergeTransferPackage(unittest.TestCase):

	def test_maybe_merge_into_prev_package_ignore(self) -> None:
		prev = models.MetrcTransferPackage(
			last_modified_at=parser.parse('01/02/2020'),
			package_id='1',
			package_label='B',
		)
		cur = models.MetrcTransferPackage(
			last_modified_at=parser.parse('01/01/2020'),
			package_id='2',
			package_label='A',
		)

		package_common_util.merge_into_prev_transfer_package(
			prev=prev,
			cur=cur
		)

		fields = ['package_id', 'package_label']
		for field in fields:
			# No overwriting should have taken place because cur took place before prev
			self.assertNotEqual(getattr(prev, field), getattr(cur, field))

	def test_maybe_merge_into_prev_package_perform(self) -> None:
		prev = models.MetrcTransferPackage(
			type='type-1',
			package_id='1',
			package_label='B',
			package_type='1-type',
			product_name='1-name',
			product_category_name='1-category-name',
			package_payload={'Label': 'B'},
			last_modified_at=parser.parse('01/01/2020'),
			updated_at=parser.parse('01/06/2020'),

			shipped_quantity=decimal.Decimal(1.0),
			received_quantity=decimal.Decimal(2.0),
			shipped_unit_of_measure='lbs-1',
			received_unit_of_measure='oz-1',
			shipper_wholesale_price=decimal.Decimal(3.0),
			shipment_package_state='state1',
			lab_results_status='status1',
		)
		prev.company_id = cast(Any, uuid.uuid4())

		cur = models.MetrcTransferPackage(
			type='type-2',
			package_id='2',
			package_label='A',
			package_type='2-type',
			product_name='2-name',
			product_category_name='2-category-name',
			package_payload={'Label': 'A'},
			last_modified_at=parser.parse('01/02/2020'),
			updated_at=parser.parse('01/05/2020'),

			shipped_quantity=decimal.Decimal(3.0),
			received_quantity=decimal.Decimal(4.0),
			shipped_unit_of_measure='lbs-2',
			received_unit_of_measure='oz-2',
			shipper_wholesale_price=decimal.Decimal(5.0),
			shipment_package_state='state2',
			lab_results_status='status2',
		)
		cur.company_id= cast(Any, uuid.uuid4())

		package_common_util.merge_into_prev_transfer_package(
			prev=prev,
			cur=cur
		)

		fields = [
			# common with MetrcPackage
			'type', 
			'company_id',
			'package_id',
			'package_label',
			'package_type',
			'product_name',
			'product_category_name',
			'package_payload',
			'last_modified_at',
			'updated_at',

			# specific to MetrcTransferPackage
			'shipped_quantity',
			'received_quantity',
			'shipped_unit_of_measure',
			'received_unit_of_measure',
			'shipper_wholesale_price',
			'shipment_package_state',
			'lab_results_status'
		]
		for field in fields:
			# No overwriting should have taken place because cur took place before prev
			self.assertEqual(getattr(prev, field), getattr(cur, field))

	def test_transfer_package_to_package(self) -> None:
		cur = models.MetrcTransferPackage(
			type='type-1',
			package_id='1',
			package_label='B',
			package_type='1-type',
			product_name='1-name',
			product_category_name='1-category-name',
			package_payload={'Label': 'B'},
			last_modified_at=parser.parse('01/01/2020'),
			updated_at=parser.parse('01/06/2020')
		)
		cur.company_id = cast(Any, uuid.uuid4())

		got = package_common_util.transfer_package_to_package(cur)

		fields = [
			'type', 
			'company_id',
			'package_id',
			'package_label',
			'package_type',
			'product_name',
			'product_category_name',
			'package_payload',
			'last_modified_at',
			'updated_at'
		]
		for field in fields:
			# All the fields should match from the transfer package to the package
			if field == 'type':
				# type is a special case because it gets rewritten
				self.assertEqual('active', got.type)
			else:
				self.assertEqual(getattr(got, field), getattr(cur, field))
