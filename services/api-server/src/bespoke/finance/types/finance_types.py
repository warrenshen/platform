"""
	Generic file for finance related types
"""
from typing import NamedTuple
from mypy_extensions import TypedDict

Month = NamedTuple('Month', [('month', int),
                             ('year', int)])
Quarter = NamedTuple('Quarter', [('quarter', int), ('year', int)])
Year = NamedTuple('Year', [('year', int)])

AccountBalanceDict = TypedDict('AccountBalanceDict', {
	'fees_total': float,
	'credits_total': float
})