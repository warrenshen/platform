import datetime
import logging
from dataclasses import dataclass, fields
from typing import Callable, Dict, List, Optional, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.email import sendgrid_util
from bespoke.finance.payments import payment_util
from server.views.common import auth_util
from sqlalchemy.orm import Session

REQUIRED_KEYS_FOR_APPROVAL = (
	'invoice_number',
	'subtotal_amount',
	'total_amount',
	'taxes_amount',
	'invoice_date',
	'invoice_due_date',
	'advance_date',
)

REQUIRED_POSITIVE_VALUES_FOR_APPROVAL = (
	'subtotal_amount',
	'total_amount',
	'taxes_amount'
)

@dataclass
class InvoiceFileItem:
	file_id: str
	invoice_id: str
	file_type: str

	@staticmethod
	def from_dict(d: Dict) -> 'InvoiceFileItem':
		return InvoiceFileItem(
			d.get('file_id'),
			d.get('invoice_id'),
			d.get('file_type')
		)

@dataclass
class InvoiceData:
	id: str
	company_id: str
	payor_id: str
	invoice_number: str
	subtotal_amount: float
	total_amount: float
	taxes_amount: float
	invoice_date: datetime.date
	invoice_due_date: datetime.date
	advance_date: datetime.date
	status: str
	rejection_note: str
	is_cannabis: bool

	def to_model(self) -> models.Invoice:
		return models.Invoice( # type: ignore
			id=self.id,
			company_id=self.company_id,
			payor_id=self.payor_id,
			invoice_number=self.invoice_number,
			subtotal_amount=self.subtotal_amount,
			total_amount=self.total_amount,
			taxes_amount=self.taxes_amount,
			invoice_date=self.invoice_date,
			invoice_due_date=self.invoice_due_date,
			advance_date=self.advance_date,
			status=self.status,
			rejection_note=self.rejection_note,
			is_cannabis=self.is_cannabis,
		)

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

	@staticmethod
	def from_dict(d: Dict) -> Tuple['InvoiceData', errors.Error]:
		if not d:
			return None, errors.Error('cannot instantiate InvoiceData from nothing')

		invoice_date = d.get('invoice_date')
		if invoice_date:
			try:
				invoice_date = date_util.load_date_str(invoice_date)
			except:
				return None, errors.Error('invalid invoice_date')

		return InvoiceData(
			d.get('id'),
			d.get('company_id'),
			d.get('payor_id'),
			d.get('invoice_number'),
			InvoiceData.parse_numeric_safely(d, 'subtotal_amount'),
			InvoiceData.parse_numeric_safely(d, 'total_amount'),
			InvoiceData.parse_numeric_safely(d, 'taxes_amount'),
			InvoiceData.parse_date_safely(d, 'invoice_date'),
			InvoiceData.parse_date_safely(d, 'invoice_due_date'),
			InvoiceData.parse_date_safely(d, 'advance_date'),
			d.get('status'),
			d.get('rejection_note'),
			d.get('is_cannabis'),
		), None


@dataclass
class UpsertRequest:
	invoice: InvoiceData
	files: List[InvoiceFileItem]

	@staticmethod
	def from_dict(d: Dict) -> Tuple['UpsertRequest', errors.Error]:
		data, err = InvoiceData.from_dict(d.get('invoice'))
		if err:
			return None, err

		return UpsertRequest(
			data,
			[InvoiceFileItem.from_dict(f) for f in d.get('files', [])]
		), None


@dataclass
class SubmitForPaymentRequest:
	invoice_ids: List[str]

	@staticmethod
	def from_dict(d: Dict) -> 'SubmitForPaymentRequest':
		return SubmitForPaymentRequest(d.get('invoice_ids', []))


