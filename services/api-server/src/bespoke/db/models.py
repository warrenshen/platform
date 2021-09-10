import datetime
import decimal
import logging
import os
import time
import uuid
from contextlib import contextmanager
from typing import (TYPE_CHECKING, Any, Callable, Dict, Iterator, List,
                    Optional, Union, cast)

import sqlalchemy
from bespoke.config.config_util import is_prod_env
from bespoke.date import date_util
from bespoke.db.model_types import (
	ItemsCoveredDict
)
from fastapi_utils.guid_type import GUID, GUID_DEFAULT_SQLITE
from mypy_extensions import TypedDict
from sqlalchemy import (JSON, BigInteger, Boolean, Column, Date, DateTime,
                        ForeignKey, Integer, Numeric, String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, StatementError, TimeoutError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.orm.query import Query as _Query
from sqlalchemy.orm.session import Session
from sqlalchemy.pool import QueuePool

Base = declarative_base()

GUID_DEFAULT = GUID_DEFAULT_SQLITE

@contextmanager
def session_scope(session_maker: Callable[..., Session]) -> Iterator[Session]:
	"""Provide a transactional scope around a series of operations."""
	session = session_maker()
	try:
		yield session
		session.commit()
	except:
		session.rollback()
		raise
	finally:
		session.close()

def safe_serialize(d: Any) -> Any:
	if type(d) != dict:
		raise Exception('Cannot safe_serialize a non dictionary type')

	for k, v in d.items():
		if type(v) == datetime.date:
			d[k] = date_util.date_to_str(v)
		elif type(v) == datetime.datetime:
			d[k] = date_util.datetime_to_str(v)
		elif type(v) == decimal.Decimal:
			d[k] = float(v)

	return d


def get_db_url() -> str:
	return os.environ.get('DATABASE_URL')


def create_engine() -> Engine:
	is_prod = is_prod_env(os.environ.get('FLASK_ENV'))
	default_max_overflow = 2 if is_prod else 1
	default_pool_size = 3 if is_prod else 1

	max_overflow = int(os.environ.get('DB_MAX_OVERFLOW', default_max_overflow))
	pool_size = int(os.environ.get('DB_POOL_SIZE', default_pool_size))
	
	# Staging DB has 20 connections
	# Assuming 5 are taken up by GraphQL
	# we allow for 2 per thread, 6 threads total (4 api-server, 2 api-server async)
	# therefore 2 * 6 + 5 = 17 which is under the 20 limit

	return sqlalchemy.create_engine(
		get_db_url(),
		connect_args={
			'connect_timeout': 100,
			"options": "-c statement_timeout=3000",
		},
		pool_pre_ping=True,  # to prevent disconnect errors from causing runtime errors
		pool_recycle=1200,  # dont let connections last for longer than X seconds
		# we want old connections to be recycled and thrown out, so only use the most recent connections
		pool_use_lifo=True,
		max_overflow=max_overflow, # limit to an additional X connections for overflow purposes
		pool_size=pool_size,  # Only allow X connections at most at once
		# We dont want to keep connections in memory, currently we only have about 20 max connections in non-prod envs
		poolclass=QueuePool
	)


class User(Base):
	__tablename__ = 'users'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	company_id = Column(GUID, nullable=True)
	email = Column(String(120), unique=True, nullable=False)
	password = Column(Text, nullable=False)
	role = Column(String(120))
	first_name = Column(Text, nullable=False)
	last_name = Column(Text, nullable=False)
	phone_number = Column(Text)
	is_deleted = Column(Boolean)
	login_method = Column(Text)


class UserRole(Base):
	__tablename__ = 'user_roles'

	value = Column(String, primary_key=True)
	display_name = Column(String)


class Customer(Base):
	__tablename__ = 'customer'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String)
	phone = Column(String)
	email = Column(String)

CompanyDict = TypedDict('CompanyDict', {
	'id': str,
	'identifier': str,
	'name': str
})

class Company(Base):
	"""
	"""
	__tablename__ = 'companies'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_settings_id = Column(GUID)
	contract_id = Column(GUID)
	name = Column(String)
	identifier = Column(String)
	contract_name = Column(String)
	dba_name = Column(String)
	is_cannabis = Column(Boolean)
	is_customer = Column(Boolean)
	is_vendor = Column(Boolean)
	is_payor = Column(Boolean)

	# Last created identifier for a loan belonging to this company.
	latest_loan_identifier = Column(Integer, nullable=False, default=0)
	# Last created identifier for an advance payment belonging to this company.
	latest_disbursement_identifier = Column(Integer, nullable=False, default=0)
	# Last created identifier for a repayment payment belonging to this company.
	latest_repayment_identifier = Column(Integer, nullable=False, default=0)

	def get_display_name(self) -> str:
		return f'{self.name} (DBA {self.dba_name})' if self.dba_name else self.name

	def as_dict(self) -> CompanyDict:
		return CompanyDict(
			id=str(self.id),
			identifier=self.identifier, # May be None.
			name=self.name
		)

