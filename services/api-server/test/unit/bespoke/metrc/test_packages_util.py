import datetime
import decimal
import json
import uuid
import requests
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.metrc import packages_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict, CompanyInfo

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc import metrc_test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _package_json(p: Dict) -> Dict:
	p['Label'] = p['Id'] + '-label'
	p['PackageType'] = p['Id'] + '-type'
	p['UnitOfMeasureName'] = p['Id'] + '-unit-of-measure-name'
	p['Item'] = {}
	p['Item']['Name'] = p['Id'] + '-product-name'
	p['Item']['ProductCategoryName'] = p['Id'] + '-category-name'
	return p

class TestPopulatePackagesTable(db_unittest.TestCase):

	def test_populate_incoming_outgoing_transfers(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		license_id = str(uuid.uuid4())

		ctx = metrc_test_helper.create_download_context(
			cur_date='1/1/2020',
			company_id=company_id,
			name='Company 1',
			license_auth=LicenseAuthDict(
				license_id=license_id,
				license_number='abcd',
				us_state='CA',
				vendor_key='vkey',
				user_key='ukey'
			)
		)
		ctx.rest = cast(metrc_common_util.REST, FakeREST(
			req_to_resp={
				RequestKey(
					url='/packages/v1/active',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_package_json({
									'Id': 'a-p1',
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'PackagedDate': parser.parse('02/02/2020').isoformat(),
									'Quantity': 1,
								}),
								_package_json({
									'Id': 'a-p2',
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'PackagedDate': parser.parse('02/03/2020').isoformat(),
									'Quantity': 2
								})
							]
						}
					]
				},
				RequestKey(
					url='/packages/v1/inactive',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_package_json({
									'Id': 'ia-p3',
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'PackagedDate': parser.parse('02/04/2020').isoformat(),
									'Quantity': 3,
								}),
								_package_json({
									'Id': 'ia-p4',
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'PackagedDate': parser.parse('02/05/2020').isoformat(),
									'Quantity': 4,
								})
							]
						}
					]
				},
				RequestKey(
					url='/packages/v1/onhold',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_package_json({
									'Id': 'o-p5',
									'LastModified': parser.parse('02/05/2020').isoformat(),
									'PackagedDate': parser.parse('02/06/2020').isoformat(),
									'Quantity': 5,
								}),
								_package_json({
									'Id': 'o-p6',
									'LastModified': parser.parse('02/06/2020').isoformat(),
									'PackagedDate': parser.parse('02/07/2020').isoformat(),
									'Quantity': 6,
								})
							]
						}
					]
				},
			}
		))
		package_objects = packages_util.download_packages(ctx)
		packages_util.write_packages(package_objects, session_maker, BATCH_SIZE=4)
		
		expected_packages: List[Dict] = [
			{
				'type': 'active',
				'company_id': company_id,
				'package_id': 'a-p1',
				'last_modified_at': parser.parse('02/01/2020'),
				'packaged_date': parser.parse('02/02/2020').date(),
				'quantity': 1,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'package_id': 'a-p2',
				'last_modified_at': parser.parse('02/02/2020'),
				'packaged_date': parser.parse('02/03/2020').date(),
				'quantity': 2,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'package_id': 'ia-p3',
				'last_modified_at': parser.parse('02/03/2020'),
				'packaged_date': parser.parse('02/04/2020').date(),
				'quantity': 3,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'package_id': 'ia-p4',
				'last_modified_at': parser.parse('02/04/2020'),
				'packaged_date': parser.parse('02/05/2020').date(),
				'quantity': 4,
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'package_id': 'o-p5',
				'last_modified_at': parser.parse('02/05/2020'),
				'packaged_date': parser.parse('02/06/2020').date(),
				'quantity': 5,
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'package_id': 'o-p6',
				'last_modified_at': parser.parse('02/06/2020'),
				'packaged_date': parser.parse('02/07/2020').date(),
				'quantity': 6,
			},
		]

		with session_scope(session_maker) as session:
			metrc_packages = cast(List[models.MetrcPackage], session.query(
				models.MetrcPackage).order_by(models.MetrcPackage.last_modified_at).all())
			self.assertEqual(6, len(metrc_packages))
			for i in range(len(metrc_packages)):
				p = metrc_packages[i]
				exp = expected_packages[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual('abcd', p.license_number)
				self.assertEqual('CA', p.us_state)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['package_id'], p.package_id)
				self.assertEqual(exp['package_id'] + '-label', p.package_label)
				self.assertEqual(exp['package_id'] + '-type', p.package_type)
				self.assertEqual(exp['package_id'] + '-product-name', p.product_name)
				self.assertEqual(exp['package_id'] + '-category-name', p.product_category_name)
				self.assertEqual(exp['package_id'] + '-unit-of-measure-name', p.unit_of_measure)
				self.assertEqual(exp['packaged_date'], p.packaged_date)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.package_payload)
				self.assertEqual(exp['quantity'], p.quantity)
