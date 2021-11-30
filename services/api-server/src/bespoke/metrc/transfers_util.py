import datetime
import json
import logging
from datetime import timedelta
from mypy_extensions import TypedDict
from typing import Any, Callable, Dict, Iterable, List, Tuple, cast

from bespoke import errors
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.db.metrc_models_util import (
		CompanyDeliveryObj, MetrcDeliveryObj, MetrcTransferObj
)
from bespoke.companies import licenses_util
from bespoke.metrc.common import metrc_common_util, package_common_util
from bespoke.metrc.common.package_common_util import (
	UNKNOWN_LAB_STATUS, TransferPackageObj
)
from bespoke.metrc.common.metrc_common_util import chunker
from dateutil import parser
from sqlalchemy.orm.session import Session

class LabTest(object):

	def __init__(self, lab_testing_state: str) -> None:
		self._lab_testing_state = lab_testing_state

	def get_status(self) -> str:
		if not self._lab_testing_state:
			return UNKNOWN_LAB_STATUS

		if self._lab_testing_state == 'TestPassed':
			return 'passed'

		return 'failed'

def get_final_lab_status(lab_result_statuses: List[str]) -> str:
	final_lab_results_status = UNKNOWN_LAB_STATUS

	for lab_results_status in lab_result_statuses:
		if lab_results_status == "failed":
			return "failed"
		elif lab_results_status == "passed":
			final_lab_results_status = "passed"

	return final_lab_results_status

class TransferPackages(object):

	def __init__(self, last_modified_at: datetime.datetime, delivery_id: str, transfer_packages: List[Dict], transfer_packages_wholesale: List[Dict]) -> None:
		self._last_modified_at = last_modified_at
		self.delivery_id = delivery_id
		self._packages = transfer_packages
		self._packages_wholesale = transfer_packages_wholesale
		for package in self._packages:
			package['DeliveryId'] = delivery_id

	def get_lab_testing_states(self) -> List[str]:
		return [t.get('LabTestingState', '') for t in self._packages]

	def get_package_models(
			self, lab_tests: List[LabTest], transfer_type: str, created_date: datetime.date,
			ctx: metrc_common_util.DownloadContext) -> Tuple[List[models.MetrcTransferPackage], str]:
		company_id = ctx.company_details['company_id']
		license_id = ctx.license['license_id']
		license_number = ctx.license['license_number']
		us_state = ctx.license['us_state']

		# Return list of MetrcTransferPackage models and lab results status
		# of the Transfer that all these packages belong to.
		metrc_packages = []
		transfer_lab_results_status = UNKNOWN_LAB_STATUS

		package_id_to_package_wholesale = {}
		for package_wholesale in self._packages_wholesale:
			package_id_to_package_wholesale[package_wholesale['PackageId']] = package_wholesale

		lab_statuses = []

		for i in range(len(self._packages)):
			package = self._packages[i]

			package_id = package['PackageId']
			package_wholesale = package_id_to_package_wholesale.get(package_id)

			p = models.MetrcTransferPackage()
			p.type = db_constants.TransferPackageType.TRANSFER
			p.us_state = us_state
			p.package_id = '{}'.format(package_id)
			p.delivery_id = '{}'.format(package['DeliveryId'])
			p.package_label = package['PackageLabel']
			p.package_type = package['PackageType']
			p.product_name = package['ProductName']
			p.product_category_name = package['ProductCategoryName']
			p.shipped_quantity = package['ShippedQuantity']
			p.received_quantity = package.get('ReceivedQuantity')
			p.shipped_unit_of_measure = package['ShippedUnitOfMeasureName']
			p.received_unit_of_measure = package['ReceivedUnitOfMeasureName']
			p.shipment_package_state = package['ShipmentPackageState']
			p.created_date = created_date
			p.lab_results_status = lab_tests[i].get_status()
			p.last_modified_at = self._last_modified_at # Transfer packages inherit last modified at from the transfer

			if package_wholesale:
				p.shipper_wholesale_price = package_wholesale.get('ShipperWholesalePrice')
				package['ShipperWholesalePrice'] = package_wholesale.get('ShipperWholesalePrice')
				package['ReceiverWholesalePrice'] = package_wholesale.get('ReceiverWholesalePrice')

			p.package_payload = package

			metrc_packages.append(p)

			lab_statuses.append(p.lab_results_status)

		return metrc_packages, get_final_lab_status(lab_statuses)

