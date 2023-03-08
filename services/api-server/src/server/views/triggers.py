"""
	triggers.py handles async tasks that happen outside of the webserver

	These tasks can take up to 5 minutes per task.
"""
import json
import logging
from flask import Blueprint, Response, current_app, make_response
from flask.views import MethodView

from bespoke import errors
from bespoke.date import date_util
from bespoke.db.models import session_scope
from bespoke.finance.loans import reports_util
from server.views.common import auth_util, handler_util
from server.views import shared_triggers

handler = Blueprint('triggers', __name__)

class UpdateDirtyCompanyBalancesView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.debug("Received request to update dirty company balances")

		today = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		dates_updated = None
		with session_scope(current_app.session_maker) as session:
			compute_requests = reports_util.list_financial_summaries_that_need_balances_recomputed(
				session, today, amount_to_fetch=5)
			if not compute_requests:
				return make_response(json.dumps({
					'status': 'OK',
					'errors': []
				}))

			dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
				session,
				compute_requests
			)
			if fatal_error:
				logging.error(f"Got FATAL error while recomputing balances for companies that need it: '{fatal_error}'")
				return handler_util.make_error_response(fatal_error)

			logging.info("Finished request to update {} dirty financial summaries".format(len(compute_requests)))

		with session_scope(current_app.session_maker) as session:
			for cur_date in dates_updated:
				fatal_error = reports_util.compute_and_update_bank_financial_summaries(session, cur_date)
				if fatal_error:
					raise errors.Error('FAILED to update bank financial summary on {}'.format(fatal_error))

			logging.info("Finished request to update bank financial summaries")

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))

shared_triggers.add_shared_handlers(handler)

handler.add_url_rule(
	'/update-dirty-customer-balances',
	view_func=UpdateDirtyCompanyBalancesView.as_view(name='update_dirty_customer_balances_view'))
