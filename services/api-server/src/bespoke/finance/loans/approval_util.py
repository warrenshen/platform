from typing import Callable, Dict, List, Tuple, cast
from mypy_extensions import TypedDict

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.db.db_constants import (AllLoanTypes, LoanTypeEnum,
                                     RequestStatusEnum)
ApproveLoansReqDict = TypedDict('ApproveLoansReqDict', {
	'loan_ids': List[str],
})

ApproveLoansRespDict = TypedDict('ApproveLoansRespDict', {
	'status': str
})

SubmitForApprovalRespDict = TypedDict('SubmitForApprovalRespDict', {
	'customer_name': str,
	'loan_html': str
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

def submit_for_approval(loan_id: str, session_maker: Callable) -> Tuple[SubmitForApprovalRespDict, errors.Error]:

	err_details = {
		'loan_id': loan_id,
		'method': 'submit_for_approval'
	}

	with session_scope(session_maker) as session:
		loan = cast(
			models.Loan,
			session.query(models.Loan).filter_by(
				id=loan_id
			).first()
		)

		if not loan:
			return None, errors.Error('Could not find loan for given Loan ID', details=err_details)

		if loan.loan_type not in AllLoanTypes:
			return None, errors.Error('Loan type is not valid', details=err_details)

		if not loan.artifact_id:
			return None, errors.Error('Artifact is required', details=err_details)

		if not loan.requested_payment_date:
			return None, errors.Error('Invalid requested payment date', details=err_details)

		if loan.amount is None or loan.amount <= 0:
			return None, errors.Error('Invalid amount', details=err_details)

		if loan.loan_type == LoanTypeEnum.PurchaseOrder:
			purchase_order = cast(
				models.PurchaseOrder,
				session.query(models.PurchaseOrder).filter_by(
					id=loan.artifact_id
				).first()
			)
			customer_name = purchase_order.company.name

			# List of other Purchase Order Loans related to same Purchase Order.
			sibling_loans = cast(
				List[models.Loan],
				session.query(models.Loan)
				.filter(models.Loan.id != loan.id)
				.filter_by(artifact_id=loan.artifact_id)
			)

			proposed_loans_total_amount = 0.0
			for sibling_loan in sibling_loans:
				if sibling_loan.status in [RequestStatusEnum.APPROVAL_REQUESTED, RequestStatusEnum.APPROVED]:
					proposed_loans_total_amount += float(
						sibling_loan.amount) if sibling_loan.amount else 0

			proposed_loans_total_amount += float(loan.amount)

			if proposed_loans_total_amount > float(purchase_order.amount):
				return None, errors.Error('Too many loans for same Purchase Order', details=err_details)

			loan_html = f"""<ul>
<li>Loan type: Inventory Financing</li>
<li>Company: {customer_name}</li>
<li>Purchase order: {purchase_order.order_number}</li>
<li>Payment date: {loan.origination_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
			"""

		elif loan.loan_type == LoanTypeEnum.LineOfCredit:
			line_of_credit = cast(
				models.LineOfCredit,
				session.query(models.LineOfCredit).filter_by(
					id=loan.artifact_id
				).first()
			)
			customer_name = line_of_credit.company.name
			receipient_vendor_name = line_of_credit.recipient_vendor.name if line_of_credit.is_credit_for_vendor else "N/A"

			loan_html = f"""<ul>
<li>Loan type: Line of Credit</li>
<li>Company: {customer_name}</li>
<li>Is credit for vendor?: {"Yes" if line_of_credit.is_credit_for_vendor else "No"} </li>
<li>Vendor (if appropriate): {receipient_vendor_name}</li>
<li>Payment date: {loan.origination_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
			"""

		loan.status = RequestStatusEnum.APPROVAL_REQUESTED
		loan.requested_at = date_util.now()

		session.commit()

	return SubmitForApprovalRespDict(
		customer_name=customer_name,
		loan_html=loan_html
	), None
