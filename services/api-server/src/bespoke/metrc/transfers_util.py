import datetime
import json
import logging
from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Any, Callable, Dict, Iterable, List, Tuple, cast

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
	'packages_wholesale_api': int,
	'lab_results_api': int
})

class LabTest(object):

	def __init__(self, lab_test_json: List[Dict]) -> None:
		self._lab_test_results = lab_test_json # its an array that comes from the API

	def get_results_array(self) -> List[Dict]:
		return self._lab_test_results

	def get_status(self) -> str:
		if not self._lab_test_results:
			return 'unknown'

		for result in self._lab_test_results:
			if not result['TestPassed']:
				return 'failed'

		return 'passed'

def get_final_lab_status(lab_result_statuses: List[str]) -> str:
	final_lab_results_status = "unknown"

	for lab_results_status in lab_result_statuses:
		if lab_results_status == "failed":
			return "failed"
		elif lab_results_status == "passed":
			final_lab_results_status = "passed"

	return final_lab_results_status

def chunker(seq: List, size: int) -> Iterable[List]:
	return (seq[pos:pos + size] for pos in range(0, len(seq), size))

class TransferPackages(object):

	def __init__(self, delivery_id: str, transfer_packages: List[Dict], transfer_packages_wholesale: List[Dict]) -> None:
		self.delivery_id = delivery_id
		self._packages = transfer_packages
		self._packages_wholesale = transfer_packages_wholesale
		for package in self._packages:
			package['DeliveryId'] = delivery_id

	def get_package_ids(self) -> List[str]:
		return [t['PackageId'] for t in self._packages]

	def get_package_models(self, lab_tests: List[LabTest]) -> Tuple[List[models.MetrcPackage], str]:
		# Return list of MetrcPackage models and lab results status
		# of the Transfer that all these packages belong to.
		metrc_packages = []
		transfer_lab_results_status = "unknown"

		package_id_to_package_wholesale = {}
		for package_wholesale in self._packages_wholesale:
			package_id_to_package_wholesale[package_wholesale['PackageId']] = package_wholesale

		lab_statuses = []

		for i in range(len(self._packages)):
			package = self._packages[i]

			package_id = package['PackageId']
			package_wholesale = package_id_to_package_wholesale.get(package_id)

			p = models.MetrcPackage()
			p.package_id = '{}'.format(package_id)
			p.delivery_id = '{}'.format(package['DeliveryId'])
			p.label = package['PackageLabel']
			p.type = package['PackageType']
			p.product_name = package['ProductName']
			p.product_category_name = package['ProductCategoryName']
			p.shipped_quantity = package['ShippedQuantity']
			# We do not store lab results json for now.
			p.lab_results_payload = None
			# p.lab_results_payload = {
			# 	'lab_results': lab_tests[i].get_results_array()
			# }
			p.lab_results_status = lab_tests[i].get_status()

			if package_wholesale:
				p.shipper_wholesale_price = package_wholesale.get('ShipperWholesalePrice')
				package['ShipperWholesalePrice'] = package_wholesale.get('ShipperWholesalePrice')
				package['ReceiverWholesalePrice'] = package_wholesale.get('ReceiverWholesalePrice')

			p.package_payload = package

			metrc_packages.append(p)

			lab_statuses.append(p.lab_results_status)

		return metrc_packages, get_final_lab_status(lab_statuses)

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

class MetrcTransferObj(object):
	"""Wrapper object for a metrc transfer DB object and delivery IDs"""

	def __init__(self, metrc_transfer: models.MetrcTransfer, deliveries: List[models.MetrcDelivery]) -> None:
		self.metrc_transfer = metrc_transfer
		self.deliveries = deliveries

	def get_delivery_ids(self) -> List[str]:
		return [delivery.delivery_id for delivery in self.deliveries]

