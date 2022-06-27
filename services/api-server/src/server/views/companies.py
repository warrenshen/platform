import json
from typing import Any, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import create_company_util, partnership_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.date import date_util
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util
from server.config import Config
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
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

class CreateProspectiveCustomerView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.CUSTOMER_CREATE)
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		user_session = auth_util.UserSession.from_session()
		bank_admin_user_id = user_session.get_user_id()

		required_keys = ['company']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in response to create prospective company')

		resp, err = create_company_util.create_prospective_customer(
			req=form,
			bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker,
		)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

class UpsertCustomMessagesView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_settings_id',
			'custom_messages_payload'
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		if not user_session.is_bank_admin():
			return handler_util.make_error_response('Access Denied')

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.upsert_custom_messages_payload(
				company_settings_id=form['company_settings_id'],
				custom_messages_payload=form['custom_messages_payload'],
				session=session
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

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

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.upsert_feature_flags_payload(
				session = session,
				company_settings_id = form['company_settings_id'],
				feature_flags_payload = form['feature_flags_payload'],
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK'
		}), 200)

class UpdateCustomerSettingsView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()

		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_settings_id',
			'is_autogenerate_repayments_enabled',
			'has_autofinancing',
			'vendor_agreement_docusign_template',
			'vendor_onboarding_link',
			'payor_agreement_docusign_template',
		]
		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} in request'.format(key))

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.update_company_settings(
				session = session,
				company_settings_id = form['company_settings_id'],
				is_autogenerate_repayments_enabled = form['is_autogenerate_repayments_enabled'],
				has_autofinancing = form['has_autofinancing'],
				vendor_agreement_docusign_template = form['vendor_agreement_docusign_template'],
				vendor_onboarding_link = form['vendor_onboarding_link'],
				payor_agreement_docusign_template = form['payor_agreement_docusign_template'],
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

			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())


			partner_name = req['company']['name']

			template_data = {
				'customer_name': customer.get_display_name(),
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

class CreatePartnershipRequestNewView(MethodView):

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'customer_id',
			'company',
			'user',
			'license_info',
			'request_info',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		customer_id = form['customer_id']

		req = cast(create_company_util.CreatePartnershipRequestNewInputDict, form)

		partner_name = req['company']['name']
		user_email = req['user']['email']

		with session_scope(current_app.session_maker) as session:

			partnership_req_id, err = create_company_util.create_partnership_request_new(
				req=req,
				session=session,
				is_payor=False,
			)
			if err:
				raise err

			sendgrid_client = cast(
				sendgrid_util.Client,
				current_app.sendgrid_client,
			)

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

			

			template_data = {
				'customer_name': customer.get_display_name(),
				'partner_name': partner_name,
				'partnership_type': 'vendor',
			}
			recipients = sendgrid_client.get_bank_notify_email_addresses()
			_, err = sendgrid_client.send(
				sendgrid_util.TemplateNames.USER_REQUESTS_PARTNER_ON_PLATFORM,
				template_data, recipients)
			if err:
				raise err

			# Mark partnership invite as complete
			company_partnership_invite = cast(
				models.CompanyPartnershipInvitation,
				session.query(models.CompanyPartnershipInvitation).filter(
					models.CompanyPartnershipInvitation.email == user_email
				).first()
			)

			if company_partnership_invite:
				company_partnership_invite.closed_at = date_util.now()

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


		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.delete_partnership_request(
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

			customer_id = resp['customer_id']
			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			partner_id = resp['company_id']
			partner = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == partner_id
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
			
			contract, err = contract_util.get_active_contract_by_company_id(session, customer_id)
			if err:
				raise err

			product_type, err = contract.get_product_type()
			if err:
				raise err
			is_loc_customer = product_type == db_constants.ProductType.LINE_OF_CREDIT
			is_dispensary_customer = product_type == db_constants.ProductType.DISPENSARY_FINANCING

			if resp['company_type'] == db_constants.CompanyType.Payor:
				docusign_link = customer_settings.payor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.PAYOR_AGREEMENT_WITH_CUSTOMER
			elif is_loc_customer and resp['company_type'] == db_constants.CompanyType.Vendor:
				docusign_link = customer_settings.vendor_onboarding_link
				template_name = sendgrid_util.TemplateNames.VENDOR_ONBOARDING_LINE_OF_CREDIT
			elif is_dispensary_customer and resp['company_type'] == db_constants.CompanyType.Vendor:
				docusign_link = None
				template_name = sendgrid_util.TemplateNames.DISPENSARY_VENDOR_AGREEMENT
			elif resp['company_type'] == db_constants.CompanyType.Vendor: 
				docusign_link = customer_settings.vendor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER
			else:
				raise errors.Error('Unexpected company_type {}'.format(resp['company_type']))

			# due to the interim period where we are informing our clients that we're moving away
			# from the vendor agreement and seeking their buyin, we should still default to the 
			# customer settings' docusign link unless the onboarding link is set
			onboarding_link = customer_settings.vendor_onboarding_link \
				if customer_settings.vendor_onboarding_link is not None else ""
			docusign_link = onboarding_link if onboarding_link != "" else docusign_link \
				if docusign_link is not None else ""
				
			if is_dispensary_customer:
				template_data = {
					'customer_name': customer.get_display_name(),
					'partner_name': partner.get_display_name(),
					'onboarding_link': '<a href="' + onboarding_link + '" target="_blank">Bespoke Vendor Onboarding Form</a>',
					'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>'
				}
			elif resp['company_type'] == db_constants.CompanyType.Payor:
				template_data = {
					'customer_name': customer.get_display_name(),
					'docusign_link': docusign_link,
				} 
			else:
				template_data = {
					'customer_name': customer.get_display_name(),
					'partner_name': partner.get_display_name(),
					'onboarding_link': '<a href="' + docusign_link + '" target="_blank">Bespoke Vendor Onboarding Form</a>',
					'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>'
				}
			for contact in partner_contacts:
				template_data["recipient_first_name"] = contact["first_name"]
				recipients = [contact['email']]
				_, err = sendgrid_client.send(
					template_name, template_data, recipients)
				if err:
					raise err

		return make_response(json.dumps({
			'status': 'OK',
			'company_id': resp['company_id'],
		}))


class CreatePartnershipNewView(MethodView):
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

			resp, err = create_company_util.create_partnership_new(
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

			customer_id = resp['customer_id']
			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			partner_id = resp['company_id']
			partner = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == partner_id
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
			
			contract, err = contract_util.get_active_contract_by_company_id(session, customer_id)
			if err:
				raise err

			product_type, err = contract.get_product_type()
			if err:
				raise err
			
			if resp['company_type'] == db_constants.CompanyType.Payor:
				docusign_link = customer_settings.payor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.PAYOR_AGREEMENT_WITH_CUSTOMER
			
				template_data = {
					'customer_name': customer.get_display_name(),
					'docusign_link': docusign_link,
				}

				for contact in partner_contacts:
					template_data["recipient_first_name"] = contact["first_name"]
					recipients = [contact['email']]
					_, err = sendgrid_client.send(
						template_name, template_data, recipients)
					if err:
						raise err

		return make_response(json.dumps({
			'status': 'OK',
			'company_id': resp['company_id'],
		}))

class AddVendorNewView(MethodView):
	decorators = [auth_util.login_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'email',
			'customer_id'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')
		
		request_data = cast(create_company_util.AddVendorNewInputDict, form)

		user_session = UserSession.from_session()

		with session_scope(current_app.session_maker) as session:

			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == request_data['customer_id']
				).first()
			)

			sendgrid_client = cast(
				sendgrid_util.Client,
				current_app.sendgrid_client,
			)
			cfg = cast(Config, current_app.app_config)

			template_name = sendgrid_util.TemplateNames.CLIENT_SENT_VENDOR_ONBOARDING_FORM
			template_data = {
				'customer_name': customer.get_display_name(),
				'onboarding_link': f'{cfg.BESPOKE_DOMAIN}/vendor-form/{request_data["customer_id"]}',
				'support_email': '<a href="mailto:support@bespokefinancial.com">support@bespokefinancial.com</a>'
			}
			recipients = [request_data['email']]

			_, err = sendgrid_client.send(
				template_name, template_data, recipients
			)
			if err:
				raise err
			
			# Store the invite details in the CompanyPartnershipInvitation
			partnership_invitation = models.CompanyPartnershipInvitation()
			partnership_invitation.requesting_company_id = customer.id
			partnership_invitation.email = request_data['email'].lower()
			partnership_invitation.submitted_by_user_id = user_session.get_user_id() # type: ignore
			partnership_invitation.metadata_info = {}
			partnership_invitation.requested_at = date_util.now()
			session.add(partnership_invitation)
			session.flush()

		return make_response(json.dumps({
			'status': 'OK',
		}))


class UpdatePartnershipRequestNewView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'partnership_request_id',
			'company',
			'user',
			'license_info',
			'request_info',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')
		
		request_data = cast(create_company_util.UpdatePartnershipRequestNewInputDict, form)

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.update_partnership_request_new(
				req=request_data,
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
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
			_, err = create_company_util.approve_partnership(
				partnership_id=partnership_id,
				is_payor=is_payor,
				session=session,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
		}))


class MarkPartnershipInviteAsComplete(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_partnership_invite_id',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')

		company_partnership_invite_id = form['company_partnership_invite_id']

		with session_scope(current_app.session_maker) as session:
			company_partnership_invite = cast(
				models.CompanyPartnershipInvitation,
				session.query(models.CompanyPartnershipInvitation).filter(
					models.CompanyPartnershipInvitation.id == company_partnership_invite_id
				).first()
			)

			if not company_partnership_invite:
				return handler_util.make_error_response('Invalid data')
			
			company_partnership_invite.closed_at = date_util.now()

		return make_response(json.dumps({
			'status': 'OK',
		}))

class CertifyCustomerSurveillanceResultView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'company_id',
			'surveillance_status',
			'surveillance_status_note',
			'surveillance_info',
			'qualifying_product',
			'qualifying_date'
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')


		company_id = form['company_id']
		surveillance_status = form['surveillance_status']
		surveillance_status_note = form['surveillance_status_note']
		surveillance_info = form['surveillance_info']
		qualifying_product = form['qualifying_product']
		qualifying_date = form['qualifying_date']

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.certify_customer_surveillance_result(
				session = session,
				company_id = company_id,
				surveillance_status = surveillance_status,
				surveillance_status_note = surveillance_status_note,
				surveillance_info = surveillance_info,
				qualifying_product = qualifying_product,
				qualifying_date = qualifying_date,
				user_id = auth_util.UserSession.from_session().get_user_id()
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
		}))