def _get_prev_metrc_transfers(transfer_ids: List[str], us_state: str, session: Session) -> List[models.MetrcTransfer]:
	metrc_transfers = []

	for transfer_id in transfer_ids:
		metrc_transfer = session.query(models.MetrcTransfer).filter(
			models.MetrcTransfer.us_state == us_state
		).filter(
			models.MetrcTransfer.transfer_id == transfer_id
		).first()
		if metrc_transfer:
			metrc_transfers.append(metrc_transfer)

	return metrc_transfers

class Transfers(object):

	def __init__(self, transfers: List[Dict]) -> None:
		self._transfers = transfers

	@staticmethod
	def build(transfers: List[Dict]) -> 'Transfers':
		return Transfers(transfers)


	def filter_new_only(self, ctx: metrc_common_util.DownloadContext, session: Session) -> 'Transfers':
		"""
			Only keep transfers which are newly updated, e.g.,
			last_modified_at > db.last_modified_at.

			This prevents us from querying transfers where we know they haven't changed.
		"""

		us_state = ctx.license['us_state']
		transfer_ids = ['{}'.format(t['Id']) for t in self._transfers]
		prev_transfers = _get_prev_metrc_transfers(transfer_ids, us_state, session)

		transfer_id_to_transfer = {}
		for prev_metrc_transfer in prev_transfers:
			transfer_id_to_transfer[prev_metrc_transfer.transfer_id] = prev_metrc_transfer

		new_transfers = []
		for t in self._transfers:
			cur_transfer_id = '{}'.format(t['Id']) 
			if cur_transfer_id in transfer_id_to_transfer:
				prev_transfer = transfer_id_to_transfer[cur_transfer_id]
				if prev_transfer.last_modified_at >= parser.parse(t['LastModified']):
					# If we've seen a previous transfer that's at the same last_modified_at
					# or newer than what we just fetched, no need to use it again
					continue
			
			new_transfers.append(t)

		self._transfers = new_transfers
		return self

	def get_transfer_objs(self, rest: metrc_common_util.REST, ctx: metrc_common_util.DownloadContext, transfer_type: str) -> List[MetrcTransferObj]:
		metrc_transfer_objs = []
		company_id = ctx.company_details['company_id']
		license_id = ctx.license['license_id']
		license_number = ctx.license['license_number']
		us_state = ctx.license['us_state']

		for t in self._transfers:
			transfer_id = '{}'.format(t['Id'])
			tr = models.MetrcTransfer()
			tr.transfer_id = transfer_id
			tr.us_state = us_state
			tr.shipper_facility_license_number = t['ShipperFacilityLicenseNumber']
			tr.shipper_facility_name = t['ShipperFacilityName']
			tr.created_date = parser.parse(t['CreatedDateTime']).date() if t['CreatedDateTime'] else None
			tr.manifest_number = t['ManifestNumber']
			tr.shipment_type_name = t['ShipmentTypeName']
			tr.shipment_transaction_type = t['ShipmentTransactionType']
			tr.last_modified_at = parser.parse(t['LastModified'])
			tr.transfer_payload = t
		
			deliveries: List[MetrcDeliveryObj] = []
			company_deliveries: List[CompanyDeliveryObj] = []

			if transfer_type == db_constants.TransferType.INCOMING:
				d = models.MetrcDelivery()
				d.us_state = us_state
				d.delivery_id = '{}'.format(t['DeliveryId'])
				d.recipient_facility_license_number = t['RecipientFacilityLicenseNumber']
				d.recipient_facility_name = t['RecipientFacilityName']
				d.shipment_type_name = t['ShipmentTypeName']
				d.shipment_transaction_type = t['ShipmentTransactionType']
				d.received_datetime = parser.parse(t['ReceivedDateTime']) if t['ReceivedDateTime'] else None
				d.delivery_payload = {}
				deliveries.append(MetrcDeliveryObj(
					d, 
					transfer_type=transfer_type, 
					transfer_id=transfer_id,
					company_id=company_id
				))

				company_delivery = models.CompanyDelivery(
					license_number=license_number,
					us_state=us_state,
					transfer_type=transfer_type,
				)
				company_delivery.company_id = cast(Any, company_id)

				company_deliveries.append(CompanyDeliveryObj(
					company_delivery=company_delivery,
					metrc_delivery=d,
					metrc_transfer=tr
				))
			else:
				outgoing_transfer_id = t['Id']
				delivery_resp = rest.get(f'/transfers/v1/{outgoing_transfer_id}/deliveries')
				delivery_json_arr = cast(List[Dict], json.loads(delivery_resp.content))

				for delivery_json in delivery_json_arr:
					d = models.MetrcDelivery()
					d.us_state = us_state
					d.delivery_id = '{}'.format(delivery_json['Id'])
					d.recipient_facility_license_number = delivery_json['RecipientFacilityLicenseNumber']
					d.recipient_facility_name = delivery_json['RecipientFacilityName']
					d.shipment_type_name = delivery_json['ShipmentTypeName']
					d.shipment_transaction_type = delivery_json['ShipmentTransactionType']
					d.received_datetime = parser.parse(delivery_json['ReceivedDateTime']) if delivery_json['ReceivedDateTime'] else None
					d.delivery_payload = delivery_json
					deliveries.append(MetrcDeliveryObj(
						d, 
						transfer_type=transfer_type,
						transfer_id=transfer_id, 
						company_id=company_id
					))

					company_delivery = models.CompanyDelivery(
						license_number=license_number,
						us_state=us_state,
						transfer_type=transfer_type,
					)
					company_delivery.company_id = cast(Any, company_id)
					company_deliveries.append(CompanyDeliveryObj(
						company_delivery=company_delivery,
						metrc_delivery=d,
						metrc_transfer=tr
					))

			transfer_obj = MetrcTransferObj(
				metrc_transfer=tr,
				deliveries=deliveries,
				company_deliveries=company_deliveries
			)
			metrc_transfer_objs.append(transfer_obj)

		return metrc_transfer_objs

