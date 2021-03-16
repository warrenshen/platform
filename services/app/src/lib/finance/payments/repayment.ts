// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Loans, PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

export type LoanBalance = {
  loan_id?: Loans["id"];
  outstanding_principal_balance: number;
  outstanding_interest: number;
  outstanding_fees: number;
};

export type LoanTransaction = {
  amount: number;
  to_fees: number;
  to_interest: number;
  to_principal: number;
};

type LoanToShow = {
  loan_id: Loans["id"];
  before_loan_balance: LoanBalance;
  after_loan_balance: LoanBalance;
  transaction: LoanTransaction;
};

export type CalculateEffectOfPaymentResp = {
  status: string;
  msg?: string;
  loans_to_show: LoanToShow[];
  amount_to_pay: number;
  payable_amount_principal: number;
  payable_amount_interest: number;
};

export async function calculateEffectOfPayment(req: {
  payment: PaymentsInsertInput;
  company_id: string;
  payment_option: string;
  loan_ids: string[];
}): Promise<CalculateEffectOfPaymentResp> {
  return authenticatedApi
    .post(loansRoutes.calculateEffectOfPayment, req)
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
          msg: "Could not calculate effect of payment for the loan(s)",
        };
      }
    );
}

export async function createRepayment(req: {
  company_id: string;
  payment: PaymentsInsertInput;
  is_line_of_credit: boolean;
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.createRepayment, req)
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
          msg: "Could not settle payment",
        };
      }
    );
}
