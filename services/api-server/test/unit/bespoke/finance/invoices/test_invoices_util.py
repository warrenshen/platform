import datetime
import decimal
import json
import unittest
import uuid
from dataclasses import dataclass, fields
from typing import Any, Callable, Dict, List, Optional, Tuple

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.email import sendgrid_util
from bespoke.finance.invoices import invoices_util
from bespoke_test import auth_helper
from bespoke_test.db import db_unittest, test_helper
from manage import app
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.session import Session


class TestUpsertRequestParsing(unittest.TestCase):

	@dataclass
	class Test:
		received: Dict
		expected_error: str


	def test_expected_failures(self) -> None:
		tests = [
			TestUpsertRequestParsing.Test(
				{},
				'cannot instantiate InvoiceData from nothing'
			),
			TestUpsertRequestParsing.Test(
				{
					'invoice': {
						'invoice_date': 'will not parse'
					}
				},
				'invalid invoice_date'
			)
		]

		for test in tests:
			_, err = invoices_util.InvoiceUpsertRequest.from_dict(test.received)
			self.assertIn(test.expected_error, str(err))


class TestInvoicePaymentRequestResponseParsing(unittest.TestCase):

	@dataclass
	class Test:
		received: Dict
		expected_error: str

	def test_expected_failure(self) -> None:
		tests = [
			TestInvoicePaymentRequestResponseParsing.Test(
				{},
				'missing key: invoice_id'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
				},
				'missing key: link_val'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
				},
				'missing key: new_status'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.DRAFTED,
				},
				'invalid new status'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.REJECTED,
				},
				'rejected invoice payments require a note'
			),
			# Actually testing success
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.REJECTED,
					'rejection_note': "I'd rather not pay"
				},
				'None'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
				},
				'missing key: amount'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 'NaN',
				},
				"'amount' cannot be NaN"
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 'sink',
				},
				"'amount' is not a float"
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 100,
				},
				'missing key: anticipated_payment_date'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 100,
					'anticipated_payment_date': 'not a date',
				},
				'invalid anticipated_payment_date'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 100,
					'anticipated_payment_date': '03/12/2021',
				},
				'missing key: payment_method'
			),
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 100,
					'anticipated_payment_date': '03/12/2021',
					'payment_method': 'barter',
				},
				'invalid payment method'
			),
			# Actually testing success
			TestInvoicePaymentRequestResponseParsing.Test(
				{
					'invoice_id': '420',
					'link_val': 'fakefakefake',
					'new_status': db_constants.RequestStatusEnum.APPROVED,
					'amount': 100,
					'anticipated_payment_date': '03/12/2021',
					'payment_method': db_constants.PaymentMethodEnum.WIRE,
				},
				'None'
			),
		]

		for test in tests:
			_, err = invoices_util.InvoicePaymentRequestResponse.from_dict(test.received)
			self.assertIn(test.expected_error, str(err))

class PrepareDatabase:
	def __init__(self) -> None:
		self.customers: List[models.Company] = []
		self.payors: List[models.Company] = []
		self.company_settings: List[models.CompanySettings] = []
		self.invoices: List[models.Invoice] = []
		self.files: List[models.File] = []
		self.invoice_files: List[models.InvoiceFile] = []
		self.partnerships: List[models.CompanyPayorPartnership] = []
		self.users: List[models.User] = []

	@staticmethod
	def mint_guid() -> str:
		return str(uuid.uuid4())

	def _prepare_company(self, co: models.Company) -> models.Company:
		settings = models.CompanySettings()
		settings.id = PrepareDatabase.mint_guid()
		co.company_settings_id = settings.id
		self.company_settings.append(settings)
		return co

	def add_customer(self,
		fn: Callable[['PrepareDatabase'], models.Company]
	) -> 'PrepareDatabase':
		co = fn(self)
		co.id = PrepareDatabase.mint_guid()
		co.company_type = db_constants.CompanyType.Customer
		self.customers.append(self._prepare_company(co))
		return self

	def add_payor(self,
		fn: Callable[['PrepareDatabase'], models.Company]
	) -> 'PrepareDatabase':
		co = fn(self)
		co.id = PrepareDatabase.mint_guid()
		co.company_type = db_constants.CompanyType.Payor
		self.payors.append(self._prepare_company(co))
		return self

	def add_partnership(self,
		fn: Callable[['PrepareDatabase'], models.CompanyPayorPartnership]
	) -> 'PrepareDatabase':
		p = fn(self)
		p.id = PrepareDatabase.mint_guid()
		self.partnerships.append(p)
		return self

	def link_customers_and_payors(self, approved: bool = False) -> 'PrepareDatabase':
		if not len(self.customers) == len(self.payors):
			raise Exception("cannot zip customers and payors")

		for customer, payor in zip(self.customers, self.payors):
			self.add_partnership(lambda p: models.CompanyPayorPartnership( # type: ignore
				company_id=customer.id,
				payor_id=payor.id,
				approved_at=date_util.now() if approved else None
			))
		return self

	def add_invoice(self,
		fn: Callable[['PrepareDatabase'], models.Invoice]
	) -> 'PrepareDatabase':
		i = fn(self)
		i.id = PrepareDatabase.mint_guid()
		self.invoices.append(i)
		return self

	def add_file(self,
		fn: Callable[['PrepareDatabase'], models.File]
	) -> 'PrepareDatabase':
		f = fn(self)
		f.id = PrepareDatabase.mint_guid()
		self.files.append(f)
		return self

	def add_invoice_file(self,
		fn: Callable[['PrepareDatabase'], models.InvoiceFile]
	) -> 'PrepareDatabase':
		i = fn(self)
		self.invoice_files.append(i)
		return self

	def add_user(self,
		fn: Callable[['PrepareDatabase'], models.User]
	) -> 'PrepareDatabase':
		u = fn(self)
		self.users.append(u)
		return self

	def __call__(self, session: Session) -> None:
		[session.add(settings) for settings in self.company_settings] # type: ignore
		[session.add(customer) for customer in self.customers] # type: ignore
		[session.add(payor) for payor in self.payors] # type: ignore
		[session.add(partnership) for partnership in self.partnerships] # type: ignore
		[session.add(invoice) for invoice in self.invoices] # type: ignore
		[session.add(invoice_file) for invoice_file in self.invoice_files] # type: ignore
		[session.add(user) for user in self.users] # type: ignore
		session.commit()

