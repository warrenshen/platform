
from mypy_extensions import TypedDict
from typing import Tuple, Callable

from bespoke import errors

UndoRepaymentReqDict = TypedDict('UndoRepaymentReqDict', {
	'payment_id': str,
	'is_line_of_credit': bool
})

def undo_repayment(
	req: UndoRepaymentReqDict,
	user_id: str,
	session_maker: Callable
) -> Tuple[bool, errors.Error]:
	# Mark payment as not settled

	# Find any additional payments created from it, and mark them as is_deleted

	# Mark transactions as is_deleted
	return None, errors.Error('Not implemented')