class CompanyAgreement(Base):
	__tablename__ = 'company_agreements'

	id = cast(GUID, Column(GUID, nullable=False, primary_key=True))
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), nullable=False))

CompanyLicenseDict = TypedDict('CompanyLicenseDict', {
	'id': str,
	'license_number': str
})

class CompanyLicense(Base):
	__tablename__ = 'company_licenses'

	id = cast(GUID, Column(GUID, nullable=False, primary_key=True, default=GUID_DEFAULT, unique=True))
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id')))
	license_number = Column(Text)
	is_deleted = Column(Boolean, nullable=False, default=False)
	rollup_id = Column(Text)
	legal_name = Column(Text)
	is_current = Column(Boolean)
	license_status = Column(Text)
	license_type = Column(Text)
	license_category = Column(Text)
	license_description = Column(Text)
	us_state = Column(Text)
	expiration_date = Column(Date)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	
	def as_dict(self) -> CompanyLicenseDict:
		return CompanyLicenseDict(
			id=str(self.id),
			license_number=self.license_number
		)

CompanySettingsDict = TypedDict('CompanySettingsDict', {
	'id': str,
	'vendor_agreement_docusign_template': str,
	'payor_agreement_docusign_template': str,
	'active_ebba_application_id': str,
})

class CompanySettings(Base):
	__tablename__ = 'company_settings'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID)
	active_ebba_application_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id')))
	metrc_api_key_id = cast(GUID, Column(GUID, ForeignKey('metrc_api_keys.id')))
	# For CUSTOMER companies, this is the bank account which Bespoke Financial sends advances FROM.
	# This is configuable by bank admins.
	advances_bespoke_bank_account_id = cast(GUID, Column(GUID, ForeignKey('bank_accounts.id')))
	# For CUSTOMER and PAYOR companies, this is the Bespoke Financial bank account company sends payments TO.
	# This is configuable by bank admins.
	collections_bespoke_bank_account_id = cast(GUID, Column(GUID, ForeignKey('bank_accounts.id')))
	# For CUSTOMER companies, this is the bank account which Bespoke Financial sends advances TO.
	# This is configurable by the customer.
	advances_bank_account_id = cast(GUID, Column(GUID, ForeignKey('bank_accounts.id')))
	# For CUSTOMER and PAYOR companies, this is the bank account which company sends payments FROM.
	# This is configurable by the customer.
	collections_bank_account_id = cast(GUID, Column(GUID, ForeignKey('bank_accounts.id')))
	vendor_agreement_docusign_template = Column(Text)
	payor_agreement_docusign_template = Column(Text)
	vendor_onboarding_link = Column(Text)
	has_autofinancing = Column(Boolean)
	two_factor_message_method = Column(Text)
	feature_flags_payload = Column(JSON)
	custom_messages_payload = Column(JSON)
	is_dummy_account = Column(Boolean, default=False)

	def as_dict(self) -> CompanySettingsDict:
		return CompanySettingsDict(
			id=str(self.id),
			vendor_agreement_docusign_template=self.vendor_agreement_docusign_template,
			payor_agreement_docusign_template=self.payor_agreement_docusign_template,
			active_ebba_application_id=str(self.active_ebba_application_id) if self.active_ebba_application_id else None,
		)

ContractDict = TypedDict('ContractDict', {
	'id': str,
	'product_type': str,
	'product_config': Dict,
	'start_date': datetime.date,
	'end_date': datetime.date,
	'adjusted_end_date': datetime.date,
	'terminated_at': datetime.datetime
})

class Contract(Base):
	__tablename__ = 'contracts'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID)
	product_type = Column(Text)
	product_config = Column(JSON)
	start_date = Column(Date)
	end_date = Column(Date)
	adjusted_end_date = Column(Date) # either the end date, or the termination_date if set
	modified_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	terminated_at = Column(DateTime)
	terminated_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	is_deleted = Column(Boolean)

	def as_dict(self) -> ContractDict:
		return ContractDict(
			id=str(self.id),
			product_type=self.product_type,
			product_config=cast(Dict, self.product_config),
			start_date=self.start_date,
			end_date=self.end_date,
			adjusted_end_date=self.adjusted_end_date,
			terminated_at=self.terminated_at
		)

class CompanyPartnershipRequest(Base):
	__tablename__ = 'company_partnership_requests'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	requesting_company_id = Column(GUID, nullable=False)
	company_type = Column(String, nullable=False)
	two_factor_message_method = Column(String, nullable=False)
	company_name = Column(String, nullable=False)
	is_cannabis = Column(Boolean)
	license_info = Column(JSON, nullable=False)
	user_info = Column(JSON, nullable=False)
	requested_by_user_id = Column(GUID, nullable=False)
	settled_at = Column(DateTime)
	settled_by_user_id = Column(GUID)
	is_deleted = Column(Boolean)

