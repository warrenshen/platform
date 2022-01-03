import decimal
import math
from typing import Any, Union


def to_dollar_format(amount: float) -> str:
	return '${:,.2f}'.format(amount)

def float_eq(a: float, b: float) -> bool:
	return math.isclose(a, b, abs_tol=0.0001)

def float_lt(a: float, b: float) -> bool:
	return False if float_eq(a, b) else a < b

def float_lte(a: float, b: float) -> bool:
	return True if float_eq(a, b) else a <= b

def float_gt(a: float, b: float) -> bool:
	return False if float_eq(a, b) else a > b

"""
Two levels of precision for rounding:
1. Cents: 2 digits of precision for final currency values shown to humans.
2. 5 digits: 5 digits of precision for intermediate currency values to be summed together.
"""

# An alternative name: is_currency_rounded_to_cents
def is_currency_rounded(num: Union[float, decimal.Decimal]) -> bool:
	return round(num, 2) == num

# Round a number to 5 digits of precision.
# round(num, 5) + 0.0001 is done so
# 754.1249999999994 is rounded up to 754.13.
def round_currency_to_five_digits(num: float) -> float:
	return round(round(num, 5) + 0.0001, 5)

# An alternative name for this method is: round_curreny_to_cents.
# round(round(num, 5) + 0.0001, 2) is done so
# 754.1249999999994 is rounded up to 754.13.
def round_currency(num: float) -> float:
	return round(round(num, 5) + 0.0001, 2)

def round_currency_decimal(num: decimal.Decimal) -> decimal.Decimal:
	return round(round(num, 5) + decimal.Decimal(0.0001), 2)

def is_number(val: Any) -> bool:
	if val is None:
		return False

	val_type = type(val)
	return val_type == float or val_type == int

# Returns whether the currency equivalent of given decimal is equal to zero.
# Note: a currency value is a decimal rounded to two decimal places.
def is_currency_zero(num: float) -> bool:
	return float_eq(round_currency(num), 0.0)
