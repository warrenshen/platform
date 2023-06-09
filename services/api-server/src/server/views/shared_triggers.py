"""
	NOTE: These triggers should consolidate into manage_async_fast.py
	once we have set up the service and migrated these endpoints to that
"""
from typing import Any
import json
import logging
import datetime
from typing import Any, Callable, List, Tuple, cast
from flask import Response, current_app, make_response, request
from flask.views import MethodView
from sqlalchemy import func

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import licenses_util
from bespoke.companies.licenses_util import LicenseModificationDict
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import DBOperation
from bespoke.db.models import session_scope
from bespoke.finance.loans import reports_util
from server.config import Config
from server.views.common import auth_util, handler_util
from sqlalchemy.orm.session import Session

@errors.return_error_tuple
def _set_needs_balance_recomputed(
	session: Session,
	company_ids: List[str], 
	cur_date: datetime.date, 
	days_to_compute_back: int, 
) -> Tuple[bool, errors.Error]:

	if not company_ids:
		raise errors.Error("Failed to find company_ids in set_needs_balance_recomputed")

	_, err = reports_util.set_needs_balance_recomputed(
			session,
			company_ids,
			cur_date,
			days_to_compute_back=days_to_compute_back,
		)
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
			borrowing_bases = session.query(models.CompanySettings).filter( # type: ignore
					models.CompanySettings.active_borrowing_base_id != None,	
				).join(
					models.EbbaApplication,
					models.EbbaApplication.id == models.CompanySettings.active_borrowing_base_id
				).filter(
					models.EbbaApplication.expires_date < func.now()
				).all()

			for company in borrowing_bases:
				events.new(
					company_id=str(company.id),
					action=events.Actions.EBBA_APPLICATION_EXPIRE,
					is_system=True,
					data={'ebba_application_id': str(company.active_borrowing_base_id)}
				).set_succeeded().write_with_session(session)
				logging.info(f"Expiring active borrowing base for '{company.company_id}'")
				company.active_borrowing_base_id = None

			financial_reports = session.query(models.CompanySettings).filter( # type: ignore
					models.CompanySettings.active_financial_report_id != None,	
				).join(
					models.EbbaApplication,
					models.EbbaApplication.id == models.CompanySettings.active_financial_report_id
				).filter(
					models.EbbaApplication.expires_date < func.now()
				).all()

			for company in financial_reports:
				events.new(
					company_id=str(company.id),
					action=events.Actions.EBBA_APPLICATION_EXPIRE,
					is_system=True,
					data={'ebba_application_id': str(company.active_financial_report_id)}
				).set_succeeded().write_with_session(session)
				logging.info(f"Expiring active borrowing base for '{company.company_id}'")
				company.active_financial_report_id = None

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
		
		with models.session_scope(session_maker) as session:
			companies = reports_util.list_all_companies(session)
			cur_date = date_util.now_as_date(date_util.DEFAULT_TIMEZONE)
			company_ids = [company['id'] for company in companies]

			_set_needs_balance_recomputed(
				session,
				company_ids, 
				cur_date, 
				days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK)

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
		with session_scope(current_app.session_maker) as session:
			success, err = _set_needs_balance_recomputed(
				session,
				[company_id], 
				cur_date, 
				days_to_compute_back=reports_util.DAYS_TO_COMPUTE_BACK)
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
