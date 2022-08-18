import json
import logging
from typing import Any, cast
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView

from bespoke.db.models import session_scope
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views import async_jobs_util

handler = Blueprint('async_jobs', __name__)

class EnqueueJobView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		logging.info("Received async job request")

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')
		cfg = cast(Config, current_app.app_config)

		required_keys = [
			'job_name',
			'submitted_by_user_id',
			'is_high_priority',
			'job_payload',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		job_name = form['job_name']
		submitted_by_user_id = form['submitted_by_user_id'] if form['submitted_by_user_id'] is not None else cfg.BOT_USER_ID
		is_high_priority = form['is_high_priority']
		job_payload = form['job_payload']

		if job_name not in async_jobs_util.ASYNC_JOBS:
			return handler_util.make_error_response(f'{job_name} is invalid')

		with session_scope(current_app.session_maker) as session:
			_, err = async_jobs_util.add_job_to_queue(
				session = session,
				job_name = job_name,
				submitted_by_user_id = submitted_by_user_id,
				is_high_priority = is_high_priority,
				job_payload = job_payload,
			)
			if err:
				raise err

		logging.info(f"Enqueued async job request for {job_name}")

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

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

handler.add_url_rule(
	'/enqueue-job',
	view_func=EnqueueJobView.as_view(name='enqueue_job_view'))

handler.add_url_rule(
	'/delete-job',
	view_func=DeleteJobView.as_view(name='delete_job_view'))

handler.add_url_rule(
	'/change-job-priority',
	view_func=ChangeJobPriorityView.as_view(name='change_job_priority_view'))

handler.add_url_rule(
	'/retry-job',
	view_func=RetryJobView.as_view(name='retry_job_view'))
