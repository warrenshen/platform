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

PRODUCT_TYPES = [ProductType.INVENTORY_FINANCING]

# Artifacts

class RequestStatusEnum():
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	DRAFTED = 'drafted'
	REJECTED = 'rejected'

# Loans

class LoanStatusEnum(object):
	APPROVAL_REQUESTED = 'approval_requested'
	APPROVED = 'approved'
	CLOSED = 'closed'
	DRAFTED = 'drafted'
	FUNDED = 'funded'
	PAST_DUE = 'past_due'
	REJECTED = 'rejected'

class LoanTypeEnum():
	LineOfCredit = 'line_of_credit'
	PurchaseOrder = 'purchase_order'

AllLoanTypes = [
	LoanTypeEnum.LineOfCredit,
	LoanTypeEnum.PurchaseOrder,
]

# Payments

class PaymentType(object):
	REPAYMENT = 'repayment'
	ADVANCE = 'advance'

# There might be many payment types that represent an advance
ADVANCE_TYPES = set([PaymentType.ADVANCE])

