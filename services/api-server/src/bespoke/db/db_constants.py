"""
  Constants for things that can get stored in the DB
"""

# Auth

class UserRoles(object):
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'
	INVOICE_REVIEWER = 'invoice_reviewer'

BANK_ROLES = ['bank_admin'] # Having any of these roles means you are a Bespoke bank user

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

# Payments

class PaymentMethodEnum(object):
	REVERSE_DRAFT_ACH = 'reverse_draft_ach'
	ACH = 'ach'
	WIRE = 'wire'
	CHECK = 'check'
	CASH = 'cash'

ALL_PAYMENT_METHODS = (
	PaymentMethodEnum.REVERSE_DRAFT_ACH,
	PaymentMethodEnum.ACH,
	PaymentMethodEnum.WIRE,
	PaymentMethodEnum.CHECK,
	PaymentMethodEnum.CASH
)

class PaymentType(object):
	REPAYMENT = 'repayment'
	ADVANCE = 'advance'

class TransactionType(object):
	CREDIT_TO_USER = 'credit_to_user'
	FEE = 'fee'

class TransactionSubType(object):
	WIRE_FEE = 'wire_fee'

# There might be many payment types that represent an advance
ADVANCE_TYPES = set([PaymentType.ADVANCE])

REPAYMENT_TYPES = set([PaymentType.REPAYMENT])

class InvoiceFileTypeEnum(object):
	Invoice = 'invoice'
	Cannabis = 'cannabis'

