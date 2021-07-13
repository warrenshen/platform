import logging
import json
from datetime import timedelta
from typing import Any, List, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.audit import events
from bespoke.db import db_constants, models, models_util
from bespoke.db.models import session_scope
from bespoke.metrc import metrc_util, metrc_common_util, transfers_util
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
			'api_key', 'company_settings_id', 'metrc_api_key_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:

			_, err = metrc_util.upsert_api_key(
				api_key=form['api_key'], 
				company_settings_id=form['company_settings_id'],
				metrc_api_key_id=form['metrc_api_key_id'],
				security_cfg=cfg.get_security_config(),
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

			api_key, err = metrc_util.view_api_key(
				metrc_api_key_id=form['metrc_api_key_id'],
				security_cfg=cfg.get_security_config(),
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'data': {
				'api_key': api_key,
			},
		}), 200)

class SyncMetrcDataPerCustomerView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to download metrc data for 1 customer using the SYNC endpoint")
		cfg = cast(Config, current_app.app_config)

		data = json.loads(request.data)

		start_date = date_util.load_date_str(data['start_date'])
		end_date = date_util.load_date_str(data['end_date'])

		resp, fatal_err = metrc_util.download_data_for_one_customer(
			company_id=data['company_id'],
			auth_provider=cfg.get_metrc_auth_provider(),
			security_cfg=cfg.get_security_config(),
			start_date=start_date,
			end_date=end_date,
			session_maker=current_app.session_maker
		)
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

class SyncMetrcDataView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to download metrc data from the SYNC endpoint")
		cfg = cast(Config, current_app.app_config)

		data = json.loads(request.data)

		start_date = date_util.load_date_str(data['cur_date'])
		end_date = start_date

		resp, fatal_err = metrc_util.download_data_for_all_customers(
			auth_provider=cfg.get_metrc_auth_provider(),
			security_cfg=cfg.get_security_config(),
			start_date=start_date,
			end_date=end_date,
			session_maker=current_app.session_maker
		)
		if fatal_err:
			raise errors.Error('{}'.format(fatal_err), http_code=500)

		logging.info(f"Finished syncing metrc data for all customers")

		return make_response(json.dumps({
			'status': 'OK',
			'errors': ['{}'.format(err) for err in resp['all_errs']]
		}))

handler.add_url_rule(
	'/upsert_api_key', view_func=UpsertApiKeyView.as_view(name='upsert_api_key_view'))

handler.add_url_rule(
	'/view_api_key', view_func=ViewApiKeyView.as_view(name='view_api_key_view'))

handler.add_url_rule(
	'/sync_metrc_data_per_customer', view_func=SyncMetrcDataPerCustomerView.as_view(name='sync_metrc_data_per_customer_view'))

handler.add_url_rule(
	'/sync_metrc_data', view_func=SyncMetrcDataView.as_view(name='sync_metrc_data_view'))
