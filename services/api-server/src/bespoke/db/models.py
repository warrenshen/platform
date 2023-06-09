import datetime
import decimal
import logging
import os
import time
from contextlib import contextmanager
from typing import (Any, Callable, Dict, Iterator, List, Optional, cast)

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
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, StatementError, TimeoutError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.mutable import MutableDict, MutableList
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


# statement_timeout: timeout (in ms) for a single SQL statement.
def create_engine(statement_timeout: int = 3000, is_prod_default: bool = None) -> Engine:
	if is_prod_default is None:
		is_prod = is_prod_env(os.environ.get('FLASK_ENV'))
	else:
		is_prod = is_prod_default

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
			'options': f'-c statement_timeout={statement_timeout}',
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
	parent_company_id = Column(GUID, nullable=True) # TODO(warrenshen): remove nullable=True in the future.
	company_id = Column(GUID, nullable=True)
	email = Column(String(120), unique=True, nullable=False)
	password = Column(Text)
	role = Column(String(120))
	company_role = Column(String(120))
	company_role_new = Column(JSON, nullable=True) # TODO (grace) temporary until new role migration is complete
	first_name = Column(Text, nullable=False)
	last_name = Column(Text, nullable=False)
	full_name = Column(Text)
	phone_number = Column(Text)
	is_deleted = Column(Boolean, default=False)
	login_method = Column(Text, nullable=False)
	created_by_user_id = cast(GUID, Column(GUID, nullable=True))


class UserRole(Base):
	__tablename__ = 'user_roles'

	value = Column(String, primary_key=True)
	display_name = Column(String)


SettingsDict = TypedDict('SettingsDict', {
	'emails': List[str],
})

class ParentCompany(Base):
	"""
	A ParentCompany (entity run by a single operator) has many Companies
	(subentities under the aforementioned entity). For example:
	- ParentCompany: Embarc
	- Company 1: Embarc Alameda (Location 1)
	- Company 2: Embarc Martinez (Location 2)
	- Company 3: Embarc Tahoe (Location 3)
	"""
	__tablename__ = 'parent_companies'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	name = Column(String, nullable=False, unique=True)
	settings = cast(SettingsDict, Column(JSON))

CompanyDict = TypedDict('CompanyDict', {
	'id': str,
	'identifier': str,
	'name': str
})

class AuditTrail(Base):
	"""
	This is used for tracking when different tables make changes where we want to preserve the history
	"""
	__tablename__ = 'audit_trails'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	changed_table = Column(String)
	changed_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	changed_date = Column(Date)
	changed_row_id = Column(GUID)
	metadata_info = Column(JSON)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime)

class Company(Base):
	"""
	A Company belongs to a ParentCompany.
	"""
	__tablename__ = 'companies'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	parent_company_id = Column(GUID, nullable=True) # TODO(warrenshen): remove nullable=True in the future.
	company_settings_id = Column(GUID)
	contract_id = Column(GUID)
	name = Column(String)
	identifier = Column(String)
	contract_name = Column(String)
	dba_name = Column(String)
	employer_identification_number = Column(String)
	is_cannabis = Column(Boolean)
	is_customer = Column(Boolean)
	is_vendor = Column(Boolean)
	is_payor = Column(Boolean)
	address = Column(String)
	phone_number = Column(String)
	country = Column(String)
	state = Column(String)
	city = Column(String)
	zip_code = Column(String)
	timezone = Column(String)
	# We need to track debt facility waivers at both a company and loan level
	# This also entails tracking waiver dates at each level as each scenario is different
	debt_facility_status = Column(String)
	debt_facility_waiver_date = Column(Date)
	debt_facility_waiver_expiration_date = Column(Date)
	surveillance_status = Column(String)
	surveillance_status_note = Column(String)
	qualify_for = Column(String)

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
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	is_deleted = Column(Boolean, nullable=False, default=False)

	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id')))
	facility_row_id = cast(GUID, Column(GUID, ForeignKey('company_facilities.id')))
	license_number = Column(Text)
	rollup_id = Column(Text)
	legal_name = Column(Text)
	dba_name = Column(Text)
	is_current = Column(Boolean)
	license_status = Column(Text)
	license_category = Column(Text)
	license_description = Column(Text)
	expiration_date = Column(Date)
	us_state = Column(Text)
	estimate_zip = Column(Text)
	estimate_latitude = Column(Numeric(precision=9, scale=7))
	estimate_longitude = Column(Numeric(precision=10, scale=7))
	is_underwriting_enabled = Column(Boolean)
	
	def as_dict(self) -> CompanyLicenseDict:
		return CompanyLicenseDict(
			id=str(self.id),
			license_number=self.license_number
		)

