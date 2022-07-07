import json
from typing import Any, cast, Dict, List
from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models, models_util
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance.ebba_applications import email_ebba_application_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_ebba_applications_alerts', __name__)

class AlertForExpiredBorrowingBaseCertification(MethodView):
	decorators = [auth_util.requires_async_magic_header] 

	@handler_util.catch_bad_json_request
	def post(self) -> Response:
		config = cast(Config, current_app.app_config)
		sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
		today_date = date_util.now_as_date()

		with models.session_scope(current_app.session_maker) as session:
			expired_borrowing_base_companies, err = email_ebba_application_util.alert_expired_borrowing_base(
				session,
				today_date,
				)
			if err:
				raise err
			
			for company in expired_borrowing_base_companies:
				all_users = models_util.get_active_users(
					company_id=str(company.id), 
					session=session,
					filter_contact_only=True
				)
				for contact_user in all_users:
					contact_user_full_name = contact_user.first_name + " " + contact_user.last_name

					template_data = {
					    "company_name": company.name,
					    "support_email": "<a href='mailto:support@bespokefinancial.com'>support@bespokefinancial.com</a>",
					}
					if sendgrid_client is not None:
						_, err = sendgrid_client.send(
							template_name=sendgrid_util.TemplateNames.ALERT_FOR_EXPIRED_BORROWING_BASE_CERTIFICATION,
							template_data=template_data,
							recipients=[contact_user.email],
							filter_out_contact_only=True,
							cc_recipients=[config.NO_REPLY_EMAIL_ADDRESS]
						)

						if err:
							raise err

		return make_response(json.dumps({
			'status': 'OK',
			'msg': 'Emails sent out to companies with expired borrowing base certificates'
		}), 200)

handler.add_url_rule(
	'/alert_expired_borrowing_base',
	view_func=AlertForExpiredBorrowingBaseCertification.as_view(name='alert_expired_borrowing_base')
)
