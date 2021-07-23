import json
from typing import List, cast
from datetime import timedelta

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.loans import reports_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.views.common import auth_util, handler_util
from sqlalchemy.orm.session import Session

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

		# Update X number of days back from when the user indicated so
		cur_date = start_date - timedelta(days=reports_util.DAYS_TO_COMPUTE_BACK)
		all_descriptive_errors = []
		include_debug_info = form.get('include_debug_info')

		if include_debug_info and no_company_id_specified:
			return handler_util.make_error_response('Cannot provide debug information when running reports for all companies')

		loan_id_to_debug_info = None

		while cur_date <= report_date:
			company_id_to_update_dict, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies(
				session_maker,
				company_dicts,
				cur_date,
				update_days_back=0,
				include_debug_info=include_debug_info
			)

			if fatal_error:
				return handler_util.make_error_response(fatal_error)

			all_descriptive_errors.extend(descriptive_errors)
			cur_date = cur_date + timedelta(days=1)
			if include_debug_info:
				# When we get debug information, we only allow it for one customer
				# at a time.
				update_dict = list(company_id_to_update_dict.values())[0]
				loan_id_to_debug_info = update_dict['loan_id_to_debug_info'] 

		resp = {
			'status': 'OK',
			'errors': all_descriptive_errors,
			'data': {
				'loan_id_to_debug_info': loan_id_to_debug_info
			}
		}
		return make_response(json.dumps(resp), 200)


handler.add_url_rule(
	'/run_customer_balances', view_func=RunCustomerBalancesView.as_view(name='run_customer_balances_view'))
