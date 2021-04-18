import decimal
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.db_constants import (ALL_LOAN_TYPES, LoanStatusEnum,
                                     LoanTypeEnum, RequestStatusEnum)
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import financial_summary_util
from bespoke.finance.loans import sibling_util
from mypy_extensions import TypedDict
from sqlalchemy.orm import Session

ApproveLoansReqDict = TypedDict('ApproveLoansReqDict', {
	'loan_ids': List[str],
})

ApproveLoansRespDict = TypedDict('ApproveLoansRespDict', {
	'status': str
})

SubmitForApprovalRespDict = TypedDict('SubmitForApprovalRespDict', {
	'customer_name': str,
	'loan_html': str,
	'triggered_by_autofinancing': bool,
	'loan_id': str
})

@errors.return_error_tuple
def send_loan_approval_requested_email(
	sendgrid_client: sendgrid_util.Client,
	submit_resp: SubmitForApprovalRespDict,
) -> Tuple[bool, errors.Error]:
	template_name = sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_LOAN
	template_data = {
		'customer_name': submit_resp['customer_name'],
		'loan_html': submit_resp['loan_html'],
		'triggered_by_autofinancing': submit_resp['triggered_by_autofinancing'],
	}
	recipients = sendgrid_client.get_bank_notify_email_addresses()
	_, err = sendgrid_client.send(
		template_name, template_data, recipients)
	if err:
		return None, err

	return True, None

@errors.return_error_tuple
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

	# TODO(dlluncor): Check that this loan doesnt exceed the limit associated with
	# the artifact.

	with session_scope(session_maker) as session:
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.id.in_(loan_ids)
			).all())

		if not loans:
			raise errors.Error('No loans found', details=err_details)

		if len(loans) != len(loan_ids):
			raise errors.Error('Not all loans were found', details=err_details)

		approved_at = date_util.now()

		# TODO(dlluncor): When approving loans, also check whether a customer has
		# gone over their allotted amount of principal.

		for loan in loans:
			loan.status = db_constants.LoanStatusEnum.APPROVED
			loan.approved_at = approved_at
			loan.approved_by_user_id = bank_admin_user_id
			# When a loan gets approved, we clear out the rejected at status.
			loan.rejected_at = None
			loan.rejected_by_user_id = None

	return ApproveLoansRespDict(status='OK'), None

@errors.return_error_tuple
def submit_for_approval(
	loan_id: str,
	session: Session,
	triggered_by_autofinancing: bool,
) -> Tuple[SubmitForApprovalRespDict, errors.Error]:

	err_details = {
		'loan_id': loan_id,
		'method': 'submit_for_approval'
	}

	loan = cast(
		models.Loan,
		session.query(models.Loan).filter_by(
			id=loan_id
		).first()
	)

	if not loan:
		raise errors.Error('Could not find loan for given Loan ID', details=err_details)

	if loan.loan_type not in ALL_LOAN_TYPES:
		raise errors.Error('Loan type is not valid', details=err_details)

	if not loan.artifact_id:
		raise errors.Error('Artifact is required', details=err_details)

	if not loan.requested_payment_date:
		raise errors.Error('Invalid requested payment date', details=err_details)

	if loan.amount is None or loan.amount <= 0:
		raise errors.Error('Invalid amount', details=err_details)

	financial_summary = financial_summary_util.get_latest_financial_summary(loan.company_id, session)
	if not financial_summary:
		raise errors.Error('No financial summary associated with this customer, so we could not determine the max limit allowed', details=err_details)

	if loan.amount > financial_summary.available_limit:
		raise errors.Error('Loan amount requested exceeds the maximum limit for this account', details=err_details)

	customer_name = None
	loan_html = None

	if loan.loan_type == LoanTypeEnum.INVENTORY:
		purchase_order = cast(
			models.PurchaseOrder,
			session.query(models.PurchaseOrder).filter_by(
				id=loan.artifact_id
			).first()
		)
		if not purchase_order:
			raise errors.Error('No purchase order associated with this loan', details=err_details)

		customer_name = purchase_order.company.name

		artifact_id = str(loan.artifact_id)

		proposed_loans_total_amount = sibling_util.get_loan_sum_per_artifact(
			session,
			artifact_ids=[artifact_id],
			excluding_loan_id=None,
		)[artifact_id]

		if proposed_loans_total_amount > float(purchase_order.amount):
			raise errors.Error('Requesting this loan puts you over the amount granted for this same Purchase Order', details=err_details)

		loan_html = f"""<ul>
<li>Loan type: Inventory Financing</li>
<li>Company: {customer_name}</li>
<li>Purchase order: {purchase_order.order_number}</li>
<li>Requested payment date: {loan.requested_payment_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
		"""

	elif loan.loan_type == LoanTypeEnum.LINE_OF_CREDIT:
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
<li>Requested payment date: {loan.requested_payment_date}</li>
<li>Amount: {loan.amount}</li>
</ul>
		"""

	elif loan.loan_type == LoanTypeEnum.INVOICE:
		invoice = session.query(models.Invoice).get(loan.artifact_id)
		customer_name = invoice.company.name
		payor_name = invoice.payor.name

		loan_html = f"""<ul>
