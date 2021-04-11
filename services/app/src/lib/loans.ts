import { LoanLimitedFragment } from "generated/graphql";

export function createLoanIdentifier(loan: LoanLimitedFragment) {
  return `${loan.company.identifier}-${loan.identifier}`;
}

export function createLoanDisbursementIdentifier(loan: LoanLimitedFragment) {
  return loan.disbursement_identifier
    ? `${loan.company.identifier}-${loan.disbursement_identifier}`
    : "-";
}
