import json
from typing import Any, List, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.companies import create_company_util
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
			req=form, bank_admin_user_id=bank_admin_user_id,
			session_maker=current_app.session_maker)
		if err:
			return handler_util.make_error_response(err)

		return make_response(json.dumps(resp), 200)

class CreatePayorVendorView(MethodView):
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

		company_id, err = create_company_util.create_payor_vendor(
			req=cast(create_company_util.CreatePayorVendorInputDict, form),
			session_maker=current_app.session_maker,
			is_payor=is_payor,
		)
		if err:
			return handler_util.make_error_response(err)

		sendgrid_client = cast(sendgrid_util.Client,
							   current_app.sendgrid_client)
		cfg = cast(Config, current_app.app_config)

		with session_scope(current_app.session_maker) as session:
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
			company_users = cast(List[models.User], session.query(
				models.User).filter_by(company_id=company_id).all())

			if not company_users:
				raise errors.Error('There are no users configured for this customer')
			company_emails = [user.email for user in company_users]

			customer_name = customer.name

			if is_payor:
				docusign_link = customer_settings.payor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.PAYOR_AGREEMENT_WITH_CUSTOMER
			else:
				docusign_link = customer_settings.vendor_agreement_docusign_template
				template_name = sendgrid_util.TemplateNames.VENDOR_AGREEMENT_WITH_CUSTOMER

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
			'company_id': company_id,
		}))


handler.add_url_rule(
	'/create_customer', view_func=CreateCustomerView.as_view(name='create_customer_view'))

handler.add_url_rule(
	'/create_payor_vendor', view_func=CreatePayorVendorView.as_view(name='create_payor_vendor_view'))
