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

handler = Blueprint('finance_fees', __name__)


class MakeAccountLevelFeeView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.FINANCE_MAKE_ACCOUNT_LEVEL_FEE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()

		required_keys = [
			'company_id',
			'subtype',
			'amount',
			'payment_date',
			'settlement_date',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from make account level fee request'.format(key))

		with models.session_scope(current_app.session_maker) as session:
			payment_util.create_and_add_account_level_fee(
				company_id=form['company_id'],
				subtype=form['subtype'],
				amount=form['amount'],
				originating_payment_id=None,
				created_by_user_id=user_session.get_user_id(),
				payment_date=date_util.load_date_str(form['payment_date']),
				effective_date=date_util.load_date_str(form['settlement_date']),
				session=session
			)

		resp = {
			'status': 'OK'
		}
		return make_response(json.dumps(resp), 200)


handler.add_url_rule(
	'/make_account_level_fee', view_func=MakeAccountLevelFeeView.as_view(name='make_account_level_fee_view'))
