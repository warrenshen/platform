import datetime
import json
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_adjustments', __name__)

class MakeAdjustmentView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_MAKE_ADJUSTMENT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()

		required_keys = [
			'company_id',
			'loan_id',
			'to_principal',
			'to_interest',
			'to_fees',
			'deposit_date',
			'settlement_date',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from make adjustment request'.format(key))

		with models.session_scope(current_app.session_maker) as session:
			_, err = payment_util.create_and_add_adjustment(
				company_id=form['company_id'],
				loan_id=form['loan_id'],
				tx_amount_dict=payment_util.TransactionAmountDict(
					to_principal=form['to_principal'],
					to_interest=form['to_interest'],
					to_fees=form['to_fees']
				),
				created_by_user_id=user_session.get_user_id(),
				deposit_date=date_util.load_date_str(form['deposit_date']),
				effective_date=date_util.load_date_str(form['settlement_date']),
				session=session
			)
			if err:
				raise err


		resp = {
			'status': 'OK'
		}
		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/make_adjustment', view_func=MakeAdjustmentView.as_view(name='make_adjustment_view'))
