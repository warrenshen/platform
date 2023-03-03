import datetime
import decimal
import os
from dataclasses import dataclass, fields
from webbrowser import get
from sqlalchemy.orm.session import Session
from typing import Callable, Dict, List, Optional, Tuple, cast
import uuid

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models, queries
from bespoke.db.db_constants import RequestStatusEnum, NewPurchaseOrderStatus, LoanStatusEnum, \
	PurchaseOrderBankNoteEnum, PurchaseOrderCustomerNoteEnum, PurchaseOrderActions
from bespoke.companies import partnership_util
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.purchase_orders import purchase_orders_util
from flask import current_app, request
from server.config import Config, is_test_env
from server.views.common.session_util import UserSession

@dataclass
class PurchaseOrderFileItem:
	purchase_order_id: str
	file_id: str
	file_type: str

	@staticmethod
	def from_dict(d: Dict) -> 'PurchaseOrderFileItem':
		return PurchaseOrderFileItem(
			purchase_order_id=d.get('purchase_order_id'),
			file_id=d.get('file_id'),
			file_type=d.get('file_type')
		)


@dataclass
class PurchaseOrderMetrcTransferItem:
	purchase_order_id: str
	metrc_transfer_id: str

	@staticmethod
	def from_dict(d: Dict) -> 'PurchaseOrderMetrcTransferItem':
		return PurchaseOrderMetrcTransferItem(
			purchase_order_id=d.get('purchase_order_id'),
			metrc_transfer_id=d.get('metrc_transfer_id'),
		)


@dataclass
class PurchaseOrderData:
	id: str
	company_id: str
	vendor_id: str
	order_number: str
	order_date: datetime.date
	delivery_date: datetime.date
	net_terms: int
	amount: float
	is_cannabis: bool
	is_metrc_based: bool
	customer_note: str

	def to_model(self) -> models.PurchaseOrder:
		return models.PurchaseOrder( # type: ignore
			id=self.id,
			company_id=self.company_id,
			vendor_id=self.vendor_id,
			order_number=self.order_number,
			order_date=self.order_date,
			delivery_date=self.delivery_date,
			net_terms=self.net_terms,
			amount=decimal.Decimal(self.amount) if self.amount is not None else None,
			is_cannabis=self.is_cannabis,
			is_metrc_based=self.is_metrc_based,
			customer_note=self.customer_note,
			status=db_constants.RequestStatusEnum.DRAFTED,
			new_purchase_order_status=db_constants.NewPurchaseOrderStatus.DRAFT,
		)

	@staticmethod
	def from_dict(d: Dict) -> Tuple['PurchaseOrderData', errors.Error]:
		if not d:
			return None, errors.Error('cannot instantiate PurchaseOrderData from nothing')

		order_date = d.get('order_date')
		if order_date:
			try:
				order_date = date_util.load_date_str(order_date)
			except:
				return None, errors.Error('invalid order_date')

		delivery_date = d.get('delivery_date')
		if delivery_date:
			try:
				delivery_date = date_util.load_date_str(delivery_date)
			except:
				return None, errors.Error('invalid delivery_date')

		return PurchaseOrderData(
			id=d.get('id'),
			company_id=d.get('company_id'),
			vendor_id=d.get('vendor_id'),
			order_number=d.get('order_number'),
			order_date=PurchaseOrderData.parse_date_safely(d, 'order_date'),
			delivery_date=PurchaseOrderData.parse_date_safely(d, 'delivery_date'),
			net_terms=d.get('net_terms'),
			amount=PurchaseOrderData.parse_numeric_safely(d, 'amount'),
			is_cannabis=d.get('is_cannabis'),
			is_metrc_based=d.get('is_metrc_based'),
			customer_note=d.get('customer_note'),
		), None

	@staticmethod
	def parse_date_safely(obj: Dict, key: str) -> Optional[datetime.date]:
		value = obj.get(key)
		if value:
			return date_util.load_date_str(value)
		return None

	@staticmethod
	def parse_numeric_safely(obj: Dict, key: str) -> Optional[float]:
		value = obj.get(key)
		if value or value == 0:
			return float(value)
		return None


@dataclass
class PurchaseOrderUpsertRequest:
	purchase_order: PurchaseOrderData
	purchase_order_files: List[PurchaseOrderFileItem]
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem]

	@staticmethod
	def from_dict(d: Dict) -> Tuple['PurchaseOrderUpsertRequest', errors.Error]:
		data, err = PurchaseOrderData.from_dict(d.get('purchase_order'))
		if err:
			return None, err

		return PurchaseOrderUpsertRequest(
			purchase_order=data,
			purchase_order_files=[PurchaseOrderFileItem.from_dict(item) for item in d.get('purchase_order_files', [])],
			purchase_order_metrc_transfers=[PurchaseOrderMetrcTransferItem.from_dict(item) for item in d.get('purchase_order_metrc_transfers', [])]
		), None

@dataclass
class PurchaseOrderUpsertRequestNew:
	purchase_order: PurchaseOrderData
	purchase_order_files: List[PurchaseOrderFileItem]
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem]

	@staticmethod
	def from_dict(d: Dict) -> Tuple['PurchaseOrderUpsertRequest', errors.Error]:
		data, err = PurchaseOrderData.from_dict(d.get('purchase_order'))
		if err:
			return None, err

		return PurchaseOrderUpsertRequest(
			purchase_order=data,
			purchase_order_files=[PurchaseOrderFileItem.from_dict(item) for item in d.get('purchase_order_files', [])],
			purchase_order_metrc_transfers=[PurchaseOrderMetrcTransferItem.from_dict(item) for item in d.get('purchase_order_metrc_transfers', [])]
		), None

