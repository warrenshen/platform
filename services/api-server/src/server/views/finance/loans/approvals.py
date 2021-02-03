import datetime
import json

from mypy_extensions import TypedDict
from flask import request, make_response, current_app
from flask import Response, Blueprint
from flask.views import MethodView
from typing import cast, Any

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from sqlalchemy.orm.session import Session
from server.views.common import handler_util
from server.views.common import auth_util

handler = Blueprint('finance_loans_approvals', __name__)

class ApproveLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loan_id']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle payment request'.format(key))

		purchase_order_loan_id = form['loan_id']

		with session_scope(current_app.session_maker) as session:
			purchase_order_loan = cast(
				models.PurchaseOrderLoan,
				session.query(models.PurchaseOrderLoan).filter_by(
					id=purchase_order_loan_id).first()
			)
			loan = purchase_order_loan.loan
			company_id = loan.company_id
			# TODO(dlluncor):
			# purchase_order_loan.loan.approved_at = datetime.datetime.now()

		return handler_util.make_error_response('Not implemented')


handler.add_url_rule(
	'/approve_loan', view_func=ApproveLoanView.as_view(name='approve_loan_view'))