CompanySettingsDict = TypedDict('CompanySettingsDict', {
	'id': str,
	'vendor_agreement_docusign_template': str,
	'payor_agreement_docusign_template': str,
	'active_borrowing_base_id': str,
	'active_financial_report_id': str,
	'interest_end_date': datetime.date,
	'late_fees_end_date': datetime.date,
	'write_off_date': datetime.date,
})

class CompanySettings(Base):
	__tablename__ = 'company_settings'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID)
	active_ebba_application_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id')))
	active_borrowing_base_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id')))
	active_financial_report_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id')))
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
	is_dummy_account = Column(Boolean, default=False) # Whether company is a demo company (fake company for internal testing) or not.
	client_success_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'))) # used for commission
	business_development_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'))) # used for commission
	underwriter_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	is_autogenerate_repayments_enabled = Column(Boolean, default=False)

	# These dates are used to track alternate profit calculations based
	# off a customer no longer operating in the happy path
	interest_end_date = Column(Date)
	late_fees_end_date = Column(Date)
	write_off_date = Column(Date)

	def as_dict(self) -> CompanySettingsDict:
		return CompanySettingsDict(
			id=str(self.id),
			vendor_agreement_docusign_template=self.vendor_agreement_docusign_template,
			payor_agreement_docusign_template=self.payor_agreement_docusign_template,
			active_borrowing_base_id=str(self.active_borrowing_base_id) if self.active_borrowing_base_id else None,
			active_financial_report_id=str(self.active_financial_report_id) if self.active_financial_report_id else None,
			interest_end_date=self.interest_end_date,
			late_fees_end_date=self.late_fees_end_date,
			write_off_date=self.write_off_date,
		)

class CompanyFacility(Base):
	__tablename__ = 'company_facilities'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	is_deleted = Column(Boolean, nullable=False, default=False)

	company_id = Column(GUID)
	name = Column(String)
	address = Column(String)
	underwriting_mode = Column(String) # db_constants.CompanyFacilityUnderwritingMode

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
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	is_deleted = Column(Boolean)

	requesting_company_id = Column(GUID, nullable=False)
	company_type = Column(String, nullable=False)
	two_factor_message_method = Column(String, nullable=False)
	company_name = Column(String, nullable=False)
	is_cannabis = Column(Boolean)
	license_info = Column(JSON, nullable=False)
	user_info = Column(JSON, nullable=False)
	request_info = Column(JSON, nullable=True)
	requested_by_user_id = Column(GUID, nullable=False)
	settled_at = Column(DateTime)
	settled_by_user_id = Column(GUID)

class CompanyVendorPartnership(Base):
	__tablename__ = 'company_vendor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	company_id = Column(GUID, nullable=False)
	vendor_id = Column(GUID, nullable=False)
	vendor_bank_id = Column(GUID)
	vendor_agreement_id = cast(GUID, Column(GUID, ForeignKey('company_agreements.id'), nullable=True))
	approved_at = Column(DateTime)


class CompanyPayorPartnership(Base):
	__tablename__ = 'company_payor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	company_id = Column(GUID, nullable=False)
	payor_id = Column(GUID, nullable=False)
	approved_at = Column(DateTime)

class CompanyVendorContact(Base):
	__tablename__ = 'company_vendor_contacts'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	partnership_id = cast(GUID, Column(GUID, ForeignKey('company_vendor_partnerships.id')))
	vendor_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	is_active = Column(Boolean)

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

class CustomerSurveillanceResult(Base):
	"""
	Customer surveillance results are used to track historicals for
	the customer surveillance dashboard
	"""
	__tablename__ = 'customer_surveillance_results'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	qualifying_date = Column(Date)
	qualifying_product = Column(String)
	bank_note = Column(String)
	surveillance_status = Column(String)
	submitting_user_id = cast(GUID, Column(GUID, ForeignKey('users.id')))
	metadata_info = Column(JSON)
	surveillance_info = Column(JSON)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime)
	is_deleted = Column(Boolean)

class DebtFacility(Base):
	__tablename__ = "debt_facilities"
	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String)
	product_types = Column(JSON, nullable=True)

