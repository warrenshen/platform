import json
import logging
from decimal import *
from typing import Any

from bespoke.reports.report_generation_util import *
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import get_config
from server.views.common import auth_util, handler_util

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


handler.add_url_rule(
    "/delete_bank_account",
    view_func=DeleteBankAccountView.as_view(name="delete_bank_account"),
)