def _check_for_duplicate_purchase_order(
	request: PurchaseOrderUpsertRequest,
	session: Session
) -> errors.Error:
	duplicate_purchase_order = cast(
		models.PurchaseOrder,
		session.query(models.PurchaseOrder).filter(
			cast(Callable, models.PurchaseOrder.is_deleted.isnot)(True)
		).filter(
			models.PurchaseOrder.vendor_id == request.purchase_order.vendor_id
		).filter(
			models.PurchaseOrder.order_number == request.purchase_order.order_number
		).first())

	if duplicate_purchase_order is not None:
		return errors.Error(f'A purchase order with this vendor and PO number already exists')

	return None


@errors.return_error_tuple
def submit_purchase_order_for_approval(
	session: Session,
	purchase_order_id: str,
	user_id: str,
	user_full_name: str
) -> Tuple[models.PurchaseOrder, List[partnership_util.ContactDict], bool, errors.Error]:
	is_vendor_missing_bank_account = False

	purchase_order = cast(
		models.PurchaseOrder,
		session.query(models.PurchaseOrder).get(purchase_order_id)
	)

	vendor = purchase_order.vendor
	customer = purchase_order.company

	# Validation 1: validations for all POs.
	if not vendor:
		return None, None, None, errors.Error('Vendor is required')

	if not purchase_order:
		return None, None, None, errors.Error('Could not find purchase order')

	if not purchase_order.order_number:
		return None, None, None, errors.Error('Order number is required')

	if not purchase_order.order_date:
		return None, None, None, errors.Error('Order date is required')

	if purchase_order.net_terms == None:
		return None, None, None, errors.Error('Net terms is required')

	if purchase_order.amount is None or purchase_order.amount <= 0:
		return None, None, None, errors.Error('Valid amount is required')

	company_vendor_relationship = cast(
		models.CompanyVendorPartnership,
		session.query(models.CompanyVendorPartnership).filter_by(
			company_id=customer.id,
			vendor_id=vendor.id,
		).first())

	purchase_order_files = cast(
		List[models.PurchaseOrderFile],
		session.query(
			models.PurchaseOrderFile
		).filter_by(
			purchase_order_id=purchase_order.id,
			file_type=db_constants.PurchaseOrderFileTypeEnum.PURCHASE_ORDER,
		).all())

	if not purchase_order_files:
		return None, None, None, errors.Error('Purchase order file attachment(s) are required')

	if not company_vendor_relationship or company_vendor_relationship.approved_at is None:
		return None, None, None, errors.Error('Vendor is not approved')

	if not company_vendor_relationship.vendor_bank_id:
		is_vendor_missing_bank_account = True
		
	vendor_users, err = partnership_util.get_partner_contacts(
		partnership_id=str(company_vendor_relationship.id),
		partnership_type=db_constants.CompanyType.Vendor,
		session=session
	)
	if err:
		return None, None, None, err
		
	if not vendor_users:
		return None, None, None, errors.Error('There are no users configured for this vendor')

	# Validation 2: validations for POs of which purchase_orders.is_metrc_based is True.
	if purchase_order.is_metrc_based:
		purchase_order_metrc_transfers = cast(
			List[models.PurchaseOrderMetrcTransfer],
			session.query(
				models.PurchaseOrderMetrcTransfer
			).filter_by(
				purchase_order_id=purchase_order.id
			).all())

		if len(purchase_order_metrc_transfers) <= 0:
			return None, None, None, errors.Error('Purchase order Metrc manifest is required')

		# TODO(warrenshen): separate validations based on whether
		# metrc_transfer.lab_results_status is equal to "passed" or not.

	# Validation 3: validations for POs of which purchase_orders.is_metrc_based is False.
	if not purchase_order.is_metrc_based:
		if purchase_order.is_cannabis:
			purchase_order_cannabis_files = cast(
				List[models.PurchaseOrderFile],
				session.query(
					models.PurchaseOrderFile
				).filter_by(
					purchase_order_id=purchase_order.id,
					file_type=db_constants.PurchaseOrderFileTypeEnum.CANNABIS,
				).all())

			if len(purchase_order_cannabis_files) <= 0:
				return None, None, None, errors.Error('Purchase order cannabis file attachment(s) are required')

	purchase_order.status = RequestStatusEnum.APPROVAL_REQUESTED
	purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR
	purchase_order.requested_at = date_util.now()
	purchase_order.incompleted_at = None
	purchase_order.history.append(get_purchase_order_history_event(
		action = "PO submitted to vendor",
		new_purchase_order_status = NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR,
		created_by_user_id = user_id,
		created_by_user_full_name = user_full_name
	))

	sendgrid_client = cast(
		sendgrid_util.Client,
		current_app.sendgrid_client,
	)

	form_info = cast(Callable, models.TwoFactorFormInfoDict)(
		type=db_constants.TwoFactorLinkType.CONFIRM_PURCHASE_ORDER,
		payload={
			'purchase_order_id': purchase_order_id
		}
	)
	two_factor_payload = sendgrid_util.TwoFactorPayloadDict(
		form_info=form_info,
		expires_at=date_util.hours_from_today(24 * 14)
	)

	# Send the email to the vendor for them to approve or reject this purchase order
	# Get the vendor_id and find its users
	template_data = {
		'vendor_name': vendor.get_display_name(),
		'customer_name': customer.get_display_name(),
	}
	_, err = sendgrid_client.send(
		template_name=sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER_NEW,
		template_data=template_data,
		recipients=[user['email'] for user in vendor_users],
		two_factor_payload=two_factor_payload,
	)
	if err:
		raise err

	# If vendor does NOT have a bank account set up yet,
	# send an email to the Bespoke team letting them know about this.
	if is_vendor_missing_bank_account:
		template_data = {
			'vendor_name': vendor.get_display_name(),
			'customer_name': customer.get_display_name(),
		}
		_, err = sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT,
			template_data=template_data,
			recipients=(
				["user@customer.com"]
				if is_test_env(os.environ.get("FLASK_ENV"))
				else current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES
			) + current_app.app_config.OPS_EMAIL_ADDRESSES,
		)
		if err:
			raise err

	return purchase_order, vendor_users, is_vendor_missing_bank_account, None