@dataclass
class InvoicePaymentRequestResponse:
	invoice_id: str
	new_status: db_constants.RequestStatusEnum
	link_val: str
	rejection_note: Optional[str]
	amount: Optional[float]
	anticipated_payment_date: Optional[datetime.date]
	payment_method: Optional[db_constants.PaymentMethodEnum]

	@staticmethod
	def from_dict(d: Dict) -> Tuple['InvoicePaymentRequestResponse', errors.Error]:
		invoice_id = d.get('invoice_id')
		if not invoice_id:
			return None, errors.Error('missing key: invoice_id')

		link_val = d.get('link_val')
		if not link_val:
			return None, errors.Error('missing key: link_val')

		new_status = d.get('new_status')
		if not new_status:
			return None, errors.Error('missing key: new_status')

		rejection_note = d.get('rejection_note')

		if new_status == db_constants.RequestStatusEnum.REJECTED:
			if not rejection_note:
				return None, errors.Error('rejected invoice payments require a note')
			return InvoicePaymentRequestResponse(
				invoice_id,
				new_status,
				link_val,
				rejection_note,
				None,
				None,
				None
			), None

		if new_status != db_constants.RequestStatusEnum.APPROVED:
			return None, errors.Error("invalid new status")

		amount = d.get('amount')
		if not amount:
			return None, errors.Error('missing key: amount')

		if str(amount).lower() == 'nan':
			return None, errors.Error("'amount' cannot be NaN")

		try:
			amount = float(amount)
		except:
			return None, errors.Error("'amount' is not a float")

		anticipated_payment_date = d.get('anticipated_payment_date')
		if not anticipated_payment_date:
			return None, errors.Error('missing key: anticipated_payment_date')

		try:
			anticipated_payment_date = date_util.load_date_str(anticipated_payment_date)
		except:
			return None, errors.Error('invalid anticipated_payment_date')

		payment_method = d.get('payment_method')
		if not payment_method:
			return None, errors.Error('missing key: payment_method')

		if payment_method not in db_constants.ALL_PAYMENT_METHODS:
			return None, errors.Error('invalid payment method')

		return InvoicePaymentRequestResponse(
			invoice_id,
			new_status,
			link_val,
			rejection_note,
			amount,
			anticipated_payment_date,
			payment_method
		), None


def create_invoice(
	session_maker: Callable,
	request: UpsertRequest
	) -> Tuple[models.InvoiceDict, List[models.InvoiceFileDict], errors.Error]:

	try:
		with models.session_scope(session_maker) as session:
			m = request.invoice.to_model()
			session.add(m)
			session.commit()
			session.refresh(m)

			files = []
			for f in request.files:
				fm = models.InvoiceFile( # type: ignore
					file_id=f.file_id,
					invoice_id=m.id,
					file_type=f.file_type
				)
				session.add(fm)
				files.append(fm.as_dict())
			return m.as_dict(), files, None
	except Exception as e:
		logging.exception("Caught exception while creating an invoice")
		return None, None, errors.Error(str(e))


def update_invoice(
	session_maker: Callable,
	request: UpsertRequest
	) -> Tuple[models.InvoiceDict, List[models.InvoiceFileDict], errors.Error]:

	try:
		with models.session_scope(session_maker) as session:
			existing_invoice = session.query(models.Invoice).get(request.invoice.id)

			for field in fields(InvoiceData):
				value = getattr(request.invoice, field.name)
				if value is not None:
					setattr(existing_invoice, field.name, value)

			file_dicts = []
			if len(request.files):
				files = session.query(models.InvoiceFile).filter_by(invoice_id=existing_invoice.id).all()
				for f in files:
					session.delete(f) # type: ignore

				session.commit()

				for rf in request.files:
					fm = models.InvoiceFile( # type: ignore
						file_id=rf.file_id,
						invoice_id=request.invoice.id,
						file_type=rf.file_type,
					)
					session.add(fm)
					file_dicts.append(fm.as_dict())

			return existing_invoice.as_dict(), file_dicts, None
	except Exception as e:
		logging.exception("Caught exception while updating an invoice")
		return None, None, errors.Error(str(e))