class DumbSendgridClient(sendgrid_util.Client):
	def __init__(self, *args: Any, **kwargs: Any) -> None:
		self.count = 0

	def send(self, *args: Any, **kwargs: Any) -> Tuple[bool, errors.Error]:
		self.count += 1
		return True, None

class TestCreateInvoice(db_unittest.TestCase):

	@dataclass
	class Test:
		prepare: 'PrepareDatabase'
		expected_error: str

	def test_create_invoice(self) -> None:
		p = PrepareDatabase() \
			.add_customer(lambda p: models.Company(
				name='Big Green Bongs'
			)) \
			.add_payor(lambda p: models.Company(
				name='We Buy Weed'
			)) \
			.link_customers_and_payors(approved=True) \
			.add_file(lambda p: models.File())

		with models.session_scope(self.session_maker) as session:
			p(session)

			invoice_data, err = invoices_util.InvoiceData.from_dict({
				'id': None,
				'company_id': p.customers[0].id,
				'payor_id': p.payors[0].id,
				'invoice_number': '420',
				'subtotal_amount': 10000,
				'taxes_amount': 10,
				'total_amount': 10010,
				'invoice_date': '03/18/2021',
				'invoice_due_date': '04/18/2021',
				'status': None,
				'rejection_note': None,
				'is_cannabis': None,
			})

			self.assertIsNone(err)

			invoice_id, err = invoices_util.create_update_invoice(
				self.session_maker,
				# DumbSendgridClient(),
				# str(p.payors[0].id),
				invoices_util.InvoiceUpsertRequest(
					invoice=invoice_data,
					invoice_files=[invoices_util.InvoiceFileItem.from_dict({
						'file_id': p.files[0].id,
						'invoice_id': None,
						'file_type': db_constants.InvoiceFileTypeEnum.Invoice,
					})],
				))

			self.assertIsNone(err)
			self.assertIsNotNone(invoice_id)

