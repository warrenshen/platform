"""
	A file for handling relationships between loans when calculating limits.
"""
from typing import Callable, Dict, List, Optional, Tuple, cast

from bespoke.db import db_constants, models
from bespoke.db.db_constants import LoanStatusEnum
from bespoke.db.models import session_scope
from mypy_extensions import TypedDict
from sqlalchemy import func
from sqlalchemy.orm.session import Session


def _sum_contributing_loans(loans: List[models.Loan]) -> float:
	proposed_loans_total_amount = 0.0
	for loan in loans:
		if loan.status not in [LoanStatusEnum.DRAFTED, LoanStatusEnum.REJECTED]:
			proposed_loans_total_amount += float(
				loan.amount) if loan.amount else 0
	return proposed_loans_total_amount

# Using a SQL aggregation rathen than adding up floats in python gives a more
# accurate sum here.
def get_funded_loan_sum_on_artifact(session: Session, artifact_id: str) -> float:
	result = session.query(func.sum(models.Loan.amount)).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Loan.artifact_id == artifact_id
		).filter(
			models.Loan.funded_at != None
		).first()[0]
	return result or 0.0

def get_loan_sum_per_artifact(
	session: Session,
	artifact_ids: List[str],
	excluding_loan_id: Optional[str],
) -> Dict[str, float]:
	"""
	E.g., list of other Purchase Order Loans related to same Purchase Order.
	More generally, a Purchase Order is an "artifact" in this system.
	"""
	all_related_loans = cast(
		List[models.Loan],
		session.query(models.Loan).filter(
			cast(Callable, models.Loan.is_deleted.isnot)(True)
		).filter(
			models.Loan.artifact_id.in_(artifact_ids)
		).filter(
			models.Loan.id != (excluding_loan_id or None)
		).all())

	sibling_loans_per_artifact: Dict[str, List[models.Loan]] = {}
	for artifact_id in artifact_ids:
		sibling_loans_per_artifact[artifact_id] = []

	for loan in all_related_loans:
		if not loan.artifact_id:
			continue
		key = str(loan.artifact_id)
		sibling_loans_per_artifact[key].append(loan)

	loan_sum_per_artifact = {}
	for artifact_id, loans in sibling_loans_per_artifact.items():
		loan_sum_per_artifact[artifact_id] = _sum_contributing_loans(loans)

	return loan_sum_per_artifact
