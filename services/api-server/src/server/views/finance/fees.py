import datetime
import json
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util, repayment_util_fees
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_fees', __name__)


class MakeAccountLevelFeeView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.FINANCE_MAKE_ACCOUNT_LEVEL_FEE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()

		required_keys = [
			'company_id',
			'subtype',
			'amount',
			'payment_date',
			'settlement_date',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from make account level fee request'.format(key))

		with models.session_scope(current_app.session_maker) as session:
			payment_id = payment_util.create_and_add_account_level_fee(
				company_id=form['company_id'],
				subtype=form['subtype'],
				amount=form['amount'],
				originating_payment_id=None,
				created_by_user_id=user_session.get_user_id(),
				payment_date=date_util.load_date_str(form['payment_date']),
				effective_date=date_util.load_date_str(form['settlement_date']),
				session=session
			)

		resp = {
			'status': 'OK',
			'payment_id': payment_id
		}
		return make_response(json.dumps(resp), 200)

class MakeAccountLevelFeeRepaymentView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.FINANCE_MAKE_ACCOUNT_LEVEL_FEE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		required_keys = [
			'company_id',
			'payment'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from make account level fee repayment'.format(key))

		with models.session_scope(current_app.session_maker) as session:
			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment(
				company_id=form['company_id'],
				payment_input=form['payment'],
				created_by_user_id=user_session.get_user_id(),
				session=session
			)
			if err:
				raise err

		resp = {
			'status': 'OK',
			'payment_id': payment_id
		}
		return make_response(json.dumps(resp), 200)

class SettleAccountLevelFeeRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.FINANCE_SETTLE_ACCOUNT_LEVEL_FEE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id',
			'amount',
			'deposit_date',
			'settlement_date',
			'items_covered'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from settle account level fee repayment'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			transaction_ids, err = repayment_util_fees.settle_repayment_of_fee(
				cast(repayment_util_fees.SettleRepayFeeReqDict, form),
				user_session.get_user_id(),
				session
			)
			if err:
				raise err

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'transaction_ids': transaction_ids
		}), 200)


class MakeAccountLevelFeeRepaymentWithAccountCreditView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.FINANCE_MAKE_ACCOUNT_LEVEL_FEE_REPAYMENT_WITH_ACCOUNT_CREDIT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		required_keys = [
			'company_id',
			'payment'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from make account level fee repayment'.format(key))

		with models.session_scope(current_app.session_maker) as session:
			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment_with_account_credit(
				company_id=form['company_id'],
				payment_input=form['payment'],
				created_by_user_id=user_session.get_user_id(),
				session=session
			)
			if err:
				raise err

		resp = {
			'status': 'OK',
			'payment_id': payment_id
		}
		return make_response(json.dumps(resp), 200)

class SettleAccountLevelFeeRepaymentWithAccountCreditView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.FINANCE_SETTLE_ACCOUNT_LEVEL_FEE_REPAYMENT_WITH_ACCOUNT_CREDIT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id',
			'amount',
			'effective_date',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from settle account level fee repayment'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			transaction_ids, err = repayment_util_fees.settle_repayment_of_fee_with_account_credit(
				cast(repayment_util_fees.SettleRepayFeeWithAccountCreditReqDict, form),
				user_session.get_user_id(),
				session
			)
			if err:
				raise err

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'transaction_ids': transaction_ids
		}), 200)

handler.add_url_rule(
	'/settle_account_level_fee_repayment_with_account_credit', view_func=SettleAccountLevelFeeRepaymentWithAccountCreditView.as_view(name='settle_account_level_fee_repayment_with_account_credit_view'))

handler.add_url_rule(
	'/make_account_level_fee_repayment_with_account_credit', view_func=MakeAccountLevelFeeRepaymentWithAccountCreditView.as_view(name='make_account_level_fee_repayment_with_account_credit_view'))

handler.add_url_rule(
	'/settle_account_level_fee_repayment', view_func=SettleAccountLevelFeeRepaymentView.as_view(name='settle_account_level_fee_repayment_view'))

handler.add_url_rule(
	'/make_account_level_fee_repayment', view_func=MakeAccountLevelFeeRepaymentView.as_view(name='make_account_level_fee_repayment_view'))

handler.add_url_rule(
	'/make_account_level_fee', view_func=MakeAccountLevelFeeView.as_view(name='make_account_level_fee_view'))
