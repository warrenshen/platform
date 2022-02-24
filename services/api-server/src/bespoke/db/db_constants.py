"""
Constants for things that can get stored in the DB
"""
from typing import List

# Auth

class UserRoles(object):
	BANK_ADMIN = 'bank_admin'
	BANK_READ_ONLY = 'bank_read_only'
	COMPANY_ADMIN = 'company_admin'
	COMPANY_READ_ONLY = 'company_read_only'
	COMPANY_CONTACT_ONLY = 'company_contact_only'
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'
	INVOICE_REVIEWER = 'invoice_reviewer'

ALL_USER_ROLES = [
	UserRoles.BANK_ADMIN,
	UserRoles.BANK_READ_ONLY,
	UserRoles.COMPANY_ADMIN,
	UserRoles.COMPANY_READ_ONLY,
	UserRoles.COMPANY_CONTACT_ONLY,
	UserRoles.PURCHASE_ORDER_REVIEWER,
	UserRoles.INVOICE_REVIEWER,
]

_ALL_BANK_READER_ROLES = [
	UserRoles.BANK_ADMIN,
	UserRoles.BANK_READ_ONLY,
]

def is_bank_user(roles: List[str]) -> bool:
	for user_role in roles:
		if user_role in _ALL_BANK_READER_ROLES:
			return True

	return False


class FileTypeEnum(object):
	COMPANY_AGREEMENT = 'company_agreement'
	COMPANY_LICENSE = 'company_license'
	EBBA_APPLICATION = 'ebba_application'
	INVOICE = 'invoice'
	PURCHASE_ORDER = 'purchase_order'

class LoginMethod(object):
	SIMPLE = 'simple'
	TWO_FA = '2fa'

class TwoFactorLinkType(object):
	LOGIN = 'login'
	CONFIRM_PURCHASE_ORDER = 'confirm_purchase_order'
	CONFIRM_INVOICE = 'confirm_invoice'
	PAY_INVOICE = 'pay_invoice'
	FORGOT_PASSWORD = 'forgot_password'

REVIEWER_LINK_TYPE_TO_ROLE = {
	TwoFactorLinkType.CONFIRM_PURCHASE_ORDER: UserRoles.PURCHASE_ORDER_REVIEWER,
	TwoFactorLinkType.CONFIRM_INVOICE: UserRoles.INVOICE_REVIEWER,
	TwoFactorLinkType.PAY_INVOICE: UserRoles.INVOICE_REVIEWER,
}

class TwoFactorMessageMethod(object):
	EMAIL = 'email'
	PHONE = 'phone'

# Contracts

class ProductType(object):
	DISPENSARY_FINANCING = 'dispensary_financing'
	INVENTORY_FINANCING = 'inventory_financing'
	INVOICE_FINANCING = 'invoice_financing'
	LINE_OF_CREDIT = 'line_of_credit'
	PURCHASE_MONEY_FINANCING = 'purchase_money_financing'

PRODUCT_TYPES = [
	ProductType.DISPENSARY_FINANCING,
	ProductType.INVENTORY_FINANCING,
	ProductType.INVOICE_FINANCING,
	ProductType.LINE_OF_CREDIT,
	ProductType.PURCHASE_MONEY_FINANCING,
]

# Companies

class CompanyType(object):
	Customer = 'customer'
	Vendor = 'vendor'
	Payor = 'payor'

COMPANY_TYPES = (
	CompanyType.Customer,
	CompanyType.Vendor,
	CompanyType.Payor
)

class FeatureFlagEnum(object):
	CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS = 'create_purchase_order_from_metrc_transfers'

ALL_FEATURE_FLAGS = [
	FeatureFlagEnum.CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS,
]

class CustomMessageEnum(object):
	OVERVIEW_PAGE = 'overview_page'

ALL_CUSTOM_MESSAGES = [
	CustomMessageEnum.OVERVIEW_PAGE,
]

class CompanyDebtFacilityStatus(object):
	GOOD_STANDING = 'good_standing'
	ON_PROBATION = 'on_probation'
	OUT_OF_COMPLIANCE = 'out_of_compliance'
	DEFAULTING = 'defaulting'
	# must be default state for dispensary financing clients
	INELIGIBLE_FOR_FACILITY = 'ineligible_for_facility'
	WAIVER = 'waiver'

# Artifacts

class RequestStatusEnum(object):
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	DRAFTED = 'drafted'
	REJECTED = 'rejected'

# Loans

class PaymentStatusEnum(object):
	NONE = 'none' # No payments on loan, not used yet.
	PENDING = 'pending' # Pending payment(s) on loan exist.
	PARTIALLY_PAID = 'partially_paid' # No pending payments on loan, loan partially paid.
	SCHEDULED = 'scheduled' # Deprecated, to be removed.
	CLOSED = 'closed' # Loan is fully paid off.
	CLOSING = 'closing' # Loan is paid off, but some settlement days may be remaining

class LoanStatusEnum(object):
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	CLOSED = 'closed'
	DRAFTED = 'drafted'
	REJECTED = 'rejected'

class LoanTypeEnum(object):
	LINE_OF_CREDIT = 'line_of_credit'
	INVENTORY = 'purchase_order'
	INVOICE = 'invoice'

ALL_LOAN_TYPES = [
	LoanTypeEnum.LINE_OF_CREDIT,
	LoanTypeEnum.INVENTORY,
	LoanTypeEnum.INVOICE,
]

