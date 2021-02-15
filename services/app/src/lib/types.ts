import { Loans } from "generated/graphql";
import { LoanBalance } from "lib/finance/payments/repayment";

export type BeforeAfterPaymentLoan = {
  loan_id: Loans["id"];
  loan_balance_before: LoanBalance;
  loan_balance_after: LoanBalance;
};
