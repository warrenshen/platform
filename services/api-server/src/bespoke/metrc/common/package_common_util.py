import logging

from sqlalchemy.orm.session import Session
from typing import List, Iterable, Union, cast

from bespoke.db import models, db_constants
from bespoke.metrc.common.metrc_common_util import chunker

UNKNOWN_LAB_STATUS = 'unknown'

class TransferPackageObj(object):

	def __init__(self, company_id: str, transfer_type: str, transfer_package: models.MetrcTransferPackage) -> None:
		self.company_id = company_id
		self.transfer_type = transfer_type
		self.transfer_package = transfer_package

def _merge_common_fields(
	dest: Union[models.MetrcPackage, models.MetrcTransferPackage], 
	source: Union[models.MetrcPackage, models.MetrcTransferPackage]) -> None:
	prev = dest
	cur = source

	if cur.type:
		# Only override the type when its defined
		prev.type = cur.type

	prev.us_state = cur.us_state
	prev.package_id = cur.package_id
	prev.package_label = cur.package_label
	prev.package_type = cur.package_type
	prev.product_name = cur.product_name
	prev.product_category_name = cur.product_category_name
	prev.package_payload = cur.package_payload
	prev.last_modified_at = cur.last_modified_at


def update_package_based_on_transfer_package(
	company_id: str, transfer_type: str, tp: models.MetrcTransferPackage, p: models.MetrcPackage) -> None:
	has_last_modified = tp.last_modified_at and p.last_modified_at

	if has_last_modified and tp.last_modified_at < p.last_modified_at:
		# No need to modify when this transfer package was updated before this package was.
		return

	if company_id == str(p.company_id) and transfer_type == db_constants.TransferType.INCOMING:
		# This is your package that is incoming, mark it as active
		p.type = db_constants.PackageType.ACTIVE
	elif company_id == str(p.company_id) and transfer_type == db_constants.TransferType.OUTGOING:
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

	if cur.company_id:
		prev.company_id = cur.company_id
	
	if cur.license_number:
		prev.license_number = cur.license_number
	
	prev.unit_of_measure = cur.unit_of_measure
	_merge_common_fields(source=cur, dest=prev)

def _get_prev_metrc_packages(
	us_state: str,
	package_ids: List[str],
	session: Session,
) -> List[models.MetrcPackage]:
	# Note: metrc_packages are unique on (us_state, package_id).
	return session.query(models.MetrcPackage).filter(
		models.MetrcPackage.us_state == us_state
	).filter(
		models.MetrcPackage.package_id.in_(package_ids)
	).all()

def update_packages(
	packages: List[models.MetrcPackage],
	session: Session) -> None:
	package_ids = [package.package_id for package in packages] 

	us_state = packages[0].us_state
	prev_metrc_packages = _get_prev_metrc_packages(us_state, package_ids, session)

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is package_id - the same package
		# may show up across different transfers.
		prev_metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[prev_metrc_package_key] = prev_metrc_package

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
			# In some rare cases, a new package may show up twice in the same day.
			# The following line prevents an attempt to insert a duplicate.
			package_id_to_prev_package[metrc_package_key] = metrc_package
			session.flush()

def update_packages_from_sales_transactions(
	sales_transactions: List[models.MetrcSalesTransaction],
	session: Session
) -> None:
	us_state = sales_transactions[0].us_state
	package_ids = [tx.package_id for tx in sales_transactions] 

	BATCH_SIZE = 50
	prev_metrc_packages = []

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	for package_ids_chunk in chunker(package_ids, BATCH_SIZE):
		prev_metrc_packages_chunk = _get_prev_metrc_packages(us_state, package_ids_chunk, session)
		prev_metrc_packages += prev_metrc_packages_chunk

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
			# TODO(dlluncor): Have another column which represents IS_PARTIALLY_SOLD
		else:
			logging.warn('We observed a sales transaction referring to package #{} which is not registered in our DB as a regular package'.format(
										tx.package_id))

def update_packages_from_transfer_packages(
	transfer_package_objs: List[TransferPackageObj],
	session: Session,
) -> None:
	us_state = transfer_package_objs[0].transfer_package.us_state
	package_ids = [package_obj.transfer_package.package_id for package_obj in transfer_package_objs] 

	# metrc_packages are unique on package_id, when they 
	# are not associated with a delivery.
	# Note the following query may return more than BATCH_SIZE number of results.
	prev_metrc_packages = _get_prev_metrc_packages(us_state, package_ids, session)

	package_id_to_prev_package = {}
	for prev_metrc_package in prev_metrc_packages:
		# Package key is package_id - the same package may show up across different
		# transfers.
		metrc_package_key = prev_metrc_package.package_id
		package_id_to_prev_package[metrc_package_key] = prev_metrc_package

	# Write the packages
	for transfer_package_obj in transfer_package_objs:
		metrc_transfer_package = transfer_package_obj.transfer_package
		metrc_package_key = metrc_transfer_package.package_id

		if metrc_package_key in package_id_to_prev_package:
			# update
			prev_metrc_package = package_id_to_prev_package[metrc_package_key]
			update_package_based_on_transfer_package(
				company_id=transfer_package_obj.company_id,
				transfer_type=transfer_package_obj.transfer_type,
				tp=metrc_transfer_package,
				p=prev_metrc_package
			)
		else:
			logging.warn('We observed a transfer package #{} which is not registered in our DB as a regular package'.format(
										metrc_transfer_package.package_id))
