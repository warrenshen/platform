import logging
import time
from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Callable, Dict, List, cast

from bespoke.async_util.pipeline_constants import PipelineName, PipelineState
from bespoke.config.config_util import MetrcAuthProvider
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.security import security_util
from bespoke.metrc import metrc_util

class Context(object):

	def __init__(self, 
		session_maker: Callable,
		metrc_auth_provider: MetrcAuthProvider,
		sendgrid_client: sendgrid_util.Client,
		security_cfg: security_util.ConfigDict
	) -> None:
		self.session_maker = session_maker
		self.metrc_auth_provider = metrc_auth_provider
		self.sendgrid_client = sendgrid_client
		self.security_cfg = security_cfg

StepUpdateRespDict = TypedDict('StepUpdateRespDict', {
	'status': str,
	'internal_state': Dict
})

def _sync_metrc_data_all_customers(p: models.AsyncPipelineDict, ctx: Context) -> StepUpdateRespDict:
	internal_state = p['internal_state']
	cur_customer_index = None

	if p['status'] == PipelineState.SUBMITTED:
		cur_comster_index = 0
	elif p['status'] == PipelineState.IN_PROGRESS:
		cur_customer_index = p['internal_state'].get('cur_customer_index')
		if cur_customer_index is None:
			internal_state['err_msg'] = 'No customer index not specified'
			return StepUpdateRespDict(status=PipelineState.FAILURE, internal_state=internal_state)

		cur_customer_index += 1
	else:
		internal_state['err_msg'] = 'Unrecognized pipeline state {}'.format(p['status'])
		return StepUpdateRespDict(status=PipelineState.FAILURE, internal_state=internal_state)

	if cur_customer_index >= len(p['params']['company_ids']):
		return StepUpdateRespDict(status=PipelineState.COMPLETE, internal_state=internal_state)

	start_date = date_util.load_date_str(p['params']['start_date'])
	end_date = date_util.load_date_str(p['params']['end_date'])

	# TODO(dlluncor): If we're at the first customer index, then run facilities
	# for all customers so that we update licenses from /get_facilities

	company_id = p['params']['company_ids'][cur_customer_index]

	cur_date = start_date
	while cur_date <= end_date:

		resp, fatal_err = metrc_util.download_data_for_one_customer(
			company_id=company_id,
			auth_provider=ctx.metrc_auth_provider,
			sendgrid_client=ctx.sendgrid_client,
			security_cfg=ctx.security_cfg,
			cur_date=cur_date,
			session_maker=ctx.session_maker
		)
		if fatal_err:
			if 'err_msgs' not in internal_state:
				internal_state['err_msgs'] = []
			internal_state['err_msgs'].append('{}'.format(fatal_err))
			break

		cur_date = cur_date + timedelta(days=1)
			
	# update things that this customer is complete
	internal_state['cur_customer_index'] = cur_customer_index
	return StepUpdateRespDict(status=PipelineState.IN_PROGRESS, internal_state=internal_state)

def _sync_metrc_data_per_customer(p: models.AsyncPipelineDict, ctx: Context) -> StepUpdateRespDict:
	internal_state = p['internal_state']
	cur_date = None

	if p['status'] == PipelineState.SUBMITTED:
		cur_date = date_util.load_date_str(p['params']['start_date'])
	elif p['status'] == PipelineState.IN_PROGRESS:
		cur_date_str = p['internal_state'].get('cur_date')
		if not cur_date_str:
			internal_state['err_msg'] = 'Current date not specified'
			return StepUpdateRespDict(status=PipelineState.FAILURE, internal_state=internal_state)

		cur_date = date_util.load_date_str(cur_date_str) + timedelta(days=1)
	else:
		internal_state['err_msg'] = 'Unrecognized pipeline state {}'.format(p['status'])
		return StepUpdateRespDict(status=PipelineState.FAILURE, internal_state=internal_state)

	end_date = date_util.load_date_str(p['params']['end_date'])
	if cur_date > end_date:
		return StepUpdateRespDict(status=PipelineState.COMPLETE, internal_state=internal_state)

	resp, fatal_err = metrc_util.download_data_for_one_customer(
		company_id=p['params']['company_id'],
		auth_provider=ctx.metrc_auth_provider,
		sendgrid_client=ctx.sendgrid_client,
		security_cfg=ctx.security_cfg,
		cur_date=cur_date,
		session_maker=ctx.session_maker
	)
	if fatal_err:
		internal_state['err_msg'] = '{}'.format(fatal_err)
		return StepUpdateRespDict(status=PipelineState.FAILURE, internal_state=internal_state)

	# update things that this day is done
	internal_state['cur_date'] = date_util.date_to_str(cur_date)
	return StepUpdateRespDict(status=PipelineState.IN_PROGRESS, internal_state=internal_state)

def _process_pipeline(p: models.AsyncPipelineDict, ctx: Context) -> None:
	if p['name'] == PipelineName.SYNC_METRC_DATA_PER_CUSTOMER:
		update = _sync_metrc_data_per_customer(p, ctx)
	elif p['name'] == PipelineName.SYNC_METRC_DATA_ALL_CUSTOMERS:
		update = _sync_metrc_data_all_customers(p, ctx)
	else:
		return

	with session_scope(ctx.session_maker) as session:
		pipeline = cast(
					models.AsyncPipeline,
				session.query(models.AsyncPipeline).filter(
					models.AsyncPipeline.id == p['id']
				).first())
		if not pipeline:
			logging.warn('Pipeline {} no longer found in the DB'.format(p['id']))
			return

		pipeline.status = update['status']
		pipeline.internal_state = update['internal_state']

def handle_async_tasks(ctx: Context) -> Dict:
	# The api-server submits a "request"
	# The async-server reads the most recent request from the queue, executes one step of it,
	# saves its current state back to the DB, then continues on

	# Pull N requests in queue
	# Execute them in parallel
	# Write the result back to the DB
	# Run the next sequence of the function
	pipeline_dicts = []

	with session_scope(ctx.session_maker) as session:
		pipelines = cast(
					List[models.AsyncPipeline],
				session.query(models.AsyncPipeline).filter(
					models.AsyncPipeline.status.in_([PipelineState.SUBMITTED, PipelineState.IN_PROGRESS])
				).order_by(
						models.AsyncPipeline.updated_at.asc()
				).limit(2).all())

		if not pipelines:
			return {'msg': 'No pipelines to process'}

		pipeline_dicts = [pipeline.as_dict() for pipeline in pipelines]

	print('Have these pipelines to process {}'.format(pipeline_dicts))

	times = []
	for p in pipeline_dicts:
		before = time.time()
		_process_pipeline(p, ctx)
		after = time.time()
		times.append('Pipeline {} took {:.2f} seconds'.format(p['id'], after - before))

	return {
		'msg': 'Have these pipelines to process {}'.format(pipeline_dicts),
		'times': times
	}



		