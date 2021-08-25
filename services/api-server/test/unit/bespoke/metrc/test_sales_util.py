import datetime
import decimal
import json
import uuid
import requests
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Callable, Dict, List, Tuple, NamedTuple, cast
from fastapi_utils.guid_type import GUID

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.metrc import sales_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict, CompanyInfo

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _sales_receipt_json(p: Dict) -> Dict:
	p['ReceiptNumber'] = str(p['Id']) + '-receipt-num'
	p['SalesCustomerType'] = str(p['Id']) + '-sales-customer-type'
	return p


def _sales_transaction_json(p: Dict) -> Dict:
	p['PackageId'] = p['Id'] + 1
	id_ = str(p['Id'])
	p['PackageLabel'] = id_ + '-product-label'
	p['ProductName'] = id_ + '-product-name'
	p['ProductCategoryName'] = id_ + '-product-category-name'
	p['UnitOfMeasureName'] = id_ + '-unit-of-measure'
	return p

class TestPopulateSalesTable(db_unittest.TestCase):

	def _assert_transactions(self, expected_transactions: List[Dict], session_maker: Callable) -> None:
		with session_scope(session_maker) as session:
			metrc_sales_transactions = cast(List[models.MetrcSalesTransaction], session.query(
				models.MetrcSalesTransaction).order_by(models.MetrcSalesTransaction.last_modified_at).all())
			self.assertEqual(len(expected_transactions), len(metrc_sales_transactions))
			for i in range(len(metrc_sales_transactions)):
				p = metrc_sales_transactions[i]
				exp = expected_transactions[i]
				id_ = str(cast(Dict, p.payload)['Id'])
				self.assertEqual(exp['type'], p.type)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(str(exp['receipt_id']), p.receipt_id)
				self.assertIsNotNone(p.receipt_row_id)
				self.assertEqual(str(cast(Dict, p.payload)['Id'] + 1), p.package_id)
				self.assertEqual(id_ + '-product-label', p.package_label)
				self.assertEqual(id_ + '-product-category-name', p.product_category_name)
				self.assertAlmostEqual(exp['quantity_sold'], float(p.quantity_sold))
				self.assertEqual(id_ + '-unit-of-measure', p.unit_of_measure)
				self.assertAlmostEqual(exp['total_price'], float(p.total_price))
				self.assertEqual(exp['recorded_datetime'], p.recorded_datetime)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)

	def test_populate_sales_info(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		license_id = str(uuid.uuid4())

		ctx = metrc_common_util.DownloadContext(
			cur_date=date_util.load_date_str('1/1/2020'),
			company_info=CompanyInfo(
				company_id=company_id,
				name='Company 1',
				licenses=[], # unused
				metrc_api_key_id='',
				apis_to_use=metrc_common_util.get_default_apis_to_use()
			),
			license_auth=LicenseAuthDict(
				license_id=license_id,
				license_number='abcd',
				us_state='CA',
				vendor_key='vkey',
				user_key='ukey'
			),
			debug=True
		)
		ctx.rest = cast(metrc_common_util.REST, FakeREST(
			req_to_resp={
				RequestKey(
					url='/sales/v1/receipts/inactive',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_sales_receipt_json({
									'Id': 1,
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'SalesDateTime': parser.parse('02/02/2020').isoformat(),
									'TotalPackages': 1,
									'TotalPrice': 10.1,
									'IsFinal': True,
								}),
								_sales_receipt_json({
									'Id': 2,
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'SalesDateTime': parser.parse('02/03/2020').isoformat(),
									'TotalPackages': 2,
									'TotalPrice': 20.2,
									'IsFinal': True,
								})
							]
						},
						{
							'status': 'OK',
							'json': [
								_sales_receipt_json({
									'Id': 1,
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'SalesDateTime': parser.parse('02/02/2020').isoformat(),
									'TotalPackages': 1,
									'TotalPrice': 10.1,
									'IsFinal': True,
								}),
								_sales_receipt_json({
									'Id': 2,
									'LastModified': parser.parse('02/02/2020').isoformat(),
									'SalesDateTime': parser.parse('02/03/2020').isoformat(),
									'TotalPackages': 2,
									'TotalPrice': 20.2,
									'IsFinal': True,
								})
							]
						}
					]
				},
				RequestKey(
					url='/sales/v1/receipts/active',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_sales_receipt_json({
									'Id': 3,
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'SalesDateTime': parser.parse('02/04/2020').isoformat(),
									'TotalPackages': 3,
									'TotalPrice': 30.3,
									'IsFinal': False,
								}),
								_sales_receipt_json({
									'Id': 4,
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'SalesDateTime': parser.parse('02/05/2020').isoformat(),
									'TotalPackages': 4,
									'TotalPrice': 40.4,
									'IsFinal': False,
								})
							]
						},
						{
							'status': 'OK',
							'json': [
								_sales_receipt_json({
									'Id': 3,
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'SalesDateTime': parser.parse('02/04/2020').isoformat(),
									'TotalPackages': 3,
									'TotalPrice': 30.3,
									'IsFinal': False,
								}),
								_sales_receipt_json({
									'Id': 4,
									'LastModified': parser.parse('02/04/2020').isoformat(),
									'SalesDateTime': parser.parse('02/05/2020').isoformat(),
									'TotalPackages': 4,
									'TotalPrice': 40.4,
									'IsFinal': False,
								})
							]
						}
					]
				},
				RequestKey(
					url='/sales/v1/receipts/1',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 1,
										'LastModified': parser.parse('02/01/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/02/2020').isoformat(),
										'QuantitySold': 1,
										'TotalPrice': 10.1,
									}),
									_sales_transaction_json({
										'Id': 2,
										'LastModified': parser.parse('02/02/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/03/2020').isoformat(),
										'QuantitySold': 2,
										'TotalPrice': 20.2,
									})
								]
							}
						},
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 1,
										'LastModified': parser.parse('02/01/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/02/2020').isoformat(),
										'QuantitySold': 1,
										'TotalPrice': 10.1,
									}),
									_sales_transaction_json({
										'Id': 2,
										'LastModified': parser.parse('02/02/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/03/2020').isoformat(),
										'QuantitySold': 2,
										'TotalPrice': 20.2,
									}),
									_sales_transaction_json({
										'Id': 3,
										'LastModified': parser.parse('02/03/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/04/2020').isoformat(),
										'QuantitySold': 3,
										'TotalPrice': 30.3,
									})
								],
							}
						}
					],
				},
				RequestKey(
					url='/sales/v1/receipts/2',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 4,
										'LastModified': parser.parse('02/04/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/05/2020').isoformat(),
										'QuantitySold': 4,
										'TotalPrice': 40.4,
									}),
									_sales_transaction_json({
										'Id': 5,
										'LastModified': parser.parse('02/05/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/06/2020').isoformat(),
										'QuantitySold': 5,
										'TotalPrice': 50.5,
									})
								]
							}
						},
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 4,
										'LastModified': parser.parse('02/04/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/05/2020').isoformat(),
										'QuantitySold': 4,
										'TotalPrice': 40.4,
									}),
									_sales_transaction_json({
										'Id': 5,
										'LastModified': parser.parse('02/05/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/06/2020').isoformat(),
										'QuantitySold': 5,
										'TotalPrice': 50.5,
									}),
									_sales_transaction_json({
										'Id': 6,
										'LastModified': parser.parse('02/06/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/07/2020').isoformat(),
										'QuantitySold': 6,
										'TotalPrice': 60.6,
									})
								]
							}
						}
					]
				},
				RequestKey(
					url='/sales/v1/receipts/3',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 7,
										'LastModified': parser.parse('02/07/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/08/2020').isoformat(),
										'QuantitySold': 7,
										'TotalPrice': 70.7,
									}),
									_sales_transaction_json({
										'Id': 8,
										'LastModified': parser.parse('02/08/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/09/2020').isoformat(),
										'QuantitySold': 8,
										'TotalPrice': 80.8,
									})
								]
							}
						},
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 7,
										'LastModified': parser.parse('02/07/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/08/2020').isoformat(),
										'QuantitySold': 7,
										'TotalPrice': 70.7,
									}),
									_sales_transaction_json({
										'Id': 8,
										'LastModified': parser.parse('02/08/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/09/2020').isoformat(),
										'QuantitySold': 8,
										'TotalPrice': 80.8,
									}),
									_sales_transaction_json({
										'Id': 9,
										'LastModified': parser.parse('02/09/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/10/2020').isoformat(),
										'QuantitySold': 9,
										'TotalPrice': 90.9,
									})
								]
							}
						}
					]
				},
				RequestKey(
					url='/sales/v1/receipts/4',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 10,
										'LastModified': parser.parse('02/10/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/11/2020').isoformat(),
										'QuantitySold': 10,
										'TotalPrice': 100.10,
									}),
									_sales_transaction_json({
										'Id': 11,
										'LastModified': parser.parse('02/11/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/12/2020').isoformat(),
										'QuantitySold': 11,
										'TotalPrice': 110.11,
									})
								]
							}
						},
						{
							'status': 'OK',
							'json': {
								'Transactions': [
									_sales_transaction_json({
										'Id': 10,
										'LastModified': parser.parse('02/10/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/11/2020').isoformat(),
										'QuantitySold': 10,
										'TotalPrice': 100.10,
									}),
									_sales_transaction_json({
										'Id': 11,
										'LastModified': parser.parse('02/11/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/12/2020').isoformat(),
										'QuantitySold': 11,
										'TotalPrice': 110.11,
									}),
									_sales_transaction_json({
										'Id': 12,
										'LastModified': parser.parse('02/12/2020').isoformat(),
										'RecordedDateTime': parser.parse('02/13/2020').isoformat(),
										'QuantitySold': 12,
										'TotalPrice': 120.12,
									})
								]
							}
						}
					]
				},
			}
		))
		sales_info_objects = sales_util.download_sales_info(ctx)
		sales_util.write_sales_info(sales_info_objects, session_maker, BATCH_SIZE=4)
		
		expected_receipts: List[Dict] = [
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': '1',
				'last_modified_at': parser.parse('02/01/2020'),
				'sales_datetime': parser.parse('02/02/2020'),
				'total_packages': 1,
				'total_price': 10.1,
				'is_final': True,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': '2',
				'last_modified_at': parser.parse('02/02/2020'),
				'sales_datetime': parser.parse('02/03/2020'),
				'total_packages': 2,
				'total_price': 20.2,
				'is_final': True,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': '3',
				'last_modified_at': parser.parse('02/03/2020'),
				'sales_datetime': parser.parse('02/04/2020'),
				'total_packages': 3,
				'total_price': 30.3,
				'is_final': False,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': '4',
				'last_modified_at': parser.parse('02/04/2020'),
				'sales_datetime': parser.parse('02/05/2020'),
				'total_packages': 4,
				'total_price': 40.4,
				'is_final': False,
			},
		]

		with session_scope(session_maker) as session:
			metrc_sales_receipts = cast(List[models.MetrcSalesReceipt], session.query(
				models.MetrcSalesReceipt).order_by(models.MetrcSalesReceipt.last_modified_at).all())
			self.assertEqual(4, len(metrc_sales_receipts))
			for i in range(len(metrc_sales_receipts)):
				p = metrc_sales_receipts[i]
				exp = expected_receipts[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['receipt_id'] + '-receipt-num', p.receipt_number)
				self.assertEqual(exp['receipt_id'], p.receipt_id)
				self.assertEqual(exp['receipt_id'] + '-sales-customer-type', p.sales_customer_type)
				self.assertEqual(exp['total_packages'], p.total_packages)
				self.assertAlmostEqual(exp['total_price'], float(p.total_price))
				self.assertEqual(exp['is_final'], p.is_final)
				self.assertEqual(exp['sales_datetime'], p.sales_datetime)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)

		expected_transactions: List[Dict] = [
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 1,
				'last_modified_at': parser.parse('02/01/2020'),
				'recorded_datetime': parser.parse('02/02/2020'),
				'quantity_sold': 1,
				'total_price': 10.1,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 1,
				'last_modified_at': parser.parse('02/02/2020'),
				'recorded_datetime': parser.parse('02/03/2020'),
				'quantity_sold': 2,
				'total_price': 20.2,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 2,
				'last_modified_at': parser.parse('02/04/2020'),
				'recorded_datetime': parser.parse('02/05/2020'),
				'quantity_sold': 4,
				'total_price': 40.4,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 2,
				'last_modified_at': parser.parse('02/05/2020'),
				'recorded_datetime': parser.parse('02/06/2020'),
				'quantity_sold': 5,
				'total_price': 50.5,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 3,
				'last_modified_at': parser.parse('02/07/2020'),
				'recorded_datetime': parser.parse('02/08/2020'),
				'quantity_sold': 7,
				'total_price': 70.7,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 3,
				'last_modified_at': parser.parse('02/08/2020'),
				'recorded_datetime': parser.parse('02/09/2020'),
				'quantity_sold': 8,
				'total_price': 80.8,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 4,
				'last_modified_at': parser.parse('02/10/2020'),
				'recorded_datetime': parser.parse('02/11/2020'),
				'quantity_sold': 10,
				'total_price': 100.10,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 4,
				'last_modified_at': parser.parse('02/11/2020'),
				'recorded_datetime': parser.parse('02/12/2020'),
				'quantity_sold': 11,
				'total_price': 110.11,
			},
		]

		self._assert_transactions(expected_transactions, session_maker)

		# Run it a 2nd time
		sales_info_objects = sales_util.download_sales_info(ctx)
		sales_util.write_sales_info(sales_info_objects, session_maker, BATCH_SIZE=4)

		# Let's test that we fetch the tranactions a second time, we delete all
		# the previous ones and just keep the  most recent ones
		expected_transactions = [
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 1,
				'last_modified_at': parser.parse('02/01/2020'),
				'recorded_datetime': parser.parse('02/02/2020'),
				'quantity_sold': 1,
				'total_price': 10.1,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 1,
				'last_modified_at': parser.parse('02/02/2020'),
				'recorded_datetime': parser.parse('02/03/2020'),
				'quantity_sold': 2,
				'total_price': 20.2,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 1,
				'last_modified_at': parser.parse('02/03/2020'),
				'recorded_datetime': parser.parse('02/04/2020'),
				'quantity_sold': 3,
				'total_price': 30.3,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 2,
				'last_modified_at': parser.parse('02/04/2020'),
				'recorded_datetime': parser.parse('02/05/2020'),
				'quantity_sold': 4,
				'total_price': 40.4,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 2,
				'last_modified_at': parser.parse('02/05/2020'),
				'recorded_datetime': parser.parse('02/06/2020'),
				'quantity_sold': 5,
				'total_price': 50.5,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_id': 2,
				'last_modified_at': parser.parse('02/06/2020'),
				'recorded_datetime': parser.parse('02/07/2020'),
				'quantity_sold': 6,
				'total_price': 60.6,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 3,
				'last_modified_at': parser.parse('02/07/2020'),
				'recorded_datetime': parser.parse('02/08/2020'),
				'quantity_sold': 7,
				'total_price': 70.7,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 3,
				'last_modified_at': parser.parse('02/08/2020'),
				'recorded_datetime': parser.parse('02/09/2020'),
				'quantity_sold': 8,
				'total_price': 80.8,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 3,
				'last_modified_at': parser.parse('02/09/2020'),
				'recorded_datetime': parser.parse('02/10/2020'),
				'quantity_sold': 9,
				'total_price': 90.9,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 4,
				'last_modified_at': parser.parse('02/10/2020'),
				'recorded_datetime': parser.parse('02/11/2020'),
				'quantity_sold': 10,
				'total_price': 100.10,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 4,
				'last_modified_at': parser.parse('02/11/2020'),
				'recorded_datetime': parser.parse('02/12/2020'),
				'quantity_sold': 11,
				'total_price': 110.11,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_id': 4,
				'last_modified_at': parser.parse('02/12/2020'),
				'recorded_datetime': parser.parse('02/13/2020'),
				'quantity_sold': 12,
				'total_price': 120.12,
			},
		]

		self._assert_transactions(expected_transactions, session_maker)

