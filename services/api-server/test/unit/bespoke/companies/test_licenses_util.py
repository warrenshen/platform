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
from bespoke.companies.licenses_util import LicenseModificationDict, CompanyLicenseInsertInputDict
from bespoke_test.db import db_unittest, test_helper

def _add_license(company_id: str, session: Session, license_number: str) -> str:
	license = models.CompanyLicense()
	license.company_id = cast(GUID, company_id)
	license.license_number = license_number
	session.add(license)
	session.flush()
	license_row_id = str(license.id)
	return license_row_id

def _get_row_license_id(license_number: str, session: Session) -> GUID:
	license = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number == license_number).first()
	return license.id if license else None

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

def _get_company_deliveries(company_delivery_ids: List[str], session: Session) -> List[models.CompanyDelivery]:	
	deliveries = cast(
			List[models.CompanyDelivery],
			session.query(models.CompanyDelivery).filter(
				models.CompanyDelivery.id.in_(company_delivery_ids)).all())
	if not deliveries:
		raise errors.Error('No deliveries exists with company delivery IDs {}'.format(company_delivery_ids))

	return deliveries


def _create_transfer(shipper_license_number: str, transfer_type: str, transfer_id: str, company_id: str, session: Session) -> models.MetrcTransfer:
	tr = models.MetrcTransfer()
	tr.us_state = 'CA'
	tr.shipper_facility_license_number = shipper_license_number
	tr.transfer_id = transfer_id
	tr.transfer_payload = {
		'ShipperFacilityLicenseNumber': shipper_license_number
	}
	return tr

def _create_delivery(recipient_license_number: str, transfer_row_id: str, session: Session) -> models.MetrcDelivery:
	dlvry = models.MetrcDelivery()
	dlvry.us_state = 'CA'
	dlvry.recipient_facility_license_number = recipient_license_number
	dlvry.transfer_row_id = cast(GUID, transfer_row_id)
	return dlvry 

AddDeliveryAndTransferResp = TypedDict('AddDeliveryAndTransferResp', {
	'company_delivery_row_ids': List[str]
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

	company_delivery_row_ids = []

	for i in range(num_deliveries):
		dl = _create_delivery(recipient_license_number, 
			transfer_row_id=transfer_row_id, 
			session=session
		)
		session.add(dl)
		session.flush()
		delivery_row_id = str(dl.id)

		company_delivery = models.CompanyDelivery(
			license_number='abcd',
			us_state='CA',
			transfer_type=transfer_type,
			delivery_type=None
		)
		company_delivery.transfer_row_id = cast(Any, transfer_row_id)
		company_delivery.delivery_row_id = cast(Any, delivery_row_id)
		company_delivery.company_id = cast(Any, company_id)
		company_delivery.vendor_id = cast(GUID, _get_company_id_from_license_number(shipper_license_number, session))
		company_delivery.payor_id = cast(GUID, _get_company_id_from_license_number(recipient_license_number, session))

		session.add(company_delivery)
		session.flush()
		company_delivery_row_ids.append(str(company_delivery.id))

	return AddDeliveryAndTransferResp(
		company_delivery_row_ids=company_delivery_row_ids
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
			company_delivery_ids = resp['company_delivery_row_ids']

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are setup before modification
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)
			for delivery in company_deliveries:
				self.assertEqual(company_id, str(delivery.vendor_id))
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
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)

			for delivery in company_deliveries:
				self.assertEqual(None, delivery.vendor_id)
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
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)

			for delivery in company_deliveries:
				self.assertEqual(None, delivery.vendor_id)
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
			company_delivery_ids = resp['company_delivery_row_ids']

		with session_scope(session_maker) as session:
			# Assert the vendor_id and payor_id are setup before modification
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)

			for delivery in company_deliveries:
				self.assertEqual(None, delivery.vendor_id)
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
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)
			
			for delivery in company_deliveries:
				self.assertEqual(company_id, str(delivery.vendor_id))
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
			company_deliveries = _get_company_deliveries(company_delivery_ids, session)
			
			for delivery in company_deliveries:
				self.assertEqual(company_id, str(delivery.vendor_id))
				self.assertEqual(company_id2, str(delivery.payor_id))
				self.assertEqual('OUTGOING_TO_PAYOR', delivery.delivery_type)