class TestIsInvoiceReadyForApproval(db_unittest.TestCase):

	@dataclass
	class Test:
		prepare: 'PrepareDatabase'
		expected_error: str

	def test_approval_failure(self) -> None:
		tests = [
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors()
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
					)),
				'missing key: subtotal_amount'
			),
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors()
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
						payor_id=p.payors[0].id,
						subtotal_amount=10000,
						taxes_amount=-10,
						total_amount=10010,
						invoice_date=date_util.load_date_str("03/18/2021"),
						invoice_due_date=date_util.load_date_str("04/18/2021"),
					)),
				'taxes_amount cannot be negative'
			),
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors()
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
						payor_id=p.payors[0].id,
						subtotal_amount=10000,
						taxes_amount=10,
						total_amount=10010,
						invoice_date=date_util.load_date_str("03/18/2021"),
						invoice_due_date=date_util.load_date_str("04/18/2021"),
					))
					.add_file(lambda p: models.File())
					.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
						file_id=p.files[0].id,
						invoice_id=p.invoices[0].id,
						file_type=db_constants.InvoiceFileTypeEnum.Cannabis
					)),
				'no invoice file'
			),
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors()
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
						payor_id=p.payors[0].id,
						subtotal_amount=10000,
						taxes_amount=10,
						total_amount=10010,
						invoice_date=date_util.load_date_str("03/18/2021"),
						invoice_due_date=date_util.load_date_str("04/18/2021"),
					))
					.add_file(lambda p: models.File())
					.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
						file_id=p.files[0].id,
						invoice_id=p.invoices[0].id,
						file_type=db_constants.InvoiceFileTypeEnum.Invoice
					)),
				'payor is not approved'
			),
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors(approved=True)
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
						payor_id=p.payors[0].id,
						subtotal_amount=10000,
						taxes_amount=10,
						total_amount=10010,
						invoice_date=date_util.load_date_str("03/18/2021"),
						invoice_due_date=date_util.load_date_str("04/18/2021"),
					))
					.add_file(lambda p: models.File())
					.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
						file_id=p.files[0].id,
						invoice_id=p.invoices[0].id,
						file_type=db_constants.InvoiceFileTypeEnum.Invoice
					)),
				'no users configured for this payor'
			),
			# Actually testing success
			TestIsInvoiceReadyForApproval.Test(
				PrepareDatabase()
					.add_customer(lambda p: models.Company(
						name='Big Green Bongs'
					))
					.add_payor(lambda p: models.Company(
						name='We Buy Weed'
					))
					.link_customers_and_payors(approved=True)
					.add_invoice(lambda p: models.Invoice( # type: ignore
						invoice_number='420',
						company_id=p.customers[0].id,
						payor_id=p.payors[0].id,
						subtotal_amount=10000,
						taxes_amount=10,
						total_amount=10010,
						invoice_date=date_util.load_date_str("03/18/2021"),
						invoice_due_date=date_util.load_date_str("04/18/2021"),
					))
					.add_file(lambda p: models.File())
					.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
						file_id=p.files[0].id,
						invoice_id=p.invoices[0].id,
						file_type=db_constants.InvoiceFileTypeEnum.Invoice
					))
					.add_user(lambda p: models.User(
						company_id=p.payors[0].id,
						email='peter@webuyweed.com',
						password='xxxx',
						role='peter the payor',
						first_name='Peter',
						last_name='Payor',
					)),
				'None'
			)
		]

		for test in tests:
			with models.session_scope(self.session_maker) as session:
				test.prepare(session)

				for invoice in test.prepare.invoices:
					err = invoices_util.is_invoice_ready_for_approval(self.session_maker, invoice.id)
					self.assertIn(test.expected_error, str(err))

		err = invoices_util.is_invoice_ready_for_approval(
			self.session_maker,
			str(PrepareDatabase.mint_guid()))
		self.assertIn('no invoice with that id', str(err))


