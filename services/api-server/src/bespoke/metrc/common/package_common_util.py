from sqlalchemy.orm.session import Session
from typing import List, Union, cast
from bespoke.db import models

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
	prev.package_id = cur.package_id
	prev.package_label = cur.package_label
	prev.package_type = cur.package_type
	prev.product_name = cur.product_name
	prev.product_category_name = cur.product_category_name
	prev.package_payload = cur.package_payload
	prev.updated_at = cur.updated_at
	prev.last_modified_at = cur.last_modified_at


def transfer_package_to_package(tp: models.MetrcTransferPackage) -> models.MetrcPackage:
	p = models.MetrcPackage()
	_merge_common_fields(source=tp, dest=p)
	p.type = 'active' # Consider all incoming and outgoing transfer packages as active packages until we see it go inactive
	return p

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

	_merge_common_fields(source=cur, dest=prev)	

def update_packages(
	packages: List[models.MetrcPackage],
	is_from_transfer_packages: bool,
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
			prev_package_payload = dict(prev_metrc_package.package_payload)
			maybe_merge_into_prev_package(
				prev=prev_metrc_package, 
				cur=metrc_package
			)
			if is_from_transfer_packages:
				# When overwriting from transfer packages, don't modify the original
				# package_payload. We want to retain the package_payload from the
				# original package
				prev_metrc_package.package_payload = prev_package_payload
		else:
			# add
			session.add(metrc_package)
			session.flush()
