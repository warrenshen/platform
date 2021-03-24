import datetime
import json
from typing import Any, Dict, List, cast

from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_approvals', __name__)

class ApproveLoansView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_APPROVE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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

		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)

		customer_id_to_loans: Dict[str, List[models.Loan]] = {}
		with session_scope(current_app.session_maker) as session:
			loan_ids = form['loan_ids']
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())

			# Partition loans by customer_id.
			for loan in loans:
				customer_id = loan.company_id
				if customer_id not in customer_id_to_loans:
					customer_id_to_loans[customer_id] = []
				customer_id_to_loans[customer_id].append(loan)

			# For each customer_id, send an email to customer.
			for customer_id in customer_id_to_loans:
				customer_loans = customer_id_to_loans[customer_id]

				customer = cast(
					models.Company,
					session.query(models.Company).filter(
						models.Company.id == customer_id
					).first())

				customer_users = cast(
					List[models.User],
					session.query(models.User).filter_by(
						company_id=customer_id
					).all())

				if not customer_users:
					return handler_util.make_error_response('There are no users configured for this customer')

				customer_name = customer.name
				customer_identifier = customer.identifier
				loan_dicts = [{
					'identifier': f'{customer_identifier}{loan.identifier}',
					'amount': number_util.to_dollar_format(float(loan.amount)),
					'requested_payment_date': date_util.date_to_str(loan.requested_payment_date),
					'requested_date': date_util.human_readable_yearmonthday(loan.requested_at),
				} for loan in customer_loans]
				template_name = sendgrid_util.TemplateNames.BANK_APPROVED_LOANS
				template_data = {
					'customer_name': customer_name,
					'loans': loan_dicts,
				}

				customer_emails = [user.email for user in customer_users]
				recipients = customer_emails
				_, err = sendgrid_client.send(
					template_name, template_data, recipients)
				if err:
					print(err)
					return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)

class RejectLoanView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_REJECT)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
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

	@events.wrap(events.Actions.LOANS_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			return handler_util.make_error_response('No data provided')

		loan_id = data['loan_id']

		if not loan_id:
			return handler_util.make_error_response('No Loan ID provided')

		resp, err = approval_util.submit_for_approval(loan_id, current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		template_name = sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_LOAN
		template_data = {
			'customer_name': resp['customer_name'],
			'loan_html': resp['loan_html']
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
	'/approve_loans', view_func=ApproveLoansView.as_view(name='approve_loans_view'))

handler.add_url_rule(
	'/reject_loan', view_func=RejectLoanView.as_view(name='reject_loan_view'))

handler.add_url_rule(
	'/submit_for_approval',
	view_func=SubmitForApprovalView.as_view(
		name='submit_for_approval_view')
)
