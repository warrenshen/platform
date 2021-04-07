import datetime
import json
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import ProductType
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import contract_util, number_util
from bespoke.finance.payments import advance_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from mypy_extensions import TypedDict
from server.config import Config
from server.views.common import auth_util, handler_util

handler = Blueprint('finance_loans_advances', __name__)

@errors.return_error_tuple
def _send_bank_created_advances_emails(
	loan_ids: List[str],
	settlement_date: datetime.date,
) -> Tuple[bool, errors.Error]:
	cfg = cast(Config, current_app.app_config)
	sendgrid_client = cast(sendgrid_util.Client,
							current_app.sendgrid_client)

	customer_id_to_loans: Dict[str, List[models.Loan]] = {}
	with session_scope(current_app.session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		# Partition loans by customer_id.
		for loan in loans:
			customer_id = loan.company_id
			if customer_id not in customer_id_to_loans:
				customer_id_to_loans[customer_id] = []
			customer_id_to_loans[customer_id].append(loan)

		# For each customer_id, send an email to customer.
		for customer_id in customer_id_to_loans:
			customer_loans = customer_id_to_loans[customer_id]

			customer = cast(
				models.Company,
				session.query(models.Company).filter(
					models.Company.id == customer_id
				).first())

			customer_users = cast(
				List[models.User],
				session.query(models.User).filter_by(
					company_id=customer_id
				).all())

			if not customer_users:
				raise errors.Error(f'There are no users configured for customer {customer.name}')

			# Get all contracts associated with company.
			contracts = cast(
				List[models.Contract],
				session.query(models.Contract).filter(
					models.Contract.company_id == customer_id
				).all())
			if not contracts:
				raise errors.Error(f'There are no contracts are setup for customer {customer.name}')

			contract_dicts = [c.as_dict() for c in contracts]

			contract_helper, err = contract_util.ContractHelper.build(customer_id, contract_dicts)
			if err:
				raise err

			active_contract, err = contract_helper.get_contract(settlement_date)
			if err:
				raise err

			product_type, err = active_contract.get_product_type()
			if err:
				raise err

			customer_name = customer.name
			customer_identifier = customer.identifier

			# Step 1
			# Email appropriate customers(s).
			loan_dicts = [{
				'identifier': f'{customer_identifier}{loan.identifier}',
				'amount': number_util.to_dollar_format(float(loan.amount)),
				'origination_date': date_util.date_to_str(loan.origination_date),
				'requested_date': date_util.human_readable_yearmonthday(loan.requested_at),
			} for loan in customer_loans]
			template_data = {
				'customer_name': customer_name,
				'loans': loan_dicts,
			}
			customer_emails = [user.email for user in customer_users]

			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.BANK_SENT_ADVANCES_FOR_LOANS,
				template_data=template_data,
				recipients=customer_emails,
			)
			if err:
				raise err

			# Step 2
			# Email appropriate vendor(s).
			# Vendors do NOT receive advances for the INVOICE_FINANCING product type.
			if product_type in [ProductType.INVENTORY_FINANCING, ProductType.PURCHASE_MONEY_FINANCING]:
				# Email each vendor who received an advance.
				for loan in customer_loans:
					purchase_order = cast(
						models.PurchaseOrder,
						session.query(models.PurchaseOrder).filter_by(
							id=loan.artifact_id
						).first())

					vendor_id = purchase_order.vendor_id

					vendor = cast(
						models.Company,
						session.query(models.Company).get(vendor_id))

					vendor_users = cast(
						List[models.User],
						session.query(models.User).filter_by(
							company_id=vendor_id
						).all())

					if not vendor_users:
						raise errors.Error(f'There are no users configured for vendor {vendor.name}')

					template_data = {
						'customer_name': customer_name,
						'vendor_name': vendor.name,
						'purchase_order_number': purchase_order.order_number,
						'advance_amount': number_util.to_dollar_format(float(loan.amount)),
					}
					vendor_emails = [user.email for user in vendor_users]

					_, err = sendgrid_client.send(
						template_name=sendgrid_util.TemplateNames.BANK_SENT_ADVANCE_TO_VENDOR,
						template_data=template_data,
						recipients=vendor_emails,
					)
					if err:
						raise err
			elif product_type == ProductType.LINE_OF_CREDIT:
				# Email each vendor who received an advance.
				for loan in customer_loans:
					line_of_credit = cast(
						models.LineOfCredit,
						session.query(models.LineOfCredit).filter_by(
							id=loan.artifact_id
						).first())

					vendor_id = line_of_credit.recipient_vendor_id if line_of_credit.is_credit_for_vendor else None

					if vendor_id is not None:
						vendor = cast(
							models.Company,
							session.query(models.Company).get(vendor_id))

						vendor_users = cast(
							List[models.User],
							session.query(models.User).filter_by(
								company_id=vendor_id
							).all())

						if not vendor_users:
							raise errors.Error(f'There are no users configured for vendor {vendor.name}')

						template_data = {
							'customer_name': customer_name,
							'vendor_name': vendor.name,
							'advance_amount': number_util.to_dollar_format(float(loan.amount)),
						}
						vendor_emails = [user.email for user in vendor_users]

						_, err = sendgrid_client.send(
							template_name=sendgrid_util.TemplateNames.BANK_SENT_ADVANCE_TO_VENDOR,
							template_data=template_data,
							recipients=vendor_emails,
						)
						if err:
							raise err

	return True, None

class HandleAdvanceView(MethodView):
	decorators = [auth_util.bank_admin_required]

	@events.wrap(events.Actions.LOANS_FUND_WITH_ADVANCE)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		form = json.loads(request.data)
		if not form:
			return handler_util.make_error_response('No data provided')

		required_keys = ['payment', 'loan_ids', 'should_charge_wire_fee']

		for key in required_keys:
			if key not in form:
				return handler_util.make_error_response(
					'Missing key {} from handle advance request'.format(key))

		user_session = auth_util.UserSession.from_session()

		resp, err = advance_util.fund_loans_with_advance(
			req=form,
			bank_admin_user_id=user_session.get_user_id(),
			session_maker=current_app.session_maker
		)

		if err:
			return handler_util.make_error_response(err)

		loan_ids = form['loan_ids']
		settlement_date = date_util.load_date_str(form['payment']['settlement_date'])
		_, err = _send_bank_created_advances_emails(
			loan_ids=loan_ids,
			settlement_date=settlement_date,
		)

		if err:
			return handler_util.make_error_response(err)

		resp['status'] = 'OK'
		return make_response(json.dumps(resp), 200)

handler.add_url_rule(
	'/handle_advance', view_func=HandleAdvanceView.as_view(name='handle_advance_view'))