def _write_transfers(
	transfer_objs: List[MetrcTransferObj], 
	delivery_id_to_transfer_row_id: Dict, 
	all_company_deliveries: List[CompanyDeliveryObj],
	session: Session) -> None:
	transfer_ids = [transfer_obj.metrc_transfer.transfer_id for transfer_obj in transfer_objs]
	us_states = [transfer_obj.metrc_transfer.us_state for transfer_obj in transfer_objs]

	if not transfer_objs:
		return

	prev_metrc_transfers = _get_prev_metrc_transfers(transfer_ids, us_states[0], session)

	transfer_id_to_prev_transfer = {}
	for prev_transfer in prev_metrc_transfers:
		transfer_id_to_prev_transfer[prev_transfer.transfer_id] = prev_transfer

	for metrc_transfer_obj in transfer_objs:
		if metrc_transfer_obj.has_error:
			# Dont write transfer objects which are not complete, perhaps due to
			# their packages not being pulled successfully.
			continue

		metrc_transfer = metrc_transfer_obj.metrc_transfer
		all_company_deliveries.extend(metrc_transfer_obj.company_deliveries)
		if metrc_transfer.transfer_id in transfer_id_to_prev_transfer:
			# update
			prev_transfer = transfer_id_to_prev_transfer[metrc_transfer.transfer_id]

			# Assume these stay the same:
			# us_state
			# transfer_id
			prev_transfer.shipper_facility_license_number = metrc_transfer.shipper_facility_license_number
			prev_transfer.shipper_facility_name = metrc_transfer.shipper_facility_name
			prev_transfer.created_date = metrc_transfer.created_date
			prev_transfer.manifest_number = metrc_transfer.manifest_number
			prev_transfer.shipment_type_name = metrc_transfer.shipment_type_name
			prev_transfer.shipment_transaction_type = metrc_transfer.shipment_transaction_type
			prev_transfer.transfer_payload = metrc_transfer.transfer_payload
			prev_transfer.lab_results_status = metrc_transfer.lab_results_status
			prev_transfer.last_modified_at = metrc_transfer.last_modified_at

			for delivery_id in metrc_transfer_obj.get_delivery_ids():
				delivery_id_to_transfer_row_id[delivery_id] = str(prev_transfer.id)
		else:
			# add
			session.add(metrc_transfer)
			session.flush()

			# In some rare cases, a new transfer may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate transfer.
			transfer_id_to_prev_transfer[metrc_transfer.transfer_id] = metrc_transfer

			for delivery_id in metrc_transfer_obj.get_delivery_ids():
				delivery_id_to_transfer_row_id[delivery_id] = str(metrc_transfer.id)

