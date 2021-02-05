// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";

export type MakePaymentResp = {
  status: string;
  msg: string;
};

export type CalculateEffectOfPaymentResp = {
  status: string;
  msg?: string;
  loans_afterwards?: LoanFragment[];
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

export async function makePayment(req: {
  payment: PaymentsInsertInput;
  company_id: string;
}): Promise<MakePaymentResp> {
  return authenticatedApi
    .post(loansRoutes.makePayment, req)
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
