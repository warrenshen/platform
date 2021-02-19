import datetime
import decimal
import json
import logging
from typing import Any, List, Callable, cast

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
		report_date = date_util.load_date_str(form['report_date'])

		# Update balances per customer
		for company_dict in company_dicts:
			company_name = company_dict['name']
			customer_balance = loan_balances.CustomerBalance(company_dict, session_maker)
			customer_update_dict, err = customer_balance.update(
				today=report_date)
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

		# TODO(dlluncor): Remove this logic here, it should really happen somewhere else
		# Update the overall financial summary for the bank
		with session_scope(session_maker) as session:
			# Find the single customer to run reports for
			financial_summaries = cast(
				List[models.FinancialSummary],
				session.query(models.FinancialSummary).all())
			if not financial_summaries:
				return handler_util.make_error_response('No financial summaries registered in the DB')
			
			company_ids = [str(summary.company_id) for summary in financial_summaries]

			companies = cast(
				List[models.Company],
				session.query(models.Company).filter(
					models.Company.id.in_(company_ids)
				).all())

			if not companies:
				return handler_util.make_error_response('No companies registered in the DB')

			if len(companies) != len(company_ids):
				return handler_util.make_error_response('Not all companies found that have a financial summary')				

			contract_ids = [str(company.contract_id) for company in companies]

			contracts = cast(
				List[models.Contract],
				session.query(models.Contract).filter(
					models.Contract.id.in_(contract_ids)
				).all())

			if not contracts:
				return handler_util.make_error_response('No contracts registered in the DB')

			if len(contracts) != len(contract_ids):
				return handler_util.make_error_response('Not all contracts found that have a financial summary')				

			company_id_to_product_type = {}
			for contract in contracts:
				company_id_to_product_type[str(contract.company_id)] = contract.product_type

			product_type_to_bank_summary = {}

			for summary in financial_summaries:
				product_type = company_id_to_product_type[str(summary.company_id)]
				if product_type not in product_type_to_bank_summary:
					product_type_to_bank_summary[product_type] = models.BankFinancialSummary(
						date=report_date,
						product_type=product_type,
						total_limit=decimal.Decimal(0.0),
						total_outstanding_principal=decimal.Decimal(0.0),
						total_outstanding_interest=decimal.Decimal(0.0),
						total_outstanding_fees=decimal.Decimal(0.0),
						total_principal_in_requested_state=decimal.Decimal(0.0),
						available_limit=decimal.Decimal(0.0)
					)

				cur_bank_summary = product_type_to_bank_summary[product_type]
				cur_bank_summary.total_limit += decimal.Decimal(summary.total_limit)
				cur_bank_summary.total_outstanding_principal += decimal.Decimal(summary.total_outstanding_principal)
				cur_bank_summary.total_outstanding_interest += decimal.Decimal(summary.total_outstanding_interest)
				cur_bank_summary.total_outstanding_fees += decimal.Decimal(summary.total_outstanding_fees)
				cur_bank_summary.total_principal_in_requested_state += decimal.Decimal(summary.total_principal_in_requested_state)
				cur_bank_summary.available_limit += decimal.Decimal(summary.available_limit)

			# Delete the old bank summaries and replace them with the new ones
			bank_summaries = cast(
				List[models.BankFinancialSummary],
				session.query(models.BankFinancialSummary).filter(
					models.BankFinancialSummary.date == report_date.isoformat()
				).all()
			)
			if bank_summaries:
				for bank_summary in bank_summaries:
					cast(Callable, session.delete)(bank_summary)

			for new_bank_summary in product_type_to_bank_summary.values():
				session.add(new_bank_summary)

		resp = {
			'status': 'OK',
			'errors': errors
		}
		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/run_customer_balances', view_func=RunCustomerBalancesView.as_view(name='run_customer_balances_view'))
