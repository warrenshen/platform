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
	BESPOKE_CATALOG_DATA_ENTRY = 'bespoke_catalog_data_entry'
	VENDOR_ADMIN = 'vendor_admin'

class BespokeCompanyRole(object):
  CLIENT_SUCCESS = "client_success",
  BUSINESS_DEVELOPMENT = "business_development",
  UNDERWRITER = "underwriter",

class CustomerRoles(object):
	FINANCIALS = 'financials'
	PURCHASE_ORDER_EDITS = 'purchase_order_edits'
	REPAYMENTS = 'repayments'
	EXECUTIVE = 'executive'
	SALES_REP = 'sales_rep'
	OTHER = 'other'

ALL_USER_BASE_ROLES = [
	UserRoles.BANK_ADMIN,
	UserRoles.BANK_READ_ONLY,
	UserRoles.COMPANY_ADMIN,
	UserRoles.COMPANY_READ_ONLY,
	UserRoles.COMPANY_CONTACT_ONLY,
	UserRoles.PURCHASE_ORDER_REVIEWER,
	UserRoles.INVOICE_REVIEWER,
	UserRoles.VENDOR_ADMIN,
]

BANK_USER_BASE_ROLES = [
	UserRoles.BANK_ADMIN,
	UserRoles.BANK_READ_ONLY,
]

CUSTOMER_USER_BASE_ROLES = [
	UserRoles.COMPANY_ADMIN,
	UserRoles.COMPANY_READ_ONLY,
]

VENDOR_USER_BASE_ROLES = [
	UserRoles.VENDOR_ADMIN
]

class PlatformModeEnum(object):
	BANK = 'bank'
	CUSTOMER = 'customer'
	VENDOR = 'vendor'
	ANONYMOUS = 'anonymous'

class InheritedRoles(object):
	BESPOKE_CATALOG_DATA_ENTRY_INHERITED = 'bespoke_catalog_data_entry_inherited'
	COMPANY_ADMIN_VENDOR_ADMIN_INHERITED = 'company_admin_vendor_admin_inherited'

INHERITED_ROLES_TO_BASE_ROLES = {
	InheritedRoles.BESPOKE_CATALOG_DATA_ENTRY_INHERITED: [
		UserRoles.BESPOKE_CATALOG_DATA_ENTRY
	],
	InheritedRoles.COMPANY_ADMIN_VENDOR_ADMIN_INHERITED: [
		UserRoles.COMPANY_ADMIN,
		UserRoles.VENDOR_ADMIN,
	],
}

