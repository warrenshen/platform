import json
import datetime
import logging
import typing

from bespoke.db.models import session_scope
from bespoke.db import models, models_util
from bespoke.finance.loans import reports_util
from server.views.common import auth_util, handler_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sqlalchemy import func


handler = Blueprint('triggers', __name__)


class UpdateDirtyCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies_that_need_recompute(
			current_app.session_maker,
			datetime.date.today(),
			includes_future_transactions=True
		)
		if fatal_error:
			logging.error(f"Got fatal error while recomputing balances for companies that need it: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))



class UpdateAllCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_all_companies(
			current_app.session_maker,
			datetime.date.today(),
			includes_future_transactions=True
		)
		if fatal_error:
			logging.error(f"Got fatal error while recomputing balances for all companies: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))


class ExpireActiveEbbaApplications(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	# This function cannot be type checked because it uses "join" which is an
	# untyped function
	@handler_util.catch_bad_json_request
	@typing.no_type_check
	def post(self) -> Response:
		with session_scope(current_app.session_maker) as session:
			results = session.query(models.CompanySettings) \
				.filter(models.CompanySettings.active_ebba_application_id != None) \
				.join(models.EbbaApplication) \
				.filter(models.EbbaApplication.expires_at < func.now()) \
				.all()

			for company in results:
				logging.info(f"Expiring active borrowing base for '{company.company_id}'")
				company.active_ebba_application_id = None

		return make_response(json.dumps({
			"status": "OK",
			"errors": [],
		}))


class SetDirtyCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		data = json.loads(request.data)

		company_id = data.get('event', {}) \
			.get('data', {}) \
			.get('new', {}) \
			.get('company_id')

		if not company_id:
			return handler_util.make_error_response(
				"Failed to find company_id in request", status_code=500)

		with models.session_scope(current_app.session_maker) as session:
			_, err = models_util.set_needs_balance_recomputed(company_id, session)
			if err:
				return handler_util.make_error_response(
					"Failed setting company dirty", status_code=500)

		return make_response(json.dumps({
			"status": "OK"
		}))



handler.add_url_rule(
	'/update-dirty-customer-balances',
	view_func=UpdateDirtyCompanyBalancesView.as_view(name='update_dirty_customer_balances_view'))


handler.add_url_rule(
	'/update-all-customer-balances',
	view_func=UpdateAllCompanyBalancesView.as_view(name='update_all_customer_balances_view'))


handler.add_url_rule(
	"/expire-active-ebba-applications",
	view_func=ExpireActiveEbbaApplications.as_view(name='expire_active_ebba_applications'))

handler.add_url_rule(
	'/set_dirty_company_balances_view',
	view_func=SetDirtyCompanyBalancesView.as_view(name='set_dirty_company_balances_view'))
