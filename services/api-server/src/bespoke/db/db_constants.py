"""
  Constants for things that can get stored in the DB
"""

# Auth

class UserRoles(object):
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'

BANK_ROLES = ['bank_admin'] # Having any of these roles means you are a Bespoke bank user

class TwoFactorLinkType(object):
	CONFIRM_PURCHASE_ORDER = 'confirm_purchase_order'
	FORGOT_PASSWORD = 'forgot_password'

# Contracts

class ProductType(object):
	INVENTORY_FINANCING = 'inventory_financing'
	LINE_OF_CREDIT = 'line_of_credit'

PRODUCT_TYPES = [
	ProductType.INVENTORY_FINANCING,
	ProductType.LINE_OF_CREDIT
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

ALL_LOAN_TYPES = [
	LoanTypeEnum.LINE_OF_CREDIT,
	LoanTypeEnum.INVENTORY,
]

# Payments

class PaymentMethod(object):
	REVERSE_DRAFT_ACH = 'reverse_draft_ach'

class PaymentType(object):
	REPAYMENT = 'repayment'
	ADVANCE = 'advance'

# There might be many payment types that represent an advance
ADVANCE_TYPES = set([PaymentType.ADVANCE])

REPAYMENT_TYPES = set([PaymentType.REPAYMENT])

