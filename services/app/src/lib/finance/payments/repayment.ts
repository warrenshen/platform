// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Loans, PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";

export type CreatePaymentResp = {
  status: string;
  msg: string;
};

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

export type SettlePaymentResp = {
  status: string;
  msg?: string;
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
}): Promise<CreatePaymentResp> {
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

export async function settlePayment(req: {
  company_id: string;
  payment_id: string;
  amount: number;
  payment_date: string;
  settlement_date: string;
  loan_ids: string[];
  transaction_inputs: LoanTransaction[];
}): Promise<SettlePaymentResp> {
  return authenticatedApi
    .post(loansRoutes.settlePayment, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not settle payment for the loan(s)",
        };
      }
    );
}

export async function settlePaymentLineOfCredit(req: {
  company_id: string;
  payment_id: string;
  amount: number;
  payment_date: string;
  settlement_date: string;
  items_covered: any;
}): Promise<SettlePaymentResp> {
  return authenticatedApi
    .post(loansRoutes.settlePaymentLineOfCredit, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not settle payment for line of credit",
        };
      }
    );
}