<li>Loan type: Invoice</li>
<li>Company: {customer_name}</li>
<li>Invoice: {invoice.invoice_number}</li>
<li>Requested payment date: {loan.requested_payment_date}</li>
<li>Amount: {loan.amount}</li>
</ul>"""

	if not customer_name or not loan_html:
		raise errors.Error("Failed to generated HTML for loan")

	loan.status = RequestStatusEnum.APPROVAL_REQUESTED
	loan.requested_at = date_util.now()

	return SubmitForApprovalRespDict(
		triggered_by_autofinancing=triggered_by_autofinancing,
		customer_name=customer_name,
		loan_html=loan_html,
		loan_id=str(loan.id)
	), None


# NOTE: Keep in sync with addLoan in CreateUpdateArtifactLoanModal. Relevant
# code is:
"""
    company_id: isBankUser ? companyId : undefined,
    identifier: nextLoanIdentifier.toString(),
    loan_type: loanType,
    artifact_id: loan.artifact_id,
    requested_payment_date: loan.requested_payment_date || null,
    amount: loan.amount || null,
"""
@errors.return_error_tuple
def submit_for_approval_if_has_autofinancing(
	company_id: str, amount: float, artifact_id: str, session: Session) -> Tuple[SubmitForApprovalRespDict, errors.Error]:

	company = cast(
		models.Company,
		session.query(models.Company).filter(
			models.Company.id == company_id
		).first())
	if not company:
		raise errors.Error('No company found to submit autofinancing for')

	company_settings = cast(
		models.CompanySettings,
		session.query(models.CompanySettings).filter(
			models.CompanySettings.id == company.company_settings_id
		).first())

	if not company_settings:
		raise errors.Error('No company settings found, so we could not determine if autofinancing is an option')

	if not company_settings.has_autofinancing:
		# No need to request a loan if autofinancing is not enabled
		return None, None

	contract = cast(
		models.Contract,
		session.query(models.Contract).filter(
			models.Contract.id == company.contract_id
		).first())
	if not contract:
		raise errors.Error('No contract found for customer, therefore, cannot perform autofinancing')

	company.latest_loan_identifier += 1

	loan_type = db_constants.PRODUCT_TYPE_TO_LOAN_TYPE.get(contract.product_type)
	if not loan_type:
		raise errors.Error('No loan type associated with product type {}'.format(loan_type))

	loan = models.Loan()
	loan.company_id = company_id
	loan.identifier = '{}'.format(company.latest_loan_identifier)
	loan.loan_type = loan_type
	loan.artifact_id = artifact_id
	loan.requested_payment_date = date_util.now() # TODO(dlluncor): use customer timezone today
	loan.amount = decimal.Decimal(amount)
	loan.status = LoanStatusEnum.DRAFTED

	session.add(loan)
	session.flush()
	loan_id = str(loan.id)

	resp, err = submit_for_approval(loan_id, session, triggered_by_autofinancing=True)
	if err:
		raise err

	return resp, None