class TestSubmitInvoicesForPayment(db_unittest.TestCase):

	def test_missing_invoice(self) -> None:
		p = PrepareDatabase() \
			.add_customer(lambda p: models.Company(
				name='Big Green Bongs'
			)) \
			.add_payor(lambda p: models.Company(
				name='We Buy Weed'
			)) \
			.link_customers_and_payors(approved=True) \
			.add_invoice(lambda p: models.Invoice( # type: ignore
				invoice_number='420',
				company_id=p.customers[0].id,
				payor_id=p.payors[0].id,
				subtotal_amount=10000,
				taxes_amount=10,
				total_amount=10010,
				invoice_date=date_util.load_date_str("03/18/2021"),
				invoice_due_date=date_util.load_date_str("04/18/2021"),
			)) \
			.add_file(lambda p: models.File()) \
			.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
				file_id=p.files[0].id,
				invoice_id=p.invoices[0].id,
				file_type=db_constants.InvoiceFileTypeEnum.Invoice
			)) \
			.add_user(lambda p: models.User(
				company_id=p.payors[0].id,
				email='peter@webuyweed.com',
				password='xxxx',
				role='peter the payor',
				first_name='Peter',
				last_name='Payor',
			))

		with models.session_scope(self.session_maker) as session:
			p(session)

			success, err = invoices_util.submit_invoices_for_payment(
				self.session_maker,
				DumbSendgridClient(),
				str(p.customers[0].id),
				invoices_util.SubmitForPaymentRequest([PrepareDatabase.mint_guid()]))

			self.assertIn(
				'the number of retrieved invoices did not match the number of ids given',
				str(err))

	def test_customer_mismatch(self) -> None:
		p = PrepareDatabase() \
			.add_customer(lambda p: models.Company(
				name='Big Green Bongs'
			)) \
			.add_payor(lambda p: models.Company(
				name='We Buy Weed'
			)) \
			.link_customers_and_payors(approved=True) \
			.add_invoice(lambda p: models.Invoice( # type: ignore
				invoice_number='420',
				company_id=p.customers[0].id,
				payor_id=p.payors[0].id,
				subtotal_amount=10000,
				taxes_amount=10,
				total_amount=10010,
				invoice_date=date_util.load_date_str("03/18/2021"),
				invoice_due_date=date_util.load_date_str("04/18/2021"),
			)) \
			.add_file(lambda p: models.File()) \
			.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
				file_id=p.files[0].id,
				invoice_id=p.invoices[0].id,
				file_type=db_constants.InvoiceFileTypeEnum.Invoice
			)) \
			.add_user(lambda p: models.User(
				company_id=p.payors[0].id,
				email='peter@webuyweed.com',
				password='xxxx',
				role='peter the payor',
				first_name='Peter',
				last_name='Payor',
			))

		with models.session_scope(self.session_maker) as session:
			p(session)

			success, err = invoices_util.submit_invoices_for_payment(
				self.session_maker,
				DumbSendgridClient(),
				str(p.payors[0].id),
				invoices_util.SubmitForPaymentRequest([p.invoices[0].id]))

			self.assertIn(
				'1 of the given invoices did not belong to the user',
				str(err))

	def test_not_approved(self) -> None:
		p = PrepareDatabase() \
			.add_customer(lambda p: models.Company(
				name='Big Green Bongs'
			)) \
			.add_payor(lambda p: models.Company(
				name='We Buy Weed'
			)) \
			.link_customers_and_payors(approved=True) \
			.add_invoice(lambda p: models.Invoice( # type: ignore
				invoice_number='420',
				company_id=p.customers[0].id,
				payor_id=p.payors[0].id,
				subtotal_amount=10000,
				taxes_amount=10,
				total_amount=10010,
				invoice_date=date_util.load_date_str("03/18/2021"),
				invoice_due_date=date_util.load_date_str("04/18/2021"),
			)) \
			.add_file(lambda p: models.File()) \
			.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
				file_id=p.files[0].id,
				invoice_id=p.invoices[0].id,
				file_type=db_constants.InvoiceFileTypeEnum.Invoice
			)) \
			.add_user(lambda p: models.User(
				company_id=p.payors[0].id,
				email='peter@webuyweed.com',
				password='xxxx',
				role='peter the payor',
				first_name='Peter',
				last_name='Payor',
			))

		with models.session_scope(self.session_maker) as session:
			p(session)

			success, err = invoices_util.submit_invoices_for_payment(
				self.session_maker,
				DumbSendgridClient(),
				str(p.customers[0].id),
				invoices_util.SubmitForPaymentRequest([p.invoices[0].id]))

			self.assertIn(
				'1 of the given invoices not yet approved',
				str(err))

	def test_success(self) -> None:
		p = PrepareDatabase() \
			.add_customer(lambda p: models.Company(
				name='Big Green Bongs'
			)) \
			.add_payor(lambda p: models.Company(
				name='We Buy Weed'
			)) \
			.link_customers_and_payors(approved=True) \
			.add_invoice(lambda p: models.Invoice( # type: ignore
				invoice_number='420',
				company_id=p.customers[0].id,
				payor_id=p.payors[0].id,
				subtotal_amount=10000,
				taxes_amount=10,
				total_amount=10010,
				invoice_date=date_util.load_date_str("03/18/2021"),
				invoice_due_date=date_util.load_date_str("04/18/2021"),
				approved_at=date_util.now(),
			)) \
			.add_file(lambda p: models.File()) \
			.add_invoice_file(lambda p: models.InvoiceFile( # type: ignore
				file_id=p.files[0].id,
				invoice_id=p.invoices[0].id,
				file_type=db_constants.InvoiceFileTypeEnum.Invoice
			)) \
			.add_user(lambda p: models.User(
				company_id=p.payors[0].id,
				email='peter@webuyweed.com',
				password='xxxx',
				role='peter the payor',
				first_name='Peter',
				last_name='Payor',
			))

		invoice_id = None

		with models.session_scope(self.session_maker) as session:
			p(session)
			invoice_id = p.invoices[0].id

			client = DumbSendgridClient()

			success, err = invoices_util.submit_invoices_for_payment(
				self.session_maker,
				client,
				str(p.customers[0].id),
				invoices_util.SubmitForPaymentRequest([invoice_id]))
			self.assertIsNone(err)
			self.assertEqual(client.count, 1)

		with models.session_scope(self.session_maker) as session:
			invoice = session.query(models.Invoice).get(invoice_id)
			self.assertIsNotNone(invoice.payment_requested_at)