class DeleteCustomerSurveillanceResultView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = [
			'surveillance_result_id',
		]

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(f'Missing {key} in request')


		surveillance_result_id = form['surveillance_result_id']

		with session_scope(current_app.session_maker) as session:
			_, err = create_company_util.delete_customer_surveillance_result(
				session = session,
				surveillance_result_id = surveillance_result_id,
			)
			if err:
				raise err

		return make_response(json.dumps({
			'status': 'OK',
		}))

handler.add_url_rule(
	'/create_customer', view_func=CreateCustomerView.as_view(name='create_customer_view'))

handler.add_url_rule(
	'/create_prospective_customer', view_func=CreateProspectiveCustomerView.as_view(name='create_prospective_customer_view'))

handler.add_url_rule(
	'/certify_customer_surveillance_result', view_func=CertifyCustomerSurveillanceResultView.as_view(name='certify_customer_surveillance_result_view'))

handler.add_url_rule(
	'/delete_customer_surveillance_result', view_func=DeleteCustomerSurveillanceResultView.as_view(name='delete_customer_surveillance_result_view'))

handler.add_url_rule(
	'/upsert_custom_messages', view_func=UpsertCustomMessagesView.as_view(name='upsert_custom_messages_view'))

handler.add_url_rule(
	'/upsert_feature_flags', view_func=UpsertFeatureFlagsView.as_view(name='upsert_feature_flags_view'))

