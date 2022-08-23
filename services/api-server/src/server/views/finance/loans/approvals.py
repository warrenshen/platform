import json
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_approvals', __name__)

@errors.return_error_tuple
def _send_bank_approved_loans_emails(
	loan_ids: List[str],
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client,
							current_app.sendgrid_client)

	customer_id_to_loans: Dict[str, List[models.Loan]] = {}
	with session_scope(current_app.session_maker) as session:
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

			customer_users = models_util.get_active_users(
				company_id=customer_id, 
				session=session,
				filter_contact_only=True
			)
			if not customer_users:
				raise errors.Error('There are no users configured for this customer')

			customer_identifier = customer.identifier
			loan_dicts = [{
				'identifier': f'{customer_identifier}{loan.identifier}',
				'amount': number_util.to_dollar_format(float(loan.amount)),
				'requested_payment_date': date_util.date_to_str(loan.requested_payment_date),
				'requested_date': date_util.human_readable_yearmonthday(loan.requested_at),
			} for loan in customer_loans]

			template_name = sendgrid_util.TemplateNames.BANK_APPROVED_LOANS
			template_data = {
				'customer_name': customer.get_display_name(),
				'loans': loan_dicts,
			}

			customer_emails = [user.email for user in customer_users]
			recipients = customer_emails
			_, err = sendgrid_client.send(
				template_name, 
				template_data, 
				recipients,
				filter_out_contact_only=True
			)
			if err:
				raise err

	return True, None

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

		loan_ids = form['loan_ids']
		_, err = _send_bank_approved_loans_emails(loan_ids)

		if err:
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

		customer_name = ''
		loan_identifier = ''
		loan_amount = ''
		loan_requested_payment_date = ''
		loan_requested_date = ''

		with session_scope(current_app.session_maker) as session:
			loan = cast(
				models.Loan,
				session.query(models.Loan).filter_by(
					id=loan_id).first()
			)

			if not loan:
				raise errors.Error('Could not find loan for given Loan ID')

			customer_id = loan.company_id
			# When a loan gets rejected, we clear out
			# any state about whether it was approved.
			loan.rejection_note = rejection_note
			loan.rejected_at = date_util.now()
			loan.rejected_by_user_id = user_session.get_user_id()
			loan.approved_at = None
			loan.approved_by_user_id = None
			# Reset loan approval status.
			loan.status = models_util.compute_loan_approval_status(loan)

			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			loan_identifier = f'{customer.identifier}{loan.identifier}'
			loan_amount = number_util.to_dollar_format(float(loan.amount))
			loan_requested_payment_date = date_util.date_to_str(loan.requested_payment_date)
			loan_requested_date = date_util.human_readable_yearmonthday(loan.requested_at)

			customer_users = models_util.get_active_users(company_id=customer_id, session=session)
			customer_emails = [user.email for user in customer_users]

			template_name = sendgrid_util.TemplateNames.BANK_REJECTED_LOAN
			template_data = {
				'customer_name': customer.get_display_name(),
				'loan_identifier': loan_identifier,
				'loan_amount': loan_amount,
				'loan_requested_payment_date': loan_requested_payment_date,
				'loan_requested_date': loan_requested_date,
				'rejection_note': rejection_note,
			}

			cfg = cast(Config, current_app.app_config)
			sendgrid_client = cast(sendgrid_util.Client,
								current_app.sendgrid_client)

			recipients = customer_emails
			_, err = sendgrid_client.send(
				template_name, 
				template_data, 
				recipients,
				filter_out_contact_only=True,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class SubmitForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['amount', 'artifact_id', 'company_id', 'loan_id', 'loan_type', 'requested_payment_date']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to saving loan')

		amount = float(form['amount'])
		artifact_id = form['artifact_id']
		company_id = form['company_id']
		loan_id = form['loan_id']
		loan_type = form['loan_type']
		requested_payment_date = date_util.load_date_str(form['requested_payment_date'])
		requested_by_user_id = user_session.get_user_id()

		with session_scope(current_app.session_maker) as session:
			loan_id, err = approval_util.save_loan(
				session,
				amount,
				artifact_id,
				company_id,
				loan_id,
				loan_type,
				requested_payment_date,
				requested_by_user_id,
			)
			if err:
				raise err

			resp, err = approval_util.submit_for_approval(
				session, 
				loan_id, 
				triggered_by_autofinancing=False,
				requested_by_user_id=requested_by_user_id,
			)
			if err:
				raise err

			success, err = approval_util.send_loan_approval_requested_email(
				sendgrid_client, resp)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Inventory Loan {} approval request responded to'.format(loan_id)
		}), 200)

# VERY TEMPORARY - NOTE(JR): I was trying to get a bug fix out for the non-LoC
# loan flow. That lead to refactoring that flow to get off of graphql mutations.
# However, I did not want to block the bug fix going out in a deploy while I
# worked on refactoring the LoC flow. As such, this is a copy of the endpoint as it was
class SubmitLoCForApprovalView(MethodView):
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_SUBMIT_FOR_APPROVAL)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		data = json.loads(request.data)
		if not data:
			return handler_util.make_error_response('No data provided')

		loan_id = data['loan_id']
		requested_by_user_id = user_session.get_user_id()

		if not loan_id:
			return handler_util.make_error_response('No Loan ID provided')

		with session_scope(current_app.session_maker) as session:
			resp, err = approval_util.submit_for_approval(
				session, 
				loan_id, 
				requested_by_user_id=requested_by_user_id, 
				triggered_by_autofinancing=False)
			if err:
				raise err

			success, err = approval_util.send_loan_approval_requested_email(
				sendgrid_client, resp)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Inventory Loan {} approval request responded to'.format(loan_id)
		}), 200)

class SaveLoanView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		cfg = cast(Config, current_app.app_config)
		user_session = auth_util.UserSession.from_session()
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['amount', 'artifact_id', 'company_id', 'loan_id', 'loan_type', 'requested_payment_date']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to saving loan')

		amount = float(form['amount'])
		artifact_id = form['artifact_id']
		company_id = form['company_id']
		loan_id = form['loan_id']
		loan_type = form['loan_type']
		requested_payment_date = date_util.load_date_str(form['requested_payment_date'])
		requested_by_user_id = user_session.get_user_id()
		with session_scope(current_app.session_maker) as session:
			loan_id, err = approval_util.save_loan(
				session,
				amount,
				artifact_id,
				company_id,
				loan_id,
				loan_type,
				requested_payment_date,
				requested_by_user_id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Successfully saved loan draft with id {}'.format(loan_id)
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

# TEMPORARY - to be removed (or edited) during the effort
# to refactor off of graphql mutations for submitting LoC loans
handler.add_url_rule(
	'/submit_loc_for_approval',
	view_func=SubmitLoCForApprovalView.as_view(
		name='submit_loc_for_approval_view')
)

handler.add_url_rule(
	'/save_loan', view_func=SaveLoanView.as_view(name='save_loan_view'))
