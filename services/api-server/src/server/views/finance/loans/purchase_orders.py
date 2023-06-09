import datetime
import decimal
import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import LoanStatusEnum, LoanTypeEnum
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke.finance.purchase_orders import purchase_orders_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util
from sqlalchemy.orm import Session

handler = Blueprint('finance_loans_purchase_orders', __name__)


@dataclass
class UpsertRequestItemArtifact:
	id: str

	@staticmethod
	def from_dict(d: Dict) -> Tuple['UpsertRequestItemArtifact', errors.Error]:
		id_ = d.get("id")
		if not id_:
			return None, errors.Error("artifacts must have an id")
		return UpsertRequestItemArtifact(id_), None

@dataclass
class UpsertRequestItemLoan:
	id: Optional[str]
	requested_payment_date: datetime.date
	amount: decimal.Decimal

	@staticmethod
	def from_dict(d: Dict) -> Tuple['UpsertRequestItemLoan', errors.Error]:
		try:
			requested_payment_date = date_util.load_date_str(d.get("requested_payment_date"))
		except:
			return None, errors.Error(
				f"requested_payment_date in item was not a valid date: '{d}'")

		amount = d.get("amount")
		if not amount:
			return None, errors.Error(
				f"no loan amount found in item: {d}")

		if not type(amount) == int and not type(amount) == float:
			return None, errors.Error(
				f"found non-numeric loan amount in item: '{d}'")

		amount = decimal.Decimal(amount)
		if amount <= decimal.Decimal(0.0):
			return None, errors.Error(
				f"found non-positive loan amount in item: '{d}'")

		return UpsertRequestItemLoan(d.get("id"), requested_payment_date, amount), None

@dataclass
class UpsertRequestItem:
	artifact: UpsertRequestItemArtifact
	loan: UpsertRequestItemLoan

	@staticmethod
	def validate_dict(d: Any) -> bool:
		return bool(d) and type(d) == dict

	@staticmethod
	def from_dict(d: Dict) -> Tuple['UpsertRequestItem', errors.Error]:
		artifact = d.get("artifact")
		loan = d.get("loan")

		if not UpsertRequestItem.validate_dict(artifact):
			return None, errors.Error(f"'artifact' is not an object in item: '{d}'")

		if not UpsertRequestItem.validate_dict(loan):
			return None, errors.Error(f"'loan' is not an object in item: '{d}'")

		artifact, err = UpsertRequestItemArtifact.from_dict(artifact)
		if err:
			return None, err

		loan, err = UpsertRequestItemLoan.from_dict(loan)
		if err:
			return None, err

		return UpsertRequestItem(artifact, loan), None

@dataclass
class UpsertRequest:
	status: str
	data: List[UpsertRequestItem]

	valid_statuses = (
		LoanStatusEnum.DRAFTED,
		LoanStatusEnum.APPROVAL_REQUESTED
	)

	def artifact_ids(self) -> List[str]:
		return [item.artifact.id for item in self.data]

	def loan_ids(self) -> List[str]:
		return [id_ for id_ in [item.loan.id for item in self.data] if id_ is not None]

	def __len__(self) -> int:
		return len(self.data)

	@staticmethod
	def from_dict(request: Dict) -> Tuple['UpsertRequest', errors.Error]:
		if not request:
			return None, errors.Error('no data provided')

		status = request.get('status')
		if not status:
			return None, errors.Error("missing key: 'status'")

		data = request.get('data')
		if not type(data) == list:
			return None, errors.Error("'data' must be an array")

		if not len(data):
			return None, errors.Error("'data' is empty")

		if status not in UpsertRequest.valid_statuses:
			return None, errors.Error(f"'{status}' is not a valid status")

		items = []
		for d in data:
			item, err = UpsertRequestItem.from_dict(d)
			if err:
				return None, err
			items.append(item)

		upsert = UpsertRequest(status, items)

		if len(upsert) != len(set(upsert.artifact_ids())):
			return None, errors.Error("each artifact id must be unique")

		loan_ids = upsert.loan_ids()
		if len(loan_ids) != len(set(loan_ids)):
			return None, errors.Error("each item must contain a unique loan.id or loan.id must be null")

		return upsert, None

@errors.return_error_tuple
def _validate_model_permissions(
	company_id: str,
	purchase_order_ids: List[str],
	loan_ids: List[str]) -> Tuple[bool, errors.Error]:
	# Permissions validation
	# We need to make sure this user has permission to work with these purchase
	# orders and these loans (if applicable)
	with models.session_scope(current_app.session_maker) as session:
		count = session.query(models.PurchaseOrder) \
			.filter(models.PurchaseOrder.company_id == company_id) \
			.filter(models.PurchaseOrder.id.in_(purchase_order_ids)) \
			.count()

		if count != len(purchase_order_ids):
			raise errors.Error("Access Denied")

		if loan_ids:
			count = session.query(models.Loan) \
				.filter(models.Loan.company_id == company_id) \
				.filter(models.Loan.id.in_(loan_ids)) \
				.count()

			if count != len(loan_ids):
				raise errors.Error("Access Denied")

	return True, None

