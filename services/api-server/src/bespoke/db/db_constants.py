"""
  Constants for things that can get stored in the DB
"""

class UserRoles(object):
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'

class TwoFactorLinkType(object):
	CONFIRM_PURCHASE_ORDER = 'confirm_purchase_order'

class TransactionType(object):
	REPAYMENT = 'repayment' 
	ADVANCE = 'advance'