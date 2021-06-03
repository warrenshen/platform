import datetime
import json
import logging
from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Any, Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.metrc import metrc_common_util
from bespoke.metrc.metrc_common_util import (
	CompanyInfo, LicenseAuthDict, UNKNOWN_STATUS_CODE)
from dateutil import parser
from sqlalchemy.orm.session import Session

RequestStatusesDict = TypedDict('RequestStatusesDict', {
	'transfers_api': int,
	'packages_api': int,
	'lab_results_api': int
})

class LabTest(object):

	def __init__(self, lab_test_json: Dict) -> None:
		self._lab_test_results = lab_test_json # its an array that comes from the API

	def get_results_array(self) -> Dict:
		return self._lab_test_results

	def get_status(self) -> str:
		if not self._lab_test_results:
			return 'unknown'

		for result in self._lab_test_results:
			if not result['TestPassed']:
				return 'failed'

		return 'passed'

class TransferPackages(object):

	def __init__(self, delivery_id: str, transfer_packages: List[Dict]) -> None:
		self.delivery_id = delivery_id
		self._packages = transfer_packages
		for package in self._packages:
			package['DeliveryId'] = delivery_id

	def get_package_ids(self) -> List[str]:
		return [t['PackageId'] for t in self._packages]

	def get_package_models(self, transfer_id: str, lab_tests: List[LabTest]) -> List[models.MetrcPackage]:
		metrc_packages = []
		for i in range(len(self._packages)):
			package = self._packages[i]

			p = models.MetrcPackage()
			p.package_id = '{}'.format(package['PackageId'])
			p.transfer_id = cast(Any, transfer_id)
			p.delivery_id = '{}'.format(package['DeliveryId'])
			p.label = package['PackageLabel']
			p.type = package['PackageType']
			p.product_name = package['ProductName']
			p.package_payload = package
			p.lab_results_payload = {
				'lab_results': lab_tests[i].get_results_array()
			}
			p.lab_results_status = lab_tests[i].get_status()
			metrc_packages.append(p)

		return metrc_packages

	def to_rows(self, include_header: bool) -> List[List[str]]:
		col_specs = [
				('Delivery Id', 'DeliveryId'),
				('Package Id', 'PackageId'),
				('Package', 'PackageLabel'),
				('Package Type', 'PackageType'),
				('Item', 'ProductName'),
				('Item Category', 'ProductCategoryName'),
				('Item Strain Name', 'ItemStrainName'),
				('Item State', 'ShipmentPackageState'),
				('Received Qty', 'ReceivedQuantity'),
				('UoM', 'ReceivedUnitOfMeasureName'),
				('Item Unit Qty', 'ItemUnitQuantity'),
				('Item Unit Weight', 'ItemUnitWeight'),
				('Is Testing Sample', 'IsTestingSample')
				# ReceiverDollarAmount
		]
		return metrc_common_util.dicts_to_rows(self._packages, col_specs, include_header)

class Transfers(object):

	def __init__(self, transfers: List[Dict]) -> None:
		self._transfers = transfers

	@staticmethod
	def build(transfers: List[Dict]) -> 'Transfers':
		return Transfers(transfers)

	def get_delivery_ids(self) -> List[str]:
		return [t['DeliveryId'] for t in self._transfers]

	def get_transfer_models(self, company_id: str, license_id: str) -> List[models.MetrcTransfer]:
		metrc_transfers = []
		for t in self._transfers:
			tr = models.MetrcTransfer()
			tr.company_id = cast(Any, company_id)
			tr.license_id = cast(Any, license_id)
			tr.created_date = parser.parse(t['CreatedDateTime']).date()
			tr.delivery_id = '{}'.format(t['DeliveryId'])
			tr.manifest_number = t['ManifestNumber']
			tr.transfer_payload = t
			metrc_transfers.append(tr)

		return metrc_transfers

	def to_rows(self, include_header: bool) -> List[List[str]]:
		col_specs = [
				('Transfer Id', 'Id'),
				('Delivery Id', 'DeliveryId'),
				('Manifest', 'ManifestNumber'),
				('Origin Lic', 'ShipperFacilityLicenseNumber'),
				('Origin Facility', 'ShipperFacilityName'),
				# Origin Facility Type
				('Dest Lic', 'RecipientFacilityLicenseNumber'),
				('Destination Facility', 'RecipientFacilityName'),
				('Type', 'ShipmentTypeName'),
				('Received', 'ReceivedDateTime'),
				('Num Packages', 'PackageCount')
		]

		return metrc_common_util.dicts_to_rows(self._transfers, col_specs, include_header)

