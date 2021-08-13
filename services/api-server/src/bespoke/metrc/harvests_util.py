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

class HarvestObj(object):
	
	def __init__(self, harvest: models.MetrcHarvest) -> None:
		self.metrc_harvest = harvest

class Harvests(object):

	def __init__(self, harvests: List[Dict], api_type: str) -> None:
		self._harvests = harvests
		self._api_type = api_type

	def get_models(self, company_id: str) -> List[HarvestObj]:
		harvests = []
		for i in range(len(self._harvests)):
			h = self._harvests[i]
			harvest = models.MetrcHarvest()
			harvest.company_id = cast(Any, company_id)
			harvest.type = self._api_type
			harvest.harvest_id = '{}'.format(h['Id'])
			harvest.name = h['Name']
			harvest.harvest_start_date = parser.parse(h['HarvestStartDate'])
			harvest.payload = h
			harvests.append(HarvestObj(
				harvest=harvest
			))

		return harvests

def download_harvests(ctx: metrc_common_util.DownloadContext) -> List[HarvestObj]:
	active_harvests: List[Dict] = []
	inactive_harvests: List[Dict] = []
	onhold_harvests: List[Dict] = []

	company_info = ctx.company_info
	cur_date_str = ctx.get_cur_date_str()
	request_status = ctx.request_status
	rest = ctx.rest

	try:
		resp = rest.get('/harvests/v1/inactive', time_range=[cur_date_str])
		inactive_harvests = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		request_status['receipts_api'] = e.details.get('status_code')

	try:
		resp = rest.get('/harvests/v1/active', time_range=[cur_date_str])
		active_harvests = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		request_status['receipts_api'] = e.details.get('status_code')

	try:
		resp = rest.get('/harvests/v1/onhold', time_range=[cur_date_str])
		onhold_harvests = json.loads(resp.content)
		request_status['receipts_api'] = 200
	except errors.Error as e:
		request_status['receipts_api'] = e.details.get('status_code')

	active_harvests_models = Harvests(active_harvests, 'active').get_models(
		company_id=company_info.company_id
	)
	inactive_harvests_models = Harvests(inactive_harvests, 'inactive').get_models(
		company_id=company_info.company_id
	)
	onhold_harvests_models = Harvests(onhold_harvests, 'onhold').get_models(
		company_id=company_info.company_id
	)

	if active_harvests:
		logging.info('Downloaded {} active harvests for {} on {}'.format(
			len(active_harvests), company_info.name, ctx.cur_date))

	if inactive_harvests:
		logging.info('Downloaded {} inactive harvests for {} on {}'.format(
			len(inactive_harvests), company_info.name, ctx.cur_date))

	if onhold_harvests:
		logging.info('Downloaded {} onhold harvests for {} on {}'.format(
			len(onhold_harvests), company_info.name, ctx.cur_date))

	harvest_models = active_harvests_models + inactive_harvests_models + onhold_harvests_models
	return harvest_models

def _write_harvests_chunk(
	harvests: List[HarvestObj],
	session: Session) -> None:
	harvest_ids = [harvest.metrc_harvest.harvest_id for harvest in harvests] 

	prev_harvests = session.query(models.MetrcHarvest).filter(
		models.MetrcHarvest.harvest_id.in_(harvest_ids)
	).all()

	key_to_harvest = {}
	for prev_harvest in prev_harvests:
		key_to_harvest[prev_harvest.harvest_id] = prev_harvest

	for harvest in harvests:
		metrc_harvest = harvest.metrc_harvest
		if metrc_harvest.harvest_id in key_to_harvest:
			# update
			prev = key_to_harvest[metrc_harvest.harvest_id]
			prev.type = metrc_harvest.type
			prev.company_id = metrc_harvest.company_id
			prev.name = metrc_harvest.name
			prev.harvest_start_date = metrc_harvest.harvest_start_date
			prev.payload = metrc_harvest.payload
		else:
			# add
			session.add(metrc_harvest)
			# In some rare cases, a new harvest may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			key_to_harvest[metrc_harvest.harvest_id] = metrc_harvest


def write_harvests(harvests_models: List[HarvestObj], session_maker: Callable) -> None:
	BATCH_SIZE = 50
	batch_index = 1

	batches_count = len(harvests_models) // BATCH_SIZE + 1
	for chunk in chunker(harvests_models, BATCH_SIZE):
		logging.info(f'Writing harvests - batch {batch_index} of {batches_count}...')
		with session_scope(session_maker) as session:
			_write_harvests_chunk(chunk, session)
		batch_index += 1