PRODUCT_TYPE_TO_LOAN_TYPE = {
	ProductType.INVENTORY_FINANCING: LoanTypeEnum.INVENTORY,
	ProductType.LINE_OF_CREDIT: LoanTypeEnum.LINE_OF_CREDIT,
	ProductType.INVOICE_FINANCING: LoanTypeEnum.INVOICE,
	ProductType.PURCHASE_MONEY_FINANCING: LoanTypeEnum.INVENTORY,
	ProductType.DISPENSARY_FINANCING: LoanTypeEnum.INVENTORY,
}

# Loan Reports

class LoanDebtFacilityStatus(object):
	SOLD_INTO_DEBT_FACILITY = 'sold_into_debt_facility'
	BESPOKE_BALANCE_SHEET = 'bespoke_balance_sheet'
	REPURCHASED = 'repurchased'
	# for when a loan is in the debt facility but beyond their 30 days late grace period
	UPDATE_REQUIRED = 'update_required'
	# for when a loan is past the 30 day grace period but a waiver has been granted for a specific loan
	# can have waiver for a specific loan even if borrower is overall ineligible
	WAIVER = 'waiver'

# Fees

class MinimumAmountDuration(object):
	MONTHLY = 'monthly'
	QUARTERLY = 'quarterly'
	ANNUALLY = 'annually'

# Financial Summaries

class FinancialSummaryPayloadField(object):
	FEES_TOTAL = 'fees_total'
	CREDITS_TOTAL = 'credits_total'

# Payments

class PaymentMethodEnum(object):
	REVERSE_DRAFT_ACH = 'reverse_draft_ach'
	ACH = 'ach'
	WIRE = 'wire'
	CHECK = 'check'
	CASH = 'cash'
	UNKNOWN = 'unknown'

ALL_PAYMENT_METHODS = (
	PaymentMethodEnum.REVERSE_DRAFT_ACH,
	PaymentMethodEnum.ACH,
	PaymentMethodEnum.WIRE,
	PaymentMethodEnum.CHECK,
	PaymentMethodEnum.CASH
)

class PaymentType(object):
	ADJUSTMENT = 'adjustment' # A manual adjustment to balance the books, or correct for rounding issues
	ADVANCE = 'advance'
	CREDIT_TO_USER = 'credit_to_user' # Bespoke giving $ credit to a user
	FEE = 'fee' # Bespoke charging the user a fee
	FEE_WAIVER = 'fee_waiver' # Bespoke waiving account fee
	PAYOUT_USER_CREDIT_TO_CUSTOMER = 'payout_user_credit_to_customer'
	REPAYMENT = 'repayment' # Repayment of loan
	REPAYMENT_OF_ACCOUNT_FEE = 'repayment_account_fee' # Repayment of account fee
	USER_CREDIT_TO_ACCOUNT_FEE = 'user_credit_towards_account_fee' # User credit is applied to an account-level fee

class TransactionSubType(object):
	CUSTOM_FEE = 'custom_fee'
	MINIMUM_INTEREST_FEE = 'minimum_interest_fee'
	WIRE_FEE = 'wire_fee'

# There might be many types that represent a fee, credit to user, etc
CREDIT_TO_USER_TYPES = set([PaymentType.CREDIT_TO_USER])
FEE_TYPES = set([PaymentType.FEE])

# There might be many types that represent an advance, repayment, etc
ADVANCE_TYPES = set([PaymentType.ADVANCE])
REPAYMENT_TYPES = set([PaymentType.REPAYMENT])
ADJUSTMENT_TYPES = set([PaymentType.ADJUSTMENT])

class PurchaseOrderFileTypeEnum(object):
	Cannabis = 'cannabis'
	PurchaseOrder = 'purchase_order'

class InvoiceFileTypeEnum(object):
	Invoice = 'invoice'
	Cannabis = 'cannabis'

class DebtFacilityEventCategory(object):
	WAIVER = 'waiver'
	REPURCHASE = 'repurchase'

# Hasura

class DBOperation(object):
	"""
		Enum for insert update, delete when Hasura / GraphQL notifies you of these events
	"""
	INSERT = 'INSERT'
	UPDATE = 'UPDATE'
	DELETE = 'DELETE'

# Metrc

class MetrcDownloadStatus(object):
	NO_ACCESS = 'no_access'
	METRC_SERVER_ERROR = 'metrc_server_error'
	BESPOKE_SERVER_ERROR = 'bespoke_server_error'
	SUCCESS = 'success'

class MetrcDownloadSummaryStatus(object):
	COMPLETED = 'completed'
	FAILURE = 'failure'
	NEEDS_RETRY = 'needs_retry'

class TransferType(object):
	INCOMING = 'INCOMING'
	OUTGOING = 'OUTGOING'
	REJECTED = 'REJECTED'
	INTERNAL = 'INTERNAL'
	UNKNOWN = 'UNKNOWN'

class DeliveryType(object):
	UNKNOWN = 'UNKNOWN'
	INTERNAL = 'INTERNAL'
	INCOMING_INTERNAL = 'INCOMING_INTERNAL'
	OUTGOING_INTERNAL = 'OUTGOING_INTERNAL'
	INCOMING_FROM_VENDOR = 'INCOMING_FROM_VENDOR'
	INCOMING_UNKNOWN = 'INCOMING_UNKNOWN'
	OUTGOING_TO_PAYOR = 'OUTGOING_TO_PAYOR'
	OUTGOING_UNKNOWN = 'OUTGOING_UNKNOWN'

class TransferPackageType(object):
	TRANSFER = 'transfer'

class PackageType(object):
	ACTIVE = 'active'
	INACTIVE = 'inactive'
	OUTGOING = 'outgoing'
	ONHOLD = 'onhold'
	SOLD = 'sold'

# Client Surveillance
class ClientSurveillanceCategoryEnum(object):
	BORROWING_BASE = 'borrowing_base'
	FINANCIAL_REPORTS = 'financial_reports'
