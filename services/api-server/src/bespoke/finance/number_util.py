import math
from typing import Any

def to_dollar_format(amount: float) -> str:
	return '${:,.2f}'.format(amount)

def float_eq(a: float, b: float) -> bool:
	return math.isclose(a, b, rel_tol=0.001)

def is_number(val: Any) -> bool:
	if val is None:
		return False

	val_type = type(val)
	return val_type == float or val_type == int
