import datetime
import decimal
import json
import uuid
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, cast
from fastapi_utils.guid_type import GUID

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.companies import licenses_util
from bespoke.companies.licenses_util import LicenseModificationDict
from bespoke_test.db import db_unittest, test_helper

def _add_license(company_id: str, session: Session, license_number: str) -> str:
	license = models.CompanyLicense()
	license.company_id = cast(GUID, company_id)
	license.license_number = license_number
	session.add(license)
	session.flush()
	license_row_id = str(license.id)
	return license_row_id

def _delete_license(license_number: str, session: Session) -> None:
	existing_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.license_number == license_number).first())
	existing_license.is_deleted = True
	session.flush()

def _get_company_id_from_license_number(license_number: str, session: Session) -> str:
	existing_license = cast(
			models.CompanyLicense,
			session.query(models.CompanyLicense).filter(
				models.CompanyLicense.license_number == license_number).first())
	if existing_license:
		return str(existing_license.company_id)

	return None
	
def _get_transfer(transfer_row_id: str, session: Session) -> models.MetrcTransfer:	
	tr = cast(
			models.MetrcTransfer,
			session.query(models.MetrcTransfer).filter(
				models.MetrcTransfer.id == transfer_row_id).first())
	if not tr:
		raise errors.Error('No transfer exists for row ID {}'.format(transfer_row_id))

	return tr

def _get_deliveries(transfer_row_id: str, session: Session) -> List[models.MetrcDelivery]:	
	deliveries = cast(
			List[models.MetrcDelivery],
			session.query(models.MetrcDelivery).filter(
				models.MetrcDelivery.transfer_row_id == transfer_row_id).all())
	if not deliveries:
		raise errors.Error('No deliveries exists with transfer row IDs {}'.format(transfer_row_id))

	return deliveries

def _create_transfer(shipper_license_number: str, transfer_type: str, transfer_id: str, company_id: str, session: Session) -> models.MetrcTransfer:
	tr = models.MetrcTransfer()
	tr.shipper_facility_license_number = shipper_license_number
	tr.vendor_id = cast(GUID, _get_company_id_from_license_number(shipper_license_number, session))
	tr.type = transfer_type
	tr.transfer_id = transfer_id
	tr.company_id = cast(Any, company_id)
	tr.transfer_payload = {
		'ShipperFacilityLicenseNumber': shipper_license_number
	}
	return tr

def _create_delivery(recipient_license_number: str, transfer_row_id: str, session: Session) -> models.MetrcDelivery:
	dlvry = models.MetrcDelivery()
	dlvry.recipient_facility_license_number = recipient_license_number
	dlvry.transfer_row_id = cast(GUID, transfer_row_id)
	dlvry.payor_id = cast(GUID, _get_company_id_from_license_number(recipient_license_number, session))

	return dlvry 

AddDeliveryAndTransferResp = TypedDict('AddDeliveryAndTransferResp', {
	'transfer_row_id': str
})

def _add_deliveries_and_transfer(
	shipper_license_number: str,
	recipient_license_number: str,
	transfer_id: str,
	transfer_type: str,
	company_id: str,
	num_deliveries: int,
	session: Session) -> AddDeliveryAndTransferResp:
	tr = _create_transfer(
		shipper_license_number, transfer_type, transfer_id, 
		company_id=company_id, session=session
	)
	session.add(tr)
	session.flush()
	transfer_row_id = str(tr.id)

	for i in range(num_deliveries):
		dl = _create_delivery(recipient_license_number, 
			transfer_row_id=transfer_row_id, 
			session=session
		)
		session.add(dl)

	return AddDeliveryAndTransferResp(
		transfer_row_id=transfer_row_id
	)

class TestUpdateMetrcRowsOnLicenseChange(db_unittest.TestCase):

	def test_no_metrc_rows(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		with session_scope(session_maker) as session:
			license_row_id = _add_license(company_id, session, license_number='abcd')
			
		success, err = licenses_util.update_metrc_rows_on_license_change(LicenseModificationDict(
			license_row_id=license_row_id,
			license_number='abcd',
			op='DELETE'
		), session_maker)
		self.assertTrue(success)

	def test_delete_affects_vendor_id_and_payor_id(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		
		with session_scope(session_maker) as session:
			license_row_id = _add_license(company_id, session, license_number='abcd')
			license_row_id2 = _add_license(company_id2, session, license_number='efgh')
			resp = _add_deliveries_and_transfer(
				shipper_license_number='abcd',
				recipient_license_number='efgh',
				transfer_id='tr-1',
				transfer_type='OUTGOING',
				company_id=company_id,
				num_deliveries=1, 
				session=session
			)
			transfer_row_id = resp['transfer_row_id']

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are setup before modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(company_id, str(tr.vendor_id))
			for delivery in deliveries:
				self.assertEqual(company_id2, str(delivery.payor_id))

			_delete_license('abcd', session) # Delete the license associated with the vendor

		success, err = licenses_util.update_metrc_rows_on_license_change(LicenseModificationDict(
			license_row_id=license_row_id,
			license_number='abcd',
			op='DELETE'
		), session_maker)
		self.assertTrue(success, msg=err)

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are correct after modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(None, tr.vendor_id)
			for delivery in deliveries:
				self.assertEqual(company_id2, str(delivery.payor_id))

		with session_scope(session_maker) as session:
			_delete_license('efgh', session) # Delete the license associated with the payor

		success, err = licenses_util.update_metrc_rows_on_license_change(LicenseModificationDict(
			license_row_id=license_row_id,
			license_number='efgh',
			op='DELETE'
		), session_maker)
		self.assertTrue(success, msg=err)

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are correct after modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(None, tr.vendor_id)
			for delivery in deliveries:
				self.assertEqual(None, delivery.payor_id)

	def test_add_affects_vendor_id_and_payor_id(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		
		with session_scope(session_maker) as session:
			resp = _add_deliveries_and_transfer(
				shipper_license_number='abcd',
				recipient_license_number='efgh',
				transfer_id='tr-1',
				transfer_type='OUTGOING',
				company_id=company_id,
				num_deliveries=1, 
				session=session
			)
			transfer_row_id = resp['transfer_row_id']

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are setup before modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(None, tr.vendor_id)
			for delivery in deliveries:
				self.assertEqual(None, delivery.payor_id)
				self.assertEqual(None, delivery.delivery_type)

			license_row_id = _add_license(company_id, session, license_number='abcd')

		success, err = licenses_util.update_metrc_rows_on_license_change(LicenseModificationDict(
			license_row_id=license_row_id,
			license_number='abcd',
			op='INSERT'
		), session_maker)
		self.assertTrue(success, msg=err)

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are correct after modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(company_id, str(tr.vendor_id))
			for delivery in deliveries:
				self.assertEqual(None, delivery.payor_id)
				self.assertEqual('OUTGOING_UNKNOWN', delivery.delivery_type)

		with session_scope(session_maker) as session:
			# Add the license associated with the payor
			license_row_id2 = _add_license(company_id2, session, license_number='efgh')
			
		success, err = licenses_util.update_metrc_rows_on_license_change(LicenseModificationDict(
			license_row_id=license_row_id2,
			license_number='efgh',
			op='INSERT'
		), session_maker)
		self.assertTrue(success, msg=err)

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are correct after modification
			tr = _get_transfer(transfer_row_id, session)
			deliveries = _get_deliveries(transfer_row_id, session)
			self.assertEqual(company_id, str(tr.vendor_id))
			for delivery in deliveries:
				self.assertEqual(company_id2, str(delivery.payor_id))
				self.assertEqual('OUTGOING_TO_PAYOR', delivery.delivery_type)
