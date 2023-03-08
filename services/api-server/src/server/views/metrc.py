import json
from typing import Any, cast

from bespoke.db.models import session_scope
from bespoke.metrc import metrc_api_keys_util, metrc_download_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('metrc', __name__)

class RefreshMetrcApiKeyPermissions(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'metrc_api_key_id',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = metrc_download_util.refresh_metrc_api_key_permissions(
				session=session,
				config=cfg,
				metrc_api_key_id=form['metrc_api_key_id'],
				submitted_by_user_id=user_session.get_user_id(),
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
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
			_, err = metrc_api_keys_util.upsert_api_key(
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
			_, err = metrc_api_keys_util.delete_api_key(
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

			view_api_key_resp, err = metrc_api_keys_util.view_api_key(
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

handler.add_url_rule(
	'/refresh_metrc_api_key_permissions', view_func=RefreshMetrcApiKeyPermissions.as_view(name='refresh_metrc_api_key_permissions_view'))

handler.add_url_rule(
	'/upsert_api_key', view_func=UpsertApiKeyView.as_view(name='upsert_api_key_view'))

handler.add_url_rule(
	'/view_api_key', view_func=ViewApiKeyView.as_view(name='view_api_key_view'))

handler.add_url_rule(
	'/delete_api_key', view_func=DeleteApiKeyView.as_view(name='delete_api_key_view'))
