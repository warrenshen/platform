"""
	Object that help us write Metrc objects to the database, and need to be
	shared by many files
"""
from mypy_extensions import TypedDict
from typing import List

from bespoke.db import models
from bespoke.db.db_constants import TransferType, DeliveryType

class CompanyDeliveryObj(object):
	"""Wrapper object for a CompanyDelivery DB object, so we can associated 
			additional fields for convenience"""
	def __init__(self,
		company_delivery: models.CompanyDelivery,
		metrc_delivery: models.MetrcDelivery,
		metrc_transfer: models.MetrcTransfer
	):
		self.company_delivery = company_delivery
		self.metrc_delivery = metrc_delivery
		self.metrc_transfer = metrc_transfer

class MetrcDeliveryObj(object):
	"""Wrapper object for a metrc delivery DB object, so we can associated 
			additional fields that dont get written to the DB"""

	def __init__(self, 
		metrc_delivery: models.MetrcDelivery, 
		transfer_type: str,
		transfer_id: str,
		company_id: str) -> None:
		self.metrc_delivery = metrc_delivery
		self.transfer_type = transfer_type
		self.transfer_id = transfer_id
		self.company_id = company_id


class MetrcTransferObj(object):
	"""Wrapper object for a metrc transfer DB object and delivery IDs"""

	def __init__(self, 
		metrc_transfer: models.MetrcTransfer, 
		deliveries: List[MetrcDeliveryObj],
		company_deliveries: List[CompanyDeliveryObj]) -> None:
		self.metrc_transfer = metrc_transfer
		self.deliveries = deliveries
		self.company_deliveries = company_deliveries

	def get_delivery_ids(self) -> List[str]:
		return [delivery_obj.metrc_delivery.delivery_id for delivery_obj in self.deliveries]

def get_delivery_type(
	transfer_type: str,
	company_id: str,
	shipper_company_id: str,
	recipient_company_id: str,
) -> str:
	is_company_shipper = shipper_company_id and shipper_company_id == company_id
	is_company_recipient = recipient_company_id and recipient_company_id == company_id
	are_companys_known = shipper_company_id is not None and recipient_company_id is not None

	if transfer_type == TransferType.INTERNAL:
		delivery_type = DeliveryType.INTERNAL
	elif not is_company_shipper and not is_company_recipient:
		# If company is neither shipper nor recipient, set delivery_type to UNKNOWN.
		# This prompts bank admin to look into delivery and figure out which license(s) are missing.
		delivery_type = DeliveryType.UNKNOWN
	elif is_company_shipper and is_company_recipient:
		delivery_type = f'{transfer_type}_INTERNAL'
	elif transfer_type == TransferType.INCOMING and are_companys_known:
		delivery_type = DeliveryType.INCOMING_FROM_VENDOR
	elif transfer_type == TransferType.INCOMING and not are_companys_known:
		delivery_type = DeliveryType.INCOMING_UNKNOWN
	elif transfer_type == TransferType.OUTGOING and are_companys_known:
		delivery_type = DeliveryType.OUTGOING_TO_PAYOR
	elif transfer_type == TransferType.OUTGOING and not are_companys_known:
		delivery_type = DeliveryType.OUTGOING_UNKNOWN
	else:
		delivery_type = DeliveryType.UNKNOWN

	return delivery_type