# Only used post PO approval to reconcile loan statuses with new PO status
@errors.return_error_tuple
def update_purchase_order_status(
	session: Session,
	purchase_order_id: str,
	created_by_user_id: str,
	created_by_user_full_name: str,
	is_financing_request_delete: bool = False,
	is_financing_request_partially_funded: bool = False,
	action_notes: str = None,
) -> Tuple[bool, errors.Error]:
	purchase_order = cast(
		models.PurchaseOrder,
		session.query(models.PurchaseOrder).get(purchase_order_id)
	)

	if action_notes:
		purchase_order.all_customer_notes["status_notes"] = action_notes

	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.artifact_id == str(purchase_order_id)
		).filter(
			# models.Loan.is_deleted == None
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).all()
	)

	# Loan Statuses => Purchase Order
	# APPROVED + APPROVED => FINANCING_REQUEST_APPROVED
	# APPROVAL_REQUESTED + APPROVED => FINANCING_PENDING_APPROVAL
	# FUNDED (partial), no other loans => READY_TO_REQUEST_FINANCING
	# FUNDED (partial), other loans (follows above logic) => FINANCING_REQUEST_APPROVED or FINANCING_PENDING_APPROVAL
	# FUNDED (fully) => ARCHIVED
	amount_funded = float(purchase_order.amount_funded) if purchase_order.amount_funded else float(0)
	all_loan_statuses = set([loan.status for loan in loans if loan.funded_at is None])

	if is_financing_request_delete:
		action = "PO financing request deleted"
	elif is_financing_request_partially_funded:
		action = "PO partially funded"
	else:
		action = None

	if number_util.float_eq(amount_funded, float(purchase_order.amount)):
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.ARCHIVED
		purchase_order.history.append(purchase_orders_util.get_purchase_order_history_event(
			action = "PO archived",
			new_purchase_order_status = NewPurchaseOrderStatus.ARCHIVED,
			created_by_user_id = created_by_user_id,
			created_by_user_full_name = created_by_user_full_name,
			action_notes = action_notes,
		))
		return True, None
	elif LoanStatusEnum.APPROVED in all_loan_statuses and LoanStatusEnum.APPROVAL_REQUESTED not in all_loan_statuses:
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED
		purchase_order.history.append(purchase_orders_util.get_purchase_order_history_event(
			action = action if action else "PO financing request approved",
			new_purchase_order_status = NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED,
			created_by_user_id = created_by_user_id,
			created_by_user_full_name = created_by_user_full_name,
			action_notes = action_notes,
		))
		return True, None
	elif LoanStatusEnum.APPROVAL_REQUESTED in all_loan_statuses:
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL
		purchase_order.history.append(purchase_orders_util.get_purchase_order_history_event(
			action = action if is_financing_request_delete else "PO financing request created",
			new_purchase_order_status = NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL,
			created_by_user_id = created_by_user_id,
			created_by_user_full_name = created_by_user_full_name,
			action_notes = action_notes
		))
		return True, None
	elif len(all_loan_statuses) == 0 or purchase_order.amount_funded and purchase_order.amount_funded > 0:
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
		purchase_order.history.append(purchase_orders_util.get_purchase_order_history_event(
			action = action,
			new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING,
			created_by_user_id = created_by_user_id,
			created_by_user_full_name = created_by_user_full_name,
			action_notes = action_notes,
		))
		return True, None

	else:
		return None, errors.Error("Could not update status for purchase_order_id: " + purchase_order_id)

def approve_purchase_order(
	session: Session,
	purchase_order_id: str,
	approved_by_user_id: str,
	approved_by_user_full_name: str,
	is_bank_admin: bool,
) -> Tuple[ models.PurchaseOrder, errors.Error ]:
	purchase_order, err = queries.get_purchase_order_by_id(
		session,
		purchase_order_id,
	)
	if err:
		return None, err

	purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
	purchase_order.status = RequestStatusEnum.APPROVED
	purchase_order.approved_at = date_util.now()
	purchase_order.approved_by_user_id = approved_by_user_id # type: ignore
	purchase_order.history.append(
		models.PurchaseOrderHistoryDict(
			id = str(uuid.uuid4()),
			date_time = date_util.datetime_to_str(date_util.now()),
			action = "PO approved",
			new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING,
			created_by_user_id = approved_by_user_id,
			created_by_user_full_name = approved_by_user_full_name,
			action_notes = None,
		)
	)

	return purchase_order, None