class DebtFacilityEvent(Base):
	__tablename__ = "debt_facility_events"
	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))
	loan_report_id = cast(GUID, Column(GUID, ForeignKey('loan_reports.id'), nullable=True))
	event_category = Column(String) # see DebtFacilityEventCategory in db_constants.py
	event_date = Column(DateTime)
	event_comments = Column(String, nullable=True)
	event_amount = Column(Numeric, nullable=True)
	event_payload = Column(JSON, nullable=True)

class DebtFacilityCapacity(Base):
	__tablename__ = "debt_facility_capacities"
	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	amount = Column(Numeric)
	capacity_type = Column(String)
	changed_at = Column(DateTime)
	changed_by = cast(GUID, Column(GUID, ForeignKey('users.id')))
	debt_facility_id = cast(GUID, Column(GUID, ForeignKey('debt_facilities.id')))

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

## Begin Metrc

MetrcApiKeyDict = TypedDict('MetrcApiKeyDict', {
	'id': str,
	'us_state': Optional[str],
	'encrypted_api_key': str,
	'company_id': str,
})

class MetrcApiKey(Base):
	__tablename__ = 'metrc_api_keys'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	us_state = Column(String, nullable=False)
	is_deleted = Column(Boolean, default=False)

	encrypted_api_key = Column(String)
	hashed_key = Column(String) # The one we can use for duplicate metrc key detection
	# Whether the /facilities endpoint is working. If True, facilities_payload will have useful content.
	is_functioning = Column(Boolean)
	# Timestamp of when permissions were last refreshed (when permissions_payload was updated).
	permissions_refreshed_at = Column(DateTime)
	# Timestamp of when API key was last functioning (when status_codes_payload was updated).
	last_used_at = Column(DateTime)
	use_saved_licenses_only = Column(Boolean)

	facilities_payload = Column(JSON) # The raw JSON response from the Metrc API /facilities/v1 endpoint.
	permissions_payload = Column(JSON) # List of permissions information as of the most recent time API key was tested.
	status_codes_payload = Column(JSON) # Dictionary of license => status codes of downloads from Metrc API endpoints.

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	def as_dict(self) -> MetrcApiKeyDict:
		return MetrcApiKeyDict(
			id=str(self.id),
			us_state=self.us_state if self.us_state else None,
			encrypted_api_key=self.encrypted_api_key,
			company_id=str(self.company_id),
		)

class MetrcAnalysisSummary(Base):
	__tablename__ = 'metrc_analysis_summaries'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	facility_row_id = cast(GUID, Column(GUID, ForeignKey('company_facilities.id')))
	date = Column(Date)
	methodology = Column(String)
	default_methodology = Column(String)

	counts_payload = Column(JSON)
	inventory_accuracy_payload = Column(JSON)
	inventory_payload = Column(JSON)
	cogs_revenue_payload = Column(JSON)
	stale_info_payload = Column(JSON)

class MetrcDownloadSummary(Base):
	__tablename__ = 'metrc_download_summaries'

	# Per day summary of jobs
	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	license_number = Column(String)
	date = Column(Date)

	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	metrc_api_key_id = cast(GUID, Column(GUID, ForeignKey('metrc_api_keys.id')))

	status = Column(String) # Enum: db_constants.MetrcDownloadSummaryStatus.
	harvests_status = Column(String)
	packages_status = Column(String)
	plant_batches_status = Column(String)
	plants_status = Column(String)
	sales_status = Column(String)
	transfers_status = Column(String)

	retry_payload = Column(JSON) # stores all paths to retry
	err_details = Column(JSON)
	num_retries = Column(Integer)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)


