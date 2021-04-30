"""
Constants for things that can get stored in the DB
"""

# Auth

class UserRoles(object):
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'
	INVOICE_REVIEWER = 'invoice_reviewer'

ALL_BANK_READER_ROLES = ['bank_admin', 'bank_read_only']

class FileTypeEnum(object):
	COMPANY_AGREEMENT = 'company_agreement'
	COMPANY_LICENSE = 'company_license'
	EBBA_APPLICATION = 'ebba_application'
	INVOICE = 'invoice'
	PURCHASE_ORDER = 'purchase_order'

class TwoFactorLinkType(object):
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
	INVENTORY_FINANCING = 'inventory_financing'
	LINE_OF_CREDIT = 'line_of_credit'
	INVOICE_FINANCING = 'invoice_financing'
	PURCHASE_MONEY_FINANCING = 'purchase_money_financing'

PRODUCT_TYPES = [
	ProductType.INVENTORY_FINANCING,
	ProductType.LINE_OF_CREDIT,
	ProductType.INVOICE_FINANCING,
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

# Artifacts

class RequestStatusEnum(object):
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	DRAFTED = 'drafted'
	REJECTED = 'rejected'

# Loans

class PaymentStatusEnum(object):
	PARTIALLY_PAID = 'partially_paid'
	PENDING = 'pending'
	SCHEDULED = 'scheduled'
	CLOSED = 'closed'

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
	ProductType.INVOICE_FINANCING: LoanTypeEnum.INVOICE
}

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
	ADVANCE = 'advance'
	REPAYMENT = 'repayment' # Repayment of loan
	REPAYMENT_OF_ACCOUNT_FEE = 'repayment_account_fee' # Repayment of account fee
	CREDIT_TO_USER = 'credit_to_user' # Bespoke giving $ credit to a user
	FEE = 'fee' # Bespoke charging the user a fee
	ADJUSTMENT = 'adjustment' # A manual adjustment to balance the books, or correct for rounding issues
	USER_CREDIT_TO_ACCOUNT_FEE = 'user_credit_towards_account_fee' # User credit is applied to an account-level fee
	PAYOUT_USER_CREDIT_TO_CUSTOMER = 'payout_user_credit_to_customer'

class TransactionSubType(object):
	WIRE_FEE = 'wire_fee'
	MINIMUM_INTEREST_FEE = 'minimum_interest_fee'

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