def reject_purchase_order(
	session: Session,
	purchase_order_id: str,
	rejected_by_user_id: str,
	rejected_by_user_full_name: str,
	rejection_note: str,
	is_bank_admin: bool,
) -> Tuple[ models.PurchaseOrder, errors.Error ]:
	purchase_order, err = queries.get_purchase_order_by_id(
		session,
		purchase_order_id,
	)
	if err:
		return None, err

	purchase_order.rejected_at = date_util.now()
	purchase_order.rejected_by_user_id = rejected_by_user_id # type: ignore
	action = "PO rejected"

	loans, err = reject_loans_by_artifact_id(
		session=session,
		artifact_id=purchase_order_id,
		rejected_by_user_id=rejected_by_user_id,
		rejection_note=rejection_note,
	)
	if err:
		return None, err
	if loans:
		action = f"PO rejected, {len(loans)} financing requests rejected"
	
	purchase_order.all_customer_notes["status_notes"] = rejection_note

	if is_bank_admin:
		purchase_order.all_bank_notes[PurchaseOrderBankNoteEnum.BANK_REJECTION] = rejection_note
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.REJECTED_BY_BESPOKE
		purchase_order.history.append(
			models.PurchaseOrderHistoryDict(
				id = str(uuid.uuid4()),
				date_time = date_util.datetime_to_str(date_util.now()),
				action = action,
				new_purchase_order_status = NewPurchaseOrderStatus.REJECTED_BY_BESPOKE,
				created_by_user_id = rejected_by_user_id,
				created_by_user_full_name = rejected_by_user_full_name,
				action_notes = rejection_note,
			)
		)
	else:
		purchase_order.all_customer_notes[PurchaseOrderCustomerNoteEnum.VENDOR_REJECTION] = rejection_note
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.REJECTED_BY_VENDOR
		purchase_order.history.append(
			models.PurchaseOrderHistoryDict(
				id = str(uuid.uuid4()),
				date_time = date_util.datetime_to_str(date_util.now()),
				action = action,
				new_purchase_order_status = NewPurchaseOrderStatus.REJECTED_BY_VENDOR,
				created_by_user_id = rejected_by_user_id,
				created_by_user_full_name = rejected_by_user_full_name,
				action_notes = rejection_note,
			)
		)

	return purchase_order, None

def request_purchase_order_changes(
	session: Session,
	purchase_order_id: str,
	requested_by_user_id: str,
	requested_by_user_full_name: str,
	requested_changes_note: str,
	is_bank_admin: bool,
	is_vendor_approval_required: bool = False,
) -> Tuple[ models.PurchaseOrder, errors.Error ]:
	purchase_order, err = queries.get_purchase_order_by_id(
		session,
		purchase_order_id,
	)
	if err:
		return None, err
	action = "PO changes requested"

	should_delete_loans = (not is_bank_admin or is_vendor_approval_required)
	loans, err = reject_loans_by_artifact_id(
		session=session,
		artifact_id=purchase_order_id,
		rejected_by_user_id=requested_by_user_id,
		rejection_note=requested_changes_note,
		delete_loans=should_delete_loans
	)
	if err:
		return None, err
	if loans and should_delete_loans:
		action = f"PO changes requested requiring vendor approval, {len(loans)} financing requests rejected"
	
	purchase_order.all_customer_notes["status_notes"] = requested_changes_note

	if not is_vendor_approval_required:
		purchase_order.all_bank_notes[PurchaseOrderBankNoteEnum.REQUESTS_CHANGES] = requested_changes_note
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_BESPOKE
		purchase_order.history.append(
			models.PurchaseOrderHistoryDict(
				id = str(uuid.uuid4()),
				date_time = date_util.datetime_to_str(date_util.now()),
				action = action,
				new_purchase_order_status = NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_BESPOKE,
				created_by_user_id = requested_by_user_id,
				created_by_user_full_name = requested_by_user_full_name,
				action_notes = requested_changes_note,
			)
		)
	else:
		purchase_order.all_customer_notes[PurchaseOrderCustomerNoteEnum.VENDOR_REQUESTS_CHANGES] = requested_changes_note
		purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_VENDOR
		purchase_order.history.append(
			models.PurchaseOrderHistoryDict(
				id = str(uuid.uuid4()),
				date_time = date_util.datetime_to_str(date_util.now()),
				action = action,
				new_purchase_order_status = NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_VENDOR,
				created_by_user_id = requested_by_user_id,
				created_by_user_full_name = requested_by_user_full_name,
				action_notes = requested_changes_note,
			)
		)

	return purchase_order, None


def get_purchase_order_history_event(
	action: str,
	new_purchase_order_status: str,
	created_by_user_id: str,
	created_by_user_full_name: str,
	action_notes: str = None,
) -> models.PurchaseOrderHistoryDict:
	return models.PurchaseOrderHistoryDict(
		id = str(uuid.uuid4()),
		date_time = date_util.datetime_to_str(date_util.now()),
		action = action,
		new_purchase_order_status = new_purchase_order_status,
		created_by_user_id = created_by_user_id,
		created_by_user_full_name = created_by_user_full_name,
		action_notes = action_notes,
	)

def validate_purchase_order_input(
	session: Session,
	purchase_order_input: models.PurchaseOrder,
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem],
	check_for_duplicate: bool,
) -> Tuple[bool, errors.Error]:
	if not purchase_order_input.company_id:
		return False, errors.Error('Company is required')

	if not purchase_order_input.vendor_id:
		return False, errors.Error('Vendor is required')

	if not purchase_order_input.order_number:
		return False, errors.Error('Order number is required')

	if not purchase_order_input.is_metrc_based and len(purchase_order_metrc_transfers) > 0:
		return False, errors.Error('Metrc transfers not allowed if purchase order is not Metrc based')

	if check_for_duplicate:
		duplicate_purchase_order, _ = queries.get_purchase_order(
			session,
			str(purchase_order_input.vendor_id),
			purchase_order_input.order_number,
		)
		if duplicate_purchase_order is not None:
			return False, errors.Error(f'A purchase order with this vendor and PO number already exists')

	return True, None