def is_invoice_ready_for_approval(
	session_maker: Callable,
	invoice_id: str
	) -> errors.Error:

	try:
		with models.session_scope(session_maker) as session:
			invoice = session.query(models.Invoice).get(invoice_id)
			if not invoice:
				return errors.Error("no invoice with that id")

			for key in REQUIRED_KEYS_FOR_APPROVAL:
				value = getattr(invoice, key)
				if value is None:
					return errors.Error(f"missing key: {key}")

			for key in REQUIRED_POSITIVE_VALUES_FOR_APPROVAL:
				value = getattr(invoice, key)
				if value < 0:
					return errors.Error(f"{key} cannot be negative")

			invoice_file = session.query(models.InvoiceFile) \
				.filter_by(
					invoice_id=invoice.id,
					file_type=db_constants.InvoiceFileTypeEnum.Invoice
				).first()
			if not invoice_file:
				return errors.Error("no invoice file")

			relationship = session.query(models.CompanyPayorPartnership) \
				.filter_by(company_id=invoice.company_id, payor_id=invoice.payor_id) \
				.first()

			if not relationship or relationship.approved_at is None:
				return errors.Error("payor is not approved")

			payor_users = session.query(models.User) \
				.filter_by(company_id=invoice.payor_id) \
				.all()
			if not payor_users:
				return errors.Error("no users configured for this payor")
	except Exception as e:
		logging.exception("caught exception while checking if invoice is ready for approval")
		return errors.Error(str(e))
	return None


def update_invoice_approval_status(
	session_maker: Callable,
	invoice_id: str
	) -> errors.Error:
	try:
		with models.session_scope(session_maker) as session:
			invoice = session.query(models.Invoice).get(invoice_id)
			invoice.status = db_constants.RequestStatusEnum.APPROVAL_REQUESTED
			invoice.requested_at = date_util.now()
	except Exception as e:
		logging.exception("Caught exception while updating invoice approval status")
		return errors.Error(str(e))

	return None


def handle_invoice_approval_request(
	session_maker: Callable,
	sendgrid_client: sendgrid_util.Client,
	invoice_id: str
	) -> errors.Error:
	err = is_invoice_ready_for_approval(session_maker, invoice_id)
	if err:
		return err

	info = models.TwoFactorFormInfoDict(
		type=db_constants.TwoFactorLinkType.CONFIRM_INVOICE,
		payload={'invoice_id': invoice_id},
	)

	payload = sendgrid_util.TwoFactorPayloadDict(
		form_info=info,
		expires_at=date_util.hours_from_today(24 * 7)
	)

	try:
		with models.session_scope(session_maker) as session:
			invoice = session.query(models.Invoice).get(invoice_id)
			customer = session.query(models.Company).get(invoice.company_id)
			payor = session.query(models.Company).get(invoice.payor_id)
			users = session.query(models.User).filter_by(company_id=invoice.payor_id).all()
			emails = [u.email for u in users]

			template_data = {
				'payor_name': payor.name,
				'customer_name': customer.name,
			}

			_, err = sendgrid_client.send(
				sendgrid_util.TemplateNames.PAYOR_TO_APPROVE_INVOICE,
				template_data,
				emails,
				two_factor_payload=payload,
			)
			if err:
				return err

			invoice.status = db_constants.RequestStatusEnum.APPROVAL_REQUESTED
			invoice.requested_at = date_util.now()
	except Exception as e:
		logging.exception("Caught exception while sending approval notification email")
		return errors.Error(str(e))
	return None


