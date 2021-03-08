import math
from typing import Any


def to_dollar_format(amount: float) -> str:
	return '${:,.2f}'.format(amount)

def float_eq(a: float, b: float) -> bool:
	if b == 0:
		# If comparison against 0, use absolute tolerance (vs relative tolerance).
		return math.isclose(a, b, abs_tol=0.0001)
	else:
		return math.isclose(a, b, rel_tol=0.00001)

def float_lt(a: float, b: float) -> bool:
	return False if float_eq(a, b) else a < b

def float_gt(a: float, b: float) -> bool:
	return False if float_eq(a, b) else a > b

def is_number(val: Any) -> bool:
	if val is None:
		return False

	val_type = type(val)
	return val_type == float or val_type == int