def validate_purchase_order_input_submission_checks(
	session: Session,
	purchase_order_input: models.PurchaseOrder,
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem],
) -> Tuple[bool, errors.Error]:
	"""
		The only data we need to return from this validation check is
		whether or not the company vendor relationship has properly
		set the `vendor_bank_id` field. While we normally use bool in
		the Tuple return to represent success/failure, here it is
		slightly different in intent. This value should only be consumed
		by the submission flow, as the draft flow will not check for
		the appropriate values
	"""
	is_vendor_missing_bank_account = False

	# Check additional fields in the purchase order
	if not purchase_order_input.order_date:
		return False, errors.Error('Order date is required')

	if purchase_order_input.net_terms is None:
		return False, errors.Error('Net terms is required')

	if purchase_order_input.amount is None or purchase_order_input.amount <= 0:
		return False, errors.Error('Valid amount is required')

	# Check the company vendor partnership
	company_vendor_relationships, _ = queries.get_company_vendor_partnerships(
		session,
		[(
			str(purchase_order_input.company_id),
			str(purchase_order_input.vendor_id),
		)]
	)

	if len(company_vendor_relationships) == 0:
		vendor, err = queries.get_company_by_id(session, str(purchase_order_input.vendor_id))
		if err:
			return False, errors.Error(f'Partnership with vendor_id: {purchase_order_input.vendor_id} is not configured')
		return False, errors.Error(f'Partnership with vendor: {vendor.name} is not configured')

	company_vendor_relationship = company_vendor_relationships[0]

	if not company_vendor_relationship or company_vendor_relationship.approved_at is None:
		return False, errors.Error('Vendor is not approved')

	if not company_vendor_relationship.vendor_bank_id:
		is_vendor_missing_bank_account = True

	# Check for purchase order files
	purchase_order_files, _ = queries.get_purchase_order_files(
		session,
		purchase_order_id = str(purchase_order_input.id),
		file_type = db_constants.PurchaseOrderFileTypeEnum.PURCHASE_ORDER
	)
	if not purchase_order_files:
		return False, errors.Error('Purchase order file attachment(s) are required')

	# Check that at least one user is configured for the vendor in question
	vendor_users, err = partnership_util.get_partner_contacts(
		partnership_id = str(company_vendor_relationship.id),
		partnership_type = db_constants.CompanyType.Vendor,
		session = session
	)
	if err:
		return False, err

	# Metrc Validation: validations for POs of which purchase_orders.is_metrc_based is True.
	if purchase_order_input.is_metrc_based:
		purchase_order_metrc_transfers_for_length_check = cast(
			List[models.PurchaseOrderMetrcTransfer],
			session.query(models.PurchaseOrderMetrcTransfer).filter(
				models.PurchaseOrderMetrcTransfer.purchase_order_id == purchase_order_input.id
			).all())

		if len(purchase_order_metrc_transfers_for_length_check) <= 0:
			return False, errors.Error('Purchase order Metrc manifest is required')

		# TODO(warrenshen): separate validations based on whether
		# metrc_transfer.lab_results_status is equal to "passed" or not.

	# Non-Metric Cannabis Validation: validations for POs of which purchase_orders.is_metrc_based is False.
	if not purchase_order_input.is_metrc_based:
		if purchase_order_input.is_cannabis:
			purchase_order_cannabis_files, _ = queries.get_purchase_order_files(
				session,
				purchase_order_id = str(purchase_order_input.id),
				file_type = db_constants.PurchaseOrderFileTypeEnum.CANNABIS
			)

			if len(purchase_order_cannabis_files) <= 0:
				return False, errors.Error('Purchase order cannabis file attachment(s) are required')

	return is_vendor_missing_bank_account, None

def update_purchase_order_files(
	session: Session,
	purchase_order_id: str,
	purchase_order_files: List[PurchaseOrderFileItem]
) -> Tuple[bool, int, int, errors.Error]:
	existing_purchase_order_files, err = queries.get_purchase_order_files(
		session,
		purchase_order_id = purchase_order_id,
	)
	if err:
		return False, None, None, err

	purchase_order_files_to_delete = []
	for existing_purchase_order_file in existing_purchase_order_files:
		is_purchase_order_file_deleted = len(list(filter(
			lambda purchase_order_file_request: (
				purchase_order_file_request.purchase_order_id == str(existing_purchase_order_file.purchase_order_id) and
				purchase_order_file_request.file_id == str(existing_purchase_order_file.file_id) and
				purchase_order_file_request.file_type == existing_purchase_order_file.file_type
			),
			purchase_order_files
		))) <= 0
		if is_purchase_order_file_deleted:
			purchase_order_files_to_delete.append(existing_purchase_order_file)

	for purchase_order_file_to_delete in purchase_order_files_to_delete:
		cast(Callable, session.delete)(purchase_order_file_to_delete)

	purchase_order_file_dicts = []
	num_files_added = 0
	for purchase_order_file_request in purchase_order_files:
		existing_purchase_order_file = cast(
			models.PurchaseOrderFile,
			session.query(models.PurchaseOrderFile).get([
				purchase_order_file_request.purchase_order_id,
				purchase_order_file_request.file_id,
			]))
		if existing_purchase_order_file:
			purchase_order_file_dicts.append(existing_purchase_order_file.as_dict())
		else:
			new_purchase_order_file = models.PurchaseOrderFile( # type: ignore
				purchase_order_id=purchase_order_id,
				file_id=purchase_order_file_request.file_id,
				file_type=purchase_order_file_request.file_type,
			)
			session.add(new_purchase_order_file)
			purchase_order_file_dicts.append(new_purchase_order_file.as_dict())
			num_files_added += 1

	return True, len(purchase_order_files_to_delete), num_files_added,  None