def send_one_notification_for_payment(
	session: Session,
	client: sendgrid_util.Client,
	invoice: models.Invoice,
	customer: models.Company) -> errors.Error:

	info = models.TwoFactorFormInfoDict(
		type=db_constants.TwoFactorLinkType.PAY_INVOICE,
		payload={'invoice_id': str(invoice.id)}
	)

	payload = sendgrid_util.TwoFactorPayloadDict(
		form_info=info,
		expires_at=date_util.hours_from_today(24 * 7)
	)

	template_data = {
		'payor_name': invoice.payor.name,
		'customer_name': customer.name
	}

	users = session.query(models.User) \
		.filter(models.User.company_id == invoice.payor.id) \
		.all()
	emails = [u.email for u in users if u.email]

	if len(emails):
		_, err = client.send(
			sendgrid_util.TemplateNames.PAYOR_TO_PAY_INVOICE,
			template_data,
			emails,
			two_factor_payload=payload,
		)
		if err:
			return err

	# Update the payment_requested_at timestamp
	invoice.payment_requested_at = date_util.now()
	return None


def submit_invoices_for_payment(
	session_maker: Callable,
	client: sendgrid_util.Client,
	company_id: str,
	request: SubmitForPaymentRequest) -> errors.Error:

	# Ensure that all of the invoices belong to the given company
	with models.session_scope(session_maker) as session:
		invoices = session.query(models.Invoice) \
			.filter(models.Invoice.id.in_(request.invoice_ids)) \
			.all()

		if len(invoices) != len(request.invoice_ids):
			return errors.Error(
				"the number of retrieved invoices did not match the number of ids given")

		mismatches = [invoice for invoice in invoices if str(invoice.company_id) != company_id]

		if len(mismatches):
			return errors.Error(
				f"{len(mismatches)} of the given invoices did not belong to the user")

		# We also make sure that all of the invoices have an approved_at timestamp set
		not_approved = [invoice for invoice in invoices if not invoice.approved_at]
		if len(not_approved):
			return errors.Error(f"{len(not_approved)} of the given invoices not yet approved")

		# All good. For each invoice, send an email to the payor
		customer = session.query(models.Company).get(company_id)

		for invoice in invoices:
			err = send_one_notification_for_payment(session, client, invoice, customer)
			if err:
				return err

		return None

def submit_new_invoice_for_payment(
	session_maker: Callable,
	client: sendgrid_util.Client,
	company_id: str,
	invoice_id: str,
) -> errors.Error:
	# Ensure that all of the invoices belong to the given company
	with models.session_scope(session_maker) as session:
		invoice = session.query(models.Invoice) \
			.filter(models.Invoice.id == invoice_id) \
			.first()

		if not invoice:
			return errors.Error("Invoice not found")

		# Approve invoice before it is sent out to payor for payment
		invoice.status = db_constants.RequestStatusEnum.APPROVED

		customer = session.query(models.Company).get(company_id)
		err = send_one_notification_for_payment(session, client, invoice, customer)
		if err:
			return err

		return None

def respond_to_payment_request(
	session: Session,
	client: sendgrid_util.Client,
	email: str,
	data: InvoicePaymentRequestResponse) -> errors.Error:

	user = session.query(models.User) \
		.filter(models.User.email == email) \
		.first()
	if not user:
		return errors.Error("could not find user")

	invoice = session.query(models.Invoice).get(data.invoice_id)

	if invoice.payor_id != user.company_id:
		return errors.Error("user cannot approve this invoice")

	# Do we need to email folks when a payment is rejected?
	if data.new_status == db_constants.RequestStatusEnum.REJECTED:
		invoice.payment_rejected_at = date_util.now()
		invoice.payment_rejection_note = data.rejection_note
		return None

	invoice.payment_confirmed_at = date_util.now()

	payment = payment_util.create_repayment_payment(
		str(invoice.company_id),
		payment_util.RepaymentPaymentInputDict(
			payment_method=str(data.payment_method),
			requested_amount=data.amount,
			requested_payment_date=data.anticipated_payment_date,
			payment_date=data.anticipated_payment_date,
			items_covered=payment_util.PaymentItemsCoveredDict(
				invoice_ids=[str(invoice.id)]
			),
			company_bank_account_id=None,
		),
		str(user.id))

	session.add(payment)
	session.commit()
	session.refresh(payment)

	invoice.payment_id = payment.id
	return None
