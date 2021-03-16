"""
	Generic file for finance related types
"""
from typing import NamedTuple

Month = NamedTuple('Month', [('month', int),
                             ('year', int)])