def _match_and_add_licenses_to_transfers(
	metrc_transfers: List[models.MetrcTransfer],
	transfer_type_prefix: str,
	session: Session) -> None:

	# Vendor licenses lookup
	shipper_license_numbers = []
	for metrc_transfer in metrc_transfers:
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		shipper_license_numbers.append(shipper_license_number)

	shipper_licenses = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number.in_(shipper_license_numbers)
	).all()
	shipper_license_to_company_id = {}
	for shipper_license in shipper_licenses:
		shipper_license_to_company_id[shipper_license.license_number] = str(shipper_license.company_id)

	# Recipient licenses lookup
	recipient_license_numbers = []
	for metrc_transfer in metrc_transfers:
		recipient_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['RecipientFacilityLicenseNumber'])
		recipient_license_numbers.append(recipient_license_number)

	recipient_licenses = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number.in_(recipient_license_numbers)
	).all()
	recipient_license_to_company_id = {}
	for recipient_license in recipient_licenses:
		recipient_license_to_company_id[recipient_license.license_number] = str(recipient_license.company_id)

	# Match based on license number
	for metrc_transfer in metrc_transfers:
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		vendor_company_id = shipper_license_to_company_id.get(shipper_license_number)
		if vendor_company_id:
			metrc_transfer.vendor_id = cast(Any, vendor_company_id)

		recipient_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['RecipientFacilityLicenseNumber'])
		recipient_company_id = recipient_license_to_company_id.get(recipient_license_number)

		company_matches_via_licenses = vendor_company_id and recipient_company_id and vendor_company_id == recipient_company_id
		company_matches_via_ids = vendor_company_id and vendor_company_id == metrc_transfer.company_id
		if company_matches_via_licenses or company_matches_via_ids:
			metrc_transfer.transfer_type = f'{transfer_type_prefix}_INTERNAL'
		else:
			metrc_transfer.transfer_type = f'{transfer_type_prefix}_FROM_VENDOR'


