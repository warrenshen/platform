"""
	A file for handling relationships between loans when calculating limits.
"""
from mypy_extensions import TypedDict
from sqlalchemy.orm.session import Session
from sqlalchemy import func
from typing import Callable, Dict, List, Tuple, Optional, cast

from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.db.db_constants import LoanStatusEnum

def _sum_contributing_loans(loans: List[models.Loan]) -> float:
	proposed_loans_total_amount = 0.0
	for loan in loans:
		if loan.status not in [LoanStatusEnum.DRAFTED, LoanStatusEnum.REJECTED]:
			proposed_loans_total_amount += float(
				loan.amount) if loan.amount else 0
	return proposed_loans_total_amount

def get_loan_sum_on_artifact(
	session: Session, artifact_id: str, excluding_loan_id: Optional[str]) -> float:

	# List of other Purchase Order Loans related to same Purchase Order.

	q = session.query(models.Loan).filter_by(artifact_id=artifact_id)
	if excluding_loan_id:
		q = q.filter(models.Loan.id != excluding_loan_id)

	sibling_loans = cast(List[models.Loan], q.all())
	return _sum_contributing_loans(sibling_loans)

# Using a SQL aggregation rathen than adding up floats in python gives a more
# accurate sum here.
def get_funded_loan_sum_on_artifact(session: Session, artifact_id: str) -> float:
	return session.query(func.sum(models.Loan.amount)) \
		.filter(models.Loan.artifact_id == artifact_id) \
		.filter(models.Loan.funded_at != None) \
		.first()[0]

def get_loan_sum_per_artifact(
	session: Session, artifact_ids: List[str], excluding_loan_id: Optional[str]) -> Dict[str, float]:
	"""
	  E.g., list of other Purchase Order Loans related to same Purchase Order.
	  More generally, a Purchase Order is an "artifact" in this system.
	"""
	q = session.query(models.Loan).filter(
		models.Loan.artifact_id.in_(artifact_ids))

	if excluding_loan_id:
		q = q.filter(models.Loan.id != excluding_loan_id)

	all_related_loans = cast(List[models.Loan], q.all())

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
