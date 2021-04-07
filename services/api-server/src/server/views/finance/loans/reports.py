import json
from typing import List, cast

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

		if not form.get('company_id'):
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

		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies(
			session_maker,
			company_dicts,
			report_date
		)

		if fatal_error:
			return handler_util.make_error_response(fatal_error)

		resp = {
			'status': 'OK',
			'errors': descriptive_errors
		}
		return make_response(json.dumps(resp), 200)


handler.add_url_rule(
	'/run_customer_balances', view_func=RunCustomerBalancesView.as_view(name='run_customer_balances_view'))
