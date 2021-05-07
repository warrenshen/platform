import datetime
import decimal
import logging
import os
import time
import uuid
from contextlib import contextmanager
from typing import (TYPE_CHECKING, Any, Callable, Dict, Iterator, List,
                    Optional, cast)

import sqlalchemy
from bespoke.date import date_util
from bespoke.db.db_constants import CompanyType
from fastapi_utils.guid_type import GUID, GUID_DEFAULT_SQLITE
from mypy_extensions import TypedDict
from sqlalchemy import (JSON, BigInteger, Boolean, Column, Date, DateTime,
                        Float, ForeignKey, Integer, Numeric, String, Text)
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

class User(Base):
	__tablename__ = 'users'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=True)
	email = Column(String(120), unique=True, nullable=False)
	password = Column(Text, nullable=False)
	role = Column(String(120))
	first_name = Column(Text, nullable=False)
	last_name = Column(Text, nullable=False)
	phone_number = Column(Text)


class Customer(Base):
	__tablename__ = 'customer'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	name = Column(String)
	phone = Column(String)
	email = Column(String)

CompanyDict = TypedDict('CompanyDict', {
	'id': str,
	'name': str
})

class Company(Base):
	"""
	"""
	__tablename__ = 'companies'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_settings_id = Column(GUID, nullable=False)
	contract_id = Column(GUID)

	company_type = Column(String, nullable=False, default=CompanyType.Customer)
	name = Column(String)
	identifier = Column(String)
	contract_name = Column(String)
	dba_name = Column(String)
	needs_balance_recomputed = Column(Boolean, nullable=False, default=False) # is_dirty

	# Last created identifier for a loan belonging to this company.
	latest_loan_identifier = Column(Integer, nullable=False, default=0)
	# Last created identifier for an advance payment belonging to this company.
	latest_disbursement_identifier = Column(Integer, nullable=False, default=0)
	# Last created identifier for a repayment payment belonging to this company.
	latest_repayment_identifier = Column(Integer, nullable=False, default=0)

	def as_dict(self) -> CompanyDict:
		return CompanyDict(
			id=str(self.id),
			name=self.name
		)

class CompanyAgreement(Base):
	__tablename__ = 'company_agreements'

	id = cast(GUID, Column(GUID, nullable=False, primary_key=True))
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), nullable=False))

class CompanyLicense(Base):
	__tablename__ = 'company_licenses'

	id = cast(GUID, Column(GUID, nullable=False, primary_key=True, default=GUID_DEFAULT, unique=True))
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=False))
	file_id = cast(GUID, Column(GUID, ForeignKey('files.id'), nullable=False))

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
	vendor_agreement_docusign_template = Column(Text)
	payor_agreement_docusign_template = Column(Text)
	has_autofinancing = Column(Boolean)
	two_factor_message_method = Column(Text)
	active_ebba_application_id = cast(GUID, Column(GUID, ForeignKey('ebba_applications.id')))

	def as_dict(self) -> CompanySettingsDict:
		return CompanySettingsDict(
			id=str(self.id),
			vendor_agreement_docusign_template=self.vendor_agreement_docusign_template,
			payor_agreement_docusign_template=self.payor_agreement_docusign_template,
			active_ebba_application_id=str(self.active_ebba_application_id),
		)

