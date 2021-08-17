import datetime
import decimal

from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.db import db_constants

from bespoke_test.db import db_unittest
from bespoke.db import metrc_models_util

class TestDeliveryType(db_unittest.TestCase):

	def test_get_delivery_type_incoming(self) -> None:
		tests = [
			{
				'company_id': 'A',
				'shipper_company_id': None,
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.INCOMING,
				'delivery_type': 'INCOMING_UNKNOWN'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'A',
				'recipient_company_id': None,
				'transfer_type': db_constants.TransferType.INCOMING,
				'delivery_type': 'INCOMING_UNKNOWN'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'B',
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.INCOMING,
				'delivery_type': 'INCOMING_FROM_VENDOR'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'A',
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.INCOMING,
				'delivery_type': 'INCOMING_INTERNAL'
			}
		]
		for test in tests:
			self.assertEqual(test['delivery_type'], metrc_models_util.get_delivery_type(
				transfer_type=test['transfer_type'], 
				company_id=test['company_id'], 
				shipper_company_id=test['shipper_company_id'], 
				recipient_company_id=test['recipient_company_id']
			))

	def test_get_delivery_type_outgoing(self) -> None:
		tests = [
			{
				'company_id': 'A',
				'shipper_company_id': None,
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'OUTGOING_UNKNOWN'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'A',
				'recipient_company_id': None,
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'OUTGOING_UNKNOWN'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'B',
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'OUTGOING_TO_PAYOR'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'A',
				'recipient_company_id': 'A',
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'OUTGOING_INTERNAL'
			}
		]
		for test in tests:
			self.assertEqual(test['delivery_type'], metrc_models_util.get_delivery_type(
				transfer_type=test['transfer_type'], 
				company_id=test['company_id'], 
				shipper_company_id=test['shipper_company_id'], 
				recipient_company_id=test['recipient_company_id']
			))


	def test_get_delivery_type_unknown(self) -> None:
		tests = [
			{
				'company_id': 'A',
				'shipper_company_id': None,
				'recipient_company_id': None,
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'UNKNOWN'
			},
			{
				'company_id': 'A',
				'shipper_company_id': 'B',
				'recipient_company_id': 'C',
				'transfer_type': db_constants.TransferType.OUTGOING,
				'delivery_type': 'UNKNOWN'
			}
		]
		for test in tests:
			self.assertEqual(test['delivery_type'], metrc_models_util.get_delivery_type(
				transfer_type=test['transfer_type'], 
				company_id=test['company_id'], 
				shipper_company_id=test['shipper_company_id'], 
				recipient_company_id=test['recipient_company_id']
			))
