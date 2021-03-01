import json
import datetime
import logging

from bespoke.db.models import session_scope
from bespoke.db import models
from bespoke.finance.loans import reports_util
from server.views.common import auth_util, handler_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView


handler = Blueprint('triggers', __name__)


class UpdateDirtyCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies_that_need_recompute(
			current_app.session_maker,
			datetime.date.today(),
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
		)
		if fatal_error:
			logging.error(f"Got fatal error while recomputing balances for all companies: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))


handler.add_url_rule(
	'/update-dirty-customer-balances', view_func=UpdateDirtyCompanyBalancesView.as_view(name='update_dirty_customer_balances_view'))


handler.add_url_rule(
	'/update-all-customer-balances', view_func=UpdateAllCompanyBalancesView.as_view(name='update_all_customer_balances_view'))
