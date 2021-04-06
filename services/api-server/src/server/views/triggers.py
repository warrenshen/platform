import json
import logging
import typing
from mypy_extensions import TypedDict

from bespoke.date import date_util
from bespoke.db.models import session_scope
from bespoke.db import models, models_util
from bespoke.audit import events
from bespoke.email import sendgrid_util
from bespoke.finance.loans import reports_util
from bespoke import errors
from server.views.common import auth_util, handler_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from sqlalchemy import func
from typing import Callable, Tuple


handler = Blueprint('triggers', __name__)


NotificationTemplateData = TypedDict('NotificationTemplateData', {
	'trigger_name': str,
	'domain': str,
	'outcome': str,
	'fatal_error': str,
	'descriptive_errors': typing.List[str],
}, total=False)


def _prepare_notification_data(
	trigger_name: str,
	fatal_error: errors.Error,
	descriptive_errors: typing.List[str]) -> NotificationTemplateData:

	data = NotificationTemplateData(
		trigger_name=trigger_name,
		domain=current_app.app_config.BESPOKE_DOMAIN,
		outcome='FAILED' if fatal_error else 'SUCCEEDED',
	)

	if fatal_error:
		data['fatal_error'] = str(fatal_error)

	if descriptive_errors and len(descriptive_errors):
		data['descriptive_errors'] = descriptive_errors

	return data


def _send_ops_notification(data: NotificationTemplateData) -> errors.Error:
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


class UpdateDirtyCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to update dirty company balances")

		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_companies_that_need_recompute(
			current_app.session_maker,
			date_util.now_in_pst().date()
		)
		if fatal_error:
			logging.error(f"Got fatal error while recomputing balances for companies that need it: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		logging.info("Finished request to update dirty company balances")

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))



class UpdateAllCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to update all company balances")

		descriptive_errors, fatal_error = reports_util.run_customer_balances_for_all_companies(
			current_app.session_maker,
			date_util.now_in_pst().date()
		)
		if fatal_error:
			logging.error(f"Got fatal error while recomputing balances for all companies: '{fatal_error}'")
			return handler_util.make_error_response(fatal_error)

		logging.info("Finished updating all company balances")

		err = _send_ops_notification(_prepare_notification_data(
			'update_all_customer_balances',
			fatal_error,
			descriptive_errors))
		if err:
			return handler_util.make_error_response(
				f"Failed sending update_all_customer_balances trigger notification. Error: '{err}'")

		return make_response(json.dumps({
			"status": "OK",
			"errors": descriptive_errors,
		}))


class ExpireActiveEbbaApplications(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	# This function cannot be type checked because it uses "join" which is an
	# untyped function
	@handler_util.catch_bad_json_request
	@typing.no_type_check
	def post(self) -> Response:
		logging.info("Received request to expire old ebba applications")

		with session_scope(current_app.session_maker) as session:
			results = session.query(models.CompanySettings) \
				.filter(models.CompanySettings.active_ebba_application_id != None) \
				.join(models.EbbaApplication) \
				.filter(models.EbbaApplication.expires_at < func.now()) \
				.all()

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


@errors.return_error_tuple
def _set_needs_balance_recomputed(company_id: str, session_maker: Callable) -> Tuple[bool, errors.Error]:

	if not company_id:
		raise errors.Error("Failed to find company_id in request")

	with models.session_scope(session_maker) as session:
		_, err = models_util.set_needs_balance_recomputed(company_id, session)
		if err:
			logging.error(f"FAILED marking that company.needs_balance_recomputed for company: '{company_id}'")
			raise errors.Error("Failed setting company dirty")

		return True, None

class SetDirtyCompanyBalancesView(MethodView):

	decorators = [auth_util.requires_async_magic_header]

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		logging.info("Received request to declare that a company needs its balance recomputed")

		data = json.loads(request.data)

		company_id = data.get('event', {}) \
			.get('data', {}) \
			.get('new', {}) \
			.get('company_id')

		logging.info(f"Marking that company.needs_balance_recomputed for company: '{company_id}'")

		success, err = _set_needs_balance_recomputed(company_id, current_app.session_maker)
		if err:
			return handler_util.make_error_response(
				'{}'.format(err), status_code=500)

		logging.info(f"Finished marking that company.needs_balance_recomputed for company: '{company_id}'")

		return make_response(json.dumps({
			"status": "OK"
		}))



handler.add_url_rule(
	'/update-dirty-customer-balances',
	view_func=UpdateDirtyCompanyBalancesView.as_view(name='update_dirty_customer_balances_view'))


handler.add_url_rule(
	'/update-all-customer-balances',
	view_func=UpdateAllCompanyBalancesView.as_view(name='update_all_customer_balances_view'))


handler.add_url_rule(
	"/expire-active-ebba-applications",
	view_func=ExpireActiveEbbaApplications.as_view(name='expire_active_ebba_applications'))

handler.add_url_rule(
	'/set_dirty_company_balances_view',
	view_func=SetDirtyCompanyBalancesView.as_view(name='set_dirty_company_balances_view'))
