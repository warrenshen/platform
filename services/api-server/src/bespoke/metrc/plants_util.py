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

class PlantObj(object):
	
	def __init__(self, plant: models.MetrcPlant) -> None:
		self.metrc_plant = plant

def _get_prev_plants(us_state: str, plant_ids: List[str], session: Session) -> List[models.MetrcPlant]:
	prev_plants = []

	for plant_id in plant_ids:
		prev_plant = session.query(models.MetrcPlant).filter(
			models.MetrcPlant.us_state == us_state
		).filter(
			models.MetrcPlant.plant_id == plant_id
		).first()
		if prev_plant:
			prev_plants.append(prev_plant)

	return prev_plants

class Plants(object):

	def __init__(self, plants: List[Dict], api_type: str) -> None:
		self._plants = plants
		self._api_type = api_type

	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'Plants':
		"""
			Only keep plants which are newly updated, e.g.,
			last_modified_at > db.last_modified_at.

			This prevents us from modifying plants where we know they haven't changed.
		"""

		us_state = ctx.license['us_state']
		plant_ids = ['{}'.format(p['Id']) for p in self._plants]
		prev_plants = _get_prev_plants(us_state, plant_ids, session)

		plant_id_to_plant = {}
		for prev_plant in prev_plants:
			plant_id_to_plant[prev_plant.plant_id] = prev_plant

		new_plants = []
		for p in self._plants:
			cur_plant_id = '{}'.format(p['Id']) 
			if cur_plant_id in plant_id_to_plant:
				prev_plant = plant_id_to_plant[cur_plant_id]
				if prev_plant.last_modified_at >= parser.parse(p['LastModified']):
					# If we've seen a previous plant that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					continue
			
			new_plants.append(p)

		self._plants = new_plants		

		return self

	def get_models(self, ctx: metrc_common_util.DownloadContext) -> List[PlantObj]:
		plants = []
		company_id = ctx.company_details['company_id']
		license_number = ctx.license['license_number']
		us_state = ctx.license['us_state']

		for i in range(len(self._plants)):
			p = self._plants[i]
			plant = models.MetrcPlant()
			plant.company_id = cast(Any, company_id)
			plant.type = self._api_type
			plant.license_number = license_number
			plant.us_state = us_state
			plant.plant_id = '{}'.format(p['Id'])
			plant.label = p['Label']
			plant.planted_date = parser.parse(p['PlantedDate'])
			plant.last_modified_at = parser.parse(p['LastModified'])
			plant.payload = p

			plants.append(PlantObj(
				plant=plant
			))

		return plants