class Transfers(object):

	def __init__(self, transfers: List[Dict]) -> None:
		self._transfers = transfers

	@staticmethod
	def build(transfers: List[Dict]) -> 'Transfers':
		return Transfers(transfers)

	def get_transfer_objs(self, rest: metrc_common_util.REST, company_id: str, license_id: str, transfer_type: str) -> List[MetrcTransferObj]:
		metrc_transfer_objs = []

		for t in self._transfers:
			tr = models.MetrcTransfer()
			tr.company_id = cast(Any, company_id)
			tr.license_id = cast(Any, license_id)
			tr.transfer_id = '{}'.format(t['Id'])
			tr.shipper_facility_license_number = t['ShipperFacilityLicenseNumber']
			tr.shipper_facility_name = t['ShipperFacilityName']
			tr.created_date = parser.parse(t['CreatedDateTime']).date() if t['CreatedDateTime'] else None
			tr.manifest_number = t['ManifestNumber']
			tr.shipment_type_name = t['ShipmentTypeName']
			tr.shipment_transaction_type = t['ShipmentTransactionType']
			tr.transfer_payload = t
		
			deliveries = []
			if transfer_type == TransferType.INCOMING:
				d = models.MetrcDelivery()
				d.delivery_id = '{}'.format(t['DeliveryId'])
				d.recipient_facility_license_number = t['RecipientFacilityLicenseNumber']
				d.recipient_facility_name = t['RecipientFacilityName']
				d.shipment_type_name = t['ShipmentTypeName']
				d.shipment_transaction_type = t['ShipmentTransactionType']
				d.received_datetime = parser.parse(t['ReceivedDateTime']) if t['ReceivedDateTime'] else None
				d.delivery_payload = {}
				deliveries.append(d)
			else:
				outgoing_transfer_id = t['Id']
				delivery_resp = rest.get(f'/transfers/v1/{outgoing_transfer_id}/deliveries')
				delivery_json_arr = cast(List[Dict], json.loads(delivery_resp.content))

				for delivery_json in delivery_json_arr:
					d = models.MetrcDelivery()
					d.delivery_id = '{}'.format(delivery_json['Id'])
					d.recipient_facility_license_number = delivery_json['RecipientFacilityLicenseNumber']
					d.recipient_facility_name = delivery_json['RecipientFacilityName']
					d.shipment_type_name = delivery_json['ShipmentTypeName']
					d.shipment_transaction_type = delivery_json['ShipmentTransactionType']
					d.received_datetime = parser.parse(delivery_json['ReceivedDateTime']) if delivery_json['ReceivedDateTime'] else None
					d.delivery_payload = delivery_json
					deliveries.append(d)

			transfer_obj = MetrcTransferObj(
				metrc_transfer=tr,
				deliveries=deliveries
			)
			metrc_transfer_objs.append(transfer_obj)

		return metrc_transfer_objs

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

class TransferType(object):
	INCOMING = 'INCOMING'
	OUTGOING = 'OUTGOING'

def _match_and_add_licenses_to_transfers(
	metrc_transfer_objs: List[MetrcTransferObj],
	transfer_type: str,
	session: Session) -> None:

	# Vendor licenses lookup
	shipper_license_numbers = []
	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
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
	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		recipient_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['RecipientFacilityLicenseNumber'])
		recipient_license_numbers.append(recipient_license_number)

	recipient_licenses = session.query(models.CompanyLicense).filter(
		models.CompanyLicense.license_number.in_(recipient_license_numbers)
	).all()
	recipient_license_to_company_id = {}
	for recipient_license in recipient_licenses:
		recipient_license_to_company_id[recipient_license.license_number] = str(recipient_license.company_id)

	# Match based on license number
	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		shipper_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['ShipperFacilityLicenseNumber'])
		vendor_company_id = shipper_license_to_company_id.get(shipper_license_number)
		if vendor_company_id:
			metrc_transfer.vendor_id = cast(Any, vendor_company_id)

		recipient_license_number = '{}'.format(cast(Dict, metrc_transfer.transfer_payload)['RecipientFacilityLicenseNumber'])
		recipient_company_id = recipient_license_to_company_id.get(recipient_license_number)
		if recipient_company_id:
			metrc_transfer.payor_id = cast(Any, recipient_company_id)

		company_matches_via_licenses = vendor_company_id and recipient_company_id and vendor_company_id == recipient_company_id
		company_matches_via_ids = vendor_company_id and vendor_company_id == metrc_transfer.company_id
		if company_matches_via_licenses or company_matches_via_ids:
			metrc_transfer.transfer_type = f'{transfer_type}_INTERNAL'
		elif transfer_type == TransferType.INCOMING:
			metrc_transfer.transfer_type = 'INCOMING_FROM_VENDOR'
		elif transfer_type == TransferType.OUTGOING:
			metrc_transfer.transfer_type = 'OUTGOING_TO_PAYOR'

