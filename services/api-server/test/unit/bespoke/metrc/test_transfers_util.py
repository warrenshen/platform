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
from bespoke.metrc import transfers_util
from bespoke.metrc.common import metrc_common_util
from bespoke.metrc.common.metrc_common_util import LicenseAuthDict, CompanyInfo

from bespoke_test.db import db_unittest, test_helper
from bespoke_test.metrc.metrc_test_helper import FakeREST, RequestKey

def _package_json(p: Dict) -> Dict:
	p['PackageLabel'] = p['PackageId'] + '-label'
	p['PackageType'] = p['PackageId'] + '-type'
	p['ProductName'] = p['PackageId'] + '-product-name'
	p['ProductCategoryName'] = p['PackageId'] + '-category-name'

	return p

class TestPopulateTransfersTable(db_unittest.TestCase):

	def test_populate_incoming_outgoing_transfers(self) -> None:
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
					url='/transfers/v1/incoming',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'Id': 'in-t1',
									'ShipperFacilityLicenseNumber': 'lic-shipper1', 
									'ShipperFacilityName': 'shipper1-name',
									'CreatedDateTime': parser.parse('01/01/2020').isoformat(),
									'ManifestNumber': 'in-t1-manifest',
									'ShipmentTypeName': 'ship-type-incoming-d3',
									'ShipmentTransactionType': 'ship-tx-type-incoming-d3',
									# Incoming fields
									'DeliveryId': 'incoming-d3',
									'RecipientFacilityLicenseNumber': 'lic-recip1',
									'RecipientFacilityName': 'facility-name-recip1',
									'ReceivedDateTime': parser.parse('01/02/2020').isoformat()
								}
							]
						}
					]
				},
				RequestKey(
					url='/transfers/v1/outgoing',
					time_range=('01/01/2020',)
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'Id': 'out-t1',
									'ShipperFacilityLicenseNumber': 'lic-shipper2', 
									'ShipperFacilityName': 'shipper2-name',
									'CreatedDateTime': parser.parse('01/03/2020').isoformat(),
									'ManifestNumber': 'out-t1-manifest',
									'ShipmentTypeName': 'ship-type-out-t1',
									'ShipmentTransactionType': 'ship-tx-type-out-t1'
								}
							]
						}
					]
				},
				RequestKey(
					url='/transfers/v1/out-t1/deliveries',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'Id': 'out-d1',
									'RecipientFacilityLicenseNumber': 'lic-recip2',
									'RecipientFacilityName': 'facility-name-recip2', 
									'ShipmentTypeName': 'ship-type-out-d1',
									'ShipmentTransactionType': 'ship-tx-type-out-d1',
									'ReceivedDateTime': parser.parse('01/04/2020').isoformat()
								}
							]
						}
					]
				},
				RequestKey(
					url='/transfers/v1/delivery/out-d1/packages',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_package_json({
									'Id': 'out-p1',
									'PackageId': 'out-pkg1-A',
									'ShippedQuantity': 3.0
								}),
								_package_json({
									'Id': 'out-p2',
									'PackageId': 'out-pkg2-B',
									'ShippedQuantity': 4.0
								})
							]
						}
					]
				},
				RequestKey(
					url='/transfers/v1/delivery/incoming-d3/packages',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								_package_json({
									'Id': 'in-p1',
									'PackageId': 'in-pkg1-A',
									'ShippedQuantity': 5.0
								}),
								_package_json({
									'Id': 'in-p2',
									'PackageId': 'in-pkg2-B',
									'ShippedQuantity': 6.0
								})
							]
						}
					]
				},
				RequestKey(
					url='/transfers/v1/delivery/out-d1/packages/wholesale',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'Id': 'out-p1-wholesale',
									'PackageId': 'out-pkg1-A',
									'ShipperWholesalePrice': 1.0,
									'ReceiverWholesalePrice': 2.0
								},
								{
									'Id': 'out-p2-wholesale',
									'PackageId': 'out-pkg2-B',
									'ShipperWholesalePrice': 3.0,
									'ReceiverWholesalePrice': 4.0
								}
							]
						}
					]
				},
				RequestKey(
					url='/labtests/v1/results?packageId=out-pkg1-A',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'TestPassed': True
								},
								{
									'TestPassed': False
								}
							]
						}
					]
				},
				RequestKey(
					url='/labtests/v1/results?packageId=out-pkg2-B',
					time_range=None
				): {
					'resps': [
						{
							'status': 'OK',
							'json': [
								{
									'TestPassed': True
								},
								{
									'TestPassed': True
								}
							]
						}
					]
				}
			}
			# NOTE: we skip the /wholesale and /lab_results queries for the out packages
		))
		success, err = transfers_util.populate_transfers_table(ctx, session_maker)
		if err:
			print(err.traceback)
		self.assertIsNone(err)

		expected_transfers: List[Dict] = [
			{
				'company_id': company_id,
				'license_id': license_id,
				'transfer_id': 'in-t1',
				'delivery_id': 'incoming-d3',
				'shipper_facility_license_number': 'lic-shipper1',
				'shipper_facility_name': 'shipper1-name',
				'created_date': parser.parse('01/01/2020').date(),
				'manifest_number': 'in-t1-manifest',
				'shipment_type_name': 'ship-type-incoming-d3',
				'shipment_transaction_type': 'ship-tx-type-incoming-d3',
				'type': 'INCOMING',
			},
			{
				'company_id': company_id,
				'license_id': license_id,
				'transfer_id': 'out-t1',
				'delivery_id': 'out-d1',
				'shipper_facility_license_number': 'lic-shipper2',
				'shipper_facility_name': 'shipper2-name',
				'created_date': parser.parse('01/03/2020').date(),
				'manifest_number': 'out-t1-manifest',
				'shipment_type_name': 'ship-type-out-t1',
				'shipment_transaction_type': 'ship-tx-type-out-t1',
				'type': 'OUTGOING',
			}
		]

		transfer_row_ids = []

		with session_scope(session_maker) as session:
			metrc_transfers = cast(List[models.MetrcTransfer], session.query(
				models.MetrcTransfer).order_by(models.MetrcTransfer.created_date).all())
			self.assertEqual(2, len(metrc_transfers))
			for i in range(len(metrc_transfers)):
				t = metrc_transfers[i]
				exp = expected_transfers[i]
				self.assertEqual(exp['company_id'], str(t.company_id))
				self.assertEqual(exp['license_id'], str(t.license_id))
				self.assertEqual(exp['transfer_id'], t.transfer_id)
				self.assertEqual(exp['shipper_facility_license_number'], t.shipper_facility_license_number)
				self.assertEqual(exp['shipper_facility_name'], t.shipper_facility_name)
				self.assertEqual(exp['created_date'], t.created_date)
				self.assertEqual(exp['manifest_number'], t.manifest_number)
				self.assertEqual(exp['shipment_type_name'], t.shipment_type_name)
				self.assertEqual(exp['shipment_transaction_type'], t.shipment_transaction_type)
				self.assertIsNotNone(t.transfer_payload)
				self.assertEqual(exp['type'], t.type)
				transfer_row_ids.append(str(t.id))

		expected_deliveries: List[Dict] = [
			{
				'delivery_id': 'incoming-d3',
				'recipient_facility_license_number': 'lic-recip1',
				'recipient_facility_name': 'facility-name-recip1',
				'shipment_type_name': 'ship-type-incoming-d3',
				'shipment_transaction_type': 'ship-tx-type-incoming-d3',
				'transfer_row_id': transfer_row_ids[0],
			},
			{
				'delivery_id': 'out-d1',
				'recipient_facility_license_number': 'lic-recip2',
				'recipient_facility_name': 'facility-name-recip2',
				'shipment_type_name': 'ship-type-out-d1',
				'shipment_transaction_type': 'ship-tx-type-out-d1',
				'transfer_row_id': transfer_row_ids[1],
			}
		]

		metrc_delivery_row_ids = []

		with session_scope(session_maker) as session:
			metrc_deliveries = cast(List[models.MetrcDelivery], session.query(
				models.MetrcDelivery).order_by(models.MetrcDelivery.received_datetime).all())
			self.assertEqual(2, len(metrc_deliveries))
			for i in range(len(metrc_deliveries)):
				d = metrc_deliveries[i]
				exp = expected_deliveries[i]
				self.assertEqual(exp['delivery_id'], d.delivery_id)
				self.assertEqual(exp['recipient_facility_license_number'], d.recipient_facility_license_number)
				self.assertEqual(exp['recipient_facility_name'], d.recipient_facility_name)
				self.assertEqual(exp['shipment_type_name'], d.shipment_type_name)
				self.assertEqual(exp['shipment_transaction_type'], d.shipment_transaction_type)
				self.assertIsNotNone(d.delivery_payload)
				self.assertEqual(exp['transfer_row_id'], str(d.transfer_row_id))
				self.assertEqual('UNKNOWN', d.delivery_type)
				metrc_delivery_row_ids.append(str(d.id))

		expected_packages: List[Dict] = [
			{
				'type': 'transfer_outgoing',
				'company_id': company_id,
				'package_id': 'out-pkg1-A',
				'delivery_id': 'out-d1',
				'shipped_quantity': 3.0,
				'lab_results_status': 'failed',
				'shipper_wholesale_price': 1.0,
				'receiver_wholesale_price': 2.0,
				'delivery_row_id': metrc_delivery_row_ids[1],
				'transfer_row_id': transfer_row_ids[1],
			},
			{
				'type': 'transfer_outgoing',
				'company_id': company_id,
				'package_id': 'out-pkg2-B',
				'delivery_id': 'out-d1',
				'shipped_quantity': 4.0,
				'lab_results_status': 'passed',
				'shipper_wholesale_price': 3.0,
				'receiver_wholesale_price': 4.0,
				'delivery_row_id': metrc_delivery_row_ids[1],
				'transfer_row_id': transfer_row_ids[1],
			},
			{
				'type': 'transfer_incoming',
				'company_id': company_id,
				'package_id': 'in-pkg1-A',
				'delivery_id': 'incoming-d3',
				'shipped_quantity': 5.0,
				'lab_results_status': 'unknown',
				'shipper_wholesale_price': None,
				'receiver_wholesale_price': None,
				'delivery_row_id': metrc_delivery_row_ids[0],
				'transfer_row_id': transfer_row_ids[0],
			},
			{
				'type': 'transfer_incoming',
				'company_id': company_id,
				'package_id': 'in-pkg2-B',
				'delivery_id': 'incoming-d3',
				'shipped_quantity': 6.0,
				'lab_results_status': 'unknown',
				'shipper_wholesale_price': None,
				'receiver_wholesale_price': None,
				'delivery_row_id': metrc_delivery_row_ids[0],
				'transfer_row_id': transfer_row_ids[0],
			}
		]

		with session_scope(session_maker) as session:
			metrc_packages = cast(List[models.MetrcTransferPackage], session.query(
				models.MetrcTransferPackage).order_by(models.MetrcTransferPackage.shipped_quantity).all())
			self.assertEqual(4, len(metrc_packages))
			for i in range(len(metrc_packages)):
				p = metrc_packages[i]
				exp = expected_packages[i]
				self.assertEqual(exp['type'], p.type)
				self.assertEqual(exp['company_id'], str(p.company_id))
				self.assertEqual(exp['package_id'], p.package_id)
				self.assertEqual(exp['delivery_id'], p.delivery_id)
				self.assertEqual(exp['package_id'] + '-label', p.package_label)
				self.assertEqual(exp['package_id'] + '-type', p.package_type)
				self.assertEqual(exp['package_id'] + '-product-name', p.product_name)
				self.assertEqual(exp['package_id'] + '-category-name', p.product_category_name)
				self.assertAlmostEqual(exp['shipped_quantity'], float(p.shipped_quantity) if p.shipped_quantity else None)
				self.assertEqual(exp['lab_results_status'], p.lab_results_status)
				self.assertEqual(exp['shipper_wholesale_price'], p.shipper_wholesale_price)
				self.assertEqual(exp['receiver_wholesale_price'], cast(Dict, p.package_payload).get('ReceiverWholesalePrice'))
				self.assertEqual(exp['delivery_row_id'], str(p.delivery_row_id))
				self.assertEqual(exp['transfer_row_id'], str(p.transfer_row_id))

