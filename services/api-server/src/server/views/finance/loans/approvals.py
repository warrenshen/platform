import datetime
import json
from typing import Any, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import (AllLoanTypes, LoanTypeEnum,
                                     RequestStatusEnum)
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.loans import approval_util
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
		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id).first()
			)

			if not loan:
				return handler_util.make_error_response('Could not find loan for given Loan ID')

			company_id = loan.company_id
			# When a loan gets approved, you also have to clear out the rejected at
			# status.
			loan.status = db_constants.LoanStatusEnum.APPROVED
			loan.approved_at = date_util.now()
			loan.approved_by_user_id = user_session.get_user_id()
			loan.rejected_at = None
			loan.rejected_by_user_id = None

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ApproveLoansView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loan_ids']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		user_session = auth_util.UserSession.from_session()

		resp, err = approval_util.approve_loans(
			req=form,
			bank_admin_user_id=user_session.get_user_id(),
			session_maker=current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)

class RejectLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['loan_id', 'rejection_note']
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle payment request'.format(key))

		loan_id = form['loan_id']
		rejection_note = form['rejection_note']
		user_session = auth_util.UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id).first()
			)

			if not loan:
				return handler_util.make_error_response('Could not find loan for given Loan ID')

			company_id = loan.company_id
			# When a loan gets rejected, you also have to clear out any state about
			# whether it was approved.
			loan.status = db_constants.LoanStatusEnum.REJECTED
			loan.rejection_note = rejection_note
			loan.rejected_at = date_util.now()
			loan.rejected_by_user_id = user_session.get_user_id()
			loan.approved_at = None
			loan.approved_by_user_id = None

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class SubmitForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		# TODO(dlluncor): The value a customer sets as "origination_date" is actually
		# the requested_origination_date

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

			if loan.loan_type not in AllLoanTypes:
				return handler_util.make_error_response('Loan type is not valid')

			if not loan.artifact_id:
				return handler_util.make_error_response('Artifact is required')

			if not loan.origination_date:
				return handler_util.make_error_response('Invalid origination date')

			if loan.amount is None or loan.amount <= 0:
				return handler_util.make_error_response('Invalid amount')

			if loan.loan_type == LoanTypeEnum.PurchaseOrder:
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
					if sibling_loan.status in [RequestStatusEnum.APPROVAL_REQUESTED, RequestStatusEnum.APPROVED]:
						proposed_loans_total_amount += float(
							sibling_loan.amount) if sibling_loan.amount else 0

				proposed_loans_total_amount += float(loan.amount)

				if proposed_loans_total_amount > float(purchase_order.amount):
					return handler_util.make_error_response('Too many loans for same Purchase Order')

				loan_html = f"""<ul>
<li>Loan type: Inventory Financing</li>
<li>Company: {customer_name}</li>
<li>Purchase order: {purchase_order.order_number}</li>
<li>Payment date: {loan.origination_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
				"""

			elif loan.loan_type == LoanTypeEnum.LineOfCredit:
				line_of_credit = cast(
					models.LineOfCredit,
					session.query(models.LineOfCredit).filter_by(
						id=loan.artifact_id
					).first()
				)
				customer_name = line_of_credit.company.name
				receipient_vendor_name = line_of_credit.recipient_vendor.name if line_of_credit.is_credit_for_vendor else "N/A"

				loan_html = f"""<ul>
<li>Loan type: Line of Credit</li>
<li>Company: {customer_name}</li>
<li>Is credit for vendor?: {"Yes" if line_of_credit.is_credit_for_vendor else "No"} </li>
<li>Vendor (if appropriate): {receipient_vendor_name}</li>
<li>Payment date: {loan.origination_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
				"""


			loan.status = RequestStatusEnum.APPROVAL_REQUESTED
			loan.requested_at = date_util.now()

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
			'msg': 'Inventory Loan {} approval request responded to'.format(loan_id)
		}), 200)


handler.add_url_rule(
	'/approve_loan', view_func=ApproveLoanView.as_view(name='approve_loan_view'))

handler.add_url_rule(
	'/approve_loans', view_func=ApproveLoansView.as_view(name='approve_loans_view'))

handler.add_url_rule(
	'/reject_loan', view_func=RejectLoanView.as_view(name='reject_loan_view'))

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitForApprovalView.as_view(
		name='submit_for_approval_view')
)
