import logging
import json

from dateutil import parser
from sqlalchemy.orm.session import Session
from typing import Any, Callable, List, Dict, cast

from bespoke import errors
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import chunker

class PlantBatchObj(object):
	
	def __init__(self, batch: models.MetrcPlantBatch) -> None:
		self.metrc_plant_batch = batch

def _get_prev_plant_batches(plant_batch_ids: List[str], session: Session) -> List[models.MetrcPlantBatch]:
	prev_plant_batches = []

	for batch_id in plant_batch_ids:
		prev_plant_batch = session.query(models.MetrcPlantBatch).filter(
			models.MetrcPlantBatch.plant_batch_id == batch_id
		).first()
		if prev_plant_batch:
			prev_plant_batches.append(prev_plant_batch)

	return prev_plant_batches

class PlantBatches(object):

	def __init__(self, plant_batches: List[Dict], api_type: str) -> None:
		self._plant_batches = plant_batches
		self._api_type = api_type

	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'PlantBatches':
		"""
			Only keep plant batches which are newly updated, e.g.,
			last_modified_at > db.last_modified_at.

			This prevents us from modifying plant batches where we know they haven't changed.
		"""

		plant_ids = ['{}'.format(p['Id']) for p in self._plant_batches]
		prev_plants = _get_prev_plant_batches(plant_ids, session)

		plant_id_to_plant = {}
		for prev_plant in prev_plants:
			plant_id_to_plant[prev_plant.plant_batch_id] = prev_plant

		new_plant_batches = []
		for p in self._plant_batches:
			cur_plant_id = '{}'.format(p['Id']) 
			if cur_plant_id in plant_id_to_plant:
				prev_plant = plant_id_to_plant[cur_plant_id]
				if prev_plant.last_modified_at >= parser.parse(p['LastModified']):
					# If we've seen a previous plant batch that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					continue
			
			new_plant_batches.append(p)

		self._plant_batches = new_plant_batches		

		return self

	def get_models(self, ctx: metrc_common_util.DownloadContext) -> List[PlantBatchObj]:
		company_id = ctx.company_details['company_id']
		license_number = ctx.license['license_number']
		us_state = ctx.license['us_state']

		plant_batches = []
		for i in range(len(self._plant_batches)):
			p = self._plant_batches[i]
			batch = models.MetrcPlantBatch()
			batch.company_id = cast(Any, company_id)
			batch.license_number = license_number
			batch.us_state = us_state
			batch.type = self._api_type
			batch.plant_batch_id = '{}'.format(p['Id'])
			batch.name = p['Name']
			batch.planted_date = parser.parse(p['PlantedDate'])
			batch.last_modified_at = parser.parse(p['LastModified'])
			batch.payload = p

			plant_batches.append(PlantBatchObj(
				batch=batch
			))

		return plant_batches

def download_plant_batches(ctx: metrc_common_util.DownloadContext, session_maker: Callable) -> List[PlantBatchObj]:
	active_batches: List[Dict] = []
	inactive_batches: List[Dict] = []

	company_details = ctx.company_details
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

	with session_scope(session_maker) as session:
		inactive_plant_batch_models = PlantBatches(inactive_batches, 'inactive').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	with session_scope(session_maker) as session:
		active_plant_batch_models = PlantBatches(active_batches, 'active').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	if inactive_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(inactive_batches), company_details['name'], ctx.cur_date))

	if active_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(active_batches), company_details['name'], ctx.cur_date))

	batch_models = inactive_plant_batch_models + active_plant_batch_models

	if not batch_models:
		logging.info('No new plant batches to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))

	return batch_models


def _write_plant_batches_chunk(
	plant_batches: List[PlantBatchObj],
	session: Session) -> None:

	key_to_plant_batch = {}
	plant_batch_ids = [batch.metrc_plant_batch.plant_batch_id for batch in plant_batches]
	prev_plant_batches = _get_prev_plant_batches(plant_batch_ids, session)

	for prev_plant_batch in prev_plant_batches:
		if prev_plant_batch:
			key_to_plant_batch[prev_plant_batch.plant_batch_id] = prev_plant_batch

	for plant_batch in plant_batches:
		metrc_batch = plant_batch.metrc_plant_batch
		if metrc_batch.plant_batch_id in key_to_plant_batch:
			# update
			prev = key_to_plant_batch[metrc_batch.plant_batch_id]
			prev.type = metrc_batch.type
			prev.license_number = metrc_batch.license_number
			prev.us_state = metrc_batch.us_state
			prev.company_id = metrc_batch.company_id
			prev.name = metrc_batch.name
			prev.planted_date = metrc_batch.planted_date
			prev.payload = metrc_batch.payload
			prev.last_modified_at = metrc_batch.last_modified_at
		else:
			# add
			session.add(metrc_batch)
			# In some rare cases, a new plant batch may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			key_to_plant_batch[metrc_batch.plant_batch_id] = metrc_batch


def write_plant_batches(plant_batches_models: List[PlantBatchObj], session_maker: Callable, BATCH_SIZE: int = 50) -> None:
	batch_index = 1

	batches_count = len(plant_batches_models) // BATCH_SIZE + 1
	for chunk in chunker(plant_batches_models, BATCH_SIZE):
		logging.info(f'Writing plant batches - batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_plant_batches_chunk(chunk, session)
		batch_index += 1

def download_plant_batches_with_session(
	session: Session,
	ctx: metrc_common_util.DownloadContext,
) -> List[PlantBatchObj]:
	active_batches: List[Dict] = []
	inactive_batches: List[Dict] = []

	company_details = ctx.company_details
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

	inactive_plant_batch_models = PlantBatches(inactive_batches, 'inactive').filter_new_only(
		ctx, session).get_models(ctx=ctx)

	active_plant_batch_models = PlantBatches(active_batches, 'active').filter_new_only(
		ctx, session).get_models(ctx=ctx)

	if inactive_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(inactive_batches), company_details['name'], ctx.cur_date))

	if active_batches:
		logging.info('Downloaded {} inactive batches for {} on {}'.format(
			len(active_batches), company_details['name'], ctx.cur_date))

	batch_models = inactive_plant_batch_models + active_plant_batch_models

	if not batch_models:
		logging.info('No new plant batches to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))

	return batch_models

def write_plant_batches_with_session(
	session: Session,
	plant_batches_models: List[PlantBatchObj],
	batch_size: int = 50,
) -> None:
	batch_index = 1

	batches_count = len(plant_batches_models) // batch_size + 1
	for chunk in chunker(plant_batches_models, batch_size):
		logging.info(f'Writing plant batches - batch {batch_index} of {batches_count}...')
		_write_plant_batches_chunk(chunk, session)
		session.commit()
		batch_index += 1