class TestUpdateBulkLicenses(db_unittest.TestCase):

	def test_bulk_update_licenses_few_fields_specified(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		with session_scope(session_maker) as session:
			license_row_id = _add_license(company_id, session, license_number='abcd')
			licenses = session.query(models.CompanyLicense).all()
			self.assertEqual(1, len(licenses))			


		with session_scope(session_maker) as session:
			_, err = licenses_util.bulk_update_licenses(
				company_license_inputs=[
					CompanyLicenseInsertInputDict(
						company_id=company_id2,
						license_number='abcd',
					),
					CompanyLicenseInsertInputDict(
						company_id=company_id,
						license_number='efgh',
					)
				],
				session=session
			)
			self.assertIsNone(err)

		expected_licenses = [
			{
				'company_id': company_id2,
				'license_number': 'abcd',
			},
			{
				'company_id': company_id,
				'license_number': 'efgh'
			}
		]

		with session_scope(session_maker) as session:
			licenses = session.query(models.CompanyLicense).order_by(
				models.CompanyLicense.created_at).all()
			self.assertEqual(len(expected_licenses), len(licenses))

			for i in range(len(expected_licenses)):
				exp = expected_licenses[i]
				actual = licenses[i]
				self.assertEqual(exp['company_id'], str(actual.company_id))
				self.assertEqual(None, actual.file_id)
				self.assertEqual(exp['license_number'], actual.license_number)
				self.assertEqual(False, actual.is_deleted)

	def test_bulk_update_licenses_many_fields_specified(self) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)
		company_id2 = seed.get_company_id('company_admin', index=1)
		with session_scope(session_maker) as session:
			license_row_id = _add_license(company_id, session, license_number='abcd')
			licenses = session.query(models.CompanyLicense).all()
			self.assertEqual(1, len(licenses))			


		with session_scope(session_maker) as session:
			_, err = licenses_util.bulk_update_licenses(
				company_license_inputs=[
					CompanyLicenseInsertInputDict(
						company_id=company_id2,
						license_number='abcd',
						rollup_id='id1',
						legal_name='legal1',
						is_current=False,
						license_status='status1',
						license_category='processor',
						license_description='desc1',
						expiration_date='01/05/2020',
						us_state='CA',
						estimate_zip='95014',
					),
					CompanyLicenseInsertInputDict(
						company_id=company_id,
						license_number='efgh',
						rollup_id='id2',
						legal_name='legal2',
						is_current=False,
						license_status='status2',
						license_category='retailer',
						license_description='desc2',
						expiration_date='01/06/2020',
						us_state='OR',
					),
					CompanyLicenseInsertInputDict(
						company_id=None,
						license_number='ijkl',
						rollup_id='id3',
						legal_name='legal3',
						is_current=False,
						license_status='status3',
						license_category='retailer',
						license_description=None,
						expiration_date=None,
						us_state='CA',
						estimate_zip='94025',
						estimate_latitude=37.452961,
						estimate_longitude=-122.181725,
					)
				],
				session=session
			)
			self.assertIsNone(err)

		expected_licenses = [
			dict(
				company_id=company_id2,
				license_number='abcd',
				rollup_id='id1',
				legal_name='legal1',
				is_current=False,
				license_status='status1',
				license_category='processor',
				license_description='desc1',
				expiration_date='01/05/2020',
				us_state='CA',
				estimate_zip='95014',
			),
			dict(
				company_id=company_id,
				license_number='efgh',
				rollup_id='id2',
				legal_name='legal2',
				is_current=False,
				license_status='status2',
				license_category='retailer',
				license_description='desc2',
				expiration_date='01/06/2020',
				us_state='OR',
			),
			dict(
				company_id=None,
				license_number='ijkl',
				rollup_id='id3',
				legal_name='legal3',
				is_current=False,
				license_status='status3',
				license_category='retailer',
				license_description=None,
				expiration_date=None,
				us_state='CA',
				estimate_zip='94025',
				estimate_latitude=37.452961,
				estimate_longitude=-122.181725,
			),
		]

		with session_scope(session_maker) as session:
			licenses = session.query(models.CompanyLicense).order_by(
				models.CompanyLicense.created_at
			).all()
			self.assertEqual(len(expected_licenses), len(licenses))

			for i in range(len(expected_licenses)):
				exp = expected_licenses[i]
				actual = licenses[i]
				self.assertEqual(exp['company_id'], str(actual.company_id) if actual.company_id else None)
				self.assertEqual(None, actual.file_id)
				self.assertEqual(exp['license_number'], actual.license_number)
				self.assertEqual(False, actual.is_deleted)
				self.assertEqual(exp['rollup_id'], actual.rollup_id)
				self.assertEqual(exp['legal_name'], actual.legal_name)
				self.assertEqual(exp['is_current'], actual.is_current)
				self.assertEqual(exp['license_status'], actual.license_status)
				self.assertEqual(exp['license_category'], actual.license_category)
				self.assertEqual(exp['license_description'], actual.license_description)
				self.assertEqual(exp['expiration_date'], date_util.date_to_str(actual.expiration_date) if actual.expiration_date else None)
				self.assertEqual(exp['us_state'], actual.us_state)
				self.assertEqual(exp['estimate_zip'] if 'estimate_zip' in exp else None, actual.estimate_zip)
				self.assertEqual(
					exp['estimate_latitude'] if 'estimate_latitude' in exp else None,
					float(actual.estimate_latitude) if actual.estimate_latitude else None
				)
				self.assertEqual(
					exp['estimate_longitude'] if 'estimate_longitude' in exp else None,
					float(actual.estimate_longitude) if actual.estimate_longitude else None
				)