def _handle_approval_email(
	session: Session,
	customer_name: str,
	loan_dicts: List[models.LoanDict],
	requested_by_user_id: str,
	triggered_by_autofinancing: bool
	) -> errors.Error:
	responses = []

	for loan in loan_dicts:
		response, err = approval_util.submit_for_approval(
			session,
			loan["id"],
			requested_by_user_id=requested_by_user_id,
			triggered_by_autofinancing=triggered_by_autofinancing,
		)
		if err:
			return err
		responses.append(response)

	collated_responses = '\n'.join(response["loan_html"].strip() for response in responses)
	html = f"<div>\n{collated_responses}\n</div>"
	data = {
		"customer_name": customer_name,
		"loan_html": html,
		"triggered_by_autofinancing": triggered_by_autofinancing
	}

	config = cast(Config, current_app.app_config)
	client = cast(sendgrid_util.Client, current_app.sendgrid_client)

	_, err = client.send(
		sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_LOAN,
		data,
		config.BANK_NOTIFY_EMAIL_ADDRESSES)

	return err

class UpsertPurchaseOrdersLoansView(MethodView):
	"""Perform upserts on the given purchase order loans"""
	decorators = [auth_util.login_required]

	@events.wrap(events.Actions.LOANS_UPSERT_PURCHASE_ORDER_LOANS)
	@handler_util.catch_bad_json_request
	def post(self, **kwargs: Any) -> Response:
		user_session = auth_util.UserSession.from_session()
		form = json.loads(request.data)
		company_id = form["company_id"]
		requested_by_user_id = user_session.get_user_id()

		# If the user is not a company admin, they cannot call this route
		if not user_session.is_bank_or_this_company_admin(company_id):
			raise errors.Error("Access Denied")

		upsert, err = UpsertRequest.from_dict(form)
		if err:
			raise err

		success, err = _validate_model_permissions(
			company_id,
			upsert.artifact_ids(),
			upsert.loan_ids())
		if err:
			raise err

		# NB: We don't do many checks in here around the intergrity of the loan
		# because those all happen when it gets submitted for approval and
		# doing so twice in the same function would be redundant.
		loan_events: List[events.Event] = []

		with models.session_scope(current_app.session_maker) as session:
			company = session.query(models.Company).get(company_id)
			customer_name = company.name
			loan_dicts = []
			user = session.query(models.User) \
				.filter(models.User.id == user_session.get_user_id()) \
				.first()

			for item in upsert.data:
				nearest_business_day = date_util.get_nearest_business_day(
					item.loan.requested_payment_date,
					preceeding = False
				)
				if nearest_business_day != item.loan.requested_payment_date:
					raise errors.Error("Please request a payment date that does not fall on a weekend or holiday")

				event = events.new(
					user_id=user_session.get_user_id(),
					company_id=company_id
				)

				loan = None
				if not item.loan.id:
					company.latest_loan_identifier += 1
					loan_identifier = company.latest_loan_identifier
					loan = models.Loan(
						company_id=company_id,
						loan_type=LoanTypeEnum.INVENTORY,
						status=upsert.status,
						artifact_id=item.artifact.id,
						origination_date=None,
						identifier=str(loan_identifier),
						amount=item.loan.amount,
						requested_payment_date=item.loan.requested_payment_date,
						requested_by_user_id=requested_by_user_id,
						requested_at=date_util.now()
					)
					session.add(loan)

					# We commit and refresh here so that the loan receives an ID
					session.flush()

					event.data(dict(loan.as_dict())) \
						.action(events.Actions.LOANS_CREATE_PURCHASE_ORDER_LOAN)
				else:
					loan = session.query(models.Loan).get(item.loan.id)
					loan.amount = item.loan.amount
					loan.requested_payment_date = item.loan.requested_payment_date
					event.data(dict(loan.as_dict()))\
						.action(events.Actions.LOANS_UPDATE_PURCHASE_ORDER_LOAN)

				loan_dicts.append(loan.as_dict())
				loan_events.append(event)
			
				purchase_orders_util.update_purchase_order_status(
					session = session,
					purchase_order_id = item.artifact.id,
					created_by_user_id = str(user.id),
					created_by_user_full_name = user.full_name,
					action_notes = f"{number_util.to_dollar_format(float(item.loan.amount))} financing requested",
				)

			if upsert.status == LoanStatusEnum.APPROVAL_REQUESTED:
				err = _handle_approval_email(
					session,
					customer_name,
					loan_dicts,
					requested_by_user_id=requested_by_user_id,
					triggered_by_autofinancing=False,
				)
				if err:
					raise err

		with models.session_scope(current_app.session_maker) as session:
			for event in loan_events:
				event.write_with_session(session)

		return make_response(json.dumps({
			"status": "OK",
			"msg": "Success"
		}), 200)


handler.add_url_rule(
	'/upsert', view_func=UpsertPurchaseOrdersLoansView.as_view(name="upsert")
)
