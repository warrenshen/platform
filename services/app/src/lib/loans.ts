import {
  LoanArtifactLimitedFragment,
  LoanLimitedFragment,
} from "generated/graphql";

export function createLoanCustomerIdentifier(loan: LoanLimitedFragment) {
  return `${loan.company.identifier}/${loan.identifier}`;
}

export function createLoanDisbursementIdentifier(loan: LoanLimitedFragment) {
  return loan.disbursement_identifier
    ? `${loan.company.identifier}-${loan.disbursement_identifier}`
    : "-";
}

export function getLoanArtifactName(loan: LoanArtifactLimitedFragment) {
  return loan.purchase_order
    ? loan.purchase_order.order_number
    : loan.invoice
    ? loan.invoice.invoice_number
    : !!loan.line_of_credit?.is_credit_for_vendor
    ? loan.line_of_credit.recipient_vendor?.name
    : "N/A";
}

export function getLoanVendorName(loan: LoanArtifactLimitedFragment) {
  return loan.purchase_order
    ? loan.purchase_order.vendor?.name
    : loan.line_of_credit
    ? loan.line_of_credit.recipient_vendor?.name
    : "N/A";
}
