import datetime
import decimal
import json
import uuid
import requests
from dateutil import parser
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, NamedTuple, cast
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
	p['ReceiptNumber'] = p['Id']
	p['SalesCustomerType'] = p['Id'] + '-sales-customer-type'
	p['Id'] = p['Id'] + '-id'
	return p

class TestPopulateSalesTable(db_unittest.TestCase):

	def test_populate_harvests(self) -> None:
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
									'Id': 'a-p1',
									'LastModified': parser.parse('02/01/2020').isoformat(),
									'SalesDateTime': parser.parse('02/02/2020').isoformat(),
									'TotalPackages': 1,
									'TotalPrice': 10.1,
									'IsFinal': True,
								}),
								_sales_receipt_json({
									'Id': 'a-p2',
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
									'Id': 'a-p3',
									'LastModified': parser.parse('02/03/2020').isoformat(),
									'SalesDateTime': parser.parse('02/04/2020').isoformat(),
									'TotalPackages': 3,
									'TotalPrice': 30.3,
									'IsFinal': False,
								}),
								_sales_receipt_json({
									'Id': 'a-p4',
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
			}
		))
		sales_receipts_objects = sales_util.download_sales_receipts(ctx)
		sales_util.write_sales_receipts(sales_receipts_objects, session_maker, BATCH_SIZE=4)
		
		expected_receipts: List[Dict] = [
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_number': 'a-p1',
				'last_modified_at': parser.parse('02/01/2020'),
				'sales_datetime': parser.parse('02/02/2020'),
				'total_packages': 1,
				'total_price': 10.1,
				'is_final': True,
			},
			{
				'type': 'inactive',
				'company_id': company_id,
				'receipt_number': 'a-p2',
				'last_modified_at': parser.parse('02/02/2020'),
				'sales_datetime': parser.parse('02/03/2020'),
				'total_packages': 2,
				'total_price': 20.2,
				'is_final': True,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_number': 'a-p3',
				'last_modified_at': parser.parse('02/03/2020'),
				'sales_datetime': parser.parse('02/04/2020'),
				'total_packages': 3,
				'total_price': 30.3,
				'is_final': False,
			},
			{
				'type': 'active',
				'company_id': company_id,
				'receipt_number': 'a-p4',
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
				self.assertEqual(exp['receipt_number'], p.receipt_number)
				self.assertEqual(cast(Dict, p.payload)['ReceiptNumber'] + '-sales-customer-type', p.sales_customer_type)
				self.assertEqual(exp['total_packages'], p.total_packages)
				self.assertAlmostEqual(exp['total_price'], float(p.total_price))
				self.assertEqual(exp['is_final'], p.is_final)
				self.assertEqual(exp['sales_datetime'], p.sales_datetime)
				self.assertEqual(exp['last_modified_at'], p.last_modified_at)
				self.assertIsNotNone(p.payload)
