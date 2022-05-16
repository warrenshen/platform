import json
import logging
import os
from decimal import *
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.config.config_util import is_prod_env
from bespoke.email import sendgrid_util
from bespoke.finance.bank_accounts import bank_account_util
from bespoke.finance.bank_accounts.bank_account_util import BankAccountInputDict
from bespoke.reports.report_generation_util import *
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config, get_config, get_email_client_config
from server.views.common import auth_util, handler_util
from sqlalchemy import (JSON, BigInteger, Boolean, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text)

handler = Blueprint("bank_accounts", __name__)
config = get_config()


class DeleteBankAccountView(MethodView):
    decorators = [auth_util.bank_admin_required]

    @handler_util.catch_bad_json_request
    def post(self, **kwargs: Any) -> Response:
        logging.info("Deleting bank account")
        form = json.loads(request.data)
        if not form:
            return handler_util.make_error_response("No data provided")
        variables = form.get("variables", None)

        bank_account_id = variables.get("bank_account_id", None) if variables else None
        if not bank_account_id:
            return handler_util.make_error_response("Invalid bank account id provided")

        with models.session_scope(current_app.session_maker) as session:
            bank_account = cast(
                models.BankAccount,
                session.query(models.BankAccount).filter_by(id=bank_account_id).first(),
            )

            if bank_account.is_deleted:
                return handler_util.make_error_response(
                    "Bank account is already deleted"
                )

            bank_account.is_deleted = True

        return make_response(
            json.dumps(
                {"status": "OK", "resp": "Successfully deleted the bank account."}
            )
        )

class CreateBankAccountView(MethodView):
    decorators = [auth_util.login_required]

    @handler_util.catch_bad_json_request
    def post(self, **kwargs: Any) -> Response:
        logging.info("Creating bank account")
        cfg = cast(Config, current_app.app_config)
        sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
        if sendgrid_client is None:
            raise errors.Error("Cannot load SendGrid client")

        form = json.loads(request.data)
        if not form:
            return handler_util.make_error_response('No data provided')

        required_keys = ['bankAccount']

        for key in required_keys:
            if key not in form:
                return handler_util.make_error_response(f'Missing {key} in response to creating/updating debt facility')

        bank_account_input = form['bankAccount']
        company_id = bank_account_input['company_id']

        with models.session_scope(current_app.session_maker) as session:
            user_session = auth_util.UserSession.from_session()
            user = session.query(models.User).filter(
                models.User.id == user_session.get_user_id()
            ).first()

            template_data, err = bank_account_util.add_bank_account(
                session,
                user,
                cast(BankAccountInputDict, bank_account_input),
                company_id
            )
            if err:
                raise err

            email_alert_recipient = "support@bespokefinancial.com"  if is_prod_env(os.environ.get('FLASK_ENV')) \
                else "do-not-reply-development@bespokefinancial.com"

            _, err = sendgrid_client.send(
                template_name=sendgrid_util.TemplateNames.BANK_ACCOUNT_ALERT_CHANGE,
                template_data=template_data,
                recipients=[email_alert_recipient],
                filter_out_contact_only=True
            )

            if err:
                return make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

        return make_response(
            json.dumps(
                {"status": "OK", "resp": "Successfully created the bank account."}
            )
        )

class UpdateBankAccountView(MethodView):
    decorators = [auth_util.login_required]

    @handler_util.catch_bad_json_request
    def post(self, **kwargs: Any) -> Response:
        logging.info("Updating bank account")
        cfg = cast(Config, current_app.app_config)
        sendgrid_client = cast(sendgrid_util.Client, current_app.sendgrid_client)
        if sendgrid_client is None:
            raise errors.Error("Cannot load SendGrid client")

        form = json.loads(request.data)
        if not form:
            return handler_util.make_error_response('No data provided')

        required_keys = ['bankAccountId', 'bankAccount']

        for key in required_keys:
            if key not in form:
                return handler_util.make_error_response(f'Missing {key} in response to creating/updating debt facility')

        bank_account_id = form['bankAccountId']
        bank_account_input = form['bankAccount']

        with models.session_scope(current_app.session_maker) as session:
            user_session = auth_util.UserSession.from_session()
            user = session.query(models.User).filter(
                models.User.id == user_session.get_user_id()
            ).first()

            template_data, err = bank_account_util.update_bank_account(
                session,
                user,
                user_session.is_bank_admin(),
                cast(BankAccountInputDict, bank_account_input),
                bank_account_id
            )
            if err:
                raise err

            email_alert_recipient = "support@bespokefinancial.com"  if is_prod_env(os.environ.get('FLASK_ENV')) \
                else "do-not-reply-development@bespokefinancial.com"
            
            _, err = sendgrid_client.send(
                template_name=sendgrid_util.TemplateNames.BANK_ACCOUNT_ALERT_CHANGE,
                template_data=template_data,
                recipients=[email_alert_recipient],
                filter_out_contact_only=True
            )

            if err:
                return make_response(json.dumps({ 'status': 'FAILED', 'resp': "Sendgrid client failed: " + repr(err) }))

        return make_response(
            json.dumps(
                {"status": "OK", "resp": "Successfully updated the bank account."}
            )
        )

handler.add_url_rule(
    "/delete_bank_account",
    view_func=DeleteBankAccountView.as_view(name="delete_bank_account_view"),
)

handler.add_url_rule(
    "/create_bank_account",
    view_func=CreateBankAccountView.as_view(name="create_bank_account_view"),
)

handler.add_url_rule(
    "/update_bank_account",
    view_func=UpdateBankAccountView.as_view(name="update_bank_account_view"),
)
