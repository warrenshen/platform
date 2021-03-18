import datetime
import json
import logging
from typing import Any, Dict, cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.fetchers import per_customer_fetcher
from bespoke.finance.payments import payment_util, repayment_util
from bespoke.finance.types import per_customer_types
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_repayments', __name__)

class CalculateRepaymentEffectView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_option',
			'amount',
			'settlement_date',
			'loan_ids',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from calculate effect of payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		company_id = form['company_id']
		payment_option = form['payment_option']
		amount = form['amount']
		settlement_date = form['settlement_date']
		loan_ids = form['loan_ids']

		# NOTE: Fetching information is likely a slow task, so we probably want to
		# turn this into an async operation.
		effect_resp, err = repayment_util.calculate_repayment_effect(
			company_id,
			payment_option,
			amount,
			settlement_date,
			loan_ids,
			current_app.session_maker,
		)
		if err:
			return handler_util.make_error_response(err)

		effect_resp['status'] = 'OK'
		return make_response(json.dumps(effect_resp))

class CreateRepaymentView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment',
			'is_line_of_credit',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		company_id = form['company_id']
		payment = form['payment']
		is_line_of_credit = form['is_line_of_credit']
		payment_id, err = repayment_util.create_repayment(
			company_id,
			payment,
			user_session.get_user_id(),
			current_app.session_maker,
			is_line_of_credit=is_line_of_credit,
		)

		if err:
			logging.error(f"Failed to create repayment for company '{company_id}'; err: '{err}'")
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'payment_id': payment_id
		}), 200)

class ScheduleRepaymentView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id',
			'amount',
			'payment_date',
			'items_covered',
			'is_line_of_credit',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from schedule repayment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['company_id']):
			return handler_util.make_error_response('Access Denied')

		company_id = form['company_id']
		payment_id = form['payment_id']
		is_line_of_credit = form['is_line_of_credit']
		payment_id, err = repayment_util.schedule_repayment(
			company_id,
			payment_id,
			cast(repayment_util.ScheduleRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker,
			is_line_of_credit=is_line_of_credit,
		)

		if err:
			logging.error(f"Failed to schedule repayment for company '{company_id}'; err: '{err}'")
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'payment_id': payment_id
		}), 200)

class SettleRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id',
			'amount',
			'deposit_date',
			'settlement_date',
			'items_covered',
			'transaction_inputs',
			'amount_as_credit_to_user',
			'is_line_of_credit',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		is_line_of_credit = form['is_line_of_credit']
		transaction_ids, err = repayment_util.settle_repayment(
			cast(repayment_util.SettleRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker,
			is_line_of_credit=is_line_of_credit,
		)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/calculate_effect_of_payment', view_func=CalculateRepaymentEffectView.as_view(name='calculate_effect_of_repayment_view'))

handler.add_url_rule(
	'/create_repayment', view_func=CreateRepaymentView.as_view(name='create_payment_view'))

handler.add_url_rule(
	'/schedule_repayment', view_func=ScheduleRepaymentView.as_view(name='schedule_payment_view'))

handler.add_url_rule(
	'/settle_repayment', view_func=SettleRepaymentView.as_view(name='settle_repayment_view'))