class MetrcPlant(Base):
	__tablename__ = 'metrc_plants'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	type = Column(String)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	plant_id = Column(String) # From Metrc info
	label = Column(String) # From Metrc info
	planted_date = Column(Date) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class MetrcPlantBatch(Base):
	__tablename__ = 'metrc_plant_batches'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	type = Column(String)
	plant_batch_id = Column(String) # From Metrc info
	name = Column(String) # From Metrc info
	planted_date = Column(Date) # From Metrc info
	payload = Column(JSON) # From Metrc info
	last_modified_at = Column(DateTime) # From Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

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

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class MetrcTransfer(Base):
	__tablename__ = 'metrc_transfers'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	us_state = Column(String)
	transfer_id = Column(String) # From Metrc info
	shipper_facility_license_number = Column(String)
	shipper_facility_name = Column(String)
	created_date = Column(Date) # From Metrc info
	manifest_number = Column(String) # From Metrc info
	shipment_type_name = Column(String) # Deprecated: use Metrc delivery
	shipment_transaction_type = Column(String) # Deprecated: use Metrc delivery
	lab_results_status = Column(String) # Computed based on Metrc info
	last_modified_at = Column(DateTime) # From Metrc info
	# transfer_payload records the entire raw JSON returned by Metrc API.
	transfer_payload = Column(JSON) # From Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class MetrcDelivery(Base):
	__tablename__ = 'metrc_deliveries'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	transfer_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id')))
	delivery_id = Column(String) # From Metrc info
	us_state = Column(String, nullable=False)
	recipient_facility_license_number = Column(String) # From Metrc info
	recipient_facility_name = Column(String) # From Metrc info
	shipment_type_name = Column(String) # From Metrc info
	shipment_transaction_type = Column(String) # From Metrc info
	received_datetime = Column(DateTime) # From Metrc info
	# delivery_payload records the entire raw JSON returned by Metrc API.
	delivery_payload = Column(JSON) # From Metrc info

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class MetrcTransferPackage(Base):
	__tablename__ = 'metrc_transfer_packages'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)

	transfer_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id')))
	delivery_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_deliveries.id')))
	delivery_id = Column(String) # From Metrc info

	type = Column(String)
	us_state = Column(String, nullable=False)
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
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class CompanyDelivery(Base):
	__tablename__ = 'company_deliveries'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)

	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
	vendor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	payor_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))
	transfer_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_transfers.id')))
	transfer_type = Column(String) # Enum based on Metrc API endpoint: db_constants.TransferType.
	delivery_row_id = cast(GUID, Column(GUID, ForeignKey('metrc_deliveries.id')))
	delivery_type = Column(String) # Custom enum: 'INCOMING_INTERNAL', 'INCOMING_FROM_VENDOR', 'INCOMING_UNKNOWN', 'OUTGOING_INTERNAL', 'OUTGOING_TO_VENDOR', 'OUTGOING_UNKNOWN', 'UNKNOWN'.

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

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
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

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

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

class MetrcSalesTransaction(Base):
	__tablename__ = 'metrc_sales_transactions'

	id = Column(GUID, default=GUID_DEFAULT, primary_key=True)
	type = Column(Text)
	license_number = Column(String, nullable=False)
	us_state = Column(String, nullable=False)
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
	is_deleted = Column(Boolean)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

## End Metrc

class Artifact(Base):
	__abstract__ = True

	funded_at = Column(DateTime)

	def max_loan_amount(self) -> Optional[decimal.Decimal]:
		raise NotImplementedError("max_loan_amount is not implemented on this artifact")

