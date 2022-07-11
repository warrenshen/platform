import datetime
import json
from typing import Any, cast, Dict, List

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models, queries
from bespoke.db.models import session_scope
from bespoke.finance.loans import reports_util
from bespoke.finance.reports import loan_balances
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_reports', __name__)

class RunCustomerBalancesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		session_maker = current_app.session_maker
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['report_date']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from run customer balances request'.format(key))

		company_dicts = []

		no_company_id_specified = not form.get('company_id')

		if no_company_id_specified:
			company_dicts = reports_util.list_all_companies(session_maker)
		else:
			with session_scope(session_maker) as session:
				# Find the single customer to run reports for
				company = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == form['company_id']).first())
				if not company:
					raise errors.Error('No company found associated with this ID')
				company_dicts = [company.as_dict()]

		report_date = date_util.load_date_str(form['report_date'])
		start_date = report_date

		if form.get('start_date'):
			start_date = date_util.load_date_str(form['start_date'])

		if start_date > report_date:
			return handler_util.make_error_response('Start date must be the same day or before the report_date')

		include_debug_info = form.get('include_debug_info')

		if include_debug_info and no_company_id_specified:
			return handler_util.make_error_response('Cannot provide debug information when running reports for all companies')

		if include_debug_info:
			# We only run customer balances for 1 customer and 1 date when fetching debug information
			loan_id_to_debug_info = None
			customer_balance = loan_balances.CustomerBalance(company_dicts[0], session_maker)
			day_to_customer_update_dict, err = customer_balance.update(
				start_date_for_storing_updates=report_date,
				today=report_date,
				include_debug_info=True,
				is_past_date_default_val=False
			)

			today = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

			customer_update_dict = day_to_customer_update_dict[report_date]
			success, err = customer_balance.write(customer_update_dict, report_date == today)

			if err:
				return handler_util.make_error_response(err)

			# When we get debug information, we only allow it for one customer
			# at a time.
			update_dict = day_to_customer_update_dict[report_date]
			loan_id_to_debug_info = update_dict['loan_id_to_debug_info'] 

			resp = {
				'status': 'OK',
				'errors': [],
				'data': {
					'loan_id_to_debug_info': loan_id_to_debug_info
				}
			}
			return make_response(json.dumps(resp), 200)
		else:
			# Trigger an async job when there's no debug info requested.
			company_ids = [company_dict['id'] for company_dict in company_dicts]
			cur_date = report_date
			date_range_tuples = reports_util.date_ranges_for_needs_balance_recomputed(start_date, report_date)

			for i in range(len(date_range_tuples)):
				cur_date, days_to_compute_back = date_range_tuples[i]
				with session_scope(current_app.session_maker) as session:
					reports_util.set_needs_balance_recomputed(
						company_ids,
						cur_date, 
						create_if_missing=True, 
						days_to_compute_back=days_to_compute_back, 
						session=session)

			return make_response({
				'status': 'OK',
				'data': {
					'msg': 'Sent request to server for balances to be recomputed in the background'
				}
			}, 200)

class RunLoanPredictionsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		session_maker = current_app.session_maker
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['company_id', 'prediction_date']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from run loan predictions request'.format(key))

		company_id = form['company_id']
		prediction_end_date = date_util.load_date_str(form['prediction_date'])
		# The days + 1 here is because the financial summaries query will already have results for today
		prediction_start_date = date_util.now_as_date() + datetime.timedelta(days = 1)

		with models.session_scope(current_app.session_maker) as session:
			company, err = queries.get_company_by_id(
				session,
				company_id,
			)
			if err:
				raise err

			customer_balance = loan_balances.CustomerBalance(company.as_dict(), session_maker)
			day_to_customer_update_dict, err = customer_balance.update(
				start_date_for_storing_updates = prediction_start_date,
				today = prediction_end_date,
				include_debug_info = True,
				is_past_date_default_val = False,
			)

			# Since we're passing this to the front end, we can't use datetime.date as keys
			# This step converts those keys to a date string and puts the data in a fresh dict
			# We also filter down the information passed back to the front end to just what we need
			loan_prediction_by_date: List[ Dict[str, Any] ] = []
			for update_date in day_to_customer_update_dict:
				update_date_string = date_util.date_to_db_str(update_date)
				loan_updates = day_to_customer_update_dict[update_date]['loan_updates']
				summary_update = day_to_customer_update_dict[update_date]['summary_update']
				
				loan_updates_with_string_keys: List[ Dict[str, Any] ] = []
				for loan_update in loan_updates:
					# We use the front end naming convention for keys here
					# since this is immediately passed to a useState variable,
					# which saves us a mapping step between snake and camel cases
					filtered_loan_update = {
						'dailyInterestRate': summary_update['daily_interest_rate'],
						'interestAccruedToday': loan_update['interest_accrued_today'],
						'lateFeesAccruedToday': loan_update['fees_accrued_today'],
						'loanId': loan_update['loan_id'],
						'outstandingInterest': loan_update['outstanding_interest'],
						'outstandingFees': loan_update['outstanding_fees'],
						'outstandingPrincipal': loan_update['outstanding_principal'],
					}
					loan_updates_with_string_keys.append(filtered_loan_update)

				daily_loan_predictions: Dict[str, Any] = {}
				daily_loan_predictions["date"] = update_date_string
				daily_loan_predictions["predictions"] = loan_updates_with_string_keys

				loan_prediction_by_date.append(daily_loan_predictions)

			resp = {
				'status': 'OK',
				'errors': [],
				'data': {
					'loan_prediction_by_date': sorted(
						loan_prediction_by_date, 
						key = lambda x: x['date'], 
						reverse = True
					)
				}
			}
			return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/run_customer_balances', view_func=RunCustomerBalancesView.as_view(name='run_customer_balances_view'))

handler.add_url_rule(
	'/run_loan_predictions', view_func=RunLoanPredictionsView.as_view(name='run_loan_predictions_view'))
