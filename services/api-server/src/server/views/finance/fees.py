import datetime
import json
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import (payment_util, repayment_util,
                                      repayment_util_fees, fees_due_util)
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
			'deposit_date',
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
				deposit_date=date_util.load_date_str(form['deposit_date']),
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
			payment_input = form['payment']
			payment_method = payment_input['method']
			requested_payment_date = payment_input['requested_payment_date']
			payment_date = requested_payment_date if payment_method != db_constants.PaymentMethodEnum.REVERSE_DRAFT_ACH else None

			payment_input['payment_method'] = payment_method
			payment_input['payment_date'] = payment_date

			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment(
				company_id=form['company_id'],
				payment_input=payment_input,
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

class ScheduleAccountLevelFeeRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.FINANCE_SCHEDULE_ACCOUNT_LEVEL_FEE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id',
			'amount',
			'payment_date'
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
		is_line_of_credit = False # Not used by method.
		payment_id, err = repayment_util.schedule_repayment(
			company_id,
			payment_id,
			cast(repayment_util.ScheduleRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker,
			is_line_of_credit=is_line_of_credit,
		)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'payment_id': payment_id,
			'status': 'OK'
		}), 200)

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
				should_settle_payment=True,
				user_id=user_session.get_user_id(),
				session=session
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

class GetAllMinimumInterestFeesDueView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'date'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from get all monthly minimum fees due'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			resp, err = fees_due_util.get_all_minimum_interest_fees_due(
				form.get('date'),
				session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'data': resp
		}), 200)


class SubmitMinimumInterestFeesDueView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'date',
			'monthly_due_resp'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from get all monthly minimum fees due'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			success, err = fees_due_util.create_minimum_due_fee_for_customers(
				form['date'],
				form['monthly_due_resp'],
				user_session.get_user_id(),
				session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class GetAllMonthEndPaymentsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'date'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from get all monthly LOC fees due'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			resp, err = fees_due_util.get_all_month_end_payments(
				form.get('date'),
				session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'data': resp
		}), 200)


class SubmitMonthEndPaymentsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'date',
			'monthly_due_resp'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from get all monthly LOC fees due'.format(key))

		user_session = auth_util.UserSession.from_session()

		with models.session_scope(current_app.session_maker) as session:
			success, err = fees_due_util.create_month_end_payments_for_customers(
				form['date'],
				form['monthly_due_resp'],
				user_session.get_user_id(),
				session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

handler.add_url_rule(
	'/settle_account_level_fee_repayment_with_account_credit', view_func=SettleAccountLevelFeeRepaymentWithAccountCreditView.as_view(name='settle_account_level_fee_repayment_with_account_credit_view'))

handler.add_url_rule(
	'/make_account_level_fee_repayment_with_account_credit', view_func=MakeAccountLevelFeeRepaymentWithAccountCreditView.as_view(name='make_account_level_fee_repayment_with_account_credit_view'))

handler.add_url_rule(
	'/schedule_account_level_fee_repayment', view_func=ScheduleAccountLevelFeeRepaymentView.as_view(name='schedule_account_level_fee_repayment_view'))

handler.add_url_rule(
	'/settle_account_level_fee_repayment', view_func=SettleAccountLevelFeeRepaymentView.as_view(name='settle_account_level_fee_repayment_view'))

handler.add_url_rule(
	'/make_account_level_fee_repayment', view_func=MakeAccountLevelFeeRepaymentView.as_view(name='make_account_level_fee_repayment_view'))

handler.add_url_rule(
	'/make_account_level_fee', view_func=MakeAccountLevelFeeView.as_view(name='make_account_level_fee_view'))

handler.add_url_rule(
	'/get_all_minimum_interest_fees_due', view_func=GetAllMinimumInterestFeesDueView.as_view(name='get_all_minimum_interest_fees_due_view'))

handler.add_url_rule(
	'/submit_minimum_interest_fees_due', view_func=SubmitMinimumInterestFeesDueView.as_view(name='submit_minimum_interest_fees_due_view'))

handler.add_url_rule(
	'/get_all_month_end_payments', view_func=GetAllMonthEndPaymentsView.as_view(name='get_all_month_end_payments_view'))

handler.add_url_rule(
	'/submit_month_end_payments', view_func=SubmitMonthEndPaymentsView.as_view(name='submit_month_end_payments_view'))
