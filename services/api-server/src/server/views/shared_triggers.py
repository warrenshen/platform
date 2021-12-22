"""
	NOTE: These triggers should consolidate into manage_async_fast.py
	once we have set up the service and migrated these endpoints to that
"""
from typing import Any
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
from bespoke.audit import events
from bespoke.companies import licenses_util
from bespoke.companies.licenses_util import LicenseModificationDict
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.loans import reports_util
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views import shared_triggers

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

def add_shared_handlers(handler: Any) -> None:

	handler.add_url_rule(
		"/expire-active-ebba-applications",
		view_func=ExpireActiveEbbaApplications.as_view(name='expire_active_ebba_applications'))

	handler.add_url_rule(
		'/update-all-customer-balances',
		view_func=UpdateAllCompanyBalancesView.as_view(name='update_all_customer_balances_view'))

	handler.add_url_rule(
		'/set_dirty_company_balances_view',
		view_func=SetDirtyCompanyBalancesView.as_view(name='set_dirty_company_balances_view'))

	handler.add_url_rule(
		"/company_licenses_modified_view",
		view_func=CompanyLicensesModifiedView.as_view(name='company_licenses_modified_view'))
