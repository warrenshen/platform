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
from bespoke.metrc import plants_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict, CompanyInfo

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _plant_json(p: Dict) -> Dict:
	p['Label'] = p['Id'] + '-label'
	return p

class TestPopulatePlantsTable(db_unittest.TestCase):

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
					url='/plants/v1/vegetative',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_json({
									'Id': 'a-p1',
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'PlantedDate': parser.parse('02/02/2020').isoformat(),
								}),
								_plant_json({
									'Id': 'a-p2',
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'PlantedDate': parser.parse('02/03/2020').isoformat(),
								})
							]
						}
					]
				},
				RequestKey(
					url='/plants/v1/flowering',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_json({
									'Id': 'a-p3',
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'PlantedDate': parser.parse('02/04/2020').isoformat(),
								}),
								_plant_json({
									'Id': 'a-p4',
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'PlantedDate': parser.parse('02/05/2020').isoformat(),
								})
							]
						}
					]
				},
				RequestKey(
					url='/plants/v1/inactive',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_json({
									'Id': 'ia-p5',
									'LastModified': parser.parse('02/05/2020').isoformat(),
									'PlantedDate': parser.parse('02/06/2020').isoformat(),
								}),
								_plant_json({
									'Id': 'ia-p6',
									'LastModified': parser.parse('02/06/2020').isoformat(),
									'PlantedDate': parser.parse('02/07/2020').isoformat(),
								})
							]
						}
					]
				},
				RequestKey(
					url='/plants/v1/onhold',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_json({
									'Id': 'ia-p7',
									'LastModified': parser.parse('02/07/2020').isoformat(),
									'PlantedDate': parser.parse('02/08/2020').isoformat(),
								}),
								_plant_json({
									'Id': 'ia-p8',
									'LastModified': parser.parse('02/08/2020').isoformat(),
									'PlantedDate': parser.parse('02/09/2020').isoformat(),
								})
							]
						}
					]
				},
			}
		))
		plants_objects = plants_util.download_plants(ctx)
		plants_util.write_plants(plants_objects, session_maker, BATCH_SIZE=4)
		
		expected_plants: List[Dict] = [
			{
				'type': 'vegetative',
				'company_id': company_id,
				'plant_id': 'a-p1',
				'last_modified_at': parser.parse('02/01/2020'),
				'planted_date': parser.parse('02/02/2020').date(),
			},
			{
				'type': 'vegetative',
				'company_id': company_id,
				'plant_id': 'a-p2',
				'last_modified_at': parser.parse('02/02/2020'),
				'planted_date': parser.parse('02/03/2020').date(),
			},
			{
				'type': 'flowering',
				'company_id': company_id,
				'plant_id': 'a-p3',
				'last_modified_at': parser.parse('02/03/2020'),
				'planted_date': parser.parse('02/04/2020').date(),
			},
			{
				'type': 'flowering',
				'company_id': company_id,
				'plant_id': 'a-p4',
				'last_modified_at': parser.parse('02/04/2020'),
				'planted_date': parser.parse('02/05/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'plant_id': 'ia-p5',
				'last_modified_at': parser.parse('02/05/2020'),
				'planted_date': parser.parse('02/06/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'plant_id': 'ia-p6',
				'last_modified_at': parser.parse('02/06/2020'),
				'planted_date': parser.parse('02/07/2020').date(),
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'plant_id': 'ia-p7',
				'last_modified_at': parser.parse('02/07/2020'),
				'planted_date': parser.parse('02/08/2020').date(),
			},
			{
				'type': 'onhold',
				'company_id': company_id,
				'plant_id': 'ia-p8',
				'last_modified_at': parser.parse('02/08/2020'),
				'planted_date': parser.parse('02/09/2020').date(),
			},
		]

		with session_scope(session_maker) as session:
			metrc_plants = cast(List[models.MetrcPlant], session.query(
				models.MetrcPlant).order_by(models.MetrcPlant.last_modified_at).all())
			self.assertEqual(8, len(metrc_plants))
			for i in range(len(metrc_plants)):
				p = metrc_plants[i]
				exp = expected_plants[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual('abcd', p.license_number)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['plant_id'], p.plant_id)
				self.assertEqual(exp['planted_date'], p.planted_date)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)
