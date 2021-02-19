import { LoanLimitedFragment } from "generated/graphql";

export function createLoanPublicIdentifier(loan: LoanLimitedFragment) {
  return `${loan.company.identifier}-${loan.identifier}`;
}