ContractDict = TypedDict('ContractDict', {
	'id': str,
	'product_type': str,
	'product_config': Dict,
	'start_date': datetime.date,
	'end_date': datetime.date,
	'adjusted_end_date': datetime.date
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
	modified_by_user_id = Column(GUID)
	terminated_at = Column(DateTime)
	terminated_by_user_id = Column(GUID)

	def as_dict(self) -> ContractDict:
		return ContractDict(
			id=str(self.id),
			product_type=self.product_type,
			product_config=cast(Dict, self.product_config),
			start_date=self.start_date,
			end_date=self.end_date,
			adjusted_end_date=self.adjusted_end_date
		)


class CompanyVendorPartnership(Base):
	__tablename__ = 'company_vendor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	vendor_id = Column(GUID, nullable=False)
	vendor_bank_id = Column(GUID)
	approved_at = Column(DateTime)


class CompanyPayorPartnership(Base):
	__tablename__ = 'company_payor_partnerships'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)
	payor_id = Column(GUID, nullable=False)
	approved_at = Column(DateTime)


PurchaseOrderFileDict = TypedDict('PurchaseOrderFileDict', {
	'purchase_order_id': str,
	'file_id': str,
	'file_type': str,
})

class PurchaseOrderFile(Base):
	__tablename__ = 'purchase_order_files'

	purchase_order_id = Column(GUID, primary_key=True, nullable=False)
	file_id = Column(GUID, primary_key=True, nullable=False)
	file_type = Column(String)

	def as_dict(self) -> PurchaseOrderFileDict:
		return PurchaseOrderFileDict(
			purchase_order_id=str(self.purchase_order_id),
			file_id=str(self.file_id),
			file_type=self.file_type,
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
	status = Column(String)
	requested_at = Column(DateTime)
	approved_at = Column(DateTime)
	rejected_at = Column(DateTime)
	rejection_note = Column(Text)
	bank_rejection_note = Column(Text)
	funded_at = Column(DateTime)
	is_cannabis = Column(Boolean)
	is_deleted = Column(Boolean)

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
	items_covered = Column(JSON)
	company_bank_account_id = Column(GUID)
	customer_note = Column(Text)
	bank_note = Column(Text)

	requested_by_user_id = Column(GUID)
	submitted_at = Column(DateTime)
	submitted_by_user_id = Column(GUID)
	settled_at = Column(DateTime)
	settled_by_user_id = Column(GUID)
	originating_payment_id = Column(GUID)
	is_deleted = Column(Boolean)


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
	'effective_date': datetime.date
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
			effective_date=self.effective_date
		)


LoanDict = TypedDict('LoanDict', {
	'id': str,
	'company_id': str,
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
	'closed_at': datetime.datetime
})

class Loan(Base):
	__tablename__ = 'loans'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = Column(GUID, nullable=False)

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

	def as_dict(self) -> LoanDict:
		return LoanDict(
			id=str(self.id),
			company_id=str(self.company_id),
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
			closed_at=self.closed_at
		)


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

class FinancialSummary(Base):
	__tablename__ = 'financial_summaries'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	date = Column(Date)
	company_id = Column(GUID, nullable=False)
	total_limit = Column(Numeric, nullable=False)
	total_outstanding_principal = Column(Numeric, nullable=False)
	total_outstanding_principal_for_interest = Column(Numeric, nullable=False)
	total_outstanding_interest = Column(Numeric, nullable=False)
	total_outstanding_fees = Column(Numeric, nullable=False)
	total_principal_in_requested_state = Column(Numeric, nullable=False)
	available_limit = Column(Numeric, nullable=False)
	adjusted_total_limit = Column(Numeric, nullable=False)
	minimum_monthly_payload = Column(JSON, nullable=False)
	account_level_balance_payload = Column(JSON, nullable=False)
	day_volume_threshold_met = Column(Date)
	interest_accrued_today = Column(Numeric, nullable=False)

### End of financial tables

class RevokedTokenModel(Base):
	__tablename__ = 'revoked_tokens'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	user_id = Column(GUID, nullable=False)
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
	status = Column(String, nullable=False)
	application_date = Column(Date)
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
	is_deleted = Column(Boolean, nullable=False, default=False)

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
	total_amount = Column(Numeric)
	taxes_amount = Column(Numeric)
	invoice_date = Column(Date)
	invoice_due_date = Column(Date)
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


def get_db_url() -> str:
	return os.environ.get('DATABASE_URL')


def create_engine() -> Engine:
	return sqlalchemy.create_engine(
		get_db_url(),
		connect_args={'connect_timeout': 100,
					  "options": "-c statement_timeout=3000"},
		pool_pre_ping=True,  # to prevent disconnect errors from causing runtime errors
		pool_recycle=3600,  # dont let connections last for longer than 1 hr
		# we want old connections to be recycled and thrown out, so only use the most recent connections
		pool_use_lifo=True,
		pool_size=3,  # Only allow 3 connections at most at once
		# We dont want to keep connections in memory, currently we only have about 100 max connections
		poolclass=QueuePool
	)


class BankAccount(Base):
	__tablename__ = 'bank_accounts'

	id = Column(GUID, primary_key=True, default=GUID_DEFAULT, unique=True)
	company_id = cast(GUID, Column(GUID, ForeignKey('companies.id'), nullable=True))

	bank_name = Column(String, nullable=False)
	account_type = Column(String, nullable=False)
	account_number = Column(String, nullable=False)
	routing_number = Column(String, nullable=False)
	can_ach = Column(Boolean, nullable=True)
	can_wire = Column(Boolean, nullable=True)
	recipient_name = Column(String)
	recipient_address = Column(String)
	bank_address = Column(String)
	account_title = Column(String)
	verified_date = Column(Date)
	is_cannabis_compliant = Column(Boolean, default=False)
	verified_at = Column(DateTime)


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
