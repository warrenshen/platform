import { Loans } from "generated/graphql";
import { LoanBalance, LoanTransaction } from "lib/finance/payments/repayment";

export type LoanBeforeAfterPayment = {
  loan_id: Loans["id"];
  loan_identifier: Loans["identifier"];
  loan_balance_before: LoanBalance;
  loan_balance_after: LoanBalance;
  transaction: LoanTransaction;
};