handler.add_url_rule(
	'/update_customer_settings', view_func=UpdateCustomerSettingsView.as_view(name='update_customer_settings_view'))

handler.add_url_rule(
	'/create_partnership_request', view_func=CreatePartnershipRequestView.as_view(name='create_partnership_request_view'))

handler.add_url_rule(
	'/create_partnership_request_new', view_func=CreatePartnershipRequestNewView.as_view(name='create_partnership_request_new_view'))

handler.add_url_rule(
	'/update_partnership_request_new', view_func=UpdatePartnershipRequestNewView.as_view(name='update_partnership_request_new_view'))

handler.add_url_rule(
	'/delete_partnership_request', view_func=DeletePartnershipRequestView.as_view(name='delete_partnership_request_view'))

handler.add_url_rule(
	'/create_partnership', view_func=CreatePartnershipView.as_view(name='create_partnership_view'))

handler.add_url_rule(
	'/create_partnership_new', view_func=CreatePartnershipNewView.as_view(name='create_partnership_new_view'))

handler.add_url_rule(
	'/mark_company_partnership_complete', view_func=MarkPartnershipInviteAsComplete.as_view(name='mark_company_partnership_complete_view'))

handler.add_url_rule(
	'/add_vendor_new', view_func=AddVendorNewView.as_view(name='add_vendor_new_view'))

handler.add_url_rule(
	'/approve_partnership', view_func=ApprovePartnershipView.as_view(name='approve_partnership_view'))
