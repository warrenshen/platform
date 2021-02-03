// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, purchaseOrderLoansRoutes } from "lib/api";

export type MakePaymentResp = {
  status: string;
  msg: string;
};

export type CalculateEffectOfPaymentResp = {
  status: string;
  msg: string;
};

export async function calculateEffectOfPayment(req: {
  payment: PaymentsInsertInput;
  company_id: string;
}): Promise<CalculateEffectOfPaymentResp> {
  return authenticatedApi
    .post(purchaseOrderLoansRoutes.calculateEffectOfPayment, req)
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
          msg:
            "Could not calculate effect of payment for a purchase order loan",
        };
      }
    );
}

export async function makePayment(req: {
  payment: PaymentsInsertInput;
  company_id: string;
}): Promise<MakePaymentResp> {
  return authenticatedApi
    .post(purchaseOrderLoansRoutes.makePayment, req)
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
          msg: "Could not make a payment for a purchase order loan",
        };
      }
    );
}