PurchaseOrderHistoryDict = TypedDict('PurchaseOrderHistoryDict', {
	'id': str,
	'date_time': str,
	'action': str,
	'action_notes': str,
	'new_purchase_order_status': str,
	'created_by_user_id': str,
	'created_by_user_full_name': str,
})

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
	net_terms = Column(Integer)
	amount = Column(Numeric)
	amount_funded = Column(Numeric)
	status = Column(String)
	new_purchase_order_status = Column(String)
	requested_at = Column(DateTime)
	approved_at = Column(DateTime)
	approved_by_user_id =  cast(GUID, Column(GUID, ForeignKey('users.id')))
	rejected_at = Column(DateTime)
	rejected_by_user_id =  cast(GUID, Column(GUID, ForeignKey('users.id')))
	incompleted_at = Column(DateTime)
	rejection_note = Column(Text)
	bank_rejection_note = Column(Text)
	bank_incomplete_note = Column(Text)
	funded_at = Column(DateTime)
	is_cannabis = Column(Boolean)
	is_deleted = Column(Boolean)
	is_metrc_based = Column(Boolean)
	customer_note = Column(Text)
	bank_note = Column(Text)
	closed_at = Column(DateTime)
	all_bank_notes = Column(MutableDict.as_mutable(JSON)) # type: ignore
	all_customer_notes = Column(MutableDict.as_mutable(JSON)) # type: ignore
	history = cast(List[PurchaseOrderHistoryDict], Column(MutableList.as_mutable(JSON), nullable=True)) # type: ignore
	#history = Column(MutableList.as_mutable(JSONB), nullable=True) # type: ignore

	vendor = relationship(
		'Company',
		foreign_keys=[vendor_id]
	)

	company = relationship(
		'Company',
		foreign_keys=[company_id]
	)

	
	approved_by_user = relationship(
		'User',
		foreign_keys=[approved_by_user_id]
	)

	rejected_by_user = relationship(
		'User',
		foreign_keys=[rejected_by_user_id]
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

	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	# Identifier of payment, unique under scope (company_id, type, settlement_identifier).
	# Essentially denotes the 1st, 2nd, etc advance of a company
	# and the 1st, 2nd, etc repayment of a company.
	settlement_identifier = Column(String)

	type = Column(String)
	method = Column(String)
	requested_amount = Column(Numeric)
	amount = Column(Numeric)
	requested_payment_date = Column(Date) # The date the requestor requests payment to be initiated.
	payment_date = Column(Date) # The date the payment was actually initiated.
	deposit_date = Column(Date) # The date the payment arrived to the destination.
	# The date the payment clears.
	# For advances, deposit date and settlement date are always the same.
	# For repayments, settlement date is the deposit date plus clearance days.
	# Note for repayments, account fees are paid off as of the deposit date.
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

AugmentedTransactionInfo = TypedDict('AugmentedTransactionInfo', {
	'crosses_over_month': bool,
	'days_into_month': int
})

# Transaction with some additional pieces of information
AugmentedTransactionDict = TypedDict('AugmentedTransactionDict', {
	'transaction': TransactionDict,
	'payment': PaymentDict, # The payment which was used to create this transaction
	'tx_info': AugmentedTransactionInfo,
})

class Transaction(Base):
	__tablename__ = 'transactions'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	type = Column(Text, nullable=False)
	subtype = Column(Text)
	amount = Column(Numeric, nullable=False)
	loan_id = Column(GUID)
	payment_id = Column(GUID, nullable=False)
	to_principal = Column(Numeric, nullable=False)
	to_interest = Column(Numeric, nullable=False)
	to_fees = Column(Numeric, nullable=False) # A better name for this columns would be to_late_fees.
	# There is an implicit to_account_fees, which equals: amount - (to_principal + to_interest + to_fees).
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

	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	identifier = Column(String)
	disbursement_identifier = Column(String)

	loan_type = Column(Text)
	artifact_id = Column(GUID)
	requested_payment_date = Column(Date)
	origination_date = Column(Date) # The date the loan is officially funded and interest begins to accrue; this is equal to the settlement date of the associated advance.
	maturity_date = Column(Date) # The date the loan would be due based on the origination date, if there were no holidays and weekends.
	adjusted_maturity_date = Column(Date) # The date the loan is officially due based on the origination date, which includes holidays and weekends.
	amount = Column(Numeric, nullable=False)
	status = Column(String)
	payment_status = Column(String)
	notes = Column(String)
	customer_notes = Column(String)

	requested_at = Column(DateTime)
	requested_by_user_id = Column(GUID)
	closed_at = Column(DateTime)

	rejected_at = Column(DateTime)
	rejected_by_user_id = Column(GUID)
	rejection_note = Column(Text)

	approved_at = Column(DateTime)
	approved_by_user_id = Column(GUID)

	funded_at = Column(DateTime) # The datetime when an advance for this loan was created, may not be the same as the origination date.
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
	"""
	Records loan information shown in reports for bank users.
	One-to-one relationship with loans.
	"""

	__tablename__ = 'loan_reports'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	repayment_date = Column(Date) # Deposit date of most recent repayment on the associated loan.
	total_principal_paid = Column(Numeric)
	total_interest_paid = Column(Numeric)
	total_fees_paid = Column(Numeric)
	financing_period = Column(Integer) # Number of days any interest was accrued for the associated loan.
	financing_day_limit = Column(Integer)
	debt_facility_status = Column(Text)
	debt_facility_id = cast(GUID, Column(GUID, ForeignKey('debt_facilities.id')))
	debt_facility_added_date = Column(Date)
	debt_facility_waiver_date = Column(Date)
	debt_facility_waiver_expiration_date = Column(Date)

class BankFinancialSummary(Base):
	__tablename__ = 'bank_financial_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	date = Column(Date, nullable=False)
	product_type = Column(Text, nullable=False)
	total_limit = Column(Numeric, nullable=False)
	total_outstanding_principal = Column(Numeric, nullable=False)
	total_outstanding_principal_for_interest = Column(Numeric, nullable=False)
	total_outstanding_principal_past_due = Column(Numeric, nullable=False)
	total_outstanding_interest = Column(Numeric, nullable=False)
	total_outstanding_fees = Column(Numeric, nullable=False)
	total_principal_in_requested_state = Column(Numeric, nullable=False)
	available_limit = Column(Numeric, nullable=False)
	adjusted_total_limit = Column(Numeric, nullable=False)
	interest_accrued_today = Column(Numeric, nullable=False)
	late_fees_accrued_today = Column(Numeric, nullable=False)

ProratedFeeInfoDict = TypedDict('ProratedFeeInfoDict', {
	'numerator': int,
	'denom': int,
	'fraction': float,
	'day_to_pay': str # Day to pay in our standard MM/DD/YYYY format
})

MinimumInterestInfoDict = TypedDict('MinimumInterestInfoDict', {
	'amount_accrued': float, # how much has accrued in fees for the time period
	'minimum_amount': float, # the minimum you must pay in a time period
	'amount_short': float, # how much you owe for a time period because of the minimum_due
	'duration': str, # Over what duration is this fee owed
	'prorated_info': ProratedFeeInfoDict
})

class FinancialSummary(Base):
	__tablename__ = 'financial_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	date = Column(Date)

	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	total_outstanding_principal = Column(Numeric, nullable=False)
	total_outstanding_principal_for_interest = Column(Numeric)
	total_outstanding_principal_past_due = Column(Numeric)
	total_outstanding_interest = Column(Numeric, nullable=False)
	total_outstanding_fees = Column(Numeric, nullable=False)
	total_principal_in_requested_state = Column(Numeric, nullable=False)
	total_amount_to_pay_interest_on = Column(Numeric)
	total_interest_paid_adjustment_today = Column(Numeric)
	total_fees_paid_adjustment_today = Column(Numeric)

	total_limit = Column(Numeric, nullable=False) # Max credit limit defined in contract.
	adjusted_total_limit = Column(Numeric, nullable=False) # Final credit limit (may be less than credit limit defined in contract).
	available_limit = Column(Numeric, nullable=False) # Available credit limit, depends on final credit limit and how much principal is outstanding.

	minimum_monthly_payload = Column(JSON, nullable=False) # Note: better name is minimum_interest_payload.
	account_level_balance_payload = Column(JSON, nullable=False)
	day_volume_threshold_met = Column(Date)
	interest_accrued_today = Column(Numeric, nullable=False)
	late_fees_accrued_today = Column(Numeric, nullable=False)

	product_type = Column(Text)
	daily_interest_rate = Column(Numeric)

	minimum_interest_duration = Column(Text)
	minimum_interest_amount = Column(Numeric)
	minimum_interest_remaining = Column(Numeric)

	needs_recompute = Column(Boolean)
	days_to_compute_back = Column(Integer)

	most_overdue_loan_days = Column(Integer) # used in Client Surveillance dashboard, the highest number of late days determines the bank status

	loans_info = Column(JSON, nullable=True) # snapshot of customer's open loans on a given day

	# If the interest end date, tax writeoff date, late fees end date,
	# or LoC default interest date are set, then we track the altered
	# values in these sets of fields. If they're not set, then the 
	# values should be the same as the regular fields
	accounting_total_outstanding_principal = Column(Numeric, nullable=True)
	accounting_total_outstanding_interest = Column(Numeric, nullable=True)
	accounting_total_outstanding_late_fees = Column(Numeric, nullable=True)
	accounting_interest_accrued_today = Column(Numeric, nullable=True)
	accounting_late_fees_accrued_today = Column(Numeric, nullable=True)

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
	'amount_custom': float,
	'amount_custom_note': str,
	'status': str,
	'requested_at': datetime.datetime,
	'approved_at': datetime.datetime,
	'rejected_at': datetime.datetime,
	'rejection_note': str,
})