class CompanyVendorPartnership(Base):
	__tablename__ = 'company_vendor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	vendor_id = Column(GUID, nullable=False)
	vendor_bank_id = Column(GUID)
	vendor_agreement_id = cast(GUID, Column(GUID, ForeignKey('company_agreements.id'), nullable=True))
	approved_at = Column(DateTime)


class CompanyPayorPartnership(Base):
	__tablename__ = 'company_payor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	payor_id = Column(GUID, nullable=False)
	approved_at = Column(DateTime)

class CompanyVendorContact(Base):
	__tablename__ = 'company_vendor_contacts'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	partnership_id = cast(GUID, Column(GUID, ForeignKey('company_vendor_partnerships.id')))
	vendor_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))

	vendor_user = relationship(
		'User',
		foreign_keys=[vendor_user_id]
	)

class CompanyPayorContact(Base):
	__tablename__ = 'company_payor_contacts'
	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	partnership_id = cast(GUID, Column(GUID, ForeignKey('company_payor_partnerships.id')))
	payor_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))

	payor_user = relationship(
		'User',
		foreign_keys=[payor_user_id]
	)


PurchaseOrderFileDict = TypedDict('PurchaseOrderFileDict', {
	'purchase_order_id': str,
	'file_id': str,
	'file_type': str,
})

class PurchaseOrderFile(Base):
	__tablename__ = 'purchase_order_files'

	purchase_order_id = cast(GUID, Column(GUID, ForeignKey('purchase_orders.id'), primary_key=True, nullable=True))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), primary_key=True, nullable=True))
	file_type = Column(String)

	def as_dict(self) -> PurchaseOrderFileDict:
		return PurchaseOrderFileDict(
			purchase_order_id=str(self.purchase_order_id),
			file_id=str(self.file_id),
			file_type=self.file_type,
		)

PurchaseOrderMetrcTransferDict = TypedDict('PurchaseOrderMetrcTransferDict', {
	'purchase_order_id': str,
	'metrc_transfer_id': str,
})

class PurchaseOrderMetrcTransfer(Base):
	__tablename__ = 'purchase_order_metrc_transfers'

	purchase_order_id = cast(GUID, Column(GUID, ForeignKey('purchase_orders.id'), primary_key=True, nullable=True))
	metrc_transfer_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id'), primary_key=True, nullable=True))

	def as_dict(self) -> PurchaseOrderMetrcTransferDict:
		return PurchaseOrderMetrcTransferDict(
			purchase_order_id=str(self.purchase_order_id),
			metrc_transfer_id=str(self.metrc_transfer_id),
		)

PurchaseOrderDict = TypedDict('PurchaseOrderDict', {
	'id': str,
	'order_number': str,
	'status': str
})

def float_or_null(val: Optional[decimal.Decimal]) -> float:
	if val is None:
		return None

	return float(val)

## Metrc

class MetrcApiKey(Base):
	__tablename__ = 'metrc_api_keys'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	encrypted_api_key = Column(String)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	last_used_at = Column(DateTime)
	is_functioning = Column(Boolean)
	facilities_payload = Column(JSON)
	status_codes_payload = Column(JSON)

class MetrcPlant(Base):
	__tablename__ = 'metrc_plants'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	type = Column(String)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	# TODO(dlluncor): Fill in the associated with plant batch ID, harvest ID, location ID, strain ID
	plant_id = Column(String) # From Metrc info
	label = Column(String) # From Metrc info
	planted_date = Column(Date) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

class MetrcPlantBatch(Base):
	__tablename__ = 'metrc_plant_batches'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	type = Column(String)
	# TODO(dlluncor): Fill in the associated with location ID, strain ID
	plant_batch_id = Column(String) # From Metrc info
	name = Column(String) # From Metrc info
	planted_date = Column(Date) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

class MetrcHarvest(Base):
	__tablename__ = 'metrc_harvests'
	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_number = Column(String)
	us_state = Column(String, nullable=False)
	type = Column(String)
	harvest_id = Column(String) # From Metrc info
	name = Column(String) # From Metrc info
	harvest_start_date = Column(Date) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

class MetrcTransfer(Base):
	__tablename__ = 'metrc_transfers'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_id = cast(GUID, Column(GUID, ForeignKey('company_licenses.id')))
	vendor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	type = Column(String) # Enum based on Metrc API endpoint: db_constants.TransferType.
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	transfer_id = Column(String) # From Metrc info
	shipper_facility_license_number = Column(String)
	shipper_facility_name = Column(String)
	created_date = Column(Date) # From Metrc info
	manifest_number = Column(String) # From Metrc info
	shipment_type_name = Column(String) # From Metrc info
	shipment_transaction_type = Column(String) # From Metrc info
	transfer_payload = Column(JSON) # From Metrc info
	lab_results_status = Column(String) # Computed based on Metrc info
	last_modified_at = Column(DateTime) # From Metrc info
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime)

