import uuid
from dateutil import parser
from typing import Dict, List, cast

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc import harvests_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc import metrc_test_helper
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

		ctx = metrc_test_helper.create_download_context(
			cur_date='1/1/2020',
			company_id=company_id,
			name='Company 1',
			license_auth=LicenseAuthDict(
				license_number='abcd',
				us_state='CA',
				vendor_key='vkey',
				user_key='ukey'
			)
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
		harvest_objects = harvests_util.download_harvests(ctx, session_maker)
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
				self.assertEqual('CA', p.us_state)
				self.assertEqual(exp['harvest_id'], p.harvest_id)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['harvest_start_date'], p.harvest_start_date)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)
