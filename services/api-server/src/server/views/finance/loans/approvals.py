import datetime
import json
from typing import Any, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.enums.loan_type_enum import LoanTypeEnum
from bespoke.enums.request_status_enum import RequestStatusEnum
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from sqlalchemy.orm.session import Session

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

		loan_id = form['loan_id']

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id).first()
			)

			if not loan:
				return handler_util.make_error_response('Could not find loan for given Loan ID')

			company_id = loan.company_id
			# TODO(dlluncor):
			# loan.approved_at = datetime.datetime.now()

		return handler_util.make_error_response('Not implemented')


class SubmitForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			return handler_util.make_error_response('No data provided')

		loan_id = data['loan_id']

		if not loan_id:
			return handler_util.make_error_response('No Loan ID provided')

		loan_html = ''
		customer_name = ''

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id
				).first()
			)

			if not loan:
				return handler_util.make_error_response('Could not find loan for given Loan ID')

			if loan.loan_type != LoanTypeEnum.PurchaseOrder:
				return handler_util.make_error_response('Loan is not of type Purchase Order')

			if not loan.artifact_id:
				return handler_util.make_error_response('Purchase Order is required')

			if not loan.origination_date:
				return handler_util.make_error_response('Invalid origination date')

			if loan.amount is None or loan.amount <= 0:
				return handler_util.make_error_response('Invalid amount')

			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=loan.artifact_id
				).first()
			)
			customer_name = purchase_order.company.name

			# List of other Purchase Order Loans related to same Purchase Order.
			sibling_loans = cast(
				List[models.Loan],
				session.query(models.Loan)
				.filter(models.Loan.id != loan.id)
				.filter_by(artifact_id=loan.artifact_id)
			)

			proposed_loans_total_amount = 0.0
			for sibling_loan in sibling_loans:
				if sibling_loan.status in [RequestStatusEnum.ApprovalRequested, RequestStatusEnum.Approved]:
					proposed_loans_total_amount += float(
						sibling_loan.amount) if sibling_loan.amount else 0

			proposed_loans_total_amount += float(loan.amount)

			if proposed_loans_total_amount > float(purchase_order.amount):
				return handler_util.make_error_response('Too many loans for same Purchase Order')

			loan.status = RequestStatusEnum.ApprovalRequested
			loan.requested_at = date_util.now()

			loan_html = f"""<ul>
<li>Company: {customer_name} </li>
<li>Purchase order: {purchase_order.order_number}</li>
<li>Payment date: {loan.origination_date}</li>
<li>Amount: {loan.amount}</li>
			</ul>
			"""

			session.commit()

		template_name = sendgrid_util.TemplateNames.CUSTOMER_REQUESTS_LOAN
		template_data = {
			'customer_name': customer_name,
			'loan_html': loan_html
		}
		recipients = cfg.BANK_NOTIFY_EMAIL_ADDRESSES
		_, err = sendgrid_client.send(
			template_name, template_data, recipients)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Purchase Order Loan {} approval request responded to'.format(loan_id)
		}), 200)


handler.add_url_rule(
	'/approve_loan', view_func=ApproveLoanView.as_view(name='approve_loan_view'))

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitForApprovalView.as_view(
		name='submit_for_approval_view')
)