def download_plants(ctx: metrc_common_util.DownloadContext, session_maker: Callable) -> List[PlantObj]:
	vegetative_plants: List[Dict] = []
	flowering_plants: List[Dict] = []
	inactive_plants: List[Dict] = []
	onhold_plants: List[Dict] = []

	company_details = ctx.company_details
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/plants/v1/vegetative', time_range=[cur_date_str])
		vegetative_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/flowering', time_range=[cur_date_str])
		flowering_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/inactive', time_range=[cur_date_str])
		inactive_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/onhold', time_range=[cur_date_str])
		onhold_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	license_number = ctx.license['license_number']

	with session_scope(session_maker) as session:
		vegetative_plant_models = Plants(vegetative_plants, 'vegetative').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	with session_scope(session_maker) as session:
		flowering_plant_models = Plants(flowering_plants, 'flowering').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	with session_scope(session_maker) as session:
		inactive_plant_models = Plants(inactive_plants, 'inactive').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	with session_scope(session_maker) as session:
		onhold_plant_models = Plants(onhold_plants, 'onhold').filter_new_only(
				ctx, session).get_models(ctx=ctx)

	if vegetative_plants:
		logging.info('Downloaded {} vegetative plants for {} on {}'.format(
			len(vegetative_plants), company_details['name'], ctx.cur_date))

	if flowering_plants:
		logging.info('Downloaded {} flowering plants for {} on {}'.format(
			len(flowering_plants), company_details['name'], ctx.cur_date))

	if inactive_plants:
		logging.info('Downloaded {} inactive plants for {} on {}'.format(
			len(inactive_plants), company_details['name'], ctx.cur_date))

	if onhold_plants:
		logging.info('Downloaded {} onhold plants for {} on {}'.format(
			len(onhold_plants), company_details['name'], ctx.cur_date))

	plant_models = vegetative_plant_models + flowering_plant_models + inactive_plant_models + onhold_plant_models
	
	if not plant_models:
		logging.info('No new plants to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))

	return plant_models

def _write_plants_chunk(
	plants: List[PlantObj],
	session: Session,
) -> None:
	if not plants:
		return

	key_to_plant = {}

	us_state = plants[0].metrc_plant.us_state
	plant_ids = [plant.metrc_plant.plant_id for plant in plants]

	prev_plants = _get_prev_plants(us_state, plant_ids, session)
	for prev_plant in prev_plants:
		key_to_plant[prev_plant.plant_id] = prev_plant

	for plant in plants:
		metrc_plant = plant.metrc_plant
		if metrc_plant.plant_id in key_to_plant:
			# update
			prev = key_to_plant[metrc_plant.plant_id]
			prev.type = metrc_plant.type
			prev.license_number = metrc_plant.license_number
			prev.us_state = metrc_plant.us_state
			prev.company_id = metrc_plant.company_id
			prev.label = metrc_plant.label
			prev.planted_date = metrc_plant.planted_date
			prev.payload = metrc_plant.payload
			prev.last_modified_at = metrc_plant.last_modified_at
		else:
			# add
			session.add(metrc_plant)
			# In some rare cases, a new harvest may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			key_to_plant[metrc_plant.plant_id] = metrc_plant


def write_plants(plants_models: List[PlantObj], session_maker: Callable, BATCH_SIZE: int = 50) -> None:
	batch_index = 1

	batches_count = len(plants_models) // BATCH_SIZE + 1
	for chunk in chunker(plants_models, BATCH_SIZE):
		logging.info(f'Writing plants - batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_plants_chunk(chunk, session)
		batch_index += 1

def download_plants_with_session(
	session: Session,
	ctx: metrc_common_util.DownloadContext,
) -> List[PlantObj]:
	vegetative_plants: List[Dict] = []
	flowering_plants: List[Dict] = []
	inactive_plants: List[Dict] = []
	onhold_plants: List[Dict] = []

	company_details = ctx.company_details
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/plants/v1/vegetative', time_range=[cur_date_str])
		vegetative_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/flowering', time_range=[cur_date_str])
		flowering_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/inactive', time_range=[cur_date_str])
		inactive_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	try:
		resp = rest.get('/plants/v1/onhold', time_range=[cur_date_str])
		onhold_plants = json.loads(resp.content)
		request_status['plants_api'] = 200
	except errors.Error as e:
		metrc_common_util.update_if_all_are_unsuccessful(request_status, 'plants_api', e)

	license_number = ctx.license['license_number']

	vegetative_plant_models = Plants(vegetative_plants, 'vegetative').filter_new_only(
		ctx, session).get_models(ctx=ctx)

	flowering_plant_models = Plants(flowering_plants, 'flowering').filter_new_only(
		ctx, session).get_models(ctx=ctx)

	inactive_plant_models = Plants(inactive_plants, 'inactive').filter_new_only(
		ctx, session).get_models(ctx=ctx)

	onhold_plant_models = Plants(onhold_plants, 'onhold').filter_new_only(
			ctx, session).get_models(ctx=ctx)

	if vegetative_plants:
		logging.info('Downloaded {} vegetative plants for {} on {}'.format(
			len(vegetative_plants), company_details['name'], ctx.cur_date))

	if flowering_plants:
		logging.info('Downloaded {} flowering plants for {} on {}'.format(
			len(flowering_plants), company_details['name'], ctx.cur_date))

	if inactive_plants:
		logging.info('Downloaded {} inactive plants for {} on {}'.format(
			len(inactive_plants), company_details['name'], ctx.cur_date))

	if onhold_plants:
		logging.info('Downloaded {} onhold plants for {} on {}'.format(
			len(onhold_plants), company_details['name'], ctx.cur_date))

	plant_models = vegetative_plant_models + flowering_plant_models + inactive_plant_models + onhold_plant_models
	
	if not plant_models:
		logging.info('No new plants to write for {} on {}'.format(
			company_details['name'], ctx.cur_date
		))

	return plant_models

def write_plants_with_session(
	session: Session,
	plants_models: List[PlantObj],
	batch_size: int = 50,
) -> None:
	batch_index = 1

	batches_count = len(plants_models) // batch_size + 1
	for chunk in chunker(plants_models, batch_size):
		logging.info(f'Writing plants - batch {batch_index} of {batches_count}...')
		_write_plants_chunk(chunk, session)
		session.commit()
		batch_index += 1