def _write_company_deliveries(
	deliveries: List[CompanyDeliveryObj],
	delivery_id_to_transfer_row_id: Dict,
	delivery_id_to_delivery_row_id: Dict, 
	session: Session) -> None:
	if not deliveries:
		return

	# In reality, all the deliveries will be from the same state and license number.
	us_state = deliveries[0].company_delivery.us_state
	license_number = deliveries[0].company_delivery.license_number
	company_id = deliveries[0].company_delivery.company_id

	delivery_key_to_prev_delivery: Dict[Tuple[str, str, str], models.CompanyDelivery] = {}
	
	for company_delivery_obj in deliveries:
		metrc_delivery = company_delivery_obj.metrc_delivery
		cur_transfer_row_id = delivery_id_to_transfer_row_id[metrc_delivery.delivery_id]
		cur_delivery_row_id = delivery_id_to_delivery_row_id[metrc_delivery.delivery_id]

		prev_delivery = session.query(models.CompanyDelivery).filter(
			models.CompanyDelivery.us_state == us_state
		).filter(
			models.CompanyDelivery.license_number == license_number
		).filter(
			models.CompanyDelivery.company_id == company_id
		).filter(
			models.CompanyDelivery.transfer_row_id == cur_transfer_row_id
		).filter(
			models.CompanyDelivery.delivery_row_id == cur_delivery_row_id
		).first()
		if prev_delivery:
			key = (prev_delivery.license_number, str(prev_delivery.transfer_row_id), str(prev_delivery.delivery_row_id))
			delivery_key_to_prev_delivery[key] = prev_delivery

	for company_delivery_obj in deliveries:
		company_delivery = company_delivery_obj.company_delivery
		delivery_row_id = delivery_id_to_delivery_row_id[company_delivery_obj.metrc_delivery.delivery_id]
		transfer_row_id = delivery_id_to_transfer_row_id[company_delivery_obj.metrc_delivery.delivery_id]
		key = (company_delivery.license_number, transfer_row_id, delivery_row_id)
		
		if key in delivery_key_to_prev_delivery:
			# update
			prev_delivery = delivery_key_to_prev_delivery[key]

			# delivery_id - no change
			prev_delivery.company_id = company_delivery.company_id
			prev_delivery.license_number = company_delivery.license_number
			prev_delivery.us_state = company_delivery.us_state
			prev_delivery.vendor_id = company_delivery.vendor_id
			prev_delivery.payor_id = company_delivery.payor_id
			prev_delivery.transfer_row_id = cast(Any, transfer_row_id)
			prev_delivery.transfer_type = company_delivery.transfer_type
			prev_delivery.delivery_row_id = cast(Any, delivery_row_id)
			prev_delivery.delivery_type = company_delivery.delivery_type
		else:
			# add
			company_delivery.delivery_row_id = cast(Any, delivery_row_id)
			company_delivery.transfer_row_id = cast(Any, transfer_row_id)

			session.add(company_delivery)
			session.flush()

			# In some rare cases, a new delivery may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate delivery.
			delivery_key_to_prev_delivery[key] = company_delivery