class MetrcDelivery(Base):
	__tablename__ = 'metrc_deliveries'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	transfer_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id')))
	delivery_id = Column(String) # From Metrc info
	delivery_type = Column(String) # Custom enum: 'INCOMING_INTERNAL', 'INCOMING_FROM_VENDOR', 'INCOMING_UNKNOWN', 'OUTGOING_INTERNAL', 'OUTGOING_TO_VENDOR', 'OUTGOING_UNKNOWN', 'UNKNOWN'.
	us_state = Column(String, nullable=False)
	recipient_facility_license_number = Column(String)
	recipient_facility_name = Column(String)
	payor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	shipment_type_name = Column(String)
	shipment_transaction_type = Column(String)
	received_datetime = Column(DateTime)
	delivery_payload = Column(JSON)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime)

class MetrcPackage(Base):
	__tablename__ = 'metrc_packages'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	
	type = Column(String) # Enum based on Metrc API endpoint: 'active' | 'onhold' | 'inactive'.
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	package_id = Column(String) # From Metrc info
	package_label = Column(String) # From Metrc info
	package_type = Column(String) # From Metrc info
	product_name = Column(String) # From Metrc info
	product_category_name = Column(String) # From Metrc info
	package_payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

	packaged_date = Column(Date, nullable=False) # From Metrc info
	quantity = Column(Numeric) # From Metrc info
	unit_of_measure = Column(Text) # From Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime)

class MetrcTransferPackage(Base):
	__tablename__ = 'metrc_transfer_packages'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	
	#metrc_package_id = cast(GUID, Column(GUID, ForeignKey('metrc_packages.id')))
	transfer_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id')))
	delivery_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_deliveries.id')))
	delivery_id = Column(String) # From Metrc info

	type = Column(String)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	package_id = Column(String) # From Metrc info
	package_label = Column(String) # From Metrc info
	package_type = Column(String) # From Metrc info
	product_name = Column(String) # From Metrc info
	product_category_name = Column(String) # From Metrc info
	package_payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info
	created_date = Column(Date) # From Metrc info (the transfer)

	shipped_quantity = Column(Numeric) # From Metrc info
	received_quantity = Column(Numeric) # From Metrc info
	shipped_unit_of_measure = Column(Text) # From Metrc info
	received_unit_of_measure = Column(Text) # From Metrc info
	shipper_wholesale_price = Column(Numeric) # From Metrc info
	shipment_package_state = Column(String) # From Metrc info
	lab_results_status = Column(String) # Derived from Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime)

class MetrcSalesReceipt(Base):
	__tablename__ = 'metrc_sales_receipts'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	type = Column(Text)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	receipt_id = Column(Text)
	receipt_number = Column(Text) # From Metrc info
	sales_customer_type = Column(Text) # From Metrc info
	sales_datetime = Column(DateTime) # From Metrc info
	total_packages = Column(Integer) # From Metrc info
	total_price = Column(Numeric) # From Metrc info
	is_final = Column(Boolean) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

class MetrcSalesTransaction(Base):
	__tablename__ = 'metrc_sales_transactions'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	type = Column(Text)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	receipt_id = Column(String) # From parent Metrc info
	receipt_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_sales_receipts.id')))
	package_id = Column(String) # From Metrc info
	package_label = Column(String) # From Metrc info
	product_name = Column(String)
	product_category_name = Column(String)
	quantity_sold = Column(Numeric)
	unit_of_measure = Column(String)
	total_price = Column(Numeric) # From Metrc info
	recorded_datetime = Column(DateTime) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

## End Metrc

class Artifact(Base):
	__abstract__ = True

	funded_at = Column(DateTime)

	def max_loan_amount(self) -> Optional[decimal.Decimal]:
		raise NotImplementedError("max_loan_amount is not implemented on this artifact")


class PurchaseOrder(Artifact):
	"""
	Purchase orders created by customers for financing
	"""
	__tablename__ = 'purchase_orders'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	vendor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	order_number = Column(String)
	order_date = Column(Date)
	delivery_date = Column(Date)
	amount = Column(Numeric)
	amount_funded = Column(Numeric)
	status = Column(String)
	requested_at = Column(DateTime)
	approved_at = Column(DateTime)
	rejected_at = Column(DateTime)
	rejection_note = Column(Text)
	bank_rejection_note = Column(Text)
	funded_at = Column(DateTime)
	is_cannabis = Column(Boolean)
	is_deleted = Column(Boolean)
	is_metrc_based = Column(Boolean)
	customer_note = Column(Text)
	bank_note = Column(Text)

	vendor = relationship(
		'Company',
		foreign_keys=[vendor_id]
	)

	company = relationship(
		'Company',
		foreign_keys=[company_id]
	)

	def as_dict(self) -> PurchaseOrderDict:
		return PurchaseOrderDict(
			id=str(self.id),
			order_number=self.order_number,
			status=self.status
		)

	def max_loan_amount(self) -> Optional[decimal.Decimal]:
		return self.amount

