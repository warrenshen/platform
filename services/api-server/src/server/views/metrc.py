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

class GetTransfersView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'license_id', 'start_date', 'end_date'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		us_state = form.get('us_state', 'CA')

		auth_provider = cfg.get_metrc_auth_provider()

		vendor_key, err = auth_provider.get_vendor_key_by_state(us_state)

		if err:
			return handler_util.make_error_response(err)

		auth_dict = metrc_common_util.AuthDict(
			vendor_key=vendor_key,
			user_key=auth_provider.get_default_user_key()
		)
		rest = metrc_common_util.REST(
			auth_dict,
			license_number=form['license_id'],
			us_state=us_state
		)

		start_date_str = form.get('start_date')
		end_date_str = form.get('end_date')

		start_date = parser.parse(start_date_str)
		end_date = parser.parse(end_date_str)

		cur_date = start_date
		all_transfers_rows: List[List[str]] = []
		all_transfer_package_rows: List[List[str]] = []

		while cur_date <= end_date:
			cur_date_str = cur_date.strftime('%m/%d/%Y')
			resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
			transfers = json.loads(resp.content)
			cur_date = cur_date + timedelta(days=1)
			transfers_obj = transfers_util.Transfers.build(transfers)
			include_transfers_header = len(all_transfers_rows) == 0
			transfers_rows = transfers_obj.to_rows(include_header=include_transfers_header)
			all_transfers_rows.extend(transfers_rows)

			delivery_ids = transfers_obj.get_delivery_ids()
			for delivery_id in delivery_ids:
				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
				t_packages_json = json.loads(resp.content)

				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages/wholesale')
				t_packages_wholesale_json = json.loads(resp.content)

				transfer_packages = transfers_util.TransferPackages(delivery_id, t_packages_json, t_packages_wholesale_json)
				include_packages_header = len(all_transfer_package_rows) == 0
				all_transfer_package_rows.extend(transfer_packages.to_rows(
					include_header=include_packages_header))

				# Code to be used in the future: fetch lab test result by package id.
				# package_ids = transfer_packages.get_package_ids()
				# for package_id in package_ids:
				# 	if package_id == '4674851' or package_id == 4674851:
				# 		resp = rest.get(f'/labtests/v1/results?packageId={package_id}')
				# 		package_json = json.loads(resp.content)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Success',
			'data': {
				'transfer_rows': all_transfers_rows,
				'transfer_package_rows': all_transfer_package_rows
			},
		}), 200)

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
			raise errors.Error('{}'.format(fatal_err), http_code=500)

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
	'/get_transfers', view_func=GetTransfersView.as_view(name='get_transfers_view'))

handler.add_url_rule(
	'/upsert_api_key', view_func=UpsertApiKeyView.as_view(name='upsert_api_key_view'))

handler.add_url_rule(
	'/view_api_key', view_func=ViewApiKeyView.as_view(name='view_api_key_view'))

handler.add_url_rule(
	'/sync_metrc_data_per_customer', view_func=SyncMetrcDataPerCustomerView.as_view(name='sync_metrc_data_per_customer_view'))

handler.add_url_rule(
	'/sync_metrc_data', view_func=SyncMetrcDataView.as_view(name='sync_metrc_data_view'))