def _write_deliveries(
	deliveries: List[models.MetrcDelivery],
	delivery_id_to_transfer_row_id: Dict,
	delivery_id_to_delivery_row_id: Dict, 
	session: Session) -> None:

	transfer_row_ids = []
	prev_metrc_deliveries = []

	for metrc_delivery in deliveries:
		cur_transfer_row_id = delivery_id_to_transfer_row_id[metrc_delivery.delivery_id]
		transfer_row_ids.append(cur_transfer_row_id)

		prev_metrc_delivery = session.query(models.MetrcDelivery).filter(
				models.MetrcDelivery.us_state == metrc_delivery.us_state
			).filter(
				models.MetrcDelivery.transfer_row_id == cur_transfer_row_id
			).filter(
				models.MetrcDelivery.delivery_id == metrc_delivery.delivery_id
			).first()
		if prev_metrc_delivery:
			prev_metrc_deliveries.append(prev_metrc_delivery)

	delivery_key_to_prev_delivery: Dict[Tuple[str, str], models.MetrcDelivery] = {}
	for prev_delivery in prev_metrc_deliveries:
		cur_transfer_row_id = delivery_id_to_transfer_row_id[prev_delivery.delivery_id]
		key = (cur_transfer_row_id, prev_delivery.delivery_id)
		delivery_key_to_prev_delivery[key] = prev_delivery

	for metrc_delivery in deliveries:
		transfer_row_id = delivery_id_to_transfer_row_id[metrc_delivery.delivery_id]
		key = (transfer_row_id, metrc_delivery.delivery_id)

		if key in delivery_key_to_prev_delivery:
			# update
			prev_delivery = delivery_key_to_prev_delivery[key]
			delivery_id_to_delivery_row_id[metrc_delivery.delivery_id] = str(prev_delivery.id)

			# delivery_id - no change
			prev_delivery.transfer_row_id = cast(Any, transfer_row_id)
			prev_delivery.recipient_facility_license_number = metrc_delivery.recipient_facility_license_number
			prev_delivery.recipient_facility_name = metrc_delivery.recipient_facility_name
			prev_delivery.shipment_type_name = metrc_delivery.shipment_type_name
			prev_delivery.shipment_transaction_type = metrc_delivery.shipment_transaction_type
			prev_delivery.received_datetime = metrc_delivery.received_datetime
			prev_delivery.delivery_payload = metrc_delivery.delivery_payload
		else:
			# add
			metrc_delivery.transfer_row_id = cast(Any, transfer_row_id)

			session.add(metrc_delivery)
			session.flush()

			# In some rare cases, a new delivery may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate delivery.
			delivery_key_to_prev_delivery[key] = metrc_delivery

			# This must come AFTER session.flush().
			delivery_id_to_delivery_row_id[metrc_delivery.delivery_id] = str(metrc_delivery.id)

