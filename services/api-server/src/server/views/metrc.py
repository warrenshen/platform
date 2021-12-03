import logging
import json
from datetime import timedelta
from typing import Any, List, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.audit import events
from bespoke.async_util.pipeline_constants import PipelineName, PipelineState
from bespoke.db import db_constants, models, models_util
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.metrc import metrc_util, transfers_util
from bespoke.metrc.common import metrc_common_util
from dateutil import parser
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('metrc', __name__)

class UpsertApiKeyView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'metrc_api_key_id',
			'api_key',
			'us_state',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = metrc_util.upsert_api_key(
				company_id=form['company_id'],
				metrc_api_key_id=form['metrc_api_key_id'],
				api_key=form['api_key'],
				us_state=form['us_state'],
				use_saved_licenses_only=form.get('use_saved_licenses_only'),
				security_cfg=cfg.get_security_config(),
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DeleteApiKeyView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'metrc_api_key_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = metrc_util.delete_api_key(
				metrc_api_key_id=form['metrc_api_key_id'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ViewApiKeyView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'metrc_api_key_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:

			view_api_key_resp, err = metrc_util.view_api_key(
				metrc_api_key_id=form['metrc_api_key_id'],
				security_cfg=cfg.get_security_config(),
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'data': view_api_key_resp,
		}), 200)

class SyncMetrcDataPerCustomerView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to download metrc data for 1 customer using the SYNC endpoint")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)

		start_date = date_util.load_date_str(data['start_date'])
		end_date = date_util.load_date_str(data['end_date'])

		if data.get('use_async'):
			logging.info(f"Submitting request to sync metrc data for 1 customer [async]")
		
			with session_scope(current_app.session_maker) as session:
				pipeline = models.AsyncPipeline()
				pipeline.name = PipelineName.SYNC_METRC_DATA_PER_CUSTOMER
				pipeline.internal_state = {}
				pipeline.status = PipelineState.SUBMITTED
				pipeline.params = {
					'company_id': data['company_id'],
					'start_date': data['start_date'],
					'end_date': data['end_date']
				}
				session.add(pipeline)
				session.flush()
				pipeline_id = str(pipeline.id)

			return make_response(json.dumps({
				'status': 'OK',
				'pipeline_id': pipeline_id
			}))
		else:
			cur_date = start_date
			while cur_date <= end_date:
				resp, fatal_err = metrc_util.download_data_for_one_customer(
					company_id=data['company_id'],
					auth_provider=cfg.get_metrc_auth_provider(),
					worker_cfg=cfg.get_metrc_worker_config(),
					sendgrid_client=sendgrid_client,
					security_cfg=cfg.get_security_config(),
					cur_date=cur_date,
					session_maker=current_app.session_maker
				)
				cur_date = cur_date + timedelta(days=1)
				if fatal_err:
					return make_response(json.dumps({
						'status': 'ERROR',
						'errors': [f'{fatal_err}']
					}))

			logging.info(f"Finished syncing metrc data for 1 customer")

			return make_response(json.dumps({
				'status': 'OK',
				'errors': ['{}'.format(err) for err in resp['all_errs']]
			}))

handler.add_url_rule(
	'/upsert_api_key', view_func=UpsertApiKeyView.as_view(name='upsert_api_key_view'))

handler.add_url_rule(
	'/view_api_key', view_func=ViewApiKeyView.as_view(name='view_api_key_view'))

handler.add_url_rule(
	'/delete_api_key', view_func=DeleteApiKeyView.as_view(name='delete_api_key_view'))

handler.add_url_rule(
	'/sync_metrc_data_per_customer', view_func=SyncMetrcDataPerCustomerView.as_view(name='sync_metrc_data_per_customer_view'))
