from bespoke.db import models

UNKNOWN_LAB_STATUS = 'unknown'

def merge_into_prev_package(prev: models.MetrcPackage, cur: models.MetrcPackage) -> None:
		# TODO(dlluncor): Figure out the right merge logic, e.g., dont overwrite
		# data with NULL if the previous value was not NULL
		if cur.type:
			# If the type is not defined, dont overwrite it if yours
			# is not set
			prev.type = cur.type

		prev.package_label = cur.package_label
		prev.package_type = cur.package_type
		prev.product_name = cur.product_name
		prev.product_category_name = cur.product_category_name
		prev.shipped_quantity = cur.shipped_quantity
		prev.shipper_wholesale_price = cur.shipper_wholesale_price
		prev.package_payload = cur.package_payload
		prev.lab_results_status = cur.lab_results_status
		prev.updated_at = cur.updated_at
		# package_id - no need to update
		# created_at - no need to update
			
