import json
import logging
import time
import datetime
import os
import typing
from datetime import timedelta
from typing import Any, Callable, Iterable, Dict, List, Tuple, cast
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from sqlalchemy import func

from bespoke import errors
from bespoke.async_util import orchestrator
from bespoke.async_util.pipeline_constants import PipelineName, PipelineState
from bespoke.audit import events
from bespoke.companies import licenses_util
from bespoke.companies.licenses_util import LicenseModificationDict
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.loans import reports_util
from bespoke.metrc import metrc_util
from bespoke.metrc.common import metrc_summary_util
from server.config import Config
from server.views.common import auth_util, handler_util
from bespoke.config.config_util import (
	is_prod_env, is_development_env, is_test_env)

handler = Blueprint('triggers', __name__)

def _prepare_notification_data(
	trigger_name: str,
	fatal_error: errors.Error,
	descriptive_errors: typing.List[str],
	additional_info: str) -> sendgrid_util.NotificationTemplateData:

	data = sendgrid_util.NotificationTemplateData(
		trigger_name=trigger_name,
		domain=current_app.app_config.BESPOKE_DOMAIN,
		outcome='FAILED' if fatal_error else 'SUCCEEDED',
		additional_info=additional_info
	)

	if fatal_error:
		data['fatal_error'] = str(fatal_error)

	if descriptive_errors and len(descriptive_errors):
		data['descriptive_errors'] = descriptive_errors

	return data


def _send_ops_notification(data: sendgrid_util.NotificationTemplateData) -> errors.Error:
	if current_app.app_config.DONT_SEND_OPS_EMAILS:
		return None

	_, err = current_app.sendgrid_client.send(
		template_name=sendgrid_util.TemplateNames.OPS_TRIGGER_NOTIFICATION,
		template_data=data,
		recipients=current_app.app_config.OPS_EMAIL_ADDRESSES,
	)
	if err:
		logging.error(f"Failed sending trigger notification email. Error: '{err}'")
		return err
	return None

@errors.return_error_tuple
def _set_needs_balance_recomputed(
	company_ids: List[str], cur_date: datetime.date, create_if_missing: bool, 
	days_to_compute_back: int, session_maker: Callable) -> Tuple[bool, errors.Error]:

	if not company_ids:
		raise errors.Error("Failed to find company_ids in set_needs_balance_recomputed")

	with models.session_scope(session_maker) as session:
		_, err = reports_util.set_needs_balance_recomputed(
			company_ids, cur_date, create_if_missing, 
			days_to_compute_back=days_to_compute_back,
			session=session)
		if err:
			logging.error(f"FAILED marking that company.needs_balance_recomputed for companies: '{company_ids}'")
			raise errors.Error("Failed setting {} companies as dirty".format(len(company_ids)))

		return True, None

def _download_metrc_data_for_one_customer(cur_date: datetime.date, company_id: str, current_app: Any) -> Tuple[metrc_util.DownloadDataRespDict, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	resp, fatal_err = metrc_util.download_data_for_one_customer(
		auth_provider=cfg.get_metrc_auth_provider(),
		security_cfg=cfg.get_security_config(),
		worker_cfg=cfg.get_metrc_worker_config(),
		sendgrid_client=sendgrid_client,
		cur_date=cur_date,
		company_id=company_id,
		session_maker=current_app.session_maker
	)
	return resp, fatal_err

def _handle_errs_after_metrc_downloads(
	before: float, 
	trigger_name: str,
	all_errs: List[errors.Error],
	company_ids: List[str],
	failed_company_ids: List[str]
) -> Tuple[bool, errors.Error]:
	
	if not company_ids:
		# If we didnt run any downloads for any companies, no need to
		# send any email or error messages
		return True, None

	descriptive_errors = ['{}'.format(err) for err in all_errs]
	after = time.time()
	additional_info = 'Took {:.2f} seconds'.format(after - before)
	final_fatal_err = errors.Error('All companies failed') if len(failed_company_ids) == len(company_ids) else None

	err = _send_ops_notification(_prepare_notification_data(
		trigger_name,
		final_fatal_err,
		descriptive_errors,
		additional_info
	))
	if err:
		return None, errors.Error(f"Failed sending download_metrc_data trigger notification. Error: '{err}'")

	return True, None

class UpdateDirtyCompanyBalancesView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.debug("Received request to update dirty company balances")

		today = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		compute_requests = reports_util.list_financial_summaries_that_need_balances_recomputed(
			current_app.session_maker, today, amount_to_fetch=5)
		if not compute_requests:
			return make_response(json.dumps({
				'status': 'OK',
				'errors': []
			}))

		dates_updated, descriptive_errors, fatal_error = reports_util.run_customer_balances_for_financial_summaries_that_need_recompute(
			current_app.session_maker,
			compute_requests
		)
		if fatal_error:
			logging.error(f"Got FATAL error while recomputing balances for companies that need it: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		for cur_date in dates_updated:
			with session_scope(current_app.session_maker) as session:
				fatal_error = reports_util.compute_and_update_bank_financial_summaries(session, cur_date)
				if fatal_error:
					raise errors.Error('FAILED to update bank financial summary on {}'.format(fatal_error))

		logging.info("Finished request to update {} dirty financial summaries".format(len(compute_requests)))

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))