class LineOfCredit(Base):
	"""
	Line of credits created by customers for financing
	"""
	__tablename__ = 'line_of_credits'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	recipient_vendor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	is_credit_for_vendor = Column(Boolean)
	customer_note = Column(Text)

	company = relationship(
		'Company',
		foreign_keys=[company_id]
	)

	recipient_vendor = relationship(
		'Company',
		foreign_keys=[recipient_vendor_id]
	)

PaymentDict = TypedDict('PaymentDict', {
	'id': str,
	'type': str,
	'amount': float,
	'method': str,
	'submitted_at': datetime.datetime,
	'deposit_date': datetime.date,
	'settlement_date': datetime.date,
})

class Payment(Base):
	__tablename__ = 'payments'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	# Identifier of payment, unique under scope (company_id, type, settlement_identifier).
	# Essentially denotes the 1st, 2nd, etc advance of a company
	# and the 1st, 2nd, etc repayment of a company.
	settlement_identifier = Column(String)

	type = Column(String)
	method = Column(String)
	requested_amount = Column(Numeric)
	amount = Column(Numeric)
	requested_payment_date = Column(Date)
	payment_date = Column(Date)
	deposit_date = Column(Date)
	settlement_date = Column(Date)
	items_covered = cast(ItemsCoveredDict, Column(JSON))
	# Sender's bank account.
	# In the case of an advance: one of Bespoke Financial's bank account.
	# In the case of a reverse draft ACH: Customer's bank account.
	company_bank_account_id = Column(GUID)
	# Recipient's bank account.
	# In the case of an advance: either Customer's or Vendor's bank account.
	# In the case of a reverse draft ACH: one of Bespoke Financial's bank account.
	recipient_bank_account_id = Column(GUID)
	customer_note = Column(Text)
	# For advances, bank note is: memo / additional info for recipient (which is exported to external bank).
	# Bank note not used for other payment types yet.
	bank_note = Column(Text)

	requested_by_user_id = Column(GUID)
	submitted_at = Column(DateTime)
	submitted_by_user_id = Column(GUID)
	settled_at = Column(DateTime)
	settled_by_user_id = Column(GUID)
	originating_payment_id = Column(GUID)
	is_deleted = Column(Boolean)
	reversed_at = Column(DateTime)


	def as_dict(self) -> PaymentDict:
		return PaymentDict(
			id=str(self.id),
			type=self.type,
			amount=float(self.amount),
			method=self.method,
			submitted_at=self.submitted_at,
			deposit_date=self.deposit_date,
			settlement_date=self.settlement_date,
		)

TransactionDict = TypedDict('TransactionDict', {
	'id': str,
	'type': str,
	'amount': float,
	'loan_id': str,
	'payment_id': str,
	'to_principal': float,
	'to_interest': float,
	'to_fees': float,
	'effective_date': datetime.date,
	'is_deleted': bool
})

# Transaction with some additional pieces of information
AugmentedTransactionDict = TypedDict('AugmentedTransactionDict', {
	'transaction': TransactionDict,
	'payment': PaymentDict # The payment which was used to create this transaction
})

class Transaction(Base):
	__tablename__ = 'transactions'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	type = Column(Text, nullable=False)
	subtype = Column(Text)
	amount = Column(Numeric, nullable=False)
	loan_id = Column(GUID)
	payment_id = Column(GUID, nullable=False)
	to_principal = Column(Numeric, nullable=False)
	to_interest = Column(Numeric, nullable=False)
	to_fees = Column(Numeric, nullable=False)
	effective_date = Column(Date, nullable=False)
	created_by_user_id = Column(GUID)
	is_deleted = Column(Boolean)

	def as_dict(self) -> TransactionDict:
		return TransactionDict(
			id=str(self.id),
			type=self.type,
			amount=float(self.amount),
			loan_id=str(self.loan_id) if self.loan_id else None,
			payment_id=str(self.payment_id) if self.payment_id else None,
			to_principal=float(self.to_principal),
			to_interest=float(self.to_interest),
			to_fees=float(self.to_fees),
			effective_date=self.effective_date,
			is_deleted=self.is_deleted
		)


LoanDict = TypedDict('LoanDict', {
	'id': str,
	'company_id': str,
	'artifact_id': str,
	'identifier': str,
	'created_at': datetime.datetime,
	'origination_date': datetime.date,
	'maturity_date': datetime.date,
	'adjusted_maturity_date': datetime.date,
	'amount': float,
	'status': str,
	'outstanding_principal_balance': float,
	'outstanding_interest': float,
	'outstanding_fees': float,
	'is_frozen': bool,
	'funded_at': datetime.datetime,
	'closed_at': datetime.datetime
})

