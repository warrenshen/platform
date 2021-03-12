import logging
import datetime
from dataclasses import dataclass, fields
from typing import Callable, Dict, Tuple, List, Optional

from bespoke import errors
from bespoke.db import models, db_constants
from bespoke.date import date_util
from bespoke.email import sendgrid_util


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
	def from_dict(d: Dict) -> 'InvoiceData':
		invoice_date = d.get('invoice_date')
		if invoice_date:
			invoice_date = date_util.load_date_str(invoice_date)

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
		)


@dataclass
class Request:
	invoice: InvoiceData
	files: List[InvoiceFileItem]

	@staticmethod
	def from_dict(d: Dict) -> 'Request':
		return Request(
			InvoiceData.from_dict(d.get('invoice')),
			[InvoiceFileItem.from_dict(f) for f in d.get('files', [])]
		)


def create_invoice(
	session_maker: Callable,
	request: Request
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
	request: Request
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

			for key in REQUIRED_KEYS_FOR_APPROVAL:
				value = getattr(invoice, key)
				if value is None:
					return errors.Error(f"Missing {key}")

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
		logging.exception("Caught exception while checking if invoice is ready for approval")
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