@errors.return_error_tuple
def populate_transfers_table(
	cur_date: datetime.date,
	company_info: CompanyInfo,
	license: LicenseAuthDict,
	session: Session) -> Tuple[RequestStatusesDict, errors.Error]:

	## Setup

	logging.info('Downloading transfers for company "{}" for last modified date {} with license {}'.format(
		company_info.name, cur_date, license['license_number']
	))

	request_status = RequestStatusesDict(
		transfers_api=UNKNOWN_STATUS_CODE,
		packages_api=UNKNOWN_STATUS_CODE,
		packages_wholesale_api=UNKNOWN_STATUS_CODE,
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

	## Fetch transfers

	# Incoming
	try:
		resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
		incoming_transfers = json.loads(resp.content)
		request_status['transfers_api'] = 200
	except errors.Error as e:
		request_status['transfers_api'] = e.details.get('status_code')
		return request_status, e

	incoming_metrc_transfer_objs = Transfers.build(incoming_transfers).get_transfer_objs(
		rest=rest,
		company_id=company_info.company_id,
		license_id=license['license_id'],
		transfer_type=TransferType.INCOMING
	)
	# Look up company ids for vendors that might match, and use those
	# licenses to determine what kind of transfer this is
	_match_and_add_licenses_to_transfers(
		incoming_metrc_transfer_objs,
		transfer_type=TransferType.INCOMING,
		session=session
	)

	# Outgoing
	try:
		resp = rest.get('/transfers/v1/outgoing', time_range=[cur_date_str])
		outgoing_transfers = json.loads(resp.content)
		request_status['transfers_api'] = 200
	except errors.Error as e:
		request_status['transfers_api'] = e.details.get('status_code')
		return request_status, e

	outgoing_metrc_transfer_objs = Transfers.build(outgoing_transfers).get_transfer_objs(
		rest=rest,
		company_id=company_info.company_id,
		license_id=license['license_id'],
		transfer_type=TransferType.OUTGOING
	)
	_match_and_add_licenses_to_transfers(
		outgoing_metrc_transfer_objs,
		transfer_type=TransferType.OUTGOING,
		session=session
	)


	metrc_transfer_objs = incoming_metrc_transfer_objs + outgoing_metrc_transfer_objs

	## Fetch packages and lab results
	all_metrc_packages = []
	all_delivery_ids = []
	# So we can map a package back to its parent transfer's delivery ID
	package_id_to_delivery_id = {}

	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		lab_result_statuses_for_transfer = []

		for delivery_id in metrc_transfer_obj.get_delivery_ids():
			logging.info(f'Downloading packages for {TransferType.OUTGOING if TransferType.OUTGOING in metrc_transfer.transfer_type else TransferType.INCOMING} metrc transfer manifest number {metrc_transfer.manifest_number}, delivery ID {delivery_id}')

			all_delivery_ids.append(delivery_id)
			packages_api_failed = False
			try:
				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
				t_packages_json = json.loads(resp.content)
				request_status['packages_api'] = 200
			except errors.Error as e:
				if request_status['packages_api'] != 200:
					# Only update the request status if we haven't seen a 200 yet
					request_status['packages_api'] = e.details.get('status_code')
				packages_api_failed = True

			if packages_api_failed:
				continue

			try:
				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages/wholesale')
				t_packages_wholesale_json = json.loads(resp.content)
				request_status['packages_wholesale_api'] = 200
			except errors.Error as e:
				t_packages_wholesale_json = [] # If fetch fails, we set to empty array and continue.
				logging.error(f'Could not fetch packages wholesale for company {company_info.name} for transfer with delivery id {delivery_id}. {e}')
				request_status['packages_wholesale_api'] = e.details.get('status_code')

			packages = TransferPackages(delivery_id, t_packages_json, t_packages_wholesale_json)
			package_ids = packages.get_package_ids()

			# Flip this to True for debug use.
			skip_lab_tests = False

			lab_tests = []
			for package_id in package_ids:
				logging.info(f'Downloading lab results for metrc package package_id={package_id}')
				try:
					if skip_lab_tests:
						lab_test_json = []
					else:
						resp = rest.get(f'/labtests/v1/results?packageId={package_id}')
						lab_test_json = json.loads(resp.content)

					request_status['lab_results_api'] = 200
				except errors.Error as e:
					lab_test_json = [] # If fetch fails, we set to empty array and continue.
					logging.error(f'Could not fetch lab results for company {company_info.name} for package {package_id}. {e}')
					request_status['lab_results_api'] = e.details.get('status_code')

				lab_tests.append(LabTest(lab_test_json))

			metrc_packages, delivery_lab_results_status = packages.get_package_models(lab_tests=lab_tests)

			#delivery_obj.lab_results_status = delivery_lab_results_status
			lab_result_statuses_for_transfer.append(delivery_lab_results_status)

			for metrc_package in metrc_packages:
				package_id_to_delivery_id[metrc_package.package_id] = delivery_id
				all_metrc_packages.append(metrc_package)

		metrc_transfer.lab_results_status = get_final_lab_status(lab_result_statuses_for_transfer)

	## Write the transfers

	# Find previous transfers, update those that previously existed, add rows
	# that do not exist.
	transfer_ids = [tr_obj.metrc_transfer.transfer_id for tr_obj in metrc_transfer_objs]
	prev_metrc_transfers = session.query(models.MetrcTransfer).filter(
		models.MetrcTransfer.transfer_id.in_(transfer_ids)
	)
	transfer_id_to_prev_transfer = {}
	for prev_transfer in prev_metrc_transfers:
		transfer_id_to_prev_transfer[prev_transfer.transfer_id] = prev_transfer

	delivery_id_to_transfer_row_id = {}

	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		if metrc_transfer.transfer_id in transfer_id_to_prev_transfer:
			# update
			prev_transfer = transfer_id_to_prev_transfer[metrc_transfer.transfer_id]

			# Assume these stay the same:
			# company_id
			# license_id
			# created_at
			# transfer_id
			prev_transfer.shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
			prev_transfer.shipper_facility_name = metrc_transfer.shipper_facility_name
			prev_transfer.created_date = metrc_transfer.created_date
			prev_transfer.manifest_number = metrc_transfer.manifest_number
			prev_transfer.shipment_type_name = metrc_transfer.shipment_type_name
			prev_transfer.shipment_transaction_type = metrc_transfer.shipment_transaction_type
			prev_transfer.transfer_payload = metrc_transfer.transfer_payload
			prev_transfer.vendor_id = metrc_transfer.vendor_id
			prev_transfer.payor_id = metrc_transfer.payor_id
			prev_transfer.transfer_type = metrc_transfer.transfer_type
			prev_transfer.updated_at = metrc_transfer.updated_at
			prev_transfer.lab_results_status = metrc_transfer.lab_results_status

			for delivery_id in metrc_transfer_obj.get_delivery_ids():
				delivery_id_to_transfer_row_id[delivery_id] = str(prev_transfer.id)
		else:
			# add
			session.add(metrc_transfer)
			session.flush()

			for delivery_id in metrc_transfer_obj.get_delivery_ids():
				delivery_id_to_transfer_row_id[delivery_id] = str(metrc_transfer.id)

	## Write deliveries

	prev_metrc_deliveries = session.query(models.MetrcDelivery).filter(
		models.MetrcDelivery.delivery_id.in_(all_delivery_ids)
	)
	delivery_id_to_prev_delivery = {}
	for prev_delivery in prev_metrc_deliveries:
		delivery_id_to_prev_delivery[prev_delivery.delivery_id] = prev_delivery

	delivery_id_to_delivery_row_id = {}

	for metrc_transfer_obj in metrc_transfer_objs:
		for delivery in metrc_transfer_obj.deliveries:
			transfer_row_id = delivery_id_to_transfer_row_id[delivery.delivery_id]

			if delivery.delivery_id in delivery_id_to_prev_delivery:
				# update
				prev_delivery = delivery_id_to_prev_delivery[delivery.delivery_id]
				delivery_id_to_delivery_row_id[delivery.delivery_id] = str(prev_delivery.id)

				# delivery_id - no change

				prev_delivery.transfer_row_id = cast(Any, transfer_row_id)
				prev_delivery.recipient_facility_license_number = delivery.recipient_facility_license_number
				prev_delivery.recipient_facility_name = delivery.recipient_facility_name
				prev_delivery.shipment_type_name = delivery.shipment_type_name
				prev_delivery.shipment_transaction_type = delivery.shipment_transaction_type
				prev_delivery.received_datetime = delivery.received_datetime
				prev_delivery.delivery_payload = delivery.delivery_payload
			else:
				# add
				delivery.transfer_row_id = cast(Any, transfer_row_id)

				session.add(delivery)
				session.flush()

				# This must come AFTER session.flush()
				delivery_id_to_delivery_row_id[delivery.delivery_id] = str(delivery.id)

	## Write packages

	# Find previous packages, update those that previously existed, add rows
	# that do not exist.
	BATCH_SIZE = 100
	package_ids = [pkg.package_id for pkg in all_metrc_packages]
	prev_metrc_packages = []
	for package_ids_chunk in chunker(package_ids, BATCH_SIZE):
		prev_metrc_packages_chunk = cast(List[models.MetrcPackage], session.query(models.MetrcPackage).filter(
			models.MetrcPackage.package_id.in_(package_ids_chunk)
		))
		prev_metrc_packages.extend(prev_metrc_packages_chunk)

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		package_id_to_prev_package[prev_metrc_package.package_id] = prev_metrc_package 

	# Write the packages
	for metrc_package in all_metrc_packages:
		cur_delivery_id = package_id_to_delivery_id[metrc_package.package_id]
		transfer_row_id = delivery_id_to_transfer_row_id[cur_delivery_id]
		delivery_row_id = delivery_id_to_delivery_row_id[metrc_package.delivery_id]

		if metrc_package.package_id in package_id_to_prev_package:
			# update

			prev_metrc_package = package_id_to_prev_package[metrc_package.package_id]
			prev_metrc_package.transfer_row_id = cast(Any, transfer_row_id)
			prev_metrc_package.delivery_row_id = cast(Any, delivery_row_id)
			# package_id - no need to update
			# created_at - no need to update
			prev_metrc_package.delivery_id = metrc_package.delivery_id
			prev_metrc_package.label = metrc_package.label
			prev_metrc_package.type = metrc_package.type
			prev_metrc_package.product_name = metrc_package.product_name
			prev_metrc_package.product_category_name = metrc_package.product_category_name
			prev_metrc_package.shipped_quantity = metrc_package.shipped_quantity
			prev_metrc_package.shipper_wholesale_price = metrc_package.shipper_wholesale_price
			prev_metrc_package.package_payload = metrc_package.package_payload
			prev_metrc_package.lab_results_payload = metrc_package.lab_results_payload
			prev_metrc_package.lab_results_status = metrc_package.lab_results_status
			prev_metrc_package.updated_at = metrc_package.updated_at
		else:
			# add
			metrc_package.transfer_row_id = cast(Any, transfer_row_id)
			metrc_package.delivery_row_id = cast(Any, delivery_row_id)
			session.add(metrc_package)

	return request_status, None
