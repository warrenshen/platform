import json
import logging
from typing import Any, cast
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView

from bespoke.async_jobs import async_jobs_util
from bespoke.db.models import session_scope
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('async_jobs', __name__)

class DeleteJobView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job deletion request")

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		user_session = auth_util.UserSession.from_session()
		
		required_keys = [
			'async_job_id',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		job_id = form['async_job_id']

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.delete_job(
				session = session,
				job_id = job_id
			)
			if err:
				raise err

		logging.info(f"Deleted async job with id {job_id}")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ChangeJobPriorityView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job priorities change request")

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		required_keys = [
			'async_job_ids',
			'priority',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in async job priorities change request')

		job_ids = form['async_job_ids']
		priority = form['priority']

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.change_job_priority(
				session = session,
				job_ids = job_ids,
				priority = priority,
			)
			if err:
				raise err

		logging.info(f"Changed async jobs priority {job_ids}")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class RetryJobView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job retry request")

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		required_keys = [
			'async_job_ids',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in async job retry request')

		job_ids = form['async_job_ids']

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.retry_job(
				session = session,
				job_ids = job_ids,
			)
			if err:
				raise err

		logging.info(f"Retried async jobs with {job_ids}")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class GenerateJobsView(MethodView):
	decorators = [auth_util.requires_async_header_or_bank_admin]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job generation request")

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		form = form['payload']

		required_keys = [
			'job_name',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in async generate job request')

		job_name = form['job_name']

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.generate_jobs(
				session = session,
				job_name = job_name,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


class OrchestrationHandlerView(MethodView):
	decorators = [auth_util.requires_async_header_or_bank_admin]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job kick off handler request")
		cfg = cast(Config, current_app.app_config)

		in_progress_job_ids, err = async_jobs_util.orchestration_handler(
			session_maker = current_app.session_maker,
			available_job_number = int(cfg.ASYNC_JOB_CAPACITY)
		)
		if err:
			raise err

		if len(in_progress_job_ids) != 0:
			logging.info(f"Started Jobs with ids: {in_progress_job_ids}")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class OrphanHandlerView(MethodView):
	decorators = [auth_util.requires_async_header_or_bank_admin]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received request to remove orphaned initialized jobs")
		cfg = cast(Config, current_app.app_config)

		in_progress_job_ids, err = async_jobs_util.remove_orphaned_initialized_jobs(
			session_maker = current_app.session_maker,
		)
		if err:
			raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ReportsMonthlyLoanSummaryNonLOCView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job report monthly loan summary for non-LOC")
		user_session = auth_util.UserSession.from_session()
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		variables = form.get("variables", None)
		is_test = variables.get("isTest", False) if variables else False
		test_email = variables.get("email", None) if variables else None
		as_of_date = variables.get("asOfDate", None) if variables else None
		if as_of_date is None:
			return handler_util.make_error_response('Please set the as of date for month end report generation.')
		companies = variables.get("companies", None) if variables else None
		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.reports_monthly_loan_summary_Non_LOC_generate(
				session=session,
				is_test=is_test,
				test_email=test_email,
				as_of_date=as_of_date,
				user_id=user_session.get_user_id(),
				companies=companies,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class ReportsMonthlyLoanSummaryLOCView(MethodView):
	decorators = [auth_util.bank_admin_required]
	
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job report monthly loan summary for LOC")
		user_session = auth_util.UserSession.from_session()
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		variables = form.get("variables", None)
		is_test = variables.get("isTest", False) if variables else False
		test_email = variables.get("email", None) if variables else None
		as_of_date = variables.get("asOfDate", None) if variables else None
		if as_of_date is None:
			return handler_util.make_error_response('Please set the as of date for month end report generation.')
		companies = variables.get("companies", None) if variables else None

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.reports_monthly_loan_summary_LOC_generate(
				session=session,
				is_test=is_test,
				test_email=test_email,
				as_of_date=as_of_date,
				user_id=user_session.get_user_id(),
				companies=companies,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class GenerateFinancialStatementAlertView(MethodView):
	decorators = [auth_util.bank_admin_required]
	
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job for financial statement alert")
		user_session = auth_util.UserSession.from_session()
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		
		variables = form.get("variables", None)
		is_test = variables.get("isTest", False) if variables else False
		test_email = variables.get("email", None) if variables else None
		companies = variables.get("companies", None) if variables else None

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.generate_manual_financial_reports_coming_due_alerts(
				session=session,
				is_test_run=is_test,
				test_email=test_email,
				companies=companies,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class DailyJobSummaryView(MethodView):
	decorators = [auth_util.requires_async_header_or_bank_admin]
	
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		
		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.create_job_summary(
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)


handler.add_url_rule(
	'/orchestration-handler',
	view_func=OrchestrationHandlerView.as_view(name='orchestration_handler_view'))

handler.add_url_rule(
	"/orphan-handler",
	view_func=OrphanHandlerView.as_view(name='orphan_handler_view'))

handler.add_url_rule(
	'/delete-job',
	view_func=DeleteJobView.as_view(name='delete_job_view'))

handler.add_url_rule(
	'/change-job-priority',
	view_func=ChangeJobPriorityView.as_view(name='change_job_priority_view'))

handler.add_url_rule(
	'/generate_jobs',
	view_func=GenerateJobsView.as_view(name='generate_jobs_view'))

handler.add_url_rule(
	'/retry-job',
	view_func=RetryJobView.as_view(name='retry_job_view'))

handler.add_url_rule(
	'/daily-job-summary',
	view_func=DailyJobSummaryView.as_view(name='daily_job_summary_view'))

handler.add_url_rule(
	"/generate_monthly_loans_summary_non_loc",
	view_func=ReportsMonthlyLoanSummaryNonLOCView.as_view(name='generate_monthly_loans_summary_non_loc'))

handler.add_url_rule(
	"/generate_monthly_loans_summary_loc",
	view_func=ReportsMonthlyLoanSummaryLOCView.as_view(name='generate_monthly_loans_summary_loc'))

handler.add_url_rule(
	"/generate_financial_statement_alert",
	view_func=GenerateFinancialStatementAlertView.as_view(name='generate_financial_statement_alert'))
