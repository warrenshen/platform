import datetime
import json
import logging
from datetime import timedelta
from dateutil import parser
from sqlalchemy.orm.session import Session
from typing import Any, Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import models
from bespoke.metrc import metrc_common_util
from bespoke.metrc.metrc_common_util import CompanyInfo
from dateutil import parser
from sqlalchemy.orm.session import Session

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


@errors.return_error_tuple
def populate_transfers_table(cur_date: datetime.date, company_info: CompanyInfo, session: Session) -> Tuple[bool, errors.Error]:

	for license in company_info.licenses:
		logging.info('Downloading transfers for company "{}" on date: {}'.format(
			company_info.name, cur_date
		))
		rest = metrc_common_util.REST(
			metrc_common_util.AuthDict(
				vendor_key=license['vendor_key'],
				user_key=company_info.user_key
			),
			license_number=license['license_number'],
			us_state=license['us_state']
		)

		cur_date_str = cur_date.strftime('%m/%d/%Y')
		resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
		transfers = json.loads(resp.content)
		metrc_transfers = Transfers.build(transfers).get_transfer_models(
			company_id=company_info.company_id,
			license_id=license['license_id']
		)

		all_metrc_packages = []
		package_id_to_metrc_transfer = {}

		for metrc_transfer in metrc_transfers:
			logging.info('Downloading data for metrc transfer delivery_id={}'.format(metrc_transfer.delivery_id))
			delivery_id = metrc_transfer.delivery_id
			resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
			t_packages_json = json.loads(resp.content)

			packages = TransferPackages(delivery_id, t_packages_json)
			package_ids = packages.get_package_ids()

			lab_tests = []
			for package_id in package_ids:
				resp = rest.get(f'/labtests/v1/results?packageId={package_id}')
				lab_test_json = json.loads(resp.content)
				#lab_test_json = [] # Use an empty list if you want to speed things up
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

	return True, None

