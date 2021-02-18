from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict

ApproveLoansReqDict = TypedDict('ApproveLoansReqDict', {
	'loan_ids': List[str],
})

ApproveLoansRespDict = TypedDict('ApproveLoansRespDict', {
	'status': str
})

def approve_loans(
	req: ApproveLoansReqDict,
	bank_admin_user_id: str,
	session_maker: Callable
) -> Tuple[ApproveLoansRespDict, errors.Error]:
	loan_ids = req['loan_ids']

	err_details = {
		'loan_ids': loan_ids,
		'method': 'approve_loans'
	}

	with session_scope(session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			return None, errors.Error('Could not find loan for given Loan ID', details=err_details)

		if not loans:
			return None, errors.Error('No loans found', details=err_details)

		if len(loans) != len(loan_ids):
			return None, errors.Error('Not all loans were found to fund in database', details=err_details)

		approved_at = date_util.now()

		for loan in loans:
			loan.status = db_constants.LoanStatusEnum.APPROVED
			loan.approved_at = approved_at
			loan.approved_by_user_id = bank_admin_user_id
			# When a loan gets approved, we clear out the rejected at status.
			loan.rejected_at = None
			loan.rejected_by_user_id = None

		session.flush()

	return ApproveLoansRespDict(status='OK'), None
