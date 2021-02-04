import math

def to_dollar_format(amount: float) -> str:
	return '${:,.2f}'.format(amount)

def float_eq(a: float, b: float) -> bool:
	return math.isclose(a, b, rel_tol=0.001)
