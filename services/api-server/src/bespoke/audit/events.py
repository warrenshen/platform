import json
import logging
from typing import Any, Callable, Dict, Optional

from bespoke.db import models
from flask import Response, current_app, request
from server.views.common import auth_util
from sqlalchemy.orm import Session


class Actions(object):
	UNKNOWN = 'unknown'

	CUSTOMER_CREATE = 'customer_create'

	CONTRACT_UPDATE = 'contract_update'
	CONTRACT_TERMINATE = 'contract_terminate'
	CONTRACT_CREATE = 'contract_create'
	CONTRACT_DELETE = 'contract_delete'

	FINANCE_CREATE_CREDIT_FOR_CUSTOMER = 'finance_create_credit_for_customer'
	FINANCE_DISBURSE_CREDIT_TO_CUSTOMER = 'finance_disburse_credit_to_customer'
	FINANCE_MAKE_ACCOUNT_LEVEL_FEE = 'finance_make_account_level_fee'
	FINANCE_MAKE_ACCOUNT_LEVEL_FEE_WAIVER = 'finance_make_account_level_fee_waiver'
	FINANCE_MAKE_ACCOUNT_LEVEL_FEE_REPAYMENT = 'finance_make_account_level_fee_repayment'
	FINANCE_MAKE_ACCOUNT_LEVEL_FEE_REPAYMENT_WITH_ACCOUNT_CREDIT = 'finance_make_account_level_fee_repayment_with_account_credit'
	FINANCE_SCHEDULE_ACCOUNT_LEVEL_FEE_REPAYMENT = 'finance_schedule_account_level_fee_repayment'
	FINANCE_SETTLE_ACCOUNT_LEVEL_FEE_REPAYMENT = 'finance_settle_account_level_fee_repayment'
	FINANCE_SETTLE_ACCOUNT_LEVEL_FEE_REPAYMENT_WITH_ACCOUNT_CREDIT = 'finance_settle_account_level_fee_repayment_with_account_credit'

	INVOICE_UPDATE = 'invoice_update'
	INVOICE_CREATE = 'invoice_create'
	INVOICE_DELETE = 'invoice_delete'
	INVOICE_SUBMIT_FOR_APPROVAL = 'invoice_submit_for_approval'
	INVOICE_RESPOND_TO_APPROVAL = 'invoice_respond_to_approval'
	INVOICE_SUBMIT_FOR_PAYMENT = 'invoice_submit_for_payment'
	INVOICE_RESPOND_TO_PAYMENT_REQUEST = 'invoice_respond_to_payment_request'

	PURCHASE_ORDER_CREATE_UPDATE = 'purchase_order_create_update'
	PURCHASE_ORDER_SUBMIT_FOR_APPROVAL = 'purchase_order_submit_for_approval'
	PURCHASE_ORDER_RESPOND_TO_APPROVAL = 'purchase_order_respond_to_approval'
	PURCHASE_ORDER_RESPOND_TO_INCOMPLETE = 'purchase_order_respond_to_incomplete'
	PURCHASE_ORDER_DELETE = 'purchase_order_delete'

	EBBA_APPLICATION_SUBMIT_FOR_APPROVAL = 'ebba_application_submit_for_approval'
	EBBA_APPLICATION_RESPOND_TO_APPROVAL = 'ebba_application_respond_to_approval'
	EBBA_APPLICATION_EXPIRE = 'ebba_application_expire'
	EBBA_APPLICATION_DELETE = 'ebba_application_delete'
	EBBA_APPLICATION_ADD = 'ebba_application_add'
	EBBA_APPLICATION_UPDATE = 'ebba_application_update'

	LOGIN_CREATE = 'login_create'

	LOANS_FUND_WITH_ADVANCE = 'loans_fund_with_advance'
	LOANS_SUBMIT_FOR_APPROVAL = 'loans_submit_for_approval'
	LOANS_APPROVE = 'loans_approve'
	LOANS_MAKE_ADJUSTMENT = 'loans_make_adjustment'
	LOANS_REJECT = 'loans_reject'
	LOANS_UPSERT_PURCHASE_ORDER_LOANS = 'loans_upsert_purchase_order_loans'
	LOANS_CREATE_PURCHASE_ORDER_LOAN = 'loans_create_purchase_order_loan'
	LOANS_UPDATE_PURCHASE_ORDER_LOAN = 'loans_update_purchase_order_loan'
	LOANS_CREATE_REPAYMENT = 'loans_create_repayment'
	LOANS_EDIT_REPAYMENT = 'loans_edit_repayment'
	LOANS_SCHEDULE_REPAYMENT = 'loans_schedule_repayment'
	LOANS_REVERSE_REPAYMENT = 'loans_reverse_repayment'
	LOANS_SETTLE_REPAYMENT = 'loans_settle_repayment'
	LOANS_UNDO_REPAYMENT = 'loans_undo_repayment'
	LOANS_DELETE_REPAYMENT = 'loans_delete_repayment'
	LOANS_DELETE_ADVANCE = 'loans_delete_advance'
	LOANS_DELETE_LOAN = 'loans_delete_loan'

	COMPANY_BALANCE_UPDATE = 'company_balance_update'

