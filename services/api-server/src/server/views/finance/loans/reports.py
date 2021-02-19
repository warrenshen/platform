import datetime
import json
import logging
from typing import Any, List, cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.date import date_util
from bespoke.finance.reports import loan_balances
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
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

		if not form.get('company_id'):
			with session_scope(session_maker) as session:
				# Find customers to run reports for
				companies = cast(
					List[models.Company],
					session.query(models.Company).first())
				company_dicts = [company.as_dict() for company in companies]
		else:
			with session_scope(session_maker) as session:
				# Find the single customer to run reports for
				company = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == form['company_id']).first())
				if not company:
					return handler_util.make_error_response('No company found associated with this ID')
				company_dicts = [company.as_dict()]

		logging.info('There are {} companies for whom we are updating balances'.format(len(company_dicts)))

		errors = []

		# Update balances per customer
		for company_dict in company_dicts:
			company_name = company_dict['name']
			customer_balance = loan_balances.CustomerBalance(company_dict, session_maker)
			customer_update_dict, err = customer_balance.update(
				today=date_util.load_date_str(form['report_date']))
			if err:
				msg = 'Error updating customer balance for company "{}". Error: {}'.format(
					company_name, err
				)
				logging.error(msg)
				errors.append(msg)
				continue

			success, err = customer_balance.write(customer_update_dict)
			if err:
				msg = 'Error writing results to update customer balance. Error: {}'.format(err)
				logging.error(msg)
				errors.append(msg)
				continue

		resp = {
			'status': 'OK',
			'errors': errors
		}
		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/run_customer_balances', view_func=RunCustomerBalancesView.as_view(name='run_customer_balances_view'))