def update_purchase_order_metrc_transfers(
	session: Session,
	purchase_order_id: str,
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem],
) -> Tuple[bool, int, int, errors.Error]:
	# Purchase order Metrc transfers
	existing_purchase_order_metrc_transfers, err = queries.get_purchase_order_metrc_transfers(
		session,
		purchase_order_id,
	)
	if err:
		return None, None, None, err

	purchase_order_metrc_transfers_to_delete = []
	for existing_purchase_order_metrc_transfer in existing_purchase_order_metrc_transfers:
		is_purchase_order_metrc_transfer_deleted = len(list(filter(
			lambda purchase_order_metrc_transfer_request: (
				purchase_order_metrc_transfer_request.purchase_order_id == str(existing_purchase_order_metrc_transfer.purchase_order_id) and
				purchase_order_metrc_transfer_request.metrc_transfer_id == str(existing_purchase_order_metrc_transfer.metrc_transfer_id)
			),
			purchase_order_metrc_transfers
		))) <= 0
		if is_purchase_order_metrc_transfer_deleted:
			purchase_order_metrc_transfers_to_delete.append(existing_purchase_order_metrc_transfer)
	
	for purchase_order_metrc_transfer_to_delete in purchase_order_metrc_transfers_to_delete:
		cast(Callable, session.delete)(purchase_order_metrc_transfer_to_delete)

	session.flush()

	purchase_order_metrc_transfer_dicts = []
	num_files_added = 0
	for purchase_order_metrc_transfer_request in purchase_order_metrc_transfers:
		existing_purchase_order_metrc_transfer = cast(
			models.PurchaseOrderMetrcTransfer,
			session.query(models.PurchaseOrderMetrcTransfer).get([
				purchase_order_metrc_transfer_request.purchase_order_id,
				purchase_order_metrc_transfer_request.metrc_transfer_id,
			]))
		if existing_purchase_order_metrc_transfer:
			purchase_order_metrc_transfer_dicts.append(existing_purchase_order_metrc_transfer.as_dict())
		else:
			new_purchase_order_metrc_transfer = models.PurchaseOrderMetrcTransfer( # type: ignore
				purchase_order_id=purchase_order_id,
				metrc_transfer_id=purchase_order_metrc_transfer_request.metrc_transfer_id,
			)
			session.add(new_purchase_order_metrc_transfer)
			purchase_order_metrc_transfer_dicts.append(new_purchase_order_metrc_transfer.as_dict())
			num_files_added += 1

	return True, len(purchase_order_metrc_transfers_to_delete), num_files_added, None

def update_purchase_order_history(
	purchase_order: models.PurchaseOrder,
	user_id: str,
	user_full_name: str,
	action: str,
	new_status: str,
	action_notes: str = None,
) -> Tuple[ bool, errors.Error ]:
	if purchase_order.history is None:
		purchase_order_creation_event = get_purchase_order_history_event(
			action = "PO created",
			new_purchase_order_status = None,
			created_by_user_id = user_id,
			created_by_user_full_name = user_full_name
		)
	
		purchase_order.history = [purchase_order_creation_event] 
	
	purchase_order.history.append(
		get_purchase_order_history_event(
			action = action,
			new_purchase_order_status = new_status,
			created_by_user_id = user_id,
			created_by_user_full_name = user_full_name,
			action_notes = action_notes
		)
	)
	
	return True, None

def get_fields_changed(
	existing_purchase_order: models.PurchaseOrder,
	purchase_order_input: models.PurchaseOrder,
) -> List[str]:
	fields_changed = []
	if existing_purchase_order.order_number != purchase_order_input.order_number:
		fields_changed.append("Order Number")
	if existing_purchase_order.order_date != purchase_order_input.order_date:
		fields_changed.append("Order Date")
	if existing_purchase_order.delivery_date != purchase_order_input.delivery_date:
		fields_changed.append("Delivery Date")
	if existing_purchase_order.net_terms != purchase_order_input.net_terms:
		fields_changed.append("Net Terms")
	if existing_purchase_order.amount != purchase_order_input.amount:
		fields_changed.append("Amount")
	if existing_purchase_order.amount_funded != purchase_order_input.amount_funded:
		fields_changed.append("Amount Funded")
	if existing_purchase_order.is_cannabis != purchase_order_input.is_cannabis:
		fields_changed.append("Is Cannabis")
	if existing_purchase_order.customer_note != purchase_order_input.customer_note:
		fields_changed.append("Customer Note")
	if str(existing_purchase_order.vendor_id) != purchase_order_input.vendor_id:
		fields_changed.append("Vendor Id")
	return fields_changed
	
def update_purchase_order_fields(
	existing_purchase_order: models.PurchaseOrder,
	purchase_order_input: models.PurchaseOrder,
) -> models.PurchaseOrder:
	existing_purchase_order.order_number = purchase_order_input.order_number
	existing_purchase_order.order_date = purchase_order_input.order_date
	existing_purchase_order.delivery_date = purchase_order_input.delivery_date
	existing_purchase_order.net_terms = purchase_order_input.net_terms
	existing_purchase_order.amount = purchase_order_input.amount
	existing_purchase_order.amount_funded = purchase_order_input.amount_funded
	existing_purchase_order.is_cannabis = purchase_order_input.is_cannabis
	existing_purchase_order.customer_note = purchase_order_input.customer_note
	existing_purchase_order.vendor_id = purchase_order_input.vendor_id
	
	return existing_purchase_order