class Loan(Base):
	__tablename__ = 'loans'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	loan_report_id = cast(GUID, Column(GUID, ForeignKey('loan_reports.id')))

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	identifier = Column(String)
	disbursement_identifier = Column(String)

	loan_type = Column(Text)
	artifact_id = Column(GUID)
	requested_payment_date = Column(Date)
	origination_date = Column(Date)
	maturity_date = Column(Date)
	adjusted_maturity_date = Column(Date)
	amount = Column(Numeric, nullable=False)
	status = Column(String)
	payment_status = Column(String)

	requested_at = Column(DateTime)
	closed_at = Column(DateTime)

	rejected_at = Column(DateTime)
	rejected_by_user_id = Column(GUID)
	rejection_note = Column(Text)

	approved_at = Column(DateTime)
	approved_by_user_id = Column(GUID)

	funded_at = Column(DateTime)
	funded_by_user_id = Column(GUID)

	outstanding_principal_balance = Column(Numeric)
	outstanding_interest = Column(Numeric)
	outstanding_fees = Column(Numeric)

	is_deleted = Column(Boolean)
	# If frozen, loan financials are never updated; this is for loans
	# imported from Bespoke Financial's legacy system in which loan
	# financials were calculated based on rules no longer supported.
	is_frozen = Column(Boolean)

	def as_dict(self) -> LoanDict:
		return LoanDict(
			id=str(self.id),
			company_id=str(self.company_id),
			artifact_id=str(self.artifact_id) if self.artifact_id else None,
			identifier=self.identifier,
			created_at=self.created_at,
			origination_date=self.origination_date,
			maturity_date=self.maturity_date,
			adjusted_maturity_date=self.adjusted_maturity_date,
			amount=float(self.amount),
			status=self.status,
			outstanding_principal_balance=float_or_null(self.outstanding_principal_balance),
			outstanding_interest=float_or_null(self.outstanding_interest),
			outstanding_fees=float_or_null(self.outstanding_fees),
			is_frozen=self.is_frozen,
			funded_at=self.funded_at,
			closed_at=self.closed_at
		)

class LoanReport(Base):
	__tablename__ = 'loan_reports'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	repayment_date = Column(Date)
	total_principal_paid = Column(Numeric)
	total_interest_paid = Column(Numeric)
	total_fees_paid = Column(Numeric)
	financing_period = Column(Integer)
	financing_day_limit = Column(Integer)

class BankFinancialSummary(Base):
	__tablename__ = 'bank_financial_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	date = Column(Date, nullable=False)
	product_type = Column(Text, nullable=False)
	total_limit = Column(Numeric, nullable=False)
	total_outstanding_principal = Column(Numeric, nullable=False)
	total_outstanding_principal_for_interest = Column(Numeric, nullable=False)
	total_outstanding_interest = Column(Numeric, nullable=False)
	total_outstanding_fees = Column(Numeric, nullable=False)
	total_principal_in_requested_state = Column(Numeric, nullable=False)
	available_limit = Column(Numeric, nullable=False)
	adjusted_total_limit = Column(Numeric, nullable=False)
	interest_accrued_today = Column(Numeric, nullable=False)

ProratedFeeInfoDict = TypedDict('ProratedFeeInfoDict', {
	'numerator': int,
	'denom': int,
	'fraction': float,
	'day_to_pay': str # Day to pay in our standard MM/DD/YYYY format
})

FeeDict = TypedDict('FeeDict', {
	'amount_accrued': float, # how much has accrued in fees for the time period
	'minimum_amount': float, # the minimum you must pay in a time period
	'amount_short': float, # how much you owe for a time period because of the minimum_due
	'duration': str, # Over what duration is this fee owed
	'prorated_info': ProratedFeeInfoDict
})

class FinancialSummary(Base):
	__tablename__ = 'financial_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	date = Column(Date)
	company_id = Column(GUID, nullable=False)
	total_limit = Column(Numeric, nullable=False)
	total_outstanding_principal = Column(Numeric, nullable=False)
	total_outstanding_principal_for_interest = Column(Numeric)
	total_outstanding_interest = Column(Numeric, nullable=False)
	total_outstanding_fees = Column(Numeric, nullable=False)
	total_principal_in_requested_state = Column(Numeric, nullable=False)
	total_amount_to_pay_interest_on = Column(Numeric)
	available_limit = Column(Numeric, nullable=False)
	adjusted_total_limit = Column(Numeric, nullable=False)
	minimum_monthly_payload = Column(JSON, nullable=False)
	account_level_balance_payload = Column(JSON, nullable=False)
	day_volume_threshold_met = Column(Date)
	interest_accrued_today = Column(Numeric, nullable=False)
	product_type = Column(Text, nullable=True)
	needs_recompute = Column(Boolean)
	days_to_compute_back = Column(Integer)

### End of financial tables

