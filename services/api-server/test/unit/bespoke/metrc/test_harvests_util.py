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
from bespoke.metrc import harvests_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict, CompanyInfo

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _harvest_json(p: Dict) -> Dict:
	p['Name'] = p['Id'] + '-name'
	return p

class TestPopulateHarvestsTable(db_unittest.TestCase):

	def test_populate_harvests(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		license_id = str(uuid.uuid4())

		ctx = metrc_common_util.DownloadContext(
			sendgrid_client=None,
			cur_date=date_util.load_date_str('1/1/2020'),
			company_info=CompanyInfo(
				company_id=company_id,
				name='Company 1',
				licenses=[], # unused
				metrc_api_key_id='',
				apis_to_use=metrc_common_util.get_default_apis_to_use(),
				facilities_payload=None,
			),
			license_auth=LicenseAuthDict(
				license_id=license_id,
				license_number='abcd',
				us_state='CA',
				vendor_key='vkey',
				user_key='ukey'
			),
			debug=True
		)
		ctx.rest = cast(metrc_common_util.REST, FakeREST(
			req_to_resp={
				RequestKey(
					url='/harvests/v1/active',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_harvest_json({
									'Id': 'a-p1',
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/02/2020').isoformat(),
									'Quantity': 1,
								}),
								_harvest_json({
									'Id': 'a-p2',
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/03/2020').isoformat(),
									'Quantity': 2
								})
							]
						}
					]
				},
				RequestKey(
					url='/harvests/v1/inactive',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_harvest_json({
									'Id': 'ia-p3',
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/04/2020').isoformat(),
									'Quantity': 3,
								}),
								_harvest_json({
									'Id': 'ia-p4',
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/05/2020').isoformat(),
									'Quantity': 4,
								})
							]
						}
					]
				},
				RequestKey(
					url='/harvests/v1/onhold',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_harvest_json({
									'Id': 'o-p5',
									'LastModified': parser.parse('02/05/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/06/2020').isoformat(),
									'Quantity': 5,
								}),
								_harvest_json({
									'Id': 'o-p6',
									'LastModified': parser.parse('02/06/2020').isoformat(),
									'HarvestStartDate': parser.parse('02/07/2020').isoformat(),
									'Quantity': 6,
								})
							]
						}
					]
				},
			}
		))
		harvest_objects = harvests_util.download_harvests(ctx)
		harvests_util.write_harvests(harvest_objects, session_maker, BATCH_SIZE=4)
		
		expected_harvests: List[Dict] = [
			{
				'type': 'active',
				'company_id': company_id,
				'harvest_id': 'a-p1',
				'last_modified_at': parser.parse('02/01/2020'),
				'harvest_start_date': parser.parse('02/02/2020').date(),
			},
			{
				'type': 'active',
				'company_id': company_id,
				'harvest_id': 'a-p2',
				'last_modified_at': parser.parse('02/02/2020'),
				'harvest_start_date': parser.parse('02/03/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'harvest_id': 'ia-p3',
				'last_modified_at': parser.parse('02/03/2020'),
				'harvest_start_date': parser.parse('02/04/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'harvest_id': 'ia-p4',
				'last_modified_at': parser.parse('02/04/2020'),
				'harvest_start_date': parser.parse('02/05/2020').date(),
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'harvest_id': 'o-p5',
				'last_modified_at': parser.parse('02/05/2020'),
				'harvest_start_date': parser.parse('02/06/2020').date(),
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'harvest_id': 'o-p6',
				'last_modified_at': parser.parse('02/06/2020'),
				'harvest_start_date': parser.parse('02/07/2020').date(),
			},
		]

		with session_scope(session_maker) as session:
			metrc_harvests = cast(List[models.MetrcHarvest], session.query(
				models.MetrcHarvest).order_by(models.MetrcHarvest.last_modified_at).all())
			self.assertEqual(6, len(metrc_harvests))
			for i in range(len(metrc_harvests)):
				p = metrc_harvests[i]
				exp = expected_harvests[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual('abcd', p.license_number)
				self.assertEqual(exp['harvest_id'], p.harvest_id)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['harvest_start_date'], p.harvest_start_date)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)