def update_purchase_order(
	session: Session,
	purchase_order_input: models.PurchaseOrder,
	purchase_order_files: List[PurchaseOrderFileItem],
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem],
	user_session: UserSession,
	is_new_purchase_order: bool,
	action: str,
) -> Tuple[Dict, errors.Error]:
	# Validate input
	_, err = validate_purchase_order_input(
		session,
		purchase_order_input,
		purchase_order_metrc_transfers,
		check_for_duplicate = is_new_purchase_order,
	)
	if err:
		return None, err

	action_notes = ""

	if is_new_purchase_order:
		did_amount_change = True
		
		purchase_order = purchase_order_input
		session.add(purchase_order)
		session.flush()
	else:
		purchase_order, _ = queries.get_purchase_order_by_id(
			session,
			str(purchase_order_input.id)
		)
		if purchase_order is None:
			return None, errors.Error("Cannot update purchase order, no matches with the provided id were found.")

		did_amount_change = not number_util.float_eq(
			float(purchase_order_input.amount or 0), 
			float(purchase_order.amount or 0)
		) or \
			purchase_order.approved_at is None
		
		fields_changed = get_fields_changed(
			purchase_order,
			purchase_order_input
		)

		action_notes = "Edited: " if len(fields_changed) > 0 else ""
		for field in fields_changed:
			action_notes += f"{field}, "

		purchase_order = update_purchase_order_fields(
			purchase_order,
			purchase_order_input
		)

	# Purchase order files
	_, num_files_deleted, num_files_added, err = update_purchase_order_files(
		session,
		purchase_order.id,
		purchase_order_files,
	)
	if err:
		return None, err

	# Purchase order metrc transfers
	_, num_metrc_transfers_deleted, num_metrc_transfers_added, err = update_purchase_order_metrc_transfers(
		session,
		purchase_order.id,
		purchase_order_metrc_transfers,
	)
	if err:
		return None, err
	
	if not is_new_purchase_order:
		if num_files_deleted > 0:
			action_notes += f"Deleted {num_files_deleted} purchase order file(s), "
		if num_files_added > 0:
			action_notes += f"Added {num_files_added} purchase order file(s), "
		if num_metrc_transfers_deleted > 0:
			action_notes += f"Deleted {num_metrc_transfers_deleted} purchase order metrc transfer(s), "
		if num_metrc_transfers_added > 0:
			action_notes += f"Added {num_metrc_transfers_added} purchase order metrc transfer(s), "

	action_notes = action_notes.strip(", ")

	# Update purchase order's history
	submitting_user, err = queries.get_user_by_id(
		session,
		user_session.get_user_id()
	)
	if err:
		return None, err

	purchase_order.is_metrc_based = purchase_order_input.is_metrc_based

	if action == PurchaseOrderActions.SUBMIT:
		purchase_order.requested_at = date_util.now()
		action_label = ""
		status_notes = ""
		# If PO was already approved and a bespoke user required minor changes (i.e. incorrect date)
		# we want to set status back to ready_to_request_financing after customer edits
		if purchase_order.new_purchase_order_status == NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_BESPOKE and \
			purchase_order.approved_at is not None and \
			not user_session.is_bank_admin() and \
			not did_amount_change:
			purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING
			action_label = "PO ready to request financing"
			status_notes = f"Customer updated PO as requested by Bespoke User: {action_notes}"
		# If Bank User made a minor edit to a PO on behalf of the customer, preserve the status
		elif user_session.is_bank_admin() and (not did_amount_change):
			action_label = "Bank user made minor edit to PO"
			status_notes = f"Bank user edited PO on {date_util.human_readable_yearmonthday(date_util.now())}"
		# Customer submitted/edited PO and amount changed -> resend to vendor
		else:
			purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR
			action_label = "Submitted PO to vendor for approval"
			status_notes = f"Sent to vendor on {date_util.human_readable_yearmonthday(date_util.now())}"
		if purchase_order.all_customer_notes:
			purchase_order.all_customer_notes["status_notes"] = status_notes
		else:
			purchase_order.all_customer_notes = {
				"status_notes": status_notes
			}

		reactivate_loans_by_artifact_id(
			session = session, 
			artifact_id = purchase_order.id
		)

		# Run pre-submission validation checks
		is_vendor_missing_bank_account, err = validate_purchase_order_input_submission_checks(
			session,
			purchase_order,
			purchase_order_metrc_transfers,
		)
		if err:
			return None, err

		_, err = update_purchase_order_history(
			purchase_order,
			str(submitting_user.id),
			submitting_user.full_name,
			action_label,
			purchase_order.new_purchase_order_status,
			action_notes = action_notes
		)
		if err:
			return None, err
	else:
		if user_session.is_company_admin():
			purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.DRAFT

		_, err = update_purchase_order_history(
			purchase_order,
			str(submitting_user.id),
			submitting_user.full_name,
			"PO saved as draft",
			NewPurchaseOrderStatus.DRAFT if user_session.is_company_admin() else purchase_order.new_purchase_order_status,
			action_notes = action_notes
		)
		if err:
			return None, err
	
	# Gather information for email template
	customer, err = queries.get_company_by_id(
		session,
		str(purchase_order.company_id),
	)
	if err:
		return None, err

	vendor, err = queries.get_company_by_id(
		session,
		str(purchase_order.vendor_id),
	)
	if err:
		return None, err

	template_data = {
		'customer_name': customer.get_display_name(),
		'vendor_name': vendor.get_display_name(),
		'purchase_order_number': purchase_order.order_number,
		'purchase_order_amount': number_util.to_dollar_format(float(purchase_order.amount)) if purchase_order.amount else None,
		'is_vendor_missing_bank_account': is_vendor_missing_bank_account if action == PurchaseOrderActions.SUBMIT else False,
		'did_amount_change': did_amount_change,
	}
	
	return template_data, None

def submit_purchase_order_update(
	session: Session,
	purchase_order_input: models.PurchaseOrder,
	purchase_order_files: List[PurchaseOrderFileItem],
	purchase_order_metrc_transfers: List[PurchaseOrderMetrcTransferItem],
	is_new_purchase_order: bool,
	action: str,
	user_session: UserSession,
) -> Tuple[Dict, errors.Error]:
	"""
		This function acts as a coordinator for both the create
		and update flows. This is beneficial as it shows what 
		*should* happen as a purchase order goes from one status
		to another all in one place - keeping the API simpler. 

		The actual work of updating a purchase order should occur
		in functions called by this one
	"""
	
	template_data, err = update_purchase_order(
		session,
		purchase_order_input,
		purchase_order_files,
		purchase_order_metrc_transfers,
		user_session,
		is_new_purchase_order = is_new_purchase_order,
		action = action,
	)
	if err:
		session.rollback()
		return None, err

	return template_data, None

