import json
from typing import Any, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import create_company_util, partnership_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util
from server.views.common.auth_util import UserSession

handler = Blueprint('companies', __name__)

class CreateCustomerView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CUSTOMER_CREATE)
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		required_keys = ['company', 'settings', 'contract']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to create company')

		resp, err = create_company_util.create_customer(
			req=form,
			bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker,
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

class UpsertFeatureFlagsView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_settings_id',
			'feature_flags_payload'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		if not user_session.is_bank_admin():
			return handler_util.make_error_response('Access Denied')

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.upsert_feature_flags_payload(
				company_settings_id=form['company_settings_id'],
				feature_flags_payload=form['feature_flags_payload'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class CreatePartnershipRequestView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'is_payor',
			'customer_id',
			'company',
			'user',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		if not user_session.is_bank_or_this_company_admin(form['customer_id']):
			return handler_util.make_error_response('Access Denied')

		customer_id = form['customer_id']
		is_payor = form['is_payor']

		partnership_type = 'payor' if is_payor else 'vendor'

		req = cast(create_company_util.CreatePartnershipRequestInputDict, form)

		with session_scope(current_app.session_maker) as session:

			partnership_req_id, err = create_company_util.create_partnership_request(
				req=req,
				requested_user_id=user_session.get_user_id(),
				session=session,
				is_payor=is_payor,
			)
			if err:
				raise err

			sendgrid_client = cast(
				sendgrid_util.Client,
				current_app.sendgrid_client,
			)
			cfg = cast(Config, current_app.app_config)

			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			customer_settings = cast(
				models.CompanySettings,
				session.query(models.CompanySettings).filter(
					models.CompanySettings.company_id == customer_id
				).first())

			# Payor or vendor users.
			customer_name = customer.name
			partner_name = req['company']['name']

			template_data = {
				'customer_name': customer_name,
				'partner_name': partner_name,
				'partnership_type': partnership_type
			}
			recipients = sendgrid_client.get_bank_notify_email_addresses()
			_, err = sendgrid_client.send(
				sendgrid_util.TemplateNames.USER_REQUESTS_PARTNER_ON_PLATFORM,
				template_data, recipients)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'partnership_request_id': partnership_req_id,
		}))

class DeletePartnershipRequestView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'partnership_request_id'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		with session_scope(current_app.session_maker) as session:
			success, err = create_company_util.delete_partnership_request(
				partnership_request_id=form['partnership_request_id'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}))

class CreatePartnershipView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'partnership_request_id',
			'should_create_company'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		user_session = UserSession.from_session()

		with session_scope(current_app.session_maker) as session:

			resp, err = create_company_util.create_partnership(
				req=cast(create_company_util.CreatePartnershipInputDict, form),
				session=session,
				bank_admin_user_id=user_session.get_user_id()
			)
			if err:
				raise err

			sendgrid_client = cast(
				sendgrid_util.Client,
				current_app.sendgrid_client,
			)
			cfg = cast(Config, current_app.app_config)

			customer_id = resp['customer_id']
			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			customer_settings = cast(
				models.CompanySettings,
				session.query(models.CompanySettings).filter(
					models.CompanySettings.company_id == customer_id
				).first())

			# Payor or vendor users.
			partner_contacts, err = partnership_util.get_partner_contacts(
				partnership_id=resp['partnership_id'],
				partnership_type=resp['partnership_type'],
				session=session
			)
			if err:
				raise err

			if not partner_contacts:
				raise errors.Error('There are no users configured for this payor or vendor')
			company_emails = [contact['email'] for contact in partner_contacts]

			customer_name = customer.name

			if resp['company_type'] == db_constants.CompanyType.Payor:
				docusign_link = customer_settings.payor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.PAYOR_AGREEMENT_WITH_CUSTOMER
			elif resp['company_type'] == db_constants.CompanyType.Vendor:
				docusign_link = customer_settings.vendor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER
			else:
				raise errors.Error('Unexpected company_type {}'.format(resp['company_type']))

			template_data = {
				'customer_name': customer_name,
				'docusign_link': docusign_link,
			}
			recipients = company_emails
			_, err = sendgrid_client.send(
				template_name, template_data, recipients)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
			'company_id': resp['company_id'],
		}))

class ApprovePartnershipView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'partnership_id',
			'is_payor',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		partnership_id = form['partnership_id']
		is_payor = form['is_payor']

		with session_scope(current_app.session_maker) as session:
			success, err = create_company_util.approve_partnership(
				partnership_id=partnership_id,
				is_payor=is_payor,
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
		}))


handler.add_url_rule(
	'/create_customer', view_func=CreateCustomerView.as_view(name='create_customer_view'))

handler.add_url_rule(
	'/upsert_feature_flags', view_func=UpsertFeatureFlagsView.as_view(name='upsert_feature_flags_view'))

handler.add_url_rule(
	'/create_partnership_request', view_func=CreatePartnershipRequestView.as_view(name='create_partnership_request_view'))

handler.add_url_rule(
	'/delete_partnership_request', view_func=DeletePartnershipRequestView.as_view(name='delete_partnership_request_view'))

handler.add_url_rule(
	'/create_partnership', view_func=CreatePartnershipView.as_view(name='create_partnership_view'))

handler.add_url_rule(
	'/approve_partnership', view_func=ApprovePartnershipView.as_view(name='approve_partnership_view'))
