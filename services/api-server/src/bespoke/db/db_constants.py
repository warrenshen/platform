"""
  Constants for things that can get stored in the DB
"""

class ProductType(object):
	INVENTORY_FINANCING = 'inventory_financing'

class UserRoles(object):
	PURCHASE_ORDER_REVIEWER = 'purchase_order_reviewer'


class TwoFactorLinkType(object):
	CONFIRM_PURCHASE_ORDER = 'confirm_purchase_order'


class PaymentType(object):
	REPAYMENT = 'repayment'
	ADVANCE = 'advance'


# Having any of these roles means you are a Bespoke bank user
BANK_ROLES = ['bank_admin']