def _write_transfer_packages(
	metrc_packages: List[models.MetrcTransferPackage], 
	package_id_to_delivery_id: Dict,
	delivery_id_to_transfer_row_id: Dict,
	delivery_id_to_delivery_row_id: Dict,
	session: Session) -> None:

	# Note the de-dupe here, there may be multiple packages with the same package_id from the
	# packages collected above (this is because multiple deliveries may have the same package).
	# Since metrc_packages are unique on (delivery_id, package_id), note
	# the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = []

	for pkg in metrc_packages:
		prev_metrc_package = cast(models.MetrcTransferPackage, session.query(models.MetrcTransferPackage).filter(
			models.MetrcTransferPackage.delivery_id == pkg.delivery_id
		).filter(
			models.MetrcTransferPackage.package_id == pkg.package_id
		).first())

		if prev_metrc_package:
			prev_metrc_packages.append(prev_metrc_package)

	delivery_id_package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is a tuple of (delivery_id, package_id) - the
		# same package may show up in multiple different deliveries.
		metrc_package_key = (prev_metrc_package.delivery_id, prev_metrc_package.package_id)
		delivery_id_package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for metrc_package in metrc_packages:
		metrc_package_key = (metrc_package.delivery_id, metrc_package.package_id)

		cur_delivery_id = package_id_to_delivery_id[metrc_package.package_id]
		transfer_row_id = delivery_id_to_transfer_row_id[cur_delivery_id]
		delivery_row_id = delivery_id_to_delivery_row_id[metrc_package.delivery_id]

		if metrc_package_key in delivery_id_package_id_to_prev_package:
			# update
			prev_metrc_package = delivery_id_package_id_to_prev_package[metrc_package_key]
			prev_metrc_package.transfer_row_id = cast(Any, transfer_row_id)
			prev_metrc_package.delivery_row_id = cast(Any, delivery_row_id)
			prev_metrc_package.delivery_id = metrc_package.delivery_id
			# package_id - no need to update
			# created_at - no need to update
			package_common_util.merge_into_prev_transfer_package(
				prev=prev_metrc_package, 
				cur=metrc_package
			)
		else:
			# add
			metrc_package.transfer_row_id = cast(Any, transfer_row_id)
			metrc_package.delivery_row_id = cast(Any, delivery_row_id)
			session.add(metrc_package)
			session.flush()

		# In some rare cases, a new package may show up twice in the same day.
		# The following line prevents an attempt to insert a duplicate package.
		delivery_id_package_id_to_prev_package[metrc_package_key] = metrc_package

def _get_company_delivery_objs(transfer_objs: List[MetrcTransferObj]) -> List[CompanyDeliveryObj]:
	company_delivery_objs = []
	for transfer_obj in transfer_objs:
		company_delivery_objs.extend(transfer_obj.company_deliveries)
	return company_delivery_objs

