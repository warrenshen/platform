import datetime
import json

from datetime import timedelta
from dateutil import parser
from sqlalchemy.orm.session import Session
from typing import Any, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.db import models
from bespoke.date import date_util
from bespoke.metrc import metrc_common_util
from bespoke.metrc.metrc_common_util import CompanyInfo


class TransferPackages(object):

	def __init__(self, delivery_id: str, transfer_packages: List[Dict]) -> None:
		self.delivery_id = delivery_id
		self._packages = transfer_packages
		for package in self._packages:
			package['DeliveryId'] = delivery_id

	def get_package_ids(self) -> List[str]:
		return [t['PackageId'] for t in self._packages]

	def get_package_models(self, transfer_id: str) -> List[models.MetrcPackage]:
		metrc_packages = []
		for package in self._packages:
			p = models.MetrcPackage()
			p.package_id = package['PackageId']
			p.transfer_id = cast(Any, transfer_id)
			p.delivery_id = package['DeliveryId']
			p.label = package['PackageLabel']
			p.type = package['PackageType']
			p.product_name = package['ProductName']
			p.package_payload = package
			# TODO(dlluncor): Fill in lab results information
			p.lab_results_payload = {}
			p.lab_results_status = ''
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
			tr.delivery_id = t['DeliveryId']
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
		
		for metrc_transfer in metrc_transfers:
			session.add(metrc_transfer)
			session.flush()
			transfer_id = metrc_transfer.id

			delivery_id = metrc_transfer.delivery_id
			resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
			t_packages_json = json.loads(resp.content)

			metrc_packages = TransferPackages(delivery_id, t_packages_json).get_package_models(
				transfer_id=transfer_id
			)
			for metrc_package in metrc_packages:
				session.add(metrc_package)

	return True, None

