// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import {
  Loans,
  PaymentLimitedFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";
import { PaymentStatusEnum } from "lib/enum";

export type LoanBalance = {
  loan_id?: Loans["id"];
  outstanding_principal_balance: number;
  outstanding_interest: number;
  outstanding_fees: number;
};

export type LoanTransaction = {
  amount: number;
  to_fees: number | null;
  to_interest: number | null;
  to_principal: number | null;
};

export type LoanToShow = {
  loan_id: Loans["id"];
  loan_identifier: Loans["identifier"];
  before_loan_balance: LoanBalance;
  after_loan_balance: LoanBalance;
  transaction: LoanTransaction;
};

export type LoanBeforeAfterPayment = {
  loan_id: Loans["id"];
  loan_identifier: Loans["identifier"];
  loan_balance_before: LoanBalance;
  loan_balance_after: LoanBalance;
  transaction: LoanTransaction;
};

export function getPaymentStatus(payment: PaymentLimitedFragment) {
  if (!!payment.is_deleted) {
    return PaymentStatusEnum.Deleted;
  } else if (!!payment.reversed_at) {
    return PaymentStatusEnum.Reversed;
  } else if (!!payment.settled_at) {
    return PaymentStatusEnum.Settled;
  } else if (!!payment.submitted_at) {
    return PaymentStatusEnum.AwaitingSettlement;
  } else {
    return PaymentStatusEnum.AwaitingSubmit;
  }
}

type CalculateRepaymentEffectRespData = {
  loans_to_show: LoanToShow[];
  amount_to_pay: number;
  payable_amount_principal: number;
  payable_amount_interest: number;
};

export function getLoansBeforeAfterPayment(
  repaymentEffectData: CalculateRepaymentEffectRespData
) {
  return repaymentEffectData.loans_to_show.map((loanToShow: LoanToShow) => {
    const beforeLoan = loanToShow.before_loan_balance;
    const afterLoan = loanToShow.after_loan_balance;
    return {
      loan_id: loanToShow.loan_id,
      loan_identifier: loanToShow.loan_identifier,
      loan_balance_before: {
        outstanding_principal_balance:
          beforeLoan?.outstanding_principal_balance,
        outstanding_interest: beforeLoan?.outstanding_interest,
        outstanding_fees: beforeLoan?.outstanding_fees,
      } as LoanBalance,
      loan_balance_after: {
        outstanding_principal_balance: afterLoan.outstanding_principal_balance,
        outstanding_interest: afterLoan.outstanding_interest,
        outstanding_fees: afterLoan.outstanding_fees,
        transaction: loanToShow.transaction as LoanTransaction,
      } as LoanBalance,
    } as LoanBeforeAfterPayment;
  });
}

export type CalculateRepaymentEffectResp = {
  status: string;
  msg: string;
  data: CalculateRepaymentEffectRespData;
};

export async function calculateRepaymentEffectMutation(req: {
  variables: {
    company_id: string;
    payment_option: string;
    amount: number;
    deposit_date: string;
    settlement_date: string;
    items_covered: any;
    should_pay_principal_first: boolean;
  };
}): Promise<CalculateRepaymentEffectResp> {
  return authenticatedApi
    .post(loansRoutes.calculateRepaymentEffect, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not calculate effect of payment",
        };
      }
    );
}

export async function createRepaymentMutation(req: {
  variables: {
    company_id: string;
    payment: PaymentsInsertInput;
    is_line_of_credit: boolean;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.createRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not make payment for the loan(s)",
        };
      }
    );
}

export type ScheduleRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
    amount: number;
    payment_date: string;
    items_covered: any;
    is_line_of_credit: boolean;
  };
};

export async function scheduleRepaymentMutation(
  req: ScheduleRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.scheduleRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not schedule repayment",
        };
      }
    );
}

export type SettleRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
    amount: number;
    deposit_date: string;
    settlement_date: string;
    items_covered: any;
    transaction_inputs: any;
    is_line_of_credit: boolean;
  };
};

export async function settleRepaymentMutation(
  req: SettleRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.settleRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not settle repayment",
        };
      }
    );
}

export type ReverseRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
  };
};

export async function reverseRepaymentMutation(
  req: ReverseRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.reverseRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not reverse payment",
        };
      }
    );
}

export type UndoRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
  };
};

export async function undoRepaymentMutation(
  req: UndoRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.undoRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not undo payment",
        };
      }
    );
}
