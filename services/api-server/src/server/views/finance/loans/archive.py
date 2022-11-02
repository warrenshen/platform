import json
from typing import Any, Dict, cast

from bespoke.audit import events
from bespoke.db import queries
from bespoke.db.db_constants import LoanStatusEnum
from bespoke.db.models import session_scope
from bespoke.finance.loans import delete_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('archive', __name__)

class ArchiveLoanView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_ARCHIVE_LOAN)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'loan_id',
			'company_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from archive loan request'.format(key))

		loan_id = form['loan_id']
		company_id = form['company_id']

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			if not user_session.is_bank_or_this_company_admin(company_id):
				return handler_util.make_error_response('Access Denied')

			loan, err = queries.get_loan(session, loan_id)
			if err:
				raise err
			
			loan.status = LoanStatusEnum.ARCHIVED

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class UnarchiveLoanView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_UNARCHIVE_LOAN)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'loan_id',
			'company_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from unarchive loan request'.format(key))

		loan_id = form['loan_id']
		company_id = form['company_id']

		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			if not user_session.is_bank_or_this_company_admin(company_id):
				return handler_util.make_error_response('Access Denied')

			loan, err = queries.get_loan(session, loan_id)
			if err:
				raise err
			
			if loan.approved_at:
				loan.status = LoanStatusEnum.APPROVED
			elif loan.requested_at:
				loan.status = LoanStatusEnum.APPROVAL_REQUESTED
			else:
				loan.status = LoanStatusEnum.DRAFTED

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


handler.add_url_rule(
	'/archive_loan', view_func=ArchiveLoanView.as_view(name='archive_loan_view'))

handler.add_url_rule(
	'/unarchive_loan', view_func=UnarchiveLoanView.as_view(name='unarchive_loan_view'))