@errors.return_error_tuple
def populate_transfers_table(
	cur_date: datetime.date,
	company_info: CompanyInfo,
	license: LicenseAuthDict,
	session: Session) -> Tuple[RequestStatusesDict, errors.Error]:

	logging.info('Downloading transfers for company "{}" on date: {} with license {}'.format(
		company_info.name, cur_date, license['license_number']
	))

	request_status = RequestStatusesDict(
		transfers_api=UNKNOWN_STATUS_CODE,
		packages_api=UNKNOWN_STATUS_CODE,
		lab_results_api=UNKNOWN_STATUS_CODE
	)

	rest = metrc_common_util.REST(
		metrc_common_util.AuthDict(
			vendor_key=license['vendor_key'],
			user_key=license['user_key']
		),
		license_number=license['license_number'],
		us_state=license['us_state']
	)

	cur_date_str = cur_date.strftime('%m/%d/%Y')

	# Reference for when we want to fetch sales, plants, and plant batches info in the future.
	#===
	# try:
	# 	resp = rest.get('/sales/v1/receipts/active', time_range=[cur_date_str])
	# 	content = json.loads(resp.content)
	# 	print('success', 'sales')
	# 	# request_status['receipts_api'] = 200
	# except errors.Error as e:
	# 	print('failure', 'sales')
	# 	# request_status['receipts_api'] = e.details.get('status_code')
	# 	return request_status, e

	# try:
	# 	resp = rest.get('/plants/v1/vegetative', time_range=[cur_date_str])
	# 	content = json.loads(resp.content)
	# 	print('success', 'plants')
	# 	# request_status['plants_api'] = 200
	# except errors.Error as e:
	# 	print('failure', 'plants')
	# 	# request_status['plants_api'] = e.details.get('status_code')
	# 	return request_status, e

	# try:
	# 	resp = rest.get('/plantbatches/v1/active', time_range=[cur_date_str])
	# 	content = json.loads(resp.content)
	# 	print('success', 'plantbatches')
	# 	# request_status['plant_batches_api'] = 200
	# except errors.Error as e:
	# 	print('failure', 'plantbatches')
	# 	# request_status['plant_batches_api'] = e.details.get('status_code')
	# 	return request_status, e

	try:
		resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
		transfers = json.loads(resp.content)
		request_status['transfers_api'] = 200
	except errors.Error as e:
		request_status['transfers_api'] = e.details.get('status_code')
		return request_status, e

	metrc_transfers = Transfers.build(transfers).get_transfer_models(
		company_id=company_info.company_id,
		license_id=license['license_id']
	)

	all_metrc_packages = []
	package_id_to_metrc_transfer = {}

	# Look up company ids for vendors that might match, and use those licenses to
	# determine what kind of transfer this is
	_match_and_add_licenses_to_transfers(
		metrc_transfers,
		transfer_type_prefix='INCOMING',
		session=session
	)

	for metrc_transfer in metrc_transfers:
		logging.info('Downloading data for metrc transfer delivery_id={}'.format(metrc_transfer.delivery_id))
		delivery_id = metrc_transfer.delivery_id
		try:
			resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
			t_packages_json = json.loads(resp.content)
			request_status['packages_api'] = 200
		except errors.Error as e:
			request_status['packages_api'] = e.details.get('status_code')
			return request_status, e

		packages = TransferPackages(delivery_id, t_packages_json)
		package_ids = packages.get_package_ids()

		lab_tests = []
		for package_id in package_ids:
			try:
				resp = rest.get(f'/labtests/v1/results?packageId={package_id}')
				lab_test_json = json.loads(resp.content)
				request_status['lab_results_api'] = 200
			except errors.Error as e:
				lab_test_json = [] # If fetch fails, we set to empty array and continue.
				logging.error(f'Could not fetch lab results for company {company_info.name} for package {package_id}. {e}')
				request_status['lab_results_api'] = e.details.get('status_code')

			lab_tests.append(LabTest(lab_test_json))

		metrc_packages = packages.get_package_models(
			transfer_id=None,
			lab_tests=lab_tests
		)
		for metrc_package in metrc_packages:
			package_id_to_metrc_transfer[metrc_package.package_id] = metrc_transfer
			all_metrc_packages.append(metrc_package)

	# Delete packages before writing them
	package_ids = [pkg.package_id for pkg in all_metrc_packages]
	prev_metrc_packages = session.query(models.MetrcPackage).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	)
	for prev_metrc_package in prev_metrc_packages:
		cast(Callable, session.delete)(prev_metrc_package)

	session.flush()

	# Delete previous transfers which might be in the DB and overlap
	# with the delivery_ids that we are about to write to the DB
	delivery_ids = [tr.delivery_id for tr in metrc_transfers]
	prev_metrc_transfers = session.query(models.MetrcTransfer).filter(
		models.MetrcTransfer.delivery_id.in_(delivery_ids)
	)
	for prev_metrc_transfer in prev_metrc_transfers:
		cast(Callable, session.delete)(prev_metrc_transfer)

	session.flush()

	# Write the transfers and write the packages
	for metrc_transfer in metrc_transfers:
		session.add(metrc_transfer)

	session.flush()

	for metrc_package in all_metrc_packages:
		cur_metrc_package = package_id_to_metrc_transfer[metrc_package.package_id]
		transfer_id = cur_metrc_package.id
		metrc_package.transfer_id = transfer_id
		session.add(metrc_package)

	return request_status, None

