import datetime
import json
import logging
from typing import Any, Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.fetchers import per_customer_fetcher
from bespoke.finance.payments import payment_util, repayment_util
from bespoke.finance.types import per_customer_types
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_repayments', __name__)

@errors.return_error_tuple
def _send_customer_requested_repayment_emails(
	payment_id: str,
) -> Tuple[bool, errors.Error]:
	sendgrid_client = cast(
		sendgrid_util.Client,
		current_app.sendgrid_client,
	)

	with session_scope(current_app.session_maker) as session:
		payment = cast(
			models.Payment,
			session.query(models.Payment).get(payment_id))

		customer = cast(
			models.Company,
			session.query(models.Company).get(payment.company_id))

		template_data = {
			'customer_name': customer.get_display_name(),
			'payment_amount': number_util.to_dollar_format(float(payment.requested_amount)),
			'payment_method': payment.method,
			'requested_payment_date': date_util.date_to_str(payment.requested_payment_date),
		}
		_, err = sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_REPAYMENT,
			template_data=template_data,
			recipients=sendgrid_client.get_bank_notify_email_addresses(),
		)
		if err:
			raise err

	return True, None

@errors.return_error_tuple
def _send_bank_settled_repayment_emails(
	payment_id: str,
) -> Tuple[bool, errors.Error]:
	sendgrid_client = cast(
		sendgrid_util.Client,
		current_app.sendgrid_client,
	)

	with session_scope(current_app.session_maker) as session:
		payment = cast(
			models.Payment,
			session.query(models.Payment).get(payment_id))

		customer = cast(
			models.Company,
			session.query(models.Company).get(payment.company_id))

		template_data = {
			'customer_name': customer.get_display_name(),
			'payment_amount': number_util.to_dollar_format(float(payment.amount)),
			'payment_method': payment.method,
			'payment_deposit_date': date_util.date_to_str(payment.deposit_date),
			'payment_settlement_date': date_util.date_to_str(payment.settlement_date),
		}
		_, err = sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.BANK_SETTLED_REPAYMENT,
			template_data=template_data,
			recipients=sendgrid_client.get_bank_notify_email_addresses(),
		)
		if err:
			raise err

	return True, None

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
			'deposit_date',
			'settlement_date',
			'items_covered',
			'should_pay_principal_first',
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
		deposit_date = form['deposit_date']
		settlement_date = form['settlement_date']
		items_covered = form['items_covered']
		should_pay_principal_first = form.get('should_pay_principal_first')

		# NOTE: Fetching information is likely a slow task, so we probably want to
		# turn this into an async operation.
		effect_resp, err = repayment_util.calculate_repayment_effect(
			company_id,
			payment_option,
			amount,
			deposit_date,
			settlement_date,
			items_covered,
			should_pay_principal_first,
			current_app.session_maker,
		)
		if err:
			return handler_util.make_error_response(err)

		effect_resp['status'] = 'OK'
		return make_response(json.dumps(effect_resp))

class CreateRepaymentView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_CREATE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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
		
		with session_scope(current_app.session_maker) as session:
			payment_id, err = repayment_util.create_repayment(
				company_id,
				payment,
				user_session.get_user_id(),
				session=session,
				is_line_of_credit=is_line_of_credit,
			)
			if err:
				raise err

		if err:
			logging.error(f"Failed to create repayment for company '{company_id}'; err: '{err}'")
			return handler_util.make_error_response(err)

		_, err = _send_customer_requested_repayment_emails(payment_id)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'payment_id': payment_id,
		}), 200)

class ScheduleRepaymentView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_SCHEDULE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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

	@events.wrap(events.Actions.LOANS_SETTLE_REPAYMENT)
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
			'items_covered',
			'transaction_inputs',
			'is_line_of_credit',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from settle repayment request'.format(key))

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

		# _, err = _send_bank_settled_repayment_emails(payment_id)

		# if err:
		# 	return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ReverseRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_REVERSE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from reverse payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		val, err = repayment_util.reverse_repayment(
			cast(repayment_util.ReverseRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class UndoRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_UNDO_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'payment_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from undo payment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		val, err = repayment_util.undo_repayment(
			cast(repayment_util.UndoRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DeleteRepaymentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_DELETE_REPAYMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = cast(Dict, json.loads(request.data))
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'payment_id'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from delete repayment request'.format(key))

		user_session = auth_util.UserSession.from_session()

		val, err = repayment_util.delete_repayment(
			cast(repayment_util.DeleteRepaymentReqDict, form),
			user_session.get_user_id(),
			current_app.session_maker
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

handler.add_url_rule(
	'/reverse_repayment', view_func=ReverseRepaymentView.as_view(name='reverse_repayment_view'))

handler.add_url_rule(
	'/undo_repayment', view_func=UndoRepaymentView.as_view(name='undo_repayment_view'))

handler.add_url_rule(
	'/delete_repayment', view_func=DeleteRepaymentView.as_view(name='delete_repayment_view'))
