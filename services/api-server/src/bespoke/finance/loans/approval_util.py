import datetime
import decimal
from typing import Callable, Dict, List, Tuple, cast

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models, models_util
from bespoke.db.db_constants import (ALL_LOAN_TYPES, LoanTypeEnum)
from bespoke.db.models import session_scope
from bespoke.email import sendgrid_util
from bespoke.finance import financial_summary_util
from bespoke.finance import contract_util
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
	template_data = {
		'customer_name': submit_resp['customer_name'],
		'loan_html': submit_resp['loan_html'],
		'triggered_by_autofinancing': submit_resp['triggered_by_autofinancing'],
	}

	_, err = sendgrid_client.send(
		template_name=sendgrid_util.TemplateNames.CUSTOMER_REQUESTED_LOAN,
		template_data=template_data,
		recipients=sendgrid_client.get_bank_notify_email_addresses(),
	)
	if err:
		return None, err

	return True, None

def _check_artifact_limit(artifact_id: str, artifact_amount: float, artifact_display_name: str, session: Session, err_details: Dict) -> Tuple[bool, errors.Error]:
	proposed_loans_total_amount = sibling_util.get_loan_sum_per_artifact(
		session,
		artifact_ids=[artifact_id],
		excluding_loan_id=None,
	)[artifact_id]

	if proposed_loans_total_amount > float(artifact_amount):
		return None, errors.Error('Requesting this loan puts you over the amount granted for this same {}'.format(artifact_display_name), details=err_details)

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

		company_ids = set([])
		for loan in loans:
			company_ids.add(loan.company_id)

		company_id_to_available_limit = {}

		for company_id in company_ids:
			fin_summary = financial_summary_util.get_latest_financial_summary(company_id, session)
			if not fin_summary:
				raise errors.Error('Financial summary missing for company {}. Cannot approve loan'.format(company_id))
			company_id_to_available_limit[company_id] = fin_summary.available_limit

		approved_at = date_util.now()

		for loan in loans:
			# Check whether a customer has gone over their allotted amount of principal.
			available_limit = company_id_to_available_limit[loan.company_id]

			if loan.amount > available_limit:
				raise errors.Error('Loan amount requested exceeds the maximum limit for company {}. Loan amount: {}. Remaining limit: {}'.format(
					loan.company_id, loan.amount, available_limit))

			# Check that this loan doesnt exceed the limit associated with the artifact.

			if loan.loan_type == LoanTypeEnum.INVENTORY:

				purchase_order = cast(
					models.PurchaseOrder,
					session.query(models.PurchaseOrder).filter_by(
						id=loan.artifact_id
					).first())

				success, err = _check_artifact_limit(
					artifact_id=str(loan.artifact_id),
					artifact_amount=float(purchase_order.amount),
					artifact_display_name='Purchase Order',
					session=session,
					err_details={}
				)
				if err:
					raise err

			loan.approved_at = approved_at
			loan.approved_by_user_id = bank_admin_user_id
			# When a loan gets approved, we clear out the rejected at status.
			loan.rejected_at = None
			loan.rejected_by_user_id = None
			# Reset loan approval status.
			loan.status = models_util.compute_loan_approval_status(loan)

			# Draw down the limit for calculation purposes
			company_id_to_available_limit[loan.company_id] -= loan.amount

	return ApproveLoansRespDict(status='OK'), None

@errors.return_error_tuple
def submit_for_approval(
	loan_id: str,
	session: Session,
	triggered_by_autofinancing: bool,
	now_for_test: datetime.datetime = None,
	preloaded_financial_summary: models.FinancialSummary = None
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

	financial_summary = financial_summary_util.get_latest_financial_summary(
		loan.company_id, session, now_for_test=now_for_test) if preloaded_financial_summary is None else \
		preloaded_financial_summary
	if not financial_summary:
		raise errors.Error('No financial summary associated with this customer, so we could not determine the max limit allowed', details=err_details)

	if loan.amount > financial_summary.available_limit:
		raise errors.Error('Loan amount requested exceeds the maximum limit for this account', details=err_details)

	company_id = str(loan.company_id)
	company_id_to_obj, err = contract_util.get_active_contracts_by_company_ids([company_id], session, err_details={'method': 'request loan for approval'})
	if err:
		raise err

	contract_obj = company_id_to_obj[company_id]
	timezone, err = contract_obj.get_timezone_str()
	if err:
		raise err

	meets_noon_cutoff, meets_noon_cutoff_err = date_util.meets_noon_cutoff(loan.requested_payment_date, timezone, now=now_for_test)

	if meets_noon_cutoff_err:
		raise errors.Error('Cannot set the requested payment date to {} because {}'.format(loan.requested_payment_date, meets_noon_cutoff_err))

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

		success, err = _check_artifact_limit(
			artifact_id=artifact_id,
			artifact_amount=float(purchase_order.amount),
			artifact_display_name='Purchase Order',
			session=session,
			err_details=err_details
		)
		if err:
			raise err

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

	loan.requested_at = date_util.now()
	# Reset loan approval status.
	loan.status = models_util.compute_loan_approval_status(loan)

	return SubmitForApprovalRespDict(
		triggered_by_autofinancing=triggered_by_autofinancing,
		customer_name=customer_name,
		loan_html=loan_html,
		loan_id=str(loan.id)
	), None


# NOTE: Keep in sync with addLoan in CreateUpdateArtifactLoanModal.
# Relevant code is:
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
	company_id: str, amount: float, artifact_id: str, session: Session,
	now_for_test: datetime.datetime = None) -> Tuple[SubmitForApprovalRespDict, errors.Error]:

	err_details = {
		'company_id': company_id,
		'method': 'submit_for_approval_if_has_autofinancing'
	}

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

	financial_summary = financial_summary_util.get_latest_financial_summary(
		company.id, session, now_for_test=now_for_test)
	if not financial_summary:
		raise errors.Error('No financial summary associated with this customer, so we could not determine the max limit allowed', details=err_details)

	if amount > financial_summary.available_limit:
		# If the loan would put an client with autofinancing over their limit
		# we capture the vendor approval, but do not submit a loan at this time
		return None, None

	contract = cast(
		models.Contract,
		contract_util.get_active_contracts_base_query(session).filter(
			models.Contract.id == company.contract_id
		).first())
	if not contract:
		raise errors.Error('No contract found for customer, therefore, cannot perform autofinancing')

	company.latest_loan_identifier += 1

	loan_type = db_constants.PRODUCT_TYPE_TO_LOAN_TYPE.get(contract.product_type)
	if not loan_type:
		raise errors.Error(f'No loan type associated with product type {loan_type}')

	contract_obj, err = contract_util.Contract.build(contract.as_dict(), validate=False)
	if err:
		raise err

	timezone, err = contract_obj.get_timezone_str()
	if err:
		raise err

	requested_payment_date = date_util.get_earliest_requested_payment_date(timezone)

	loan = models.Loan()
	loan.company_id = company_id
	loan.identifier = '{}'.format(company.latest_loan_identifier)
	loan.loan_type = loan_type
	loan.artifact_id = artifact_id
	loan.requested_payment_date = requested_payment_date
	loan.amount = decimal.Decimal(amount)
	# Set loan approval status.
	loan.status = models_util.compute_loan_approval_status(loan)

	session.add(loan)
	session.flush()
	loan_id = str(loan.id)

	resp, err = submit_for_approval(
		loan_id, 
		session, 
		triggered_by_autofinancing=True, 
		now_for_test=now_for_test,
		preloaded_financial_summary=financial_summary
	)
	if err:
		raise err

	return resp, None
