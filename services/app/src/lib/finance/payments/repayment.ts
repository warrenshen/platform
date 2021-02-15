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

type LoanAfterwards = {
  loan_id: Loans["id"];
  loan_balance: LoanBalance;
};

export type CalculateEffectOfPaymentResp = {
  status: string;
  msg?: string;
  loans_afterwards?: LoanAfterwards[];
  amount_to_pay?: number;
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

export async function createPayment(req: {
  payment: PaymentsInsertInput;
  company_id: string;
  loan_ids: string[];
}): Promise<CreatePaymentResp> {
  return authenticatedApi
    .post(loansRoutes.createPayment, req)
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
          msg: "Could not make a payment for the loan(s)",
        };
      }
    );
}
