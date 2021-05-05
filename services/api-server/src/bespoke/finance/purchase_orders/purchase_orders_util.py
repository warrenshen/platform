import datetime
import decimal
import json
from dataclasses import dataclass, fields
from typing import Any, Callable, Dict, List, Optional, Tuple, cast

from bespoke import errors
from bespoke.audit import events
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import RequestStatusEnum
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import number_util
from bespoke.finance.loans import approval_util
from bespoke.security import security_util, two_factor_util
from flask import Blueprint, Response, current_app, make_response, request
from flask.views import MethodView
from server.config import Config
from server.views.common import auth_util, handler_util


@dataclass
class PurchaseOrderFileItem:
	file_id: str
	purchase_order_id: str
	file_type: str

	@staticmethod
	def from_dict(d: Dict) -> 'PurchaseOrderFileItem':
		return PurchaseOrderFileItem(
			d.get('file_id'),
			d.get('purchase_order_id'),
			d.get('file_type')
		)


@dataclass
class PurchaseOrderData:
	id: str
	company_id: str
	vendor_id: str
	order_number: str
	order_date: datetime.date
	delivery_date: datetime.date
	amount: float
	is_cannabis: bool

	def to_model(self) -> models.PurchaseOrder:
		return models.PurchaseOrder( # type: ignore
			id=self.id,
			company_id=self.company_id,
			vendor_id=self.vendor_id,
			order_number=self.order_number,
			order_date=self.order_date,
			delivery_date=self.delivery_date,
			amount=decimal.Decimal(self.amount) if self.amount is not None else None,
			is_cannabis=self.is_cannabis,
			status=db_constants.RequestStatusEnum.DRAFTED,
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
			amount=PurchaseOrderData.parse_numeric_safely(d, 'amount'),
			is_cannabis=d.get('is_cannabis'),
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

	@staticmethod
	def from_dict(d: Dict) -> Tuple['PurchaseOrderUpsertRequest', errors.Error]:
		data, err = PurchaseOrderData.from_dict(d.get('purchase_order'))
		if err:
			return None, err

		return PurchaseOrderUpsertRequest(
			data,
			[PurchaseOrderFileItem.from_dict(f) for f in d.get('purchase_order_files', [])]
		), None

@errors.return_error_tuple
def create_update_purchase_order(
	session_maker: Callable,
	request: PurchaseOrderUpsertRequest,
) -> Tuple[str, errors.Error]:
	is_create_purchase_order = False

	if not request.purchase_order.company_id:
		raise errors.Error('Company is required')

	if not request.purchase_order.vendor_id:
		raise errors.Error('Vendor is required')

	if not request.purchase_order.order_number:
		raise errors.Error('Order number is required')

	with session_scope(session_maker) as session:
		if request.purchase_order.id is not None:
			existing_purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).get(request.purchase_order.id))

			for field in fields(PurchaseOrderData):
				value = getattr(request.purchase_order, field.name)
				setattr(existing_purchase_order, field.name, value)

			session.flush()
			purchase_order = existing_purchase_order
		else:
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
				raise errors.Error(f'A purchase order with this vendor and PO number already exists')

			purchase_order = request.purchase_order.to_model()
			session.add(purchase_order)
			session.flush()

			is_create_purchase_order = True

			vendor = purchase_order.vendor
			customer = purchase_order.company

		purchase_order_id = str(purchase_order.id)

		existing_purchase_order_files = cast(
			List[models.PurchaseOrderFile],
			session.query(models.PurchaseOrderFile).filter(
				models.PurchaseOrderFile.purchase_order_id == purchase_order_id
			).all())

		purchase_order_files_to_delete = []
		for existing_purchase_order_file in existing_purchase_order_files:
			is_purchase_order_file_deleted = len(list(filter(
				lambda purchase_order_file_request: (
					purchase_order_file_request.purchase_order_id == existing_purchase_order_file.purchase_order_id and
					purchase_order_file_request.file_id == existing_purchase_order_file.file_id and
					purchase_order_file_request.file_type == existing_purchase_order_file.file_type
				),
				request.purchase_order_files
			))) <= 0
			if is_purchase_order_file_deleted:
				purchase_order_files_to_delete.append(existing_purchase_order_file)

		for purchase_order_file_to_delete in purchase_order_files_to_delete:
			cast(Callable, session.delete)(purchase_order_file_to_delete)

		session.flush()

		purchase_order_file_dicts = []
		for purchase_order_file_request in request.purchase_order_files:
			existing_purchase_order_file = cast(
				models.PurchaseOrderFile,
				session.query(models.PurchaseOrderFile).get([
					purchase_order_file_request.purchase_order_id,
					purchase_order_file_request.file_id,
				]))
			if existing_purchase_order_file:
				purchase_order_file_dicts.append(existing_purchase_order_file.as_dict())
			else:
				purchase_order_file = models.PurchaseOrderFile(
					file_id=purchase_order_file_request.file_id,
					purchase_order_id=purchase_order_id,
					file_type=purchase_order_file_request.file_type,
				)
				session.add(purchase_order_file)
				purchase_order_file_dicts.append(purchase_order_file.as_dict())

		if is_create_purchase_order:
			sendgrid_client = cast(
				sendgrid_util.Client,
				current_app.sendgrid_client,
			)

			template_data = {
				'customer_name': customer.name,
				'vendor_name': vendor.name,
				'purchase_order_number': purchase_order.order_number,
				'purchase_order_amount': number_util.to_dollar_format(float(purchase_order.amount)) if purchase_order.amount else None,
			}
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.CUSTOMER_CREATED_PURCHASE_ORDER,
				template_data=template_data,
				recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES,
			)
			if err:
				raise err

	return purchase_order_id, None