class Outcomes(object):
	UNKNOWN = 'unknown'
	SUCCESS = 'success'
	FAILURE = 'failure'

class Event:
	def __init__(self,
		user_id: Optional[str] = None,
		company_id: Optional[str] = None,
		is_system: Optional[bool] = False,
		action: str = Actions.UNKNOWN,
		outcome: str = Outcomes.UNKNOWN,
		error: Optional[str] = None,
		data: Optional[Dict] = None,
	) -> None:
		self._user_id = user_id
		self._company_id = company_id
		self._is_system = is_system
		self._action = action
		self._outcome = outcome
		self._error = error
		self._data = data
		self._written = False

	def user_id(self, user_id: str) -> 'Event':
		self._user_id = user_id
		return self

	def company_id(self, company_id: str) -> 'Event':
		self._company_id = company_id
		return self

	def is_system(self, is_system: bool) -> 'Event':
		self._is_system = is_system
		return self

	def action(self, action: str) -> 'Event':
		self._action = action
		return self

	def outcome(self, outcome: str) -> 'Event':
		self._outcome = outcome
		return self

	def data(self, data: Dict) -> 'Event':
		self._data = data
		return self

	def data_merge(self, data: Dict) -> 'Event':
		self._data.update(data)
		return self

	def set_succeeded(self) -> 'Event':
		self._outcome = Outcomes.SUCCESS
		return self

	def set_failed(self) -> 'Event':
		self._outcome = Outcomes.FAILURE
		return self

	def set_error(self, error: str) -> 'Event':
		self.set_failed()
		self._error = error
		return self

	def write_with_session(self, session: Session) -> None:
		if self._written:
			logging.warning(f"Attempt to write event for action '{self._action}' surpressed (err: already written)")
			return None
		try:
			session.add(models.AuditEvent( # type: ignore
				user_id=self._user_id if self._user_id else None, # to prevent '' from causing a bad hexadecimal insertion
				company_id=self._company_id if self._company_id else None, # to prevent '' from causing a bad hexadecimal insertion
				is_system=self._is_system,
				action=self._action,
				outcome=self._outcome,
				error=self._error,
				data=models.safe_serialize(self._data)
			))
		except:
			logging.exception('failed adding event to session')
		self._written = True

	def write(self) -> None:
		try:
			with models.session_scope(current_app.session_maker) as session:
				self.write_with_session(session)
		except:
			logging.exception('failed to construct a session and write an event')

def new(
	user_id: Optional[str] = None,
	company_id: Optional[str] = None,
	is_system: Optional[bool] = False,
	action: str = Actions.UNKNOWN,
	outcome: str = Outcomes.UNKNOWN,
	data: Optional[Dict] = None
) -> Event:
	return Event(
		user_id=user_id,
		company_id=company_id,
		is_system=is_system,
		action=action,
		outcome=outcome,
		data=data,
	)

def wrap(action: str) -> Callable:
	def wrapper(fn: Callable[..., Response]) -> Callable[..., Response]:
		def wrapped(*args: Any, **kwargs: Any) -> Response:
			user_session = auth_util.UserSession.from_session()
			data = json.loads(request.data)

			event = new(
				user_id=user_session.get_user_id(),
				company_id=user_session.get_company_id(),
				action=action,
				data={'request': data}
			)

			if user_session.is_bank_admin() and 'company_id' in data:
				event.company_id(data['company_id'])

			response = fn(*args, event=event, **kwargs)

			if 200 <= response.status_code < 300:
				response_data = json.loads(response.data)
				if response_data.get('status') != 'OK':
					event.set_error(response_data.get('msg'))
				else:
					event.set_succeeded()
			else:
				event.set_failed()

			event.write()
			return response

		return wrapped
	return wrapper