class RevokedTokenModel(Base):
	__tablename__ = 'revoked_tokens'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=False))
	jti = Column(String(120), nullable=False)


TwoFactorFormInfoDict = TypedDict('TwoFactorFormInfoDict', {
	'type': str,
	'payload': Dict
})


class TwoFactorLink(Base):
	"""
					Two factor tokens for rendering pages when a user isnt signed in.
	"""
	__tablename__ = 'two_factor_links'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	token_states = Column(JSON)
	form_info = Column(JSON)
	expires_at = Column(DateTime, default=datetime.datetime.utcnow)


class File(Base):
	"""
					Two factor tokens for rendering pages when a user isnt signed in.
	"""
	__tablename__ = 'files'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	sequential_id = Column(Integer)
	company_id = Column(GUID)
	name = Column(Text)
	path = Column(Text)
	extension = Column(Text)
	size = Column(BigInteger)
	mime_type = Column(Text)
	created_by_user_id = Column(GUID)
	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)


EbbaApplicationDict = TypedDict('EbbaApplicationDict', {
	'id': str,
	'company_id': str,
	'application_date': datetime.date,
	'monthly_accounts_receivable': float,
	'monthly_inventory': float,
	'monthly_cash': float,
	'amount_cash_in_daca': float,
	'status': str,
	'requested_at': datetime.datetime,
	'approved_at': datetime.datetime,
	'rejected_at': datetime.datetime,
	'rejection_note': str
})

class EbbaApplication(Base):
	__tablename__ = 'ebba_applications'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	# TODO (warren): change category to be non-nullable.
	category = Column(Text)

	status = Column(String, nullable=False)
	application_date = Column(Date)
	is_deleted = Column(Boolean, nullable=False, default=False)
	submitted_by_user_id = Column(GUID)

	monthly_accounts_receivable = Column(Numeric)
	monthly_inventory = Column(Numeric)
	monthly_cash = Column(Numeric)
	amount_cash_in_daca = Column(Numeric)
	calculated_borrowing_base = Column(Numeric)
	rejection_note = Column(Text)
	expires_at = Column(Date)

	requested_at = Column(DateTime)
	approved_at = Column(DateTime)
	rejected_at = Column(DateTime)

	company = relationship(
		'Company',
		foreign_keys=[company_id]
	)

	def as_dict(self) -> EbbaApplicationDict:
		return EbbaApplicationDict(
			id=str(self.id),
			company_id=str(self.id),
			application_date=self.application_date,
			monthly_accounts_receivable=float(self.monthly_accounts_receivable) if self.monthly_accounts_receivable is not None else None,
			monthly_inventory=float(self.monthly_inventory) if self.monthly_inventory is not None else None,
			monthly_cash=float(self.monthly_cash) if self.monthly_cash is not None else None,
			amount_cash_in_daca=float(self.amount_cash_in_daca) if self.amount_cash_in_daca is not None else None,
			status=self.status,
			requested_at=self.requested_at,
			approved_at=self.approved_at,
			rejected_at=self.rejected_at,
			rejection_note=self.rejection_note,
		)

class EbbaApplicationFile(Base):
	__tablename__ = 'ebba_application_files'

	ebba_application_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id'), nullable=False, primary_key=True))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), nullable=False, primary_key=True))


InvoiceDict = TypedDict('InvoiceDict', {
	'id': str,
	'company_id': str,
	'payor_id': str,
	'payment_id': Optional[str],
	'invoice_number': str,
	'subtotal_amount': float,
	'total_amount': float,
	'taxes_amount': float,
	'invoice_date': datetime.date,
	'invoice_due_date': datetime.date,
	'status': str,
	'requested_at': datetime.datetime,
	'approved_at': datetime.datetime,
	'funded_at': datetime.datetime,
	'rejected_at': datetime.datetime,
	'rejection_note': str,
	'is_cannabis': bool,
	'payment_requested_at': datetime.datetime,
	'payment_confirmed_at': datetime.datetime,
	'payment_rejected_at': datetime.datetime,
	'payment_rejection_note': str,
})