class EbbaApplication(Base):
	"""
	Record of information for either of:
	1. Monthly borrowing base certification
	2. Monthly financial report certification
	"""
	__tablename__ = 'ebba_applications'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	# TODO (warren): change category to be non-nullable.
	category = Column(Text)

	status = Column(String, nullable=False)
	application_date = Column(Date)
	is_deleted = Column(Boolean, nullable=False, default=False)
	submitted_by_user_id = Column(GUID)
	approved_by_user_id = Column(GUID)
	rejected_by_user_id = Column(GUID)

	monthly_accounts_receivable = Column(Numeric) # Component of borrowing base.
	monthly_inventory = Column(Numeric) # Component of borrowing base.
	monthly_cash = Column(Numeric) # Component of borrowing base.
	amount_cash_in_daca = Column(Numeric) # Component of borrowing base.
	amount_custom = Column(Numeric) # Component of borrowing base: custom amount only bank user can change.
	amount_custom_note = Column(Text)
	bank_note = Column(Text)

	calculated_borrowing_base = Column(Numeric)
	rejection_note = Column(Text)
	expires_date = Column(Date)

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
			amount_custom=float(self.amount_custom) if self.amount_custom is not None else None,
			amount_custom_note=self.amount_custom_note,
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

	bank_name = Column(String, nullable=False) # Bank name
	account_title = Column(String) # Account name
	account_type = Column(String, nullable=False) # Account type
	account_number = Column(String, nullable=False)

	# This file can be either bank instructions (more common) or a cancelled check (less common)
	bank_instructions_file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), nullable=True))

	# ACH related fields below.
	can_ach = Column(Boolean)
	routing_number = Column(String, nullable=True) # ACH routing number
	ach_default_memo = Column(String) # ACH default memo
	# no longer being used, but waiting to be removed
	torrey_pines_template_name = Column(Text) # ACH template name

	# Wire related fields below.
	can_wire = Column(Boolean)
	is_wire_intermediary = Column(Boolean)
	is_bank_international = Column(Boolean)
	intermediary_bank_name = Column(String) # Only used if wire is done via intermediary bank.
	intermediary_bank_address = Column(String) # Only used if wire is done via intermediary bank.
	intermediary_account_name = Column(String) # Only used if wire is done via intermediary bank.
	intermediary_account_number = Column(String) # Only used if wire is done via intermediary bank.
	wire_routing_number = Column(String) # Wire routing number
	recipient_address = Column(Text)
	recipient_address_2 = Column(Text)
	recipient_name = Column(Text)
	wire_default_memo = Column(String) # Wire default memo
	# no longer being used, but waiting to be removed
	wire_template_name = Column(String) # Wire template name
	bank_address = Column(String) # Deprecated: consider dropping this column in the future.
	us_state = Column(Text)

	is_cannabis_compliant = Column(Boolean, default=False)
	verified_date = Column(Date)
	verified_at = Column(DateTime)

	# This is used to perform the soft delete.
	is_deleted = Column(Boolean, default=False)

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

