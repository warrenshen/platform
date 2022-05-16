import uuid
from dateutil import parser
from typing import Dict, List, cast

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc import plant_batches_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc import metrc_test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _plant_batch_json(p: Dict) -> Dict:
	p['Name'] = p['Id'] + '-name'
	return p

class TestPopulatePlantBatchesTable(db_unittest.TestCase):

	def test_populate_plant_batches(self) -> None:
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
					url='/plantbatches/v1/active',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_batch_json({
									'Id': 'a-p1',
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'PlantedDate': parser.parse('02/02/2020').isoformat(),
									'Quantity': 1,
								}),
								_plant_batch_json({
									'Id': 'a-p2',
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'PlantedDate': parser.parse('02/03/2020').isoformat(),
									'Quantity': 2
								})
							]
						}
					]
				},
				RequestKey(
					url='/plantbatches/v1/inactive',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_plant_batch_json({
									'Id': 'ia-p3',
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'PlantedDate': parser.parse('02/04/2020').isoformat(),
									'Quantity': 3,
								}),
								_plant_batch_json({
									'Id': 'ia-p4',
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'PlantedDate': parser.parse('02/05/2020').isoformat(),
									'Quantity': 4,
								})
							]
						}
					]
				},
			}
		))
		plant_batches_objects = plant_batches_util.download_plant_batches(ctx, session_maker)
		plant_batches_util.write_plant_batches(plant_batches_objects, session_maker, BATCH_SIZE=4)
		
		expected_plant_batches: List[Dict] = [
			{
				'type': 'active',
				'company_id': company_id,
				'plant_batch_id': 'a-p1',
				'last_modified_at': parser.parse('02/01/2020'),
				'planted_date': parser.parse('02/02/2020').date(),
			},
			{
				'type': 'active',
				'company_id': company_id,
				'plant_batch_id': 'a-p2',
				'last_modified_at': parser.parse('02/02/2020'),
				'planted_date': parser.parse('02/03/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'plant_batch_id': 'ia-p3',
				'last_modified_at': parser.parse('02/03/2020'),
				'planted_date': parser.parse('02/04/2020').date(),
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'plant_batch_id': 'ia-p4',
				'last_modified_at': parser.parse('02/04/2020'),
				'planted_date': parser.parse('02/05/2020').date(),
			},
		]

		with session_scope(session_maker) as session:
			metrc_plant_batches = cast(List[models.MetrcPlantBatch], session.query(
				models.MetrcPlantBatch).order_by(models.MetrcPlantBatch.last_modified_at).all())
			self.assertEqual(4, len(metrc_plant_batches))
			for i in range(len(metrc_plant_batches)):
				p = metrc_plant_batches[i]
				exp = expected_plant_batches[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual('abcd', p.license_number)
				self.assertEqual('CA', p.us_state)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['plant_batch_id'], p.plant_batch_id)
				self.assertEqual(exp['planted_date'], p.planted_date)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)
