import json
import decimal
import datetime
from typing import Callable, Dict, Tuple
from dataclasses import dataclass, fields

from manage import app
from bespoke.db import models, db_constants
from bespoke.date import date_util
from bespoke_test import auth_helper
from bespoke_test.db import db_unittest, test_helper

from sqlalchemy.orm.session import Session


@dataclass
class InvoiceConfig:
	id: str
	invoice_number: str
	invoice_date: datetime.date
	invoice_due_date: datetime.date
	advance_date: datetime.date
	subtotal_amount: float
	total_amount: float
	taxes_amount: float


@dataclass
class FileConfig:
	id: str
	name: str
	path: str


class InvoiceViewTest(db_unittest.TestCase):

	route = "/"

	invoices = (
		InvoiceConfig(
			'00000000-0000-0000-0000-000000000000',
			'0',
			date_util.load_date_str("03/10/2021"),
			date_util.load_date_str("03/31/2021"),
			date_util.load_date_str("03/12/2021"),
			250000.0,
			300000.0,
			10000.0,
		),
		InvoiceConfig(
			'00000000-0000-0000-0000-000000000001',
			'1',
			date_util.load_date_str("03/10/2021"),
			date_util.load_date_str("03/31/2021"),
			date_util.load_date_str("03/12/2021"),
			250000.0,
			300000.0,
			10000.0,
		),
		InvoiceConfig(
			'00000000-0000-0000-0000-000000000002',
			'2',
			date_util.load_date_str("03/10/2021"),
			date_util.load_date_str("03/31/2021"),
			date_util.load_date_str("03/12/2021"),
			250000.0,
			300000.0,
			10000.0,
		)
	)

	files = (
		FileConfig(
			'00000000-0000-0000-0000-000000000001',
			'file-1.txt',
			'/tmp/file-1.txt'
		),
		FileConfig(
			'00000000-0000-0000-0000-000000000002',
			'file-2.txt',
			'/tmp/file-2.txt'
		),
		FileConfig(
			'00000000-0000-0000-0000-000000000003',
			'file-3.txt',
			'/tmp/file-3.txt'
		),
		FileConfig(
			'00000000-0000-0000-0000-000000000004',
			'file-4.txt',
			'/tmp/file-4.txt'
		),
		FileConfig(
			'00000000-0000-0000-0000-000000000005',
			'file-5.txt',
			'/tmp/file-5.txt'
		),
		FileConfig(
			'00000000-0000-0000-0000-000000000006',
			'file-6.txt',
			'/tmp/file-6.txt'
		),
	)

	def _setup(self) -> Tuple[test_helper.BasicSeed, str, str]:
		seed = self.seed_database()
		customer_id = seed.get_company_id('company_admin', index=0)
		payor_id = seed.get_company_id('company_admin', index=1)

		with models.session_scope(self.session_maker) as session:
			payor = session.query(models.Company).get(payor_id)
			payor.company_type = db_constants.CompanyType.Payor

			session.add(models.CompanyPayorPartnership( # type: ignore
				company_id=customer_id,
				payor_id=payor_id,
			))

		with models.session_scope(self.session_maker) as session:
			for f in self.files:
				session.add(models.File( # type: ignore
					id=f.id,
					name=f.name,
					path=f.path
				))

			for invoice in self.invoices:
					session.add(models.Invoice( # type: ignore
						id=invoice.id,
						company_id=customer_id,
						payor_id=payor_id,
						invoice_number=invoice.invoice_number,
						invoice_date=invoice.invoice_date,
						invoice_due_date=invoice.invoice_due_date,
						advance_date=invoice.advance_date,
						subtotal_amount=invoice.subtotal_amount,
						total_amount=invoice.total_amount,
						taxes_amount=invoice.taxes_amount,
						status=db_constants.RequestStatusEnum.APPROVED,
					))
		return seed, customer_id, payor_id

	def _get_request_headers(self, user_id: str) -> Dict:
		with app.app_context():
			with models.session_scope(self.session_maker) as session:
				headers = auth_helper.get_user_auth_headers(session, user_id)
				headers.update({"Content-Type": "application/json"})
				return headers

	def _make_request(self, seed: test_helper.BasicSeed, request: Dict) -> Dict:
		user_id = str(seed.data['company_admins'][0]["user"]["user_id"])
		headers = self._get_request_headers(user_id)

		with app.test_client() as client:
			response = client.post(
				self.route,
				data=json.dumps(request),
				headers=headers)
			return json.loads(response.data)

	def _check_request_invoice_fields(self, request: Dict, invoice: models.Invoice) -> None:
		ri = request.get('invoice', {})
		self.assertEqual(ri.get('invoice_number'), invoice.invoice_number)
		self.assertEqual(ri.get('company_id'), str(invoice.company_id))
		self.assertEqual(ri.get('payor_id'), str(invoice.payor_id))
		self.assertEqual(ri.get('is_cannabis'), invoice.is_cannabis)

		invoice_date = ri.get('invoice_date')
		if invoice_date:
			self.assertEqual(date_util.load_date_str(invoice_date), invoice.invoice_date)

		invoice_due_date = ri.get('invoice_due_date')
		if invoice_due_date:
			self.assertEqual(date_util.load_date_str(invoice_due_date), invoice.invoice_due_date)

		advance_date = ri.get('advance_date')
		if advance_date:
			self.assertEqual(date_util.load_date_str(advance_date), invoice.advance_date)

		subtotal_amount = ri.get('subtotal_amount')
		if subtotal_amount:
			self.assertEqual(decimal.Decimal(subtotal_amount), invoice.subtotal_amount)

		total_amount = ri.get('total_amount')
		if total_amount:
			self.assertEqual(decimal.Decimal(total_amount), invoice.total_amount)

		taxes_amount = ri.get('taxes_amount')
		if taxes_amount:
			self.assertEqual(decimal.Decimal(taxes_amount), invoice.taxes_amount)

	def _check_request_response(self, request: Dict, response: Dict) -> None:
		with models.session_scope(self.session_maker) as session:
			invoice = session.query(models.Invoice).get(response['data']['invoice']['id'])
			self._check_request_invoice_fields(request, invoice)

			for f in request.get('files', []):
				file = session.query(models.InvoiceFile) \
					.filter(models.InvoiceFile.file_id == f['file_id']) \
					.filter(models.InvoiceFile.invoice_id == invoice.id) \
					.first()

				self.assertIsNotNone(file)
				self.assertEqual(file.file_type, f['file_type'])

			c = session.query(models.InvoiceFile) \
				.filter(models.InvoiceFile.invoice_id == invoice.id) \
				.count()

			self.assertEqual(c, len(request.get('files', [])))