ALL_INHERITED_ROLES = [
	InheritedRoles.BESPOKE_CATALOG_DATA_ENTRY_INHERITED,
	InheritedRoles.COMPANY_ADMIN_VENDOR_ADMIN_INHERITED,
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
	REPORTING_REQUIREMENTS_CATEGORY = 'reporting_requirements_category'
	OVERRIDE_REPAYMENT_AUTOGENERATION = 'override_repayment_autogeneration'

ALL_FEATURE_FLAGS = [
	FeatureFlagEnum.CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS,
	FeatureFlagEnum.REPORTING_REQUIREMENTS_CATEGORY,
	FeatureFlagEnum.OVERRIDE_REPAYMENT_AUTOGENERATION,
]

class CustomMessageEnum(object):
	OVERVIEW_PAGE = 'overview_page'

ALL_CUSTOM_MESSAGES = [
	CustomMessageEnum.OVERVIEW_PAGE,
]

class CompanyDebtFacilityStatus(object):
	ELIGIBLE = 'eligible'
	INELIGIBLE = 'ineligible'
	WAIVER = 'waiver_company'
	PENDING_WAIVER = 'pending_waiver'
	
class OldCompanyDebtFacilityStatus(object):
	GOOD_STANDING = 'good_standing'
	ON_PROBATION = 'on_probation'
	OUT_OF_COMPLIANCE = 'out_of_compliance' # aka: on pause
	DEFAULTING = 'defaulting'
	# must be default state for dispensary financing clients
	INELIGIBLE_FOR_FACILITY = 'ineligible_for_facility'
	WAIVER = 'waiver_company'

class NewPurchaseOrderStatus(object):
	# Not Ready
	DRAFT = "draft"
	PENDING_APPROVAL_BY_VENDOR = "pending_approval_by_vendor"
	CHANGES_REQUESTED_BY_VENDOR = "changes_requested_by_vendor"
	CHANGES_REQUESTED_BY_BESPOKE = "changes_requested_by_bespoke"
	# Ready
	READY_TO_REQUEST_FINANCING = "ready_to_request_financing"
	FINANCING_PENDING_APPROVAL = "financing_pending_approval"
	FINANCING_REQUEST_APPROVED = "financing_request_approved"
	# Closed
	ARCHIVED = "archived"
	REJECTED_BY_VENDOR = "rejected_by_vendor"
	REJECTED_BY_BESPOKE = "rejected_by_bespoke"

class PurchaseOrderBankNoteEnum(object):
	REQUESTS_CHANGES = "requests_changes"
	BANK_REJECTION = "bank_rejection"

class PurchaseOrderCustomerNoteEnum(object):
	VENDOR_REQUESTS_CHANGES = "vendor_requests_changes"
	VENDOR_REJECTION = "vendor_rejection"

class CompanySurveillanceStatus(object):
	GOOD_STANDING = "good_standing"
	ON_PROBATION = "on_probation"
	ON_PAUSE = "on_pause"
	DEFAULTED = "defaulted"
	ONBOARDING = "onboarding"
	INACTIVE = "inactive"
	IN_REVIEW = "in_review"

class AutomatedSurveillanceMessage(object):
	IN_REVIEW = "This company has been set to In Review by the automated system."

# Artifacts

class RequestStatusEnum(object):
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	INCOMPLETE = 'incomplete'
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
	FUNDED = 'funded'
	CLOSED = 'closed'
	CLOSING = 'closing'
	ARCHIVED = 'archived'

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
	WAIVER = 'waiver_loan'

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

class PaymentOption(object):
  IN_FULL = 'pay_in_full'
  MINIMUM_DUE = 'pay_minimum_due'
  CUSTOM_AMOUNT = 'custom_amount'
  UNKNOWN = 'unknown'

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
	CANNABIS = 'cannabis'
	PURCHASE_ORDER = 'purchase_order'

class InvoiceFileTypeEnum(object):
	Invoice = 'invoice'
	Cannabis = 'cannabis'

class DebtFacilityEventCategory(object):
	WAIVER = 'waiver'
	REPURCHASE = 'repurchase'
	MOVE_TO_DEBT_FACILITY = 'move_to_debt_facility'
	COMPANY_STATUS_CHANGE = 'company_status_change'
	PAST_DUE_UPDATE_REQUIRED = 'past_due_update_required'

class DebtFacilityCapacityTypeEnum(object):
	DRAWN = 'drawn'
	MAXIMUM = 'maximum'

# Hasura

class DBOperation(object):
	"""
		Enum for insert update, delete when Hasura / GraphQL notifies you of these events
	"""
	INSERT = 'INSERT'
	UPDATE = 'UPDATE'
	DELETE = 'DELETE'

# Metrc

class MetrcLicenseCategoryDownloadStatus(object):
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
	FINANCIAL_REPORT = 'financial_report'

class BankAccountType(object):
	CHECKING = 'Checking'
	SAVINGS = 'Savings'

class PartnershipRequestType(object):
   VENDOR_SUBMITTED = "vendor_submitted"
   MOVED_TO_ACTION = "move_to_action"

# Async Job
class AsyncJobStatusEnum(object):
	QUEUED = 'queued'
	INITIALIZED = 'initialized'
	IN_PROGRESS = 'in_progress'
	FAILED = 'failed'
	COMPLETED = 'completed'

AsyncJobStatusEnumToLabel = {
	AsyncJobStatusEnum.QUEUED: 'Queued',
	AsyncJobStatusEnum.INITIALIZED: 'Initialized',
	AsyncJobStatusEnum.IN_PROGRESS: 'In Progress',
	AsyncJobStatusEnum.FAILED: 'Failed',
	AsyncJobStatusEnum.COMPLETED: 'Completed',
}

class AsyncJobNameEnum(object):
	AUTOGENERATE_REPAYMENTS = "autogenerate_repayments"
	AUTOGENERATE_REPAYMENT_ALERTS = "autogenerate_repayment_alerts"
	AUTOMATIC_DEBIT_COURTESY_ALERTS = "automatic_debit_courtesy_alerts"
	DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE = "download_data_for_metrc_api_key_license"
	FINANCIAL_REPORTS_COMING_DUE_ALERTS="financial_reports_coming_due_alerts"
	LOC_MONTHLY_REPORT_SUMMARY = "loc_monthly_report_summary"
	LOANS_COMING_DUE = "loans_coming_due"
	LOANS_PAST_DUE = "loans_past_due"
	NON_LOC_MONTHLY_REPORT_SUMMARY = "non_loc_monthly_report_summary"
	PURCHASE_ORDERS_PAST_DUE = "purchase_orders_past_due"
	REFRESH_METRC_API_KEY_PERMISSIONS = "refresh_metrc_api_key_permissions"
	DAILY_COMPANY_BALANCES_RUN = "daily_company_balances_run"
	UPDATE_COMPANY_BALANCES = "update_company_balances"

AsyncJobNameEnumToLabel = {
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENTS: 'Autogenerate repayments',
	AsyncJobNameEnum.AUTOGENERATE_REPAYMENT_ALERTS: 'Autogenerate repayment alerts',
	AsyncJobNameEnum.AUTOMATIC_DEBIT_COURTESY_ALERTS: 'Automatic debit courtesy alerts',
	AsyncJobNameEnum.DOWNLOAD_DATA_FOR_METRC_API_KEY_LICENSE: 'Download data for Metrc API key license',
	AsyncJobNameEnum.FINANCIAL_REPORTS_COMING_DUE_ALERTS: 'Financial reports coming due alerts',
	AsyncJobNameEnum.LOANS_COMING_DUE: 'Loans coming due',
	AsyncJobNameEnum.LOANS_PAST_DUE: 'Loans past due',
	AsyncJobNameEnum.LOC_MONTHLY_REPORT_SUMMARY: 'LOC monthly report summary',
	AsyncJobNameEnum.NON_LOC_MONTHLY_REPORT_SUMMARY: 'Non-LOC monthly report summary',
	AsyncJobNameEnum.PURCHASE_ORDERS_PAST_DUE: 'Purchase orders past due',
	AsyncJobNameEnum.REFRESH_METRC_API_KEY_PERMISSIONS: 'Refresh Metrc API key permissions',
	AsyncJobNameEnum.DAILY_COMPANY_BALANCES_RUN: 'Daily Company Balances Run',
	AsyncJobNameEnum.UPDATE_COMPANY_BALANCES: 'Update company balances',
}

# Vendor Change Requests
class VendorChangeRequestsStatusEnum(object):
	APPROVAL_REQUESTED = "approval_requested"
	IN_REVIEW = "in_review"
	APPROVED = "approved"
	REJECTED = "rejected"

class VendorChangeRequestsCategoryEnum(object):
	PARTNERSHIP_CONTACT_CHANGE = "partnership_contact_change"
	CONTACT_INFO_CHANGE = "contact_info_change"

class PurchaseOrderActions(object):
	DRAFT = 'draft'
	SUBMIT = 'submit'

class CompanyFacilityUnderwritingMode(object):
	"""
	Enum for company facility underwriting mode
	"""
	APPLICANT_ACTIVE = 'applicant_active' # Applicant is active, requires frequent underwriting
	APPLICANT_INACTIVE = 'applicant_inactive' # Applicant is inactive, requires infrequent underwriting
	BORROWER_ACTIVE = 'borrower_active' # Borrower is active, requires most frequent underwriting
	BORROWER_INACTIVE = 'borrower_inactive' # Borrower is inactive, requires less frequent underwriting