class UpdateAllCompanyBalancesView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to update all company balances")
		session_maker = current_app.session_maker
		
		companies = reports_util.list_all_companies(session_maker)
		cur_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		company_ids = [company['id'] for company in companies]
		_set_needs_balance_recomputed(
			company_ids, cur_date, 
			create_if_missing=True,
			days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK, 
			session_maker=session_maker)

		logging.info("Submitted that all customers need their company balances updated")

		return make_response(json.dumps({
			"status": "OK"
		}))


class ExpireActiveEbbaApplications(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	# This function cannot be type checked because it uses "join" which is an
	# untyped function
	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to expire old ebba applications")

		with session_scope(current_app.session_maker) as session:
			results = session.query(models.CompanySettings).filter( # type: ignore
				models.CompanySettings.active_ebba_application_id != None).join(
				models.EbbaApplication
				).filter(models.EbbaApplication.expires_at < func.now()).all()

			for company in results:
				events.new(
					company_id=str(company.id),
					action=events.Actions.EBBA_APPLICATION_EXPIRE,
					is_system=True,
					data={'ebba_application_id': str(company.active_ebba_application_id)}
				).set_succeeded().write_with_session(session)
				logging.info(f"Expiring active borrowing base for '{company.company_id}'")
				company.active_ebba_application_id = None

		logging.info("Finished expiring old ebba applications")

		return make_response(json.dumps({
			"status": "OK",
			"errors": [],
		}))

class RerunFailedMetrcDownloadsView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to rerun failed metrc downloads")
		before = time.time()

		with session_scope(current_app.session_maker) as session:
			retry_infos, err = metrc_summary_util.fetch_metrc_daily_summaries_to_rerun(
				session,
				num_to_fetch=2
			)
			if err:
				return handler_util.make_error_response(err, status_code=500)

		company_ids = []
		failed_company_ids = []
		all_errs = []

		for retry_info in retry_infos:
			resp, fatal_err = _download_metrc_data_for_one_customer(
				cur_date=retry_info['cur_date'], 
				company_id=retry_info['company_id'], 
				current_app=current_app)
			company_ids.append(retry_info['company_id'])

			if fatal_err:
				all_errs.append(fatal_err)
				failed_company_ids.append(retry_info['company_id'])

		email_success, err = _handle_errs_after_metrc_downloads(
			before=before,
			trigger_name='rerun_failed_metrc_downloads',
			company_ids=company_ids,
			failed_company_ids=failed_company_ids,
			all_errs=all_errs,
		)

		if err:
			return handler_util.make_error_response(err, status_code=500)

		logging.info(f"Finished rerunning download metrc data for needs_retry download summaries")

		if all_errs:
			err_msg = ', '.join(['{}'.format(err) for err in all_errs])
			return handler_util.make_error_response(err_msg, status_code=500)

		return make_response(json.dumps({
			"status": "OK",
			"errors": ['{}'.format(err) for err in all_errs],
		}))

class SetDirtyCompanyBalancesView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to declare that a company needs its balance recomputed")

		data = json.loads(request.data)

		company_id: str = data.get('event', {}) \
			.get('data', {}) \
			.get('new', {}) \
			.get('company_id')

		if not company_id:
			return make_response(json.dumps({
				"status": "OK"
			}))

		logging.info(f"Marking that company.needs_balance_recomputed for company: '{company_id}'")

		cur_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
		success, err = _set_needs_balance_recomputed(
			[company_id], cur_date, 
			create_if_missing=True, 
			days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK,
			session_maker=current_app.session_maker)
		if err:
			raise errors.Error('{}'.format(err), http_code=500)

		logging.info(f"Finished marking that company.needs_balance_recomputed for company: '{company_id}'")

		return make_response(json.dumps({
			"status": "OK"
		}))


class DownloadMetrcDataView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to download metrc data for all customers")
		if os.environ.get('FLASK_ENV') != 'production':
			logging.info('Skipping downloading metrc data because we are not running in production')
			return make_response(json.dumps({
				'status': 'OK'
			}))

		data = json.loads(request.data)

		TIME_WINDOW_IN_DAYS = 2
		todays_date = date_util.now_as_date(timezone=date_util.DEFAULT_TIMEZONE)

		start_date = todays_date - timedelta(days=TIME_WINDOW_IN_DAYS)
		end_date = todays_date

		before = time.time()		
		company_ids = metrc_util.get_companies_with_metrc_keys(current_app.session_maker)

		if data.get('use_async'):
			logging.info(f"Submitting request to download metrc data for all customers [async]")
		
			with session_scope(current_app.session_maker) as session:
				pipeline = models.AsyncPipeline()
				pipeline.name = PipelineName.SYNC_METRC_DATA_ALL_CUSTOMERS
				pipeline.internal_state = {}
				pipeline.status = PipelineState.SUBMITTED
				pipeline.params = {
					'company_ids': company_ids,
					'start_date': start_date,
					'end_date': end_date
				}
				session.add(pipeline)
				session.flush()
				pipeline_id = str(pipeline.id)

			return make_response(json.dumps({'status': 'OK', 'pipeline_id': pipeline_id}))

		all_errs = []
		failed_company_ids = []

		for company_id in company_ids:
			cur_date = start_date

			while cur_date <= end_date:
				resp, fatal_err = _download_metrc_data_for_one_customer(
					cur_date, company_id, current_app)

				if fatal_err:
					all_errs.append(fatal_err)
					failed_company_ids.append(company_id)
					# Dont continue with additional days if one of the days failed
					break

				cur_date = cur_date + timedelta(days=1)


		email_success, err = _handle_errs_after_metrc_downloads(
			before=before,
			trigger_name='download_metrc_data',
			company_ids=company_ids,
			failed_company_ids=failed_company_ids,
			all_errs=all_errs,
		)

		if err:
			return handler_util.make_error_response(err, status_code=500)

		logging.info(f"Finished downloading metrc data for all customers")

		return make_response(json.dumps({
			'status': 'OK',
			'errors': ['{}'.format(err) for err in all_errs]
		}))

class CompanyLicensesModifiedView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Company licenses modified -- running updates")
		cfg = cast(Config, current_app.app_config)

		data = json.loads(request.data)
		event = data.get('event')
		if not event:
			return make_response(json.dumps({'status': 'OK'}))

		mods = []

		op = event['op']

		if op == DBOperation.DELETE:
			mods = [
				LicenseModificationDict(
					license_row_id=event.get('data', {}).get('old', {}).get('id'),
					license_number=event.get('data', {}).get('old', {}).get('license_number'),
					op=op
				)
			]

		elif op == DBOperation.INSERT:
			mods = [
				LicenseModificationDict(
					license_row_id=event.get('data', {}).get('new', {}).get('id'),
					license_number=event.get('data', {}).get('new', {}).get('license_number'),
					op=op
				)
			]

		elif op == DBOperation.UPDATE:
			# On an update we consider that we need to remove the association with
			# the previous license number, and then consider that a new association
			# as been added.
			#
			# So it's really a DELETE followed by an INSERT
			mods = [
				LicenseModificationDict(
					license_row_id=event.get('data', {}).get('old', {}).get('id'),
					license_number=event.get('data', {}).get('old', {}).get('license_number'),
					op=DBOperation.DELETE
				),
				LicenseModificationDict(
					license_row_id=event.get('data', {}).get('new', {}).get('id'),
					license_number=event.get('data', {}).get('new', {}).get('license_number'),
					op=DBOperation.INSERT,
				)
			]
		else:
			return handler_util.make_error_response('Unrecognized operation to company licenses modified trigger: {}'.format(op), status_code=500)

		for mod in mods:
			if not mod['license_row_id']:
				return handler_util.make_error_response('No license row id identified in the company licenses modified trigger')

			success, err = licenses_util.update_metrc_rows_on_license_change(
				mod=mod,
				session_maker=current_app.session_maker
			)
			if err:
				return handler_util.make_error_response(err)

		return make_response(json.dumps({'status': 'OK'}))

class ExecuteAsyncTasksView(MethodView):
	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("async_pipelines modified -- running updates")
		cfg = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)

		resp = orchestrator.handle_async_tasks(ctx=orchestrator.Context(
			session_maker=current_app.session_maker,
			metrc_auth_provider=cfg.get_metrc_auth_provider(),
			metrc_worker_config=cfg.get_metrc_worker_config(),
			sendgrid_client=sendgrid_client,
			security_cfg=cfg.get_security_config()
		))
		return make_response(json.dumps({'status': 'OK', 'resp': resp}))

