import logging

from sqlalchemy.orm.session import Session
from typing import List, Union, cast
from bespoke.db import models, db_constants

UNKNOWN_LAB_STATUS = 'unknown'

def _merge_common_fields(
	dest: Union[models.MetrcPackage, models.MetrcTransferPackage], 
	source: Union[models.MetrcPackage, models.MetrcTransferPackage]) -> None:
	prev = dest
	cur = source

	if cur.type:
		# Only override the type when its defined
		prev.type = cur.type

	prev.company_id = cur.company_id
	prev.license_number = cur.license_number
	prev.us_state = cur.us_state
	prev.package_id = cur.package_id
	prev.package_label = cur.package_label
	prev.package_type = cur.package_type
	prev.product_name = cur.product_name
	prev.product_category_name = cur.product_category_name
	prev.package_payload = cur.package_payload
	prev.updated_at = cur.updated_at
	prev.last_modified_at = cur.last_modified_at


def update_package_based_on_transfer_package(tp: models.MetrcTransferPackage, p: models.MetrcPackage) -> None:
	has_last_modified = tp.last_modified_at and p.last_modified_at

	if has_last_modified and tp.last_modified_at < p.last_modified_at:
		# No need to modify when this transfer package was updated before this package was.
		return

	if tp.type == 'transfer_incoming':
		pass
	elif tp.type == 'transfer_outgoing':
		p.type = db_constants.PackageType.OUTGOING

def merge_into_prev_transfer_package(prev: models.MetrcTransferPackage, cur: models.MetrcTransferPackage) -> None:
	has_last_modified = cur.last_modified_at and prev.last_modified_at

	if has_last_modified and cur.last_modified_at < prev.last_modified_at:
		# No need to modify when this is information that is about the package
		# prior to what we currently have
		return

	if cur.type:
		# If the type is not defined, dont overwrite it if yours
		# is not set
		prev.type = cur.type

	_merge_common_fields(source=cur, dest=prev)

	prev.shipped_quantity = cur.shipped_quantity
	prev.received_quantity = cur.received_quantity
	prev.shipped_unit_of_measure = cur.shipped_unit_of_measure
	prev.received_unit_of_measure = cur.received_unit_of_measure
	prev.shipper_wholesale_price = cur.shipper_wholesale_price
	prev.shipment_package_state = cur.shipment_package_state
	prev.lab_results_status = cur.lab_results_status
	# created_at - no need to update

def maybe_merge_into_prev_package(
	prev: models.MetrcPackage, 
	cur: models.MetrcPackage) -> None:
	has_last_modified = cur.last_modified_at and prev.last_modified_at

	if has_last_modified and cur.last_modified_at < prev.last_modified_at:
		# No need to modify when this is information that is about the package
		# prior to what we currently have
		return

	if cur.packaged_date:
		# Only override when the newer one is defined
		prev.packaged_date = cur.packaged_date

	if cur.quantity:
		prev.quantity = cur.quantity

	prev.unit_of_measure = cur.unit_of_measure

	_merge_common_fields(source=cur, dest=prev)	

def update_packages(
	packages: List[models.MetrcPackage],
	session: Session) -> None:
	package_ids = [package.package_id for package in packages] 

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	# Note the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = cast(List[models.MetrcPackage], session.query(models.MetrcPackage).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	).all())

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is package_id - the same package may show up across different
		# transfers.
		metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for metrc_package in packages:
		metrc_package_key = metrc_package.package_id

		if metrc_package_key in package_id_to_prev_package:
			# update
			prev_metrc_package = package_id_to_prev_package[metrc_package_key]
			maybe_merge_into_prev_package(
				prev=prev_metrc_package, 
				cur=metrc_package
			)
		else:
			# add
			session.add(metrc_package)
			session.flush()

def update_packages_from_sales_transactions(
	sales_transactions: List[models.MetrcSalesTransaction],
	session: Session
	) -> None:

	package_ids = [tx.package_id for tx in sales_transactions] 

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	# Note the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = cast(List[models.MetrcPackage], session.query(models.MetrcPackage).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	).all())

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is package_id - the same package may show up across different
		# transfers.
		metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for tx in sales_transactions:
		metrc_package_key = tx.package_id

		if metrc_package_key in package_id_to_prev_package:
			# update
			prev_metrc_package = package_id_to_prev_package[metrc_package_key]
			prev_metrc_package.type = db_constants.PackageType.SOLD
		else:
			logging.warn('We observed a sales transaction referring to package #{} which is not registered in our DB as a regular package'.format(
										tx.package_id))

def update_packages_from_transfer_packages(
	transfer_packages: List[models.MetrcTransferPackage],
	session: Session) -> None:
	package_ids = [package.package_id for package in transfer_packages] 

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	# Note the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = cast(List[models.MetrcPackage], session.query(models.MetrcPackage).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	).all())

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is package_id - the same package may show up across different
		# transfers.
		metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for metrc_transfer_package in transfer_packages:
		metrc_package_key = metrc_transfer_package.package_id

		if metrc_package_key in package_id_to_prev_package:
			# update
			prev_metrc_package = package_id_to_prev_package[metrc_package_key]
			update_package_based_on_transfer_package(
				tp=metrc_transfer_package,
				p=prev_metrc_package
			)
		else:
			logging.warn('We observed a transfer package #{} which is not registered in our DB as a regular package'.format(
										metrc_transfer_package.package_id))