SyncPipelineDict = TypedDict('SyncPipelineDict', {
	'id': str,
	'name': str,
	'status': str,
	'internal_state': Dict,
	'params': Dict
})

class SyncPipeline(Base):
	__tablename__ = 'sync_pipelines'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String)
	status = Column(String)
	internal_state = Column(JSON)
	params = Column(JSON)
	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)

	def as_dict(self) -> SyncPipelineDict:
		return SyncPipelineDict(
			id=str(self.id),
			name=self.name,
			status=self.status,
			internal_state=cast(Dict, self.internal_state),
			params=cast(Dict, self.params)
		)

class MonthlySummaryCalculation(Base):
	__tablename__ = "monthly_summary_calculations"

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))
	report_month = Column(Date)
	minimum_payment = Column(Numeric)

class CompanyPartnershipInvitation(Base):
	__tablename__ = 'company_partnership_invitations'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	email = Column(String(120), nullable=False)

	requesting_company_id = cast(GUID, Column(GUID, ForeignKey('companies.id')))

	submitted_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))

	requested_at = Column(DateTime)
	closed_at = Column(DateTime, nullable=True)

	metadata_info = Column(JSON)

	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)


BlazePreapprovalJsonDict = TypedDict('BlazePreapprovalJsonDict', {
	'id': str,
	'external_blaze_company_id': str,
	'external_blaze_shop_id': str,
	'max_credit_limit': float,
	'annual_interest_rate': float,
	'expiration_date': str,
})


class BlazePreapproval(Base):
	__tablename__ = 'blaze_preapprovals'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	external_blaze_company_id = Column(Text, nullable=False) # Blaze company == Bespoke parent company.
	external_blaze_shop_id = Column(Text, nullable=False) # Blaze shop == Bespoke company.
	max_credit_limit = Column(Numeric, nullable=False)
	annual_interest_rate = Column(Numeric, nullable=False)
	expiration_date = Column(Date, nullable=False)

	def as_json_dict(self) -> BlazePreapprovalJsonDict:
		return BlazePreapprovalJsonDict(
			id=str(self.id),
			external_blaze_company_id=self.external_blaze_company_id,
			external_blaze_shop_id=self.external_blaze_shop_id,
			max_credit_limit=float(self.max_credit_limit),
			annual_interest_rate=float(self.annual_interest_rate),
			expiration_date=date_util.date_to_db_str(self.expiration_date),
		)