@errors.return_error_tuple
def submit_purchase_order_for_approval(
	session_maker: Callable,
	purchase_order_id: str,
) -> Tuple[str, errors.Error]:
	is_vendor_missing_bank_account = False

	with session_scope(session_maker) as session:
		purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).get(purchase_order_id)
		)

		vendor = purchase_order.vendor
		customer = purchase_order.company

		if not purchase_order:
			raise errors.Error('Could not find purchase order')

		if not purchase_order.order_number:
			raise errors.Error('Order number is required')

		if not purchase_order.order_date:
			raise errors.Error('Order date is required')

		if not purchase_order.delivery_date:
			raise errors.Error('Delivery date is required')

		if purchase_order.amount is None or purchase_order.amount <= 0:
			raise errors.Error('Valid amount is required')

		company_vendor_relationship = cast(
			models.CompanyVendorPartnership,
			session.query(models.CompanyVendorPartnership).filter_by(
				company_id=customer.id,
				vendor_id=vendor.id,
			).first())

		if not company_vendor_relationship.vendor_bank_id:
			is_vendor_missing_bank_account = True

		if not company_vendor_relationship or company_vendor_relationship.approved_at is None:
			raise errors.Error('Vendor is not approved')

		purchase_order_file = cast(
			models.PurchaseOrderFile,
			session.query(
				models.PurchaseOrderFile
			).filter_by(
				purchase_order_id=purchase_order.id,
				file_type=db_constants.PurchaseOrderFileTypeEnum.PurchaseOrder,
			).first())

		if not purchase_order_file:
			raise errors.Error('Purchase order file attachment is required')

		if purchase_order.is_cannabis:
			purchase_order_cannabis_files = cast(
				List[models.PurchaseOrderFile],
				session.query(
					models.PurchaseOrderFile
				).filter_by(
					purchase_order_id=purchase_order.id,
					file_type=db_constants.PurchaseOrderFileTypeEnum.Cannabis,
				).all())

			if len(purchase_order_cannabis_files) <= 0:
				raise errors.Error('Purchase order cannabis file attachment(s) are required')

		vendor_users = cast(
			List[models.User],
			session.query(models.User).filter_by(
				company_id=purchase_order.vendor_id
			).all())

		if not vendor_users:
			raise errors.Error('There are no users configured for this vendor')

		purchase_order.status = RequestStatusEnum.APPROVAL_REQUESTED
		purchase_order.requested_at = date_util.now()

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
			expires_at=date_util.hours_from_today(24 * 7)
		)

		# Send the email to the vendor for them to approve or reject this purchase order
		# Get the vendor_id and find its users
		template_data = {
			'vendor_name': vendor.name,
			'customer_name': customer.name,
		}
		_, err = sendgrid_client.send(
			template_name=sendgrid_util.TemplateNames.VENDOR_TO_APPROVE_PURCHASE_ORDER,
			template_data=template_data,
			recipients=[user.email for user in vendor_users],
			two_factor_payload=two_factor_payload,
		)
		if err:
			raise err

		# If vendor does NOT have a bank account set up yet,
		# send an email to the Bespoke team letting them know about this.
		if is_vendor_missing_bank_account:
			template_data = {
				'vendor_name': vendor.name,
				'customer_name': customer.name,
			}
			_, err = sendgrid_client.send(
				template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_APPROVAL_NO_VENDOR_BANK_ACCOUNT,
				template_data=template_data,
				recipients=current_app.app_config.BANK_NOTIFY_EMAIL_ADDRESSES + current_app.app_config.OPS_EMAIL_ADDRESSES,
			)
			if err:
				raise err

	return purchase_order_id, None