def send_email_alert_for_purchase_order_update_submission(
	session: Session,
	purchase_order_input: models.PurchaseOrder,
	is_new_purchase_order: bool,
	action: str,
	sendgrid_client : sendgrid_util.Client,
	config: Config,
	template_data: Dict,
) -> Tuple[ bool, errors. Error]:
	# is_vendor_missing_bank_account rides piggyback on the template data
	# for the submit flow to determine if we need to send an internal
	# email, once we capture the value we can remove it from template_data
	#
	# Same thing for did_amount_change
	is_vendor_missing_bank_account = template_data['is_vendor_missing_bank_account']
	template_data.pop('is_vendor_missing_bank_account', None)
	did_amount_change = template_data['did_amount_change']
	template_data.pop('did_amount_change', None)

	if is_new_purchase_order:
		_, err = current_app.sendgrid_client.send(
			template_name = sendgrid_util.TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER_NEW,
			template_data = template_data,
			recipients = config.BANK_NOTIFY_EMAIL_ADDRESSES,
		)
		if err:
			return None, err
		
	if action == PurchaseOrderActions.SUBMIT:
		if did_amount_change:
			"""
				This is block covers two cases:
				1. User is submitting a brand new purchase order, so we must get approval
				2. Purchase order was already approved, but in the course of editing
					the purchase order, the amount was changed
			"""
			company_vendor_relationships, _ = queries.get_company_vendor_partnerships(
				session,
				[(
					str(purchase_order_input.company_id),
					str(purchase_order_input.vendor_id),
				)]
			)
			if len(company_vendor_relationships) == 0:
				vendor, err = queries.get_company_by_id(session, str(purchase_order_input.vendor_id))
				if err:
					return False, errors.Error(f'Partnership with vendor_id: {purchase_order_input.vendor_id} is not configured')
				return False, errors.Error(f'Partnership with vendor: {vendor.name} is not configured')

			company_vendor_relationship = company_vendor_relationships[0]

			vendor_users, err = partnership_util.get_partner_contacts(
				partnership_id = str(company_vendor_relationship.id),
				partnership_type = db_constants.CompanyType.Vendor,
				session = session
			)
			if err:
				raise err

			form_info = cast(Callable, models.TwoFactorFormInfoDict)(
				type = db_constants.TwoFactorLinkType.CONFIRM_PURCHASE_ORDER,
				payload = {
					'purchase_order_id': str(purchase_order_input.id)
				}
			)
			two_factor_payload = sendgrid_util.TwoFactorPayloadDict(
				form_info = form_info,
				expires_at = date_util.hours_from_today(24 * 14)
			)
			
			# TODO: (https://www.notion.so/bespokefinancial/Display-what-changes-bespoke-is-asking-the-client-to-make-e2ec269df9f346b4b9d17eaff48a1e4b
			# figure out email template string to use when we re-send (and how to determine if we sent before)
			_, err = sendgrid_client.send(
				template_name = sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER_NEW,
				# only send up the needed subset
				template_data = {
					'vendor_name': template_data['vendor_name'],
					'customer_name': template_data['customer_name'],
				},
				recipients = [user['email'] for user in vendor_users],
				two_factor_payload = two_factor_payload,
				is_new_secure_link = True,
			)
			if err:
				return None, err

		# If vendor does NOT have a bank account set up yet,
		# send an email to the Bespoke team letting them know about this.
		if is_vendor_missing_bank_account:
			_, err = sendgrid_client.send(
				template_name = sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT_NEW,
				template_data = {
					'vendor_name': template_data['vendor_name'],
					'customer_name': template_data['customer_name'],
				},
				recipients = current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES + \
					current_app.app_config.OPS_EMAIL_ADDRESSES,
			)
			if err:
				return None, err

	return True, None


def reject_loans_by_artifact_id(
	session: Session,
	artifact_id: str,
	rejected_by_user_id: str,
	rejection_note: str,
	delete_loans: bool = True,
) -> Tuple[List[models.Loan], errors.Error]:
	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.artifact_id == artifact_id
		).filter(
			models.Loan.funded_at == None
		).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).all()
	)

	# Don't need to send loan rejection emails since the user is already being notified of the PO rejection
	for loan in loans:
		loan.status = db_constants.LoanStatusEnum.REJECTED
		loan.rejection_note = rejection_note
		loan.rejected_at = date_util.now()
		loan.rejected_by_user_id = rejected_by_user_id
		loan.approved_at = None
		loan.approved_by_user_id = None
		if delete_loans:
			loan.is_deleted = True

	return loans, None


def reactivate_loans_by_artifact_id(
	session: Session,
	artifact_id: str,
) -> Tuple[List[models.Loan], errors.Error]:
	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.artifact_id == artifact_id
		).filter(
			models.Loan.funded_at == None
		).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).all()
	)

	for loan in loans:
		loan.status = db_constants.LoanStatusEnum.APPROVAL_REQUESTED
		loan.rejected_at = None
		loan.rejected_by_user_id = None

	return loans, None


def archive_purchase_order(
	session: Session,
	purchase_order: models.PurchaseOrder,
	user_id: str
) -> Tuple[bool, errors.Error]:
	purchase_order.closed_at = date_util.now()
	purchase_order.new_purchase_order_status = NewPurchaseOrderStatus.ARCHIVED

	user, err = queries.get_user_by_id(
		session,
		user_id,
	)
	if err:
		return False, err

	purchase_orders_util.update_purchase_order_history(
		purchase_order = purchase_order,
		user_id = user_id,
		user_full_name = user.full_name,
		action = "PO archived",
		new_status = NewPurchaseOrderStatus.ARCHIVED
	)

	# Can archive a loan up to the point that it's funded
	loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			models.Loan.artifact_id == purchase_order.id
		).filter(
			models.Loan.funded_at == None
		).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).all()
	)

	for loan in loans:
		loan.status = LoanStatusEnum.ARCHIVED

	return True, None