@errors.return_error_tuple
def populate_transfers_table(
	ctx: metrc_common_util.DownloadContext,
	session_maker: Callable
) -> Tuple[bool, errors.Error]:

	## Setup
	company_details = ctx.company_details
	cur_date = ctx.cur_date
	request_status = ctx.request_status
	rest = ctx.rest
	license = ctx.license

	cur_date_str = ctx.get_cur_date_str()
	apis_to_use = ctx.apis_to_use

	## Fetch transfers

	# Incoming
	incoming_transfers_arr = []
	if apis_to_use['incoming_transfers']:
		try:
			resp = rest.get('/transfers/v1/incoming', time_range=[cur_date_str])
			incoming_transfers_arr = json.loads(resp.content)
			request_status['transfers_api'] = 200
		except errors.Error as e:
			request_status['transfers_api'] = e.details.get('status_code')
			return False, e

	with session_scope(session_maker) as session:
		incoming_transfers = Transfers.build(incoming_transfers_arr).filter_new_only(
			ctx, session
		)

	incoming_metrc_transfer_objs = incoming_transfers.get_transfer_objs(
		rest=rest,
		ctx=ctx,
		transfer_type=db_constants.TransferType.INCOMING
	)

	with session_scope(session_maker) as session:
		# Look up company ids for vendors that might match, and use those
		# licenses to determine what kind of transfer this is
		licenses_util.populate_vendor_details(
			_get_company_delivery_objs(incoming_metrc_transfer_objs),
			session=session
		)

	# Outgoing
	outgoing_transfers_arr = []
	if apis_to_use['outgoing_transfers']:
		try:
			resp = rest.get('/transfers/v1/outgoing', time_range=[cur_date_str])
			outgoing_transfers_arr = json.loads(resp.content)
			request_status['transfers_api'] = 200
		except errors.Error as e:
			request_status['transfers_api'] = e.details.get('status_code')
			return False, e

	with session_scope(session_maker) as session:
		outgoing_transfers = Transfers.build(outgoing_transfers_arr).filter_new_only(
			ctx, session
		)

	outgoing_metrc_transfer_objs = outgoing_transfers.get_transfer_objs(
		rest=rest,
		ctx=ctx,
		transfer_type=db_constants.TransferType.OUTGOING,
	)

	with session_scope(session_maker) as session:
		licenses_util.populate_vendor_details(
			_get_company_delivery_objs(outgoing_metrc_transfer_objs),
			session=session
		)

	# Rejected
	rejected_transfers_arr = []
	if apis_to_use['rejected_transfers']:
		try:
			resp = rest.get('/transfers/v1/rejected', time_range=[cur_date_str])
			rejected_transfers_arr = json.loads(resp.content)
			request_status['transfers_api'] = 200
		except errors.Error as e:
			request_status['transfers_api'] = e.details.get('status_code')
			return False, e		

	with session_scope(session_maker) as session:
		rejected_transfers = Transfers.build(rejected_transfers_arr).filter_new_only(
			ctx, session
		)

	rejected_metrc_transfer_objs = rejected_transfers.get_transfer_objs(
		rest=rest,
		ctx=ctx,
		transfer_type=db_constants.TransferType.REJECTED,
	)

	with session_scope(session_maker) as session:
		licenses_util.populate_vendor_details(
			_get_company_delivery_objs(rejected_metrc_transfer_objs),
			session=session
		)

	# Fetch delivery details for all the transfers

	metrc_transfer_objs = incoming_metrc_transfer_objs + outgoing_metrc_transfer_objs + \
												rejected_metrc_transfer_objs

	## Fetch packages and lab results
	all_metrc_transfer_package_objs: List[TransferPackageObj] = []
	# So we can map a package back to its parent transfer's delivery ID
	package_id_to_delivery_id = {}

	for metrc_transfer_obj in metrc_transfer_objs:
		metrc_transfer = metrc_transfer_obj.metrc_transfer
		lab_result_statuses_for_transfer = []

		for delivery in metrc_transfer_obj.deliveries:
			delivery_id = delivery.metrc_delivery.delivery_id
			logging.info(f'Downloading packages for {db_constants.TransferType.OUTGOING if db_constants.TransferType.OUTGOING in delivery.transfer_type else db_constants.TransferType.INCOMING} metrc transfer {metrc_transfer.transfer_id}, manifest number {metrc_transfer.manifest_number}, delivery ID {delivery_id}')

			packages_api_failed = False
			try:
				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages')
				t_packages_json = json.loads(resp.content)
				request_status['transfer_packages_api'] = 200
			except errors.Error as e:
				metrc_common_util.update_if_all_are_unsuccessful(request_status, 'transfer_packages_api', e)
				packages_api_failed = True

			if packages_api_failed:
				metrc_transfer_obj.has_error = True
				continue

			try:
				resp = rest.get(f'/transfers/v1/delivery/{delivery_id}/packages/wholesale')
				t_packages_wholesale_json = json.loads(resp.content)
				request_status['transfer_packages_wholesale_api'] = 200
			except errors.Error as e:
				t_packages_wholesale_json = [] # If fetch fails, we set to empty array and continue.
				logging.error(f'Could not fetch packages wholesale for company {company_details["name"]} for transfer with delivery id {delivery_id}. {e}')
				metrc_common_util.update_if_all_are_unsuccessful(request_status, 'transfer_packages_wholesale_api', e)

			packages = TransferPackages(
				metrc_transfer.last_modified_at, delivery_id, t_packages_json, t_packages_wholesale_json)
			lab_testing_states = packages.get_lab_testing_states()

			lab_tests = []
			for lab_testing_state in lab_testing_states:
				lab_tests.append(LabTest(lab_testing_state))

			metrc_packages, delivery_lab_results_status = packages.get_package_models(
				lab_tests=lab_tests,
				transfer_type=delivery.transfer_type,
				created_date=metrc_transfer.created_date,
				ctx=ctx
			)

			#delivery_obj.lab_results_status = delivery_lab_results_status
			lab_result_statuses_for_transfer.append(delivery_lab_results_status)

			for metrc_package in metrc_packages:
				package_id_to_delivery_id[metrc_package.package_id] = delivery_id
				all_metrc_transfer_package_objs.append(
					TransferPackageObj(
						company_id=company_details['company_id'],
						transfer_type=delivery.transfer_type,
						transfer_package=metrc_package
					))

		metrc_transfer.lab_results_status = get_final_lab_status(lab_result_statuses_for_transfer)

	## Write the transfers

	# Find previous transfers, update those that previously existed, add rows
	# that do not exist.
	TRANSFERS_BATCH_SIZE = 10
	delivery_id_to_transfer_row_id: Dict = {}
	all_company_deliveries: List[CompanyDeliveryObj] = []

	for transfers_chunk in chunker(metrc_transfer_objs, TRANSFERS_BATCH_SIZE):
		with session_scope(session_maker) as session:
			_write_transfers(transfers_chunk, delivery_id_to_transfer_row_id, all_company_deliveries, session)

	## Write deliveries
	DELIVERIES_BATCH_SIZE = 5
	delivery_id_to_delivery_row_id: Dict = {}

	for company_deliveries_chunk in cast(Iterable[List[CompanyDeliveryObj]], chunker(all_company_deliveries, DELIVERIES_BATCH_SIZE)):
		with session_scope(session_maker) as session:
			licenses_util.populate_delivery_details(company_deliveries_chunk, session)
			deliveries_chunk = [company_delivery_obj.metrc_delivery for company_delivery_obj in company_deliveries_chunk]
			_write_deliveries(
				deliveries_chunk, 
				delivery_id_to_transfer_row_id=delivery_id_to_transfer_row_id,
				delivery_id_to_delivery_row_id=delivery_id_to_delivery_row_id, 
				session=session
			)
			_write_company_deliveries(
				company_deliveries_chunk,
				delivery_id_to_transfer_row_id=delivery_id_to_transfer_row_id,
				delivery_id_to_delivery_row_id=delivery_id_to_delivery_row_id, 
				session=session
			)			

	## Write packages

	# Find previous packages, update those that previously existed, add rows
	# that do not exist.

	# Without the following batching logic, we run into SQL timeout errors due to how much
	# data is in the metrc_packages table, namely the metrc_packages.package_payload column.
	TRANSFER_PACKAGES_BATCH_SIZE = 10

	for transfer_package_objs_chunk in cast(Iterable[List[TransferPackageObj]], chunker(all_metrc_transfer_package_objs, TRANSFER_PACKAGES_BATCH_SIZE)):
		with session_scope(session_maker) as session:
			_write_transfer_packages(
				[transfer_package_obj.transfer_package for transfer_package_obj in transfer_package_objs_chunk],
				package_id_to_delivery_id=package_id_to_delivery_id,
				delivery_id_to_transfer_row_id=delivery_id_to_transfer_row_id,
				delivery_id_to_delivery_row_id=delivery_id_to_delivery_row_id,
				session=session
			)
			package_common_util.update_packages_from_transfer_packages(
				transfer_package_objs_chunk,
				session=session
			)

	return True, None