class Invoice(Artifact):
	__tablename__ = 'invoices'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	payor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	payment_id = cast(GUID, Column(GUID, ForeignKey('payments.id'), nullable=True))
	invoice_number = Column(String)
	subtotal_amount = Column(Numeric)
	taxes_amount = Column(Numeric)
	total_amount = Column(Numeric)
	invoice_date = Column(Date, nullable=True)
	invoice_due_date = Column(Date, nullable=True)
	status = Column(String)
	requested_at = Column(DateTime)
	approved_at = Column(DateTime)
	funded_at = Column(DateTime)
	rejected_at = Column(DateTime)
	rejection_note = Column(Text)
	payment_requested_at = Column(DateTime)
	payment_confirmed_at = Column(DateTime)
	payment_rejected_at = Column(DateTime)
	payment_rejection_note = Column(Text)
	is_cannabis = Column(Boolean)
	is_deleted = Column(Boolean)

	company = relationship(
		'Company',
		foreign_keys=[company_id]
	)

	payor = relationship(
		'Company',
		foreign_keys=[payor_id]
	)

	def as_dict(self) -> InvoiceDict:
		return InvoiceDict(
			id=str(self.id),
			company_id=str(self.company_id),
			payor_id=str(self.payor_id),
			payment_id=str(self.payment_id) if self.payment_id else None,
			invoice_number=self.invoice_number,
			subtotal_amount=float_or_null(self.subtotal_amount),
			total_amount=float_or_null(self.total_amount),
			taxes_amount=float_or_null(self.taxes_amount),
			invoice_date=self.invoice_date,
			invoice_due_date=self.invoice_due_date,
			status=self.status,
			requested_at=self.requested_at,
			approved_at=self.approved_at,
			funded_at=self.funded_at,
			rejected_at=self.rejected_at,
			rejection_note=self.rejection_note,
			is_cannabis=self.is_cannabis,
			payment_requested_at=self.payment_requested_at,
			payment_confirmed_at=self.payment_confirmed_at,
			payment_rejected_at=self.payment_rejected_at,
			payment_rejection_note=self.payment_rejection_note,
		)

	def max_loan_amount(self) -> Optional[decimal.Decimal]:
		return self.subtotal_amount

InvoiceFileDict = TypedDict('InvoiceFileDict', {
	'invoice_id': str,
	'file_id': str,
	'file_type': str,
})

class InvoiceFile(Base):
	__tablename__ = 'invoice_files'

	invoice_id = Column(GUID, primary_key=True, nullable=False)
	file_id = Column(GUID, primary_key=True, nullable=False)
	file_type = Column(String)

	def as_dict(self) -> InvoiceFileDict:
		return InvoiceFileDict(
			invoice_id=str(self.invoice_id),
			file_id=str(self.file_id),
			file_type=self.file_type,
		)

class AuditEvent(Base):

	__tablename__ = "audit_events"

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))
	is_system = Column(Boolean, nullable=True)
	action = Column(String, nullable=False)
	outcome = Column(String, nullable=False)
	data = Column(JSON, nullable=True)
	error = Column(String, nullable=True)


class BankAccount(Base):
	__tablename__ = 'bank_accounts'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))

	bank_name = Column(String, nullable=False)
	account_type = Column(String, nullable=False)
	account_title = Column(String)
	account_number = Column(String, nullable=False)
	routing_number = Column(String, nullable=False)
	can_ach = Column(Boolean, nullable=True)
	can_wire = Column(Boolean, nullable=True)
	bank_address = Column(String)
	recipient_name = Column(String)
	recipient_address = Column(Text)
	recipient_address_2 = Column(Text)
	torrey_pines_template_name = Column(Text)
	verified_date = Column(Date)
	is_cannabis_compliant = Column(Boolean, default=False)
	verified_at = Column(DateTime)

AsyncPipelineDict = TypedDict('AsyncPipelineDict', {
	'id': str,
	'name': str,
	'status': str,
	'internal_state': Dict,
	'params': Dict
})

class AsyncPipeline(Base):
	__tablename__ = 'async_pipelines'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String)
	status = Column(String)
	internal_state = Column(JSON)
	params = Column(JSON)
	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	def as_dict(self) -> AsyncPipelineDict:
		return AsyncPipelineDict(
			id=str(self.id),
			name=self.name,
			status=self.status,
			internal_state=cast(Dict, self.internal_state),
			params=cast(Dict, self.params)
		)

class RetryingQuery(_Query):
	__retry_count__ = 4

	def __init__(self, *args: Any, **kwargs: Any) -> None:
		super().__init__(*args, **kwargs)

	def _log_and_sleep(self, attempts: int, ex: Exception) -> None:
		sleep_for = 2 ** (attempts - 1)
		logging.error(
			"Database connection error: {} - sleeping for {}s"
			" and will retry (attempt #{} of {})".format(
				ex, sleep_for, attempts, self.__retry_count__
			)
		)
		time.sleep(sleep_for)

	def __iter__(self) -> Any:
		attempts = 0
		while True:
			attempts += 1
			try:
				return super().__iter__()
			except TimeoutError as ex:
				if attempts < self.__retry_count__:
					self._log_and_sleep(attempts, ex)
					continue
				else:
					raise
			except OperationalError as ex:
				if attempts < self.__retry_count__:
					self._log_and_sleep(attempts, ex)
					continue
				else:
					raise
			except StatementError as ex:
				if "reconnect until invalid transaction is rolled back" not in str(ex):
					raise
				self.session.rollback()
			except Exception as e:
				logging.error('Got exception type({})'.format(type(e)))
				raise


def new_sessionmaker(engine: object) -> Callable:
	return sessionmaker(engine, query_cls=RetryingQuery)