handler.add_url_rule(
	'/update-dirty-customer-balances',
	view_func=UpdateDirtyCompanyBalancesView.as_view(name='update_dirty_customer_balances_view'))


handler.add_url_rule(
	'/update-all-customer-balances',
	view_func=UpdateAllCompanyBalancesView.as_view(name='update_all_customer_balances_view'))

handler.add_url_rule(
	'/rerun-failed-metrc-downloads',
	view_func=RerunFailedMetrcDownloadsView.as_view(name='rerun_failed_metrc_download_view'))


handler.add_url_rule(
	"/expire-active-ebba-applications",
	view_func=ExpireActiveEbbaApplications.as_view(name='expire_active_ebba_applications'))

handler.add_url_rule(
	'/set_dirty_company_balances_view',
	view_func=SetDirtyCompanyBalancesView.as_view(name='set_dirty_company_balances_view'))

handler.add_url_rule(
	"/download-metrc-data",
	view_func=DownloadMetrcDataView.as_view(name='download_metrc_data_view'))

handler.add_url_rule(
	"/execute_async_tasks_view",
	view_func=ExecuteAsyncTasksView.as_view(name='execute_async_tasks_view'))

handler.add_url_rule(
	"/company_licenses_modified_view",
	view_func=CompanyLicensesModifiedView.as_view(name='company_licenses_modified_view'))
