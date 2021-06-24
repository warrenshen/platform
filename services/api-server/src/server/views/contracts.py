import json
from typing import cast, Any

from bespoke import errors
from bespoke.db import db_constants, models, models_util
from bespoke.db.models import session_scope
from bespoke.audit import events
from bespoke.finance.contracts import manage_contract_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('contracts', __name__)

class UpdateContractView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CONTRACT_UPDATE)
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'contract_id', 'contract_fields'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		_, err = manage_contract_util.update_contract(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		with session_scope(current_app.session_maker) as session:
			contract = session.query(models.Contract).filter(models.Contract.id == form["contract_id"]).first()
			if not contract:
				raise errors.Error(
					f"Failed to find contract specified in the request (id: {form['contract_id']})")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class TerminateContractView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CONTRACT_TERMINATE)
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'contract_id', 'termination_date'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		_, err = manage_contract_util.terminate_contract(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DeleteContractView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CONTRACT_DELETE)
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'contract_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		_, err = manage_contract_util.delete_contract(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class AddNewContractView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CONTRACT_CREATE)
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id', 'contract_fields'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		new_contract_id, err = manage_contract_util.add_new_contract(
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/terminate_contract', view_func=TerminateContractView.as_view(name='terminate_contract_view'))

handler.add_url_rule(
	'/update_contract', view_func=UpdateContractView.as_view(name='update_contract_view'))

handler.add_url_rule(
	'/delete_contract', view_func=DeleteContractView.as_view(name='delete_contract_view'))

handler.add_url_rule(
	'/add_new_contract', view_func=AddNewContractView.as_view(name='add_new_contract_view'))