class TestCreateInvoiceView(InvoiceViewTest):

	route = "/invoices/create"

	def test_success_on_create_full(self) -> None:
		seed, customer_id, payor_id = self._setup()

		request = {
			'invoice': {
				'invoice_number': '420',
				'company_id': str(customer_id),
				'payor_id': str(payor_id),
				'invoice_date': '03/23/2021',
				'invoice_due_date': '05/23/2021',
				'advance_date': '04/23/2021',
				'subtotal_amount': 420,
				'total_amount': 420,
				'taxes_amount': 420,
				'is_cannabis': True,
			},
			'files': [
				{
					'file_id': self.files[0].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Invoice
				},
				{
					'file_id': self.files[1].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Cannabis
				},
				{
					'file_id': self.files[2].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Invoice
				}
			]
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'OK')
		self._check_request_response(request, response)

	def test_success_on_create_minimal(self) -> None:
		seed, customer_id, payor_id = self._setup()

		request = {
			'invoice': {
				'invoice_number': '420',
				'company_id': str(customer_id),
				'payor_id': str(payor_id),
			},
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'OK')

		with models.session_scope(self.session_maker) as session:
			invoice = session.query(models.Invoice).get(response['data']['invoice']['id'])
			self._check_request_invoice_fields(request, invoice)


class TestUpdateInvoiceView(InvoiceViewTest):

	route = "/invoices/update"

	def test_success_on_update(self) -> None:
		seed, customer_id, payor_id = self._setup()

		request = {
			'invoice': {
				'id': self.invoices[0].id,
				'invoice_number': '666',
				'company_id': str(customer_id),
				'payor_id': str(payor_id),
				'invoice_date': '10/23/2021',
				'invoice_due_date': '12/23/2021',
				'advance_date': '11/23/2021',
				'subtotal_amount': 4200,
				'total_amount': 4200,
				'taxes_amount': 4200,
			},
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'OK')
		self._check_request_response(request, response)


	def test_success_on_file_replace(self) -> None:
		seed, customer_id, payor_id = self._setup()

		with models.session_scope(self.session_maker) as session:
			for f in self.files[:3]:
				session.add(models.InvoiceFile( # type: ignore
					invoice_id=self.invoices[0].id,
					file_id=f.id,
					file_type=db_constants.InvoiceFileTypeEnum.Invoice,
				))

		with models.session_scope(self.session_maker) as session:
			c = session.query(models.InvoiceFile) \
				.filter(models.InvoiceFile.invoice_id == self.invoices[0].id) \
				.count()

			self.assertEqual(c, 3)


		request = {
			'invoice': {
				'id': self.invoices[0].id,
				'invoice_number': '666',
				'company_id': str(customer_id),
				'payor_id': str(payor_id),
				'invoice_date': '10/23/2021',
				'invoice_due_date': '12/23/2021',
				'advance_date': '11/23/2021',
				'subtotal_amount': 4200,
				'total_amount': 4200,
				'taxes_amount': 4200,
			},
			'files': [
				{
					'file_id': self.files[3].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Invoice
				},
				{
					'file_id': self.files[4].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Cannabis
				},
				{
					'file_id': self.files[5].id,
					'file_type': db_constants.InvoiceFileTypeEnum.Invoice
				}
			]
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'OK')
		self._check_request_response(request, response)


	def test_failure_on_company_mismatch(self) -> None:
		seed, customer_id, payor_id = self._setup()

		request = {
			'invoice': {
				'id': self.invoices[0].id,
				'invoice_number': '666',
				'company_id': str(payor_id),
				'payor_id': str(customer_id),
				'invoice_date': '10/23/2021',
				'invoice_due_date': '12/23/2021',
				'advance_date': '11/23/2021',
				'subtotal_amount': 4200,
				'total_amount': 4200,
				'taxes_amount': 4200,
			},
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'ERROR')
		self.assertIn('Mismatched company ids', response['msg'])

	def test_failure_on_permissions(self) -> None:
		seed, customer_id, payor_id = self._setup()

		with models.session_scope(self.session_maker) as session:
			invoice = session.query(models.Invoice).get(self.invoices[0].id)
			invoice.company_id = payor_id # type: ignore

		request = {
			'invoice': {
				'id': self.invoices[0].id,
				'invoice_number': '666',
				'company_id': str(customer_id),
				'payor_id': str(payor_id),
				'invoice_date': '10/23/2021',
				'invoice_due_date': '12/23/2021',
				'advance_date': '11/23/2021',
				'subtotal_amount': 4200,
				'total_amount': 4200,
				'taxes_amount': 4200,
			},
		}

		response = self._make_request(seed, request)
		self.assertEqual(response['status'], 'ERROR')
		self.assertIn('does not belong to company admin', response['msg'])