class BlazeShopEntry(Base):
	"""
	# Mapping entry between Blaze shop and associated Bespoke company.
	"""
	__tablename__ = 'blaze_shop_entries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	external_blaze_shop_id = Column(Text, nullable=False) # Blaze shop == Bespoke company.
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))


class BlazeUser(Base):
	"""
	Mapping entry between Blaze user and associated Bespoke user.
	"""
	__tablename__ = 'blaze_users'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

	external_blaze_user_id = Column(Text, nullable=False) # Blaze shop == Bespoke company.
	user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=False))

class AsyncJob(Base):

	__tablename__ = "async_jobs"

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String) # enum: AsyncJobNameEnum

	queued_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	initialized_at = Column(DateTime, nullable=True)
	started_at = Column(DateTime, nullable=False)
	ended_at = Column(DateTime, nullable=False)
	is_deleted = Column(Boolean, nullable=False)
	submitted_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))
	status = Column(String) # enum: AsyncJobStatusEnum
	is_high_priority = Column(Boolean, default=False)
	job_payload = Column(JSON, nullable=True) 

	retry_payload = Column(JSON, nullable=True) 
	err_details = Column(JSON, nullable=True)
	num_retries = Column(Integer, nullable=False, default=0)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)

class AsyncJobSummary(Base):
	__tablename__ = 'async_job_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	date = Column(Date)
	name = Column(String)

	metadata_info = Column(JSON)
	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime)

class VendorChangeRequests(Base):

	__tablename__ = "vendor_change_requests"

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	requesting_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=False))
	requested_vendor_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	approved_at = Column(DateTime, nullable=True)
	approved_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))
	reviewed_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))
	requesting_company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))

	category = Column(String, nullable=False) # enum: VendorChangeRequestsCategoryEnum
	status = Column(String, nullable=False) # enum: VendorChangeRequestsStatusEnum
	request_info = Column(JSON, nullable=False) 
	is_deleted = Column(Boolean, nullable=True)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)


class BespokeCatalogBrand(Base):
	__tablename__ = 'bespoke_catalog_brands'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	parent_company_id = cast(GUID, Column(GUID, ForeignKey('parent_companies.id'), nullable=True))

	brand_name = Column(String, nullable=False)
	is_deleted = Column(Boolean, nullable=False, default=False)
	website_url = Column(String, nullable=True)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)

class BespokeCatalogSkuGroup(Base):
	__tablename__ = 'bespoke_catalog_sku_groups'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	bespoke_catalog_brand_id = cast(GUID, Column(GUID, ForeignKey('bespoke_catalog_brands.id'), nullable=False))

	sku_group_name = Column(String, nullable=False)
	unit_quantity = Column(Numeric, nullable=True)
	unit_of_measure = Column(String, nullable=True)
	is_deleted = Column(Boolean, nullable=False, default=False)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)

class BespokeCatalogSku(Base):
	__tablename__ = 'bespoke_catalog_skus'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	bespoke_catalog_sku_group_id = cast(GUID, Column(GUID, ForeignKey('bespoke_catalog_sku_groups.id'), nullable=False))

	sku = Column(String, nullable=False)
	is_deleted = Column(Boolean, nullable=False, default=False)
	link = Column(String, nullable=True)
	picture = Column(String, nullable=True)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)


class MetrcToBespokeCatalogSku(Base):
	__tablename__ = 'metrc_to_bespoke_catalog_skus'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)

	bespoke_catalog_sku_id = cast(GUID, Column(GUID, ForeignKey('bespoke_catalog_skus.id'), nullable=True))
	last_edited_by_user_id = cast(GUID, Column(GUID, ForeignKey('users.id'), nullable=True))

	product_name = Column(String, nullable=False)
	product_category_name = Column(String, nullable=False)
	sku_confidence = Column(String, nullable=False)
	wholesale_quantity = Column(Integer, nullable=True)
	is_sample = Column(Boolean, nullable=False, default=False)
	is_deleted = Column(Boolean, nullable=False, default=False)

	created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
	deleted_at = Column(DateTime, nullable=True)


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
