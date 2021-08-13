import logging
import datetime
import json
import requests

from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Callable, List, Tuple, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import chunker

class PlantBatchObj(object):
	
	def __init__(self, batch: models.MetrcPlantBatch) -> None:
		self.metrc_plant_batch = batch

class PlantBatches(object):

	def __init__(self, plant_batches: List[Dict], api_type: str) -> None:
		self._plant_batches = plant_batches
		self._api_type = api_type

	def get_models(self, company_id: str) -> List[PlantBatchObj]:
		plant_batches = []
		for i in range(len(self._plant_batches)):
			p = self._plant_batches[i]
			batch = models.MetrcPlantBatch()
			batch.company_id = cast(Any, company_id)
			batch.type = self._api_type
			batch.plant_batch_id = '{}'.format(p['Id'])
			batch.name = p['Name']
			batch.planted_date = parser.parse(p['PlantedDate'])
			batch.payload = p

			plant_batches.append(PlantBatchObj(
				batch=batch
			))

		return plant_batches

def download_plant_batches(ctx: metrc_common_util.DownloadContext) -> List[PlantBatchObj]:
	active_batches: List[Dict] = []
	inactive_batches: List[Dict] = []

	company_info = ctx.company_info
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/plantbatches/v1/active', time_range=[cur_date_str])
		active_batches = json.loads(resp.content)
		request_status['plant_batches_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plant_batches_api', e)

	try:
		resp = rest.get('/plantbatches/v1/inactive', time_range=[cur_date_str])
		inactive_batches = json.loads(resp.content)
		request_status['plant_batches_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plant_batches_api', e)

	inactive_plant_batch_models = PlantBatches(inactive_batches, 'inactive').get_models(
		company_id=company_info.company_id
	)

	active_plant_batch_models = PlantBatches(active_batches, 'active').get_models(
		company_id=company_info.company_id
	)

	if inactive_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(inactive_batches), company_info.name, ctx.cur_date))

	if active_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(active_batches), company_info.name, ctx.cur_date))

	batch_models = inactive_plant_batch_models + active_plant_batch_models
	return batch_models


def _write_plant_batches_chunk(
	plant_batches: List[PlantBatchObj],
	session: Session) -> None:

	plant_batch_ids = [batch.metrc_plant_batch.plant_batch_id for batch in plant_batches] 

	prev_plant_batches = session.query(models.MetrcPlantBatch).filter(
		models.MetrcPlantBatch.plant_batch_id.in_(plant_batch_ids)
	).all()

	key_to_plant_batch = {}
	for prev_plant_batch in prev_plant_batches:
		key_to_plant_batch[prev_plant_batch.plant_batch_id] = prev_plant_batch

	for plant_batch in plant_batches:
		metrc_batch = plant_batch.metrc_plant_batch
		if metrc_batch.plant_batch_id in key_to_plant_batch:
			# update
			prev = key_to_plant_batch[metrc_batch.plant_batch_id]
			prev.type = metrc_batch.type
			prev.company_id = metrc_batch.company_id
			prev.name = metrc_batch.name
			prev.planted_date = metrc_batch.planted_date
			prev.payload = metrc_batch.payload
		else:
			# add
			session.add(metrc_batch)
			# In some rare cases, a new plant batch may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			key_to_plant_batch[metrc_batch.plant_batch_id] = metrc_batch


def write_plant_batches(plant_batches_models: List[PlantBatchObj], session_maker: Callable) -> None:
	BATCH_SIZE = 50
	batch_index = 1

	batches_count = len(plant_batches_models) // BATCH_SIZE + 1
	for chunk in chunker(plant_batches_models, BATCH_SIZE):
		logging.info(f'Writing plant batches - batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_plant_batches_chunk(chunk, session)
		batch_index += 1

